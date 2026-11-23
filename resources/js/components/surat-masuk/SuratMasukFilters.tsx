import Icon from '../ui/Icon';
import type { SifatFilter, SuratStatusFilter } from '../../services/suratMasukService';

interface SuratMasukFiltersProps {
    status: SuratStatusFilter;
    sifat: SifatFilter;
    bulan: string;
    q: string;
    onStatusChange: (value: SuratStatusFilter) => void;
    onSifatChange: (value: SifatFilter) => void;
    onBulanChange: (value: string) => void;
    onQChange: (value: string) => void;
    onReset: () => void;
}

const TABS: { label: string; value: SuratStatusFilter }[] = [
    { label: 'Semua surat', value: 'semua' },
    { label: 'Baru', value: 'baru' },
    { label: 'Terdisposisi', value: 'terdisposisi' },
    { label: 'Selesai', value: 'selesai' },
];

const SIFAT_OPTIONS: SifatFilter[] = ['semua', 'Biasa', 'Segera', 'Sangat Segera'];

const MONTH_NAMES = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

function monthOptions(): { value: string; label: string }[] {
    const options: { value: string; label: string }[] = [];
    const today = new Date();

    for (let offset = 0; offset < 12; offset += 1) {
        const date = new Date(today.getFullYear(), today.getMonth() - offset, 1);
        const year = date.getFullYear();
        const month = date.getMonth();

        options.push({
            value: `${year}-${String(month + 1).padStart(2, '0')}`,
            label: `${MONTH_NAMES[month]} ${year}`,
        });
    }

    return options;
}

export default function SuratMasukFilters({
    status,
    sifat,
    bulan,
    q,
    onStatusChange,
    onSifatChange,
    onBulanChange,
    onQChange,
    onReset,
}: SuratMasukFiltersProps) {
    const hasFilter = status !== 'semua' || sifat !== 'semua' || bulan !== '' || q.trim() !== '';

    return (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="ea-scrollbar flex gap-1 overflow-x-auto border-b border-slate-100 px-4 py-2.5">
                {TABS.map((tab) => (
                    <button
                        className={`shrink-0 rounded-lg px-3 py-2 text-xs font-semibold transition ${status === tab.value ? 'bg-brand-50 text-brand-900' : 'text-slate-500 hover:bg-slate-50'}`}
                        key={tab.value}
                        onClick={() => onStatusChange(tab.value)}
                        type="button"
                    >
                        {tab.label}
                    </button>
                ))}
            </div>
            <div className="flex flex-col gap-3 px-4 py-3 lg:flex-row lg:items-center">
                <div className="relative flex-1">
                    <Icon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" name="search" size={16} />
                    <input
                        aria-label="Cari surat masuk"
                        className="ea-input w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm text-ink outline-none placeholder:text-slate-400"
                        onChange={(event) => onQChange(event.target.value)}
                        placeholder="Cari nomor, perihal, atau pengirim..."
                        type="search"
                        value={q}
                    />
                </div>
                <select
                    aria-label="Filter bulan"
                    className="ea-input rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-600 outline-none"
                    onChange={(event) => onBulanChange(event.target.value)}
                    value={bulan}
                >
                    <option value="">Semua bulan</option>
                    {monthOptions().map((option) => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                </select>
                <select
                    aria-label="Filter sifat surat"
                    className="ea-input rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-600 outline-none"
                    onChange={(event) => onSifatChange(event.target.value as SifatFilter)}
                    value={sifat}
                >
                    {SIFAT_OPTIONS.map((option) => (
                        <option key={option} value={option}>
                            {option === 'semua' ? 'Semua sifat' : option}
                        </option>
                    ))}
                </select>
                {hasFilter ? (
                    <button
                        className="inline-flex items-center justify-center gap-1.5 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-500 transition hover:bg-slate-50 hover:text-brand-900"
                        onClick={onReset}
                        type="button"
                    >
                        <Icon name="refresh" size={14} /> Reset
                    </button>
                ) : null}
            </div>
        </div>
    );
}
