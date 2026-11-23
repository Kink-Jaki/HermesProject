<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Carbon;

class NotificationResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $status = $this->status ?? ((bool) $this->dibaca ? 'read' : 'unread');
        $waktu = Carbon::parse($this->created_at ?? now());

        return [
            'id' => $this->id,
            'judul' => $this->judul,
            'pesan' => $this->pesan ?? $this->deskripsi,
            'status' => $status,
            'is_unread' => $status !== 'read',
            'channel' => $this->channel ?? 'web',
            'disposisi_id' => $this->disposisi_id ?? null,
            'surat_masuk_id' => $this->surat_masuk_id ?? null,
            'surat_masuk' => $this->whenLoaded('suratMasuk', fn () => [
                'id' => $this->suratMasuk->id,
                'nomor_surat' => $this->suratMasuk->nomor_surat,
                'perihal' => $this->suratMasuk->perihal,
            ], null),
            'created_at' => $waktu->toIso8601String(),
            'waktu_relatif' => $waktu->locale('id')->diffForHumans(),
            'sent_at' => $this->sent_at ? Carbon::parse($this->sent_at)->toIso8601String() : null,
        ];
    }
}
