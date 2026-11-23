import { useEffect, useMemo, useState, type FormEvent } from 'react';
import Alert from '../ui/Alert';
import Icon from '../ui/Icon';
import Skeleton from '../ui/Skeleton';
import Spinner from '../ui/Spinner';
import type { OptionItem, SuratKeluarItem, SuratKeluarPayload, SuratMasukOption } from '../../services/suratKeluarService';
import { fetchSuratMasukOptions } from '../../services/suratKeluarService';
import type { SifatSurat } from '../../types';

interface Props {
    open: boolean;
    loading: boolean;
    error: string | null;
    units: OptionItem[];
    initial: SuratKeluarItem | null;
    onClose: () => void;
    onSubmit: (payload: SuratKeluarPayload) => Promise<void>;
}

type FormState = {
    nomor_surat: string;
    tanggal_surat: string;
    tujuan: string;
    perihal: string;
    sifat: SifatSurat;
    status: 'Draft' | 'Terkirim' | 'Arsip';
    unit_id: string;
    surat_masuk_id: string;
    lampiran: File | null;
};

const EMPTY: FormState = {
    nomor_surat: '', tanggal_surat: '', tujuan: '', perihal: '', sifat: 'Biasa', status: 'Draft', unit_id: '', surat_masuk_id: '', lampiran: null,
};

function toForm(initial: SuratKeluarItem | null): FormState {
    if (!initial) return EMPTY;
    return {
        nomor_surat: initial.nomorSurat === '-' ? '' : initial.nomorSurat,
        tanggal_surat: initial.tanggalSurat.slice(0, 10),
        tujuan: initial.tujuan === '-' ? '' : initial.tujuan,
        perihal: initial.perihal,
        sifat: initial.sifat,
        status: initial.status,
        unit_id: initial.unitId ? String(initial.unitId) : '',
        surat_masuk_id: initial.suratMasukId ? String(initial.suratMasukId) : '',
        lampiran: null,
    };
}

export default function SuratKeluarFormModal({ open, loading, error, units, initial, onClose, onSubmit }: Props) {
    const [form, setForm] = useState<FormState>(EMPTY);
    const [smOptions, setSmOptions] = useState<SuratMasukOption[]>([]);
    const [smLoading, setSmLoading] = useState(false);
    const [smSearch, setSmSearch] = useState('');
    const [localError, setLocalError] = useState<string | null>(null);

    useEffect(() => {
        if (open) {
            setForm(toForm(initial));
            setLocalError(null);
            setSmSearch('');
        }
    }, [open, initial]);

    useEffect(() => {
        if (!open) return;
        let active = true;
        setSmLoading(true);
        const timer = window.setTimeout(() => {
            fetchSuratMasukOptions(smSearch).then((items) => {
                if (active) { setSmOptions(items); setSmLoading(false); }
            }).catch(() => { if (active) setSmLoading(false); });
        }, 250);
        return () => { active = false; window.clearTimeout(timer); };
    }, [open, smSearch]);

    const title = useMemo(() => initial ? 'Edit surat keluar' : 'Buat surat keluar', [initial]);
    if (!open) return null;

    const set = <K extends keyof FormState>(key: K, value: FormState[K]) => setForm((p) => ({ ...p, [key]: value }));

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!form.nomor_surat.trim() || !form.tanggal_surat || !form.tujuan.trim() || !form.perihal.trim()) {
            setLocalError('Lengkapi field wajib: nomor surat, tanggal, tujuan, dan perihal.');
            return;
        }
        setLocalError(null);
        await onSubmit({ ...form, nomor_surat: form.nomor_surat.trim(), tujuan: form.tujuan.trim(), perihal: form.perihal.trim() });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-950/45 px-4 py-8 backdrop-blur-sm" role="presentation">
            <div aria-modal="true" className="w-full max-w-3xl rounded-2xl border border-slate-200 bg-white shadow-2xl" role="dialog">
                <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-5">
                    <div>
                        <h2 className="text-lg font-semibold text-ink">{title}</h2>
                        <p className="mt-1 text-sm text-slate-500">Isi informasi surat keluar dan lampiran soft file bila tersedia.</p>
                    </div>
                    <button className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600" onClick={onClose} type="button" aria-label="Tutup">
                        <Icon name="close" size={18} />
                    </button>
                </div>

                <form onSubmit={(e) => { void handleSubmit(e); }}>
                    <div className="space-y-5 px-6 py-5">
                        {localError ? <Alert message={localError} /> : null}
                        {error ? <Alert message={error} title="Gagal menyimpan" /> : null}

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <label className="block">
                                <span className="mb-1.5 block text-xs font-medium text-slate-600">Nomor surat *</span>
                                <input className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-brand-800" value={form.nomor_surat} onChange={(e) => set('nomor_surat', e.target.value)} />
                            </label>
                            <label className="block">
                                <span className="mb-1.5 block text-xs font-medium text-slate-600">Tanggal surat *</span>
                                <input type="date" className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-brand-800" value={form.tanggal_surat} onChange={(e) => set('tanggal_surat', e.target.value)} />
                            </label>
                        </div>

                        <label className="block">
                            <span className="mb-1.5 block text-xs font-medium text-slate-600">Tujuan *</span>
                            <input className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-brand-800" value={form.tujuan} onChange={(e) => set('tujuan', e.target.value)} />
                        </label>

                        <label className="block">
                            <span className="mb-1.5 block text-xs font-medium text-slate-600">Perihal *</span>
                            <textarea className="min-h-[96px] w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-brand-800" value={form.perihal} onChange={(e) => set('perihal', e.target.value)} />
                        </label>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                            <label className="block">
                                <span className="mb-1.5 block text-xs font-medium text-slate-600">Sifat</span>
                                <select className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-brand-800" value={form.sifat} onChange={(e) => set('sifat', e.target.value as SifatSurat)}>
                                    <option value="Biasa">Biasa</option>
                                    <option value="Segera">Segera</option>
                                    <option value="Sangat Segera">Sangat Segera</option>
                                </select>
                            </label>
                            <label className="block">
                                <span className="mb-1.5 block text-xs font-medium text-slate-600">Status</span>
                                <select className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-brand-800" value={form.status} onChange={(e) => set('status', e.target.value as FormState['status'])}>
                                    <option value="Draft">Draft</option>
                                    <option value="Terkirim">Terkirim</option>
                                    <option value="Arsip">Arsip</option>
                                </select>
                            </label>
                            <label className="block">
                                <span className="mb-1.5 block text-xs font-medium text-slate-600">Unit penerbit</span>
                                <select className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-brand-800" value={form.unit_id} onChange={(e) => set('unit_id', e.target.value)}>
                                    <option value="">Pilih unit</option>
                                    {units.map((u) => <option key={u.value} value={u.value}>{u.label}</option>)}
                                </select>
                            </label>
                        </div>

                        <div className="rounded-xl border border-slate-200 bg-canvas p-4">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                                <div>
                                    <p className="text-xs font-semibold text-ink">Balas surat masuk (opsional)</p>
                                    <p className="text-[11px] text-slate-500">Pilih surat masuk yang dibalas oleh surat keluar ini.</p>
                                </div>
                                {form.surat_masuk_id ? (
                                    <button className="text-xs font-semibold text-brand-900 hover:underline" type="button" onClick={() => set('surat_masuk_id', '')}>Hapus pilihan</button>
                                ) : null}
                            </div>
                            <input className="mt-3 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm outline-none focus:border-brand-800" placeholder="Cari nomor/perihal surat masuk..." value={smSearch} onChange={(e) => setSmSearch(e.target.value)} />
                            <div className="mt-2 max-h-36 overflow-y-auto rounded-xl border border-slate-200 bg-white">
                                {smLoading ? <div className="p-3"><Skeleton className="h-4 w-2/3" /></div> : smOptions.length === 0 ? <p className="p-3 text-xs text-slate-400">Tidak ada surat masuk ditemukan.</p> : smOptions.map((opt) => (
                                    <label key={opt.value} className={`flex cursor-pointer items-start gap-2 border-b border-slate-100 px-3 py-2 text-xs last:border-b-0 ${form.surat_masuk_id === opt.value ? 'bg-brand-50' : 'hover:bg-slate-50'}`}>
                                        <input type="radio" name="surat_masuk_id" className="mt-0.5" checked={form.surat_masuk_id === opt.value} onChange={() => set('surat_masuk_id', opt.value)} />
                                        <span><span className="font-semibold text-brand-900 tabular-nums">{opt.nomorSurat}</span><span className="block text-slate-500">{opt.perihal}</span></span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <label className="block">
                            <span className="mb-1.5 block text-xs font-medium text-slate-600">Soft file lampiran</span>
                            <input type="file" className="block w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-brand-50 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-brand-900" onChange={(e) => set('lampiran', e.target.files?.[0] ?? null)} />
                            {form.lampiran ? <p className="mt-1.5 text-[11px] text-slate-500">File dipilih: {form.lampiran.name}</p> : null}
                        </label>
                    </div>

                    <div className="flex justify-end gap-2.5 border-t border-slate-100 px-6 py-4">
                        <button className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-60" disabled={loading} onClick={onClose} type="button">Batal</button>
                        <button className="inline-flex items-center gap-2 rounded-xl bg-brand-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-950 disabled:opacity-60" disabled={loading} type="submit">
                            {loading ? <Spinner /> : <Icon name="check" size={16} />}
                            {loading ? 'Menyimpan...' : 'Simpan surat keluar'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
