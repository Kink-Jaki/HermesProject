<?php

namespace App\Http\Requests\Api;

use Illuminate\Validation\Rule;

class UpdateSuratKeluarRequest extends ApiFormRequest
{
    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'nomor_surat' => ['sometimes', 'string', 'max:255'],
            'tanggal_surat' => ['sometimes', 'date'],
            'tujuan' => ['sometimes', 'string', 'max:255'],
            'perihal' => ['sometimes', 'string', 'max:255'],
            'ringkasan' => ['sometimes', 'nullable', 'string'],
            'unit_id' => ['sometimes', 'integer', Rule::exists('units', 'id')],
            'category_id' => ['sometimes', 'integer', Rule::exists('categories', 'id')],
            'surat_masuk_id' => ['sometimes', 'nullable', 'integer', Rule::exists('surat_masuks', 'id')],
            'status' => ['sometimes', Rule::in(['draft', 'terkirim', 'arsip'])],
            'soft_file' => ['sometimes', 'nullable', 'file', 'mimes:pdf,jpg,jpeg,png', 'max:10240'],
            'lampirans' => ['sometimes', 'nullable', 'array', 'max:10'],
            'lampirans.*' => ['file', 'mimes:pdf,jpg,jpeg,png', 'max:10240'],
            'lampiran_labels' => ['sometimes', 'nullable', 'array', 'max:10'],
            'lampiran_labels.*' => ['nullable', 'string', 'max:255'],
            'hapus_lampiran_ids' => ['sometimes', 'nullable', 'array', 'max:10'],
            'hapus_lampiran_ids.*' => ['integer'],
        ];
    }
}
