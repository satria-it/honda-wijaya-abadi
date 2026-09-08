# Honda Wijaya Abadi Motor - PRD

## Original Problem Statement
Buatkan website Honda Wijaya Abadi motor, dan konsumen bisa memilih ketertarikan motor mana yang lebih bagus kirim ke wa dealer sebagai minat calon konsumen, buat tampilan website seperti dealer motor pada umumnya chat dealer langsung ke wa 6282343488319 dan pengiriman polling juga langsung ke wa itu, untuk polling dan semua data pada website bisa di atur pada panel admin dari logo, header, isi, footer, dan semua gambar bisa langsung upload, buatkan panel admin dengan user: @Abadi password: @MuliaB2026, tema menarik.

## User Choices
- Motor Honda ditampilkan (Beat, Vario, PCX, ADV, dll)
- Form konsumen: Nama, Nomor HP, Motor yang diminati
- Placeholder images disediakan
- Halaman: Home, Katalog Motor, Promo/Kredit, Testimoni, Kontak
- Admin panel: Kelola motor + Lihat minat konsumen (kedua fitur)
- Panel admin link terpisah, kelola semua data, username/password bisa diubah

## Architecture
- **Frontend**: React + TailwindCSS + shadcn/ui + framer-motion + Lenis smooth scroll
- **Backend**: FastAPI + MongoDB (motor async)
- **Auth**: JWT Bearer token dengan bcrypt password hashing
- **Storage**: Emergent Object Storage untuk upload gambar

## Features Implemented (2026-09-08)

### Public Website
- Hero section dengan kinetic text animation & parallax
- Katalog motor dengan filter kategori (Semua/Matic/Sport/Adventure)
- Form minat konsumen langsung terhubung ke WhatsApp dealer
- Section Promo, Testimoni, Manifesto, Kontak, Footer
- Smooth scrolling dengan Lenis
- Custom cursor glow effect
- Semua data dari database via API

### Admin Panel (`/admin`)
- Login page (`/admin/login`) - Username: @Abadi, Password: @MuliaB2026
- Dashboard dengan statistik dan quick actions
- Kelola Motor (CRUD + upload gambar)
- Kelola Promo (CRUD)
- Kelola Testimoni (CRUD)
- Kelola Manifesto (CRUD)
- Lihat Minat Konsumen (dengan tombol WA konsumen & forward ke dealer)
- Pengaturan Website (logo, hero, teks, info perusahaan, WhatsApp)
- Akun Saya - Ubah username & password

### Backend API
- Authentication (JWT)
- CRUD untuk motors, promos, testimonials, manifesto
- Settings management
- Interest polling storage
- File upload via Emergent Object Storage
- Dashboard stats

## Test Credentials
- Admin: `@Abadi` / `@MuliaB2026`
- Login URL: `/admin/login`
- Admin dapat mengubah credentials via menu "Akun Saya"

## User Personas
- **Calon Konsumen**: Melihat katalog motor, submit minat via WhatsApp
- **Admin Dealer**: Kelola semua konten website via panel admin

## Backlog / Next Priorities
- P1: Kirim notifikasi otomatis ke WA dealer saat ada minat baru (background task)
- P1: Filter/search di admin motors dan interests
- P2: Analytics dashboard (chart minat per hari, motor terpopuler)
- P2: Multiple admin users dengan role
- P2: Export data minat ke CSV
