import EmptyState from '../components/ui/EmptyState';
import { ROUTES } from '../lib/constants';
import { Link } from '../router/RouterContext';

export default function NotFoundPage() {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <EmptyState
                action={(
                    <Link className="inline-flex items-center gap-2 rounded-xl bg-brand-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-950" to={ROUTES.dashboard}>
                        Kembali ke dashboard
                    </Link>
                )}
                description="Halaman yang Anda cari tidak tersedia. Periksa kembali alamat atau kembali ke dashboard."
                icon="search"
                title="Halaman tidak ditemukan"
            />
        </div>
    );
}
