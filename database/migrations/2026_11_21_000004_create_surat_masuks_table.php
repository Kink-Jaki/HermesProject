<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('surat_masuks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->restrictOnDelete();
            $table->foreignId('category_id')->constrained('categories')->restrictOnDelete();
            $table->string('nomor_surat')->index();
            $table->string('nomor_agenda')->unique();
            $table->date('tanggal_surat')->index();
            $table->date('tanggal_diterima');
            $table->string('pengirim');
            $table->string('perihal');
            $table->text('ringkasan')->nullable();
            $table->string('urgensi')->default('biasa')->index();
            $table->string('status')->default('baru')->index();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('surat_masuks');
    }
};
