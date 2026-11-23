<?php

namespace App\Http\Requests\Api;

use Illuminate\Validation\Rule;

class NotificationIndexRequest extends ApiFormRequest
{
    public function rules(): array
    {
        return [
            'status' => ['sometimes', 'string', Rule::in(['unread', 'read', 'all'])],
            'per_page' => ['sometimes', 'integer', 'min:1', 'max:100'],
        ];
    }
}
