import type { ReactNode } from 'react';
import Icon from './Icon';
import type { IconName } from './Icon';

interface AlertProps {
    message: string;
    title?: string;
    variant?: 'error' | 'info' | 'success';
    action?: ReactNode;
}

const VARIANTS = {
    error: {
        container: 'border-red-200 bg-red-50 text-red-800',
        icon: 'text-red-600',
        name: 'alert' as IconName,
    },
    info: {
        container: 'border-sky-200 bg-sky-50 text-sky-900',
        icon: 'text-sky-600',
        name: 'info' as IconName,
    },
    success: {
        container: 'border-emerald-200 bg-emerald-50 text-emerald-900',
        icon: 'text-emerald-700',
        name: 'check' as IconName,
    },
};

export default function Alert({ message, title, variant = 'error', action }: AlertProps) {
    const styles = VARIANTS[variant];

    return (
        <div className={`flex items-start gap-3 rounded-xl border px-4 py-3 ${styles.container}`} role="alert">
            <Icon className={`mt-0.5 shrink-0 ${styles.icon}`} name={styles.name} size={18} />
            <div className="min-w-0 flex-1">
                {title ? <p className="text-sm font-semibold">{title}</p> : null}
                <p className="text-sm leading-relaxed">{message}</p>
                {action ? <div className="mt-2">{action}</div> : null}
            </div>
        </div>
    );
}
