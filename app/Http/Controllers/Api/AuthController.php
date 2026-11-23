<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\LoginRequest;
use App\Http\Resources\UserResource;
use App\Http\Support\ApiResponse;
use App\Http\Support\ApiTokenService;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function __construct(private readonly ApiTokenService $tokens) {}

    public function login(LoginRequest $request): JsonResponse
    {
        $user = User::query()
            ->with('unit')
            ->where('email', (string) $request->input('email'))
            ->first();

        if (! $user || ! Hash::check((string) $request->input('password'), (string) $user->password)) {
            return ApiResponse::error(
                'Email atau kata sandi salah.',
                ['email' => ['Kredensial yang diberikan tidak cocok.']],
                401,
            );
        }

        $token = $this->tokens->issue($user, $request->boolean('remember'));

        return ApiResponse::success([
            'user' => new UserResource($user),
            'token' => $token['token'],
            'token_type' => $token['token_type'],
            'expires_in' => $token['expires_in'],
        ], 'Login berhasil.');
    }

    public function logout(Request $request): JsonResponse
    {
        $this->tokens->revoke($request->bearerToken());

        return ApiResponse::success(null, 'Logout berhasil.');
    }

    public function me(Request $request): JsonResponse
    {
        $user = $request->user();
        $user->loadMissing('unit');

        return ApiResponse::success(new UserResource($user));
    }
}
