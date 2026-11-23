<?php

namespace App\Http\Requests\Api;

use Illuminate\Validation\Rule;

class UpdateSuratMasukRequest extends ApiFormRequest
{
    protected function prepareForValidation(): void
    {
        $urgensi = $this->input('urgensi') ?? $this->input('sifat');

        if (is_string($urgensi)) {
            $this->merge([
                'urgensi' => str_replace([' ', '-'], '_', strtolower(trim($urgensi))),
            ]);
        }
    }

    public function rules(): array
    {
        return [
            'nomor_surat' => ['sometimes', 'string', 'max:100'],
            'tanggal_surat' => ['sometimes', 'date'],
            'tanggal_diterima' => ['sometimes', 'date'],
            'pengirim' => ['sometimes', 'string', 'max:255'],
            'perihal' => ['sometimes', 'string', 'max:255'],
            'ringkasan' => ['sometimes', 'nullable', 'string', 'max:2000'],
            'urgensi' => ['sometimes', Rule::in(['biasa', 'segera', 'sangat_segera'])],
            'status' => ['sometimes', Rule::in(['baru', 'terdisposisi', 'selesai'])],
            'category_id' => ['sometimes', 'exists:categories,id'],
            'lampiran' => ['sometimes', 'file', 'mimes:pdf,jpg,jpeg,png', 'max:10240'],
            'file' => ['sometimes', 'file', 'mimes:pdf,jpg,jpeg,png', 'max:10240'],
        ];
    }
}
