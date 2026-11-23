<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Carbon;

class SuratMasukResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $urgensi = (string) ($this->urgensi ?? $this->sifat ?? 'biasa');
        $status = (string) ($this->status ?? 'baru');

        return [
            'id' => $this->id,
            'nomor_agenda' => $this->nomor_agenda,
            'nomor_surat' => $this->nomor_surat,
            'tanggal_surat' => $this->formatTanggal($this->tanggal_surat),
            'tanggal_diterima' => $this->formatTanggal($this->tanggal_diterima),
            'pengirim' => $this->pengirim,
            'asal_surat' => $this->asal_surat ?? $this->pengirim,
            'perihal' => $this->perihal,
            'ringkasan' => $this->ringkasan ?? $this->asal_surat,
            'urgensi' => $urgensi,
            'urgensi_label' => $this->urgensiLabel($urgensi),
            'status' => $status,
            'status_label' => $this->statusLabel($status),
            'category' => $this->whenLoaded('category', fn () => new CategoryResource($this->category), null),
            'pencatat' => $this->whenLoaded('pencatat', fn () => new UserResource($this->pencatat), null),
        ];
    }

    private function formatTanggal(mixed $value): ?string
    {
        return $value ? Carbon::parse($value)->toDateString() : null;
    }

    private function urgensiLabel(string $urgensi): string
    {
        return match ($urgensi) {
            'segera', 'Segera' => 'Segera',
            'sangat_segera', 'sangat segera', 'Sangat Segera' => 'Sangat Segera',
            default => 'Biasa',
        };
    }

    private function statusLabel(string $status): string
    {
        return match ($status) {
            'baru' => 'Baru',
            'terdisposisi' => 'Terdisposisi',
            'selesai' => 'Selesai',
            default => ucfirst($status),
        };
    }
}
