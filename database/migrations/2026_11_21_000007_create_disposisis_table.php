<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('disposisis', function (Blueprint $table) {
            $table->id();
            $table->foreignId('surat_masuk_id')->constrained('surat_masuks')->cascadeOnDelete();
            $table->foreignId('pemberi_user_id')->constrained('users')->restrictOnDelete();
            $table->foreignId('penerima_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('unit_id')->nullable()->constrained('units')->nullOnDelete();
            $table->string('instruksi');
            $table->text('catatan')->nullable();
            $table->string('prioritas')->default('biasa')->index();
            $table->dateTime('batas_waktu');
            $table->string('status')->default('belum_dibaca')->index();
            $table->dateTime('dibaca_at')->nullable();
            $table->dateTime('selesai_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('disposisis');
    }
};
