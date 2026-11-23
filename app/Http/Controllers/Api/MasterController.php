<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\MasterIndexRequest;
use App\Http\Requests\Api\UserIndexRequest;
use App\Http\Resources\CategoryResource;
use App\Http\Resources\UnitResource;
use App\Http\Resources\UserResource;
use App\Http\Support\ApiResponse;
use App\Models\Category;
use App\Models\Unit;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;

class MasterController extends Controller
{
    public function units(MasterIndexRequest $request): JsonResponse
    {
        $query = Unit::query()->orderBy('nama');
        $perPage = (int) $request->input('per_page', 0);

        if ($perPage > 0) {
            return ApiResponse::paginated(
                $query->paginate($perPage)->through(fn (Unit $unit) => new UnitResource($unit)),
            );
        }

        $units = $query->get();

        return ApiResponse::success(UnitResource::collection($units), null, ['total' => $units->count()]);
    }

    public function categories(MasterIndexRequest $request): JsonResponse
    {
        $query = Category::query()->orderBy('nama');
        $perPage = (int) $request->input('per_page', 0);

        if ($perPage > 0) {
            return ApiResponse::paginated(
                $query->paginate($perPage)->through(fn (Category $category) => new CategoryResource($category)),
            );
        }

        $categories = $query->get();

        return ApiResponse::success(
            CategoryResource::collection($categories),
            null,
            ['total' => $categories->count()],
        );
    }

    public function users(UserIndexRequest $request): JsonResponse
    {
        $query = User::query()->with('unit');

        if ($search = trim((string) $request->input('search'))) {
            $query->where(function (Builder $builder) use ($search): void {
                $builder->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        if ($unitId = $request->input('unit_id')) {
            $query->where('unit_id', $unitId);
        }

        if ($role = $request->input('role')) {
            $query->where('role', $role);
        }

        $users = $query->orderBy('name')
            ->paginate((int) $request->input('per_page', 15))
            ->through(fn (User $user) => new UserResource($user));

        return ApiResponse::paginated($users);
    }
}
