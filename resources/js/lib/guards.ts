export function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function firstValue(source: unknown, keys: string[]): unknown {
    if (!isRecord(source)) {
        return undefined;
    }

    for (const key of keys) {
        const direct = source[key];

        if (direct !== undefined && direct !== null) {
            return direct;
        }

        const nested = key.split('.').reduce<unknown>((current, segment) => {
            return isRecord(current) ? current[segment] : undefined;
        }, source);

        if (nested !== undefined && nested !== null) {
            return nested;
        }
    }

    return undefined;
}

export function firstString(source: unknown, keys: string[], fallback = ''): string {
    const value = firstValue(source, keys);

    if (typeof value === 'string' && value.trim() !== '') {
        return value.trim();
    }

    if (typeof value === 'number' && Number.isFinite(value)) {
        return String(value);
    }

    return fallback;
}

export function firstNumber(source: unknown, keys: string[], fallback = 0): number {
    const value = firstValue(source, keys);

    if (typeof value === 'number' && Number.isFinite(value)) {
        return value;
    }

    if (typeof value === 'string') {
        const parsed = Number(value.replace(/[^\d.,-]/g, '').replace(',', '.'));

        if (Number.isFinite(parsed)) {
            return parsed;
        }
    }

    return fallback;
}

export function firstBoolean(source: unknown, keys: string[], fallback = false): boolean {
    const value = firstValue(source, keys);

    if (typeof value === 'boolean') {
        return value;
    }

    if (typeof value === 'number') {
        return value !== 0;
    }

    if (typeof value === 'string') {
        const normalized = value.trim().toLowerCase();

        if (['1', 'true', 'ya', 'yes', 'read', 'dibaca'].includes(normalized)) {
            return true;
        }

        if (['0', 'false', 'tidak', 'no', 'unread', 'belum'].includes(normalized)) {
            return false;
        }
    }

    return fallback;
}

export function unwrapEnvelope(payload: unknown): unknown {
    if (isRecord(payload) && 'data' in payload) {
        return payload.data;
    }

    return payload;
}

export function toArray(source: unknown, keys: string[]): unknown[] {
    const value = firstValue(source, keys);

    if (Array.isArray(value)) {
        return value;
    }

    if (isRecord(value)) {
        return Object.values(value);
    }

    return [];
}

export function mergeRecords(source: unknown, keys: string[]): Record<string, unknown> {
    const merged: Record<string, unknown> = isRecord(source) ? { ...source } : {};

    for (const key of keys) {
        const value = firstValue(source, [key]);

        if (isRecord(value)) {
            Object.assign(merged, value);
        }
    }

    return merged;
}
