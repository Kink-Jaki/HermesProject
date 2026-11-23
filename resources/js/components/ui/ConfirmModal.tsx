import { useEffect } from 'react';
import Icon from './Icon';
import Spinner from './Spinner';

interface ConfirmModalProps {
    open: boolean;
    title: string;
    description: string;
    confirmLabel?: string;
    cancelLabel?: string;
    loading?: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}

export default function ConfirmModal({
    open,
    title,
    description,
    confirmLabel = 'Konfirmasi',
    cancelLabel = 'Batal',
    loading = false,
    onConfirm,
    onCancel,
}: ConfirmModalProps) {
    useEffect(() => {
        if (!open) {
            return;
        }

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onCancel();
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [open, onCancel]);

    if (!open) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4 backdrop-blur-sm" role="presentation">
            <div
                aria-modal="true"
                className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl"
                role="dialog"
            >
                <div className="flex items-start gap-4">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                        <Icon name="logout" size={20} />
                    </span>
                    <div>
                        <h2 className="text-base font-semibold text-ink">{title}</h2>
                        <p className="mt-1.5 text-sm leading-relaxed text-slate-500">{description}</p>
                    </div>
                </div>
                <div className="mt-6 flex justify-end gap-2.5">
                    <button
                        className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-60"
                        disabled={loading}
                        onClick={onCancel}
                        type="button"
                    >
                        {cancelLabel}
                    </button>
                    <button
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-brand-950 disabled:opacity-60"
                        disabled={loading}
                        onClick={onConfirm}
                        type="button"
                    >
                        {loading ? <Spinner /> : null}
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}
