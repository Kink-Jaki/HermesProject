<?php

namespace App\Models;

use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable;

    protected $fillable = [
        'unit_id',
        'name',
        'email',
        'password',
        'role',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function unit(): BelongsTo
    {
        return $this->belongsTo(Unit::class);
    }

    public function suratMasuks(): HasMany
    {
        return $this->hasMany(SuratMasuk::class);
    }

    public function suratKeluars(): HasMany
    {
        return $this->hasMany(SuratKeluar::class);
    }

    public function disposisiDiberi(): HasMany
    {
        return $this->hasMany(Disposisi::class, 'pemberi_user_id');
    }

    public function disposisiDiterima(): HasMany
    {
        return $this->hasMany(Disposisi::class, 'penerima_user_id');
    }

    public function notifications(): HasMany
    {
        return $this->hasMany(Notification::class);
    }
}
