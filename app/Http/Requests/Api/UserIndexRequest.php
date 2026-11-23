<?php

namespace App\Http\Requests\Api;

use Illuminate\Validation\Rule;

class UserIndexRequest extends MasterIndexRequest
{
    public function rules(): array
    {
        return array_merge(parent::rules(), [
            'search' => ['sometimes', 'nullable', 'string', 'max:100'],
            'unit_id' => ['sometimes', 'nullable', 'integer'],
            'role' => ['sometimes', 'nullable', Rule::in(['super_admin', 'pimpinan', 'admin_surat', 'staf'])],
        ]);
    }
}
