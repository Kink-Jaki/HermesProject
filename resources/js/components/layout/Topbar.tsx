import { useState } from 'react';
import type { FormEvent } from 'react';
import { ROUTE_TITLES } from '../../lib/constants';
import { getInitials } from '../../lib/format';
import { useAuth } from '../../hooks/useAuth';
import { useApi } from '../../hooks/useApi';
import { Link, useRouter } from '../../router/RouterContext';
import { fetchNotifications } from '../../services/notificationService';
import Icon from '../ui/Icon';

interface TopbarProps {
    onMenuClick: () => void;
    onLogout: () => void;
}

export default function Topbar({ onMenuClick, onLogout }: TopbarProps) {
    const { user } = useAuth();
    const { pathname, search, navigate } = useRouter();
    const notifications = useApi(fetchNotifications);
    const [query, setQuery] = useState(() => new URLSearchParams(search).get('q') ?? '');
    const [profileOpen, setProfileOpen] = useState(false);

    const unreadCount = notifications.data?.filter((item) => !item.read).length ?? 0;
    const currentTitle = ROUTE_TITLES[pathname]
        ?? (pathname.startsWith('/surat-masuk/') ? 'Detail surat' : 'Administrasi');
    const breadcrumb = pathname === '/dashboard' ? 'Workspace / Administrasi' : `Workspace / ${currentTitle}`;

    const handleSearch = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const trimmed = query.trim();

        navigate(trimmed === '' ? '/surat-masuk' : `/surat-masuk?q=${encodeURIComponent(trimmed)}`);
    };

    const handleLogout = () => {
        setProfileOpen(false);
        onLogout();
    };

    return (
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-slate-200 bg-white px-4 sm:px-6 lg:px-8">
            <button
                aria-label="Buka menu"
                className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 lg:hidden"
                onClick={onMenuClick}
                type="button"
            >
                <Icon name="menu" size={20} />
            </button>

            <div className="hidden min-w-0 md:block">
                <p className="truncate text-sm font-semibold text-ink">{breadcrumb}</p>
                <p className="text-[11px] text-slate-400">Sistem Persuratan Digital</p>
            </div>

            <div className="ml-auto flex items-center gap-2 sm:gap-3">
                <form className="relative hidden sm:block" onSubmit={handleSearch}>
                    <Icon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" name="search" size={17} />
                    <input
                        aria-label="Cari surat, nomor, atau pengirim"
                        className="w-[220px] rounded-xl border border-slate-200 bg-canvas py-2 pl-10 pr-3 text-sm text-ink outline-none transition placeholder:text-slate-400 focus:w-[280px] focus:border-brand-800 focus:bg-white lg:w-[280px]"
                        onChange={(event) => setQuery(event.target.value)}
                        placeholder="Cari surat, nomor, atau pengirim..."
                        type="search"
                        value={query}
                    />
                </form>

                <button
                    aria-label="Cari surat"
                    className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 sm:hidden"
                    onClick={() => navigate('/surat-masuk')}
                    type="button"
                >
                    <Icon name="search" size={19} />
                </button>

                <Link
                    aria-label={`Notifikasi${unreadCount > 0 ? `, ${unreadCount} belum dibaca` : ''}`}
                    className="relative rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-brand-900"
                    to="/notifikasi"
                >
                    <Icon name="bell" size={19} />
                    {unreadCount > 0 ? (
                        <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
                    ) : null}
                </Link>

                <span className="hidden h-7 w-px bg-slate-200 sm:block" />

                <div className="relative">
                    <button
                        className="flex items-center gap-2.5 rounded-xl border border-slate-200 bg-white py-1.5 pl-1.5 pr-2.5 transition hover:border-brand-200 hover:bg-brand-50/40"
                        onClick={() => setProfileOpen((current) => !current)}
                        type="button"
                    >
                        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-900 text-xs font-semibold text-white">
                            {getInitials(user?.name ?? 'Administrator')}
                        </span>
                        <span className="hidden text-left lg:block">
                            <span className="block text-xs font-semibold text-ink">{user?.name ?? 'Administrator'}</span>
                            <span className="block text-[10px] text-slate-400">{user?.jabatan ?? 'Super Admin'}</span>
                        </span>
                        <Icon className="hidden text-slate-400 lg:block" name="chevronRight" size={14} />
                    </button>

                    {profileOpen ? (
                        <div className="absolute right-0 top-full z-40 mt-2 w-56 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl">
                            <div className="border-b border-slate-100 px-3 py-2.5">
                                <p className="truncate text-sm font-semibold text-ink">{user?.name ?? 'Administrator'}</p>
                                <p className="truncate text-[11px] text-slate-500">{user?.email || user?.unit || 'Super Admin'}</p>
                            </div>
                            <button
                                className="mt-1 flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm text-slate-600 transition hover:bg-slate-50"
                                onClick={() => setProfileOpen(false)}
                                type="button"
                            >
                                <Icon name="user" size={16} /> Profil
                            </button>
                            <button
                                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm text-red-600 transition hover:bg-red-50"
                                onClick={handleLogout}
                                type="button"
                            >
                                <Icon name="logout" size={16} /> Keluar
                            </button>
                        </div>
                    ) : null}
                </div>
            </div>
        </header>
    );
}
