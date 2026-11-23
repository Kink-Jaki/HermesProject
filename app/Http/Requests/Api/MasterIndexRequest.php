<?php

namespace App\Http\Requests\Api;

class MasterIndexRequest extends ApiFormRequest
{
    public function rules(): array
    {
        return [
            'per_page' => ['sometimes', 'integer', 'min:1', 'max:100'],
        ];
    }
}
