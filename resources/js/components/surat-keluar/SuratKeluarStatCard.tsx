import type { ReactNode } from 'react';
import Icon from '../ui/Icon';
import type { IconName } from '../ui/Icon';

interface Props {
    label: string;
    value: number | string;
    icon: IconName;
    tone: 'slate' | 'amber' | 'sky' | 'emerald';
}

const TONES: Record<Props['tone'], string> = {
    slate: 'border-slate-200 text-slate-600 bg-slate-50',
    amber: 'border-amber-200 text-amber-700 bg-amber-50',
    sky: 'border-sky-200 text-sky-700 bg-sky-50',
    emerald: 'border-emerald-200 text-emerald-700 bg-emerald-50',
};

export default function SuratKeluarStatCard({ label, value, icon, tone }: Props): ReactNode {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <p className="text-xs font-medium text-slate-500">{label}</p>
                    <p className="mt-2 text-2xl font-semibold text-ink tabular-nums">{value}</p>
                </div>
                <span className={`flex h-9 w-9 items-center justify-center rounded-xl border ${TONES[tone]}`}>
                    <Icon name={icon} size={18} />
                </span>
            </div>
        </div>
    );
}
