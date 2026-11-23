import { firstBoolean, firstString, firstValue, isRecord, toArray, unwrapEnvelope } from '../../lib/guards';
import { detailSuratMasukPath } from '../../lib/constants';
import { formatRelativeTime } from '../../lib/format';
import { request } from '../../services/http';
import { markAllNotificationsRead } from '../../services/notificationService';
import type { NotificationItem } from '../../types';

export interface NotificationRow extends NotificationItem {
    suratMasukId: string | number | null;
}

export function isToday(value: string): boolean {
    if (value === '') return true;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return true;
    return date.toDateString() === new Date().toDateString();
}

export function normalizeNotificationRow(raw: unknown, index: number): NotificationRow {
    const source = isRecord(raw) ? raw : {};
    const idValue = firstValue(source, ['id', 'notification_id', 'uuid']);
    const surat = firstValue(source, ['surat_masuk', 'suratMasuk', 'surat']);
    const statusValue = firstString(source, ['status', 'status_notifikasi'], '').toLowerCase();
    const isUnread = firstBoolean(source, ['is_unread', 'belum_dibaca'], false);
    const read = statusValue !== ''
        ? statusValue === 'read' || statusValue === 'dibaca'
        : !isUnread && !firstBoolean(source, ['is_read', 'read', 'dibaca', 'sudah_dibaca', 'is_seen'], false);
    const hasDisposisi = firstValue(source, ['disposisi_id', 'disposisi']) !== undefined;
    const kind = hasDisposisi ? 'disposisi' : firstString(source, ['type', 'jenis', 'kategori', 'channel'], 'surat');
    const suratMasukIdRaw = firstValue(source, ['surat_masuk_id', 'suratMasukId']);
    const suratMasukId = typeof suratMasukIdRaw === 'string' || typeof suratMasukIdRaw === 'number'
        ? suratMasukIdRaw
        : isRecord(surat) ? (firstValue(surat, ['id']) as string | number | null) ?? null : null;

    return {
        id: typeof idValue === 'string' || typeof idValue === 'number' ? idValue : `notifikasi-${index}`,
        title: firstString(source, ['judul', 'title', 'subjek'], 'Notifikasi baru'),
        description: firstString(source, ['pesan', 'deskripsi', 'description', 'message', 'isi', 'keterangan'], ''),
        nomorSurat: firstString(source, ['nomor_surat', 'nomorSurat', 'nomor', 'number'], isRecord(surat) ? firstString(surat, ['nomor_surat', 'nomorSurat'], '') : ''),
        createdAt: firstString(source, ['created_at', 'createdAt', 'waktu', 'time', 'tanggal'], ''),
        read,
        kind,
        suratMasukId,
    };
}

export async function fetchNotificationRows(): Promise<NotificationRow[]> {
    const payload = await request<unknown>('/api/notifications', { suppressUnauthorized: true });
    const data = unwrapEnvelope(payload);
    const items = Array.isArray(data) ? data : toArray(data, ['notifications', 'notifikasi', 'items', 'data']);
    return items.map(normalizeNotificationRow);
}

export { markAllNotificationsRead, formatRelativeTime, detailSuratMasukPath };
