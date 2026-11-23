<?php

namespace Tests\Feature;

use App\Http\Support\ApiTokenService;
use App\Models\SuratKeluar;
use App\Models\User;
use App\Services\SuratKeluarService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class SuratKeluarDanUserManagementTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;

    private int $unitId;

    private int $categoryId;

    protected function setUp(): void
    {
        parent::setUp();

        Storage::fake('public');

        $this->unitId = DB::table('units')->insertGetId([
            'nama' => 'Bagian Umum',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $this->categoryId = DB::table('categories')->insertGetId([
            'nama' => 'Surat Keluar',
            'kode_klasifikasi' => 'SK',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $this->admin = User::factory()->create([
            'role' => 'super_admin',
            'unit_id' => $this->unitId,
        ]);

        $this->withToken(app(ApiTokenService::class)->issue($this->admin)['token'])
            ->withHeaders(['Accept' => 'application/json']);
    }

    public function test_next_agenda_uses_current_year_and_four_digit_sequence(): void
    {
        $this->getJson('/api/surat-keluar/next-agenda')
            ->assertOk()
            ->assertJsonPath('data.nomor_agenda', 'SK-'.now()->year.'-0001');
    }

    public function test_store_creates_surat_keluar_with_files_and_reply_relation(): void
    {
        $suratMasukId = DB::table('surat_masuks')->insertGetId([
            'user_id' => $this->admin->id,
            'category_id' => $this->categoryId,
            'nomor_surat' => 'SM/001/2026',
            'nomor_agenda' => 'SM-'.now()->year.'-0001',
            'tanggal_surat' => now()->toDateString(),
            'tanggal_diterima' => now()->toDateString(),
            'pengirim' => 'Dinas Contoh',
            'perihal' => 'Undangan rapat',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $response = $this->post('/api/surat-keluar', [
            'nomor_surat' => 'SK/001/2026',
            'tanggal_surat' => now()->toDateString(),
            'tujuan' => 'Dinas Tujuan',
            'perihal' => 'Balasan undangan rapat',
            'ringkasan' => 'Menanggapi undangan.',
            'unit_id' => $this->unitId,
            'category_id' => $this->categoryId,
            'surat_masuk_id' => $suratMasukId,
            'status' => 'terkirim',
            'soft_file' => UploadedFile::fake()->create('surat.pdf', 100, 'application/pdf'),
            'lampirans' => [UploadedFile::fake()->create('lampiran.pdf', 120, 'application/pdf')],
            'lampiran_labels' => ['Lampiran pendukung'],
        ]);

        $response->assertCreated()
            ->assertJsonPath('data.nomor_agenda', 'SK-'.now()->year.'-0001')
            ->assertJsonPath('data.status', 'terkirim')
            ->assertJsonPath('data.surat_masuk_id', $suratMasukId);

        $this->assertDatabaseHas('surat_keluars', [
            'nomor_surat' => 'SK/001/2026',
            'surat_masuk_id' => $suratMasukId,
            'status' => 'terkirim',
        ]);
        $this->assertDatabaseCount('lampirans', 2);
        $this->assertDatabaseHas('lampirans', ['label' => 'Lampiran pendukung', 'is_utama' => 0]);

        $storedPath = DB::table('lampirans')->where('is_utama', 1)->value('path');
        Storage::disk('public')->assertExists($storedPath);
    }

    public function test_index_filters_search_status_unit_and_period(): void
    {
        $this->createSurat([
            'nomor_surat' => 'SK/001',
            'perihal' => 'Undangan rapat',
            'status' => 'draft',
            'tanggal_surat' => now()->toDateString(),
        ]);

        $this->createSurat([
            'nomor_surat' => 'SK/002',
            'perihal' => 'Laporan bulanan',
            'status' => 'terkirim',
            'tanggal_surat' => now()->subMonth()->toDateString(),
        ]);

        $this->getJson('/api/surat-keluar?search=Laporan&status=terkirim&unit_id='.$this->unitId
            .'&bulan='.now()->subMonth()->month.'&tahun='.now()->subMonth()->year)
            ->assertOk()
            ->assertJsonPath('meta.total', 1)
            ->assertJsonPath('data.0.nomor_surat', 'SK/002');
    }

    public function test_update_and_delete_surat_keluar(): void
    {
        $surat = $this->createSurat(['perihal' => 'Perihal awal']);

        $this->putJson('/api/surat-keluar/'.$surat->id, [
            'perihal' => 'Perihal diubah',
            'status' => 'arsip',
        ])
            ->assertOk()
            ->assertJsonPath('data.perihal', 'Perihal diubah')
            ->assertJsonPath('data.status', 'arsip');

        $this->deleteJson('/api/surat-keluar/'.$surat->id)->assertOk();

        $this->assertDatabaseMissing('surat_keluars', ['id' => $surat->id]);
    }

    public function test_admin_can_manage_users_and_cannot_delete_own_account(): void
    {
        $this->postJson('/api/admin/users', [
            'name' => 'Staf Baru',
            'email' => 'staf.baru@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'role' => 'staf',
            'unit_id' => $this->unitId,
            'jabatan' => 'Staf Umum',
        ])
            ->assertCreated()
            ->assertJsonPath('data.jabatan', 'Staf Umum')
            ->assertJsonPath('data.unit.id', $this->unitId);

        $created = User::query()->where('email', 'staf.baru@example.com')->firstOrFail();
        $this->assertTrue(Hash::check('password123', $created->password));

        $this->getJson('/api/admin/users?search=Staf Baru&role=staf&unit_id='.$this->unitId)
            ->assertOk()
            ->assertJsonPath('meta.total', 1)
            ->assertJsonPath('data.0.email', 'staf.baru@example.com');

        $this->deleteJson('/api/admin/users/'.$this->admin->id)->assertStatus(422);
    }

    public function test_staf_cannot_access_user_management(): void
    {
        $staf = User::factory()->create([
            'role' => 'staf',
            'unit_id' => $this->unitId,
        ]);

        $this->withToken(app(ApiTokenService::class)->issue($staf)['token'])
            ->getJson('/api/admin/users')
            ->assertForbidden();
    }

    /**
     * @param  array<string, mixed>  $overrides
     */
    private function createSurat(array $overrides = []): SuratKeluar
    {
        return app(SuratKeluarService::class)->create(array_merge([
            'nomor_surat' => 'SK/DEFAULT',
            'tanggal_surat' => now()->toDateString(),
            'tujuan' => 'Dinas Tujuan',
            'perihal' => 'Perihal surat',
            'unit_id' => $this->unitId,
            'category_id' => $this->categoryId,
            'status' => 'draft',
        ], $overrides), $this->admin);
    }
}
