<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class SuratKeluarSeeder extends Seeder
{
    public function run(): void
    {
        $userId = fn (string $email) => DB::table('users')->where('email', $email)->value('id');
        $unitId = fn (string $nama) => DB::table('units')->where('nama', $nama)->value('id');
        $categoryId = fn (string $kode) => DB::table('categories')->where('kode_klasifikasi', $kode)->value('id');
        $suratMasukId = fn (string $agenda) => DB::table('surat_masuks')->where('nomor_agenda', $agenda)->value('id');

        $suratKeluars = [
            [
                'user_id' => $userId('admin.surat@instansi.go.id'),
                'unit_id' => $unitId('Bagian Umum'),
                'category_id' => $categoryId('005 - Undangan'),
                'surat_masuk_id' => $suratMasukId('SM-2025-0248'),
                'nomor_surat' => '005/210/SETDA/2025',
                'nomor_agenda' => 'SK-2025-0186',
                'tanggal_surat' => '2025-05-19',
                'tujuan' => 'Pemerintah Kabupaten Tulungagung',
                'perihal' => 'Jawaban undangan rapat koordinasi',
                'ringkasan' => 'Menyampaikan konfirmasi kehadiran dan susunan delegasi dalam rapat koordinasi Hari Kemerdekaan RI ke-80.',
                'soft_file' => 'surat-keluar/SK-2025-0186.pdf',
                'status' => 'terkirim',
            ],
            [
                'user_id' => $userId('staf.keuangan@instansi.go.id'),
                'unit_id' => $unitId('Bagian Keuangan'),
                'category_id' => $categoryId('900 - Keuangan'),
                'surat_masuk_id' => $suratMasukId('SM-2025-0247'),
                'nomor_surat' => '900/198/KEU/2025',
                'nomor_agenda' => 'SK-2025-0185',
                'tanggal_surat' => '2025-05-17',
                'tujuan' => 'Dinas Keuangan Provinsi Jawa Timur',
                'perihal' => 'Konfirmasi penerimaan anggaran',
                'ringkasan' => 'Konfirmasi penerimaan dokumen pencairan anggaran belanja modal tahap II.',
                'soft_file' => 'surat-keluar/SK-2025-0185.pdf',
                'status' => 'arsip',
            ],
            [
                'user_id' => $userId('staf.organisasi@instansi.go.id'),
                'unit_id' => $unitId('Bagian Organisasi'),
                'category_id' => $categoryId('800 - Kepegawaian'),
                'surat_masuk_id' => $suratMasukId('SM-2025-0246'),
                'nomor_surat' => '800/176/KEPEG/2025',
                'nomor_agenda' => 'SK-2025-0184',
                'tanggal_surat' => '2025-05-16',
                'tujuan' => 'Badan Kepegawaian Negara',
                'perihal' => 'Laporan implementasi petunjuk teknis ASN',
                'ringkasan' => 'Laporan awal implementasi petunjuk teknis pengelolaan ASN di lingkungan instansi.',
                'soft_file' => 'surat-keluar/SK-2025-0184.pdf',
                'status' => 'terkirim',
            ],
            [
                'user_id' => $userId('staf.pemerintahan@instansi.go.id'),
                'unit_id' => $unitId('Bagian Pemerintahan'),
                'category_id' => $categoryId('400 - Kesehatan/Kegiatan'),
                'surat_masuk_id' => $suratMasukId('SM-2025-0245'),
                'nomor_surat' => '400/165/KES/2025',
                'nomor_agenda' => 'SK-2025-0183',
                'tanggal_surat' => '2025-05-19',
                'tujuan' => 'Dinas Kesehatan Kabupaten Tulungagung',
                'perihal' => 'Tindak lanjut sosialisasi kesehatan',
                'ringkasan' => 'Draf tanggapan atas undangan sosialisasi program kesehatan masyarakat.',
                'soft_file' => null,
                'status' => 'draft',
            ],
            [
                'user_id' => $userId('admin.surat@instansi.go.id'),
                'unit_id' => $unitId('Bagian Umum'),
                'category_id' => $categoryId('005 - Undangan'),
                'surat_masuk_id' => $suratMasukId('SM-2025-0244'),
                'nomor_surat' => '005/199/SETDA/2025',
                'nomor_agenda' => 'SK-2025-0182',
                'tanggal_surat' => '2025-05-15',
                'tujuan' => 'Kementerian Dalam Negeri Republik Indonesia',
                'perihal' => 'Laporan tertib administrasi persuratan',
                'ringkasan' => 'Laporan pelaksanaan tertib administrasi persuratan dan penggunaan nomor agenda semester I.',
                'soft_file' => 'surat-keluar/SK-2025-0182.pdf',
                'status' => 'terkirim',
            ],
        ];

        foreach ($suratKeluars as $index => $surat) {
            $waktu = sprintf('2025-05-19 %02d:00:00', 13 + $index);

            DB::table('surat_keluars')->updateOrInsert(
                ['nomor_agenda' => $surat['nomor_agenda']],
                array_merge($surat, ['created_at' => $waktu, 'updated_at' => $waktu])
            );
        }
    }
}
