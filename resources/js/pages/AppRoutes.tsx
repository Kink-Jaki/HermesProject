import type { ReactNode } from 'react';
import ProtectedRoute from '../components/auth/ProtectedRoute';
import AppShell from '../components/layout/AppShell';
import { matchPath, useRouter } from '../router/RouterContext';
import DashboardPage from './DashboardPage';
import DetailSuratMasukPage from './DetailSuratMasukPage';
import InputSuratMasukPage from './InputSuratMasukPage';
import LoginPage from './LoginPage';
import NotFoundPage from './NotFoundPage';
import NotificationsPage from './NotificationsPage';
import SuratKeluarPage from './SuratKeluarPage';
import SuratMasukPage from './SuratMasukPage';
import UsersPage from './UsersPage';

interface AppRoute {
    pattern: string;
    element: ReactNode;
    protected: boolean;
}

const ROUTES: AppRoute[] = [
    { pattern: '/login', element: <LoginPage />, protected: false },
    { pattern: '/dashboard', element: <DashboardPage />, protected: true },
    { pattern: '/surat-masuk', element: <SuratMasukPage />, protected: true },
    { pattern: '/surat-masuk/input', element: <InputSuratMasukPage />, protected: true },
    { pattern: '/surat-masuk/:id', element: <DetailSuratMasukPage />, protected: true },
    { pattern: '/surat-keluar', element: <SuratKeluarPage />, protected: true },
    { pattern: '/notifikasi', element: <NotificationsPage />, protected: true },
    { pattern: '/users', element: <UsersPage />, protected: true },
];

export default function AppRoutes() {
    const { pathname } = useRouter();

    for (const route of ROUTES) {
        if (matchPath(route.pattern, pathname)) {
            if (!route.protected) {
                return <>{route.element}</>;
            }

            return (
                <ProtectedRoute>
                    <AppShell>{route.element}</AppShell>
                </ProtectedRoute>
            );
        }
    }

    return (
        <ProtectedRoute>
            <AppShell><NotFoundPage /></AppShell>
        </ProtectedRoute>
    );
}
