# CashMate Web

Owner-only web application untuk CashMate, aplikasi pengelolaan kas sederhana bagi UMKM.

## Menjalankan aplikasi

Persyaratan:

- Node.js dan npm
- CashMate API tersedia di `http://localhost:8096/api`

Salin konfigurasi environment dan jalankan Vite:

```bash
cp .env.example .env.local
npm install
npm run dev
```

Environment yang wajib tersedia:

```text
VITE_API_BASE_URL=http://localhost:8096/api
```

Saat development, Vite meneruskan path API melalui same-origin proxy yang targetnya diturunkan dari environment tersebut. Production menggunakan URL environment secara langsung.

Pemeriksaan sebelum commit:

```bash
npm run lint
npm run build
```

## Fitur MVP

- registrasi Business dan Owner;
- login, logout, refresh token, dan protected Owner routes;
- dashboard saldo dan cashflow;
- transaksi dengan filter, pagination, edit, void, dan restore;
- pengelolaan dompet, kategori, dan Staff;
- laporan bulanan berdasarkan tahun;
- loading, empty, error, forbidden, dan confirmation states.

## Batas kontrak API saat ini

Elemen berikut muncul pada referensi Figma tetapi sengaja belum dibuat karena belum didukung API MVP:

- Google login, lupa password, notifikasi, upload foto, dan pengaturan profil;
- pencarian teks transaksi dan export laporan;
- opening balance, tipe/limit/akses Staff per dompet, serta transfer antar-dompet;
- rekap laporan per kategori dan persentase tren periode sebelumnya;
- alasan void;
- update atau restore akun Staff.

Frontend tidak mengirim atau mempercayai `business_id`. Tenant isolation dan role authorization tetap menjadi tanggung jawab API.
