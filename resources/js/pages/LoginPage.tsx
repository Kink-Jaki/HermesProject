import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useRouter } from '../router/RouterContext';
import { errorMessage } from '../services/http';
import Alert from '../components/ui/Alert';
import Icon from '../components/ui/Icon';
import Spinner from '../components/ui/Spinner';
import StatusBadge from '../components/ui/StatusBadge';
import UrgensiBadge from '../components/ui/UrgensiBadge';
import type { SifatSurat, StatusSurat } from '../types';

interface AgendaPreview {
    nomor: string;
    perihal: string;
    waktu: string;
    status: StatusSurat;
    sifat: SifatSurat;
}

const AGENDA_PREVIEW: AgendaPreview[] = [
    {
        nomor: '005/126/SETDA/2025',
        perihal: 'Undangan rapat koordinasi',
        waktu: '08.30 WIB',
        status: 'Baru',
        sifat: 'Segera',
    },
    {
        nomor: '004/125/SETDA/2025',
        perihal: 'Permohonan data kepegawaian',
        waktu: '10.15 WIB',
        status: 'Terdisposisi',
        sifat: 'Biasa',
    },
    {
        nomor: '003/124/SETDA/2025',
        perihal: 'Laporan bulanan bagian umum',
        waktu: '13.00 WIB',
        status: 'Selesai',
        sifat: 'Biasa',
    },
];

export default function LoginPage() {
    const { login, status } = useAuth();
    const { navigate, state } = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [remember, setRemember] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [notice, setNotice] = useState<string | null>(null);

    useEffect(() => {
        if (status === 'authenticated') {
            navigate('/dashboard', { replace: true });
        }
    }, [status, navigate]);

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError(null);
        setNotice(null);

        if (email.trim() === '' || password === '') {
            setError('Email dan kata sandi wajib diisi.');
            return;
        }

        setLoading(true);

        try {
            await login({ email: email.trim(), password, remember });
            const from = typeof state.from === 'string' ? state.from : '/dashboard';
            const destination = from.startsWith('/') && !from.startsWith('/login') ? from : '/dashboard';

            navigate(destination, { replace: true });
        } catch (reason) {
            setError(errorMessage(reason, 'Email atau kata sandi yang Anda masukkan tidak valid.'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white lg:grid lg:grid-cols-2">
            <section className="ea-login-panel relative hidden overflow-hidden bg-brand-900 px-10 py-10 text-white lg:flex lg:flex-col xl:px-16 xl:py-12">
                <div className="ea-login-glow" aria-hidden="true" />

                <div className="relative z-10 flex items-center gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/25">
                        <Icon name="shield" size={24} />
                    </span>
                    <span className="text-2xl font-semibold tracking-tight">e-Agenda</span>
                </div>

                <div className="relative z-10 my-auto max-w-lg py-10">
                    <span className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3 py-1.5 text-[11px] font-semibold tracking-[0.18em] text-emerald-50">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
                        SISTEM PERSURATAN DIGITAL
                    </span>

                    <h1 className="mt-7 text-[42px] font-semibold leading-[1.15] tracking-tight xl:text-[52px]">
                        Persuratan tertata.
                        <br />
                        <span className="text-emerald-300">Kerja lebih bermakna.</span>
                    </h1>

                    <p className="mt-5 max-w-md text-sm leading-relaxed text-emerald-50/80">
                        Satu ruang kerja untuk mencatat, mendisposisikan, dan memantau setiap surat masuk maupun keluar secara real-time.
                    </p>

                    <div className="mt-9 w-full max-w-md rounded-2xl border border-white/15 bg-white p-5 text-ink shadow-2xl shadow-black/20">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-brand-900">
                                    <Icon name="calendar" size={18} />
                                </span>
                                <div>
                                    <p className="text-sm font-semibold">Agenda Hari Ini</p>
                                    <p className="text-[11px] text-slate-400">Senin, 19 Mei 2025</p>
                                </div>
                            </div>
                            <span className="rounded-full bg-brand-50 px-2.5 py-1 text-[11px] font-semibold text-brand-900 tabular-nums">
                                3 surat
                            </span>
                        </div>

                        <div className="mt-4 divide-y divide-slate-100 border-t border-slate-100">
                            {AGENDA_PREVIEW.map((item) => (
                                <div className="flex items-center gap-3 py-3" key={item.nomor}>
                                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                                        <Icon name="file" size={16} />
                                    </span>
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-xs font-semibold text-ink">{item.perihal}</p>
                                        <p className="mt-0.5 truncate text-[11px] text-slate-400 tabular-nums">
                                            {item.nomor} • {item.waktu}
                                        </p>
                                    </div>
                                    <div className="hidden shrink-0 flex-col items-end gap-1 sm:flex">
                                        <StatusBadge status={item.status} />
                                        <UrgensiBadge sifat={item.sifat} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="relative z-10 flex items-center gap-3 text-[11px] font-semibold tracking-[0.2em] text-emerald-50/70">
                    <span>TERSTRUKTUR</span>
                    <span className="h-1 w-1 rounded-full bg-emerald-300" />
                    <span>TERLACAK</span>
                    <span className="h-1 w-1 rounded-full bg-emerald-300" />
                    <span>TERINTEGRASI</span>
                </div>
            </section>

            <section className="flex min-h-screen items-center justify-center bg-white px-5 py-12 sm:px-10">
                <div className="w-full max-w-[420px]">
                    <div className="mb-9 flex items-center gap-2.5 lg:hidden">
                        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-900 text-white">
                            <Icon name="shield" size={22} />
                        </span>
                        <span className="text-xl font-semibold tracking-tight text-brand-900">e-Agenda</span>
                    </div>

                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-800">Selamat datang</p>
                    <h2 className="mt-2 text-[28px] font-semibold tracking-tight text-ink">Selamat datang kembali</h2>
                    <p className="mt-2 text-sm leading-relaxed text-slate-500">
                        Masuk menggunakan akun yang telah terdaftar untuk mengelola persuratan digital.
                    </p>

                    {error ? <div className="mt-6"><Alert message={error} title="Login gagal" /></div> : null}
                    {notice ? <div className="mt-6"><Alert message={notice} title="Informasi" variant="info" /></div> : null}

                    <form className="mt-7 space-y-5" onSubmit={handleSubmit}>
                        <div>
                            <label className="block text-sm font-medium text-slate-700" htmlFor="email">
                                Alamat email
                            </label>
                            <div className="relative mt-2">
                                <Icon className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" name="mail" size={18} />
                                <input
                                    autoComplete="username"
                                    className="ea-input w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm text-ink outline-none transition placeholder:text-slate-400"
                                    id="email"
                                    onChange={(event) => setEmail(event.target.value)}
                                    placeholder="nama@instansi.go.id"
                                    type="email"
                                    value={email}
                                />
                            </div>
                        </div>

                        <div>
                            <div className="flex items-center justify-between gap-4">
                                <label className="block text-sm font-medium text-slate-700" htmlFor="password">
                                    Kata sandi
                                </label>
                                <button
                                    className="text-xs font-semibold text-brand-800 transition hover:text-brand-950 hover:underline"
                                    onClick={() => setNotice('Silakan hubungi administrator untuk melakukan reset kata sandi.')}
                                    type="button"
                                >
                                    Lupa kata sandi?
                                </button>
                            </div>
                            <div className="relative mt-2">
                                <Icon className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" name="lock" size={18} />
                                <input
                                    autoComplete="current-password"
                                    className="ea-input w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-12 text-sm text-ink outline-none transition placeholder:text-slate-400"
                                    id="password"
                                    onChange={(event) => setPassword(event.target.value)}
                                    placeholder="Masukkan kata sandi"
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                />
                                <button
                                    aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-brand-900"
                                    onClick={() => setShowPassword((current) => !current)}
                                    type="button"
                                >
                                    <Icon name={showPassword ? 'eyeOff' : 'eye'} size={18} />
                                </button>
                            </div>
                        </div>

                        <label className="flex cursor-pointer items-center gap-2.5 text-sm text-slate-600">
                            <input
                                checked={remember}
                                className="ea-checkbox h-4 w-4 rounded border-slate-300 text-brand-900 focus:ring-brand-800"
                                onChange={(event) => setRemember(event.target.checked)}
                                type="checkbox"
                            />
                            Ingat saya
                        </label>

                        <button
                            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-900 px-5 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-950 disabled:cursor-not-allowed disabled:opacity-70"
                            disabled={loading}
                            type="submit"
                        >
                            {loading ? <Spinner /> : null}
                            {loading ? 'Memproses...' : 'Masuk ke dashboard'}
                            {!loading ? <Icon name="arrowRight" size={17} /> : null}
                        </button>
                    </form>

                    <div className="mt-8 flex items-center gap-3 text-[11px] text-slate-400">
                        <span className="h-px flex-1 bg-slate-200" />
                        Akses terbatas untuk pengguna terdaftar
                        <span className="h-px flex-1 bg-slate-200" />
                    </div>
                    <p className="mt-5 text-center text-xs text-slate-400">© 2025 e-Agenda · Administrasi Persuratan</p>
                </div>
            </section>
        </div>
    );
}
