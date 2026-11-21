import { useEffect, useState } from 'react';

function CountUp({ value }) {
    const [display, setDisplay] = useState(value);

    useEffect(() => {
        let frame;
        const start = performance.now();
        const duration = 900;

        const tick = (now) => {
            const progress = Math.min((now - start) / duration, 1);
            setDisplay(Math.round(value * (1 - Math.pow(1 - progress, 3))));
            if (progress < 1) frame = requestAnimationFrame(tick);
        };

        frame = requestAnimationFrame(tick);

        return () => cancelAnimationFrame(frame);
    }, [value]);

    return display;
}

export default function Dashboard({ siswa }) {
    const total = siswa.length;
    const laki = siswa.filter((s) => s.jk === 'L').length;
    const perempuan = siswa.filter((s) => s.jk === 'P').length;

    const radius = 76;
    const circumference = 2 * Math.PI * radius;
    const lakiLength = total ? circumference * (laki / total) : 0;
    const perempuanLength = total ? circumference * (perempuan / total) : 0;
    const lakiDegrees = total ? 360 * (laki / total) : 0;

    return (
        <>
            <div className="page-head">
                <p className="eyebrow">Jurusan RPL</p>
                <h1 className="page-title">Dashboard</h1>
            </div>

            <section className="panel stats-panel" aria-label="Ringkasan siswa">
                <div className="stat">
                    <p className="stat-label">Total Siswa</p>
                    <p className="stat-value"><CountUp value={total} /></p>
                </div>
                <div className="stat">
                    <p className="stat-label">Laki-laki</p>
                    <p className="stat-value"><CountUp value={laki} /></p>
                </div>
                <div className="stat">
                    <p className="stat-label">Perempuan</p>
                    <p className="stat-value"><CountUp value={perempuan} /></p>
                </div>
            </section>

            <section className="panel chart-panel" aria-label="Perbandingan jenis kelamin">
                <p className="section-label">Perbandingan Jenis Kelamin</p>

                <div className="chart-body">
                    <div className="donut-wrap">
                        <svg className="donut" viewBox="0 0 200 200" role="img"
                             aria-label={`Laki-laki ${laki} siswa, perempuan ${perempuan} siswa`}>
                            <defs>
                                <pattern id="hatch" width="8" height="8" patternUnits="userSpaceOnUse"
                                         patternTransform={`rotate(${135 - lakiDegrees})`}>
                                    <rect width="8" height="8" fill="#FFFFFF" />
                                    <line x1="4" y1="0" x2="4" y2="8" stroke="#0A0A0A" strokeWidth="2" />
                                </pattern>
                            </defs>

                            <circle className="donut-track" cx="100" cy="100" r={radius} />

                            <circle className="donut-seg donut-seg-l" cx="100" cy="100" r={radius}
                                    strokeDasharray={`${lakiLength} ${circumference}`}
                                    strokeDashoffset={lakiLength}
                                    style={{ '--dash': lakiLength }}
                                    transform="rotate(-90 100 100)">
                                <title>Laki-laki: {laki} siswa</title>
                            </circle>

                            <circle className="donut-seg donut-seg-p" cx="100" cy="100" r={radius}
                                    stroke="url(#hatch)"
                                    strokeDasharray={`${perempuanLength} ${circumference}`}
                                    strokeDashoffset={perempuanLength}
                                    style={{ '--dash': perempuanLength }}
                                    transform={`rotate(${-90 + lakiDegrees} 100 100)`}>
                                <title>Perempuan: {perempuan} siswa</title>
                            </circle>

                            <text className="donut-number" x="100" y="96">{total}</text>
                            <text className="donut-caption" x="100" y="118">SISWA</text>
                        </svg>
                    </div>

                    <div className="chart-legend">
                        <div className="legend-item">
                            <span className="legend-swatch legend-swatch-l" aria-hidden="true" />
                            <span className="legend-label">Laki-laki</span>
                            <span className="legend-value">{laki}</span>
                        </div>
                        <div className="legend-item">
                            <span className="legend-swatch legend-swatch-p" aria-hidden="true" />
                            <span className="legend-label">Perempuan</span>
                            <span className="legend-value">{perempuan}</span>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}
