import type { ReactNode } from 'react';

interface FormFieldProps {
    label: string;
    htmlFor?: string;
    required?: boolean;
    hint?: string;
    error?: string | null;
    className?: string;
    children: ReactNode;
}

export default function FormField({
    label,
    htmlFor,
    required = false,
    hint,
    error,
    className = '',
    children,
}: FormFieldProps) {
    return (
        <div className={className}>
            <label className="block text-xs font-semibold text-slate-600" htmlFor={htmlFor}>
                {label}
                {required ? <span className="ml-0.5 text-red-500">*</span> : null}
            </label>
            <div className="mt-2">{children}</div>
            {error ? <p className="mt-1.5 text-xs text-red-600">{error}</p> : hint ? <p className="mt-1.5 text-xs text-slate-400">{hint}</p> : null}
        </div>
    );
}
