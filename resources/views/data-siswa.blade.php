<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Data Siswa — RPL SMK PGRI Wlingi</title>

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
                <a href="/" class="nav-link">Dashboard</a>
                <a href="/data-siswa" class="nav-link active" aria-current="page">Data Siswa</a>
            </nav>
        </div>
    </header>

    <main class="wrap main">
        <div class="page-head">
            <p class="eyebrow">Jurusan RPL</p>
            <h1 class="page-title">Data Siswa</h1>
        </div>

        <section class="panel table-panel" aria-label="Data siswa">
            <div class="table-scroll">
                <table class="student-table">
                    <thead>
                        <tr>
                            <th class="col-no">No</th>
                            <th>Nama</th>
                            <th>Jenis Kelamin</th>
                            <th>Kelas</th>
                            <th>Agama</th>
                        </tr>
                    </thead>
                    <tbody>
                        @foreach ($siswa as $index => $s)
                            <tr>
                                <td class="col-no">{{ $index + 1 }}</td>
                                <td class="cell-name">{{ $s['nama'] }}</td>
                                <td>{{ $s['jk'] }}</td>
                                <td>{{ $s['kelas'] }}</td>
                                <td>{{ $s['agama'] }}</td>
                            </tr>
                        @endforeach
                    </tbody>
                </table>
            </div>
        </section>
    </main>
</body>
</html>
