export const ROUTES = {
    login: '/login',
    dashboard: '/dashboard',
    suratMasuk: '/surat-masuk',
    inputSuratMasuk: '/surat-masuk/input',
    detailSuratMasuk: '/surat-masuk/:id',
    suratKeluar: '/surat-keluar',
    notifikasi: '/notifikasi',
    users: '/users',
} as const;

export type RoutePath = (typeof ROUTES)[keyof typeof ROUTES];

export const ROUTE_TITLES: Record<string, string> = {
    [ROUTES.dashboard]: 'Dashboard',
    [ROUTES.suratMasuk]: 'Surat masuk',
    [ROUTES.inputSuratMasuk]: 'Input surat',
    [ROUTES.suratKeluar]: 'Surat keluar',
    [ROUTES.notifikasi]: 'Notifikasi',
    [ROUTES.users]: 'Manajemen pengguna',
};

export function detailSuratMasukPath(id: string | number): string {
    return `/surat-masuk/${encodeURIComponent(String(id))}`;
}
