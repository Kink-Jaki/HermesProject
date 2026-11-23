import { useEffect, useState } from 'react';
import { errorMessage } from '../../services/http';
import { fetchDisposisiTargets } from '../../services/disposisiService';
import type { DisposisiTarget, TargetTipe } from '../../services/disposisiService';
import Alert from '../ui/Alert';
import EmptyState from '../ui/EmptyState';
import Icon from '../ui/Icon';
import Skeleton from '../ui/Skeleton';

interface DisposisiTargetPickerProps {
    tipe: TargetTipe;
    query: string;
    selectedId: string | number | null;
    onSelect: (target: DisposisiTarget) => void;
}

export default function DisposisiTargetPicker({
    tipe,
    query,
    selectedId,
    onSelect,
}: DisposisiTargetPickerProps) {
    const [targets, setTargets] = useState<DisposisiTarget[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [version, setVersion] = useState(0);

    useEffect(() => {
        let active = true;
        const controller = new AbortController();
        const timer = window.setTimeout(() => {
            setLoading(true);
            setError(null);

            fetchDisposisiTargets(tipe, query, controller.signal)
                .then((result) => {
                    if (!active) {
                        return;
                    }

                    setTargets(result);
                    setLoading(false);
                })
                .catch((reason: unknown) => {
                    if (!active || (reason instanceof Error && reason.name === 'AbortError')) {
                        return;
                    }

                    setError(errorMessage(reason, 'Daftar tujuan tidak dapat dimuat.'));
                    setLoading(false);
                });
        }, 250);

        return () => {
            active = false;
            controller.abort();
            window.clearTimeout(timer);
        };
    }, [tipe, query, version]);

    if (loading) {
        return (
            <div className="ea-scrollbar max-h-56 space-y-2 overflow-y-auto rounded-xl border border-slate-200 p-3">
                {[0, 1, 2, 3].map((item) => (
                    <div className="flex items-center gap-3" key={item}>
                        <Skeleton className="h-4 w-4 rounded-full" />
                        <Skeleton className="h-4 w-2/3" />
                    </div>
                ))}
            </div>
        );
    }

    if (error) {
        return (
            <Alert
                action={(
                    <button className="text-xs font-semibold underline" onClick={() => setVersion((current) => current + 1)} type="button">
                        Coba lagi
                    </button>
                )}
                message={error}
            />
        );
    }

    if (targets.length === 0) {
        return (
            <div className="rounded-xl border border-slate-200 bg-canvas">
                <EmptyState
                    compact
                    description={`Tidak ada ${tipe} yang cocok dengan pencarian "${query}".`}
                    icon={tipe === 'unit' ? 'inbox' : 'user'}
                    title={`${tipe === 'unit' ? 'Unit' : 'Pengguna'} tidak ditemukan`}
                />
            </div>
        );
    }

    return (
        <div className="ea-scrollbar max-h-56 space-y-2 overflow-y-auto rounded-xl border border-slate-200 p-2">
            {targets.map((target) => (
                <label
                    className={`flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 transition ${String(selectedId) === String(target.id) ? 'bg-brand-50' : 'hover:bg-canvas'}`}
                    key={target.id}
                >
                    <input
                        checked={String(selectedId) === String(target.id)}
                        className="ea-checkbox h-4 w-4"
                        name="target-disposisi"
                        onChange={() => onSelect(target)}
                        type="radio"
                    />
                    <span className="min-w-0 flex-1">
                        <span className="block text-xs font-semibold text-ink">{target.nama}</span>
                        <span className="block truncate text-[11px] text-slate-400">{target.keterangan}</span>
                    </span>
                    {String(selectedId) === String(target.id) ? <Icon className="text-brand-900" name="check" size={15} /> : null}
                </label>
            ))}
        </div>
    );
}
