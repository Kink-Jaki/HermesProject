<?php

namespace App\Services;

use App\Models\Disposisi;
use App\Models\Notification;
use App\Models\SuratMasuk;
use App\Models\User;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class DisposisiService
{
    public function store(SuratMasuk $suratMasuk, array $data, int $pemberiUserId): Disposisi
    {
        $kirimNotifikasi = (bool) ($data['kirim_notifikasi'] ?? false);

        $disposisi = DB::transaction(function () use ($suratMasuk, $data, $pemberiUserId, $kirimNotifikasi): Disposisi {
            $disposisi = new Disposisi;
            $disposisi->surat_masuk_id = $suratMasuk->id;
            $disposisi->pemberi_user_id = $pemberiUserId;
            $disposisi->penerima_user_id = $data['penerima_user_id'] ?? null;
            $disposisi->unit_id = $data['unit_id'] ?? null;
            $disposisi->instruksi = $data['instruksi'];
            $disposisi->catatan = $data['catatan'] ?? null;
            $disposisi->prioritas = $data['prioritas'];
            $disposisi->batas_waktu = Carbon::parse($data['batas_waktu'])->format('Y-m-d H:i:s');

            if (Schema::hasColumn('disposisis', 'kirim_notifikasi')) {
                $disposisi->kirim_notifikasi = $kirimNotifikasi;
            }

            $disposisi->save();

            $suratMasuk->status = 'terdisposisi';
            $suratMasuk->save();

            if ($kirimNotifikasi) {
                $this->notifyRecipients($disposisi, $suratMasuk);
            }

            return $disposisi;
        });

        return $this->withRelations($disposisi);
    }

    public function updateStatus(Disposisi $disposisi, string $status): Disposisi
    {
        DB::transaction(function () use ($disposisi, $status): void {
            $disposisi->status = $status;

            if ($disposisi->dibaca_at === null) {
                $disposisi->dibaca_at = now();
            }

            $disposisi->selesai_at = $status === 'selesai' ? now() : null;
            $disposisi->save();
        });

        return $this->withRelations($disposisi);
    }

    private function withRelations(Disposisi $disposisi): Disposisi
    {
        return $disposisi->load(['pemberi', 'penerima', 'unit', 'suratMasuk']);
    }

    private function notifyRecipients(Disposisi $disposisi, SuratMasuk $suratMasuk): void
    {
        $recipientIds = $disposisi->penerima_user_id !== null
            ? User::query()->whereKey((int) $disposisi->penerima_user_id)->pluck('id')
            : User::query()->where('unit_id', $disposisi->unit_id)->pluck('id');

        $pesan = sprintf(
            'Anda menerima disposisi %s untuk surat %s.',
            $this->instruksiLabel((string) $disposisi->instruksi),
            (string) $suratMasuk->nomor_surat,
        );

        foreach ($recipientIds as $recipientId) {
            $notification = new Notification;
            $notification->user_id = (int) $recipientId;
            $notification->disposisi_id = $disposisi->id;
            $notification->surat_masuk_id = $suratMasuk->id;
            $notification->judul = 'Disposisi baru untuk Anda';

            if (Schema::hasColumn('notifications', 'pesan')) {
                $notification->pesan = $pesan;
                $notification->status = 'unread';
                $notification->channel = 'web';
                $notification->sent_at = now();
            } else {
                $notification->deskripsi = $pesan;
                $notification->dibaca = false;
            }

            $notification->save();
        }
    }

    private function instruksiLabel(string $instruksi): string
    {
        return match ($instruksi) {
            'tindak_lanjut' => 'tindak lanjut',
            'koordinasikan' => 'koordinasikan',
            'untuk_diketahui' => 'untuk diketahui',
            default => $instruksi,
        };
    }
}
