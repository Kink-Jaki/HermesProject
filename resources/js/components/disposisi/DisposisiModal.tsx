import { useEffect, useRef, useState } from 'react';
import Alert from '../ui/Alert';
import Icon from '../ui/Icon';
import Spinner from '../ui/Spinner';
import UrgensiBadge from '../ui/UrgensiBadge';
import DisposisiTargetPicker from './DisposisiTargetPicker';
import { errorMessage } from '../../services/http';
import {
    fetchSaranDisposisi,
    kirimDisposisi,
} from '../../services/disposisiService';
import type {
    DisposisiTarget,
    InstruksiDisposisi,
    PrioritasDisposisi,
    SaranDisposisi,
    TargetTipe,
} from '../../services/disposisiService';
import type { SuratMasuk } from '../../services/suratMasukService';

interface DisposisiModalProps {
    open: boolean;
    surat: SuratMasuk;
    onClose: () => void;
    onSuccess?: () => void;
}

interface FormErrors {
    target?: string;
    batasWaktu?: string;
}

const PRIORITAS_OPTIONS: PrioritasDisposisi[] = ['Biasa', 'Segera', 'Sangat Segera'];
const INSTRUKSI_OPTIONS: InstruksiDisposisi[] = ['Tindak lanjut', 'Koordinasikan', 'Untuk diketahui'];

function defaultDeadline(): string {
    const date = new Date();
    date.setDate(date.getDate() + 2);

    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}T17:00`;
}

const INPUT_CLASS = 'ea-input w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-ink outline-none placeholder:text-slate-400';

export default function DisposisiModal({ open, surat, onClose, onSuccess }: DisposisiModalProps) {
    const [tipe, setTipe] = useState<TargetTipe>('unit');
    const [query, setQuery] = useState('');
    const [selectedTarget, setSelectedTarget] = useState<DisposisiTarget | null>(null);
    const [batasWaktu, setBatasWaktu] = useState(defaultDeadline);
    const [prioritas, setPrioritas] = useState<PrioritasDisposisi>('Biasa');
    const [instruksi, setInstruksi] = useState<InstruksiDisposisi>('Tindak lanjut');
    const [catatan, setCatatan] = useState('');
    const [kirimNotifikasi, setKirimNotifikasi] = useState(true);
    const [errors, setErrors] = useState<FormErrors>({});
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [saran, setSaran] = useState<SaranDisposisi[]>([]);
    const [usedSaranId, setUsedSaranId] = useState<string | null>(null);
    const closeTimer = useRef<number | null>(null);

    useEffect(() => {
        if (!open) {
            return;
        }

        setTipe('unit');
        setQuery('');
        setSelectedTarget(null);
        setBatasWaktu(defaultDeadline());
        setPrioritas('Biasa');
        setInstruksi('Tindak lanjut');
        setCatatan('');
        setKirimNotifikasi(true);
        setErrors({});
        setSubmitError(null);
        setSubmitting(false);
        setSuccess(false);
        setSaran(surat.saranDisposisi);
        setUsedSaranId(null);
    }, [open, surat.id, surat.saranDisposisi]);

    useEffect(() => {
        if (!open || surat.saranDisposisi.length > 0) {
            return;
        }

        const controller = new AbortController();

        fetchSaranDisposisi(surat.id, controller.signal)
            .then((result) => setSaran(result))
            .catch(() => setSaran([]));

        return () => controller.abort();
    }, [open, surat.id, surat.saranDisposisi]);

    useEffect(() => {
        if (!open) {
            return;
        }

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape' && !submitting) {
                onClose();
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [open, submitting, onClose]);

    useEffect(() => {
        return () => {
            if (closeTimer.current !== null) {
                window.clearTimeout(closeTimer.current);
            }
        };
    }, []);

    if (!open) {
        return null;
    }

    function changeTipe(nextTipe: TargetTipe): void {
        setTipe(nextTipe);
        setQuery('');
        setSelectedTarget(null);
        setErrors((current) => ({ ...current, target: undefined }));
    }

    function useSaran(recommendation: SaranDisposisi): void {
        setTipe(recommendation.tipe);
        setQuery('');
        setSelectedTarget({
            id: recommendation.targetId,
            nama: recommendation.nama,
            keterangan: recommendation.alasan,
        });
        setUsedSaranId(String(recommendation.id));
        setErrors((current) => ({ ...current, target: undefined }));
    }

    async function handleSubmit(): Promise<void> {
        const nextErrors: FormErrors = {};

        if (selectedTarget === null) {
            nextErrors.target = 'Pilih unit atau user tujuan disposisi.';
        }

        if (batasWaktu.trim() === '') {
            nextErrors.batasWaktu = 'Batas waktu wajib diisi.';
        }

        setErrors(nextErrors);

        if (selectedTarget === null || nextErrors.batasWaktu) {
            return;
        }

        setSubmitting(true);
        setSubmitError(null);

        try {
            await kirimDisposisi({
                suratMasukId: surat.id,
                tipe,
                targetId: selectedTarget.id,
                batasWaktu,
                prioritas,
                instruksi,
                catatan,
                kirimNotifikasi,
            });

            setSuccess(true);
            setSubmitting(false);
            onSuccess?.();
            closeTimer.current = window.setTimeout(onClose, 900);
        } catch (reason: unknown) {
            setSubmitError(errorMessage(reason, 'Disposisi gagal dikirim. Silakan coba lagi.'));
            setSubmitting(false);
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4 py-6 backdrop-blur-sm">
            <div
                aria-labelledby="disposisi-modal-title"
                aria-modal="true"
                className="flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
                role="dialog"
            >
                <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-4">
                    <div>
                        <h2 className="text-base font-semibold text-ink" id="disposisi-modal-title">Disposisi surat</h2>
                        <p className="mt-1 text-xs text-slate-500">Teruskan surat kepada unit atau pengguna yang bertanggung jawab.</p>
                    </div>
                    <button
                        aria-label="Tutup"
                        className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-ink disabled:opacity-40"
                        disabled={submitting}
                        onClick={onClose}
                        type="button"
                    >
                        <Icon name="close" size={18} />
                    </button>
                </div>

                <div className="ea-scrollbar flex-1 space-y-5 overflow-y-auto px-6 py-5">
                    <div className="rounded-xl border border-brand-100 bg-brand-50/70 p-4">
                        <div className="flex items-start justify-between gap-4">
                            <div className="min-w-0">
                                <p className="text-[11px] font-semibold uppercase tracking-wider text-brand-900 tabular-nums">{surat.nomorSurat}</p>
                                <p className="mt-1 truncate text-sm font-semibold text-ink">{surat.perihal}</p>
                                <p className="mt-1 text-xs text-slate-500">Pengirim: {surat.pengirim}</p>
                            </div>
                            <UrgensiBadge sifat={surat.sifat} />
                        </div>
                    </div>

                    {saran.length > 0 ? (
                        <div className="rounded-xl border border-brand-100 bg-white p-4">
                            <div className="flex items-center gap-2 text-xs font-semibold text-brand-900">
                                <Icon name="sparkles" size={16} /> Saran Disposisi AI
                            </div>
                            <div className="mt-3 space-y-2">
                                {saran.map((recommendation) => (
                                    <button
                                        className="flex w-full items-center justify-between gap-3 rounded-lg border border-slate-100 bg-canvas px-3 py-2 text-left transition hover:border-brand-200 disabled:cursor-default disabled:opacity-60"
                                        disabled={usedSaranId !== null}
                                        key={recommendation.id}
                                        onClick={() => useSaran(recommendation)}
                                        type="button"
                                    >
                                        <span className="min-w-0">
                                            <span className="block text-xs font-semibold text-ink">{recommendation.nama}</span>
                                            <span className="block truncate text-[11px] text-slate-500">{recommendation.alasan}</span>
                                        </span>
                                        <span className="shrink-0 text-[11px] font-semibold text-brand-900 tabular-nums">
                                            {Math.round(recommendation.skor)}%
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : null}

                    <div>
                        <p className="text-xs font-semibold text-slate-600">Tujuan disposisi <span className="text-red-500">*</span></p>
                        <div className="mt-2 inline-flex rounded-xl border border-slate-200 bg-canvas p-1">
                            {(['unit', 'user'] as TargetTipe[]).map((option) => (
                                <button
                                    className={`rounded-lg px-5 py-2 text-xs font-semibold transition ${tipe === option ? 'bg-brand-50 text-brand-900 shadow-sm' : 'text-slate-500 hover:text-ink'}`}
                                    key={option}
                                    onClick={() => changeTipe(option)}
                                    type="button"
                                >
                                    {option === 'unit' ? 'Unit' : 'User'}
                                </button>
                            ))}
                        </div>
                        <div className="relative mt-3">
                            <Icon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" name="search" size={16} />
                            <input
                                aria-label={tipe === 'unit' ? 'Cari unit tujuan' : 'Cari user tujuan'}
                                className={`${INPUT_CLASS} pl-9`}
                                onChange={(event) => setQuery(event.target.value)}
                                placeholder={tipe === 'unit' ? 'Cari unit tujuan...' : 'Cari user tujuan...'}
                                type="search"
                                value={query}
                            />
                        </div>
                        <div className="mt-3">
                            <DisposisiTargetPicker
                                onSelect={(target) => {
                                    setSelectedTarget(target);
                                    setErrors((current) => ({ ...current, target: undefined }));
                                }}
                                query={query}
                                selectedId={selectedTarget?.id ?? null}
                                tipe={tipe}
                            />
                        </div>
                        {errors.target ? <p className="mt-1.5 text-xs text-red-600">{errors.target}</p> : null}
                        <div className="mt-3 flex items-start gap-2 rounded-lg border border-sky-100 bg-sky-50 px-3 py-2 text-[11px] leading-relaxed text-sky-900">
                            <Icon className="mt-0.5 shrink-0" name="info" size={14} />
                            Pilih satu tujuan agar tanggung jawab disposisi menjadi jelas.
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                            <label className="block text-xs font-semibold text-slate-600" htmlFor="batas-waktu">
                                Batas waktu <span className="text-red-500">*</span>
                            </label>
                            <input
                                className={`${INPUT_CLASS} mt-2`}
                                id="batas-waktu"
                                onChange={(event) => {
                                    setBatasWaktu(event.target.value);
                                    setErrors((current) => ({ ...current, batasWaktu: undefined }));
                                }}
                                type="datetime-local"
                                value={batasWaktu}
                            />
                            {errors.batasWaktu ? <p className="mt-1.5 text-xs text-red-600">{errors.batasWaktu}</p> : null}
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-600" htmlFor="prioritas">
                                Prioritas <span className="text-red-500">*</span>
                            </label>
                            <select
                                className={`${INPUT_CLASS} mt-2`}
                                id="prioritas"
                                onChange={(event) => setPrioritas(event.target.value as PrioritasDisposisi)}
                                value={prioritas}
                            >
                                {PRIORITAS_OPTIONS.map((option) => <option key={option} value={option}>{option}</option>)}
                            </select>
                        </div>
                    </div>

                    <div>
                        <p className="text-xs font-semibold text-slate-600">Instruksi disposisi <span className="text-red-500">*</span></p>
                        <div className="mt-2 flex flex-wrap gap-2">
                            {INSTRUKSI_OPTIONS.map((option) => (
                                <button
                                    className={`rounded-full border px-3.5 py-2 text-xs font-semibold transition ${instruksi === option ? 'border-brand-800 bg-brand-50 text-brand-900' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}
                                    key={option}
                                    onClick={() => setInstruksi(option)}
                                    type="button"
                                >
                                    {option === 'Tindak lanjut' ? '✓ Tindak lanjut' : option}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-600" htmlFor="catatan">Catatan untuk penerima</label>
                        <textarea
                            className={`${INPUT_CLASS} mt-2 min-h-24 resize-y`}
                            id="catatan"
                            onChange={(event) => setCatatan(event.target.value)}
                            placeholder="Tambahkan catatan atau arahan khusus..."
                            value={catatan}
                        />
                    </div>

                    <label className="flex items-center gap-2 text-xs text-slate-600">
                        <input
                            checked={kirimNotifikasi}
                            className="ea-checkbox h-4 w-4"
                            onChange={(event) => setKirimNotifikasi(event.target.checked)}
                            type="checkbox"
                        />
                        Kirim notifikasi kepada penerima disposisi
                    </label>

                    {submitError ? <Alert message={submitError} /> : null}
                    {success ? <Alert message="Disposisi berhasil dikirim." variant="success" /> : null}
                </div>

                <div className="flex flex-wrap items-center justify-end gap-2.5 border-t border-slate-100 bg-white px-6 py-4">
                    <button
                        className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                        disabled={submitting}
                        onClick={onClose}
                        type="button"
                    >
                        Batal
                    </button>
                    <button
                        className="inline-flex items-center gap-2 rounded-xl bg-brand-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-950 disabled:opacity-60"
                        disabled={submitting || success}
                        onClick={() => { void handleSubmit(); }}
                        type="button"
                    >
                        {submitting ? <Spinner /> : <Icon name="send" size={16} />}
                        Kirim disposisi →
                    </button>
                </div>
            </div>
        </div>
    );
}
