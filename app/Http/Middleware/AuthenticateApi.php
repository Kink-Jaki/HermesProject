<?php

namespace App\Http\Middleware;

use App\Http\Support\ApiResponse;
use App\Http\Support\ApiTokenService;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

final class AuthenticateApi
{
    public function __construct(private readonly ApiTokenService $tokens) {}

    public function handle(Request $request, Closure $next): Response
    {
        $user = $this->tokens->userFor($request->bearerToken());

        if (! $user) {
            return ApiResponse::error(
                'Autentikasi diperlukan atau token tidak valid.',
                ['token' => ['Token Bearer tidak ditemukan atau tidak valid.']],
                401,
            );
        }

        $request->setUserResolver(fn () => $user);
        auth()->setUser($user);

        return $next($request);
    }
}
