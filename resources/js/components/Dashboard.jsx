const stats = [
    { label: 'Total Siswa', value: '240', note: '+12 bulan ini' },
    { label: 'Laki-laki', value: '112', note: '46,7%' },
    { label: 'Perempuan', value: '128', note: '53,3%' },
];

const activity = [
    { title: 'Data siswa diperbarui', meta: 'Hari ini, 09:42' },
    { title: '12 siswa ditambahkan', meta: 'Kemarin, 16:10' },
    { title: 'Laporan kehadiran dibuat', meta: '20 Nov 2026' },
];

export default function Dashboard() {
    return (
        <>
            <header className="dash-header">
                <div className="wrap dash-header-inner">
                    <span className="dash-brand">
                        <span className="brand-mark">HP</span>
                        Hermes Project
                    </span>
                    <span className="dash-status"><span className="dot" /> Online</span>
                </div>
            </header>

            <main className="wrap dash-main">
                <div className="dash-head">
                    <p className="dash-eyebrow">Overview</p>
                    <h1 className="dash-title">Dashboard</h1>
                </div>

                <section className="stats-grid" aria-label="Ringkasan">
                    {stats.map((stat) => (
                        <article className="panel stat-card" key={stat.label}>
                            <p className="stat-label">{stat.label}</p>
                            <p className="stat-value">{stat.value}</p>
                            <p className="stat-note">{stat.note}</p>
                        </article>
                    ))}
                </section>

                <section className="panel dash-panel">
                    <div className="panel-head">
                        <h2>Aktivitas Terbaru</h2>
                        <span className="panel-tag">DEMO</span>
                    </div>
                    <ul className="activity-list">
                        {activity.map((item) => (
                            <li key={item.title}>
                                <span className="activity-dot" />
                                <span className="activity-title">{item.title}</span>
                                <time>{item.meta}</time>
                            </li>
                        ))}
                    </ul>
                </section>
            </main>
        </>
    );
}
