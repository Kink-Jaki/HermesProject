import { formatNumber } from '../../lib/format';
import Icon from './Icon';
import type { IconName } from './Icon';

type Accent = 'brand' | 'emerald' | 'amber' | 'slate';

const ACCENTS: Record<Accent, { bar: string; icon: string }> = {
    brand: { bar: 'bg-brand-900', icon: 'bg-brand-50 text-brand-900' },
    emerald: { bar: 'bg-emerald-500', icon: 'bg-emerald-50 text-emerald-600' },
    amber: { bar: 'bg-amber-400', icon: 'bg-amber-50 text-amber-600' },
    slate: { bar: 'bg-slate-400', icon: 'bg-slate-100 text-slate-600' },
};

interface StatCardProps {
    label: string;
    value: number | string;
    note: string;
    icon: IconName;
    accent?: Accent;
}

export default function StatCard({ label, value, note, icon, accent = 'brand' }: StatCardProps) {
    const styles = ACCENTS[accent];

    return (
        <article className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <span className={`absolute right-5 top-0 h-1 w-12 rounded-b-full ${styles.bar}`} />
            <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-500">{label}</p>
                    <p className="mt-2 text-3xl font-semibold tracking-tight text-ink tabular-nums">
                        {typeof value === 'number' ? formatNumber(value) : value}
                    </p>
                </div>
                <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${styles.icon}`}>
                    <Icon name={icon} size={20} />
                </span>
            </div>
            <p className="mt-3 text-xs font-medium text-slate-400">{note}</p>
        </article>
    );
}
