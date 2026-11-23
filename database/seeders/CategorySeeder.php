<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            ['nama' => '005 - Undangan', 'kode_klasifikasi' => '005 - Undangan'],
            ['nama' => '900 - Keuangan', 'kode_klasifikasi' => '900 - Keuangan'],
            ['nama' => '800 - Kepegawaian', 'kode_klasifikasi' => '800 - Kepegawaian'],
            ['nama' => '400 - Kesehatan/Kegiatan', 'kode_klasifikasi' => '400 - Kesehatan/Kegiatan'],
        ];

        foreach ($categories as $category) {
            DB::table('categories')->updateOrInsert(
                ['kode_klasifikasi' => $category['kode_klasifikasi']],
                array_merge($category, ['created_at' => now(), 'updated_at' => now()])
            );
        }
    }
}
