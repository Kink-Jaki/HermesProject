import { useMemo, useState } from 'react';
import Alert from '../components/ui/Alert';
import EmptyState from '../components/ui/EmptyState';
import Icon from '../components/ui/Icon';
import PageHeader from '../components/ui/PageHeader';
import Skeleton from '../components/ui/Skeleton';
import { useApi } from '../hooks/useApi';
import { useRouter } from '../router/RouterContext';
import { detailSuratMasukPath, fetchNotificationRows, formatRelativeTime, isToday, markAllNotificationsRead, type NotificationRow } from './notifikasi/notificationUtils';

type Filter = 'all' | 'unread';
type KindFilter = 'all' | 'surat' | 'disposisi';

function groupLabel(kind: string): string {
    return kind.toLowerCase().includes('disposisi') ? 'disposisi' : 'surat';
}

export default function NotificationsPage() {
    const notifications = useApi(fetchNotificationRows);
    const { navigate } = useRouter();
    const [filter, setFilter] = useState<Filter>('all');
    const [kind, setKind] = useState<KindFilter>('all');
    const [marking, setMarking] = useState(false);
    const [markError, setMarkError] = useState<string | null>(null);

    const items = notifications.data ?? [];
    const unreadCount = items.filter((item) => !item.read).length;

    const filtered = useMemo(() => items.filter((item) => {
        if (filter === 'unread' && item.read) return false;
        if (kind !== 'all' && groupLabel(item.kind) !== kind) return false;
        return true;
    }), [items, filter, kind]);

    const todayItems = filtered.filter((item) => isToday(item.createdAt));
    const earlierItems = filtered.filter((item) => !isToday(item.createdAt));

    const handleMarkAll = async () => {
        setMarking(true); setMarkError(null);
        try {
            await markAllNotificationsRead();
            notifications.reload();
        } catch (reason) {
            setMarkError(reason instanceof Error && reason.message ? reason.message : 'Gagal menandai notifikasi sebagai dibaca.');
        } finally { setMarking(false); }
    };

    const handleClick = (item: NotificationRow) => {
        if (item.suratMasukId !== null) {
            navigate(detailSuratMasukPath(item.suratMasukId));
        }
    };

    return (
        <>
            <PageHeader
                actions={(
                    <button className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 shadow-sm transition hover:border-brand-200 hover:text-brand-900 disabled:opacity-60" disabled={marking || unreadCount === 0} onClick={() => { void handleMarkAll(); }} type="button">
                        <Icon name="checkDouble" size={16} />
                        {marking ? 'Memproses...' : 'Tandai semua dibaca'}
                    </button>
                )}
                subtitle="Pantau surat masuk, disposisi, dan pembaruan status terbaru."
                title="Notifikasi"
            />

            {markError ? <div className="mb-4"><Alert message={markError} title="Gagal memperbarui notifikasi" /></div> : null}

            <div className="mb-4 flex flex-wrap items-center gap-3">
                <div className="flex flex-wrap gap-1 rounded-xl border border-slate-200 bg-white p-1">
                    <button className={`rounded-lg px-3.5 py-2 text-xs font-semibold transition ${filter === 'all' ? 'bg-brand-50 text-brand-900' : 'text-slate-500 hover:bg-slate-50'}`} onClick={() => setFilter('all')} type="button">
                        Semua notifikasi
                        <span className="ml-1.5 rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] tabular-nums">{items.length}</span>
                    </button>
                    <button className={`rounded-lg px-3.5 py-2 text-xs font-semibold transition ${filter === 'unread' ? 'bg-brand-50 text-brand-900' : 'text-slate-500 hover:bg-slate-50'}`} onClick={() => setFilter('unread')} type="button">
                        Belum dibaca
                        <span className="ml-1.5 rounded-full bg-emerald-100 px-1.5 py-0.5 text-[10px] text-brand-900 tabular-nums">{unreadCount}</span>
                    </button>
                </div>

                <label className="ml-auto flex items-center gap-2 text-xs font-medium text-slate-500">
                    <Icon name="filter" size={15} />
                    <select className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 outline-none focus:border-brand-800" onChange={(event) => setKind(event.target.value as KindFilter)} value={kind}>
                        <option value="all">Semua jenis</option>
                        <option value="surat">Surat</option>
                        <option value="disposisi">Disposisi</option>
                    </select>
                </label>
            </div>

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                {notifications.loading ? (
                    <div className="space-y-3 p-5">{[0, 1, 2, 3].map((item) => (
                        <div className="flex gap-3 rounded-xl border border-slate-100 p-4" key={item}>
                            <Skeleton className="h-10 w-10 rounded-xl" /><div className="flex-1"><Skeleton className="h-4 w-2/5" /><Skeleton className="mt-2 h-3 w-4/5" /><Skeleton className="mt-2 h-3 w-1/3" /></div>
                        </div>
                    ))}</div>
                ) : notifications.error ? (
                    <div className="p-5"><Alert action={<button className="inline-flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-xs font-semibold text-red-700 shadow-sm" onClick={notifications.reload} type="button"><Icon name="refresh" size={14} /> Coba lagi</button>} message={notifications.error} title="Notifikasi belum dapat dimuat" /></div>
                ) : filtered.length === 0 ? (
                    <EmptyState description={items.length === 0 ? 'Belum ada notifikasi untuk akun Anda saat ini.' : 'Tidak ada notifikasi yang sesuai dengan filter yang dipilih.'} icon="bell" title="Tidak ada notifikasi" />
                ) : (
                    <div className="divide-y divide-slate-100">
                        {todayItems.length > 0 ? <NotificationGroup items={todayItems} label="HARI INI" onClick={handleClick} /> : null}
                        {earlierItems.length > 0 ? <NotificationGroup items={earlierItems} label="SEBELUMNYA" onClick={handleClick} /> : null}
                    </div>
                )}
            </div>
        </>
    );
}

function NotificationGroup({ label, items, onClick }: { label: string; items: NotificationRow[]; onClick: (item: NotificationRow) => void }) {
    return (
        <section>
            <div className="bg-canvas px-5 py-2.5"><p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">{label}</p></div>
            <div className="divide-y divide-slate-100">
                {items.map((item) => (
                    <button className={`flex w-full gap-3 px-5 py-4 text-left transition ${item.read ? 'bg-white hover:bg-slate-50/70' : 'bg-brand-50/50 hover:bg-brand-50'}`} key={item.id} onClick={() => onClick(item)} type="button">
                        <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${item.read ? 'bg-slate-100 text-slate-500' : 'bg-white text-brand-900 shadow-sm ring-1 ring-emerald-100'}`}>
                            <Icon name={groupLabel(item.kind) === 'disposisi' ? 'send' : 'file'} size={18} />
                        </span>
                        <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-start justify-between gap-2">
                                <p className={`text-sm ${item.read ? 'font-medium text-slate-700' : 'font-semibold text-ink'}`}>{item.title}</p>
                                <div className="flex items-center gap-2">
                                    <span className="text-[11px] text-slate-400 tabular-nums">{formatRelativeTime(item.createdAt)}</span>
                                    {!item.read ? <span className="h-2 w-2 rounded-full bg-brand-800" /> : null}
                                </div>
                            </div>
                            {item.description ? <p className="mt-1 text-xs leading-relaxed text-slate-500">{item.description}</p> : null}
                            {item.nomorSurat ? <p className="mt-1.5 text-xs font-semibold text-brand-900 tabular-nums">{item.nomorSurat}</p> : null}
                        </div>
                    </button>
                ))}
            </div>
        </section>
    );
}
