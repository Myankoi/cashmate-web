<div align="center">
  <img src="src/assets/figma/cashmate-logo.png" alt="CashMate" width="120" />

  # CashMate

  **Uang usaha masih tercampur?**<br />
  **Catat. Pisah. Pantau.**

  Platform pengelolaan kas sederhana yang membantu UMKM memahami kondisi keuangan usahanya dengan lebih mudah.

  [![React](https://img.shields.io/badge/React-19-149ECA?logo=react&logoColor=white)](https://react.dev/)
  [![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)](https://vite.dev/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
  [![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)

  [Live Web](http://boothcamp.dyadev.com:9086) ·
  [REST API](https://github.com/L4na-20/cashmate-api) ·
  [Mobile App](https://github.com/kevinchr1st/cashmate-app)
</div>

---

## Tentang CashMate

CashMate adalah proyek tim bootcamp yang dirancang untuk menjawab masalah umum UMKM: transaksi masih dicatat manual, uang pribadi dan uang usaha bercampur, serta pemilik kesulitan mengetahui posisi kas secara cepat.

CashMate menghubungkan aplikasi Web untuk Owner, aplikasi Mobile untuk Owner dan Staff, serta satu REST API sebagai pusat data. Owner dapat memantau keseluruhan arus kas dan mengelola operasional bisnis, sementara Staff dapat mencatat transaksi harian sesuai batas aksesnya.

CashMate bukan aplikasi akuntansi penuh. Fokus produk ini adalah pencatatan kas yang praktis, aman, dan mudah dipahami oleh usaha kecil.

## Ekosistem Project

| Platform | Pengguna | Fungsi | Repository |
| --- | --- | --- | --- |
| CashMate Web | Owner | Dashboard, transaksi, dompet, kategori, Staff, dan laporan | **Repository ini** |
| CashMate Mobile | Owner & Staff | Pencatatan dan aktivitas transaksi melalui perangkat mobile | [cashmate-app](https://github.com/kevinchr1st/cashmate-app) |
| CashMate API | Web & Mobile | Autentikasi, otorisasi, tenant isolation, dan pengelolaan data | [cashmate-api](https://github.com/L4na-20/cashmate-api) |

## Fitur Utama

### Dashboard Owner

- Melihat total saldo seluruh dompet.
- Memantau pemasukan, pengeluaran, dan arus kas bersih bulan berjalan.
- Melihat grafik keuangan, distribusi kategori, dan transaksi terbaru.

### Transaksi

- Mencatat transaksi pemasukan dan pengeluaran.
- Memilih dompet, kategori, tanggal, nominal, dan deskripsi.
- Memfilter transaksi berdasarkan tanggal, tipe, dompet, kategori, dan pembuat.
- Mengedit, melakukan void, serta memulihkan transaksi.
- Mengunggah bukti transaksi sebagai fitur tambahan.

### Pengelolaan Bisnis

- Mengelola dompet kas dan kategori transaksi.
- Membuat, menonaktifkan, dan mengaktifkan kembali akun Staff.
- Melihat laporan bulanan berdasarkan tahun.
- Mengelola profil dan foto Owner.

### Autentikasi dan Akses

- Registrasi Business sekaligus akun Owner.
- Login, logout, access token, dan refresh token.
- Route Web khusus Owner.
- Session otomatis dibersihkan apabila akun non-Owner mencoba masuk ke Web.
- Seluruh otorisasi dan tenant isolation tetap divalidasi oleh API.

## Alur Penggunaan

```text
Owner mendaftarkan Business
        ↓
Owner mengatur dompet, kategori, dan akun Staff
        ↓
Owner atau Staff mencatat pemasukan/pengeluaran
        ↓
CashMate memperbarui saldo dan riwayat transaksi
        ↓
Owner memantau dashboard dan laporan bulanan
```

## Arsitektur

```text
┌──────────────────┐       ┌──────────────────┐
│ React Web        │       │ Flutter Mobile   │
│ Owner            │       │ Owner & Staff    │
└────────┬─────────┘       └────────┬─────────┘
         │                          │
         └────────────┬─────────────┘
                      │ REST / JSON
              ┌───────▼────────┐
              │ Go REST API    │
              │ JWT + RBAC     │
              └───────┬────────┘
                      │
              ┌───────▼────────┐
              │ MySQL Database │
              └────────────────┘
```

Setiap resource bisnis dibatasi berdasarkan `business_id` dari pengguna yang terautentikasi. Frontend tidak mengirim atau mempercayai `business_id` sebagai sumber otorisasi; API tetap menjadi security boundary utama.

## Teknologi Web

| Area | Teknologi |
| --- | --- |
| UI | React 19, Tailwind CSS 4, Lucide Icons |
| Build tool | Vite 8 |
| Routing | React Router |
| HTTP client | Axios |
| Font | Plus Jakarta Sans |
| Web server | Nginx |
| Container | Docker & Docker Compose |
| Quality | ESLint |

## Halaman Web

| Route | Keterangan |
| --- | --- |
| `/register` | Registrasi Business dan Owner |
| `/login` | Login Owner |
| `/dashboard` | Ringkasan kondisi keuangan |
| `/transactions` | Riwayat dan pengelolaan transaksi |
| `/transactions/new` | Pencatatan transaksi baru |
| `/wallets` | Pengelolaan dompet |
| `/categories` | Pengelolaan kategori |
| `/staff` | Pengelolaan akun Staff |
| `/reports` | Laporan keuangan bulanan |
| `/profile` | Profil Owner |

## Menjalankan Secara Lokal

### Prasyarat

- Node.js 22 atau versi LTS terbaru.
- npm.
- [CashMate API](https://github.com/L4na-20/cashmate-api) yang sedang berjalan.

### Instalasi

```bash
git clone https://github.com/Myankoi/cashmate-web.git
cd cashmate-web
cp .env.example .env.local
npm install
npm run dev
```

Konfigurasi API di `.env.local`:

```env
VITE_API_BASE_URL=http://localhost:8096/api
```

Vite akan menjalankan development server dan meneruskan request API melalui proxy lokal. Buka alamat yang ditampilkan Vite pada terminal, umumnya `http://localhost:5173`.

## Menjalankan dengan Docker

Buat file `.env` untuk Docker Compose:

```env
VITE_API_BASE_URL=https://your-api.example.com/api
CASHMATE_WEB_PORT=9086
```

Build dan jalankan container:

```bash
docker compose up -d --build
```

Aplikasi tersedia di `http://localhost:9086`. Nilai `VITE_API_BASE_URL` ditanam ketika proses build, sehingga perubahan URL API memerlukan build ulang image.

## Pemeriksaan Kualitas

```bash
npm run lint
npm run build
```

Kedua perintah tersebut harus berhasil sebelum perubahan digabungkan atau aplikasi di-deploy.

## Struktur Project

```text
src/
├── api/          # Central API client dan fungsi request
├── assets/       # Logo dan ilustrasi
├── components/   # Komponen UI yang dapat digunakan kembali
├── contexts/     # Auth dan toast state
├── layouts/      # Layout autentikasi dan aplikasi
├── pages/        # Halaman berdasarkan fitur
├── routes/       # Guest dan Owner route guards
└── utils/        # Formatter dan helper umum
```

## Tim CashMate

CashMate dikembangkan secara kolaboratif oleh enam peserta bootcamp dengan pembagian tanggung jawab berikut:

| Nama | Peran |
| --- | --- |
| Muhammad Ramadian Ramadhan | Ketua Kelompok |
| Rizky Maulana | Backend Developer |
| Bilqis Sahila | Business Analyst |
| Kevin Christian Barus | Mobile Developer |
| Gigih Erlangga | UI/UX Designer |
| Waldan Hafidz | Frontend Web Developer |

## Status dan Batas MVP

CashMate telah mencakup alur utama registrasi Owner, pengelolaan bisnis, pencatatan transaksi, dashboard, dan laporan bulanan. Fitur seperti login Google, lupa password, notifikasi, transfer antar-dompet, export laporan, budget, transaksi berulang, multi-currency, dan multi-branch berada di luar cakupan MVP.

---

<div align="center">
  <strong>CashMate — Catat. Pisah. Pantau.</strong><br />
  Dibangun bersama untuk membantu UMKM mengelola kas dengan lebih percaya diri.
</div>
