import type { ReactNode } from 'react';

export type BadgeTone = 'neutral' | 'amber' | 'red' | 'green' | 'blue' | 'slate' | 'brand';

const TONES: Record<BadgeTone, string> = {
    neutral: 'bg-slate-100 text-slate-600',
    amber: 'bg-[#FEF3C7] text-[#B45309]',
    red: 'bg-[#FEE2E2] text-[#B91C1C]',
    green: 'bg-[#DCFCE7] text-[#15803D]',
    blue: 'bg-[#E0F2FE] text-[#0369A1]',
    slate: 'bg-[#E2E8F0] text-[#334155]',
    brand: 'bg-brand-50 text-brand-900',
};

interface BadgeProps {
    children: ReactNode;
    tone?: BadgeTone;
    className?: string;
    dot?: boolean;
}

export default function Badge({ children, tone = 'neutral', className = '', dot = false }: BadgeProps) {
    return (
        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${TONES[tone]} ${className}`}>
            {dot ? <span className="h-1.5 w-1.5 rounded-full bg-current" /> : null}
            {children}
        </span>
    );
}
