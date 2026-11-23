<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DashboardResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'metrics' => $this['metrics'],
            'statistik' => $this['statistik'],
            'perlu_perhatian' => $this['perlu_perhatian'],
            'surat_masuk_terbaru' => $this['surat_masuk_terbaru'],
        ];
    }
}
