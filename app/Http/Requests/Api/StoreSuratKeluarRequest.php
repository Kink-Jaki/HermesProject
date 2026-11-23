<?php

namespace App\Http\Requests\Api;

use Illuminate\Validation\Rule;

class StoreSuratKeluarRequest extends ApiFormRequest
{
    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'nomor_surat' => ['required', 'string', 'max:255'],
            'tanggal_surat' => ['required', 'date'],
            'tujuan' => ['required', 'string', 'max:255'],
            'perihal' => ['required', 'string', 'max:255'],
            'ringkasan' => ['nullable', 'string'],
            'unit_id' => ['required', 'integer', Rule::exists('units', 'id')],
            'category_id' => ['required', 'integer', Rule::exists('categories', 'id')],
            'surat_masuk_id' => ['nullable', 'integer', Rule::exists('surat_masuks', 'id')],
            'status' => ['sometimes', Rule::in(['draft', 'terkirim', 'arsip'])],
            'soft_file' => ['nullable', 'file', 'mimes:pdf,jpg,jpeg,png', 'max:10240'],
            'lampirans' => ['nullable', 'array', 'max:10'],
            'lampirans.*' => ['file', 'mimes:pdf,jpg,jpeg,png', 'max:10240'],
            'lampiran_labels' => ['nullable', 'array', 'max:10'],
            'lampiran_labels.*' => ['nullable', 'string', 'max:255'],
        ];
    }
}
