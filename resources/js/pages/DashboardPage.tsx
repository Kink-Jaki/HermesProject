import { ROUTES, detailSuratMasukPath } from '../lib/constants';
import { formatHariIni, formatTanggal } from '../lib/format';
import { Link } from '../router/RouterContext';
import { fetchDashboard } from '../services/dashboardService';
import { useApi } from '../hooks/useApi';
import Alert from '../components/ui/Alert';
import EmptyState from '../components/ui/EmptyState';
import Icon from '../components/ui/Icon';
import PageHeader from '../components/ui/PageHeader';
import Skeleton from '../components/ui/Skeleton';
import StatCard from '../components/ui/StatCard';
import StatusBadge from '../components/ui/StatusBadge';
import UrgensiBadge from '../components/ui/UrgensiBadge';

export default function DashboardPage() {
    const dashboard = useApi(fetchDashboard);
    const data = dashboard.data;
    const dateLabel = data?.dateLabel || formatHariIni();

    const header = (
        <PageHeader
            actions={(
                <Link
                    className="inline-flex items-center gap-2 rounded-xl bg-brand-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-950"
                    to={ROUTES.inputSuratMasuk}
                >
                    <Icon name="plus" size={17} />
                    Input surat
                </Link>
            )}
            badge={(
                <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-500 tabular-nums">
                    {dateLabel}
                </span>
            )}
            subtitle="Ringkasan aktivitas persuratan dan agenda yang perlu Anda perhatikan hari ini."
            title="Dashboard"
        />
    );

    if (dashboard.loading) {
        return <>{header}<DashboardSkeleton /></>;
    }

    if (dashboard.error) {
        return (
            <>
                {header}
                <Alert
                    action={(
                        <button
                            className="inline-flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-xs font-semibold text-red-700 shadow-sm transition hover:bg-red-50"
                            onClick={dashboard.reload}
                            type="button"
                        >
                            <Icon name="refresh" size={14} /> Coba lagi
                        </button>
                    )}
                    message={dashboard.error}
                    title="Dashboard belum dapat dimuat"
                />
            </>
        );
    }

    if (!data) {
        return <>{header}<EmptyState description="Data dashboard belum tersedia." icon="file" title="Tidak ada data" /></>;
    }

    const maxChartValue = Math.max(1, ...data.chart.flatMap((point) => [point.masuk, point.keluar]));
    const hasContent = data.recent.length > 0 || data.chart.length > 0 || data.attention.count > 0;

    return (
        <>
            {header}

            <section aria-label="Ringkasan persuratan" className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard accent="brand" icon="inbox" label="Surat masuk" note="Total surat masuk tercatat" value={data.summary.suratMasuk} />
                <StatCard accent="emerald" icon="send" label="Surat keluar" note="Total surat keluar tercatat" value={data.summary.suratKeluar} />
                <StatCard accent="amber" icon="clock" label="Menunggu disposisi" note="Perlu tindak lanjut" value={data.summary.menungguDisposisi} />
                <StatCard accent="slate" icon="checkDouble" label="Selesai diproses" note="Surat dengan status selesai" value={data.summary.selesaiDiproses} />
            </section>

            {!hasContent ? (
                <div className="mt-5 rounded-2xl border border-slate-200 bg-white">
                    <EmptyState
                        description="Belum ada aktivitas persuratan yang dapat ditampilkan pada periode ini."
                        icon="inbox"
                        title="Belum ada aktivitas"
                    />
                </div>
            ) : (
                <>
                    <section className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-3">
                        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm xl:col-span-2">
                            <div className="flex flex-wrap items-start justify-between gap-3">
                                <div>
                                    <h2 className="text-base font-semibold text-ink">Statistik persuratan</h2>
                                    <p className="mt-1 text-xs text-slate-400">Perbandingan surat masuk dan keluar 6 bulan terakhir</p>
                                </div>
                                <div className="flex items-center gap-4 text-[11px] font-medium text-slate-500">
                                    <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-brand-900" />Masuk</span>
                                    <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-emerald-300" />Keluar</span>
                                </div>
                            </div>

                            {data.chart.length === 0 ? (
                                <EmptyState compact description="Data statistik belum tersedia dari backend." icon="file" title="Statistik kosong" />
                            ) : (
                                <div className="mt-6 flex h-52 items-end gap-2 sm:gap-4">
                                    {data.chart.map((point) => (
                                        <div className="flex h-full flex-1 flex-col items-center justify-end gap-2" key={`${point.label}-${point.masuk}`}>
                                            <div className="flex h-full w-full items-end justify-center gap-1.5">
                                                <div
                                                    className="w-3.5 rounded-t-md bg-brand-900 transition-all sm:w-5"
                                                    style={{ height: `${Math.max(4, (point.masuk / maxChartValue) * 100)}%` }}
                                                    title={`Masuk: ${point.masuk}`}
                                                />
                                                <div
                                                    className="w-3.5 rounded-t-md bg-emerald-300 transition-all sm:w-5"
                                                    style={{ height: `${Math.max(4, (point.keluar / maxChartValue) * 100)}%` }}
                                                    title={`Keluar: ${point.keluar}`}
                                                />
                                            </div>
                                            <span className="text-[11px] font-medium text-slate-500 tabular-nums">{point.label}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="rounded-2xl border border-amber-100 bg-[#FFFBEB] p-5 shadow-sm">
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex items-center gap-2.5">
                                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                                        <Icon name="alert" size={18} />
                                    </span>
                                    <div>
                                        <h2 className="text-base font-semibold text-ink">Perlu perhatian</h2>
                                        <p className="text-[11px] text-amber-700/80">Surat dengan prioritas tinggi</p>
                                    </div>
                                </div>
                                <span className="rounded-full bg-amber-200/70 px-2.5 py-1 text-xs font-semibold text-amber-900 tabular-nums">
                                    {data.attention.count}
                                </span>
                            </div>

                            <div className="mt-4 space-y-2.5">
                                {data.attention.surat.slice(0, 3).map((item) => (
                                    <div className="rounded-xl border border-amber-100 bg-white/80 px-3 py-2.5" key={item.id}>
                                        <p className="truncate text-xs font-semibold text-ink">{item.perihal}</p>
                                        <p className="mt-0.5 truncate text-[11px] text-slate-500 tabular-nums">{item.nomorSurat}</p>
                                    </div>
                                ))}
                                {data.attention.surat.length === 0 ? (
                                    <p className="rounded-xl border border-dashed border-amber-200 bg-white/60 px-3 py-4 text-center text-xs text-amber-800">
                                        Tidak ada surat mendesak saat ini.
                                    </p>
                                ) : null}
                            </div>

                            <Link
                                className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-brand-900 hover:underline"
                                to={ROUTES.suratMasuk}
                            >
                                Lihat surat masuk <Icon name="arrowRight" size={14} />
                            </Link>
                        </div>
                    </section>

                    <section className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                        <div className="flex items-center justify-between gap-4 border-b border-slate-100 px-5 py-4">
                            <div>
                                <h2 className="text-base font-semibold text-ink">Surat masuk terbaru</h2>
                                <p className="mt-0.5 text-xs text-slate-400">5 surat terakhir yang tercatat</p>
                            </div>
                            <Link className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-900 hover:underline" to={ROUTES.suratMasuk}>
                                Lihat semua <Icon name="arrowRight" size={14} />
                            </Link>
                        </div>

                        {data.recent.length === 0 ? (
                            <EmptyState compact description="Belum ada surat masuk yang tercatat." icon="inbox" title="Tidak ada surat masuk" />
                        ) : (
                            <div className="ea-scrollbar overflow-x-auto">
                                <table className="w-full min-w-[760px] text-left text-sm">
                                    <thead className="bg-canvas text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                                        <tr>
                                            <th className="px-5 py-3">Nomor / Tanggal</th>
                                            <th className="px-5 py-3">Perihal / Pengirim</th>
                                            <th className="px-5 py-3">Sifat</th>
                                            <th className="px-5 py-3">Status</th>
                                            <th className="px-5 py-3 text-right">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {data.recent.map((item) => (
                                            <tr className="transition hover:bg-brand-50/40" key={item.id}>
                                                <td className="px-5 py-3.5 align-top">
                                                    <p className="font-medium text-ink tabular-nums">{item.nomorSurat}</p>
                                                    <p className="mt-0.5 text-xs text-slate-400 tabular-nums">{formatTanggal(item.tanggal)}</p>
                                                </td>
                                                <td className="px-5 py-3.5 align-top">
                                                    <p className="font-medium text-ink">{item.perihal}</p>
                                                    <p className="mt-0.5 text-xs text-slate-400">{item.pengirim}</p>
                                                </td>
                                                <td className="px-5 py-3.5 align-top"><UrgensiBadge sifat={item.sifat} /></td>
                                                <td className="px-5 py-3.5 align-top"><StatusBadge status={item.status} /></td>
                                                <td className="px-5 py-3.5 text-right align-top">
                                                    <Link
                                                        className="inline-flex items-center gap-1 text-xs font-semibold text-brand-900 hover:underline"
                                                        to={detailSuratMasukPath(item.id)}
                                                    >
                                                        Lihat <Icon name="arrowRight" size={13} />
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </section>
                </>
            )}
        </>
    );
}

function DashboardSkeleton() {
    return (
        <div className="space-y-5" aria-label="Memuat dashboard">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {[0, 1, 2, 3].map((item) => (
                    <div className="rounded-2xl border border-slate-200 bg-white p-5" key={item}>
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="mt-4 h-9 w-20" />
                        <Skeleton className="mt-4 h-3 w-32" />
                    </div>
                ))}
            </div>
            <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
                <Skeleton className="h-72 rounded-2xl xl:col-span-2" />
                <Skeleton className="h-72 rounded-2xl" />
            </div>
            <Skeleton className="h-64 rounded-2xl" />
        </div>
    );
}
