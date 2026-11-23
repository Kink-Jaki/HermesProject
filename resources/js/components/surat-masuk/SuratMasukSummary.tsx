import StatCard from '../ui/StatCard';
import Skeleton from '../ui/Skeleton';
import type { SuratMasukSummary } from '../../services/suratMasukService';

interface SuratMasukSummaryProps {
    summary: SuratMasukSummary;
    loading?: boolean;
}

export default function SuratMasukSummary({ summary, loading = false }: SuratMasukSummaryProps) {
    if (loading) {
        return (
            <section aria-label="Ringkasan surat masuk" className="grid grid-cols-2 gap-4 xl:grid-cols-4">
                {[0, 1, 2, 3].map((item) => (
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm" key={item}>
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="mt-3 h-8 w-16" />
                        <Skeleton className="mt-4 h-3 w-32" />
                    </div>
                ))}
            </section>
        );
    }

    return (
        <section aria-label="Ringkasan surat masuk" className="grid grid-cols-2 gap-4 xl:grid-cols-4">
            <StatCard accent="brand" icon="inbox" label="Total surat" note="Seluruh surat yang tercatat" value={summary.total} />
            <StatCard accent="emerald" icon="file" label="Baru" note="Belum didisposisikan" value={summary.baru} />
            <StatCard accent="slate" icon="send" label="Terdisposisi" note="Sedang ditindaklanjuti" value={summary.terdisposisi} />
            <StatCard accent="emerald" icon="checkDouble" label="Selesai" note="Sudah diproses" value={summary.selesai} />
        </section>
    );
}
