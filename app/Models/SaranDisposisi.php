<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SaranDisposisi extends Model
{
    protected $fillable = [
        'surat_masuk_id',
        'disarankan_user_id',
        'disarankan_unit_id',
        'disposisi_id',
        'skor',
        'alasan',
        'digunakan',
    ];

    protected function casts(): array
    {
        return [
            'skor' => 'decimal:2',
            'digunakan' => 'boolean',
        ];
    }

    public function suratMasuk(): BelongsTo
    {
        return $this->belongsTo(SuratMasuk::class);
    }

    public function disarankanUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'disarankan_user_id');
    }

    public function disarankanUnit(): BelongsTo
    {
        return $this->belongsTo(Unit::class, 'disarankan_unit_id');
    }

    public function disposisi(): BelongsTo
    {
        return $this->belongsTo(Disposisi::class);
    }

    public function scopeSkorTertinggi(Builder $query): Builder
    {
        return $query->orderByDesc('skor');
    }
}
