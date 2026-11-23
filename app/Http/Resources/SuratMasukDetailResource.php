<?php

namespace App\Http\Resources;

use App\Models\Lampiran;
use App\Models\SaranDisposisi;
use Illuminate\Http\Request;

class SuratMasukDetailResource extends SuratMasukResource
{
    public function toArray(Request $request): array
    {
        $data = parent::toArray($request);

        $data['lampirans'] = $this->whenLoaded('lampirans', function () {
            return $this->lampirans
                ->map(fn (Lampiran $lampiran): array => $this->lampiranData($lampiran))
                ->values()
                ->all();
        }, []);

        $data['disposisis'] = $this->whenLoaded(
            'disposisis',
            fn () => DisposisiResource::collection($this->disposisis),
            [],
        );

        $data['saran_disposisis'] = $this->whenLoaded('saranDisposisis', function () {
            return $this->saranDisposisis
                ->map(fn (SaranDisposisi $saran): array => $this->saranData($saran))
                ->values()
                ->all();
        }, []);

        return $data;
    }

    private function lampiranData(Lampiran $lampiran): array
    {
        $path = $lampiran->path ?? $lampiran->path_file;

        return [
            'id' => $lampiran->id,
            'nama_file' => $lampiran->label ?? $lampiran->nama_file ?? basename((string) $path),
            'path' => $path,
            'ukuran' => $lampiran->ukuran ?? null,
            'mime_type' => $lampiran->mime_type ?? null,
            'is_utama' => (bool) ($lampiran->is_utama ?? false),
            'download_url' => sprintf('/api/surat-masuk/%d/lampiran/%d/download', (int) $this->id, (int) $lampiran->id),
            'created_at' => $lampiran->created_at?->toIso8601String(),
        ];
    }

    private function saranData(SaranDisposisi $saran): array
    {
        return [
            'id' => $saran->id,
            'skor' => (float) $saran->skor,
            'alasan' => $saran->alasan,
            'urutan' => $saran->urutan ?? null,
            'dipilih' => (bool) ($saran->dipilih ?? $saran->digunakan ?? false),
            'user' => $saran->relationLoaded('disarankanUser') && $saran->disarankanUser
                ? new UserResource($saran->disarankanUser)
                : null,
            'unit' => $saran->relationLoaded('disarankanUnit') && $saran->disarankanUnit
                ? new UnitResource($saran->disarankanUnit)
                : null,
        ];
    }
}
