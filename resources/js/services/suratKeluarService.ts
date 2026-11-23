import { firstNumber, firstString, firstValue, isRecord, toArray, unwrapEnvelope } from '../lib/guards';
import type { PaginationMeta, SifatSurat, StatusSurat } from '../types';
import { request } from './http';

export type StatusSuratKeluar = 'Draft' | 'Terkirim' | 'Arsip';

export interface SuratKeluarItem {
    id: string | number;
    nomorSurat: string;
    tanggalSurat: string;
    perihal: string;
    tujuan: string;
    unitPenerbit: string;
    unitId: string | number | null;
    status: StatusSuratKeluar;
    sifat: SifatSurat;
    suratMasukId: string | number | null;
    suratMasukNomor: string;
    lampiranNama: string | null;
}

export interface SuratKeluarSummary {
    total: number;
    draft: number;
    terkirim: number;
    arsip: number;
}

export interface SuratKeluarListResponse {
    items: SuratKeluarItem[];
    meta: PaginationMeta;
    summary: SuratKeluarSummary;
}

export interface SuratKeluarFilters {
    search: string;
    status: 'all' | StatusSuratKeluar;
    unitId: string;
    bulan: string;
    page: number;
    perPage: number;
}

export interface SuratKeluarPayload {
    nomor_surat: string;
    tanggal_surat: string;
    tujuan: string;
    perihal: string;
    sifat: SifatSurat;
    status: StatusSuratKeluar;
    unit_id: string;
    surat_masuk_id: string;
    lampiran: File | null;
}

export interface OptionItem {
    value: string;
    label: string;
}

export interface SuratMasukOption extends OptionItem {
    nomorSurat: string;
    perihal: string;
}

function normalizeStatus(value: string): StatusSuratKeluar {
    const normalized = value.toLowerCase();
    if (normalized.includes('kirim') || normalized.includes('sent')) return 'Terkirim';
    if (normalized.includes('arsip') || normalized.includes('archive')) return 'Arsip';
    return 'Draft';
}

function normalizeSifat(value: string): SifatSurat {
    const normalized = value.toLowerCase();
    if (normalized.includes('sangat')) return 'Sangat Segera';
    if (normalized.includes('segera')) return 'Segera';
    return 'Biasa';
}

function normalizeItem(raw: unknown, index: number): SuratKeluarItem {
    const source = isRecord(raw) ? raw : {};
    const idValue = firstValue(source, ['id', 'surat_keluar_id', 'uuid']);
    const unit = firstValue(source, ['unit', 'unit_penerbit']);
    const suratMasuk = firstValue(source, ['surat_masuk', 'suratMasuk', 'surat_masuk_dibalas', 'suratMasukDibalas']);
    const unitId = firstValue(source, ['unit_id', 'unitId']);

    return {
        id: typeof idValue === 'string' || typeof idValue === 'number' ? idValue : `sk-${index}`,
        nomorSurat: firstString(source, ['nomor_surat', 'nomorSurat', 'no_surat'], '-'),
        tanggalSurat: firstString(source, ['tanggal_surat', 'tanggalSurat', 'tanggal', 'created_at'], ''),
        perihal: firstString(source, ['perihal', 'subject'], 'Perihal belum diisi'),
        tujuan: firstString(source, ['tujuan', 'penerima', 'tujuan_surat', 'kepada'], '-'),
        unitPenerbit: firstString(source, ['unit_penerbit', 'unitPenerbit', 'nama_unit'], isRecord(unit) ? firstString(unit, ['nama', 'name'], '-') : '-'),
        unitId: typeof unitId === 'string' || typeof unitId === 'number' ? unitId : isRecord(unit) ? (firstValue(unit, ['id']) as string | number | null) ?? null : null,
        status: normalizeStatus(firstString(source, ['status', 'status_surat', 'status_label'], 'Draft')),
        sifat: normalizeSifat(firstString(source, ['sifat', 'sifat_surat', 'urgensi', 'urgensi_label'], 'Biasa')),
        suratMasukId: (() => {
            const value = firstValue(source, ['surat_masuk_id', 'suratMasukId']);
            return typeof value === 'string' || typeof value === 'number' ? value : isRecord(suratMasuk) ? (firstValue(suratMasuk, ['id']) as string | number | null) ?? null : null;
        })(),
        suratMasukNomor: firstString(source, ['surat_masuk_nomor', 'nomor_surat_masuk'], isRecord(suratMasuk) ? firstString(suratMasuk, ['nomor_surat', 'nomorSurat'], '') : ''),
        lampiranNama: firstString(source, ['lampiran_nama', 'lampiran', 'file_name'], '') || null,
    };
}

function normalizeSummary(payload: unknown, items: SuratKeluarItem[], total: number): SuratKeluarSummary {
    const source = isRecord(payload) ? payload : {};
    const summary = firstValue(source, ['summary', 'ringkasan', 'counts', 'statistik']);
    const s = isRecord(summary) ? summary : source;
    const hasSummary = isRecord(summary) || firstValue(s, ['draft', 'terkirim', 'arsip']) !== undefined;
    if (hasSummary) {
        return {
            total: firstNumber(s, ['total', 'total_surat', 'semua'], total),
            draft: firstNumber(s, ['draft', 'total_draft'], items.filter((i) => i.status === 'Draft').length),
            terkirim: firstNumber(s, ['terkirim', 'sent', 'total_terkirim'], items.filter((i) => i.status === 'Terkirim').length),
            arsip: firstNumber(s, ['arsip', 'archive', 'total_arsip'], items.filter((i) => i.status === 'Arsip').length),
        };
    }
    return {
        total,
        draft: items.filter((i) => i.status === 'Draft').length,
        terkirim: items.filter((i) => i.status === 'Terkirim').length,
        arsip: items.filter((i) => i.status === 'Arsip').length,
    };
}

export async function fetchSuratKeluar(filters: SuratKeluarFilters): Promise<SuratKeluarListResponse> {
    const params = new URLSearchParams();
    params.set('page', String(filters.page));
    params.set('per_page', String(filters.perPage));
    if (filters.search.trim() !== '') params.set('search', filters.search.trim());
    if (filters.status !== 'all') params.set('status', filters.status.toLowerCase());
    if (filters.unitId !== '') params.set('unit_id', filters.unitId);
    if (filters.bulan !== '') params.set('bulan', filters.bulan);

    const payload = await request<unknown>(`/api/surat-keluar?${params.toString()}`);
    const data = unwrapEnvelope(payload);
    const itemsRaw = Array.isArray(data) ? data : toArray(data, ['items', 'surat_keluar', 'suratKeluars', 'data']);
    const items = itemsRaw.map(normalizeItem);
    const metaSource = isRecord(payload) ? firstValue(payload, ['meta', 'pagination']) : undefined;
    const meta: PaginationMeta = {
        current_page: firstNumber(metaSource, ['current_page', 'currentPage'], firstNumber(payload, ['current_page'], filters.page)),
        last_page: firstNumber(metaSource, ['last_page', 'lastPage'], firstNumber(payload, ['last_page'], 1)),
        per_page: firstNumber(metaSource, ['per_page', 'perPage'], firstNumber(payload, ['per_page'], filters.perPage)),
        total: firstNumber(metaSource, ['total'], firstNumber(payload, ['total'], items.length)),
    };

    return { items, meta, summary: normalizeSummary(payload, items, meta.total) };
}

function toFormData(payload: SuratKeluarPayload): FormData {
    const form = new FormData();
    form.append('nomor_surat', payload.nomor_surat);
    form.append('tanggal_surat', payload.tanggal_surat);
    form.append('tujuan', payload.tujuan);
    form.append('perihal', payload.perihal);
    form.append('sifat', payload.sifat);
    form.append('status', payload.status.toLowerCase());
    if (payload.unit_id !== '') form.append('unit_id', payload.unit_id);
    if (payload.surat_masuk_id !== '') form.append('surat_masuk_id', payload.surat_masuk_id);
    if (payload.lampiran) form.append('lampiran', payload.lampiran);
    return form;
}

export async function createSuratKeluar(payload: SuratKeluarPayload): Promise<void> {
    await request<unknown>('/api/surat-keluar', { method: 'POST', body: toFormData(payload) });
}

export async function updateSuratKeluar(id: string | number, payload: SuratKeluarPayload): Promise<void> {
    const form = toFormData(payload);
    form.append('_method', 'PUT');
    await request<unknown>(`/api/surat-keluar/${encodeURIComponent(String(id))}`, { method: 'POST', body: form });
}

export async function fetchUnitOptions(): Promise<OptionItem[]> {
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

export async function fetchSuratMasukOptions(search = ''): Promise<SuratMasukOption[]> {
    const params = new URLSearchParams();
    params.set('per_page', '20');
    if (search.trim() !== '') params.set('search', search.trim());
    const payload = await request<unknown>(`/api/surat-masuk?${params.toString()}`);
    const data = unwrapEnvelope(payload);
    const items = Array.isArray(data) ? data : toArray(data, ['items', 'surat_masuk', 'suratMasuks', 'data']);
    return items.map((raw, index) => {
        const source = isRecord(raw) ? raw : {};
        const id = firstValue(source, ['id']);
        const nomor = firstString(source, ['nomor_surat', 'nomorSurat', 'no_surat'], '-');
        const perihal = firstString(source, ['perihal', 'subject'], 'Perihal');
        return {
            value: typeof id === 'string' || typeof id === 'number' ? String(id) : String(index),
            label: `${nomor} — ${perihal}`,
            nomorSurat: nomor,
            perihal,
        };
    });
}
