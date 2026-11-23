import type { ReactNode } from 'react';
import EmptyState from '../components/ui/EmptyState';
import Icon from '../components/ui/Icon';
import type { IconName } from '../components/ui/Icon';
import PageHeader from '../components/ui/PageHeader';

interface PlaceholderPageProps {
    title: string;
    subtitle: string;
    icon: IconName;
    breadcrumb?: string;
    actions?: ReactNode;
    note?: string;
}

export default function PlaceholderPage({
    title,
    subtitle,
    icon,
    breadcrumb,
    actions,
    note = 'Modul ini akan tersedia pada Tahap 2. Kerangka halaman dan navigasi sudah siap digunakan.',
}: PlaceholderPageProps) {
    return (
        <>
            <PageHeader
                actions={actions}
                breadcrumb={breadcrumb}
                subtitle={subtitle}
                title={title}
            />
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                <EmptyState
                    description={note}
                    icon={icon}
                    title="Halaman siap dikembangkan"
                />
            </div>
        </>
    );
}
