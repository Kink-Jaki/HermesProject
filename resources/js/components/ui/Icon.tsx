export type IconName =
    | 'alert'
    | 'arrowRight'
    | 'bell'
    | 'calendar'
    | 'check'
    | 'checkDouble'
    | 'chevronRight'
    | 'clock'
    | 'close'
    | 'dashboard'
    | 'download'
    | 'external'
    | 'eye'
    | 'eyeOff'
    | 'file'
    | 'filter'
    | 'help'
    | 'inbox'
    | 'info'
    | 'lock'
    | 'logout'
    | 'mail'
    | 'menu'
    | 'more'
    | 'plus'
    | 'refresh'
    | 'search'
    | 'send'
    | 'shield'
    | 'sparkles'
    | 'user'
    | 'users';

interface IconProps {
    name: IconName;
    size?: number;
    className?: string;
    strokeWidth?: number;
}

function paths(name: IconName) {
    switch (name) {
        case 'alert':
            return <><path d="M10.3 3.9 2.4 17.3A2 2 0 0 0 4.1 20h15.8a2 2 0 0 0 1.7-2.7L13.7 3.9a2 2 0 0 0-3.4 0Z" /><path d="M12 9v4" /><path d="M12 17h.01" /></>;
        case 'arrowRight':
            return <><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></>;
        case 'bell':
            return <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" /><path d="M10 21h4" /></>;
        case 'calendar':
            return <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4" /><path d="M8 3v4" /><path d="M3 11h18" /></>;
        case 'check':
            return <path d="m5 12 4 4L19 6" />;
        case 'checkDouble':
            return <><path d="m2 12 4 4L16 6" /><path d="m10 16 2 2L22 8" /></>;
        case 'chevronRight':
            return <path d="m9 18 6-6-6-6" />;
        case 'clock':
            return <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>;
        case 'close':
            return <><path d="M18 6 6 18" /><path d="m6 6 12 12" /></>;
        case 'dashboard':
            return <><rect x="3" y="3" width="7" height="9" rx="1.5" /><rect x="14" y="3" width="7" height="5" rx="1.5" /><rect x="14" y="12" width="7" height="9" rx="1.5" /><rect x="3" y="16" width="7" height="5" rx="1.5" /></>;
        case 'download':
            return <><path d="M12 3v12" /><path d="m7 10 5 5 5-5" /><path d="M4 21h16" /></>;
        case 'external':
            return <><path d="M15 3h6v6" /><path d="M10 14 21 3" /><path d="M21 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5" /></>;
        case 'eye':
            return <><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z" /><circle cx="12" cy="12" r="3" /></>;
        case 'eyeOff':
            return <><path d="M3 3 21 21" /><path d="M10.6 5.2A10.7 10.7 0 0 1 12 5c6.4 0 10 7 10 7a16 16 0 0 1-3 3.7" /><path d="M6.2 6.2C3.5 8 2 12 2 12s3.6 7 10 7a10.9 10.9 0 0 0 4-.7" /><path d="M9.9 10a3 3 0 0 0 4.2 4.2" /></>;
        case 'file':
            return <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" /><path d="M14 2v6h6" /><path d="M8 13h8" /><path d="M8 17h6" /></>;
        case 'filter':
            return <path d="M4 5h16l-6 7v6l-4 2v-8L4 5Z" />;
        case 'help':
            return <><circle cx="12" cy="12" r="9" /><path d="M9.5 9a2.6 2.6 0 0 1 5 .8c0 1.8-2.5 2-2.5 3.7" /><path d="M12 17h.01" /></>;
        case 'inbox':
            return <><path d="M4 5h16l1 10v4H3v-4L4 5Z" /><path d="M3 15h5l1.5 2h5L16 15h5" /></>;
        case 'info':
            return <><circle cx="12" cy="12" r="9" /><path d="M12 11v5" /><path d="M12 8h.01" /></>;
        case 'lock':
            return <><rect x="4" y="10" width="16" height="11" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /><path d="M12 15v2" /></>;
        case 'logout':
            return <><path d="M10 5H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h4" /><path d="m15 15 4-3-4-3" /><path d="M19 12H9" /></>;
        case 'mail':
            return <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></>;
        case 'menu':
            return <><path d="M4 7h16" /><path d="M4 12h16" /><path d="M4 17h16" /></>;
        case 'more':
            return <><circle cx="5" cy="12" r="1" /><circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /></>;
        case 'plus':
            return <><path d="M12 5v14" /><path d="M5 12h14" /></>;
        case 'refresh':
            return <><path d="M20 11a8 8 0 1 0-2.3 6.1" /><path d="M20 5v6h-6" /></>;
        case 'search':
            return <><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></>;
        case 'send':
            return <><path d="M22 2 11 13" /><path d="M22 2 15 22l-4-9-9-4 20-7Z" /></>;
        case 'shield':
            return <><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" /><path d="m9 12 2 2 4-4" /></>;
        case 'sparkles':
            return <><path d="m12 3 1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6L12 3Z" /><path d="m19 15 .7 1.8L21.5 17.5l-1.8.7L19 20l-.7-1.8-1.8-.7 1.8-.7L19 15Z" /></>;
        case 'user':
            return <><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></>;
        case 'users':
            return <><circle cx="9" cy="8" r="3.5" /><path d="M2 20a7 7 0 0 1 14 0" /><path d="M17 5a3.5 3.5 0 0 1 0 7" /><path d="M17 14a6 6 0 0 1 5 6" /></>;
        default:
            return <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" /><path d="M14 2v6h6" /></>;
    }
}

export default function Icon({ name, size = 20, className = '', strokeWidth = 1.8 }: IconProps) {
    return (
        <svg
            aria-hidden="true"
            className={className}
            fill="none"
            height={size}
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={strokeWidth}
            viewBox="0 0 24 24"
            width={size}
        >
            {paths(name)}
        </svg>
    );
}
