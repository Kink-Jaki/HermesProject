<?php

namespace App\Http\Support;

use App\Models\User;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;

final class ApiTokenService
{
    private const PREFIX = 'e-agenda:api-token:';

    public function issue(User $user, bool $remember = false): array
    {
        $token = Str::random(64);
        $expiresAt = $remember
            ? now()->addDays(7)
            : now()->addMinutes((int) config('session.lifetime', 120));

        Cache::put($this->key($token), $user->id, $expiresAt);

        return [
            'token' => $token,
            'token_type' => 'Bearer',
            'expires_in' => max(0, $expiresAt->getTimestamp() - now()->getTimestamp()),
        ];
    }

    public function userFor(?string $token): ?User
    {
        if (! $token) {
            return null;
        }

        $userId = Cache::get($this->key($token));

        if (! is_numeric($userId)) {
            return null;
        }

        return User::query()->with('unit')->find((int) $userId);
    }

    public function revoke(?string $token): void
    {
        if ($token) {
            Cache::forget($this->key($token));
        }
    }

    private function key(string $token): string
    {
        return self::PREFIX.hash('sha256', $token);
    }
}
