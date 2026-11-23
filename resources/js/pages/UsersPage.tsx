import { useCallback, useEffect, useState } from 'react';
import Alert from '../components/ui/Alert';
import Badge from '../components/ui/Badge';
import EmptyState from '../components/ui/EmptyState';
import Icon from '../components/ui/Icon';
import PageHeader from '../components/ui/PageHeader';
import Skeleton from '../components/ui/Skeleton';
import { useAuth } from '../hooks/useAuth';
import { formatNumber } from '../lib/format';
import { errorMessage } from '../services/http';
import { createUser, fetchRoleOptions, fetchUnitOptions, fetchUsers, updateUser, type ManagedUser, type UserOption, type UserPayload } from '../services/userService';
import UserFormModal from './users/UserFormModal';

function isAdmin(role: string): boolean {
    const n = role.toLowerCase().replace(/[\s-]+/g, '_');
    return n === 'admin' || n === 'administrator' || n === 'super_admin' || n === 'superadmin';
}

function roleTone(role: string): 'brand' | 'blue' | 'amber' | 'slate' {
    const n = role.toLowerCase();
    if (n.includes('super')) return 'brand';
    if (n.includes('admin')) return 'blue';
    if (n.includes('pimpin')) return 'amber';
    return 'slate';
}

export default function UsersPage() {
    const { user } = useAuth();
    const admin = isAdmin(user?.role ?? '');
    const [items, setItems] = useState<ManagedUser[]>([]);
    const [meta, setMeta] = useState({ current_page: 1, last_page: 1, per_page: 10, total: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState('');
    const [searchInput, setSearchInput] = useState('');
    const [unitId, setUnitId] = useState('');
    const [role, setRole] = useState('');
    const [page, setPage] = useState(1);
    const [units, setUnits] = useState<UserOption[]>([]);
    const [roles, setRoles] = useState<UserOption[]>([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState<ManagedUser | null>(null);
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);
    const [reloadKey, setReloadKey] = useState(0);

    useEffect(() => {
        if (!admin) return;
        void Promise.all([fetchUnitOptions(), fetchRoleOptions()]).then(([u, r]) => { setUnits(u); setRoles(r); }).catch(() => undefined);
    }, [admin]);

    useEffect(() => {
        const t = window.setTimeout(() => { setPage(1); setSearch(searchInput); }, 350);
        return () => window.clearTimeout(t);
    }, [searchInput]);

    const load = useCallback(async () => {
        if (!admin) { setLoading(false); return; }
        setLoading(true); setError(null);
        try {
            const res = await fetchUsers({ search, unitId, role, page, perPage: 10 });
            setItems(res.items); setMeta(res.meta);
        } catch (reason) {
            setError(errorMessage(reason, 'Gagal memuat data pengguna.'));
        } finally { setLoading(false); }
    }, [admin, search, unitId, role, page, reloadKey]);

    useEffect(() => { void load(); }, [load]);

    const openCreate = () => { setEditing(null); setSaveError(null); setModalOpen(true); };
    const openEdit = (item: ManagedUser) => { setEditing(item); setSaveError(null); setModalOpen(true); };

    const handleSubmit = async (payload: UserPayload) => {
        setSaving(true); setSaveError(null);
        try {
            if (editing) await updateUser(editing.id, payload);
            else await createUser(payload);
            setModalOpen(false); setEditing(null); setReloadKey((k) => k + 1);
        } catch (reason) {
            setSaveError(errorMessage(reason, 'Gagal menyimpan pengguna.'));
        } finally { setSaving(false); }
    };

    if (!admin) {
        return (
            <>
                <PageHeader subtitle="Kelola akun, peran, dan unit kerja pengguna sistem." title="Manajemen pengguna" />
                <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <EmptyState description="Halaman ini hanya tersedia untuk administrator." icon="shield" title="Akses terbatas" />
                </div>
            </>
        );
    }

    return (
        <>
            <PageHeader
                actions={(
                    <button className="inline-flex items-center gap-2 rounded-xl bg-brand-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-950" onClick={openCreate} type="button">
                        <Icon name="plus" size={17} /> Tambah pengguna
                    </button>
                )}
                subtitle="Kelola akun, peran, dan unit kerja pengguna sistem."
                title="Manajemen pengguna"
            />

            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="flex flex-wrap gap-3 border-b border-slate-100 px-4 py-3">
                    <label className="relative min-w-[220px] flex-1">
                        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" name="search" size={16} />
                        <input className="w-full rounded-xl border border-slate-200 py-2 pl-9 pr-3 text-sm outline-none focus:border-brand-800" placeholder="Cari nama atau email..." value={searchInput} onChange={(e) => setSearchInput(e.target.value)} />
                    </label>
                    <select className="rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-600 outline-none focus:border-brand-800" value={unitId} onChange={(e) => { setUnitId(e.target.value); setPage(1); }}>
                        <option value="">Semua unit</option>
                        {units.map((u) => <option key={u.value} value={u.value}>{u.label}</option>)}
                    </select>
                    <select className="rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-600 outline-none focus:border-brand-800" value={role} onChange={(e) => { setRole(e.target.value); setPage(1); }}>
                        <option value="">Semua role</option>
                        {roles.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
                    </select>
                </div>

                {loading ? (
                    <div className="space-y-3 p-5">{[0, 1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
                ) : error ? (
                    <div className="p-5"><Alert action={<button className="rounded-lg bg-white px-3 py-2 text-xs font-semibold text-red-700 shadow-sm" onClick={() => setReloadKey((k) => k + 1)} type="button"><span className="inline-flex items-center gap-1"><Icon name="refresh" size={14} />Coba lagi</span></button>} message={error} title="Data pengguna belum dapat dimuat" /></div>
                ) : items.length === 0 ? (
                    <EmptyState action={<button className="inline-flex items-center gap-2 rounded-xl bg-brand-900 px-4 py-2.5 text-sm font-semibold text-white" onClick={openCreate} type="button"><Icon name="plus" size={16} />Tambah pengguna</button>} description="Belum ada pengguna yang sesuai dengan filter saat ini." icon="users" title="Belum ada pengguna" />
                ) : (
                    <>
                        <div className="ea-scrollbar overflow-x-auto">
                            <table className="w-full min-w-[920px] text-left text-sm">
                                <thead className="bg-canvas text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                                    <tr>
                                        <th className="px-5 py-3">Nama &amp; Email</th>
                                        <th className="px-5 py-3">Jabatan</th>
                                        <th className="px-5 py-3">Unit Kerja</th>
                                        <th className="px-5 py-3">No. WA</th>
                                        <th className="px-5 py-3">Role</th>
                                        <th className="px-5 py-3 text-right">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {items.map((item) => (
                                        <tr className="transition hover:bg-brand-50/40" key={item.id}>
                                            <td className="px-5 py-3.5 align-top">
                                                <p className="font-medium text-ink">{item.name}</p>
                                                <p className="mt-0.5 text-xs text-slate-400">{item.email}</p>
                                            </td>
                                            <td className="px-5 py-3.5 align-top text-sm text-slate-600">{item.jabatan}</td>
                                            <td className="px-5 py-3.5 align-top text-sm text-slate-600">{item.unit}</td>
                                            <td className="px-5 py-3.5 align-top text-sm text-slate-600 tabular-nums">{item.noWa}</td>
                                            <td className="px-5 py-3.5 align-top"><Badge tone={roleTone(item.role)}>{item.roleLabel}</Badge></td>
                                            <td className="px-5 py-3.5 text-right align-top">
                                                <button className="inline-flex items-center gap-1 text-xs font-semibold text-brand-900 hover:underline" onClick={() => openEdit(item)} type="button">
                                                    Edit <Icon name="arrowRight" size={13} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-5 py-3 text-xs text-slate-500">
                            <p>Menampilkan {items.length} dari {formatNumber(meta.total)} pengguna</p>
                            <div className="flex items-center gap-2">
                                <button className="rounded-lg border border-slate-200 px-3 py-1.5 font-medium disabled:opacity-40" disabled={meta.current_page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))} type="button">Sebelumnya</button>
                                <span className="tabular-nums">{meta.current_page} / {meta.last_page}</span>
                                <button className="rounded-lg border border-slate-200 px-3 py-1.5 font-medium disabled:opacity-40" disabled={meta.current_page >= meta.last_page} onClick={() => setPage((p) => p + 1)} type="button">Berikutnya</button>
                            </div>
                        </div>
                    </>
                )}
            </div>

            <UserFormModal error={saveError} initial={editing} loading={saving} onClose={() => { if (!saving) { setModalOpen(false); setSaveError(null); } }} onSubmit={handleSubmit} open={modalOpen} roles={roles} units={units} />
        </>
    );
}
