<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\StoreSuratMasukRequest;
use App\Http\Requests\Api\SuratMasukIndexRequest;
use App\Http\Requests\Api\UpdateSuratMasukRequest;
use App\Http\Resources\SuratMasukDetailResource;
use App\Http\Resources\SuratMasukResource;
use App\Http\Support\ApiResponse;
use App\Models\SuratMasuk;
use App\Services\SuratMasukService;
use Illuminate\Http\JsonResponse;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class SuratMasukController extends Controller
{
    public function __construct(private readonly SuratMasukService $service) {}

    public function index(SuratMasukIndexRequest $request): JsonResponse
    {
        $filters = $request->validated();
        $suratMasuks = $this->service->index($filters, (int) ($filters['per_page'] ?? 15));
        $suratMasuks->through(fn (SuratMasuk $suratMasuk) => new SuratMasukResource($suratMasuk));

        return ApiResponse::paginated($suratMasuks, null, [
            'summary' => $this->service->summary($filters),
        ]);
    }

    public function nextAgenda(): JsonResponse
    {
        return ApiResponse::success([
            'nomor_agenda' => $this->service->generateNomorAgenda(),
        ]);
    }

    public function store(StoreSuratMasukRequest $request): JsonResponse
    {
        $suratMasuk = $this->service->store(
            $request->validated(),
            $request->file('lampiran') ?? $request->file('file'),
            (int) $request->user()->id,
        );

        return ApiResponse::success(
            new SuratMasukDetailResource($suratMasuk),
            'Surat masuk berhasil disimpan.',
            null,
            201,
        );
    }

    public function show(int $id): JsonResponse
    {
        return ApiResponse::success(new SuratMasukDetailResource($this->service->detail($id)));
    }

    public function update(int $id, UpdateSuratMasukRequest $request): JsonResponse
    {
        $suratMasuk = SuratMasuk::findOrFail($id);
        $suratMasuk = $this->service->update(
            $suratMasuk,
            $request->validated(),
            $request->file('lampiran') ?? $request->file('file'),
        );

        return ApiResponse::success(new SuratMasukDetailResource($suratMasuk), 'Surat masuk berhasil diperbarui.');
    }

    public function destroy(int $id): JsonResponse
    {
        $this->service->destroy(SuratMasuk::findOrFail($id));

        return ApiResponse::success(null, 'Surat masuk berhasil dihapus.');
    }

    public function download(int $id, int $lampiranId): BinaryFileResponse
    {
        $lampiran = $this->service->lampiranFor(SuratMasuk::findOrFail($id), $lampiranId);
        $data = $this->service->downloadData($lampiran);

        return response()->download($data['path'], $data['name'], [
            'Content-Type' => $data['mime_type'],
        ]);
    }
}
