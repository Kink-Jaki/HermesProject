<?php

namespace App\Http\Middleware;

use App\Http\Support\ApiResponse;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

final class EnsureRole
{
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();

        if (! $user) {
            return ApiResponse::error('Autentikasi diperlukan.', null, 401);
        }

        $role = (string) ($user->role ?? 'staf');

        if (! in_array($role, $roles, true) && $role !== 'super_admin') {
            return ApiResponse::error(
                'Anda tidak memiliki akses untuk sumber daya ini.',
                ['role' => ["Role {$role} tidak diizinkan."]],
                403,
            );
        }

        return $next($request);
    }
}
