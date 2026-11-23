<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphMany;

class SuratKeluar extends Model
{
    protected $fillable = [
        'nomor_surat',
        'tanggal_surat',
        'tujuan',
        'perihal',
        'sifat',
        'status',
        'unit_id',
        'category_id',
        'user_id',
        'surat_masuk_id',
    ];

    protected function casts(): array
    {
        return [
            'tanggal_surat' => 'date',
        ];
    }

    public function pencatat(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function unit(): BelongsTo
    {
        return $this->belongsTo(Unit::class);
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function suratMasukDibalas(): BelongsTo
    {
        return $this->belongsTo(SuratMasuk::class, 'surat_masuk_id');
    }

    public function lampirans(): MorphMany
    {
        return $this->morphMany(Lampiran::class, 'attachable');
    }

    public function scopeStatus(Builder $query, string $status): Builder
    {
        return $query->where('status', $status);
    }

    public function scopeSifat(Builder $query, string $sifat): Builder
    {
        return $query->where('sifat', $sifat);
    }
}
