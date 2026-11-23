<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (! Schema::hasColumn('users', 'unit_id')) {
                $table->foreignId('unit_id')->nullable()->constrained('units')->nullOnDelete();
            }
            if (! Schema::hasColumn('users', 'jabatan')) {
                $table->string('jabatan')->default('Staf');
            }
            if (! Schema::hasColumn('users', 'no_wa')) {
                $table->string('no_wa')->nullable();
            }
            if (! Schema::hasColumn('users', 'role')) {
                $table->string('role')->default('staf')->index();
            }
            if (! Schema::hasColumn('users', 'remember_token')) {
                $table->rememberToken();
            }
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropIndex(['role']);
            if (Schema::hasColumn('users', 'unit_id')) {
                $table->dropForeign(['unit_id']);
            }
            $table->dropColumn(['unit_id', 'jabatan', 'no_wa', 'role']);
        });
    }
};
