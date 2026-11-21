<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>{{ $page === 'data-siswa' ? 'Data Siswa' : 'Dashboard' }} — Hermes Project</title>

    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&family=Space+Grotesk:wght@500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="{{ asset('css/monochrome.css') }}">
    @vite(['resources/js/app.jsx'])
</head>
<body>
    <div id="app" data-siswa="{{ json_encode($siswa, JSON_UNESCAPED_UNICODE) }}" data-page="{{ $page }}"></div>
</body>
</html>
