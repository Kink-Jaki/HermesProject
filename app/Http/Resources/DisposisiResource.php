<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Carbon;

class DisposisiResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $instruksi = (string) ($this->instruksi ?? '');

        return [
            'id' => $this->id,
            'surat_masuk_id' => $this->surat_masuk_id,
            'instruksi' => $instruksi,
            'instruksi_label' => $this->instruksiLabel($instruksi),
            'catatan' => $this->catatan ?? null,
            'prioritas' => $this->prioritas ?? 'biasa',
            'batas_waktu' => $this->formatWaktu($this->batas_waktu),
            'status' => $this->status ?? 'belum_dibaca',
            'dibaca_at' => $this->formatWaktu($this->dibaca_at),
            'selesai_at' => $this->formatWaktu($this->selesai_at),
            'pemberi' => $this->whenLoaded('pemberi', fn () => new UserResource($this->pemberi), null),
            'penerima' => $this->whenLoaded('penerima', fn () => new UserResource($this->penerima), null),
            'unit' => $this->whenLoaded('unit', fn () => new UnitResource($this->unit), null),
            'created_at' => $this->formatWaktu($this->created_at),
        ];
    }

    private function instruksiLabel(string $instruksi): string
    {
        return match ($instruksi) {
            'tindak_lanjut' => 'Tindak lanjut',
            'koordinasikan' => 'Koordinasikan',
            'untuk_diketahui' => 'Untuk diketahui',
            default => $instruksi,
        };
    }

    private function formatWaktu(mixed $value): ?string
    {
        return $value ? Carbon::parse($value)->toIso8601String() : null;
    }
}
