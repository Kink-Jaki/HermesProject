<?php

namespace App\Services;

use App\Http\Support\SchemaCompat;
use App\Models\Lampiran;
use App\Models\SuratMasuk;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Relations\Relation;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Throwable;

class SuratMasukService
{
    public function index(array $filters, int $perPage): LengthAwarePaginator
    {
        $query = $this->baseQuery();
        $this->applyCommonFilters($query, $filters);

        if (! empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        return $query->orderByDesc('tanggal_surat')
            ->orderByDesc('id')
            ->paginate($perPage);
    }

    /** @return array<string, int> */
    public function summary(array $filters): array
    {
        $query = $this->baseQuery();
        $this->applyCommonFilters($query, $filters);

        return [
            'total' => (clone $query)->count(),
            'baru' => (clone $query)->where('status', 'baru')->count(),
            'terdisposisi' => (clone $query)->where('status', 'terdisposisi')->count(),
            'selesai' => (clone $query)->where('status', 'selesai')->count(),
        ];
    }

    public function generateNomorAgenda(?int $year = null): string
    {
        $year ??= now()->year;
        $prefix = sprintf('SM-%d-', $year);
        $max = 0;

        SuratMasuk::query()
            ->where('nomor_agenda', 'like', $prefix.'%')
            ->pluck('nomor_agenda')
            ->each(function (mixed $nomorAgenda) use ($prefix, &$max): void {
                if (preg_match('/^'.preg_quote($prefix, '/').'(\d+)$/', (string) $nomorAgenda, $matches) === 1) {
                    $max = max($max, (int) $matches[1]);
                }
            });

        return $prefix.str_pad((string) ($max + 1), 4, '0', STR_PAD_LEFT);
    }

    public function store(array $data, ?UploadedFile $lampiran, int $userId): SuratMasuk
    {
        $data['nomor_agenda'] = ($data['nomor_agenda'] ?? null) ?: $this->generateNomorAgenda();
        $data['status'] = 'baru';
        $storedPaths = [];

        try {
            $suratMasuk = DB::transaction(function () use ($data, $lampiran, $userId, &$storedPaths): SuratMasuk {
                $suratMasuk = new SuratMasuk;
                $suratMasuk->user_id = $userId;
                $suratMasuk->nomor_agenda = $data['nomor_agenda'];
                $this->applyAttributes($suratMasuk, $data);
                $suratMasuk->save();

                if ($lampiran !== null) {
                    $storedPaths[] = $this->storeLampiran($suratMasuk, $lampiran);
                }

                return $suratMasuk;
            });
        } catch (Throwable $exception) {
            $this->deleteFiles($storedPaths);

            throw $exception;
        }

        return $this->detail((int) $suratMasuk->id);
    }

    public function detail(int $id): SuratMasuk
    {
        return SuratMasuk::query()
            ->with([
                'category',
                'pencatat.unit',
                'lampirans' => function (Relation $query): void {
                    if (Schema::hasColumn('lampirans', 'is_utama')) {
                        $query->orderByDesc('is_utama');
                    }

                    $query->orderBy('id');
                },
                'disposisis' => fn (Relation $query) => $query->with(['pemberi', 'penerima', 'unit'])
                    ->orderByDesc('created_at'),
                'saranDisposisis' => fn (Relation $query) => $query->with(['disarankanUser', 'disarankanUnit'])
                    ->orderBy('urutan'),
            ])
            ->findOrFail($id);
    }

    public function update(SuratMasuk $suratMasuk, array $data, ?UploadedFile $lampiran): SuratMasuk
    {
        $storedPaths = [];

        DB::transaction(function () use ($suratMasuk, $data, $lampiran, &$storedPaths): void {
            $this->applyAttributes($suratMasuk, $data);
            $suratMasuk->save();

            if ($lampiran === null) {
                return;
            }

            $lama = $this->mainLampiran($suratMasuk);

            if ($lama !== null) {
                $path = $this->lampiranPath($lama);

                if ($path !== null) {
                    Storage::disk('local')->delete($path);
                }

                $lama->delete();
            }

            $storedPaths[] = $this->storeLampiran($suratMasuk, $lampiran);
        });

        return $this->detail((int) $suratMasuk->id);
    }

    public function destroy(SuratMasuk $suratMasuk): void
    {
        DB::transaction(function () use ($suratMasuk): void {
            $paths = $suratMasuk->lampirans
                ->map(fn (Lampiran $lampiran) => $this->lampiranPath($lampiran))
                ->filter()
                ->all();

            $suratMasuk->lampirans()->delete();
            $suratMasuk->delete();
            $this->deleteFiles($paths);
        });
    }

    public function lampiranFor(SuratMasuk $suratMasuk, int $lampiranId): Lampiran
    {
        return $suratMasuk->lampirans()->findOrFail($lampiranId);
    }

    /** @return array{path: string, name: string, mime_type: string} */
    public function downloadData(Lampiran $lampiran): array
    {
        $relativePath = $this->lampiranPath($lampiran);
        $disk = Storage::disk('local');
        $absolutePath = $relativePath !== null ? $disk->path($relativePath) : null;
        $root = realpath($disk->path(''));
        $realPath = $absolutePath !== null ? realpath($absolutePath) : false;

        if (
            $relativePath === null
            || $realPath === false
            || $root === false
            || ! str_starts_with($realPath, $root.DIRECTORY_SEPARATOR)
            || ! $disk->exists($relativePath)
        ) {
            throw new NotFoundHttpException('File lampiran tidak ditemukan.');
        }

        return [
            'path' => $realPath,
            'name' => $lampiran->label ?? $lampiran->nama_file ?? basename($relativePath),
            'mime_type' => (string) ($lampiran->mime_type ?? 'application/octet-stream'),
        ];
    }

    private function baseQuery(): Builder
    {
        return SuratMasuk::query()->with(['category', 'pencatat']);
    }

    private function applyCommonFilters(Builder $query, array $filters): void
    {
        $search = trim((string) ($filters['search'] ?? ''));

        if ($search !== '') {
            $query->where(function (Builder $builder) use ($search): void {
                $builder->where('nomor_surat', 'like', "%{$search}%")
                    ->orWhere('perihal', 'like', "%{$search}%")
                    ->orWhere('pengirim', 'like', "%{$search}%");
            });
        }

        if (! empty($filters['urgensi'])) {
            $query->where(SchemaCompat::suratUrgensiColumn(), $filters['urgensi']);
        }

        if (! empty($filters['bulan'])) {
            $query->whereMonth('tanggal_surat', (int) $filters['bulan']);
        }

        if (! empty($filters['tahun'])) {
            $query->whereYear('tanggal_surat', (int) $filters['tahun']);
        }
    }

    private function applyAttributes(SuratMasuk $suratMasuk, array $data): void
    {
        foreach (['nomor_surat', 'tanggal_surat', 'tanggal_diterima', 'pengirim', 'perihal', 'category_id', 'status'] as $field) {
            if (array_key_exists($field, $data)) {
                $suratMasuk->{$field} = $data[$field];
            }
        }

        if (array_key_exists('urgensi', $data)) {
            $suratMasuk->{SchemaCompat::suratUrgensiColumn()} = $data['urgensi'];
        }

        if (array_key_exists('ringkasan', $data)) {
            $suratMasuk->{SchemaCompat::suratRingkasanColumn()} = $data['ringkasan'];
        }
    }

    private function storeLampiran(SuratMasuk $suratMasuk, UploadedFile $lampiran): string
    {
        $extension = strtolower($lampiran->getClientOriginalExtension() ?: ($lampiran->guessExtension() ?? 'bin'));
        $filename = sprintf(
            '%s-%s-%s.%s',
            Str::slug((string) $suratMasuk->nomor_agenda) ?: 'surat-masuk',
            now()->format('YmdHis'),
            Str::random(6),
            $extension,
        );
        $path = (string) Storage::disk('local')->putFileAs('lampiran/surat-masuk', $lampiran, $filename);

        $record = new Lampiran;
        $record->attachable_type = SuratMasuk::class;
        $record->attachable_id = $suratMasuk->id;
        $record->mime_type = $lampiran->getMimeType() ?? 'application/octet-stream';

        if (Schema::hasColumn('lampirans', 'path')) {
            $record->path = $path;
            $record->label = $lampiran->getClientOriginalName();

            if (Schema::hasColumn('lampirans', 'is_utama')) {
                $record->is_utama = true;
            }
        } else {
            $record->path_file = $path;
            $record->nama_file = $lampiran->getClientOriginalName();
            $record->ukuran = round($lampiran->getSize() / 1024, 2);
        }

        $record->save();

        return $path;
    }

    private function mainLampiran(SuratMasuk $suratMasuk): ?Lampiran
    {
        $lampirans = $suratMasuk->lampirans()->get();

        return $lampirans->first(fn (Lampiran $lampiran) => (bool) ($lampiran->is_utama ?? false)) ?? $lampirans->first();
    }

    private function lampiranPath(Lampiran $lampiran): ?string
    {
        $path = $lampiran->path ?? $lampiran->path_file ?? null;

        return is_string($path) && $path !== '' ? $path : null;
    }

    /** @param array<int, string> $paths */
    private function deleteFiles(array $paths): void
    {
        foreach ($paths as $path) {
            Storage::disk('local')->delete($path);
        }
    }
}
