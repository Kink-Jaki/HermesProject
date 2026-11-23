import { useEffect, useState, type FormEvent } from 'react';
import Alert from '../../components/ui/Alert';
import Icon from '../../components/ui/Icon';
import Spinner from '../../components/ui/Spinner';
import type { ManagedUser, UserOption, UserPayload } from '../../services/userService';

interface Props {
    open: boolean;
    loading: boolean;
    error: string | null;
    initial: ManagedUser | null;
    units: UserOption[];
    roles: UserOption[];
    onClose: () => void;
    onSubmit: (payload: UserPayload) => Promise<void>;
}

type FormState = UserPayload;
const EMPTY: FormState = { name: '', email: '', password: '', jabatan: '', unit_id: '', no_wa: '', role: 'staf' };

function toForm(initial: ManagedUser | null): FormState {
    if (!initial) return EMPTY;
    return {
        name: initial.name === '-' ? '' : initial.name,
        email: initial.email === '-' ? '' : initial.email,
        password: '',
        jabatan: initial.jabatan === '-' ? '' : initial.jabatan,
        unit_id: initial.unitId ? String(initial.unitId) : '',
        no_wa: initial.noWa === '-' ? '' : initial.noWa,
        role: initial.role || 'staf',
    };
}

export default function UserFormModal({ open, loading, error, initial, units, roles, onClose, onSubmit }: Props) {
    const [form, setForm] = useState<FormState>(EMPTY);
    const [localError, setLocalError] = useState<string | null>(null);

    useEffect(() => { if (open) { setForm(toForm(initial)); setLocalError(null); } }, [open, initial]);
    if (!open) return null;

    const isEdit = initial !== null;
    const set = <K extends keyof FormState>(key: K, value: FormState[K]) => setForm((p) => ({ ...p, [key]: value }));

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!form.name.trim() || !form.email.trim() || !form.role) { setLocalError('Nama, email, dan role wajib diisi.'); return; }
        if (!isEdit && form.password.trim().length < 8) { setLocalError('Kata sandi minimal 8 karakter untuk pengguna baru.'); return; }
        setLocalError(null);
        await onSubmit({ name: form.name.trim(), email: form.email.trim(), password: form.password, jabatan: form.jabatan.trim(), unit_id: form.unit_id, no_wa: form.no_wa.trim(), role: form.role });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-950/45 px-4 py-8 backdrop-blur-sm" role="presentation">
            <div aria-modal="true" className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white shadow-2xl" role="dialog">
                <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-5">
                    <div><h2 className="text-lg font-semibold text-ink">{isEdit ? 'Edit pengguna' : 'Tambah pengguna'}</h2><p className="mt-1 text-sm text-slate-500">Kelola akun, jabatan, unit kerja, dan hak akses pengguna.</p></div>
                    <button aria-label="Tutup" className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600" onClick={onClose} type="button"><Icon name="close" size={18} /></button>
                </div>
                <form onSubmit={(e) => { void handleSubmit(e); }}>
                    <div className="space-y-4 px-6 py-5">
                        {localError ? <Alert message={localError} /> : null}
                        {error ? <Alert message={error} title="Gagal menyimpan pengguna" /> : null}
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <label className="block"><span className="mb-1.5 block text-xs font-medium text-slate-600">Nama lengkap *</span><input className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-brand-800" value={form.name} onChange={(e) => set('name', e.target.value)} /></label>
                            <label className="block"><span className="mb-1.5 block text-xs font-medium text-slate-600">Email *</span><input type="email" className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-brand-800" value={form.email} onChange={(e) => set('email', e.target.value)} /></label>
                        </div>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <label className="block"><span className="mb-1.5 block text-xs font-medium text-slate-600">Jabatan</span><input className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-brand-800" value={form.jabatan} onChange={(e) => set('jabatan', e.target.value)} /></label>
                            <label className="block"><span className="mb-1.5 block text-xs font-medium text-slate-600">No. WhatsApp</span><input className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-brand-800" value={form.no_wa} onChange={(e) => set('no_wa', e.target.value)} placeholder="08xxxxxxxxxx" /></label>
                        </div>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <label className="block"><span className="mb-1.5 block text-xs font-medium text-slate-600">Unit kerja</span><select className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-brand-800" value={form.unit_id} onChange={(e) => set('unit_id', e.target.value)}><option value="">Pilih unit</option>{units.map((u) => <option key={u.value} value={u.value}>{u.label}</option>)}</select></label>
                            <label className="block"><span className="mb-1.5 block text-xs font-medium text-slate-600">Role *</span><select className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-brand-800" value={form.role} onChange={(e) => set('role', e.target.value)}>{roles.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}</select></label>
                        </div>
                        <label className="block"><span className="mb-1.5 block text-xs font-medium text-slate-600">{isEdit ? 'Kata sandi baru (opsional)' : 'Kata sandi *'}</span><input type="password" className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-brand-800" value={form.password} onChange={(e) => set('password', e.target.value)} placeholder={isEdit ? 'Kosongkan jika tidak diubah' : 'Minimal 8 karakter'} /></label>
                    </div>
                    <div className="flex justify-end gap-2.5 border-t border-slate-100 px-6 py-4">
                        <button className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-60" disabled={loading} onClick={onClose} type="button">Batal</button>
                        <button className="inline-flex items-center gap-2 rounded-xl bg-brand-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-950 disabled:opacity-60" disabled={loading} type="submit">{loading ? <Spinner /> : <Icon name="check" size={16} />}{loading ? 'Menyimpan...' : isEdit ? 'Simpan perubahan' : 'Tambah pengguna'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
}
