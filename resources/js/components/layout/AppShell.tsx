import { useState } from 'react';
import type { ReactNode } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useApi } from '../../hooks/useApi';
import { errorMessage } from '../../services/http';
import { fetchSuratMasukCount } from '../../services/dashboardService';
import ConfirmModal from '../ui/ConfirmModal';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

export default function AppShell({ children }: { children: ReactNode }) {
    const { logout } = useAuth();
    const suratCount = useApi(fetchSuratMasukCount);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [confirmLogout, setConfirmLogout] = useState(false);
    const [loggingOut, setLoggingOut] = useState(false);
    const [logoutError, setLogoutError] = useState<string | null>(null);

    const handleLogout = async () => {
        setLoggingOut(true);
        setLogoutError(null);

        try {
            await logout();
        } catch (reason) {
            setLogoutError(errorMessage(reason, 'Gagal keluar. Silakan coba lagi.'));
            setLoggingOut(false);
        }
    };

    return (
        <div className="min-h-screen bg-canvas">
            <Sidebar
                open={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
                onLogout={() => setConfirmLogout(true)}
                suratCount={suratCount.data ?? 0}
            />

            {sidebarOpen ? (
                <button
                    aria-label="Tutup menu"
                    className="fixed inset-0 z-30 bg-slate-950/40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                    type="button"
                />
            ) : null}

            <div className="min-h-screen lg:pl-[260px]">
                <Topbar
                    onLogout={() => setConfirmLogout(true)}
                    onMenuClick={() => setSidebarOpen(true)}
                />
                <main className="mx-auto w-full max-w-[1500px] px-4 py-6 sm:px-6 lg:px-8 lg:py-7">
                    {children}
                </main>
            </div>

            <ConfirmModal
                cancelLabel="Batal"
                confirmLabel={loggingOut ? 'Memproses...' : 'Ya, keluar'}
                description={logoutError ?? 'Anda akan keluar dari sesi e-Agenda. Pastikan perubahan penting telah disimpan.'}
                loading={loggingOut}
                onCancel={() => {
                    if (!loggingOut) {
                        setConfirmLogout(false);
                        setLogoutError(null);
                    }
                }}
                onConfirm={() => { void handleLogout(); }}
                open={confirmLogout}
                title="Keluar dari e-Agenda?"
            />
        </div>
    );
}
