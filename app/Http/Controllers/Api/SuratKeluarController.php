<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\StoreSuratKeluarRequest;
use App\Http\Requests\Api\SuratKeluarIndexRequest;
use App\Http\Requests\Api\UpdateSuratKeluarRequest;
use App\Http\Resources\SuratKeluarResource;
use App\Http\Support\ApiResponse;
use App\Models\SuratKeluar;
use App\Services\SuratKeluarService;
use Illuminate\Http\JsonResponse;

class SuratKeluarController extends Controller
{
    public function __construct(private readonly SuratKeluarService $service) {}

    public function index(SuratKeluarIndexRequest $request): JsonResponse
    {
        $paginator = $this->service->index($request->validated());

        return ApiResponse::paginated(
            $paginator->through(fn (SuratKeluar $suratKeluar) => new SuratKeluarResource($suratKeluar)),
        );
    }

    public function nextAgenda(): JsonResponse
    {
        return ApiResponse::success([
            'nomor_agenda' => $this->service->generateNextAgendaNumber(),
        ]);
    }

    public function store(StoreSuratKeluarRequest $request): JsonResponse
    {
        $suratKeluar = $this->service->create($request->validated(), $request->user());

        return ApiResponse::success(
            new SuratKeluarResource($suratKeluar),
            'Surat keluar berhasil disimpan.',
            null,
            201,
        );
    }

    public function show(int $id): JsonResponse
    {
        return ApiResponse::success(new SuratKeluarResource($this->service->find($id)));
    }

    public function update(UpdateSuratKeluarRequest $request, int $id): JsonResponse
    {
        $suratKeluar = $this->service->update($this->service->find($id), $request->validated());

        return ApiResponse::success(
            new SuratKeluarResource($suratKeluar),
            'Surat keluar berhasil diperbarui.',
        );
    }

    public function destroy(int $id): JsonResponse
    {
        $this->service->delete($this->service->find($id));

        return ApiResponse::success(null, 'Surat keluar berhasil dihapus.');
    }
}
