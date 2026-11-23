import type { ReactNode } from 'react';
import Icon from './Icon';
import type { IconName } from './Icon';

interface EmptyStateProps {
    title: string;
    description: string;
    icon?: IconName;
    action?: ReactNode;
    compact?: boolean;
}

export default function EmptyState({
    title,
    description,
    icon = 'inbox',
    action,
    compact = false,
}: EmptyStateProps) {
    return (
        <div className={`flex flex-col items-center justify-center text-center ${compact ? 'px-4 py-10' : 'px-6 py-16'}`}>
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-800">
                <Icon name={icon} size={26} />
            </div>
            <p className="mt-4 text-sm font-semibold text-ink">{title}</p>
            <p className="mt-1.5 max-w-sm text-sm leading-relaxed text-slate-500">{description}</p>
            {action ? <div className="mt-5">{action}</div> : null}
        </div>
    );
}
