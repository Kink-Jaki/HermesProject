<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CategoryResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $kode = $this->kode_klasifikasi ?? $this->kode ?? null;

        return [
            'id' => $this->id,
            'nama' => $this->nama,
            'kode' => $kode,
            'kode_klasifikasi' => $kode,
            'deskripsi' => $this->deskripsi ?? null,
        ];
    }
}
