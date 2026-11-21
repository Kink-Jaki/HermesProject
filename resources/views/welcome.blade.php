<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Dashboard — RPL SMK PGRI Wlingi</title>

    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&family=Space+Grotesk:wght@500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="{{ asset('css/monochrome.css') }}">
</head>
<body>
    <header class="site-header">
        <div class="wrap header-inner">
            <a class="brand" href="/">
                <span class="brand-mark">RPL</span>
                <span class="brand-text">SMK PGRI Wlingi</span>
            </a>
            <nav class="nav" aria-label="Navigasi utama">
                <a href="/" class="nav-link active" aria-current="page">Dashboard</a>
                <a href="/data-siswa" class="nav-link">Data Siswa</a>
            </nav>
        </div>
    </header>

    <main class="wrap main">
        <div class="page-head">
            <p class="eyebrow">Jurusan RPL</p>
            <h1 class="page-title">Dashboard</h1>
        </div>

        <section class="panel stats-panel" aria-label="Ringkasan siswa">
            <div class="stat">
                <p class="stat-label">Total Siswa</p>
                <p class="stat-value" data-count="{{ $total }}">{{ $total }}</p>
            </div>
            <div class="stat">
                <p class="stat-label">Laki-laki</p>
                <p class="stat-value" data-count="{{ $laki }}">{{ $laki }}</p>
            </div>
            <div class="stat">
                <p class="stat-label">Perempuan</p>
                <p class="stat-value" data-count="{{ $perempuan }}">{{ $perempuan }}</p>
            </div>
        </section>

        <section class="panel chart-panel" aria-label="Perbandingan jenis kelamin">
            <p class="section-label">Perbandingan Jenis Kelamin</p>

            <div class="chart-body">
                @php
                    $radius = 76;
                    $circumference = 2 * M_PI * $radius;
                    $lakiLength = $total > 0 ? $circumference * ($laki / $total) : 0;
                    $perempuanLength = $total > 0 ? $circumference * ($perempuan / $total) : 0;
                    $lakiDegrees = $total > 0 ? 360 * ($laki / $total) : 0;
                @endphp

                <div class="donut-wrap">
                    <svg class="donut" viewBox="0 0 200 200" role="img"
                         aria-label="Laki-laki {{ $laki }} siswa, perempuan {{ $perempuan }} siswa">
                        <defs>
                            <pattern id="hatch" width="8" height="8" patternUnits="userSpaceOnUse"
                                     patternTransform="rotate({{ 135 - $lakiDegrees }})">
                                <rect width="8" height="8" fill="#FFFFFF"/>
                                <line x1="4" y1="0" x2="4" y2="8" stroke="#0A0A0A" stroke-width="2"/>
                            </pattern>
                        </defs>

                        <circle class="donut-track" cx="100" cy="100" r="{{ $radius }}"/>

                        <circle class="donut-seg donut-seg-l"
                                cx="100" cy="100" r="{{ $radius }}"
                                stroke-dasharray="{{ $lakiLength }} {{ $circumference }}"
                                stroke-dashoffset="{{ $lakiLength }}"
                                style="--dash: {{ $lakiLength }}"
                                transform="rotate(-90 100 100)">
                            <title>Laki-laki: {{ $laki }} siswa</title>
                        </circle>

                        <circle class="donut-seg donut-seg-p"
                                cx="100" cy="100" r="{{ $radius }}"
                                stroke="url(#hatch)"
                                stroke-dasharray="{{ $perempuanLength }} {{ $circumference }}"
                                stroke-dashoffset="{{ $perempuanLength }}"
                                style="--dash: {{ $perempuanLength }}"
                                transform="rotate({{ -90 + $lakiDegrees }} 100 100)">
                            <title>Perempuan: {{ $perempuan }} siswa</title>
                        </circle>

                        <text class="donut-number" x="100" y="96" data-count="{{ $total }}">{{ $total }}</text>
                        <text class="donut-caption" x="100" y="118">SISWA</text>
                    </svg>
                </div>

                <div class="chart-legend">
                    <div class="legend-item">
                        <span class="legend-swatch legend-swatch-l" aria-hidden="true"></span>
                        <span class="legend-label">Laki-laki</span>
                        <span class="legend-value">{{ $laki }}</span>
                    </div>
                    <div class="legend-item">
                        <span class="legend-swatch legend-swatch-p" aria-hidden="true"></span>
                        <span class="legend-label">Perempuan</span>
                        <span class="legend-value">{{ $perempuan }}</span>
                    </div>
                </div>
            </div>
        </section>
    </main>

    <script>
        document.querySelectorAll('[data-count]').forEach(function (el) {
            var target = Number(el.dataset.count), start = performance.now(), duration = 900;
            function tick(now) {
                var p = Math.min((now - start) / duration, 1);
                el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
                if (p < 1) requestAnimationFrame(tick);
            }
            requestAnimationFrame(tick);
        });
    </script>
</body>
</html>
