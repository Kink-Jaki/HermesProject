<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Disposisi extends Model
{
    protected $fillable = [
        'surat_masuk_id',
        'pemberi_user_id',
        'penerima_user_id',
        'unit_id',
        'batas_waktu',
        'prioritas',
        'instruksi',
        'catatan',
        'kirim_notifikasi',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'batas_waktu' => 'date',
            'kirim_notifikasi' => 'boolean',
        ];
    }

    public function suratMasuk(): BelongsTo
    {
        return $this->belongsTo(SuratMasuk::class);
    }

    public function pemberi(): BelongsTo
    {
        return $this->belongsTo(User::class, 'pemberi_user_id');
    }

    public function penerima(): BelongsTo
    {
        return $this->belongsTo(User::class, 'penerima_user_id');
    }

    public function unit(): BelongsTo
    {
        return $this->belongsTo(Unit::class);
    }

    public function saranDisposisi(): HasMany
    {
        return $this->hasMany(SaranDisposisi::class);
    }

    public function notifications(): HasMany
    {
        return $this->hasMany(Notification::class);
    }

    public function scopePrioritas(Builder $query, string $prioritas): Builder
    {
        return $query->where('prioritas', $prioritas);
    }
}
