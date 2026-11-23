<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\AdminUserIndexRequest;
use App\Http\Requests\Api\StoreAdminUserRequest;
use App\Http\Requests\Api\UpdateAdminUserRequest;
use App\Http\Resources\UserResource;
use App\Http\Support\ApiResponse;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UserManagementController extends Controller
{
    public function index(AdminUserIndexRequest $request): JsonResponse
    {
        $query = User::query()->with('unit');

        $search = trim((string) $request->input('search'));

        if ($search !== '') {
            $query->where(function (Builder $builder) use ($search): void {
                $builder->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('jabatan', 'like', "%{$search}%");
            });
        }

        if ($role = $request->input('role')) {
            $query->where('role', $role);
        }

        if ($unitId = $request->input('unit_id')) {
            $query->where('unit_id', $unitId);
        }

        $paginator = $query->orderBy('name')
            ->paginate((int) $request->input('per_page', 15))
            ->through(fn (User $user) => new UserResource($user));

        return ApiResponse::paginated($paginator);
    }

    public function store(StoreAdminUserRequest $request): JsonResponse
    {
        $user = $this->fillUser(new User, $request->validated());
        $user->save();

        return ApiResponse::success(
            new UserResource($user->loadMissing('unit')),
            'Pengguna berhasil ditambahkan.',
            null,
            201,
        );
    }

    public function update(UpdateAdminUserRequest $request, int $id): JsonResponse
    {
        $user = User::query()->findOrFail($id);
        $this->fillUser($user, $request->validated());
        $user->save();

        return ApiResponse::success(
            new UserResource($user->loadMissing('unit')),
            'Pengguna berhasil diperbarui.',
        );
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        if ((int) $request->user()->id === $id) {
            return ApiResponse::error(
                'Anda tidak dapat menghapus akun Anda sendiri.',
                ['id' => ['Akun yang sedang digunakan tidak dapat dihapus.']],
                422,
            );
        }

        $user = User::query()->findOrFail($id);
        $user->delete();

        return ApiResponse::success(null, 'Pengguna berhasil dihapus.');
    }

    /**
     * @param  array<string, mixed>  $data
     */
    private function fillUser(User $user, array $data): User
    {
        foreach ($data as $key => $value) {
            if ($key === 'password') {
                if ($value !== null && $value !== '') {
                    $user->password = Hash::make((string) $value);
                }

                continue;
            }

            $user->{$key} = $value;
        }

        return $user;
    }
}
