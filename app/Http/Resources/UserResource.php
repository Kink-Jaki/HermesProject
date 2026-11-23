<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $role = (string) ($this->role ?? 'staf');

        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'jabatan' => $this->jabatan ?? 'Staf',
            'no_wa' => $this->no_wa ?? null,
            'role' => $role,
            'role_label' => $this->roleLabel($role),
            'unit_id' => $this->unit_id ?? null,
            'unit' => $this->whenLoaded('unit', fn () => new UnitResource($this->unit), null),
        ];
    }

    private function roleLabel(string $role): string
    {
        return match ($role) {
            'super_admin' => 'Super Admin',
            'pimpinan' => 'Pimpinan',
            'admin_surat' => 'Admin Surat',
            default => 'Staf',
        };
    }
}
