export type SifatSurat = 'Biasa' | 'Segera' | 'Sangat Segera';

export type StatusSurat = 'Baru' | 'Terdisposisi' | 'Selesai';

export type UserRole = string;

export interface AuthUser {
    id: string | number | null;
    name: string;
    email: string;
    jabatan: string;
    role: UserRole;
    unit: string;
}

export interface AuthSession {
    user: AuthUser;
    token: string | null;
    remember: boolean;
}

export interface LoginCredentials {
    email: string;
    password: string;
    remember: boolean;
}

export interface ApiErrorPayload {
    message?: string;
    errors?: Record<string, string | string[]>;
}

export interface ApiEnvelope<T> {
    data: T;
    message?: string;
    meta?: PaginationMeta;
}

export interface PaginationMeta {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

export interface SuratRingkas {
    id: string | number;
    nomorAgenda: string;
    nomorSurat: string;
    perihal: string;
    pengirim: string;
    tanggal: string;
    sifat: SifatSurat;
    status: StatusSurat;
}

export interface DashboardSummary {
    suratMasuk: number;
    suratKeluar: number;
    menungguDisposisi: number;
    selesaiDiproses: number;
}

export interface DashboardChartPoint {
    label: string;
    masuk: number;
    keluar: number;
}

export interface DashboardAttention {
    count: number;
    surat: SuratRingkas[];
}

export interface DashboardData {
    summary: DashboardSummary;
    recent: SuratRingkas[];
    chart: DashboardChartPoint[];
    attention: DashboardAttention;
    dateLabel: string;
}

export interface NotificationItem {
    id: string | number;
    title: string;
    description: string;
    nomorSurat: string;
    createdAt: string;
    read: boolean;
    kind: string;
}

export interface ApiState<T> {
    data: T | null;
    loading: boolean;
    error: string | null;
    reload: () => void;
}

export interface NavigateOptions {
    replace?: boolean;
    state?: Record<string, unknown>;
}

export interface RouterState {
    pathname: string;
    search: string;
    state: Record<string, unknown>;
}
