import { useEffect, useState } from 'react';
import type { LampiranSurat } from '../../services/suratMasukService';
import { fetchLampiranBlob } from '../../services/suratMasukService';
import Alert from '../ui/Alert';
import EmptyState from '../ui/EmptyState';
import Icon from '../ui/Icon';
import Skeleton from '../ui/Skeleton';

interface DocumentViewerProps {
    lampiran: LampiranSurat[];
}

const ZOOM_LEVELS = [75, 100, 125, 150, 200];

function isImage(lampiran: LampiranSurat): boolean {
    return lampiran.tipe.startsWith('image/') || /\.(png|jpe?g)$/i.test(lampiran.nama);
}

export default function DocumentViewer({ lampiran }: DocumentViewerProps) {
    const [selectedId, setSelectedId] = useState<string>('');
    const [zoomIndex, setZoomIndex] = useState(1);
    const [blobUrl, setBlobUrl] = useState<string | null>(null);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [retryKey, setRetryKey] = useState(0);

    useEffect(() => {
        if (lampiran.length === 0) {
            setSelectedId('');
            return;
        }

        if (!lampiran.some((item) => String(item.id) === selectedId)) {
            setSelectedId(String(lampiran[0].id));
        }
    }, [lampiran, selectedId]);

    const selected = lampiran.find((item) => String(item.id) === selectedId) ?? lampiran[0];
    const zoom = ZOOM_LEVELS[zoomIndex];

    useEffect(() => {
        if (!selected?.url) {
            setBlobUrl(null);
            setLoadError(null);
            return;
        }

        const controller = new AbortController();
        let cancelled = false;
        let createdUrl: string | null = null;

        setLoadError(null);
        setBlobUrl(null);

        fetchLampiranBlob(selected.url, controller.signal)
            .then((blob) => {
                if (cancelled) {
                    return;
                }

                createdUrl = URL.createObjectURL(blob);
                setBlobUrl(createdUrl);
            })
            .catch((error: unknown) => {
                if (!cancelled && !(error instanceof DOMException && error.name === 'AbortError')) {
                    setLoadError('Dokumen gagal dimuat. Silakan coba lagi.');
                }
            });

        return () => {
            cancelled = true;
            controller.abort();

            if (createdUrl) {
                URL.revokeObjectURL(createdUrl);
            }
        };
    }, [selected?.url, retryKey]);

    return (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-3">
                <div className="flex min-w-0 items-center gap-2 text-xs font-medium text-slate-600">
                    <Icon className="shrink-0 text-brand-900" name="file" size={16} />
                    <span className="truncate">{selected?.nama ?? 'Belum ada dokumen'}</span>
                    <span className="text-slate-300">•</span>
                    <span className="shrink-0 tabular-nums">1/1</span>
                </div>
                {selected ? (
                    <div className="flex items-center gap-2">
                        <button
                            aria-label="Perkecil dokumen"
                            className="rounded-lg border border-slate-200 px-2.5 py-1 text-sm text-slate-600 transition hover:bg-slate-50 disabled:opacity-40"
                            disabled={zoomIndex === 0}
                            onClick={() => setZoomIndex((current) => Math.max(0, current - 1))}
                            type="button"
                        >
                            −
                        </button>
                        <button
                            aria-label="Atur ulang zoom"
                            className="min-w-14 rounded-lg px-2 py-1 text-xs font-semibold text-slate-500 transition hover:bg-slate-50 tabular-nums"
                            onClick={() => setZoomIndex(1)}
                            type="button"
                        >
                            {zoom}%
                        </button>
                        <button
                            aria-label="Perbesar dokumen"
                            className="rounded-lg border border-slate-200 px-2.5 py-1 text-sm text-slate-600 transition hover:bg-slate-50 disabled:opacity-40"
                            disabled={zoomIndex === ZOOM_LEVELS.length - 1}
                            onClick={() => setZoomIndex((current) => Math.min(ZOOM_LEVELS.length - 1, current + 1))}
                            type="button"
                        >
                            +
                        </button>
                    </div>
                ) : null}
            </div>

            {selected ? (
                <div className="ea-scrollbar max-h-[620px] min-h-[380px] overflow-auto bg-slate-100 p-4 sm:p-6">
                    <div className="mx-auto origin-top" style={{ width: `${zoom}%` }}>
                        {loadError ? (
                            <Alert
                                action={
                                    <button
                                        className="rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-semibold text-red-700 transition hover:bg-red-50"
                                        onClick={() => setRetryKey((current) => current + 1)}
                                        type="button"
                                    >
                                        Coba lagi
                                    </button>
                                }
                                message={loadError}
                                title="Pratinjau gagal"
                                variant="error"
                            />
                        ) : blobUrl === null ? (
                            <Skeleton className="h-[540px] w-full" />
                        ) : isImage(selected) ? (
                            <img
                                alt={selected.nama}
                                className="mx-auto w-full rounded-lg bg-white shadow-md"
                                src={blobUrl}
                            />
                        ) : (
                            <iframe
                                className="h-[540px] w-full rounded-lg border border-slate-200 bg-white shadow-md"
                                src={blobUrl}
                                title={selected.nama}
                            />
                        )}
                    </div>
                </div>
            ) : (
                <EmptyState
                    compact
                    description="Lampiran dokumen belum tersedia untuk surat ini."
                    icon="file"
                    title="Dokumen belum diunggah"
                />
            )}

            {lampiran.length > 0 ? (
                <div className="border-t border-slate-100 px-5 py-4">
                    <h3 className="text-xs font-semibold text-ink">Lampiran ({lampiran.length})</h3>
                    <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                        {lampiran.map((item) => (
                            <li key={item.id}>
                                <button
                                    className={`flex w-full items-center gap-2.5 rounded-xl border px-3 py-2.5 text-left transition ${String(item.id) === String(selected?.id) ? 'border-brand-200 bg-brand-50' : 'border-slate-100 bg-canvas hover:border-brand-200'}`}
                                    onClick={() => { setSelectedId(String(item.id)); setZoomIndex(1); }}
                                    type="button"
                                >
                                    <Icon className="shrink-0 text-brand-900" name="file" size={16} />
                                    <span className="min-w-0">
                                        <span className="block truncate text-xs font-medium text-ink">{item.nama}</span>
                                        <span className="block text-[11px] text-slate-400 tabular-nums">
                                            {item.tipe || 'Dokumen'}
                                            {item.ukuran > 0 ? ` · ${(item.ukuran / (1024 * 1024)).toFixed(1)} MB` : ''}
                                        </span>
                                    </span>
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            ) : null}
        </div>
    );
}
