<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class UnitSeeder extends Seeder
{
    public function run(): void
    {
        $units = [
            [
                'nama' => 'Bagian Umum',
                'deskripsi' => 'Mengelola administrasi umum, persuratan, dan urusan dalam instansi.',
                'penanggung_jawab' => 'Siti Nurhaliza',
            ],
            [
                'nama' => 'Bagian Keuangan',
                'deskripsi' => 'Mengelola anggaran, pembukuan, dan pertanggungjawaban keuangan instansi.',
                'penanggung_jawab' => 'Dewi Sartika',
            ],
            [
                'nama' => 'Bagian Organisasi',
                'deskripsi' => 'Mengelola kelembagaan, kepegawaian, dan tata laksana organisasi.',
                'penanggung_jawab' => 'Rizky Pratama',
            ],
            [
                'nama' => 'Bagian Pemerintahan',
                'deskripsi' => 'Mengoordinasikan pelaksanaan urusan pemerintahan dan pelayanan publik.',
                'penanggung_jawab' => 'Maya Indah',
            ],
        ];

        foreach ($units as $unit) {
            DB::table('units')->updateOrInsert(
                ['nama' => $unit['nama']],
                array_merge($unit, ['created_at' => now(), 'updated_at' => now()])
            );
        }
    }
}
