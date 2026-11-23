import { firstString, firstValue, isRecord, unwrapEnvelope } from '../lib/guards';
import type { AuthSession, AuthUser, LoginCredentials } from '../types';
import { HttpError, request, setAuthToken } from './http';

function normalizeRole(source: Record<string, unknown>): string {
    const direct = firstString(source, ['role', 'hak_akses', 'level', 'permission', 'jabatan'], '');

    if (direct !== '') {
        return direct;
    }

    const roles = firstValue(source, ['roles', 'permissions']);

    if (Array.isArray(roles) && roles.length > 0) {
        const first = roles[0];

        if (typeof first === 'string') {
            return first;
        }

        if (isRecord(first)) {
            return firstString(first, ['name', 'role', 'slug'], 'user');
        }
    }

    return 'user';
}

export function normalizeUser(payload: unknown): AuthUser | null {
    const unwrapped = unwrapEnvelope(payload);
    const root = isRecord(unwrapped) ? unwrapped : null;
    const candidate = root
        ? firstValue(root, ['user', 'profile', 'akun', 'data'])
        : undefined;
    const source = isRecord(candidate) ? candidate : root;

    if (!isRecord(source)) {
        return null;
    }

    const idValue = firstValue(source, ['id', 'user_id', 'uuid']);
    const unitKeys = ['unit', 'unit_kerja', 'nama_unit', 'bidang', 'department'];
    const unitValue = firstValue(source, unitKeys);
    const unit = isRecord(unitValue)
        ? firstString(unitValue, ['nama', 'name', 'singkatan'], 'Setda')
        : firstString(source, unitKeys, 'Setda');

    return {
        id: typeof idValue === 'string' || typeof idValue === 'number' ? idValue : null,
        name: firstString(source, ['name', 'nama', 'nama_lengkap', 'full_name'], 'Pengguna'),
        email: firstString(source, ['email', 'alamat_email'], ''),
        jabatan: firstString(source, ['jabatan', 'position', 'title', 'role_label'], 'Staf'),
        role: normalizeRole(source),
        unit,
    };
}

function normalizeToken(payload: unknown): string | null {
    const unwrapped = unwrapEnvelope(payload);
    const candidates: unknown[] = [unwrapped];

    if (isRecord(unwrapped)) {
        candidates.push(firstValue(unwrapped, ['token', 'access_token', 'api_token', 'data']));
    }

    for (const candidate of candidates) {
        if (isRecord(candidate)) {
            const token = firstString(candidate, ['token', 'access_token', 'api_token'], '');

            if (token !== '') {
                return token;
            }
        } else if (typeof candidate === 'string' && candidate.trim() !== '') {
            return candidate.trim();
        }
    }

    return null;
}

export function isAdminRole(role: string): boolean {
    const normalized = role.toLowerCase().replace(/[\s_-]/g, '');

    return ['admin', 'superadmin', 'administrator', 'superadministrator', 'adminsurat', 'root'].includes(normalized);
}

export async function login(credentials: LoginCredentials): Promise<AuthSession> {
    const payload = await request<unknown>('/api/login', {
        method: 'POST',
        body: credentials,
        suppressUnauthorized: true,
    });
    const user = normalizeUser(payload);

    if (!user) {
        throw new Error('Respons login tidak memuat data pengguna.');
    }

    const token = normalizeToken(payload);
    setAuthToken(token, credentials.remember ? 'local' : 'session');

    return { user, token, remember: credentials.remember };
}

export async function fetchCurrentUser(): Promise<AuthUser> {
    let payload: unknown;

    try {
        payload = await request<unknown>('/api/me', { suppressUnauthorized: true });
    } catch (error) {
        const isMissing = error instanceof HttpError && (error.status === 404 || error.status === 405);

        if (!isMissing) {
            throw error;
        }

        payload = await request<unknown>('/api/user', { suppressUnauthorized: true });
    }

    const user = normalizeUser(payload);

    if (!user) {
        throw new Error('Data pengguna tidak dapat dibaca.');
    }

    return user;
}

export async function logout(): Promise<void> {
    setAuthToken(null);

    try {
        await request<unknown>('/api/logout', {
            method: 'POST',
            suppressUnauthorized: true,
        });
    } catch (error) {
        const canIgnore = error instanceof HttpError && [401, 404, 405, 419].includes(error.status);

        if (!canIgnore) {
            throw error;
        }
    }
}
