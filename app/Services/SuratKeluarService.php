<?php

namespace App\Services;

use App\Models\Lampiran;
use App\Models\SuratKeluar;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection as EloquentCollection;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Throwable;

class SuratKeluarService
{
    /** @var array<int, string> */
    private const RELATIONS = ['unit', 'category', 'pencatat', 'suratMasukDibalas', 'lampirans'];

    /**
     * @param  array<string, mixed>  $filters
     */
    public function index(array $filters): LengthAwarePaginator
    {
        $query = SuratKeluar::query()->with(self::RELATIONS);

        $search = trim((string) ($filters['search'] ?? ''));

        if ($search !== '') {
            $query->where(function (Builder $builder) use ($search): void {
                $builder->where('nomor_surat', 'like', "%{$search}%")
                    ->orWhere('perihal', 'like', "%{$search}%")
                    ->orWhere('tujuan', 'like', "%{$search}%");
            });
        }

        if (! empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (! empty($filters['unit_id'])) {
            $query->where('unit_id', $filters['unit_id']);
        }

        if (! empty($filters['bulan'])) {
            $query->whereMonth('tanggal_surat', $filters['bulan']);
        }

        if (! empty($filters['tahun'])) {
            $query->whereYear('tanggal_surat', $filters['tahun']);
        }

        return $query->orderByDesc('tanggal_surat')
            ->orderByDesc('id')
            ->paginate((int) ($filters['per_page'] ?? 15));
    }

    public function find(int $id): SuratKeluar
    {
        return SuratKeluar::query()
            ->with(self::RELATIONS)
            ->findOrFail($id);
    }

    public function generateNextAgendaNumber(): string
    {
        return DB::transaction(fn (): string => $this->nextAgendaNumber(now()->year));
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function create(array $data, User $user): SuratKeluar
    {
        $newPaths = [];

        try {
            return DB::transaction(function () use ($data, $user, &$newPaths): SuratKeluar {
                $suratKeluar = $this->fillSuratKeluar(new SuratKeluar, [
                    'user_id' => $user->id,
                    'unit_id' => (int) $data['unit_id'],
                    'category_id' => (int) $data['category_id'],
                    'surat_masuk_id' => ! empty($data['surat_masuk_id']) ? (int) $data['surat_masuk_id'] : null,
                    'nomor_agenda' => $this->nextAgendaNumber(now()->year),
                    'nomor_surat' => (string) $data['nomor_surat'],
                    'tanggal_surat' => (string) $data['tanggal_surat'],
                    'tujuan' => (string) $data['tujuan'],
                    'perihal' => (string) $data['perihal'],
                    'ringkasan' => $data['ringkasan'] ?? null,
                    'status' => $data['status'] ?? 'draft',
                ]);

                $softFile = $data['soft_file'] ?? null;

                if ($softFile instanceof UploadedFile) {
                    $path = $this->storeFile($softFile, (string) $suratKeluar->nomor_agenda);
                    $newPaths[] = $path;
                    $suratKeluar->soft_file = $path;
                }

                $suratKeluar->save();

                $this->syncLampirans($suratKeluar, $data, $newPaths);

                return $suratKeluar->loadMissing(self::RELATIONS);
            });
        } catch (Throwable $exception) {
            $this->deleteFiles($newPaths);

            throw $exception;
        }
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function update(SuratKeluar $suratKeluar, array $data): SuratKeluar
    {
        $newPaths = [];
        $pathsToDelete = [];

        try {
            $updated = DB::transaction(function () use ($suratKeluar, $data, &$newPaths, &$pathsToDelete): SuratKeluar {
                $attributes = [];

                foreach (['unit_id', 'category_id', 'surat_masuk_id', 'nomor_surat', 'tanggal_surat', 'tujuan', 'perihal', 'ringkasan', 'status'] as $field) {
                    if (array_key_exists($field, $data)) {
                        $attributes[$field] = $data[$field];
                    }
                }

                $this->fillSuratKeluar($suratKeluar, $attributes);

                $softFile = $data['soft_file'] ?? null;

                if ($softFile instanceof UploadedFile) {
                    $path = $this->storeFile($softFile, (string) $suratKeluar->nomor_agenda);
                    $newPaths[] = $path;
                    $suratKeluar->soft_file = $path;

                    if (! empty($suratKeluar->getOriginal('soft_file'))) {
                        $pathsToDelete[] = (string) $suratKeluar->getOriginal('soft_file');
                    }
                }

                $this->removeLampirans($suratKeluar, $data, $pathsToDelete);

                $suratKeluar->save();

                $this->syncLampirans($suratKeluar, $data, $newPaths);

                return $suratKeluar->loadMissing(self::RELATIONS);
            });
        } catch (Throwable $exception) {
            $this->deleteFiles($newPaths);

            throw $exception;
        }

        $this->deleteFiles($pathsToDelete);

        return $updated;
    }

    public function delete(SuratKeluar $suratKeluar): void
    {
        $paths = $suratKeluar->lampirans()->pluck('path')->all();

        if (! empty($suratKeluar->soft_file)) {
            $paths[] = (string) $suratKeluar->soft_file;
        }

        DB::transaction(function () use ($suratKeluar): void {
            $suratKeluar->lampirans()->delete();
            $suratKeluar->delete();
        });

        $this->deleteFiles($paths);
    }

    private function nextAgendaNumber(int $year): string
    {
        $prefix = "SK-{$year}-";

        /** @var SuratKeluar|null $last */
        $last = SuratKeluar::query()
            ->where('nomor_agenda', 'like', $prefix.'%')
            ->orderByDesc('nomor_agenda')
            ->lockForUpdate()
            ->first();

        $sequence = $last === null
            ? 1
            : (int) substr((string) $last->nomor_agenda, strlen($prefix)) + 1;

        return $prefix.str_pad((string) $sequence, 4, '0', STR_PAD_LEFT);
    }

    /**
     * @param  array<string, mixed>  $attributes
     */
    private function fillSuratKeluar(SuratKeluar $suratKeluar, array $attributes): SuratKeluar
    {
        foreach ($attributes as $key => $value) {
            $suratKeluar->{$key} = $value;
        }

        return $suratKeluar;
    }

    private function storeFile(UploadedFile $file, string $nomorAgenda): string
    {
        return $file->store("surat-keluar/{$nomorAgenda}", 'public');
    }

    /**
     * @param  array<string, mixed>  $data
     * @param  array<int, string>  $newPaths
     */
    private function syncLampirans(SuratKeluar $suratKeluar, array $data, array &$newPaths): void
    {
        $files = [];
        $softFile = $data['soft_file'] ?? null;

        if ($softFile instanceof UploadedFile && ! empty($suratKeluar->soft_file)) {
            $files[] = [
                'file' => $softFile,
                'path' => (string) $suratKeluar->soft_file,
                'label' => $softFile->getClientOriginalName(),
                'is_utama' => true,
            ];
        }

        foreach ($data['lampirans'] ?? [] as $index => $file) {
            if (! $file instanceof UploadedFile) {
                continue;
            }

            $files[] = [
                'file' => $file,
                'label' => $data['lampiran_labels'][$index] ?? $file->getClientOriginalName(),
                'is_utama' => false,
            ];
        }

        foreach ($files as $file) {
            /** @var UploadedFile $uploadedFile */
            $uploadedFile = $file['file'];
            $path = $file['path'] ?? null;

            if ($path === null) {
                $path = $this->storeFile($uploadedFile, (string) $suratKeluar->nomor_agenda);
                $newPaths[] = $path;
            }

            $lampiran = new Lampiran;
            $lampiran->attachable_type = $suratKeluar->getMorphClass();
            $lampiran->attachable_id = $suratKeluar->id;
            $lampiran->path = $path;
            $lampiran->mime_type = (string) $uploadedFile->getClientMimeType();
            $lampiran->label = (string) $file['label'];
            $lampiran->is_utama = (bool) $file['is_utama'];
            $lampiran->save();
        }
    }

    /**
     * @param  array<string, mixed>  $data
     * @param  array<int, string>  $pathsToDelete
     */
    private function removeLampirans(SuratKeluar $suratKeluar, array $data, array &$pathsToDelete): void
    {
        if (empty($data['hapus_lampiran_ids'])) {
            return;
        }

        $ids = array_map('intval', $data['hapus_lampiran_ids']);

        /** @var EloquentCollection<int, Lampiran> $lampirans */
        $lampirans = $suratKeluar->lampirans()->whereIn('id', $ids)->get();

        foreach ($lampirans as $lampiran) {
            if (! empty($lampiran->path)) {
                $pathsToDelete[] = (string) $lampiran->path;
            }

            $lampiran->delete();
        }
    }

    /**
     * @param  array<int, string>  $paths
     */
    private function deleteFiles(array $paths): void
    {
        $paths = array_values(array_unique(array_filter($paths)));

        if ($paths !== []) {
            Storage::disk('public')->delete($paths);
        }
    }
}
