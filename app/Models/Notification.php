<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Notification extends Model
{
    protected $fillable = [
        'user_id',
        'disposisi_id',
        'surat_masuk_id',
        'judul',
        'deskripsi',
        'dibaca',
        'dibaca_pada',
    ];

    protected function casts(): array
    {
        return [
            'dibaca' => 'boolean',
            'dibaca_pada' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function disposisi(): BelongsTo
    {
        return $this->belongsTo(Disposisi::class);
    }

    public function suratMasuk(): BelongsTo
    {
        return $this->belongsTo(SuratMasuk::class);
    }

    public function scopeBelumDibaca(Builder $query): Builder
    {
        return $query->where('dibaca', false);
    }

    public function scopeDibaca(Builder $query): Builder
    {
        return $query->where('dibaca', true);
    }

    public function scopeUnread(Builder $query): Builder
    {
        return $query->belumDibaca();
    }

    public function scopeRead(Builder $query): Builder
    {
        return $query->dibaca();
    }
}
