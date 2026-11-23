import { firstBoolean, firstString, firstValue, isRecord, toArray, unwrapEnvelope } from '../lib/guards';
import type { NotificationItem } from '../types';
import { HttpError, request } from './http';

export function normalizeNotification(raw: unknown, index = 0): NotificationItem {
    const source = isRecord(raw) ? raw : {};
    const idValue = firstValue(source, ['id', 'notification_id', 'uuid']);
    const surat = firstValue(source, ['surat_masuk', 'suratMasuk']);
    const statusValue = firstString(source, ['status', 'status_notifikasi'], '').toLowerCase();
    const isUnread = firstBoolean(source, ['is_unread', 'belum_dibaca'], false);
    const read = statusValue !== ''
        ? statusValue === 'read' || statusValue === 'dibaca'
        : !isUnread && !firstBoolean(source, ['is_read', 'read', 'dibaca', 'sudah_dibaca', 'is_seen'], false);
    const hasDisposisi = firstValue(source, ['disposisi_id', 'disposisi']) !== undefined;
    const kind = hasDisposisi
        ? 'disposisi'
        : firstString(source, ['type', 'jenis', 'kategori', 'channel'], 'surat');

    return {
        id: typeof idValue === 'string' || typeof idValue === 'number' ? idValue : `notifikasi-${index}`,
        title: firstString(source, ['judul', 'title', 'subjek'], 'Notifikasi baru'),
        description: firstString(source, ['pesan', 'deskripsi', 'description', 'message', 'isi', 'keterangan'], ''),
        nomorSurat: firstString(
            source,
            ['nomor_surat', 'nomorSurat', 'nomor', 'number'],
            isRecord(surat) ? firstString(surat, ['nomor_surat', 'nomorSurat'], '') : '',
        ),
        createdAt: firstString(source, ['created_at', 'createdAt', 'waktu', 'time', 'tanggal'], ''),
        read,
        kind,
    };
}

export async function fetchNotifications(): Promise<NotificationItem[]> {
    let payload: unknown;

    try {
        payload = await request<unknown>('/api/notifications', { suppressUnauthorized: true });
    } catch (error) {
        const isMissing = error instanceof HttpError && error.status === 404;

        if (!isMissing) {
            throw error;
        }

        payload = await request<unknown>('/api/notifikasi', { suppressUnauthorized: true });
    }

    const data = unwrapEnvelope(payload);
    const items = Array.isArray(data)
        ? data
        : toArray(data, ['notifications', 'notifikasi', 'items', 'data']);

    return items.map((raw, index) => normalizeNotification(raw, index));
}

export async function markAllNotificationsRead(): Promise<void> {
    try {
        await request<unknown>('/api/notifications/read-all', { method: 'PATCH' });
    } catch (error) {
        const isMissing = error instanceof HttpError && [404, 405].includes(error.status);

        if (!isMissing) {
            throw error;
        }

        await request<unknown>('/api/notifikasi/read-all', { method: 'POST' });
    }
}
