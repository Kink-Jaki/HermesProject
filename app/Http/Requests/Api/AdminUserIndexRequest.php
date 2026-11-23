<?php

namespace App\Http\Requests\Api;

use Illuminate\Validation\Rule;

class AdminUserIndexRequest extends MasterIndexRequest
{
    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return array_merge(parent::rules(), [
            'search' => ['sometimes', 'nullable', 'string', 'max:100'],
            'role' => ['sometimes', 'nullable', Rule::in(['super_admin', 'pimpinan', 'admin_surat', 'staf'])],
            'unit_id' => ['sometimes', 'nullable', 'integer', Rule::exists('units', 'id')],
        ]);
    }
}
