<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class NotificationSeeder extends Seeder
{
    public function run(): void
    {
        $userId = fn (string $email) => DB::table('users')->where('email', $email)->value('id');
        $disposisiId = fn (string $catatan) => DB::table('disposisis')->where('catatan', $catatan)->value('id');
        $suratMasukId = fn (string $agenda) => DB::table('surat_masuks')->where('nomor_agenda', $agenda)->value('id');

        $notifications = [
            [
                'user_id' => $userId('admin.surat@instansi.go.id'),
                'disposisi_id' => null,
                'surat_masuk_id' => $suratMasukId('SM-2025-0248'),
                'judul' => 'Surat masuk baru',
                'pesan' => 'Surat SM-2025-0248 dari Pemerintah Kabupaten Tulungagung telah dicatat dan menunggu disposisi.',
                'status' => 'unread',
                'channel' => 'web',
                'provider_message_id' => null,
                'menit' => 5,
            ],
            [
                'user_id' => $userId('pimpinan@instansi.go.id'),
                'disposisi_id' => null,
                'surat_masuk_id' => $suratMasukId('SM-2025-0245'),
                'judul' => 'Surat sangat segera',
                'pesan' => 'Surat SM-2025-0245 dari Dinas Kesehatan Kabupaten Tulungagung berstatus sangat segera.',
                'status' => 'unread',
                'channel' => 'web',
                'provider_message_id' => null,
                'menit' => 12,
            ],
            [
                'user_id' => $userId('staf.umum@instansi.go.id'),
                'disposisi_id' => $disposisiId('Mohon disiapkan agenda dan ruang rapat koordinasi Hari Kemerdekaan.'),
                'surat_masuk_id' => $suratMasukId('SM-2025-0248'),
                'judul' => 'Disposisi baru untuk Anda',
                'pesan' => 'Anda menerima disposisi tindak lanjut untuk surat SM-2025-0248.',
                'status' => 'unread',
                'channel' => 'web',
                'provider_message_id' => null,
                'menit' => 18,
            ],
            [
                'user_id' => $userId('staf.keuangan@instansi.go.id'),
                'disposisi_id' => $disposisiId('Mohon koordinasikan anggaran konsumsi dan logistik kegiatan.'),
                'surat_masuk_id' => $suratMasukId('SM-2025-0248'),
                'judul' => 'Disposisi baru untuk Anda',
                'pesan' => 'Anda menerima disposisi koordinasikan untuk surat SM-2025-0248.',
                'status' => 'unread',
                'channel' => 'whatsapp',
                'provider_message_id' => 'wa-20250519-0001',
                'menit' => 25,
            ],
            [
                'user_id' => $userId('staf.pemerintahan@instansi.go.id'),
                'disposisi_id' => $disposisiId('Sosialisasikan surat edaran ke seluruh bagian dan laporkan hasilnya.'),
                'surat_masuk_id' => $suratMasukId('SM-2025-0244'),
                'judul' => 'Disposisi menunggu tindak lanjut',
                'pesan' => 'Disposisi untuk surat SM-2025-0244 masih berstatus diproses.',
                'status' => 'unread',
                'channel' => 'web',
                'provider_message_id' => null,
                'menit' => 40,
            ],
            [
                'user_id' => $userId('pimpinan@instansi.go.id'),
                'disposisi_id' => $disposisiId('Verifikasi dokumen pencairan dan teruskan ke Bagian Keuangan.'),
                'surat_masuk_id' => $suratMasukId('SM-2025-0247'),
                'judul' => 'Disposisi selesai diproses',
                'pesan' => 'Disposisi untuk surat SM-2025-0247 telah selesai diproses.',
                'status' => 'read',
                'channel' => 'web',
                'provider_message_id' => null,
                'menit' => 180,
            ],
            [
                'user_id' => $userId('staf.organisasi@instansi.go.id'),
                'disposisi_id' => $disposisiId('Pelajari petunjuk teknis dan siapkan rencana implementasi.'),
                'surat_masuk_id' => $suratMasukId('SM-2025-0246'),
                'judul' => 'Disposisi ditandai selesai',
                'pesan' => 'Disposisi untuk surat SM-2025-0246 telah ditandai selesai.',
                'status' => 'read',
                'channel' => 'web',
                'provider_message_id' => null,
                'menit' => 1440,
            ],
        ];

        foreach ($notifications as $notification) {
            $menit = $notification['menit'];
            unset($notification['menit']);

            $exists = DB::table('notifications')
                ->where('user_id', $notification['user_id'])
                ->where('judul', $notification['judul'])
                ->where('pesan', $notification['pesan'])
                ->exists();

            if ($exists) {
                continue;
            }

            $waktu = now()->subMinutes($menit);

            DB::table('notifications')->insert(array_merge($notification, [
                'sent_at' => $waktu,
                'created_at' => $waktu,
                'updated_at' => $waktu,
            ]));
        }
    }
}
