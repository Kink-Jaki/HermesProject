<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class SuratMasukSeeder extends Seeder
{
    public function run(): void
    {
        $userId = fn (string $email) => DB::table('users')->where('email', $email)->value('id');
        $categoryId = fn (string $kode) => DB::table('categories')->where('kode_klasifikasi', $kode)->value('id');

        $suratMasuks = [
            [
                'user_id' => $userId('admin.surat@instansi.go.id'),
                'category_id' => $categoryId('005 - Undangan'),
                'nomor_surat' => '005/126/SETDA/2025',
                'nomor_agenda' => 'SM-2025-0248',
                'tanggal_surat' => '2025-05-19',
                'tanggal_diterima' => '2025-05-19',
                'pengirim' => 'Pemerintah Kabupaten Tulungagung',
                'perihal' => 'Undangan rapat koordinasi',
                'ringkasan' => 'Undangan rapat koordinasi persiapan Hari Kemerdekaan RI ke-80 pada 27 Mei 2025 pukul 09.00 WIB di Pendopo Kabupaten.',
                'urgensi' => 'segera',
                'status' => 'terdisposisi',
            ],
            [
                'user_id' => $userId('staf.keuangan@instansi.go.id'),
                'category_id' => $categoryId('900 - Keuangan'),
                'nomor_surat' => '900/118/KEU/2025',
                'nomor_agenda' => 'SM-2025-0247',
                'tanggal_surat' => '2025-05-16',
                'tanggal_diterima' => '2025-05-19',
                'pengirim' => 'Dinas Keuangan Provinsi Jawa Timur',
                'perihal' => 'Pemberitahuan pencairan anggaran belanja modal',
                'ringkasan' => 'Pemberitahuan pencairan anggaran belanja modal tahap II dan lampiran daftar dokumen yang harus dilengkapi.',
                'urgensi' => 'biasa',
                'status' => 'terdisposisi',
            ],
            [
                'user_id' => $userId('staf.organisasi@instansi.go.id'),
                'category_id' => $categoryId('800 - Kepegawaian'),
                'nomor_surat' => '800/095/KEPEG/2025',
                'nomor_agenda' => 'SM-2025-0246',
                'tanggal_surat' => '2025-05-15',
                'tanggal_diterima' => '2025-05-16',
                'pengirim' => 'Badan Kepegawaian Negara',
                'perihal' => 'Petunjuk teknis pengelolaan ASN',
                'ringkasan' => 'Petunjuk teknis pengelolaan kepegawaian ASN berbasis sistem informasi manajemen kepegawaian.',
                'urgensi' => 'biasa',
                'status' => 'selesai',
            ],
            [
                'user_id' => $userId('admin.surat@instansi.go.id'),
                'category_id' => $categoryId('400 - Kesehatan/Kegiatan'),
                'nomor_surat' => '400/072/KES/2025',
                'nomor_agenda' => 'SM-2025-0245',
                'tanggal_surat' => '2025-05-19',
                'tanggal_diterima' => '2025-05-19',
                'pengirim' => 'Dinas Kesehatan Kabupaten Tulungagung',
                'perihal' => 'Undangan sosialisasi program kesehatan masyarakat',
                'ringkasan' => 'Mengundang perangkat daerah untuk mengikuti sosialisasi program kesehatan masyarakat pada 22 Mei 2025.',
                'urgensi' => 'sangat_segera',
                'status' => 'baru',
            ],
            [
                'user_id' => $userId('admin.surat@instansi.go.id'),
                'category_id' => $categoryId('005 - Undangan'),
                'nomor_surat' => '005/121/SETDA/2025',
                'nomor_agenda' => 'SM-2025-0244',
                'tanggal_surat' => '2025-05-14',
                'tanggal_diterima' => '2025-05-15',
                'pengirim' => 'Kementerian Dalam Negeri Republik Indonesia',
                'perihal' => 'Surat edaran tertib administrasi persuratan',
                'ringkasan' => 'Surat edaran tentang tertib administrasi persuratan dan penggunaan nomor agenda di lingkungan pemerintah daerah.',
                'urgensi' => 'segera',
                'status' => 'terdisposisi',
            ],
            [
                'user_id' => $userId('staf.keuangan@instansi.go.id'),
                'category_id' => $categoryId('900 - Keuangan'),
                'nomor_surat' => '900/110/KEU/2025',
                'nomor_agenda' => 'SM-2025-0243',
                'tanggal_surat' => '2025-05-12',
                'tanggal_diterima' => '2025-05-13',
                'pengirim' => 'Inspektorat Kabupaten Tulungagung',
                'perihal' => 'Pemberitahuan audit keuangan semester I',
                'ringkasan' => 'Pemberitahuan pelaksanaan audit keuangan semester I tahun anggaran 2025 beserta jadwal pemeriksaan.',
                'urgensi' => 'biasa',
                'status' => 'selesai',
            ],
            [
                'user_id' => $userId('staf.organisasi@instansi.go.id'),
                'category_id' => $categoryId('800 - Kepegawaian'),
                'nomor_surat' => '800/089/KEPEG/2025',
                'nomor_agenda' => 'SM-2025-0242',
                'tanggal_surat' => '2025-05-09',
                'tanggal_diterima' => '2025-05-12',
                'pengirim' => 'Badan Kepegawaian Negara',
                'perihal' => 'Pemberitahuan hasil seleksi diklat kepemimpinan',
                'ringkasan' => 'Pengumuman hasil seleksi diklat kepemimpinan tingkat IV dan tindak lanjut penunjukan peserta.',
                'urgensi' => 'biasa',
                'status' => 'baru',
            ],
            [
                'user_id' => $userId('admin.surat@instansi.go.id'),
                'category_id' => $categoryId('005 - Undangan'),
                'nomor_surat' => '005/115/SETDA/2025',
                'nomor_agenda' => 'SM-2025-0241',
                'tanggal_surat' => '2025-05-08',
                'tanggal_diterima' => '2025-05-09',
                'pengirim' => 'Dinas Pendidikan Kabupaten Tulungagung',
                'perihal' => 'Undangan musyawarah rencana pembangunan',
                'ringkasan' => 'Undangan musyawarah rencana pembangunan kabupaten untuk tahun anggaran 2026.',
                'urgensi' => 'segera',
                'status' => 'baru',
            ],
        ];

        foreach ($suratMasuks as $index => $surat) {
            $waktu = sprintf('2025-05-19 %02d:%02d:00', 8 + intdiv($index, 6), ($index * 7) % 60);

            DB::table('surat_masuks')->updateOrInsert(
                ['nomor_agenda' => $surat['nomor_agenda']],
                array_merge($surat, ['created_at' => $waktu, 'updated_at' => $waktu])
            );
        }
    }
}
