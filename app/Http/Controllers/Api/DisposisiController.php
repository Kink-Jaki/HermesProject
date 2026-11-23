<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\StoreDisposisiRequest;
use App\Http\Requests\Api\UpdateDisposisiStatusRequest;
use App\Http\Resources\DisposisiResource;
use App\Http\Support\ApiResponse;
use App\Models\Disposisi;
use App\Models\SuratMasuk;
use App\Services\DisposisiService;
use Illuminate\Http\JsonResponse;

class DisposisiController extends Controller
{
    public function __construct(private readonly DisposisiService $service) {}

    public function store(int $id, StoreDisposisiRequest $request): JsonResponse
    {
        $disposisi = $this->service->store(
            SuratMasuk::findOrFail($id),
            $request->validated(),
            (int) $request->user()->id,
        );

        return ApiResponse::success(new DisposisiResource($disposisi), 'Disposisi berhasil dikirim.', null, 201);
    }

    public function updateStatus(int $id, UpdateDisposisiStatusRequest $request): JsonResponse
    {
        $disposisi = $this->service->updateStatus(
            Disposisi::findOrFail($id),
            (string) $request->validated('status'),
        );

        return ApiResponse::success(new DisposisiResource($disposisi), 'Status disposisi berhasil diperbarui.');
    }
}
