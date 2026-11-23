<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        $this->call([
            UnitSeeder::class,
            UserSeeder::class,
            CategorySeeder::class,
            SuratMasukSeeder::class,
            SuratKeluarSeeder::class,
            LampiranSeeder::class,
            DisposisiSeeder::class,
            SaranDisposisiSeeder::class,
            NotificationSeeder::class,
        ]);
    }
}
