import { formatTanggal } from '../../lib/format';
import type { RiwayatAktivitas } from '../../services/suratMasukService';
import EmptyState from '../ui/EmptyState';

interface ActivityTimelineProps {
    items: RiwayatAktivitas[];
}

export default function ActivityTimeline({ items }: ActivityTimelineProps) {
    if (items.length === 0) {
        return (
            <EmptyState
                compact
                description="Belum ada pencatatan aktivitas pada surat ini."
                icon="clock"
                title="Riwayat kosong"
            />
        );
    }

    return (
        <ol className="space-y-4">
            {items.map((item, index) => (
                <li className="flex gap-3" key={item.id}>
                    <div className="flex flex-col items-center">
                        <span className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${item.active ? 'bg-brand-800' : 'bg-slate-300'}`} />
                        {index < items.length - 1 ? <span className="mt-1 h-full w-px flex-1 bg-slate-100" /> : null}
                    </div>
                    <div className="min-w-0 pb-1">
                        <p className="text-xs font-semibold text-ink">{item.label}</p>
                        {item.deskripsi ? <p className="mt-0.5 text-xs leading-relaxed text-slate-500">{item.deskripsi}</p> : null}
                        <p className="mt-0.5 text-[11px] text-slate-400 tabular-nums">
                            {item.waktu ? formatTanggal(item.waktu, true) : 'Waktu tidak tersedia'}
                        </p>
                    </div>
                </li>
            ))}
        </ol>
    );
}
