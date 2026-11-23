import type { ReactNode } from 'react';

interface PageHeaderProps {
    title: string;
    subtitle?: string;
    badge?: ReactNode;
    actions?: ReactNode;
    breadcrumb?: ReactNode;
}

export default function PageHeader({ title, subtitle, badge, actions, breadcrumb }: PageHeaderProps) {
    return (
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="min-w-0">
                {breadcrumb ? <div className="mb-2 text-xs font-medium text-slate-400">{breadcrumb}</div> : null}
                <div className="flex flex-wrap items-center gap-3">
                    <h1 className="text-2xl font-semibold tracking-tight text-ink lg:text-[28px]">{title}</h1>
                    {badge}
                </div>
                {subtitle ? <p className="mt-1.5 text-sm text-slate-500">{subtitle}</p> : null}
            </div>
            {actions ? <div className="flex flex-wrap items-center gap-2.5">{actions}</div> : null}
        </div>
    );
}
