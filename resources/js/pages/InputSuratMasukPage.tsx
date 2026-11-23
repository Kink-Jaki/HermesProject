import Icon from '../components/ui/Icon';
import PageHeader from '../components/ui/PageHeader';
import Skeleton from '../components/ui/Skeleton';
import { ROUTES } from '../lib/constants';
import { Link } from '../router/RouterContext';

function FieldSkeleton() {
    return (
        <div>
            <Skeleton className="h-3 w-28" />
            <Skeleton className="mt-2 h-10 w-full" />
        </div>
    );
}

export default function InputSuratMasukPage() {
    return (
        <>
            <PageHeader
                actions={(
                    <span className="text-xs font-medium text-slate-400">* Wajib diisi</span>
                )}
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

            <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
                <div className="space-y-5 xl:col-span-2">
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <h2 className="text-sm font-semibold text-ink">01 Informasi surat</h2>
                        <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
                            <FieldSkeleton />
                            <FieldSkeleton />
                            <FieldSkeleton />
                            <FieldSkeleton />
                            <div className="sm:col-span-2"><FieldSkeleton /></div>
                        </div>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <h2 className="text-sm font-semibold text-ink">02 Perihal dan klasifikasi</h2>
                        <div className="mt-5 space-y-5"><FieldSkeleton /><FieldSkeleton /></div>
                    </div>
                </div>

                <div className="space-y-5">
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <h2 className="text-sm font-semibold text-ink">Lampiran surat</h2>
                        <div className="mt-4 rounded-xl border-2 border-dashed border-slate-200 bg-canvas px-4 py-10 text-center">
                            <Icon className="mx-auto text-slate-300" name="file" size={28} />
                            <p className="mt-3 text-xs font-medium text-slate-500">PDF, JPG, atau PNG · maks 10 MB</p>
                        </div>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <h2 className="text-sm font-semibold text-ink">Klasifikasi</h2>
                        <div className="mt-5 space-y-5"><FieldSkeleton /><FieldSkeleton /></div>
                    </div>
                    <div className="rounded-xl border border-emerald-100 bg-brand-50 p-4 text-xs leading-relaxed text-brand-900">
                        Pastikan data sudah sesuai sebelum menyimpan surat.
                    </div>
                </div>
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
                <p className="text-xs text-slate-500">Formulir siap terhubung dengan API pada Tahap 2.</p>
                <div className="flex gap-2.5">
                    <Link className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50" to={ROUTES.suratMasuk}>
                        Batal
                    </Link>
                    <button className="rounded-xl bg-brand-900 px-4 py-2.5 text-sm font-semibold text-white opacity-60" disabled type="button">
                        Simpan surat
                    </button>
                </div>
            </div>
        </>
    );
}
