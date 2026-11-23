<?php

namespace Tests\Feature;

use App\Http\Support\ApiTokenService;
use App\Models\Category;
use App\Models\SuratMasuk;
use App\Models\Unit;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class SuratMasukDisposisiApiTest extends TestCase
{
    use RefreshDatabase;

    private Unit $unit;

    private Category $category;

    private User $admin;

    private User $penerima;

    protected function setUp(): void
    {
        parent::setUp();

        Storage::fake('local');

        $this->unit = Unit::create(['nama' => 'Bagian Umum']);
        $categoryId = DB::table('categories')->insertGetId([
            'nama' => 'Undangan',
            'kode_klasifikasi' => '005 - Undangan',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        $this->category = Category::findOrFail($categoryId);
        $this->admin = User::create([
            'name' => 'Admin Surat',
            'email' => 'admin@e-agenda.test',
            'password' => 'secret',
            'role' => 'admin_surat',
            'unit_id' => $this->unit->id,
        ]);
        $this->penerima = User::create([
            'name' => 'Staf Umum',
            'email' => 'staf@e-agenda.test',
            'password' => 'secret',
            'role' => 'staf',
            'unit_id' => $this->unit->id,
        ]);

        $this->withToken(app(ApiTokenService::class)->issue($this->admin)['token']);
    }

    public function test_index_filter_dan_ringkasan_tab(): void
    {
        $this->buatSurat('SM-'.now()->year.'-0001', 'segera', 'baru', 'Rapat koordinasi');
        $this->buatSurat('SM-'.now()->year.'-0002', 'biasa', 'selesai', 'Surat edaran');

        $this->getJson('/api/surat-masuk?search=rapat&status=baru&urgensi=segera')
            ->assertOk()
            ->assertJsonPath('data.0.perihal', 'Rapat koordinasi')
            ->assertJsonCount(1, 'data');

        $this->getJson('/api/surat-masuk')
            ->assertOk()
            ->assertJsonPath('meta.summary.total', 2)
            ->assertJsonPath('meta.summary.baru', 1)
            ->assertJsonPath('meta.summary.selesai', 1);
    }

    public function test_next_agenda_menghasilkan_format_terbaru(): void
    {
        $this->buatSurat('SM-'.now()->year.'-0007', 'biasa', 'baru', 'Surat pertama');

        $this->getJson('/api/surat-masuk/next-agenda')
            ->assertOk()
            ->assertJsonPath('data.nomor_agenda', 'SM-'.now()->year.'-0008');
    }

    public function test_store_menyimpan_surat_dan_lampiran_utama(): void
    {
        $response = $this->postJson('/api/surat-masuk', [
            'nomor_surat' => '005/001/SETDA/'.now()->year,
            'tanggal_surat' => now()->toDateString(),
            'tanggal_diterima' => now()->toDateString(),
            'pengirim' => 'Pemerintah Kabupaten',
            'perihal' => 'Undangan rapat',
            'ringkasan' => 'Ringkasan surat',
            'urgensi' => 'segera',
            'category_id' => $this->category->id,
            'lampiran' => UploadedFile::fake()->create('undangan.pdf', 100, 'application/pdf'),
        ]);

        $response->assertCreated()->assertJsonPath('data.status', 'baru');

        $this->assertDatabaseHas('surat_masuks', [
            'nomor_agenda' => 'SM-'.now()->year.'-0001',
            'perihal' => 'Undangan rapat',
            'status' => 'baru',
        ]);
        $this->assertDatabaseHas('lampirans', [
            'attachable_type' => SuratMasuk::class,
            'is_utama' => true,
            'label' => 'undangan.pdf',
        ]);
    }

    public function test_disposisi_unit_membuat_notifikasi_dan_status_surat_berubah(): void
    {
        $suratId = $this->buatSurat('SM-'.now()->year.'-0001', 'biasa', 'baru', 'Undangan rapat');

        $response = $this->postJson("/api/surat-masuk/{$suratId}/disposisi", [
            'unit_id' => $this->unit->id,
            'instruksi' => 'tindak_lanjut',
            'catatan' => 'Mohon disiapkan ruang rapat.',
            'prioritas' => 'segera',
            'batas_waktu' => now()->addDay()->toDateTimeString(),
            'kirim_notifikasi' => true,
        ]);

        $response->assertCreated()->assertJsonPath('data.status', 'belum_dibaca');
        $this->assertDatabaseHas('surat_masuks', ['id' => $suratId, 'status' => 'terdisposisi']);
        $this->assertDatabaseHas('notifications', [
            'user_id' => $this->penerima->id,
            'surat_masuk_id' => $suratId,
            'judul' => 'Disposisi baru untuk Anda',
        ]);

        $disposisiId = $response->json('data.id');

        $this->patchJson("/api/disposisi/{$disposisiId}/status", ['status' => 'selesai'])
            ->assertOk()
            ->assertJsonPath('data.status', 'selesai')
            ->assertJsonPath('data.selesai_at', fn ($value) => $value !== null);
    }

    public function test_detail_memuat_relasi_lengkap(): void
    {
        $suratId = $this->buatSurat('SM-'.now()->year.'-0001', 'segera', 'baru', 'Undangan rapat');

        $this->getJson("/api/surat-masuk/{$suratId}")
            ->assertOk()
            ->assertJsonStructure([
                'data' => [
                    'category',
                    'pencatat',
                    'lampirans',
                    'disposisis',
                    'saran_disposisis',
                ],
            ]);
    }

    public function test_update_mengganti_lampiran_dan_destroy_menghapus_surat(): void
    {
        $suratId = $this->buatSurat('SM-'.now()->year.'-0001', 'biasa', 'baru', 'Perihal lama');
        Storage::disk('local')->put('lampiran/surat-masuk/lama.pdf', 'isi lama');
        $lampiranId = DB::table('lampirans')->insertGetId([
            'attachable_type' => SuratMasuk::class,
            'attachable_id' => $suratId,
            'path' => 'lampiran/surat-masuk/lama.pdf',
            'mime_type' => 'application/pdf',
            'label' => 'lama.pdf',
            'is_utama' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $this->put("/api/surat-masuk/{$suratId}", [
            'perihal' => 'Perihal baru',
            'lampiran' => UploadedFile::fake()->create('baru.pdf', 100, 'application/pdf'),
        ])->assertOk()->assertJsonPath('data.perihal', 'Perihal baru');

        $this->assertDatabaseMissing('lampirans', ['id' => $lampiranId]);
        Storage::disk('local')->assertMissing('lampiran/surat-masuk/lama.pdf');

        $this->deleteJson("/api/surat-masuk/{$suratId}")->assertOk();
        $this->assertDatabaseMissing('surat_masuks', ['id' => $suratId]);
    }

    public function test_download_lampiran_mengembalikan_file(): void
    {
        $suratId = $this->buatSurat('SM-'.now()->year.'-0001', 'biasa', 'baru', 'Undangan rapat');
        Storage::disk('local')->put('lampiran/surat-masuk/undangan.pdf', 'isi dokumen');
        $lampiranId = DB::table('lampirans')->insertGetId([
            'attachable_type' => SuratMasuk::class,
            'attachable_id' => $suratId,
            'path' => 'lampiran/surat-masuk/undangan.pdf',
            'mime_type' => 'application/pdf',
            'label' => 'undangan.pdf',
            'is_utama' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $this->get("/api/surat-masuk/{$suratId}/lampiran/{$lampiranId}/download")
            ->assertOk()
            ->assertHeader('Content-Disposition', 'attachment; filename=undangan.pdf');
    }

    private function buatSurat(string $nomorAgenda, string $urgensi, string $status, string $perihal): int
    {
        return (int) DB::table('surat_masuks')->insertGetId([
            'user_id' => $this->admin->id,
            'category_id' => $this->category->id,
            'nomor_surat' => '005/001/SETDA/'.now()->year,
            'nomor_agenda' => $nomorAgenda,
            'tanggal_surat' => now()->toDateString(),
            'tanggal_diterima' => now()->toDateString(),
            'pengirim' => 'Pemerintah Kabupaten',
            'perihal' => $perihal,
            'ringkasan' => 'Ringkasan surat',
            'urgensi' => $urgensi,
            'status' => $status,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }
}
