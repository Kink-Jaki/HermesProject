import { formatNumber } from '../../lib/format';
import type { PaginationMeta } from '../../types';
import Icon from '../ui/Icon';

interface SuratMasukPaginationProps {
    meta: PaginationMeta;
    onPageChange: (page: number) => void;
}

function visiblePages(current: number, last: number): number[] {
    const pages = new Set<number>([1, last, current - 1, current, current + 1]);

    return [...pages]
        .filter((page) => page >= 1 && page <= last)
        .sort((first, second) => first - second);
}

export default function SuratMasukPagination({ meta, onPageChange }: SuratMasukPaginationProps) {
    const start = meta.total === 0 ? 0 : (meta.current_page - 1) * meta.per_page + 1;
    const end = Math.min(meta.current_page * meta.per_page, meta.total);
    const pages = visiblePages(meta.current_page, meta.last_page);

    return (
        <div className="flex flex-col gap-3 border-t border-slate-100 px-5 py-3.5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-slate-500 tabular-nums">
                Menampilkan <span className="font-semibold text-slate-600">{formatNumber(start)}</span>–
                <span className="font-semibold text-slate-600">{formatNumber(end)}</span> dari{' '}
                <span className="font-semibold text-slate-600">{formatNumber(meta.total)}</span> surat
            </p>
            <nav aria-label="Pagination surat masuk" className="flex items-center gap-1">
                <button
                    aria-label="Halaman sebelumnya"
                    className="rounded-lg border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                    disabled={meta.current_page <= 1}
                    onClick={() => onPageChange(meta.current_page - 1)}
                    type="button"
                >
                    <Icon className="rotate-180" name="arrowRight" size={14} />
                </button>
                {pages.map((page, index) => (
                    <span className="flex items-center gap-1" key={page}>
                        {index > 0 && page - pages[index - 1] > 1 ? <span className="px-1 text-xs text-slate-400">…</span> : null}
                        <button
                            aria-current={page === meta.current_page ? 'page' : undefined}
                            className={`h-8 min-w-8 rounded-lg px-2 text-xs font-semibold transition ${page === meta.current_page ? 'bg-brand-900 text-white' : 'text-slate-500 hover:bg-slate-50'}`}
                            onClick={() => onPageChange(page)}
                            type="button"
                        >
                            {page}
                        </button>
                    </span>
                ))}
                <button
                    aria-label="Halaman berikutnya"
                    className="rounded-lg border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                    disabled={meta.current_page >= meta.last_page}
                    onClick={() => onPageChange(meta.current_page + 1)}
                    type="button"
                >
                    <Icon name="arrowRight" size={14} />
                </button>
            </nav>
        </div>
    );
}
