<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('surat_keluars', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->restrictOnDelete();
            $table->foreignId('unit_id')->constrained('units')->restrictOnDelete();
            $table->foreignId('category_id')->constrained('categories')->restrictOnDelete();
            $table->foreignId('surat_masuk_id')->nullable()->constrained('surat_masuks')->nullOnDelete();
            $table->string('nomor_surat')->index();
            $table->string('nomor_agenda')->unique();
            $table->date('tanggal_surat')->index();
            $table->string('tujuan');
            $table->string('perihal');
            $table->text('ringkasan')->nullable();
            $table->string('soft_file')->nullable();
            $table->string('status')->default('draft')->index();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('surat_keluars');
    }
};
