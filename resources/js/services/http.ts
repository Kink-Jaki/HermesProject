import { isRecord } from '../lib/guards';
import type { ApiErrorPayload } from '../types';

export const UNAUTHORIZED_EVENT = 'e-agenda:unauthorized';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface RequestOptions {
    method?: HttpMethod;
    body?: unknown;
    headers?: Record<string, string>;
    signal?: AbortSignal;
    suppressUnauthorized?: boolean;
    csrf?: boolean;
}

export class HttpError extends Error {
    readonly status: number;
    readonly payload: ApiErrorPayload | null;

    constructor(status: number, message: string, payload: ApiErrorPayload | null) {
        super(message);
        this.name = 'HttpError';
        this.status = status;
        this.payload = payload;
    }
}

type TokenStorage = 'local' | 'session' | 'none';

const TOKEN_KEY = 'e-agenda:token';

function readStoredToken(): string | null {
    if (typeof window === 'undefined') {
        return null;
    }

    try {
        return window.localStorage.getItem(TOKEN_KEY) ?? window.sessionStorage.getItem(TOKEN_KEY);
    } catch {
        return null;
    }
}

let authToken: string | null = readStoredToken();

export function setAuthToken(token: string | null, storage: TokenStorage = 'none'): void {
    authToken = token;

    if (typeof window === 'undefined') {
        return;
    }

    try {
        window.localStorage.removeItem(TOKEN_KEY);
        window.sessionStorage.removeItem(TOKEN_KEY);

        if (token && storage === 'local') {
            window.localStorage.setItem(TOKEN_KEY, token);
        }

        if (token && storage === 'session') {
            window.sessionStorage.setItem(TOKEN_KEY, token);
        }
    } catch {
        return;
    }
}

export function getAuthToken(): string | null {
    return authToken;
}

function readCookie(name: string): string | null {
    if (typeof document === 'undefined') {
        return null;
    }

    const prefix = `${name}=`;
    const cookie = document.cookie.split(';').map((part) => part.trim()).find((part) => part.startsWith(prefix));

    if (!cookie) {
        return null;
    }

    const value = cookie.slice(prefix.length);

    try {
        return decodeURIComponent(value);
    } catch {
        return value;
    }
}

async function ensureCsrfCookie(): Promise<void> {
    if (typeof document === 'undefined' || readCookie('XSRF-TOKEN')) {
        return;
    }

    try {
        await fetch('/sanctum/csrf-cookie', {
            credentials: 'include',
            headers: {
                Accept: 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
            },
        });
    } catch {
        return;
    }
}

export function getErrorMessage(payload: unknown, fallback = 'Terjadi kesalahan. Silakan coba lagi.'): string {
    if (isRecord(payload)) {
        if (typeof payload.message === 'string' && payload.message.trim() !== '') {
            return payload.message.trim();
        }

        const errors = payload.errors;

        if (isRecord(errors)) {
            for (const value of Object.values(errors)) {
                if (typeof value === 'string' && value.trim() !== '') {
                    return value.trim();
                }

                if (Array.isArray(value) && typeof value[0] === 'string' && value[0].trim() !== '') {
                    return value[0].trim();
                }
            }
        }
    }

    return fallback;
}

export function errorMessage(error: unknown, fallback?: string): string {
    if (error instanceof HttpError) {
        return getErrorMessage(error.payload, fallback ?? error.message);
    }

    if (error instanceof Error && error.message.trim() !== '') {
        return error.message;
    }

    return fallback ?? 'Terjadi kesalahan. Silakan coba lagi.';
}

export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
    const method = options.method ?? 'GET';
    const requiresCsrf = options.csrf ?? false;

    if (requiresCsrf) {
        await ensureCsrfCookie();
    }

    const headers: Record<string, string> = {
        Accept: 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        ...options.headers,
    };

    if (authToken) {
        headers.Authorization = `Bearer ${authToken}`;
    }

    const xsrfToken = readCookie('XSRF-TOKEN');

    if (xsrfToken && method !== 'GET') {
        headers['X-XSRF-TOKEN'] = xsrfToken;
    }

    const body = options.body;
    const hasBody = body !== undefined && body !== null;
    const isFormBody = hasBody && typeof FormData !== 'undefined' && body instanceof FormData;

    if (hasBody && !isFormBody) {
        headers['Content-Type'] = 'application/json';
    }

    const response = await fetch(path, {
        method,
        credentials: 'include',
        headers,
        signal: options.signal,
        body: hasBody ? (isFormBody ? body : JSON.stringify(body)) : undefined,
    });

    const text = await response.text();
    let payload: unknown = null;

    if (text !== '') {
        try {
            payload = JSON.parse(text) as unknown;
        } catch {
            payload = text;
        }
    }

    if (response.status === 401 && !options.suppressUnauthorized && typeof window !== 'undefined') {
        window.dispatchEvent(new Event(UNAUTHORIZED_EVENT));
    }

    if (!response.ok) {
        const errorPayload = isRecord(payload) ? (payload as ApiErrorPayload) : null;
        const fallback = response.status === 401
            ? 'Sesi Anda telah berakhir. Silakan masuk kembali.'
            : `Permintaan gagal (${response.status}).`;

        throw new HttpError(response.status, getErrorMessage(payload, fallback), errorPayload);
    }

    return payload as T;
}
