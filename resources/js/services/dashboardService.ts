import { formatTanggal } from '../lib/format';
import { firstNumber, firstString, firstValue, isRecord, mergeRecords, toArray, unwrapEnvelope } from '../lib/guards';
import type {
    DashboardAttention,
    DashboardChartPoint,
    DashboardData,
    DashboardSummary,
    SifatSurat,
    StatusSurat,
    SuratRingkas,
} from '../types';
import { HttpError, request } from './http';

export function normalizeSifat(value: string): SifatSurat {
    const normalized = value.toLowerCase();

    if (normalized.includes('sangat') || normalized.includes('urgent') || normalized.includes('critical')) {
        return 'Sangat Segera';
    }

    if (normalized.includes('segera') || normalized.includes('cepat') || normalized.includes('soon')) {
        return 'Segera';
    }

    return 'Biasa';
}

export function normalizeStatus(value: string): StatusSurat {
    const normalized = value.toLowerCase();

    if (normalized.includes('selesai') || normalized.includes('done') || normalized.includes('complete')) {
        return 'Selesai';
    }

    if (normalized.includes('disposisi') || normalized.includes('diteruskan') || normalized.includes('forward')) {
        return 'Terdisposisi';
    }

    return 'Baru';
}

export function normalizeSurat(raw: unknown, index = 0): SuratRingkas {
    const source = isRecord(raw) ? raw : {};
    const idValue = firstValue(source, ['id', 'surat_id', 'uuid']);

    return {
        id: typeof idValue === 'string' || typeof idValue === 'number' ? idValue : `surat-${index}`,
        nomorAgenda: firstString(source, ['nomor_agenda', 'nomorAgenda', 'kode_agenda'], '-'),
        nomorSurat: firstString(source, ['nomor_surat', 'nomorSurat', 'no_surat', 'number'], '-'),
        perihal: firstString(source, ['perihal', 'subject', 'judul'], 'Perihal belum diisi'),
        pengirim: firstString(source, ['pengirim', 'asal', 'asal_surat', 'sender', 'nama_pengirim'], '-'),
        tanggal: firstString(source, ['tanggal_surat', 'tanggal', 'date', 'created_at'], ''),
        sifat: normalizeSifat(firstString(source, ['urgensi_label', 'sifat', 'sifat_surat', 'urgensi', 'urgency', 'prioritas'], 'Biasa')),
        status: normalizeStatus(firstString(source, ['status_label', 'status', 'status_surat', 'state'], 'Baru')),
    };
}

function normalizeSummary(data: unknown): DashboardSummary {
    const source = mergeRecords(data, ['metrics', 'summary', 'stats', 'statistik', 'ringkasan']);

    return {
        suratMasuk: firstNumber(source, ['surat_masuk', 'suratMasuk', 'masuk', 'total_surat_masuk', 'incoming'], 0),
        suratKeluar: firstNumber(source, ['surat_keluar', 'suratKeluar', 'keluar', 'total_surat_keluar', 'outgoing'], 0),
        menungguDisposisi: firstNumber(
            source,
            ['menunggu_disposisi', 'menungguDisposisi', 'pending_disposisi', 'waiting', 'disposisi'],
            0,
        ),
        selesaiDiproses: firstNumber(
            source,
            ['selesai_diproses', 'selesaiDiproses', 'selesai', 'completed', 'done'],
            0,
        ),
    };
}

function normalizeChart(data: unknown): DashboardChartPoint[] {
    return toArray(data, ['chart', 'statistik', 'statistics', 'monthly', 'grafik'])
        .map((raw, index) => {
            const source = isRecord(raw) ? raw : {};

            return {
                label: firstString(source, ['label', 'bulan', 'month', 'name'], `Bulan ${index + 1}`),
                masuk: firstNumber(source, ['masuk', 'surat_masuk', 'incoming', 'in'], 0),
                keluar: firstNumber(source, ['keluar', 'surat_keluar', 'outgoing', 'out'], 0),
            };
        })
        .filter((point) => point.masuk > 0 || point.keluar > 0);
}

function normalizeAttention(data: unknown, fallbackSurat: SuratRingkas[]): DashboardAttention {
    const source = mergeRecords(data, ['attention', 'perlu_perhatian', 'urgent', 'segera']);
    const surat = toArray(source, ['surat', 'items', 'data', 'list']).map((raw, index) => normalizeSurat(raw, index));
    const items = surat.length > 0 ? surat : fallbackSurat.filter((item) => item.sifat !== 'Biasa');

    return {
        count: firstNumber(source, ['count', 'total', 'jumlah'], items.length),
        surat: items,
    };
}

export function normalizeDashboard(payload: unknown): DashboardData {
    const data = unwrapEnvelope(payload);
    const recent = toArray(data, ['recent', 'terbaru', 'surat_masuk_terbaru', 'recentSuratMasuk', 'suratMasuk'])
        .map((raw, index) => normalizeSurat(raw, index));
    const source = isRecord(data) ? data : {};

    return {
        summary: normalizeSummary(data),
        recent,
        chart: normalizeChart(data),
        attention: normalizeAttention(data, recent),
        dateLabel: firstString(source, ['date_label', 'tanggal_hari_ini', 'today', 'tanggal'], formatTanggal(new Date())),
    };
}

function fallbackDashboard(items: unknown[], total: number): DashboardData {
    const recent = items.map((raw, index) => normalizeSurat(raw, index));

    return {
        summary: {
            suratMasuk: total,
            suratKeluar: 0,
            menungguDisposisi: recent.filter((item) => item.status === 'Baru').length,
            selesaiDiproses: recent.filter((item) => item.status === 'Selesai').length,
        },
        recent,
        chart: [],
        attention: {
            count: recent.filter((item) => item.sifat !== 'Biasa').length,
            surat: recent.filter((item) => item.sifat !== 'Biasa'),
        },
        dateLabel: formatTanggal(new Date()),
    };
}

export async function fetchDashboard(): Promise<DashboardData> {
    try {
        const payload = await request<unknown>('/api/dashboard');

        return normalizeDashboard(payload);
    } catch (error) {
        const isMissing = error instanceof HttpError && error.status === 404;

        if (!isMissing) {
            throw error;
        }

        const payload = await request<unknown>('/api/surat-masuk?per_page=5');
        const data = unwrapEnvelope(payload);
        const items = Array.isArray(data)
            ? data
            : toArray(data, ['data', 'items', 'surat', 'surat_masuk']);
        const meta = isRecord(payload) ? firstValue(payload, ['meta']) : undefined;
        const total = firstNumber(meta, ['total'], items.length);

        return fallbackDashboard(items, total);
    }
}

export async function fetchSuratMasukCount(): Promise<number> {
    const payload = await request<unknown>('/api/dashboard', { suppressUnauthorized: true });

    return normalizeDashboard(payload).summary.menungguDisposisi;
}
