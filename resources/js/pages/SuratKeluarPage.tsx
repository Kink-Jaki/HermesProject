import { useCallback, useEffect, useMemo, useState } from 'react';
import Alert from '../components/ui/Alert';
import EmptyState from '../components/ui/EmptyState';
import Icon from '../components/ui/Icon';
import PageHeader from '../components/ui/PageHeader';
import Skeleton from '../components/ui/Skeleton';
import UrgensiBadge from '../components/ui/UrgensiBadge';
import StatusSuratKeluarBadge from '../components/surat-keluar/StatusSuratKeluarBadge';
import SuratKeluarFormModal from '../components/surat-keluar/SuratKeluarFormModal';
import SuratKeluarStatCard from '../components/surat-keluar/SuratKeluarStatCard';
import { formatNumber, formatTanggal } from '../lib/format';
import { errorMessage } from '../services/http';
import {
    createSuratKeluar, fetchSuratKeluar, fetchUnitOptions, updateSuratKeluar,
    type OptionItem, type StatusSuratKeluar, type SuratKeluarItem, type SuratKeluarPayload, type SuratKeluarSummary,
} from '../services/suratKeluarService';

type StatusFilter = 'all' | StatusSuratKeluar;
const TABS: { key: StatusFilter; label: string }[] = [
    { key: 'all', label: 'Semua surat' },
    { key: 'Draft', label: 'Draft' },
    { key: 'Terkirim', label: 'Terkirim' },
    { key: 'Arsip', label: 'Arsip' },
];
const EMPTY_SUMMARY: SuratKeluarSummary = { total: 0, draft: 0, terkirim: 0, arsip: 0 };

export default function SuratKeluarPage() {
    const [items, setItems] = useState<SuratKeluarItem[]>([]);
    const [summary, setSummary] = useState<SuratKeluarSummary>(EMPTY_SUMMARY);
    const [meta, setMeta] = useState({ current_page: 1, last_page: 1, per_page: 10, total: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState('');
    const [searchInput, setSearchInput] = useState('');
    const [status, setStatus] = useState<StatusFilter>('all');
    const [unitId, setUnitId] = useState('');
    const [bulan, setBulan] = useState('');
    const [page, setPage] = useState(1);
    const [units, setUnits] = useState<OptionItem[]>([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState<SuratKeluarItem | null>(null);
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);
    const [reloadKey, setReloadKey] = useState(0);

    useEffect(() => { fetchUnitOptions().then(setUnits).catch(() => undefined); }, []);
    useEffect(() => { const t = window.setTimeout(() => { setPage(1); setSearch(searchInput); }, 350); return () => window.clearTimeout(t); }, [searchInput]);

    const load = useCallback(async () => {
        setLoading(true); setError(null);
        try {
            const res = await fetchSuratKeluar({ search, status, unitId, bulan, page, perPage: 10 });
            setItems(res.items); setSummary(res.summary); setMeta(res.meta);
        } catch (reason) { setError(errorMessage(reason, 'Gagal memuat data surat keluar.')); }
        finally { setLoading(false); }
    }, [search, status, unitId, bulan, page, reloadKey]);
    useEffect(() => { void load(); }, [load]);

    const monthOptions = useMemo(() => {
        const now = new Date();
        return Array.from({ length: 12 }, (_, i) => {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            return { value: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`, label: d.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' }) };
        });
    }, []);

    const openCreate = () => { setEditing(null); setSaveError(null); setModalOpen(true); };
    const openEdit = (item: SuratKeluarItem) => { setEditing(item); setSaveError(null); setModalOpen(true); };
    const handleSubmit = async (payload: SuratKeluarPayload) => {
        setSaving(true); setSaveError(null);
        try {
            if (editing) await updateSuratKeluar(editing.id, payload); else await createSuratKeluar(payload);
            setModalOpen(false); setEditing(null); setReloadKey((k) => k + 1);
        } catch (reason) { setSaveError(errorMessage(reason, 'Gagal menyimpan surat keluar.')); }
        finally { setSaving(false); }
    };

    return (
        <>
            <PageHeader
                actions={<button className="inline-flex items-center gap-2 rounded-xl bg-brand-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-950" onClick={openCreate} type="button"><Icon name="plus" size={17} /> Buat surat keluar</button>}
                subtitle="Kelola pembuatan, pengiriman, dan arsip surat keluar."
                title="Surat keluar"
            />
            <section className="grid grid-cols-2 gap-4 xl:grid-cols-4" aria-label="Ringkasan surat keluar">
                <SuratKeluarStatCard icon="file" label="Total" tone="slate" value={formatNumber(summary.total)} />
                <SuratKeluarStatCard icon="clock" label="Draft" tone="amber" value={formatNumber(summary.draft)} />
                <SuratKeluarStatCard icon="send" label="Terkirim" tone="sky" value={formatNumber(summary.terkirim)} />
                <SuratKeluarStatCard icon="check" label="Arsip" tone="emerald" value={formatNumber(summary.arsip)} />
            </section>

            <div className="mt-5 rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 px-4 py-3">
                    {TABS.map((tab) => (
                        <button key={tab.key} className={`rounded-lg px-3 py-2 text-xs font-semibold transition ${status === tab.key ? 'bg-brand-50 text-brand-900' : 'text-slate-500 hover:bg-slate-50'}`} onClick={() => { setStatus(tab.key); setPage(1); }} type="button">{tab.label}</button>
                    ))}
                </div>
                <div className="flex flex-wrap gap-3 border-b border-slate-100 px-4 py-3">
                    <label className="relative min-w-[220px] flex-1">
                        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" name="search" size={16} />
                        <input className="w-full rounded-xl border border-slate-200 py-2 pl-9 pr-3 text-sm outline-none focus:border-brand-800" placeholder="Cari nomor, perihal, atau tujuan..." value={searchInput} onChange={(e) => setSearchInput(e.target.value)} />
                    </label>
                    <select className="rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-600 outline-none focus:border-brand-800" value={unitId} onChange={(e) => { setUnitId(e.target.value); setPage(1); }}>
                        <option value="">Semua unit</option>
                        {units.map((u) => <option key={u.value} value={u.value}>{u.label}</option>)}
                    </select>
                    <select className="rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-600 outline-none focus:border-brand-800" value={bulan} onChange={(e) => { setBulan(e.target.value); setPage(1); }}>
                        <option value="">Semua bulan</option>
                        {monthOptions.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
                    </select>
                </div>

                {loading ? (
                    <div className="space-y-3 p-5">{[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
                ) : error ? (
                    <div className="p-5"><Alert action={<button className="rounded-lg bg-white px-3 py-2 text-xs font-semibold text-red-700 shadow-sm" onClick={() => setReloadKey((k) => k + 1)} type="button"><span className="inline-flex items-center gap-1"><Icon name="refresh" size={14} />Coba lagi</span></button>} message={error} title="Data surat keluar belum dapat dimuat" /></div>
                ) : items.length === 0 ? (
                    <EmptyState action={<button className="inline-flex items-center gap-2 rounded-xl bg-brand-900 px-4 py-2.5 text-sm font-semibold text-white" onClick={openCreate} type="button"><Icon name="plus" size={16} />Buat surat keluar</button>} description="Belum ada surat keluar yang sesuai dengan filter saat ini." icon="send" title="Belum ada surat keluar" />
                ) : (
                    <>
                        <div className="ea-scrollbar overflow-x-auto">
                            <table className="w-full min-w-[920px] text-left text-sm">
                                <thead className="bg-canvas text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                                    <tr><th className="px-5 py-3">Nomor / Tanggal</th><th className="px-5 py-3">Perihal / Tujuan</th><th className="px-5 py-3">Unit Penerbit</th><th className="px-5 py-3">Status</th><th className="px-5 py-3 text-right">Aksi</th></tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {items.map((item) => (
                                        <tr className="transition hover:bg-brand-50/40" key={item.id}>
                                            <td className="px-5 py-3.5 align-top"><p className="font-medium text-ink tabular-nums">{item.nomorSurat}</p><p className="mt-0.5 text-xs text-slate-400 tabular-nums">{formatTanggal(item.tanggalSurat)}</p></td>
                                            <td className="px-5 py-3.5 align-top"><p className="font-medium text-ink">{item.perihal}</p><p className="mt-0.5 text-xs text-slate-400">{item.tujuan}</p><div className="mt-1.5"><UrgensiBadge sifat={item.sifat} /></div></td>
                                            <td className="px-5 py-3.5 align-top text-sm text-slate-600">{item.unitPenerbit}</td>
                                            <td className="px-5 py-3.5 align-top"><StatusSuratKeluarBadge status={item.status} /></td>
                                            <td className="px-5 py-3.5 text-right align-top"><button className="inline-flex items-center gap-1 text-xs font-semibold text-brand-900 hover:underline" onClick={() => openEdit(item)} type="button">Edit <Icon name="arrowRight" size={13} /></button></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-5 py-3 text-xs text-slate-500">
                            <p>Menampilkan {items.length} dari {formatNumber(meta.total)} surat</p>
                            <div className="flex items-center gap-2">
                                <button className="rounded-lg border border-slate-200 px-3 py-1.5 font-medium disabled:opacity-40" disabled={meta.current_page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))} type="button">Sebelumnya</button>
                                <span className="tabular-nums">{meta.current_page} / {meta.last_page}</span>
                                <button className="rounded-lg border border-slate-200 px-3 py-1.5 font-medium disabled:opacity-40" disabled={meta.current_page >= meta.last_page} onClick={() => setPage((p) => p + 1)} type="button">Berikutnya</button>
                            </div>
                        </div>
                    </>
                )}
            </div>

            <SuratKeluarFormModal error={saveError} initial={editing} loading={saving} onClose={() => { if (!saving) { setModalOpen(false); setSaveError(null); } }} onSubmit={handleSubmit} open={modalOpen} units={units} />
        </>
    );
}
