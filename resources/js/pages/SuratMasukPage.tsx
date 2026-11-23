import EmptyState from '../components/ui/EmptyState';
import Icon from '../components/ui/Icon';
import PageHeader from '../components/ui/PageHeader';
import Skeleton from '../components/ui/Skeleton';
import { ROUTES } from '../lib/constants';
import { Link } from '../router/RouterContext';

const SUMMARY = [
    { label: 'Total surat', value: '—', tone: 'border-slate-200' },
    { label: 'Baru', value: '—', tone: 'border-emerald-200' },
    { label: 'Terdisposisi', value: '—', tone: 'border-sky-200' },
    { label: 'Selesai', value: '—', tone: 'border-slate-200' },
];

const TABS = ['Semua surat', 'Baru', 'Terdisposisi', 'Selesai'];

export default function SuratMasukPage() {
    return (
        <>
            <PageHeader
                actions={(
                    <>
                        <button
                            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50"
                            type="button"
                        >
                            <Icon name="download" size={16} /> Ekspor
                        </button>
                        <Link
                            className="inline-flex items-center gap-2 rounded-xl bg-brand-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-950"
                            to={ROUTES.inputSuratMasuk}
                        >
                            <Icon name="plus" size={17} /> Input surat
                        </Link>
                    </>
                )}
                subtitle="Kelola seluruh surat masuk, mulai dari pencatatan hingga disposisi."
                title="Surat masuk"
            />

            <section aria-label="Ringkasan surat masuk" className="grid grid-cols-2 gap-4 xl:grid-cols-4">
                {SUMMARY.map((item) => (
                    <div className={`rounded-2xl border ${item.tone} bg-white p-4 shadow-sm`} key={item.label}>
                        <p className="text-xs font-medium text-slate-500">{item.label}</p>
                        <p className="mt-2 text-2xl font-semibold text-ink tabular-nums">{item.value}</p>
                    </div>
                ))}
            </section>

            <div className="mt-5 rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 px-4 py-3">
                    {TABS.map((tab, index) => (
                        <button
                            className={`rounded-lg px-3 py-2 text-xs font-semibold transition ${index === 0 ? 'bg-brand-50 text-brand-900' : 'text-slate-500 hover:bg-slate-50'}`}
                            key={tab}
                            type="button"
                        >
                            {tab}
                        </button>
                    ))}
                </div>
                <div className="flex flex-wrap gap-3 border-b border-slate-100 px-4 py-3">
                    <Skeleton className="h-9 w-full max-w-xs" />
                    <Skeleton className="h-9 w-32" />
                    <Skeleton className="h-9 w-32" />
                </div>
                <EmptyState
                    description="Tabel surat masuk, filter lanjutan, dan pagination akan dihubungkan pada Tahap 2."
                    icon="inbox"
                    title="Daftar surat masuk siap diisi"
                />
            </div>
        </>
    );
}
