<?php

namespace App\Http\Requests\Api;

use App\Http\Support\ApiResponse;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\ValidationException;

abstract class ApiFormRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function failedValidation(Validator $validator): void
    {
        throw new ValidationException(
            $validator,
            ApiResponse::error('Validasi gagal.', $validator->errors()->toArray(), 422),
        );
    }
}
