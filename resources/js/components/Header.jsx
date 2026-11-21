export default function Header({ page, onNavigate }) {
    const link = (target, path, label) => (
        <a
            href={path}
            className={`nav-link${page === target ? ' active' : ''}`}
            aria-current={page === target ? 'page' : undefined}
            onClick={(event) => {
                event.preventDefault();
                onNavigate(target, path);
            }}
        >
            {label}
        </a>
    );

    return (
        <header className="site-header">
            <div className="wrap header-inner">
                <a className="brand" href="/" onClick={(event) => {
                    event.preventDefault();
                    onNavigate('dashboard', '/');
                }}>
                    <span className="brand-mark">RPL</span>
                    <span className="brand-text">SMK PGRI Wlingi</span>
                </a>
                <nav className="nav" aria-label="Navigasi utama">
                    {link('dashboard', '/', 'Dashboard')}
                    {link('data-siswa', '/data-siswa', 'Data Siswa')}
                </nav>
            </div>
        </header>
    );
}
