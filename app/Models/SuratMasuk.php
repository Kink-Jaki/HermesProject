<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphMany;

class SuratMasuk extends Model
{
    protected $fillable = [
        'nomor_agenda',
        'nomor_surat',
        'tanggal_surat',
        'tanggal_diterima',
        'asal_surat',
        'pengirim',
        'perihal',
        'sifat',
        'status',
        'category_id',
        'user_id',
    ];

    protected function casts(): array
    {
        return [
            'tanggal_surat' => 'date',
            'tanggal_diterima' => 'date',
        ];
    }

    public function pencatat(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function lampirans(): MorphMany
    {
        return $this->morphMany(Lampiran::class, 'attachable');
    }

    public function disposisis(): HasMany
    {
        return $this->hasMany(Disposisi::class);
    }

    public function saranDisposisis(): HasMany
    {
        return $this->hasMany(SaranDisposisi::class);
    }

    public function notifications(): HasMany
    {
        return $this->hasMany(Notification::class);
    }

    public function suratKeluars(): HasMany
    {
        return $this->hasMany(SuratKeluar::class, 'surat_masuk_id');
    }

    public function scopeStatus(Builder $query, string $status): Builder
    {
        return $query->where('status', $status);
    }

    public function scopeSifat(Builder $query, string $sifat): Builder
    {
        return $query->where('sifat', $sifat);
    }

    public function scopeTerbaru(Builder $query): Builder
    {
        return $query->orderByDesc('tanggal_surat');
    }
}
