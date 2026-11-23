<?php

namespace App\Http\Requests\Api;

use Illuminate\Validation\Rule;

class SuratKeluarIndexRequest extends MasterIndexRequest
{
    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return array_merge(parent::rules(), [
            'search' => ['sometimes', 'nullable', 'string', 'max:100'],
            'status' => ['sometimes', 'nullable', Rule::in(['draft', 'terkirim', 'arsip'])],
            'unit_id' => ['sometimes', 'nullable', 'integer', Rule::exists('units', 'id')],
            'bulan' => ['sometimes', 'nullable', 'integer', 'min:1', 'max:12'],
            'tahun' => ['sometimes', 'nullable', 'integer', 'min:2000', 'max:2100'],
        ]);
    }
}
