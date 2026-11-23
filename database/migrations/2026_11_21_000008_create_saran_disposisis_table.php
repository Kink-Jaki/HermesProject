<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('saran_disposisis', function (Blueprint $table) {
            $table->id();
            $table->foreignId('surat_masuk_id')->constrained('surat_masuks')->cascadeOnDelete();
            $table->foreignId('disarankan_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('disarankan_unit_id')->nullable()->constrained('units')->nullOnDelete();
            $table->foreignId('disposisi_id')->nullable()->constrained('disposisis')->nullOnDelete();
            $table->decimal('skor', 5, 2);
            $table->text('alasan');
            $table->integer('urutan');
            $table->boolean('dipilih')->default(false);
            $table->timestamps();

            $table->index(['surat_masuk_id', 'urutan']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('saran_disposisis');
    }
};
