<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('notifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('disposisi_id')->nullable()->constrained('disposisis')->nullOnDelete();
            $table->foreignId('surat_masuk_id')->nullable()->constrained('surat_masuks')->nullOnDelete();
            $table->string('judul');
            $table->text('pesan');
            $table->string('status')->default('unread')->index();
            $table->string('channel')->default('web');
            $table->string('provider_message_id')->nullable();
            $table->dateTime('sent_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notifications');
    }
};
