import { firstNumber, firstString, firstValue, isRecord, toArray, unwrapEnvelope } from '../lib/guards';
import type { SifatSurat } from '../types';
import { HttpError, request } from './http';

export type TargetTipe = 'unit' | 'user';
export type PrioritasDisposisi = SifatSurat;
export type InstruksiDisposisi = 'Tindak lanjut' | 'Koordinasikan' | 'Untuk diketahui';

export interface DisposisiTarget {
    id: string | number;
    nama: string;
    keterangan: string;
}

export interface SaranDisposisi {
    id: string | number;
    targetId: string | number;
    tipe: TargetTipe;
    nama: string;
    skor: number;
    alasan: string;
}

export interface DisposisiPayload {
    suratMasukId: string | number;
    tipe: TargetTipe;
    targetId: string | number;
    batasWaktu: string;
    prioritas: PrioritasDisposisi;
    instruksi: InstruksiDisposisi;
    catatan: string;
    kirimNotifikasi: boolean;
}

export interface DisposisiResponse {
    id: string | number;
    status: string;
}

function normalizeTarget(raw: unknown, tipe: TargetTipe, index: number): DisposisiTarget | null {
    const source = isRecord(raw) ? raw : {};
    const id = firstValue(source, ['id', 'unit_id', 'user_id']);

    if (typeof id !== 'string' && typeof id !== 'number') {
        return null;
    }

    const unit = firstValue(source, ['unit']);

    return {
        id,
        nama: firstString(source, tipe === 'user' ? ['name', 'nama', 'email'] : ['nama', 'name', 'singkatan'], '-'),
        keterangan: firstString(
            source,
            tipe === 'user'
                ? ['jabatan', 'role_label', 'email', 'unit.nama']
                : ['kode', 'singkatan', 'deskripsi', 'penanggung_jawab'],
            firstString(unit, ['nama', 'name'], ''),
        ) || `${tipe === 'user' ? 'Pengguna' : 'Unit'} ${index + 1}`,
    };
}

function matchesQuery(target: DisposisiTarget, query: string): boolean {
    if (query.trim() === '') {
        return true;
    }

    const needle = query.trim().toLowerCase();

    return `${target.nama} ${target.keterangan}`.toLowerCase().includes(needle);
}

export async function fetchDisposisiTargets(
    tipe: TargetTipe,
    query: string,
    signal?: AbortSignal,
): Promise<DisposisiTarget[]> {
    const path = tipe === 'unit' ? '/api/units' : '/api/users?per_page=50';
    const payload = await request<unknown>(path, { signal, suppressUnauthorized: true });
    const data = unwrapEnvelope(payload);

    return toArray(data, ['data', 'items', 'units', 'users'])
        .map((raw, index) => normalizeTarget(raw, tipe, index))
        .filter((target): target is DisposisiTarget => target !== null && matchesQuery(target, query));
}

export function normalizeSaranDisposisi(raw: unknown, index = 0): SaranDisposisi | null {
    const source = isRecord(raw) ? raw : {};
    const unit = firstValue(source, ['unit', 'disarankanUnit', 'disarankan_unit']);
    const user = firstValue(source, ['user', 'disarankanUser', 'disarankan_user']);
    const directUnitId = firstValue(source, ['disarankan_unit_id', 'unit_id']);
    const directUserId = firstValue(source, ['disarankan_user_id', 'user_id', 'penerima_user_id']);
    const unitId = firstValue(unit, ['id']) ?? directUnitId;
    const userId = firstValue(user, ['id']) ?? directUserId;
    const targetId = unitId ?? userId;
    const tipe: TargetTipe = unitId !== undefined ? 'unit' : 'user';

    if (typeof targetId !== 'string' && typeof targetId !== 'number') {
        return null;
    }

    const rawId = firstValue(source, ['id']);

    return {
        id: typeof rawId === 'string' || typeof rawId === 'number' ? rawId : `saran-${index}`,
        targetId,
        tipe,
        nama: isRecord(unit)
            ? firstString(unit, ['nama', 'name', 'singkatan'], 'Rekomendasi AI')
            : firstString(user, ['name', 'nama', 'email'], 'Rekomendasi AI'),
        skor: firstNumber(source, ['skor', 'score', 'confidence'], 0),
        alasan: firstString(source, ['alasan', 'reason', 'deskripsi'], ''),
    };
}

export async function fetchSaranDisposisi(
    suratMasukId: string | number,
    signal?: AbortSignal,
): Promise<SaranDisposisi[]> {
    try {
        const payload = await request<unknown>(
            `/api/surat-masuk/${encodeURIComponent(String(suratMasukId))}/saran-disposisi`,
            { signal, suppressUnauthorized: true },
        );
        const data = unwrapEnvelope(payload);

        return toArray(data, ['data', 'items', 'saran', 'suggestions'])
            .map((raw, index) => normalizeSaranDisposisi(raw, index))
            .filter((saran): saran is SaranDisposisi => saran !== null);
    } catch (error) {
        if (error instanceof HttpError && error.status === 404) {
            return [];
        }

        throw error;
    }
}

export async function kirimDisposisi(payload: DisposisiPayload): Promise<DisposisiResponse> {
    const prioritas = payload.prioritas.toLowerCase().replace(/\s+/g, '_');
    const instruksi = payload.instruksi.toLowerCase().replace(/\s+/g, '_');
    const batasWaktu = payload.batasWaktu.trim().replace('T', ' ');
    const body: Record<string, unknown> = {
        instruksi,
        catatan: payload.catatan,
        prioritas,
        batas_waktu: batasWaktu.length === 16 ? `${batasWaktu}:00` : batasWaktu,
        kirim_notifikasi: payload.kirimNotifikasi,
    };

    if (payload.tipe === 'unit') {
        body.unit_id = payload.targetId;
    } else {
        body.penerima_user_id = payload.targetId;
    }

    const response = await request<unknown>(
        `/api/surat-masuk/${encodeURIComponent(String(payload.suratMasukId))}/disposisi`,
        { method: 'POST', body, csrf: true },
    );
    const data = unwrapEnvelope(response);
    const source = isRecord(data) ? data : {};
    const id = firstValue(source, ['id', 'disposisi_id']);

    return {
        id: typeof id === 'string' || typeof id === 'number' ? id : `disposisi-${Date.now()}`,
        status: firstString(source, ['status', 'status_label'], 'berhasil'),
    };
}
