<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class SaranDisposisiSeeder extends Seeder
{
    public function run(): void
    {
        $userId = fn (string $email) => DB::table('users')->where('email', $email)->value('id');
        $unitId = fn (string $nama) => DB::table('units')->where('nama', $nama)->value('id');
        $suratMasukId = fn (string $agenda) => DB::table('surat_masuks')->where('nomor_agenda', $agenda)->value('id');
        $disposisiId = fn (string $catatan) => DB::table('disposisis')->where('catatan', $catatan)->value('id');

        $saran = [
            [
                'surat_masuk_id' => $suratMasukId('SM-2025-0248'),
                'disarankan_user_id' => $userId('staf.umum@instansi.go.id'),
                'disarankan_unit_id' => $unitId('Bagian Umum'),
                'disposisi_id' => $disposisiId('Mohon disiapkan agenda dan ruang rapat koordinasi Hari Kemerdekaan.'),
                'skor' => 0.95,
                'alasan' => 'Bagian Umum menangani urusan rapat dan administrasi persuratan masuk.',
                'urutan' => 1,
                'dipilih' => true,
            ],
            [
                'surat_masuk_id' => $suratMasukId('SM-2025-0248'),
                'disarankan_user_id' => $userId('staf.keuangan@instansi.go.id'),
                'disarankan_unit_id' => $unitId('Bagian Keuangan'),
                'disposisi_id' => $disposisiId('Mohon koordinasikan anggaran konsumsi dan logistik kegiatan.'),
                'skor' => 0.88,
                'alasan' => 'Bagian Keuangan perlu menyiapkan anggaran konsumsi dan logistik rapat.',
                'urutan' => 2,
                'dipilih' => true,
            ],
            [
                'surat_masuk_id' => $suratMasukId('SM-2025-0248'),
                'disarankan_user_id' => $userId('staf.organisasi@instansi.go.id'),
                'disarankan_unit_id' => $unitId('Bagian Organisasi'),
                'disposisi_id' => null,
                'skor' => 0.64,
                'alasan' => 'Bagian Organisasi dapat membantu menyusun susunan acara kegiatan.',
                'urutan' => 3,
                'dipilih' => false,
            ],
            [
                'surat_masuk_id' => $suratMasukId('SM-2025-0245'),
                'disarankan_user_id' => $userId('staf.pemerintahan@instansi.go.id'),
                'disarankan_unit_id' => $unitId('Bagian Pemerintahan'),
                'disposisi_id' => null,
                'skor' => 0.93,
                'alasan' => 'Berdasarkan riwayat surat sejenis, Bagian Pemerintahan paling sering menangani kegiatan kesehatan masyarakat.',
                'urutan' => 1,
                'dipilih' => false,
            ],
            [
                'surat_masuk_id' => $suratMasukId('SM-2025-0245'),
                'disarankan_user_id' => $userId('staf.umum@instansi.go.id'),
                'disarankan_unit_id' => $unitId('Bagian Umum'),
                'disposisi_id' => null,
                'skor' => 0.79,
                'alasan' => 'Bagian Umum dapat membantu pencatatan dan pendistribusian undangan.',
                'urutan' => 2,
                'dipilih' => false,
            ],
            [
                'surat_masuk_id' => $suratMasukId('SM-2025-0245'),
                'disarankan_user_id' => $userId('admin.surat@instansi.go.id'),
                'disarankan_unit_id' => null,
                'disposisi_id' => null,
                'skor' => 0.55,
                'alasan' => 'Admin surat dapat memverifikasi kesesuaian data undangan sebelum pendisposisian.',
                'urutan' => 3,
                'dipilih' => false,
            ],
        ];

        foreach ($saran as $item) {
            $exists = DB::table('saran_disposisis')
                ->where('surat_masuk_id', $item['surat_masuk_id'])
                ->where('urutan', $item['urutan'])
                ->exists();

            if ($exists) {
                continue;
            }

            DB::table('saran_disposisis')->insert(array_merge($item, [
                'created_at' => now(),
                'updated_at' => now(),
            ]));
        }
    }
}
