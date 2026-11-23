<?php

namespace App\Http\Requests\Api;

use Illuminate\Validation\Rule;

class UpdateDisposisiStatusRequest extends ApiFormRequest
{
    public function rules(): array
    {
        return [
            'status' => ['required', Rule::in(['diproses', 'selesai'])],
        ];
    }
}
