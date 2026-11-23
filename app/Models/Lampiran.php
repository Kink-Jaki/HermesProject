<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class Lampiran extends Model
{
    protected $fillable = [
        'attachable_type',
        'attachable_id',
        'nama_file',
        'path_file',
        'ukuran',
        'mime_type',
    ];

    protected function casts(): array
    {
        return [
            'ukuran' => 'decimal:2',
        ];
    }

    public function attachable(): MorphTo
    {
        return $this->morphTo();
    }
}
