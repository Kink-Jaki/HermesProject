import { firstNumber, firstString, firstValue, isRecord, toArray, unwrapEnvelope } from '../lib/guards';
import type { PaginationMeta } from '../types';
import { request } from './http';

export type UserRoleValue = 'super_admin' | 'admin_surat' | 'pimpinan' | 'staf' | string;

export interface ManagedUser {
    id: string | number;
    name: string;
    email: string;
    jabatan: string;
    unit: string;
    unitId: string | number | null;
    noWa: string;
    role: UserRoleValue;
    roleLabel: string;
}

export interface UserListResponse {
    items: ManagedUser[];
    meta: PaginationMeta;
}

export interface UserFilters {
    search: string;
    unitId: string;
    role: string;
    page: number;
    perPage: number;
}

export interface UserPayload {
    name: string;
    email: string;
    password: string;
    jabatan: string;
    unit_id: string;
    no_wa: string;
    role: string;
}

export interface UserOption {
    value: string;
    label: string;
}

function roleLabel(role: string): string {
    const map: Record<string, string> = {
        super_admin: 'Super Admin',
        admin_surat: 'Admin Surat',
        pimpinan: 'Pimpinan',
        staf: 'Staf',
    };
    return map[role] ?? role.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function normalizeUser(raw: unknown, index: number): ManagedUser {
    const source = isRecord(raw) ? raw : {};
    const idValue = firstValue(source, ['id', 'user_id', 'uuid']);
    const unit = firstValue(source, ['unit']);
    const unitId = firstValue(source, ['unit_id', 'unitId']);
    const role = firstString(source, ['role', 'role_name'], 'staf');

    return {
        id: typeof idValue === 'string' || typeof idValue === 'number' ? idValue : `user-${index}`,
        name: firstString(source, ['name', 'nama', 'full_name'], 'Pengguna'),
        email: firstString(source, ['email'], '-'),
        jabatan: firstString(source, ['jabatan', 'position', 'title'], '-'),
        unit: firstString(source, ['unit_name', 'nama_unit'], isRecord(unit) ? firstString(unit, ['nama', 'name'], '-') : '-'),
        unitId: typeof unitId === 'string' || typeof unitId === 'number' ? unitId : isRecord(unit) ? (firstValue(unit, ['id']) as string | number | null) ?? null : null,
        noWa: firstString(source, ['no_wa', 'noWa', 'wa', 'phone', 'telepon'], '-'),
        role,
        roleLabel: firstString(source, ['role_label', 'roleLabel'], '') || roleLabel(role),
    };
}

export async function fetchUsers(filters: UserFilters): Promise<UserListResponse> {
    const params = new URLSearchParams();
    params.set('page', String(filters.page));
    params.set('per_page', String(filters.perPage));
    if (filters.search.trim() !== '') params.set('search', filters.search.trim());
    if (filters.unitId !== '') params.set('unit_id', filters.unitId);
    if (filters.role !== '') params.set('role', filters.role);

    const payload = await request<unknown>(`/api/admin/users?${params.toString()}`);
    const data = unwrapEnvelope(payload);
    const itemsRaw = Array.isArray(data) ? data : toArray(data, ['users', 'items', 'data']);
    const items = itemsRaw.map(normalizeUser);
    const metaSource = isRecord(payload) ? firstValue(payload, ['meta', 'pagination']) : undefined;
    const meta: PaginationMeta = {
        current_page: firstNumber(metaSource, ['current_page', 'currentPage'], firstNumber(payload, ['current_page'], filters.page)),
        last_page: firstNumber(metaSource, ['last_page', 'lastPage'], firstNumber(payload, ['last_page'], 1)),
        per_page: firstNumber(metaSource, ['per_page', 'perPage'], firstNumber(payload, ['per_page'], filters.perPage)),
        total: firstNumber(metaSource, ['total'], firstNumber(payload, ['total'], items.length)),
    };
    return { items, meta };
}

export async function createUser(payload: UserPayload): Promise<void> {
    await request<unknown>('/api/admin/users', { method: 'POST', body: payload });
}

export async function updateUser(id: string | number, payload: UserPayload): Promise<void> {
    const body: Record<string, string> = { ...payload };
    if (payload.password.trim() === '') {
        delete body.password;
    }
    await request<unknown>(`/api/admin/users/${encodeURIComponent(String(id))}`, { method: 'PATCH', body });
}

export async function fetchRoleOptions(): Promise<UserOption[]> {
    try {
        const payload = await request<unknown>('/api/admin/roles');
        const data = unwrapEnvelope(payload);
        const items = Array.isArray(data) ? data : toArray(data, ['roles', 'data', 'items']);
        if (items.length > 0) {
            return items.map((raw, index) => {
                if (typeof raw === 'string') return { value: raw, label: roleLabel(raw) };
                const source = isRecord(raw) ? raw : {};
                const value = firstString(source, ['value', 'role', 'name', 'id'], `role-${index}`);
                return { value, label: firstString(source, ['label', 'name', 'role_label'], roleLabel(value)) };
            });
        }
    } catch {
        // fallback
    }
    return [
        { value: 'super_admin', label: 'Super Admin' },
        { value: 'admin_surat', label: 'Admin Surat' },
        { value: 'pimpinan', label: 'Pimpinan' },
        { value: 'staf', label: 'Staf' },
    ];
}

export async function fetchUnitOptions(): Promise<UserOption[]> {
    const payload = await request<unknown>('/api/units');
    const data = unwrapEnvelope(payload);
    const items = Array.isArray(data) ? data : toArray(data, ['units', 'data', 'items']);
    return items.map((raw, index) => {
        const source = isRecord(raw) ? raw : {};
        const id = firstValue(source, ['id']);
        return {
            value: typeof id === 'string' || typeof id === 'number' ? String(id) : String(index),
            label: firstString(source, ['nama', 'name', 'unit'], 'Unit'),
        };
    });
}
