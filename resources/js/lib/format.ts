const MONTHS = [
    'Januari',
    'Februari',
    'Maret',
    'April',
    'Mei',
    'Juni',
    'Juli',
    'Agustus',
    'September',
    'Oktober',
    'November',
    'Desember',
];

const DAYS = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

function toDate(value: string | Date): Date | null {
    if (value instanceof Date) {
        return Number.isNaN(value.getTime()) ? null : value;
    }

    const dateOnly = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);

    if (dateOnly) {
        return new Date(Number(dateOnly[1]), Number(dateOnly[2]) - 1, Number(dateOnly[3]));
    }

    const parsed = new Date(value);

    return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function formatTanggal(value: string | Date, withTime = false): string {
    const date = toDate(value);

    if (!date) {
        return typeof value === 'string' && value !== '' ? value : '-';
    }

    const base = `${date.getDate()} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`;

    if (!withTime) {
        return base;
    }

    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${base} • ${hours}.${minutes} WIB`;
}

export function formatHariIni(date: Date = new Date()): string {
    return `${DAYS[date.getDay()]}, ${date.getDate()} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
}

export function formatRelativeTime(value: string | Date): string {
    const date = toDate(value);

    if (!date) {
        return '-';
    }

    const minutes = Math.max(0, Math.floor((Date.now() - date.getTime()) / 60000));

    if (minutes < 1) {
        return 'Baru saja';
    }

    if (minutes < 60) {
        return `${minutes} menit lalu`;
    }

    const hours = Math.floor(minutes / 60);

    if (hours < 24) {
        return `${hours} jam lalu`;
    }

    const days = Math.floor(hours / 24);

    if (days < 7) {
        return `${days} hari lalu`;
    }

    return formatTanggal(date);
}

export function getInitials(name: string): string {
    const parts = name.trim().split(/\s+/).filter(Boolean);

    if (parts.length === 0) {
        return 'EA';
    }

    return parts
        .slice(0, 2)
        .map((part) => part.charAt(0).toUpperCase())
        .join('');
}

export function formatNumber(value: number): string {
    return new Intl.NumberFormat('id-ID').format(value);
}
