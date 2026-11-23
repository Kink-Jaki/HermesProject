import Icon from './Icon';
import Spinner from './Spinner';

export default function FullPageLoader({ label = 'Menyiapkan workspace...' }: { label?: string }) {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-canvas px-6 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-900 text-white shadow-lg shadow-brand-900/20">
                <Icon name="shield" size={28} />
            </div>
            <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
                <Spinner className="text-brand-800" />
                {label}
            </div>
        </div>
    );
}
