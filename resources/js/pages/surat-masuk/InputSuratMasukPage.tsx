import { useCallback, useEffect, useState } from 'react';
import Alert from '../../components/ui/Alert';
import Badge from '../../components/ui/Badge';
import EmptyState from '../../components/ui/EmptyState';
import FormField from '../../components/surat-masuk/FormField';
import Icon from '../../components/ui/Icon';
import LampiranDropzone from '../../components/surat-masuk/LampiranDropzone';
import PageHeader from '../../components/ui/PageHeader';
import Skeleton from '../../components/ui/Skeleton';
import Spinner from '../../components/ui/Spinner';
import { errorMessage } from '../../services/http';
import {
    createSuratMasuk,
    fetchKlasifikasiOptions,
    fetchNomorAgenda,
} from '../../services/suratMasukService';
import type {
    KlasifikasiOption,
} from '../../services/suratMasukService';
import { ROUTES, detailSuratMasukPath } from '../../lib/constants';
import { Link, useRouter } from '../../router/RouterContext';
import type { SifatSurat } from '../../types';

type FieldName = 'nomorSurat' | 'tanggalSurat' | 'tanggalDiterima' | 'pengirim' | 'perihal' | 'klasifikasiId';
type FormErrors = Partial<Record<FieldName, string>>;

const SIFAT_OPTIONS: SifatSurat[] = ['Biasa', 'Segera', 'Sangat Segera'];
const INPUT_CLASS = 'ea-input w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-ink outline-none placeholder:text-slate-400';

function todayInputValue(): string {
    const date = new Date();

    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function isAbortError(reason: unknown): boolean {
    return reason instanceof Error && reason.name === 'AbortError';
}

function FormSkeleton() {
    return (
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
            <div className="space-y-5 xl:col-span-2">
                {[0, 1].map((card) => (
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm" key={card}>
                        <Skeleton className="h-4 w-48" />
                        <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
                            {[0, 1, 2, 3].map((field) => (
                                <div key={field}>
                                    <Skeleton className="h-3 w-28" />
                                    <Skeleton className="mt-2 h-10 w-full" />
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
            <div className="space-y-5">
                <Skeleton className="h-72 rounded-2xl" />
                <Skeleton className="h-64 rounded-2xl" />
            </div>
        </div>
    );
}

export default function InputSuratMasukPage() {
    const { navigate } = useRouter();
    const [nomorAgenda, setNomorAgenda] = useState('');
    const [nomorSurat, setNomorSurat] = useState('');
    const [tanggalSurat, setTanggalSurat] = useState(todayInputValue);
    const [tanggalDiterima, setTanggalDiterima] = useState(todayInputValue);
    const [pengirim, setPengirim] = useState('');
    const [perihal, setPerihal] = useState('');
    const [sifat, setSifat] = useState<SifatSurat>('Biasa');
    const [klasifikasiId, setKlasifikasiId] = useState('');
    const [lampiran, setLampiran] = useState<File[]>([]);
    const [klasifikasiOptions, setKlasifikasiOptions] = useState<KlasifikasiOption[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [reloadVersion, setReloadVersion] = useState(0);
    const [errors, setErrors] = useState<FormErrors>({});
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const loadMasterData = useCallback(async (signal: AbortSignal): Promise<void> => {
        const [nomor, klassifikasi] = await Promise.all([
            fetchNomorAgenda(signal),
            fetchKlasifikasiOptions(signal),
        ]);

        setNomorAgenda(nomor);
        setKlasifikasiOptions(klassifikasi);
    }, []);

    useEffect(() => {
        const controller = new AbortController();

        setLoading(true);
        setLoadError(null);

        loadMasterData(controller.signal)
            .then(() => setLoading(false))
            .catch((reason: unknown) => {
                if (isAbortError(reason)) {
                    return;
                }

                setLoadError(errorMessage(reason, 'Data pendukung tidak dapat dimuat.'));
                setLoading(false);
            });

        return () => controller.abort();
    }, [loadMasterData, reloadVersion]);

    const selectedKlasifikasi = klasifikasiOptions.find((option) => String(option.id) === klasifikasiId);

    function validate(): FormErrors {
        const nextErrors: FormErrors = {};

        if (nomorSurat.trim() === '') {
            nextErrors.nomorSurat = 'Nomor surat wajib diisi.';
        }

        if (tanggalSurat === '') {
            nextErrors.tanggalSurat = 'Tanggal surat wajib diisi.';
        }

        if (tanggalDiterima === '') {
            nextErrors.tanggalDiterima = 'Tanggal diterima wajib diisi.';
        }

        if (pengirim.trim() === '') {
            nextErrors.pengirim = 'Asal / pengirim surat wajib diisi.';
        }

        if (perihal.trim() === '') {
            nextErrors.perihal = 'Perihal surat wajib diisi.';
        }

        if (klasifikasiId === '') {
            nextErrors.klasifikasiId = 'Klasifikasi arsip wajib dipilih.';
        }

        return nextErrors;
    }

    async function handleSubmit(): Promise<void> {
        const nextErrors = validate();

        setErrors(nextErrors);
        setSubmitError(null);

        if (Object.keys(nextErrors).length > 0) {
            return;
        }

        setSubmitting(true);

        try {
            const surat = await createSuratMasuk({
                nomorAgenda,
                nomorSurat: nomorSurat.trim(),
                tanggalSurat,
                tanggalDiterima,
                pengirim: pengirim.trim(),
                perihal: perihal.trim(),
                sifat,
                klasifikasiId,
                lampiran,
            });

            setSuccess(true);
            setSubmitting(false);
            window.setTimeout(() => navigate(detailSuratMasukPath(surat.id)), 800);
        } catch (reason: unknown) {
            setSubmitError(errorMessage(reason, 'Surat gagal disimpan. Silakan coba lagi.'));
            setSubmitting(false);
        }
    }

    return (
        <>
            <PageHeader
                actions={<span className="text-xs font-medium text-slate-400">* Wajib diisi</span>}
                breadcrumb={(
                    <span className="flex items-center gap-1.5">
                        <Link className="hover:text-brand-900" to={ROUTES.suratMasuk}>Surat masuk</Link>
                        <Icon name="chevronRight" size={12} />
                        Input surat
                    </span>
                )}
                subtitle="Catat surat masuk baru dengan informasi lengkap dan lampiran yang valid."
                title="Input surat masuk"
            />

            {loading ? <FormSkeleton /> : null}

            {!loading && loadError ? (
                <Alert
                    action={(
                        <button className="text-xs font-semibold underline" onClick={() => setReloadVersion((current) => current + 1)} type="button">
                            Coba lagi
                        </button>
                    )}
                    message={loadError}
                    title="Formulir tidak dapat disiapkan"
                />
            ) : null}

            {!loading && !loadError ? (
                <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
                    <div className="space-y-5 xl:col-span-2">
                        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                            <h2 className="text-sm font-semibold text-ink">01 Informasi surat</h2>
                            <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
                                <FormField
                                    hint="Nomor agenda diambil otomatis dari sistem."
                                    htmlFor="nomor-agenda"
                                    label="Nomor agenda"
                                >
                                    <div className="relative">
                                        <input
                                            className={`${INPUT_CLASS} bg-brand-50/50 font-semibold text-brand-900 tabular-nums`}
                                            id="nomor-agenda"
                                            readOnly
                                            value={nomorAgenda || 'Menunggu nomor agenda...'}
                                        />
                                        {nomorAgenda === '' ? (
                                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-900"><Spinner /></span>
                                        ) : null}
                                    </div>
                                </FormField>
                                <FormField error={errors.nomorSurat} htmlFor="nomor-surat" label="Nomor surat" required>
                                    <input
                                        className={INPUT_CLASS}
                                        id="nomor-surat"
                                        onChange={(event) => { setNomorSurat(event.target.value); setErrors((current) => ({ ...current, nomorSurat: undefined })); }}
                                        placeholder="Contoh: 005/126/SETDA/2025"
                                        type="text"
                                        value={nomorSurat}
                                    />
                                </FormField>
                                <FormField error={errors.tanggalSurat} htmlFor="tanggal-surat" label="Tanggal surat" required>
                                    <input
                                        className={INPUT_CLASS}
                                        id="tanggal-surat"
                                        onChange={(event) => { setTanggalSurat(event.target.value); setErrors((current) => ({ ...current, tanggalSurat: undefined })); }}
                                        type="date"
                                        value={tanggalSurat}
                                    />
                                </FormField>
                                <FormField error={errors.tanggalDiterima} htmlFor="tanggal-diterima" label="Tanggal diterima" required>
                                    <input
                                        className={INPUT_CLASS}
                                        id="tanggal-diterima"
                                        onChange={(event) => { setTanggalDiterima(event.target.value); setErrors((current) => ({ ...current, tanggalDiterima: undefined })); }}
                                        type="date"
                                        value={tanggalDiterima}
                                    />
                                </FormField>
                                <FormField className="sm:col-span-2" error={errors.pengirim} htmlFor="pengirim" label="Asal / pengirim surat" required>
                                    <input
                                        className={INPUT_CLASS}
                                        id="pengirim"
                                        onChange={(event) => { setPengirim(event.target.value); setErrors((current) => ({ ...current, pengirim: undefined })); }}
                                        placeholder="Nama instansi atau unit pengirim"
                                        type="text"
                                        value={pengirim}
                                    />
                                </FormField>
                            </div>
                        </section>

                        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                            <h2 className="text-sm font-semibold text-ink">02 Perihal dan klasifikasi</h2>
                            <div className="mt-5 space-y-5">
                                <FormField error={errors.perihal} htmlFor="perihal" label="Perihal surat" required>
                                    <input
                                        className={INPUT_CLASS}
                                        id="perihal"
                                        onChange={(event) => { setPerihal(event.target.value); setErrors((current) => ({ ...current, perihal: undefined })); }}
                                        placeholder="Ringkas perihal surat"
                                        type="text"
                                        value={perihal}
                                    />
                                </FormField>
                                <div className="rounded-xl border border-slate-100 bg-canvas px-4 py-3.5">
                                    <p className="text-xs font-medium text-slate-400">Preview klasifikasi</p>
                                    <div className="mt-2 flex flex-wrap items-center gap-2">
                                        {selectedKlasifikasi ? (
                                            <>
                                                <Badge tone="brand">{selectedKlasifikasi.nama}</Badge>
                                                {selectedKlasifikasi.kode !== '' ? (
                                                    <span className="text-[11px] text-slate-500 tabular-nums">{selectedKlasifikasi.kode}</span>
                                                ) : null}
                                            </>
                                        ) : (
                                            <span className="text-xs text-slate-400">Pilih klasifikasi arsip untuk melihat preview.</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>

                    <div className="space-y-5">
                        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                            <h2 className="text-sm font-semibold text-ink">Lampiran surat</h2>
                            <div className="mt-4">
                                <LampiranDropzone files={lampiran} onChange={setLampiran} />
                            </div>
                        </section>

                        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                            <h2 className="text-sm font-semibold text-ink">Klasifikasi</h2>
                            <div className="mt-5 space-y-5">
                                <FormField htmlFor="sifat" label="Sifat surat" required>
                                    <select
                                        className={INPUT_CLASS}
                                        id="sifat"
                                        onChange={(event) => setSifat(event.target.value as SifatSurat)}
                                        value={sifat}
                                    >
                                        {SIFAT_OPTIONS.map((option) => <option key={option} value={option}>{option}</option>)}
                                    </select>
                                </FormField>
                                <FormField error={errors.klasifikasiId} htmlFor="klasifikasi" label="Klasifikasi arsip" required>
                                    {klasifikasiOptions.length === 0 ? (
                                        <div className="rounded-xl border border-slate-200 bg-canvas">
                                            <EmptyState
                                                compact
                                                description="Klasifikasi arsip belum tersedia. Muat ulang formulir untuk mencoba lagi."
                                                icon="filter"
                                                title="Tidak ada klasifikasi"
                                            />
                                        </div>
                                    ) : (
                                        <select
                                            className={INPUT_CLASS}
                                            id="klasifikasi"
                                            onChange={(event) => { setKlasifikasiId(event.target.value); setErrors((current) => ({ ...current, klasifikasiId: undefined })); }}
                                            value={klasifikasiId}
                                        >
                                            <option value="">Pilih klasifikasi</option>
                                            {klasifikasiOptions.map((option) => (
                                                <option key={option.id} value={option.id}>
                                                    {option.kode !== '' ? `${option.kode} — ` : ''}{option.nama}
                                                </option>
                                            ))}
                                        </select>
                                    )}
                                </FormField>
                            </div>
                        </section>

                        <div className="rounded-xl border border-emerald-100 bg-brand-50 p-4 text-xs leading-relaxed text-brand-900">
                            Pastikan data sudah sesuai sebelum menyimpan surat.
                        </div>
                    </div>
                </div>
            ) : null}

            {submitError ? <div className="mt-4"><Alert message={submitError} title="Surat gagal disimpan" /></div> : null}
            {success ? <div className="mt-4"><Alert message="Surat berhasil disimpan. Membuka detail surat..." variant="success" /></div> : null}

            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
                <p className="text-xs text-slate-500">
                    {lampiran.length > 0 ? `${lampiran.length} lampiran siap diunggah.` : 'Lampiran bersifat opsional.'}
                </p>
                <div className="flex gap-2.5">
                    <Link className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50" to={ROUTES.suratMasuk}>
                        Batal
                    </Link>
                    <button
                        className="inline-flex items-center gap-2 rounded-xl bg-brand-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-950 disabled:opacity-60"
                        disabled={loading || loadError !== null || submitting || success}
                        onClick={() => { void handleSubmit(); }}
                        type="button"
                    >
                        {submitting ? <Spinner /> : <Icon name="check" size={16} />}
                        Simpan surat
                    </button>
                </div>
            </div>
        </>
    );
}
