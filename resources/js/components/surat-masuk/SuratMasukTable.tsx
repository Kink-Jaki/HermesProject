import { detailSuratMasukPath } from '../../lib/constants';
import { formatTanggal } from '../../lib/format';
import type { SuratMasuk } from '../../services/suratMasukService';
import { Link } from '../../router/RouterContext';
import Icon from '../ui/Icon';
import StatusBadge from '../ui/StatusBadge';
import UrgensiBadge from '../ui/UrgensiBadge';

interface SuratMasukTableProps {
    items: SuratMasuk[];
    selectedIds: string[];
    onToggleSelect: (id: string) => void;
    onToggleAll: () => void;
}

export default function SuratMasukTable({
    items,
    selectedIds,
    onToggleSelect,
    onToggleAll,
}: SuratMasukTableProps) {
    const allSelected = items.length > 0 && items.every((item) => selectedIds.includes(String(item.id)));

    return (
        <div className="ea-scrollbar overflow-x-auto">
            <table className="w-full min-w-[860px] text-left text-sm">
                <thead>
                    <tr className="bg-canvas text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                        <th className="w-12 px-5 py-3">
                            <input
                                aria-label="Pilih semua surat"
                                checked={allSelected}
                                className="ea-checkbox h-4 w-4 rounded border-slate-300"
                                onChange={onToggleAll}
                                type="checkbox"
                            />
                        </th>
                        <th className="px-3 py-3">Nomor / Tanggal</th>
                        <th className="px-3 py-3">Perihal / Pengirim</th>
                        <th className="px-3 py-3">Sifat</th>
                        <th className="px-3 py-3">Status</th>
                        <th className="px-5 py-3 text-right">Aksi</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {items.map((item) => {
                        const isSelected = selectedIds.includes(String(item.id));

                        return (
                            <tr className="transition hover:bg-brand-50/40" key={item.id}>
                                <td className="px-5 py-3.5 align-top">
                                    <input
                                        aria-label={`Pilih surat ${item.nomorSurat}`}
                                        checked={isSelected}
                                        className="ea-checkbox mt-0.5 h-4 w-4 rounded border-slate-300"
                                        onChange={() => onToggleSelect(String(item.id))}
                                        type="checkbox"
                                    />
                                </td>
                                <td className="px-3 py-3.5 align-top">
                                    <p className="text-xs font-semibold text-ink tabular-nums">{item.nomorSurat}</p>
                                    <p className="mt-1 text-[11px] text-slate-400 tabular-nums">{item.nomorAgenda}</p>
                                    <p className="mt-1 text-[11px] text-slate-400">{formatTanggal(item.tanggalSurat)}</p>
                                </td>
                                <td className="max-w-[340px] px-3 py-3.5 align-top">
                                    <p className="truncate text-sm font-medium text-ink">{item.perihal}</p>
                                    <p className="mt-1 truncate text-xs text-slate-500">{item.pengirim}</p>
                                </td>
                                <td className="px-3 py-3.5 align-top"><UrgensiBadge sifat={item.sifat} /></td>
                                <td className="px-3 py-3.5 align-top"><StatusBadge status={item.status} /></td>
                                <td className="px-5 py-3.5 text-right align-top">
                                    <Link
                                        className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-semibold text-brand-900 transition hover:bg-brand-50"
                                        to={detailSuratMasukPath(item.id)}
                                    >
                                        Lihat <Icon name="arrowRight" size={14} />
                                    </Link>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}
