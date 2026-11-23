import Icon from '../components/ui/Icon';
import PageHeader from '../components/ui/PageHeader';
import Skeleton from '../components/ui/Skeleton';
import StatusBadge from '../components/ui/StatusBadge';
import UrgensiBadge from '../components/ui/UrgensiBadge';
import { ROUTES } from '../lib/constants';
import { Link, matchPath, useRouter } from '../router/RouterContext';

const METADATA = [
    { label: 'Nomor agenda', value: '—' },
    { label: 'Pengirim', value: '—' },
    { label: 'Tanggal surat', value: '—' },
    { label: 'Tanggal diterima', value: '—' },
    { label: 'Klasifikasi', value: '—' },
    { label: 'Dicatat oleh', value: '—' },
];

const TIMELINE = [
    { label: 'Surat diterima', time: 'Menunggu data', active: true },
    { label: 'Disposisi diberikan', time: 'Belum tersedia', active: false },
    { label: 'Selesai diproses', time: 'Belum tersedia', active: false },
];

export default function DetailSuratMasukPage() {
    const { pathname } = useRouter();
    const params = matchPath(ROUTES.detailSuratMasuk, pathname);
    const id = params?.id ?? '-';

    return (
        <>
            <PageHeader
                actions={(
                    <>
                        <button className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 shadow-sm" type="button">
                            <Icon name="download" size={16} /> Unduh
                        </button>
                        <button className="inline-flex items-center gap-2 rounded-xl bg-brand-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm opacity-60" disabled type="button">
                            <Icon name="send" size={16} /> Disposisi surat
                        </button>
                    </>
                )}
                breadcrumb={(
                    <span className="flex items-center gap-1.5">
                        <Link className="hover:text-brand-900" to={ROUTES.suratMasuk}>Surat masuk</Link>
                        <Icon name="chevronRight" size={12} />
                        Detail surat
                    </span>
                )}
                subtitle="Pratinjau dokumen, metadata, dan riwayat aktivitas surat."
                title="Detail surat masuk"
            />

            <div className="mb-5 flex flex-wrap items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
                <span className="text-xs font-semibold text-slate-500 tabular-nums">ID: {id}</span>
                <StatusBadge status="Baru" />
                <UrgensiBadge sifat="Biasa" />
            </div>

            <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
                <div className="space-y-5 xl:col-span-2">
                    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-3">
                            <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
                                <Icon name="file" size={16} />
                                dokumen-surat.pdf
                            </div>
                            <div className="flex items-center gap-4 text-[11px] text-slate-400 tabular-nums">
                                <span>1/1</span>
                                <span>100%</span>
                            </div>
                        </div>
                        <div className="flex min-h-[380px] items-center justify-center bg-slate-100 px-6 py-10">
                            <div className="flex h-[300px] w-full max-w-[420px] flex-col rounded-lg bg-white p-8 shadow-md">
                                <Skeleton className="mx-auto h-4 w-2/3" />
                                <Skeleton className="mx-auto mt-3 h-3 w-1/2" />
                                <div className="mt-8 space-y-3">
                                    <Skeleton className="h-2.5 w-full" />
                                    <Skeleton className="h-2.5 w-11/12" />
                                    <Skeleton className="h-2.5 w-4/5" />
                                    <Skeleton className="h-2.5 w-full" />
                                    <Skeleton className="h-2.5 w-3/4" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-emerald-100 bg-brand-50/60 p-5">
                        <div className="flex items-center gap-2 text-sm font-semibold text-brand-900">
                            <Icon name="sparkles" size={17} /> Ringkasan AI
                        </div>
                        <p className="mt-2 text-xs leading-relaxed text-slate-500">
                            Ringkasan otomatis akan tersedia setelah modul AI dan dokumen surat terhubung pada Tahap 2.
                        </p>
                    </div>
                </div>

                <div className="space-y-5">
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <h2 className="text-sm font-semibold text-ink">Informasi surat</h2>
                        <dl className="mt-4 space-y-3.5">
                            {METADATA.map((item) => (
                                <div className="flex items-start justify-between gap-4" key={item.label}>
                                    <dt className="text-xs text-slate-400">{item.label}</dt>
                                    <dd className="text-right text-xs font-medium text-ink tabular-nums">{item.value}</dd>
                                </div>
                            ))}
                        </dl>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <h2 className="text-sm font-semibold text-ink">Riwayat aktivitas</h2>
                        <ol className="mt-4 space-y-4">
                            {TIMELINE.map((item) => (
                                <li className="flex gap-3" key={item.label}>
                                    <span className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${item.active ? 'bg-brand-800' : 'bg-slate-300'}`} />
                                    <div>
                                        <p className="text-xs font-medium text-ink">{item.label}</p>
                                        <p className="mt-0.5 text-[11px] text-slate-400">{item.time}</p>
                                    </div>
                                </li>
                            ))}
                        </ol>
                    </div>
                </div>
            </div>
        </>
    );
}
