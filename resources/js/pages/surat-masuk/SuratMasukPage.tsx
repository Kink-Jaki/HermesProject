import { useCallback, useEffect, useState } from 'react';
import Alert from '../../components/ui/Alert';
import EmptyState from '../../components/ui/EmptyState';
import Icon from '../../components/ui/Icon';
import PageHeader from '../../components/ui/PageHeader';
import Skeleton from '../../components/ui/Skeleton';
import SuratMasukFilters from '../../components/surat-masuk/SuratMasukFilters';
import SuratMasukPagination from '../../components/surat-masuk/SuratMasukPagination';
import SuratMasukSummary from '../../components/surat-masuk/SuratMasukSummary';
import SuratMasukTable from '../../components/surat-masuk/SuratMasukTable';
import { useApi } from '../../hooks/useApi';
import { ROUTES } from '../../lib/constants';
import { Link, useRouter } from '../../router/RouterContext';
import {
    fetchSuratMasuk,
} from '../../services/suratMasukService';
import type {
    SifatFilter,
    SuratMasuk,
    SuratStatusFilter,
} from '../../services/suratMasukService';

const PER_PAGE = 10;

function TableSkeleton() {
    return (
        <div className="space-y-3 px-5 py-5">
            {[0, 1, 2, 3, 4].map((row) => (
                <div className="flex items-center gap-5" key={row}>
                    <Skeleton className="h-4 w-4" />
                    <Skeleton className="h-10 w-40" />
                    <Skeleton className="h-10 flex-1" />
                    <Skeleton className="h-6 w-20 rounded-full" />
                    <Skeleton className="h-6 w-24 rounded-full" />
                    <Skeleton className="h-6 w-16" />
                </div>
            ))}
        </div>
    );
}

function exportCsv(items: SuratMasuk[]): void {
    const header = ['Nomor agenda', 'Nomor surat', 'Tanggal surat', 'Perihal', 'Pengirim', 'Sifat', 'Status'];
    const rows = items.map((item) => [
        item.nomorAgenda,
        item.nomorSurat,
        item.tanggalSurat,
        item.perihal,
        item.pengirim,
        item.sifat,
        item.status,
    ]);
    const csv = [header, ...rows]
        .map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(','))
        .join('\r\n');
    const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');

    anchor.href = url;
    anchor.download = `surat-masuk-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
}

export default function SuratMasukPage() {
    const { search } = useRouter();
    const initialQuery = new URLSearchParams(search).get('q') ?? '';
    const [status, setStatus] = useState<SuratStatusFilter>('semua');
    const [sifat, setSifat] = useState<SifatFilter>('semua');
    const [bulan, setBulan] = useState('');
    const [q, setQ] = useState(initialQuery);
    const [debouncedQ, setDebouncedQ] = useState(initialQuery);
    const [page, setPage] = useState(1);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    useEffect(() => {
        setQ(initialQuery);
        setDebouncedQ(initialQuery);
        setPage(1);
    }, [initialQuery]);

    useEffect(() => {
        const timer = window.setTimeout(() => setDebouncedQ(q), 300);

        return () => window.clearTimeout(timer);
    }, [q]);

    const fetcher = useCallback(
        () => fetchSuratMasuk({ page, perPage: PER_PAGE, status, sifat, bulan, q: debouncedQ }),
        [page, status, sifat, bulan, debouncedQ],
    );
    const { data, loading, error, reload } = useApi(fetcher);

    function changeFilter(next: { status?: SuratStatusFilter; sifat?: SifatFilter; bulan?: string }): void {
        if (next.status !== undefined) {
            setStatus(next.status);
        }

        if (next.sifat !== undefined) {
            setSifat(next.sifat);
        }

        if (next.bulan !== undefined) {
            setBulan(next.bulan);
        }

        setPage(1);
        setSelectedIds([]);
    }

    function resetFilters(): void {
        setStatus('semua');
        setSifat('semua');
        setBulan('');
        setQ('');
        setDebouncedQ('');
        setPage(1);
        setSelectedIds([]);
    }

    function toggleSelect(id: string): void {
        setSelectedIds((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
    }

    const items = data?.items ?? [];

    function toggleAll(): void {
        const ids = items.map((item) => String(item.id));
        const allSelected = ids.length > 0 && ids.every((id) => selectedIds.includes(id));

        setSelectedIds(allSelected ? [] : ids);
    }

    return (
        <>
            <PageHeader
                actions={(
                    <>
                        <button
                            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50 disabled:opacity-50"
                            disabled={loading || items.length === 0}
                            onClick={() => exportCsv(items)}
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

            <SuratMasukSummary loading={loading} summary={data?.summary ?? { total: 0, baru: 0, terdisposisi: 0, selesai: 0 }} />

            <div className="mt-5">
                <SuratMasukFilters
                    bulan={bulan}
                    onBulanChange={(value) => changeFilter({ bulan: value })}
                    onQChange={(value) => { setQ(value); setPage(1); }}
                    onReset={resetFilters}
                    onSifatChange={(value) => changeFilter({ sifat: value })}
                    onStatusChange={(value) => changeFilter({ status: value })}
                    q={q}
                    sifat={sifat}
                    status={status}
                />
            </div>

            <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                {loading ? (
                    <TableSkeleton />
                ) : error ? (
                    <div className="p-5">
                        <Alert
                            action={(
                                <button className="text-xs font-semibold underline" onClick={reload} type="button">Coba lagi</button>
                            )}
                            message={error}
                            title="Surat masuk gagal dimuat"
                        />
                    </div>
                ) : items.length === 0 ? (
                    <EmptyState
                        action={(
                            <button className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50" onClick={resetFilters} type="button">
                                Reset filter
                            </button>
                        )}
                        description="Coba ubah kata kunci atau filter untuk menemukan surat yang dicari."
                        icon="inbox"
                        title="Tidak ada surat ditemukan"
                    />
                ) : (
                    <>
                        <SuratMasukTable
                            items={items}
                            onToggleAll={toggleAll}
                            onToggleSelect={toggleSelect}
                            selectedIds={selectedIds}
                        />
                        <SuratMasukPagination meta={data?.meta ?? { current_page: 1, last_page: 1, per_page: PER_PAGE, total: items.length }} onPageChange={(nextPage) => { setPage(nextPage); setSelectedIds([]); }} />
                    </>
                )}
            </div>
        </>
    );
}
