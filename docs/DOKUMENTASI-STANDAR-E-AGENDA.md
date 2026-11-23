# Dokumentasi Standar Desain, Arsitektur Kode & Aturan Agent — e-Agenda

Dokumen ini merupakan pedoman resmi proyek **e-Agenda** (Sistem Administrasi Persuratan Digital berbasis **Laravel 13 + React + AI LLM**). Seluruh agent pada setiap sesi kerja wajib mematuhi aturan ini agar desain antarmuka presisi dengan mockup UI/UX, kode konsisten, dan kerja paralel dalam **1 branch bersama** berjalan tanpa konflik.

---

## 1. Standar Desain Frontend (Sesuai UI/UX Mockup)

### A. Identitas Visual & Palet Warna

Antarmuka mengadopsi gaya *Clean Governmental / Enterprise Workspace* yang bersih, terstruktur, dan kontras tinggi:

| Token / Elemen | Warna & Karakteristik Visual | Penggunaan di UI |
| --- | --- | --- |
| **Brand Primary** | Hijau Emerald Tua (`#0F5132` / `#135D3B`) | Panel kiri halaman Login, logo `e-Agenda`, tombol aksi primer (`Masuk ke dashboard`, `+ Input surat`, `Simpan surat`, `Disposisi surat`, `Kirim disposisi`), indikator aktif pagination. |
| **Primary Hover & Tint** | Emerald Gelap (`#0B3D26`) & Hijau Lembut (`#E8F3EE` / `#ECFDF5`) | Hover tombol utama, latar item menu sidebar yang sedang aktif (`Dashboard`, `Surat masuk`), latar card notifikasi belum dibaca, dan pill pilihan aktif di modal disposisi (`Unit`, `Tindak lanjut`). |
| **Canvas Background** | Abu-abu Sangat Terang (`#F7F9F8` / `#F8FAFC`) | Latar belakang utama area kerja aplikasi di luar sidebar dan card. |
| **Surface / Card** | Putih Bersih (`#FFFFFF`) | Sidebar, Topbar, Card statistik, Tabel surat, Form input, dan Modal disposisi. |
| **Border & Divider** | Abu-abu Halus (`#E2E8F0` / `#E5E7EB`) | Garis pembatas sidebar, garis antarbaris tabel, border input form, dan garis card. |
| **Teks Utama & Sekunder** | Hitam Arang (`#0F172A` / `#1E293B`) & Abu-abu Muted (`#64748B`) | Judul halaman, perihal surat, dan angka metrik memakai teks gelap; nomor surat, subjudul, label form, tanggal, dan placeholder memakai abu-abu. |

### B. Sistem Badge (Sifat & Status Surat)

Seluruh tampilan badge di tabel, detail surat, dan modal disposisi wajib menggunakan warna semantik berikut:

* **Sifat / Urgensi:**
  * `Biasa`: Latar abu-abu netral lembut (`#F1F5F9`), teks abu-abu gelap (`#475569`).
  * `Segera`: Latar kuning-amber lembut (`#FEF3C7`), teks cokelat-amber (`#B45309`).
  * `Sangat Segera`: Latar merah lembut (`#FEE2E2`), teks merah tua (`#B91C1C`).
* **Status Surat:**
  * `Baru`: Latar hijau mint lembut (`#DCFCE7` / `#E6F4EA`), teks hijau tua (`#15803D`).
  * `Terdisposisi`: Latar biru langit lembut (`#E0F2FE`), teks biru tua (`#0369A1`).
  * `Selesai`: Latar abu-abu kebiruan lembut (`#E2E8F0` / `#F1F5F9`), teks abu-abu gelap (`#334155`).

### C. Tipografi & Format Data

* **Font Family:** Sans-serif modern (`Plus Jakarta Sans` atau `Inter`), dengan ketebalan terukur (`600/700` untuk judul halaman dan angka statistik; `500` untuk label tombol/menu; `400` untuk isi tabel dan keterangan).
* **Angka & Nomor:** Gunakan `tabular-nums` untuk angka metrik (`248`, `186`, `12`, `224`), nomor surat (`005/126/SETDA/2025`), dan nomor agenda (`SM-2025-0248`).
* **Format Tanggal & Jam Indonesia:** Gunakan format ringkas konsisten (`19 Mei 2025` untuk tabel/form; `19 Mei 2025 • 08.30 WIB` untuk log/detail surat).

### D. Spesifikasi Layout Per Halaman (Sesuai Mockup)

1. **01 - Login (`WhatsApp Image 2026-11-21 at 12.11.17.jpeg`):**
   * Layout *split-screen* 50:50 di layar desktop.
   * **Panel Kiri (Hijau Emerald):** Logo `e-Agenda`, pill `SISTEM PERSURATAN DIGITAL`, headline *"Persuratan tertata. Kerja lebih bermakna."*, card putih preview *"Agenda Hari Ini"* berisi contoh daftar surat & badge status, serta footer *"TERSTRUKTUR / TERLACAK / TERINTEGRASI"*.
   * **Panel Kanan (Putih):** Judul *"Selamat datang kembali"*, input `Alamat email`, input `Kata sandi`, checkbox `Ingat saya`, link `Lupa kata sandi?`, dan tombol penuh lebar `Masuk ke dashboard →`.

2. **App Shell / Main Layout (`02 - Dashboard` s/d `06 - Detail`):**
   * **Sidebar Kiri (Lebar tetap ~240px–260px):** Logo `e-Agenda` + subjudul `ADMINISTRASI PERSURATAN`; kelompok `MENU UTAMA` (`Dashboard`, `Surat masuk` + badge counter hijau muda, `Surat keluar`); kelompok `ADMINISTRATOR` (`Manajemen pengguna`); card bantuan di bagian bawah (`Butuh bantuan?` + link `Buka panduan ↗`); dan tombol `Keluar` di paling bawah.
   * **Topbar (Tinggi ~64px):** Breadcrumb kiri (`Workspace / Administrasi`), global search input di tengah-kanan (`Cari surat, nomor, atau pengirim...`), ikon lonceng notifikasi dengan titik indikator, dan pill profil user (`Administrator` / `Super Admin`).

3. **02 - Dashboard (`WhatsApp Image 2026-11-21 at 12.11.17 (1).jpeg`):**
   * Header judul `Dashboard`, subjudul ringkasan aktivitas, badge tanggal hari ini (`Senin, 19 Mei 2025`), dan tombol kanan `+ Input surat`.
   * **4 Kartu Metrik Sejajar:** `Surat masuk`, `Surat keluar`, `Menunggu disposisi`, `Selesai diproses` (masing-masing punya indikator garis warna kecil di pojok kanan atas dan sub-info tren di bawah angka).
   * **Baris Tengah (2 Kolom ~2:1):** Kiri adalah grafik batang ganda `Statistik persuratan` (perbandingan *Masuk* hijau tua vs *Keluar* hijau muda untuk 6 bulan terakhir); kanan adalah card aksen krem-kuning lembut `Perlu perhatian` dengan badge jumlah surat segera dan tombol `Lihat surat masuk →`.
   * **Baris Bawah:** Tabel ringkas `Surat masuk terbaru` dengan tautan `Lihat semua →`.

4. **03 - Notifikasi (`WhatsApp Image 2026-11-21 at 12.12.03.jpeg`):**
   * Header `Notifikasi` dengan tombol kanan `✓ Tandai semua dibaca`.
   * Tab filter `Semua notifikasi` (dengan badge hitung) dan `Belum dibaca (5)`, serta dropdown `Filter` di kanan.
   * Kelompok waktu (`HARI INI`), daftar card notifikasi dengan ikon kotak di kiri, judul tebal, deskripsi, nomor surat berwarna hijau emerald, waktu relatif di kanan atas (`5 menit lalu`), dan titik indikator belum dibaca.

5. **04 - Surat Masuk (`WhatsApp Image 2026-11-21 at 12.13.08.jpeg`):**
   * Header `Surat masuk` dengan dua tombol kanan: `↓ Ekspor` (sekunder putih) dan `+ Input surat` (primer hijau).
   * 4 mini summary card (`Total surat`, `Baru`, `Terdisposisi`, `Selesai`).
   * Tab status (`Semua surat`, `Baru`, `Terdisposisi`, `Selesai`), diikuti baris filter: input pencarian + dropdown bulan (`Mei 2025`) + dropdown sifat (`Semua sifat`).
   * Tabel dengan kolom: Checkbox, `NOMOR / TANGGAL`, `PERIHAL / PENGIRIM`, `SIFAT`, `STATUS`, `AKSI` (`Lihat →`), serta pagination di kanan bawah.

6. **05 - Input Surat Masuk (`WhatsApp Image 2026-11-21 at 12.13.53.jpeg`):**
   * Breadcrumb `Surat masuk / Input surat`, header `Input surat masuk`, keterangan `* Wajib diisi` di kanan.
   * **Grid 2 Kolom (~2:1):**
     * **Kolom Kiri:** Card `01 Informasi surat` (`Nomor agenda *`, `Nomor surat *`, `Tanggal surat *`, `Tanggal diterima *`, `Asal / pengirim surat *`) dan Card `02 Perihal dan klasifikasi` (`Perihal surat *`, preview `Klasifikasi`).
     * **Kolom Kanan:** Card `Lampiran surat` (area *drag & drop* garis putus-putus untuk PDF/JPG/PNG maks 10 MB + tombol opsional *Ekstrak Otomatis AI*), dropdown `Sifat surat *`, dropdown `Klasifikasi arsip *`, dan info box hijau lembut `Pastikan data sudah sesuai`.
   * **Footer Bar Putih:** Teks informasi kiri, tombol `Batal`, dan tombol `✓ Simpan surat` di kanan.

7. **06 - Detail Surat Masuk (`WhatsApp Image 2026-11-21 at 12.14.43.jpeg`):**
   * Header judul perihal surat (`Undangan rapat koordinasi`), nomor surat + badge status + badge sifat di bawah judul, serta tombol kanan `↓ Unduh` dan `↗ Disposisi surat`.
   * **Grid 2 Kolom (~2:1):**
     * **Kolom Kiri:** Toolbar viewer dokumen (nama file, halaman `1/1`, zoom `100%`), kanvas pratinjau dokumen PDF/gambar, panel `Ringkasan AI` (opsional/terintegrasi rapi), dan daftar `Lampiran (1)` di bawahnya.
     * **Kolom Kanan:** Card `Informasi surat` (daftar metadata vertikal: Nomor agenda, Pengirim, Tanggal surat, Tanggal diterima, Klasifikasi, Dicatat oleh) dan Card `Riwayat aktivitas` dengan timeline titik hijau/abu-abu.

8. **Modal Disposisi Surat (`WhatsApp Image 2026-11-21 at 12.08.56.jpeg`):**
   * Modal terpusat dengan header `Disposisi surat`, subjudul, tombol tutup `✕`.
   * Box info surat berwarna hijau sangat lembut berisi nomor surat, perihal, pengirim, dan badge sifat di kanan.
   * Banner/panel rekomendasi `Saran Disposisi AI` (menampilkan top unit/user beserta skor & alasan singkat yang bisa diklik 1x untuk auto-fill).
   * Segmented button `Tujuan disposisi *` (`Unit` vs `User`), input pencarian `Cari unit tujuan *`, daftar radio button hasil pencarian (`Bagian Umum`, `Bagian Keuangan`, dll.), dan alert info biru lembut.
   * Grid 2 kolom untuk `Batas waktu *` dan `Prioritas *`.
   * Segmented pill `Instruksi disposisi *` (`✓ Tindak lanjut`, `Koordinasikan`, `Untuk diketahui`).
   * Textarea `Catatan untuk penerima`, checkbox `Kirim notifikasi kepada penerima disposisi`, dan tombol footer `Batal` serta `Kirim disposisi →`.

---

## 2. Standar Konsistensi Kode (Backend & Frontend)

### A. Konvensi Penamaan

* **Database & Kolom:** `snake_case` jamak untuk tabel (`units`, `users`, `categories`, `surat_masuks`, `surat_keluars`, `lampirans`, `disposisis`, `saran_disposisis`, `notifications`) dan `snake_case` singular dengan akhiran `_id` untuk *foreign key*.
* **Model & Class PHP:** `PascalCase` singular (`SuratMasuk`, `SaranDisposisi`, `LlmSuratService`, `StoreSuratMasukRequest`, `SuratMasukResource`).
* **Variabel & Method PHP:** `camelCase` (`$suratMasuk`, `getSaranDisposisi()`).
* **Komponen React:** `PascalCase.tsx` (`SuratMasukTable.tsx`, `DisposisiModal.tsx`, `StatusBadge.tsx`).
* **Hooks, Services & Utilities TS:** `camelCase.ts` (`useAuth.ts`, `suratMasukService.ts`, `formatTanggal.ts`).
* **Tipe / Interface TypeScript:** `PascalCase` (`SuratMasuk`, `DisposisiPayload`, `PaginatedResponse<T>`).

### B. Standar Backend (Laravel 13)

* **Thin Controller, Fat Service:** Controller hanya bertugas menerima `FormRequest`, memanggil `Service/Action`, dan mengembalikan `API Resource` atau `JsonResponse`.
* **Keamanan Query & Transaksi:**
  * Wajib gunakan *eager loading* (`with([...])`) untuk mencegah N+1 query.
  * Operasi simpan yang melibatkan lebih dari satu tabel (misal: simpan `surat_masuks` + `lampirans` + `notifications`) wajib dibungkus `DB::transaction()`.
* **Kontrak Format Response JSON:**
  * Sukses data tunggal: `{ "data": { ... }, "message": "..." }`
  * Sukses paginasi: `{ "data": [ ... ], "meta": { "current_page": 1, "last_page": 5, "per_page": 10, "total": 48 } }`
  * Error validasi / bisnis: `{ "message": "Ringkasan error", "errors": { "field": ["Detail pesan"] } }`
* **Integrasi AI LLM:**
  * Wajib diisolasi di `app/Services/AI/LlmSuratService.php`.
  * Wajib menggunakan *Structured Output (JSON Schema)*, batas *timeout* eksplisit (maks 20–30 detik), pencatatan log error jika gagal, dan *fallback* agar proses manual tetap berjalan jika layanan AI tidak merespons.

### C. Standar Frontend (React + TypeScript + Tailwind)

* **Strict TypeScript:** Dilarang keras memakai tipe `any`. Semua kontrak data API wajib didefinisikan di `resources/js/types/`.
* **Komponen Re-usable Wajib:** Buat komponen tunggal untuk elemen yang muncul berulang: `StatusBadge`, `UrgensiBadge`, `StatCard`, `PageHeader`, `EmptyState`, dan `ConfirmModal`.
* **4 State Wajib di Setiap Halaman/Aksi:**
  1. `loading`: Skeleton atau spinner halus saat mengambil data / memproses AI.
  2. `error`: Alert informatif dengan opsi coba lagi.
  3. `empty`: Ilustrasi/teks rapi saat tabel atau filter tidak menemukan data.
  4. `success`: Render data sesuai standar UI/UX di Bagian 1.

---

## 3. Aturan Ketat Kerja Paralel Agent (1 Branch, Banyak Session)

Karena seluruh session bekerja pada **1 branch Git yang sama**, setiap agent wajib mematuhi **7 Aturan Mutlak Anti-Bentrok** berikut:

1. **Kepatuhan Batas Direktori (File Ownership):**
   * Setiap agent **HANYA** boleh membuat, mengubah, atau menghapus file di direktori yang ditugaskan pada sesinya.
   * Dilarang keras menyentuh file di luar wilayah tugas, meskipun berniat "sekalian merapikan".

2. **Dilarang Menggunakan `git add .` atau `git add -A`:**
   * Agent **WAJIB** melakukan *staging* secara eksplisit hanya pada direktori atau file miliknya sendiri (contoh: `git add database/migrations database/seeders app/Models`).

3. **Larangan Perintah Git Destruktif:**
   * Dilarang keras menjalankan `git reset --hard`, `git checkout -- .`, `git clean -fd`, `git stash`, atau `git push --force` karena dapat menghapus pekerjaan agent lain yang belum ter-commit di *working tree* yang sama.

4. **Cek Status Sebelum Commit:**
   * Sebelum menjalankan `git commit`, wajib menjalankan `git status` untuk memastikan tidak ada file milik session lain yang ikut masuk ke *staging area*.

5. **Tidak Mengubah File Shared Tanpa Koordinasi:**
   * File konfigurasi pusat (`package.json`, `composer.json`, `.env`, `vite.config.ts`, `routes/api.php`) hanya boleh diubah oleh agent yang memang diberi mandat eksplisit untuk file tersebut.

6. **Kepatuhan Kontrak Schema & API:**
   * Agent Backend tidak boleh mengubah nama kolom tabel yang sudah disepakati di ERD tanpa memperbarui kontrak dokumen.
   * Agent Frontend wajib menyesuaikan *interface* TypeScript dengan kontrak JSON yang dikeluarkan Agent Backend.

7. **Format Laporan Akhir Per Session:**
   * Di akhir setiap sesi, agent wajib menuliskan ringkasan singkat berisi: (a) daftar file yang dibuat/diubah, (b) kontrak schema/endpoint/komponen yang dihasilkan untuk sesi berikutnya, dan (c) catatan pengujian atau hal yang perlu diperhatikan.
