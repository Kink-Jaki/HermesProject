<?php

namespace App\Http\Requests\Api;

use Illuminate\Validation\Rule;

class StoreSuratMasukRequest extends ApiFormRequest
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
            'nomor_agenda' => ['sometimes', 'nullable', 'string', 'max:50', 'unique:surat_masuks,nomor_agenda'],
            'nomor_surat' => ['required', 'string', 'max:100'],
            'tanggal_surat' => ['required', 'date'],
            'tanggal_diterima' => ['required', 'date'],
            'pengirim' => ['required', 'string', 'max:255'],
            'perihal' => ['required', 'string', 'max:255'],
            'ringkasan' => ['sometimes', 'nullable', 'string', 'max:2000'],
            'urgensi' => ['required', Rule::in(['biasa', 'segera', 'sangat_segera'])],
            'category_id' => ['required', 'exists:categories,id'],
            'lampiran' => ['required_without:file', 'file', 'mimes:pdf,jpg,jpeg,png', 'max:10240'],
            'file' => ['required_without:lampiran', 'file', 'mimes:pdf,jpg,jpeg,png', 'max:10240'],
        ];
    }
}
