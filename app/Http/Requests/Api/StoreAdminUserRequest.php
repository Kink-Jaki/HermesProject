<?php

namespace App\Http\Requests\Api;

use Illuminate\Validation\Rule;

class StoreAdminUserRequest extends ApiFormRequest
{
    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', Rule::unique('users', 'email')],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
            'role' => ['required', Rule::in(['super_admin', 'pimpinan', 'admin_surat', 'staf'])],
            'unit_id' => ['nullable', 'integer', Rule::exists('units', 'id')],
            'jabatan' => ['nullable', 'string', 'max:100'],
            'no_wa' => ['nullable', 'string', 'max:20'],
        ];
    }
}
