<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\DashboardResource;
use App\Http\Resources\SuratMasukResource;
use App\Http\Support\ApiResponse;
use App\Http\Support\SchemaCompat;
use App\Models\SuratKeluar;
use App\Models\SuratMasuk;
use Illuminate\Http\JsonResponse;

class DashboardController extends Controller
{
    public function __invoke(): JsonResponse
    {
        $perluPerhatian = SuratMasuk::query()
            ->with(['category', 'pencatat'])
            ->whereIn(SchemaCompat::suratUrgensiColumn(), [
                'segera', 'sangat_segera', 'sangat segera', 'Segera', 'Sangat Segera',
            ])
            ->where('status', '!=', 'selesai')
            ->orderByDesc('tanggal_surat')
            ->orderByDesc('id')
            ->limit(5)
            ->get();

        $terbaru = SuratMasuk::query()
            ->with(['category', 'pencatat'])
            ->orderByDesc('tanggal_surat')
            ->orderByDesc('id')
            ->limit(5)
            ->get();

        return ApiResponse::success(
            new DashboardResource([
                'metrics' => $this->metrics(),
                'statistik' => $this->statistik(),
                'perlu_perhatian' => SuratMasukResource::collection($perluPerhatian),
                'surat_masuk_terbaru' => SuratMasukResource::collection($terbaru),
            ]),
            null,
            ['generated_at' => now()->toIso8601String()],
        );
    }

    private function metrics(): array
    {
        return [
            'surat_masuk' => SuratMasuk::query()->count(),
            'surat_keluar' => SuratKeluar::query()->count(),
            'menunggu_disposisi' => SuratMasuk::query()->where('status', 'baru')->count(),
            'selesai_diproses' => SuratMasuk::query()->where('status', 'selesai')->count(),
        ];
    }

    private function statistik(): array
    {
        $statistik = [];

        for ($i = 5; $i >= 0; $i--) {
            $awal = now()->startOfMonth()->subMonths($i);
            $akhir = $awal->copy()->endOfMonth();
            $dari = $awal->toDateString();
            $sampai = $akhir->toDateString();

            $statistik[] = [
                'bulan' => $awal->format('Y-m'),
                'label' => $awal->copy()->locale('id')->shortMonthName,
                'masuk' => SuratMasuk::query()->whereBetween('tanggal_surat', [$dari, $sampai])->count(),
                'keluar' => SuratKeluar::query()->whereBetween('tanggal_surat', [$dari, $sampai])->count(),
            ];
        }

        return $statistik;
    }
}
