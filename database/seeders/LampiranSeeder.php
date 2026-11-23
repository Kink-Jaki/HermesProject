<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class LampiranSeeder extends Seeder
{
    public function run(): void
    {
        $suratMasuk = fn (string $agenda) => DB::table('surat_masuks')->where('nomor_agenda', $agenda)->value('id');
        $suratKeluar = fn (string $agenda) => DB::table('surat_keluars')->where('nomor_agenda', $agenda)->value('id');

        $lampirans = [
            [
                'attachable_type' => 'App\\Models\\SuratMasuk',
                'attachable_id' => $suratMasuk('SM-2025-0248'),
                'path' => 'lampiran/surat-masuk/SM-2025-0248-utama.pdf',
                'mime_type' => 'application/pdf',
                'label' => 'Surat undangan asli',
                'is_utama' => true,
            ],
            [
                'attachable_type' => 'App\\Models\\SuratMasuk',
                'attachable_id' => $suratMasuk('SM-2025-0248'),
                'path' => 'lampiran/surat-masuk/SM-2025-0248-lampiran.pdf',
                'mime_type' => 'application/pdf',
                'label' => 'Lampiran susunan acara',
                'is_utama' => false,
            ],
            [
                'attachable_type' => 'App\\Models\\SuratMasuk',
                'attachable_id' => $suratMasuk('SM-2025-0247'),
                'path' => 'lampiran/surat-masuk/SM-2025-0247-utama.pdf',
                'mime_type' => 'application/pdf',
                'label' => 'Surat pemberitahuan anggaran',
                'is_utama' => true,
            ],
            [
                'attachable_type' => 'App\\Models\\SuratMasuk',
                'attachable_id' => $suratMasuk('SM-2025-0245'),
                'path' => 'lampiran/surat-masuk/SM-2025-0245-utama.pdf',
                'mime_type' => 'application/pdf',
                'label' => 'Surat undangan sosialisasi',
                'is_utama' => true,
            ],
            [
                'attachable_type' => 'App\\Models\\SuratKeluar',
                'attachable_id' => $suratKeluar('SK-2025-0186'),
                'path' => 'lampiran/surat-keluar/SK-2025-0186-utama.pdf',
                'mime_type' => 'application/pdf',
                'label' => 'Surat jawaban rapat koordinasi',
                'is_utama' => true,
            ],
            [
                'attachable_type' => 'App\\Models\\SuratKeluar',
                'attachable_id' => $suratKeluar('SK-2025-0185'),
                'path' => 'lampiran/surat-keluar/SK-2025-0185-utama.pdf',
                'mime_type' => 'application/pdf',
                'label' => 'Surat konfirmasi anggaran',
                'is_utama' => true,
            ],
        ];

        foreach ($lampirans as $lampiran) {
            DB::table('lampirans')->updateOrInsert(
                ['path' => $lampiran['path']],
                array_merge($lampiran, ['created_at' => now(), 'updated_at' => now()])
            );
        }
    }
}
