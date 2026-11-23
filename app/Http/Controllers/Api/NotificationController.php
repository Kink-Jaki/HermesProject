<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\NotificationIndexRequest;
use App\Http\Resources\NotificationResource;
use App\Http\Support\ApiResponse;
use App\Http\Support\SchemaCompat;
use App\Models\Notification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function index(NotificationIndexRequest $request): JsonResponse
    {
        $baseQuery = Notification::query()->where('user_id', $request->user()->id);

        $unreadQuery = clone $baseQuery;
        SchemaCompat::unreadNotifications($unreadQuery);
        $unreadCount = $unreadQuery->count();

        $status = (string) $request->input('status', 'all');

        if ($status === 'unread') {
            SchemaCompat::unreadNotifications($baseQuery);
        } elseif ($status === 'read') {
            SchemaCompat::readNotifications($baseQuery);
        }

        $notifications = $baseQuery
            ->with('suratMasuk')
            ->orderByDesc('created_at')
            ->paginate((int) $request->input('per_page', 15))
            ->through(fn (Notification $notification) => new NotificationResource($notification));

        return ApiResponse::paginated($notifications, null, ['unread_count' => $unreadCount]);
    }

    public function readAll(Request $request): JsonResponse
    {
        $updated = SchemaCompat::markAllNotificationsRead((int) $request->user()->id);

        return ApiResponse::success(
            ['updated' => $updated],
            'Semua notifikasi telah ditandai dibaca.',
        );
    }
}
