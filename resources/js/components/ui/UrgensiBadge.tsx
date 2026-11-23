import type { SifatSurat } from '../../types';
import Badge from './Badge';
import type { BadgeTone } from './Badge';

const SIFAT: Record<SifatSurat, { tone: BadgeTone; dot: boolean }> = {
    Biasa: { tone: 'neutral', dot: false },
    Segera: { tone: 'amber', dot: true },
    'Sangat Segera': { tone: 'red', dot: true },
};

export default function UrgensiBadge({ sifat }: { sifat: SifatSurat }) {
    const config = SIFAT[sifat] ?? SIFAT.Biasa;

    return <Badge dot={config.dot} tone={config.tone}>{sifat}</Badge>;
}
