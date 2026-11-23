<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Storage;

class SuratKeluarResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $status = (string) ($this->status ?? 'draft');

        return [
            'id' => $this->id,
            'nomor_agenda' => $this->nomor_agenda,
            'nomor_surat' => $this->nomor_surat,
            'tanggal_surat' => $this->formatTanggal($this->tanggal_surat),
            'tujuan' => $this->tujuan,
            'perihal' => $this->perihal,
            'ringkasan' => $this->ringkasan,
            'status' => $status,
            'status_label' => $this->statusLabel($status),
            'soft_file' => $this->soft_file ? Storage::disk('public')->url($this->soft_file) : null,
            'unit' => $this->whenLoaded('unit', fn () => new UnitResource($this->unit), null),
            'category' => $this->whenLoaded('category', fn () => new CategoryResource($this->category), null),
            'pencatat' => $this->whenLoaded('pencatat', fn () => new UserResource($this->pencatat), null),
            'surat_masuk_id' => $this->surat_masuk_id,
            'surat_masuk' => $this->whenLoaded('suratMasukDibalas', fn () => new SuratMasukResource($this->suratMasukDibalas), null),
            'lampirans' => $this->whenLoaded('lampirans', fn () => LampiranResource::collection($this->lampirans), null),
            'created_at' => $this->created_at ? Carbon::parse($this->created_at)->toIso8601String() : null,
        ];
    }

    private function formatTanggal(mixed $value): ?string
    {
        return $value ? Carbon::parse($value)->toDateString() : null;
    }

    private function statusLabel(string $status): string
    {
        return match ($status) {
            'draft' => 'Draft',
            'terkirim' => 'Terkirim',
            'arsip' => 'Arsip',
            default => ucfirst($status),
        };
    }
}
