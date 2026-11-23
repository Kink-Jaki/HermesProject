import { ROUTES } from '../../lib/constants';
import { useAuth } from '../../hooks/useAuth';
import { Link, useRouter } from '../../router/RouterContext';
import Icon from '../ui/Icon';
import type { IconName } from '../ui/Icon';

interface SidebarProps {
    open: boolean;
    suratCount: number;
    onClose: () => void;
    onLogout: () => void;
}

interface NavItem {
    path: string;
    label: string;
    icon: IconName;
    badge?: number;
}

export default function Sidebar({ open, suratCount, onClose, onLogout }: SidebarProps) {
    const { pathname } = useRouter();
    const { isAdmin } = useAuth();

    const mainItems: NavItem[] = [
        { path: ROUTES.dashboard, label: 'Dashboard', icon: 'dashboard' },
        { path: ROUTES.suratMasuk, label: 'Surat masuk', icon: 'inbox', badge: suratCount },
        { path: ROUTES.suratKeluar, label: 'Surat keluar', icon: 'send' },
    ];

    const adminItems: NavItem[] = [
        { path: ROUTES.users, label: 'Manajemen pengguna', icon: 'users' },
    ];

    const isActive = (path: string) => {
        if (path === ROUTES.suratMasuk) {
            return pathname.startsWith(ROUTES.suratMasuk);
        }

        return pathname === path;
    };

    const renderItem = (item: NavItem) => {
        const active = isActive(item.path);

        return (
            <Link
                className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                    active
                        ? 'bg-brand-50 text-brand-900'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-brand-900'
                }`}
                key={item.path}
                onClick={onClose}
                to={item.path}
            >
                <Icon className={active ? 'text-brand-900' : 'text-slate-400 group-hover:text-brand-800'} name={item.icon} size={19} />
                <span className="flex-1">{item.label}</span>
                {typeof item.badge === 'number' && item.badge > 0 ? (
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-brand-900 tabular-nums">
                        {item.badge}
                    </span>
                ) : null}
            </Link>
        );
    };

    return (
        <aside className={`ea-sidebar fixed inset-y-0 left-0 z-40 flex w-[260px] flex-col border-r border-slate-200 bg-white transition-transform duration-200 lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
            <div className="flex h-[72px] shrink-0 items-center gap-3 border-b border-slate-100 px-5">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-900 text-white shadow-sm shadow-brand-900/20">
                    <Icon name="shield" size={22} />
                </span>
                <div className="min-w-0">
                    <p className="text-lg font-semibold leading-tight tracking-tight text-brand-900">e-Agenda</p>
                    <p className="mt-0.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                        Administrasi Persuratan
                    </p>
                </div>
            </div>

            <nav className="ea-scrollbar flex-1 overflow-y-auto px-3 py-6">
                <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">Menu utama</p>
                <div className="space-y-1">{mainItems.map(renderItem)}</div>

                {isAdmin ? (
                    <>
                        <p className="mb-2 mt-7 px-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">Administrator</p>
                        <div className="space-y-1">{adminItems.map(renderItem)}</div>
                    </>
                ) : null}
            </nav>

            <div className="shrink-0 space-y-3 border-t border-slate-100 p-3">
                <div className="rounded-xl border border-emerald-100 bg-brand-50/70 p-3.5">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-brand-900 shadow-sm">
                        <Icon name="help" size={17} />
                    </span>
                    <p className="mt-2.5 text-sm font-semibold text-ink">Butuh bantuan?</p>
                    <p className="mt-1 text-[11px] leading-relaxed text-slate-500">
                        Temukan panduan penggunaan sistem persuratan.
                    </p>
                    <a className="mt-2.5 inline-flex items-center gap-1 text-xs font-semibold text-brand-900 hover:underline" href="#panduan">
                        Buka panduan <Icon name="external" size={13} />
                    </a>
                </div>

                <button
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-red-50 hover:text-red-700"
                    onClick={onLogout}
                    type="button"
                >
                    <Icon name="logout" size={19} />
                    Keluar
                </button>
            </div>
        </aside>
    );
}
