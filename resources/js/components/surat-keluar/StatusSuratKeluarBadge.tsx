import Badge from '../ui/Badge';
import type { StatusSuratKeluar } from '../../services/suratKeluarService';

export default function StatusSuratKeluarBadge({ status }: { status: StatusSuratKeluar }) {
    if (status === 'Terkirim') return <Badge dot tone="blue">Terkirim</Badge>;
    if (status === 'Arsip') return <Badge tone="slate">Arsip</Badge>;
    return <Badge dot tone="amber">Draft</Badge>;
}
