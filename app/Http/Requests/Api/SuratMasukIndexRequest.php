<?php

namespace App\Http\Requests\Api;

use Illuminate\Validation\Rule;

class SuratMasukIndexRequest extends ApiFormRequest
{
    public function rules(): array
    {
        return [
            'search' => ['sometimes', 'nullable', 'string', 'max:100'],
            'status' => ['sometimes', 'nullable', Rule::in(['baru', 'terdisposisi', 'selesai'])],
            'urgensi' => ['sometimes', 'nullable', Rule::in(['biasa', 'segera', 'sangat_segera'])],
            'bulan' => ['sometimes', 'nullable', 'integer', 'min:1', 'max:12'],
            'tahun' => ['sometimes', 'nullable', 'integer', 'digits:4', 'min:1990', 'max:2100'],
            'per_page' => ['sometimes', 'integer', 'min:1', 'max:100'],
        ];
    }
}
