<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Unit extends Model
{
    protected $fillable = [
        'nama',
        'kode',
        'singkatan',
        'deskripsi',
    ];

    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }

    public function suratKeluars(): HasMany
    {
        return $this->hasMany(SuratKeluar::class);
    }

    public function disposisis(): HasMany
    {
        return $this->hasMany(Disposisi::class);
    }

    public function saranDisposisis(): HasMany
    {
        return $this->hasMany(SaranDisposisi::class, 'disarankan_unit_id');
    }
}
