<?php

namespace App\Http\Support;

use App\Models\Notification;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\Schema;

final class SchemaCompat
{
    public static function suratUrgensiColumn(): string
    {
        return Schema::hasColumn('surat_masuks', 'urgensi') ? 'urgensi' : 'sifat';
    }

    public static function suratRingkasanColumn(): string
    {
        return Schema::hasColumn('surat_masuks', 'ringkasan') ? 'ringkasan' : 'asal_surat';
    }

    public static function unreadNotifications(Builder $query): Builder
    {
        return Schema::hasColumn('notifications', 'status')
            ? $query->where('status', 'unread')
            : $query->where('dibaca', false);
    }

    public static function readNotifications(Builder $query): Builder
    {
        return Schema::hasColumn('notifications', 'status')
            ? $query->where('status', 'read')
            : $query->where('dibaca', true);
    }

    public static function markAllNotificationsRead(int $userId): int
    {
        if (Schema::hasColumn('notifications', 'status')) {
            return Notification::query()
                ->where('user_id', $userId)
                ->where('status', 'unread')
                ->update(['status' => 'read']);
        }

        return Notification::query()
            ->where('user_id', $userId)
            ->where('dibaca', false)
            ->update([
                'dibaca' => true,
                'dibaca_pada' => now(),
            ]);
    }
}
