<?php

namespace App\Http\Requests\Api;

use Illuminate\Validation\Rule;

class UpdateAdminUserRequest extends ApiFormRequest
{
    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'name' => ['sometimes', 'string', 'max:255'],
            'email' => ['sometimes', 'email', 'max:255', Rule::unique('users', 'email')->ignore($this->route('id'))],
            'password' => ['sometimes', 'nullable', 'string', 'min:8', 'confirmed'],
            'role' => ['sometimes', Rule::in(['super_admin', 'pimpinan', 'admin_surat', 'staf'])],
            'unit_id' => ['sometimes', 'nullable', 'integer', Rule::exists('units', 'id')],
            'jabatan' => ['sometimes', 'nullable', 'string', 'max:100'],
            'no_wa' => ['sometimes', 'nullable', 'string', 'max:20'],
        ];
    }
}
