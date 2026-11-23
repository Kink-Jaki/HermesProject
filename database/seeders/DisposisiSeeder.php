<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DisposisiSeeder extends Seeder
{
    public function run(): void
    {
        $userId = fn (string $email) => DB::table('users')->where('email', $email)->value('id');
        $unitId = fn (string $nama) => DB::table('units')->where('nama', $nama)->value('id');
        $suratMasukId = fn (string $agenda) => DB::table('surat_masuks')->where('nomor_agenda', $agenda)->value('id');

        $disposisis = [
            [
                'surat_masuk_id' => $suratMasukId('SM-2025-0248'),
                'pemberi_user_id' => $userId('pimpinan@instansi.go.id'),
                'penerima_user_id' => $userId('staf.umum@instansi.go.id'),
                'unit_id' => $unitId('Bagian Umum'),
                'instruksi' => 'tindak_lanjut',
                'catatan' => 'Mohon disiapkan agenda dan ruang rapat koordinasi Hari Kemerdekaan.',
                'prioritas' => 'segera',
                'batas_waktu' => '2025-05-21 17:00:00',
                'status' => 'diproses',
                'dibaca_at' => '2025-05-19 09:05:00',
                'selesai_at' => null,
                'created_at' => '2025-05-19 09:00:00',
            ],
            [
                'surat_masuk_id' => $suratMasukId('SM-2025-0248'),
                'pemberi_user_id' => $userId('pimpinan@instansi.go.id'),
                'penerima_user_id' => $userId('staf.keuangan@instansi.go.id'),
                'unit_id' => $unitId('Bagian Keuangan'),
                'instruksi' => 'koordinasikan',
                'catatan' => 'Mohon koordinasikan anggaran konsumsi dan logistik kegiatan.',
                'prioritas' => 'segera',
                'batas_waktu' => '2025-05-20 12:00:00',
                'status' => 'belum_dibaca',
                'dibaca_at' => null,
                'selesai_at' => null,
                'created_at' => '2025-05-19 09:00:00',
            ],
            [
                'surat_masuk_id' => $suratMasukId('SM-2025-0247'),
                'pemberi_user_id' => $userId('pimpinan@instansi.go.id'),
                'penerima_user_id' => $userId('admin.surat@instansi.go.id'),
                'unit_id' => $unitId('Bagian Umum'),
                'instruksi' => 'tindak_lanjut',
                'catatan' => 'Verifikasi dokumen pencairan dan teruskan ke Bagian Keuangan.',
                'prioritas' => 'biasa',
                'batas_waktu' => '2025-05-22 17:00:00',
                'status' => 'selesai',
                'dibaca_at' => '2025-05-19 08:45:00',
                'selesai_at' => '2025-05-19 15:20:00',
                'created_at' => '2025-05-19 08:40:00',
            ],
            [
                'surat_masuk_id' => $suratMasukId('SM-2025-0246'),
                'pemberi_user_id' => $userId('pimpinan@instansi.go.id'),
                'penerima_user_id' => $userId('staf.organisasi@instansi.go.id'),
                'unit_id' => $unitId('Bagian Organisasi'),
                'instruksi' => 'untuk_diketahui',
                'catatan' => 'Pelajari petunjuk teknis dan siapkan rencana implementasi.',
                'prioritas' => 'biasa',
                'batas_waktu' => '2025-05-23 17:00:00',
                'status' => 'selesai',
                'dibaca_at' => '2025-05-16 10:15:00',
                'selesai_at' => '2025-05-19 11:30:00',
                'created_at' => '2025-05-16 10:00:00',
            ],
            [
                'surat_masuk_id' => $suratMasukId('SM-2025-0244'),
                'pemberi_user_id' => $userId('pimpinan@instansi.go.id'),
                'penerima_user_id' => $userId('staf.pemerintahan@instansi.go.id'),
                'unit_id' => $unitId('Bagian Pemerintahan'),
                'instruksi' => 'tindak_lanjut',
                'catatan' => 'Sosialisasikan surat edaran ke seluruh bagian dan laporkan hasilnya.',
                'prioritas' => 'segera',
                'batas_waktu' => '2025-05-20 17:00:00',
                'status' => 'diproses',
                'dibaca_at' => '2025-05-19 10:00:00',
                'selesai_at' => null,
                'created_at' => '2025-05-19 09:55:00',
            ],
            [
                'surat_masuk_id' => $suratMasukId('SM-2025-0243'),
                'pemberi_user_id' => $userId('pimpinan@instansi.go.id'),
                'penerima_user_id' => $userId('staf.keuangan@instansi.go.id'),
                'unit_id' => $unitId('Bagian Keuangan'),
                'instruksi' => 'tindak_lanjut',
                'catatan' => 'Siapkan dokumen pendukung audit keuangan semester I.',
                'prioritas' => 'biasa',
                'batas_waktu' => '2025-05-19 17:00:00',
                'status' => 'selesai',
                'dibaca_at' => '2025-05-13 08:30:00',
                'selesai_at' => '2025-05-16 14:00:00',
                'created_at' => '2025-05-13 08:20:00',
            ],
        ];

        foreach ($disposisis as $disposisi) {
            $waktu = $disposisi['created_at'];

            DB::table('disposisis')->updateOrInsert(
                ['catatan' => $disposisi['catatan']],
                array_merge($disposisi, ['updated_at' => $waktu])
            );
        }
    }
}
