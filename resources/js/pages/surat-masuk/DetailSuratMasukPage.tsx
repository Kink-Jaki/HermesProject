import { useCallback, useState } from 'react';
import ActivityTimeline from '../../components/surat-masuk/ActivityTimeline';
import DocumentViewer from '../../components/surat-masuk/DocumentViewer';
import DisposisiModal from '../../components/disposisi/DisposisiModal';
import Alert from '../../components/ui/Alert';
import EmptyState from '../../components/ui/EmptyState';
import Icon from '../../components/ui/Icon';
import PageHeader from '../../components/ui/PageHeader';
import Skeleton from '../../components/ui/Skeleton';
import Spinner from '../../components/ui/Spinner';
import StatusBadge from '../../components/ui/StatusBadge';
import UrgensiBadge from '../../components/ui/UrgensiBadge';
import { useApi } from '../../hooks/useApi';
import { ROUTES } from '../../lib/constants';
import { formatTanggal } from '../../lib/format';
import { Link, matchPath, useRouter } from '../../router/RouterContext';
import { errorMessage } from '../../services/http';
import { fetchSuratMasukDetail, unduhSuratMasuk } from '../../services/suratMasukService';

function DetailSkeleton() {
    return (
        <>
            <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
                <div className="space-y-5 xl:col-span-2">
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <Skeleton className="h-4 w-1/2" />
                        <Skeleton className="mt-6 h-[360px] w-full" />
                    </div>
                    <Skeleton className="h-28 rounded-2xl" />
                </div>
                <div className="space-y-5">
                    <Skeleton className="h-64 rounded-2xl" />
                    <Skeleton className="h-56 rounded-2xl" />
                </div>
            </div>
        </>
    );
}

export default function DetailSuratMasukPage() {
    const { pathname } = useRouter();
    const params = matchPath(ROUTES.detailSuratMasuk, pathname);
    const id = params?.id ?? '';
    const [modalOpen, setModalOpen] = useState(false);
    const [downloadError, setDownloadError] = useState<string | null>(null);
    const [downloading, setDownloading] = useState(false);
    const [disposisiSuccess, setDisposisiSuccess] = useState(false);

    const fetcher = useCallback(() => {
        if (id === '') {
            throw new Error('Alamat detail surat tidak valid.');
        }

        return fetchSuratMasukDetail(id);
    }, [id]);
    const { data: surat, loading, error, reload } = useApi(fetcher);

    async function handleDownload(): Promise<void> {
        if (!surat) {
            return;
        }

        setDownloading(true);
        setDownloadError(null);

        try {
            await unduhSuratMasuk(surat);
        } catch (reason: unknown) {
            setDownloadError(errorMessage(reason, 'Dokumen tidak dapat diunduh.'));
        } finally {
            setDownloading(false);
        }
    }

    const breadcrumb = (
        <span className="flex items-center gap-1.5">
            <Link className="hover:text-brand-900" to={ROUTES.suratMasuk}>Surat masuk</Link>
            <Icon name="chevronRight" size={12} />
            Detail surat
        </span>
    );

    if (loading) {
        return (
            <>
                <PageHeader breadcrumb={breadcrumb} subtitle="Pratinjau dokumen, metadata, dan riwayat aktivitas surat." title="Memuat surat..." />
                <DetailSkeleton />
            </>
        );
    }

    if (error) {
        return (
            <>
                <PageHeader breadcrumb={breadcrumb} subtitle="Pratinjau dokumen, metadata, dan riwayat aktivitas surat." title="Detail surat masuk" />
                <Alert
                    action={(
                        <button className="text-xs font-semibold underline" onClick={reload} type="button">Coba lagi</button>
                    )}
                    message={error}
                    title="Detail surat gagal dimuat"
                />
            </>
        );
    }

    if (!surat) {
        return (
            <>
                <PageHeader breadcrumb={breadcrumb} subtitle="Pratinjau dokumen, metadata, dan riwayat aktivitas surat." title="Detail surat masuk" />
                <EmptyState
                    action={(
                        <Link className="rounded-xl bg-brand-900 px-4 py-2 text-xs font-semibold text-white hover:bg-brand-950" to={ROUTES.suratMasuk}>
                            Kembali ke daftar
                        </Link>
                    )}
                    description="Surat yang Anda cari tidak tersedia atau sudah dihapus."
                    icon="inbox"
                    title="Surat tidak ditemukan"
                />
            </>
        );
    }

    const metadata = [
        { label: 'Nomor agenda', value: surat.nomorAgenda },
        { label: 'Nomor surat', value: surat.nomorSurat },
        { label: 'Pengirim', value: surat.pengirim },
        { label: 'Tanggal surat', value: formatTanggal(surat.tanggalSurat) },
        { label: 'Tanggal diterima', value: formatTanggal(surat.tanggalDiterima) },
        { label: 'Klasifikasi', value: surat.klasifikasi },
        { label: 'Dicatat oleh', value: surat.dicatatOleh },
    ];

    return (
        <>
            <PageHeader
                actions={(
                    <>
                        <button
                            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50 disabled:opacity-60"
                            disabled={downloading}
                            onClick={() => { void handleDownload(); }}
                            type="button"
                        >
                            {downloading ? <Spinner /> : <Icon name="download" size={16} />} Unduh
                        </button>
                        <button
                            className="inline-flex items-center gap-2 rounded-xl bg-brand-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-950"
                            onClick={() => setModalOpen(true)}
                            type="button"
                        >
                            <Icon name="send" size={16} /> Disposisi surat
                        </button>
                    </>
                )}
                badge={(
                    <>
                        <StatusBadge status={surat.status} />
                        <UrgensiBadge sifat={surat.sifat} />
                    </>
                )}
                breadcrumb={breadcrumb}
                subtitle={`${surat.nomorSurat} · ${formatTanggal(surat.tanggalSurat)} · ${surat.pengirim}`}
                title={surat.perihal}
            />

            {downloadError ? <div className="mb-4"><Alert message={downloadError} title="Unduh gagal" /></div> : null}
            {disposisiSuccess ? (
                <div className="mb-4">
                    <Alert message="Disposisi berhasil dikirim. Riwayat aktivitas telah diperbarui." variant="success" />
                </div>
            ) : null}

            <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
                <div className="space-y-5 xl:col-span-2">
                    <DocumentViewer lampiran={surat.lampiran} />

                    <div className="rounded-2xl border border-emerald-100 bg-brand-50/60 p-5">
                        <div className="flex items-center gap-2 text-sm font-semibold text-brand-900">
                            <Icon name="sparkles" size={17} /> Ringkasan AI
                        </div>
                        <p className="mt-2 text-xs leading-relaxed text-slate-600">
                            {surat.ringkasan !== ''
                                ? surat.ringkasan
                                : 'Ringkasan otomatis belum tersedia untuk surat ini.'}
                        </p>
                    </div>
                </div>

                <div className="space-y-5">
                    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <h2 className="text-sm font-semibold text-ink">Informasi surat</h2>
                        <dl className="mt-4 space-y-3.5">
                            {metadata.map((item) => (
                                <div className="flex items-start justify-between gap-4" key={item.label}>
                                    <dt className="shrink-0 text-xs text-slate-400">{item.label}</dt>
                                    <dd className="min-w-0 break-words text-right text-xs font-medium text-ink tabular-nums">{item.value}</dd>
                                </div>
                            ))}
                        </dl>
                    </section>

                    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <h2 className="text-sm font-semibold text-ink">Riwayat aktivitas</h2>
                        <div className="mt-4">
                            <ActivityTimeline items={surat.riwayat} />
                        </div>
                    </section>
                </div>
            </div>

            <DisposisiModal
                onClose={() => setModalOpen(false)}
                onSuccess={() => {
                    setDisposisiSuccess(true);
                    reload();
                }}
                open={modalOpen}
                surat={surat}
            />
        </>
    );
}
