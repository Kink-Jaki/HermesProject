import { normalizeSifat, normalizeStatus } from './dashboardService';
import { normalizeSaranDisposisi } from './disposisiService';
import type { SaranDisposisi } from './disposisiService';
import { firstNumber, firstString, firstValue, isRecord, mergeRecords, toArray, unwrapEnvelope } from '../lib/guards';
import type { PaginationMeta, SifatSurat, StatusSurat } from '../types';
import { getAuthToken, request } from './http';

export type SuratStatusFilter = 'semua' | Lowercase<StatusSurat>;
export type SifatFilter = 'semua' | SifatSurat;

export interface SuratMasukFilters {
    page: number;
    perPage: number;
    status: SuratStatusFilter;
    sifat: SifatFilter;
    bulan: string;
    q: string;
}

export interface LampiranSurat {
    id: string | number;
    nama: string;
    ukuran: number;
    tipe: string;
    url: string;
}

export interface RiwayatAktivitas {
    id: string | number;
    label: string;
    deskripsi: string;
    waktu: string;
    active: boolean;
}

export interface SuratMasuk {
    id: string | number;
    nomorAgenda: string;
    nomorSurat: string;
    perihal: string;
    pengirim: string;
    asalSurat: string;
    tanggalSurat: string;
    tanggalDiterima: string;
    sifat: SifatSurat;
    status: StatusSurat;
    klasifikasi: string;
    ringkasan: string;
    dicatatOleh: string;
    dokumenUrl: string;
    lampiran: LampiranSurat[];
    riwayat: RiwayatAktivitas[];
    saranDisposisi: SaranDisposisi[];
}

export interface SuratMasukSummary {
    total: number;
    baru: number;
    terdisposisi: number;
    selesai: number;
}

export interface SuratMasukListResponse {
    items: SuratMasuk[];
    meta: PaginationMeta;
    summary: SuratMasukSummary;
}

export interface KlasifikasiOption {
    id: string | number;
    nama: string;
    kode: string;
}

export interface SuratMasukFormPayload {
    nomorAgenda: string;
    nomorSurat: string;
    tanggalSurat: string;
    tanggalDiterima: string;
    pengirim: string;
    perihal: string;
    sifat: SifatSurat;
    klasifikasiId: string | number;
    lampiran: File[];
}

function resolveUrl(value: string): string {
    if (value === '') {
        return '';
    }

    if (value.startsWith('http://') || value.startsWith('https://') || value.startsWith('/')) {
        return value;
    }

    return `/storage/${value}`;
}

export function normalizeLampiran(raw: unknown, index: number): LampiranSurat {
    const source = isRecord(raw) ? raw : {};
    const id = firstValue(source, ['id', 'lampiran_id', 'uuid']);
    const url = firstString(source, ['download_url', 'url', 'file_url', 'path', 'lampiran'], '');

    return {
        id: typeof id === 'string' || typeof id === 'number' ? id : `lampiran-${index}`,
        nama: firstString(source, ['label', 'nama_file', 'nama', 'name', 'filename', 'file_name'], `Lampiran ${index + 1}`),
        ukuran: firstNumber(source, ['ukuran', 'ukuran_file', 'size', 'bytes'], 0),
        tipe: firstString(source, ['mime_type', 'tipe', 'type', 'extension'], ''),
        url: resolveUrl(url),
    };
}

export function normalizeRiwayat(raw: unknown, index: number): RiwayatAktivitas {
    const source = isRecord(raw) ? raw : {};
    const id = firstValue(source, ['id', 'disposisi_id', 'uuid']);
    const statusValue = firstString(source, ['status', 'status_label'], '').toLowerCase();

    return {
        id: typeof id === 'string' || typeof id === 'number' ? id : `riwayat-${index}`,
        label: firstString(source, ['instruksi_label', 'label', 'judul', 'aktivitas', 'instruksi'], 'Aktivitas surat'),
        deskripsi: firstString(
            source,
            ['deskripsi', 'keterangan', 'catatan', 'penerima.name', 'penerima.nama', 'unit.nama', 'pemberi.name'],
            '',
        ),
        waktu: firstString(source, ['waktu', 'created_at', 'dibaca_at', 'selesai_at', 'tanggal'], ''),
        active: ['selesai', 'dibaca', 'disetujui', 'active', 'done'].includes(statusValue) || index === 0,
    };
}

export function normalizeSuratMasuk(raw: unknown, index = 0): SuratMasuk {
    const source = isRecord(raw) ? raw : {};
    const id = firstValue(source, ['id', 'surat_id', 'uuid']);
    const lampiran = toArray(source, ['lampiran', 'lampirans', 'attachments', 'files', 'dokumen'])
        .map((item, itemIndex) => normalizeLampiran(item, itemIndex));
    const dokumenUrl = firstString(source, ['dokumen_url', 'file_url', 'url_dokumen'], lampiran[0]?.url ?? '');
    const category = firstValue(source, ['category', 'klasifikasi', 'kategori']);
    const pencatat = firstValue(source, ['pencatat', 'user', 'dicatat_oleh']);

    return {
        id: typeof id === 'string' || typeof id === 'number' ? id : `surat-${index}`,
        nomorAgenda: firstString(source, ['nomor_agenda', 'nomorAgenda', 'kode_agenda'], '-'),
        nomorSurat: firstString(source, ['nomor_surat', 'nomorSurat', 'no_surat', 'number'], '-'),
        perihal: firstString(source, ['perihal', 'subject', 'judul'], 'Perihal belum diisi'),
        pengirim: firstString(source, ['pengirim', 'asal', 'asal_surat', 'sender', 'nama_pengirim'], '-'),
        asalSurat: firstString(source, ['asal_surat', 'pengirim', 'asal', 'sender'], '-'),
        tanggalSurat: firstString(source, ['tanggal_surat', 'tanggal', 'date'], ''),
        tanggalDiterima: firstString(source, ['tanggal_diterima', 'diterima_pada', 'received_at'], ''),
        sifat: normalizeSifat(
            firstString(source, ['urgensi_label', 'sifat', 'urgensi', 'sifat_surat', 'urgency'], 'Biasa'),
        ),
        status: normalizeStatus(firstString(source, ['status_label', 'status', 'state'], 'Baru')),
        klasifikasi: firstString(category, ['nama', 'name', 'klasifikasi'], '-'),
        ringkasan: firstString(source, ['ringkasan', 'summary', 'deskripsi'], ''),
        dicatatOleh: firstString(pencatat, ['name', 'nama', 'email'], '-'),
        dokumenUrl: resolveUrl(dokumenUrl),
        lampiran,
        riwayat: toArray(source, ['riwayat', 'aktivitas', 'activities', 'timeline', 'disposisis'])
            .map((item, itemIndex) => normalizeRiwayat(item, itemIndex)),
        saranDisposisi: toArray(source, ['saran_disposisis', 'saranDisposisi', 'suggestions'])
            .map((item, itemIndex) => normalizeSaranDisposisi(item, itemIndex))
            .filter((item): item is SaranDisposisi => item !== null),
    };
}

function normalizeMeta(payload: unknown, items: SuratMasuk[]): PaginationMeta {
    const meta = mergeRecords(payload, ['meta']);
    const currentPage = firstNumber(meta, ['current_page', 'page'], 1);
    const perPage = firstNumber(meta, ['per_page', 'perPage'], items.length || 10);
    const total = firstNumber(meta, ['total'], items.length);

    return {
        current_page: currentPage > 0 ? currentPage : 1,
        last_page: Math.max(1, firstNumber(meta, ['last_page', 'lastPage'], Math.ceil(total / (perPage || 10)))),
        per_page: perPage > 0 ? perPage : 10,
        total,
    };
}

function normalizeSummary(source: unknown, items: SuratMasuk[], total: number): SuratMasukSummary {
    const counts = {
        'Baru': items.filter((item) => item.status === 'Baru').length,
        'Terdisposisi': items.filter((item) => item.status === 'Terdisposisi').length,
        'Selesai': items.filter((item) => item.status === 'Selesai').length,
    };

    return {
        total: firstNumber(source, ['total', 'total_surat', 'totalSurat'], total),
        baru: firstNumber(source, ['baru', 'new', 'menunggu_disposisi'], counts['Baru']),
        terdisposisi: firstNumber(source, ['terdisposisi', 'disposisi', 'forwarded'], counts['Terdisposisi']),
        selesai: firstNumber(source, ['selesai', 'completed', 'done'], counts['Selesai']),
    };
}

function buildQuery(filters: SuratMasukFilters): string {
    const params = new URLSearchParams({
        page: String(Math.max(1, filters.page)),
        per_page: String(Math.max(1, filters.perPage)),
    });

    if (filters.status !== 'semua') {
        params.set('status', filters.status);
    }

    if (filters.sifat !== 'semua') {
        params.set('urgensi', filters.sifat.toLowerCase().replace(/\s+/g, '_'));
    }

    if (filters.bulan !== '') {
        const [year, month] = filters.bulan.split('-');

        if (year && month) {
            params.set('bulan', month);
            params.set('tahun', year);
        }
    }

    if (filters.q.trim() !== '') {
        params.set('search', filters.q.trim());
    }

    return params.toString();
}

export async function fetchSuratMasuk(
    filters: SuratMasukFilters,
    signal?: AbortSignal,
): Promise<SuratMasukListResponse> {
    const payload = await request<unknown>(`/api/surat-masuk?${buildQuery(filters)}`, { signal });
    const data = unwrapEnvelope(payload);
    const items = (Array.isArray(data) ? data : toArray(data, ['data', 'items', 'surat', 'surat_masuk', 'results']))
        .map((item, index) => normalizeSuratMasuk(item, index));
    const meta = normalizeMeta(payload, items);
    const summarySource = {
        ...(isRecord(payload) ? payload : {}),
        ...(isRecord(payload) && isRecord(payload.meta) ? payload.meta : {}),
        ...(isRecord(data) ? data : {}),
    };

    return { items, meta, summary: normalizeSummary(summarySource, items, meta.total) };
}

export async function fetchSuratMasukDetail(id: string | number, signal?: AbortSignal): Promise<SuratMasuk> {
    const payload = await request<unknown>(`/api/surat-masuk/${encodeURIComponent(String(id))}`, { signal });
    const data = unwrapEnvelope(payload);

    if (!isRecord(data) && !Array.isArray(data)) {
        throw new Error('Detail surat tidak ditemukan.');
    }

    return normalizeSuratMasuk(data);
}

export async function fetchNomorAgenda(signal?: AbortSignal): Promise<string> {
    const payload = await request<unknown>('/api/surat-masuk/next-agenda', { signal });
    const data = unwrapEnvelope(payload);

    if (typeof data === 'string' && data.trim() !== '') {
        return data.trim();
    }

    return firstString(data, ['nomor_agenda', 'nomorAgenda', 'nomor', 'kode'], '');
}

export async function fetchKlasifikasiOptions(signal?: AbortSignal): Promise<KlasifikasiOption[]> {
    const payload = await request<unknown>('/api/categories', { signal });
    const data = unwrapEnvelope(payload);

    return toArray(data, ['data', 'items', 'categories', 'kategori'])
        .map((raw, index) => {
            const source = isRecord(raw) ? raw : {};
            const id = firstValue(source, ['id', 'category_id']);
            const kode = firstString(source, ['kode', 'kode_klasifikasi', 'code'], '');

            return {
                id: typeof id === 'string' || typeof id === 'number' ? id : `kategori-${index}`,
                nama: firstString(source, ['nama', 'name', 'label'], `Klasifikasi ${index + 1}`),
                kode,
            };
        })
        .filter((option) => option.nama !== '');
}

export async function createSuratMasuk(payload: SuratMasukFormPayload): Promise<SuratMasuk> {
    const body = new FormData();

    body.append('nomor_agenda', payload.nomorAgenda);
    body.append('nomor_surat', payload.nomorSurat);
    body.append('tanggal_surat', payload.tanggalSurat);
    body.append('tanggal_diterima', payload.tanggalDiterima);
    body.append('pengirim', payload.pengirim);
    body.append('asal_surat', payload.pengirim);
    body.append('perihal', payload.perihal);
    body.append('sifat', payload.sifat);
    body.append('urgensi', payload.sifat);
    body.append('category_id', String(payload.klasifikasiId));

    const [lampiranUtama] = payload.lampiran;

    if (lampiranUtama) {
        body.append('lampiran', lampiranUtama, lampiranUtama.name);
        body.append('file', lampiranUtama, lampiranUtama.name);
    }

    const response = await request<unknown>('/api/surat-masuk', { method: 'POST', body, csrf: true });

    return normalizeSuratMasuk(unwrapEnvelope(response));
}

export async function fetchLampiranBlob(url: string, signal?: AbortSignal): Promise<Blob> {
    if (url === '') {
        throw new Error('Dokumen lampiran tidak tersedia untuk surat ini.');
    }

    const token = getAuthToken();
    const response = await fetch(url, {
        credentials: 'include',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        signal,
    });

    if (!response.ok) {
        throw new Error(`Dokumen tidak dapat dimuat (${response.status}).`);
    }

    return response.blob();
}

export async function unduhSuratMasuk(surat: SuratMasuk): Promise<void> {
    const blob = await fetchLampiranBlob(surat.dokumenUrl);
    const objectUrl = URL.createObjectURL(blob);
    const anchor = document.createElement('a');

    anchor.href = objectUrl;
    anchor.download = `${surat.nomorSurat || 'surat-masuk'}.pdf`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(objectUrl);
}
