<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Category extends Model
{
    protected $fillable = [
        'nama',
        'kode',
        'deskripsi',
    ];

    public function suratMasuks(): HasMany
    {
        return $this->hasMany(SuratMasuk::class);
    }

    public function suratKeluars(): HasMany
    {
        return $this->hasMany(SuratKeluar::class);
    }
}
