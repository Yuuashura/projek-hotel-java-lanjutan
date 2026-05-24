# NgiNep. - Hotel Booking Microservices Application

NgiNep adalah platform booking hotel berbasis arsitektur **Microservices** yang dibangun menggunakan **Spring Boot** di bagian backend dan **React (Vite)** di bagian frontend. Sistem ini terintegrasi dengan **PostgreSQL (Supabase)**, **Spring Mail (OTP)**, **Spring Cloud Gateway (API Gateway)**, dan **Spring Security (JWT)** untuk mengelola autentikasi dan otorisasi terpusat.

---

## 🛠️ Tech Stack

### **Backend (Microservices)**
* **Core:** Java 17, Spring Boot 3.x
* **API Gateway:** Spring Cloud Gateway (sebagai pintu masuk tunggal port `8080`)
* **Security:** Spring Security & JSON Web Token (JWT) untuk autentikasi stateless
* **Database & Persistence:** Spring Data JPA, PostgreSQL (Supabase cloud database)
* **Messaging & Mail:** Spring Mail (integrasi Gmail SMTP untuk pengiriman OTP)
* **Utilities:** Lombok, Jakarta Validation, Apache POI (untuk import Excel)

### **Frontend**
* **Core:** React.js, Vite
* **Styling:** TailwindCSS, Vanilla CSS, Lucide React (Icons)
* **HTTP Client:** Axios (dikonfigurasi khusus dengan bypass header untuk LocalTunnel)
* **State Management:** React Context API

### **Deployment & DevOps**
* **Containerization:** Docker & Docker Compose
* **Expose Tunnel:** LocalTunnel (mengamankan koneksi frontend ke backend lokal)
* **Frontend Hosting:** Vercel

---

## 👥 Aktor & Hak Akses (RBAC)

Aplikasi ini menggunakan **Role-Based Access Control (RBAC)** dengan 3 jenis aktor utama:

1. **`ROLE_USER` (Pelanggan)**
   * Menjelajahi hotel, menyaring berdasarkan kota, harga, bintang, dan fasilitas.
   * Melakukan booking kamar hotel.
   * Mengunggah bukti pembayaran format gambar.
   * Melihat riwayat pesanan personal dan memperbarui profil pribadi.

2. **`ROLE_ADMIN_HOTEL` (Admin Mitra Hotel)**
   * Mengelola data hotel, kamar, dan fasilitas milik mitra.
   * Melakukan import massal data hotel menggunakan berkas Excel (.xlsx).
   * Melihat statistik dashboard pemesanan kamar.
   * Memperbarui status pesanan pelanggan (*CONFIRMED*, *SELESAI*, *CANCELLED*).

3. **`ROLE_ADMIN_APP` (Super Admin)**
   * Memiliki semua hak akses dari `ROLE_ADMIN_HOTEL`.
   * Menghapus pesanan secara permanen dari sistem database.
   * Mengelola kota dan parameter konfigurasi sistem global.

---

## 🏗️ Arsitektur Layanan & Port

| Nama Layanan | Direktori | Port Lokal | Deskripsi |
|---|---|---|---|
| **API Gateway** | `/api-gateway` | `8080` | Mengarahkan semua request dari frontend ke microservice yang sesuai. |
| **User Service** | `/user-service` | `8081` | Menangani pendaftaran, login, verifikasi OTP, profil, dan avatar pengguna. |
| **Hotel Service** | `/hotel-service` | `8082` | Menangani data hotel, tipe kamar, fasilitas, kota, dan import Excel. |
| **Booking Service** | `/booking-service` | `8083` | Menangani proses booking, pembayaran, status pesanan, dan statistik. |

---

## ⚙️ Cara Konfigurasi & Menjalankan Projek

### 1. Prasyarat
Pastikan Anda sudah menginstal:
* [Docker Desktop](https://www.docker.com/products/docker-desktop/)
* [Node.js](https://nodejs.org/) (versi 18+)

### 2. Konfigurasi Backend (Docker)
Buka file `docker-compose.yml` di root directory, lalu pastikan variabel env berikut sudah terisi dengan benar:
* **Supabase DB:** `SPRING_DATASOURCE_URL`, `SPRING_DATASOURCE_USERNAME`, `SPRING_DATASOURCE_PASSWORD`
* **SMTP Gmail:** `SPRING_MAIL_USERNAME`, `SPRING_MAIL_PASSWORD` (menggunakan App Password Gmail)
* **JWT Secret Key:** `JWT_SECRET`

Jalankan perintah berikut di terminal root projek untuk mem-build dan menjalankan seluruh kontainer backend:
```bash
docker compose down
docker compose up --build
```
*Backend akan berjalan secara otomatis di port `8080` melalui API Gateway.*

### 3. Konfigurasi Frontend (Lokal)
Masuk ke direktori frontend:
```bash
cd frontend
npm install
npm run dev
```
*Frontend lokal Anda akan berjalan di `http://localhost:5173`.*

### 4. Menghubungkan Frontend Vercel dengan Backend Lokal (LocalTunnel)
Jika Anda men-deploy frontend ke **Vercel** dan ingin tetap menembak backend lokal di komputer Anda:
1. Pastikan docker backend Anda sudah berjalan di port `8080`.
2. Buka terminal baru dan jalankan LocalTunnel:
   ```bash
   npx localtunnel --port 8080 --subdomain yuuashura-api
   ```
3. Di panel Vercel Anda, tambahkan Environment Variable:
   ```env
   VITE_API_URL=https://yuuashura-api.loca.lt
   ```
4. Lakukan deploy ulang di Vercel. Frontend Vercel sekarang terhubung secara aman ke Docker backend di komputer Anda.

---

## 🔌 Daftar Endpoint API (Gateway Port 8080)

Semua request wajib diarahkan melalui API Gateway di port `8080`.

### **1. User & Auth Service (`/api/auth` & `/api/users`)**
* `POST /api/auth/register` - Mendaftar akun baru
* `POST /api/auth/login` - Masuk dan mendapatkan JWT token
* `POST /api/auth/verify-otp` - Verifikasi OTP pendaftaran
* `POST /api/auth/resend-otp` - Kirim ulang OTP ke email
* `GET /api/users/profile` - Mengambil profil pengguna aktif (Membutuhkan JWT)
* `PUT /api/users/profile` - Memperbarui data diri (Membutuhkan JWT)
* `POST /api/users/upload-avatar` - Mengunggah foto profil pengguna (Multipart, Membutuhkan JWT)
* `GET /health` - Health Check

### **2. Hotel Service (`/api/hotels`, `/api/cities`, `/api/facilities`)**
* `GET /api/hotels` - List hotel dengan pencarian & filter (Publik)
* `GET /api/hotels/{id}` - Detail hotel beserta kamar dan fasilitasnya (Publik)
* `POST /api/hotels` - Menambah hotel baru (Admin)
* `PUT /api/hotels/{id}` - Mengedit data hotel (Admin)
* `DELETE /api/hotels/{id}` - Menghapus hotel (Admin)
* `POST /api/hotels/upload-image` - Unggah gambar galeri hotel (Admin)
* `POST /api/hotels/upload-excel` - Unggah file Excel untuk bulk import hotel (Admin)
* `GET /api/cities` - List data kota (Publik)
* `GET /api/facilities` - List data fasilitas (Publik)
* `GET /api/room-types` - List tipe kamar (Publik)
* `POST /api/room-types` - Membuat tipe kamar baru (Admin)
* `GET /health` - Health Check

### **3. Booking Service (`/api/bookings`)**
* `POST /api/bookings` - Membuat pesanan kamar baru (User)
* `GET /api/bookings/my` - List pesanan aktif milik user bersangkutan (User)
* `GET /api/bookings/{id}` - Detail pesanan (User/Admin)
* `POST /api/bookings/{id}/payment` - Unggah bukti transfer pembayaran (User)
* `PATCH /api/bookings/{id}/status` - Update status booking (Admin)
* `DELETE /api/bookings/{id}` - Menghapus pesanan secara permanen (Super Admin)
* `GET /api/bookings/dashboard/stats` - Statistik ringkasan pesanan untuk dashboard admin (Admin)
* `GET /health` - Health Check
