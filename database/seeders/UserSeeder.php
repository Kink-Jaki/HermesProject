<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $unitId = fn (string $nama) => DB::table('units')->where('nama', $nama)->value('id');

        $users = [
            [
                'name' => 'Administrator',
                'email' => 'admin@instansi.go.id',
                'jabatan' => 'Super Administrator',
                'no_wa' => '0812-1111-1001',
                'role' => 'super_admin',
                'unit_id' => null,
            ],
            [
                'name' => 'Drs. H. Bambang Suryanto',
                'email' => 'pimpinan@instansi.go.id',
                'jabatan' => 'Kepala Dinas',
                'no_wa' => '0812-2222-2002',
                'role' => 'pimpinan',
                'unit_id' => null,
            ],
            [
                'name' => 'Siti Nurhaliza',
                'email' => 'admin.surat@instansi.go.id',
                'jabatan' => 'Admin Surat',
                'no_wa' => '0812-3333-3003',
                'role' => 'admin_surat',
                'unit_id' => $unitId('Bagian Umum'),
            ],
            [
                'name' => 'Ahmad Fauzi',
                'email' => 'staf.umum@instansi.go.id',
                'jabatan' => 'Staf Bagian Umum',
                'no_wa' => '0812-4444-4004',
                'role' => 'staf',
                'unit_id' => $unitId('Bagian Umum'),
            ],
            [
                'name' => 'Dewi Sartika',
                'email' => 'staf.keuangan@instansi.go.id',
                'jabatan' => 'Staf Bagian Keuangan',
                'no_wa' => '0812-5555-5005',
                'role' => 'staf',
                'unit_id' => $unitId('Bagian Keuangan'),
            ],
            [
                'name' => 'Rizky Pratama',
                'email' => 'staf.organisasi@instansi.go.id',
                'jabatan' => 'Staf Bagian Organisasi',
                'no_wa' => '0812-6666-6006',
                'role' => 'staf',
                'unit_id' => $unitId('Bagian Organisasi'),
            ],
            [
                'name' => 'Maya Indah',
                'email' => 'staf.pemerintahan@instansi.go.id',
                'jabatan' => 'Staf Bagian Pemerintahan',
                'no_wa' => '0812-7777-7007',
                'role' => 'staf',
                'unit_id' => $unitId('Bagian Pemerintahan'),
            ],
            [
                'name' => 'H. Sudirman Nasution',
                'email' => 'wakil.pimpinan@instansi.go.id',
                'jabatan' => 'Wakil Kepala Dinas',
                'no_wa' => '0812-8888-8008',
                'role' => 'pimpinan',
                'unit_id' => null,
            ],
            [
                'name' => 'Fitri Handayani',
                'email' => 'fitri.handayani@instansi.go.id',
                'jabatan' => 'Admin Surat Bagian Keuangan',
                'no_wa' => '0812-8888-8009',
                'role' => 'admin_surat',
                'unit_id' => $unitId('Bagian Keuangan'),
            ],
            [
                'name' => 'Budi Santoso',
                'email' => 'budi.santoso@instansi.go.id',
                'jabatan' => 'Staf Bagian Umum',
                'no_wa' => '0812-8888-8010',
                'role' => 'staf',
                'unit_id' => $unitId('Bagian Umum'),
            ],
            [
                'name' => 'Rina Wijaya',
                'email' => 'rina.wijaya@instansi.go.id',
                'jabatan' => 'Staf Bagian Organisasi',
                'no_wa' => '0812-8888-8011',
                'role' => 'staf',
                'unit_id' => $unitId('Bagian Organisasi'),
            ],
            [
                'name' => 'Agus Setiawan',
                'email' => 'agus.setiawan@instansi.go.id',
                'jabatan' => 'Staf Bagian Pemerintahan',
                'no_wa' => '0812-8888-8012',
                'role' => 'staf',
                'unit_id' => $unitId('Bagian Pemerintahan'),
            ],
            [
                'name' => 'Nur Aini',
                'email' => 'nur.aini@instansi.go.id',
                'jabatan' => 'Staf Bagian Keuangan',
                'no_wa' => '0812-8888-8013',
                'role' => 'staf',
                'unit_id' => $unitId('Bagian Keuangan'),
            ],
        ];

        foreach ($users as $user) {
            $existing = DB::table('users')->where('email', $user['email'])->first();

            if ($existing) {
                DB::table('users')->where('id', $existing->id)->update(
                    array_merge(Arr::except($user, ['email']), ['updated_at' => now()])
                );

                continue;
            }

            DB::table('users')->insert(array_merge($user, [
                'email_verified_at' => now(),
                'password' => Hash::make('password'),
                'remember_token' => Str::random(10),
                'created_at' => now(),
                'updated_at' => now(),
            ]));
        }
    }
}
