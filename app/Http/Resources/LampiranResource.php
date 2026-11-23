<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Storage;

class LampiranResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'label' => $this->label,
            'mime_type' => $this->mime_type,
            'url' => $this->path ? Storage::disk('public')->url($this->path) : null,
            'is_utama' => (bool) $this->is_utama,
            'created_at' => $this->created_at ? Carbon::parse($this->created_at)->toIso8601String() : null,
        ];
    }
}
