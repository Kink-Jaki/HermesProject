<?php

namespace App\Http\Support;

use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Http\JsonResponse;

final class ApiResponse
{
    public static function success(mixed $data = null, ?string $message = null, ?array $meta = null, int $status = 200): JsonResponse
    {
        $payload = ['data' => $data];

        if ($meta !== null) {
            $payload['meta'] = $meta;
        }

        if ($message !== null) {
            $payload['message'] = $message;
        }

        return response()->json($payload, $status);
    }

    public static function paginated(LengthAwarePaginator $paginator, ?string $message = null, array $extraMeta = []): JsonResponse
    {
        return self::success(
            $paginator->items(),
            $message,
            array_merge([
                'current_page' => $paginator->currentPage(),
                'last_page' => $paginator->lastPage(),
                'per_page' => $paginator->perPage(),
                'total' => $paginator->total(),
            ], $extraMeta),
        );
    }

    public static function error(string $message, ?array $errors = null, int $status = 400): JsonResponse
    {
        $payload = ['message' => $message];

        if ($errors !== null) {
            $payload['errors'] = $errors;
        }

        return response()->json($payload, $status);
    }
}
