<?php

namespace App\Http\Requests\Api;

use Illuminate\Contracts\Validation\Validator;
use Illuminate\Validation\Rule;

class StoreDisposisiRequest extends ApiFormRequest
{
    public function rules(): array
    {
        return [
            'unit_id' => ['nullable', 'exists:units,id'],
            'penerima_user_id' => ['nullable', 'exists:users,id'],
            'instruksi' => ['required', Rule::in(['tindak_lanjut', 'koordinasikan', 'untuk_diketahui'])],
            'catatan' => ['sometimes', 'nullable', 'string', 'max:2000'],
            'prioritas' => ['required', Rule::in(['biasa', 'segera', 'sangat_segera'])],
            'batas_waktu' => ['required', 'date'],
            'kirim_notifikasi' => ['sometimes', 'boolean'],
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator): void {
            $unitId = $this->input('unit_id');
            $penerimaUserId = $this->input('penerima_user_id');

            if (($unitId === null) === ($penerimaUserId === null)) {
                $validator->errors()->add('tujuan', 'Pilih salah satu antara unit_id atau penerima_user_id.');
            }
        });
    }
}
