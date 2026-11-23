import type { StatusSurat } from '../../types';
import Badge from './Badge';
import type { BadgeTone } from './Badge';

const STATUS: Record<StatusSurat, { tone: BadgeTone; dot: boolean }> = {
    Baru: { tone: 'green', dot: true },
    Terdisposisi: { tone: 'blue', dot: true },
    Selesai: { tone: 'slate', dot: false },
};

export default function StatusBadge({ status }: { status: StatusSurat }) {
    const config = STATUS[status] ?? STATUS.Baru;

    return <Badge dot={config.dot} tone={config.tone}>{status}</Badge>;
}
