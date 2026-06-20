# NgiNep - Hotel Booking Platform

NgiNep adalah aplikasi booking hotel berbasis microservices. Proyek ini berisi frontend React/Vite, API Gateway Spring Cloud Gateway, dan tiga backend service Spring Boot untuk user, hotel, dan booking.

## Fitur Utama

### Public

- Browse dan search hotel
- Filter hotel berdasarkan keyword, kota, harga, rating, status featured, status sale, dan fasilitas
- Melihat detail hotel, galeri gambar, fasilitas, dan tipe kamar
- Registrasi user dengan OTP email
- Login JWT
- Forgot password dan reset password dengan OTP

### User (`ROLE_USER`)

- Membuat booking kamar
- Melihat riwayat booking pribadi
- Membatalkan booking milik sendiri yang masih bisa dibatalkan
- Membayar booking dengan data pembayaran manual
- Upload bukti pembayaran melalui multipart form
- Membuat invoice pembayaran Xendit
- Melihat dan memperbarui profil
- Upload foto profil
- Mengganti password

### Admin Hotel (`ROLE_ADMIN_HOTEL`)

- Mengelola hotel yang dimiliki
- Mengelola tipe kamar hotel yang dimiliki
- Upload gambar hotel dan tipe kamar
- Melihat booking berdasarkan hotel
- Mengubah status booking hotel yang dikelola

### Admin App (`ROLE_ADMIN_APP`)

- Mengelola semua hotel dan tipe kamar
- Membuat akun admin hotel
- Melihat semua user dan admin hotel
- Ban dan unban user
- CRUD kota
- CRUD fasilitas
- Import data hotel dari Excel
- Export data hotel ke Excel
- Melihat semua booking
- Export data booking ke Excel
- Menghapus booking
- Melihat statistik dashboard booking

## Arsitektur

```text
Frontend React/Vite (localhost:5173)
        |
        | HTTP /api/*
        v
API Gateway Spring Cloud Gateway (localhost:8080)
        |
        +-- /api/auth/**, /api/users/** -> user-service (localhost:8081)
        +-- /api/hotels/**, /api/room-types/**, /api/cities/**, /api/facilities/** -> hotel-service (localhost:8082)
        +-- /api/bookings/** -> booking-service (localhost:8083)
        |
        v
PostgreSQL database
```

Service responsibilities:

| Service | Port | Tanggung jawab |
| --- | --- | --- |
| `api-gateway` | `8080` | Routing request, CORS, rate limiting |
| `user-service` | `8081` | Auth, OTP, JWT, profil user, admin hotel |
| `hotel-service` | `8082` | Hotel, city, facility, room type, Excel hotel |
| `booking-service` | `8083` | Booking, pembayaran manual, Xendit, Excel booking |
| `frontend` | `5173` | UI public, user, dan admin |

## Tech Stack

### Frontend

| Teknologi | Versi dari repo |
| --- | --- |
| React | `^19.2.6` |
| React DOM | `^19.2.6` |
| React Router DOM | `^7.15.1` |
| Vite | `^8.0.12` |
| Tailwind CSS | `^4.3.0` |
| Axios | `^1.16.1` |
| Lucide React | `^1.16.0` |
| Anime.js | `^4.4.1` |

### Backend

| Modul | Framework | Java |
| --- | --- | --- |
| `api-gateway` | Spring Boot `3.4.3`, Spring Cloud `2024.0.0` | 17 |
| `user-service` | Spring Boot `3.5.15-SNAPSHOT` | 17 |
| `hotel-service` | Spring Boot `3.5.15-SNAPSHOT` | 17 |
| `booking-service` | Spring Boot `3.5.15-SNAPSHOT` | 17 |

Backend dependencies utama:

- Spring Web
- Spring WebFlux pada booking-service untuk komunikasi HTTP eksternal/internal
- Spring Data JPA
- Spring Security
- JWT dengan `jjwt`
- PostgreSQL JDBC Driver
- Lombok
- Spring Mail
- Apache POI untuk Excel import/export
- Spring Boot DevTools

## Struktur Proyek

```text
.
|-- api-gateway/
|   |-- src/main/java/com/ngninep/gateway/
|   |-- src/main/resources/application.properties
|   |-- Dockerfile
|   `-- pom.xml
|-- user-service/
|   |-- src/main/java/com/ngninep/user/
|   |-- src/main/resources/application.properties
|   |-- src/main/resources/application-local.properties
|   |-- Dockerfile
|   `-- pom.xml
|-- hotel-service/
|   |-- src/main/java/com/ngninep/hotel/
|   |-- src/main/resources/application.properties
|   |-- src/main/resources/application-local.properties
|   |-- Dockerfile
|   `-- pom.xml
|-- booking-service/
|   |-- src/main/java/com/ngninep/booking/
|   |-- src/main/resources/application.properties
|   |-- src/main/resources/application-local.properties
|   |-- Dockerfile
|   `-- pom.xml
|-- frontend/
|   |-- src/
|   |-- package.json
|   |-- pnpm-lock.yaml
|   `-- vite.config.js
|-- docker-compose.yml
|-- .env.example
`-- README.md
```

## Prasyarat

- Java 17
- Maven 3.9+
- Node.js 20+
- pnpm atau npm
- PostgreSQL, atau database PostgreSQL managed seperti Supabase
- Akun SMTP email jika ingin OTP email berjalan
- Akun Xendit jika ingin pembayaran invoice berjalan

## Environment Variables

Jangan commit nilai secret asli. Gunakan `.env` lokal untuk Docker dan environment variable lokal untuk menjalankan service manual.

Contoh `.env`:

```env
SPRING_DATASOURCE_URL=jdbc:postgresql://<host>:<port>/<database>?sslmode=require&prepareThreshold=0
SPRING_DATASOURCE_USERNAME=<database_username>
SPRING_DATASOURCE_PASSWORD=<database_password>
SPRING_JPA_DATABASE_PLATFORM=org.hibernate.dialect.PostgreSQLDialect
SPRING_JPA_HIBERNATE_DDL_AUTO=update

JWT_SECRET=<long_random_secret>
JWT_EXPIRATION=3600000

SPRING_MAIL_USERNAME=<smtp_email>
SPRING_MAIL_PASSWORD=<smtp_app_password>

XENDIT_BASE_URL=https://api.xendit.co
XENDIT_API_KEY=<xendit_api_key>
XENDIT_CALLBACK_TOKEN=<xendit_callback_token>
XENDIT_SUCCESS_REDIRECT_URL=http://localhost:5173/my-bookings
XENDIT_FAILURE_REDIRECT_URL=http://localhost:5173/my-bookings

USER_SERVICE_URL=http://user-service:8081
HOTEL_SERVICE_URL=http://hotel-service:8082
BOOKING_SERVICE_URL=http://booking-service:8083
CORS_ALLOWED_ORIGINS=http://localhost:5173
```

## Menjalankan dengan Docker

Pastikan `.env` sudah tersedia di root proyek.

```bash
docker compose up --build -d
```

Service yang berjalan:

| Service | URL |
| --- | --- |
| API Gateway | `http://localhost:8080` |
| User Service | `http://localhost:8081` |
| Hotel Service | `http://localhost:8082` |
| Booking Service | `http://localhost:8083` |

Frontend tidak didefinisikan di `docker-compose.yml`, jadi jalankan frontend secara terpisah.

## Menjalankan Local Manual

### Backend

Jalankan setiap service di terminal terpisah.

```bash
cd user-service
mvn spring-boot:run -Dspring-boot.run.profiles=local
```

```bash
cd hotel-service
mvn spring-boot:run -Dspring-boot.run.profiles=local
```

```bash
cd booking-service
mvn spring-boot:run -Dspring-boot.run.profiles=local
```

```bash
cd api-gateway
mvn spring-boot:run
```

### Frontend

Dengan pnpm:

```bash
cd frontend
pnpm install
pnpm dev
```

Dengan npm:

```bash
cd frontend
npm install
npm run dev
```

Buka aplikasi di `http://localhost:5173`.

## Health Check

Setiap backend service memiliki endpoint health sederhana:

| Service | Endpoint |
| --- | --- |
| User Service | `GET http://localhost:8081/health` |
| Hotel Service | `GET http://localhost:8082/health` |
| Booking Service | `GET http://localhost:8083/health` |

## API Gateway

Gateway berjalan di `http://localhost:8080` dan meneruskan request berdasarkan path.

| Path | Target |
| --- | --- |
| `/api/auth/**` | user-service |
| `/api/users/**` | user-service |
| `/api/hotels/**` | hotel-service |
| `/api/room-types/**` | hotel-service |
| `/api/cities/**` | hotel-service |
| `/api/facilities/**` | hotel-service |
| `/api/bookings/**` | booking-service |

Rate limit gateway:

- `max_request=5000`
- `time_window_second=300`

## API Endpoints

Gunakan base URL gateway untuk frontend dan client umum: `http://localhost:8080`.

### Auth (`user-service`)

| Method | Endpoint | Akses | Deskripsi |
| --- | --- | --- | --- |
| POST | `/api/auth/register` | Public | Registrasi user |
| POST | `/api/auth/verify-otp` | Public | Verifikasi OTP registrasi |
| POST | `/api/auth/resend-otp` | Public | Kirim ulang OTP |
| POST | `/api/auth/forgot-password` | Public | Memulai reset password |
| POST | `/api/auth/verify-reset-otp` | Public | Verifikasi OTP reset password |
| POST | `/api/auth/reset-password` | Public | Reset password |
| POST | `/api/auth/login` | Public | Login dan mendapatkan JWT |
| POST | `/api/auth/admin-hotels` | `ROLE_ADMIN_APP` | Membuat akun admin hotel |

### Users (`user-service`)

| Method | Endpoint | Akses | Deskripsi |
| --- | --- | --- | --- |
| GET | `/api/users/me` | Login | Profil sendiri |
| PUT | `/api/users/me` | Login | Update profil sendiri |
| POST | `/api/users/me/profile-picture` | Login | Upload foto profil |
| PUT | `/api/users/me/change-password` | Login | Ganti password |
| GET | `/api/users` | `ROLE_ADMIN_APP` | List semua user |
| GET | `/api/users/admin-hotels` | `ROLE_ADMIN_APP` | List admin hotel |
| PATCH | `/api/users/{id}/ban` | `ROLE_ADMIN_APP` | Ban user |
| PATCH | `/api/users/{id}/unban` | `ROLE_ADMIN_APP` | Unban user |

### Hotels (`hotel-service`)

| Method | Endpoint | Akses | Deskripsi |
| --- | --- | --- | --- |
| GET | `/api/hotels` | Public | Search dan filter hotel |
| GET | `/api/hotels/featured` | Public | Hotel featured |
| GET | `/api/hotels/latest` | Public | Hotel terbaru |
| GET | `/api/hotels/on-sale` | Public | Hotel promo |
| GET | `/api/hotels/popular-cities` | Public | Kota populer |
| GET | `/api/hotels/popular-facilities` | Public | Fasilitas populer |
| GET | `/api/hotels/stats` | Public | Statistik hotel publik |
| GET | `/api/hotels/{id}` | Public | Detail hotel |
| POST | `/api/hotels` | `ROLE_ADMIN_HOTEL`, `ROLE_ADMIN_APP` | Buat hotel beserta pilihan fasilitas |
| PUT | `/api/hotels/{id}` | `ROLE_ADMIN_HOTEL`, `ROLE_ADMIN_APP` | Update hotel dan sinkronkan pilihan fasilitas |
| DELETE | `/api/hotels/{id}` | `ROLE_ADMIN_HOTEL`, `ROLE_ADMIN_APP` | Hapus hotel |
| POST | `/api/hotels/{id}/facilities/{facilityId}` | `ROLE_ADMIN_HOTEL`, `ROLE_ADMIN_APP` | Tambah fasilitas hotel |
| DELETE | `/api/hotels/{id}/facilities/{facilityId}` | `ROLE_ADMIN_HOTEL`, `ROLE_ADMIN_APP` | Hapus fasilitas hotel |
| POST | `/api/hotels/upload-image` | `ROLE_ADMIN_HOTEL`, `ROLE_ADMIN_APP` | Upload gambar hotel |
| POST | `/api/hotels/upload-excel` | `ROLE_ADMIN_APP` | Import hotel dari Excel |
| POST | `/api/hotels/uploadHotel` | `ROLE_ADMIN_APP` | Import hotel dari Excel, endpoint lama |
| GET | `/api/hotels/download-excel` | `ROLE_ADMIN_APP` | Export hotel ke Excel |

Payload tambah/edit hotel menerima `facility_ids` sebagai daftar ID dari master
fasilitas:

```json
{
  "name": "NgiNep Grand Hotel",
  "city_id": 1,
  "featured": true,
  "facility_ids": [1, 2, 5, 6]
}
```

`featured` hanya menentukan apakah hotel ditampilkan sebagai hotel unggulan.
Field tersebut tidak menambahkan semua fasilitas secara otomatis. Kirim
`facility_ids: []` untuk mengosongkan fasilitas hotel. Pada update, jika
`facility_ids` tidak dikirim, relasi fasilitas yang sudah ada dipertahankan.

Import Excel mendukung kolom ke-11 bernama `Facility IDs`, berisi ID fasilitas
yang dipisahkan koma, misalnya `1,2,5`. Export Excel menampilkan nama fasilitas
yang benar-benar terhubung ke masing-masing hotel.

Query utama `GET /api/hotels`:

- `keyword`
- `cityId`
- `minPrice`
- `maxPrice`
- `minRating`
- `featured`
- `onSale`
- `facilityIds`
- `sortBy`
- `page`
- `size`

### Room Types (`hotel-service`)

| Method | Endpoint | Akses | Deskripsi |
| --- | --- | --- | --- |
| GET | `/api/room-types/hotel/{hotelId}` | Public | Tipe kamar berdasarkan hotel |
| GET | `/api/room-types/{id}` | Public | Detail tipe kamar |
| POST | `/api/room-types` | `ROLE_ADMIN_HOTEL`, `ROLE_ADMIN_APP` | Buat tipe kamar beserta fasilitasnya |
| PUT | `/api/room-types/{id}` | `ROLE_ADMIN_HOTEL`, `ROLE_ADMIN_APP` | Update tipe kamar dan fasilitasnya |
| DELETE | `/api/room-types/{id}` | `ROLE_ADMIN_HOTEL`, `ROLE_ADMIN_APP` | Hapus tipe kamar |
| POST | `/api/room-types/upload-image` | `ROLE_ADMIN_HOTEL`, `ROLE_ADMIN_APP` | Upload gambar tipe kamar |

Setiap tipe kamar memiliki fasilitas sendiri melalui `facility_ids`:

```json
{
  "name": "Deluxe Room",
  "hotel_id": 1,
  "price_per_night": 500000,
  "room_available": 5,
  "max_guest": 2,
  "facility_ids": [1, 2, 3]
}
```

Fasilitas kamar disimpan pada `room_type_facilities` dan tidak otomatis
diwariskan dari fasilitas hotel atau tipe kamar lain. Kirim `facility_ids: []`
untuk mengosongkan fasilitas kamar. Jika field tidak dikirim saat update,
relasi yang sudah ada dipertahankan.

### Cities (`hotel-service`)

| Method | Endpoint | Akses | Deskripsi |
| --- | --- | --- | --- |
| GET | `/api/cities` | Public | List kota |
| GET | `/api/cities/{id}` | Public | Detail kota |
| POST | `/api/cities` | `ROLE_ADMIN_APP` | Buat kota |
| PUT | `/api/cities/{id}` | `ROLE_ADMIN_APP` | Update kota |
| DELETE | `/api/cities/{id}` | `ROLE_ADMIN_APP` | Hapus kota |

### Facilities (`hotel-service`)

| Method | Endpoint | Akses | Deskripsi |
| --- | --- | --- | --- |
| GET | `/api/facilities` | Public | List fasilitas |
| GET | `/api/facilities/{id}` | Public | Detail fasilitas |
| POST | `/api/facilities` | `ROLE_ADMIN_APP` | Buat fasilitas |
| PUT | `/api/facilities/{id}` | `ROLE_ADMIN_APP` | Update fasilitas |
| DELETE | `/api/facilities/{id}` | `ROLE_ADMIN_APP` | Hapus fasilitas |

### Bookings (`booking-service`)

| Method | Endpoint | Akses | Deskripsi |
| --- | --- | --- | --- |
| POST | `/api/bookings` | `ROLE_USER` | Buat booking |
| GET | `/api/bookings/my` | `ROLE_USER` | Riwayat booking sendiri |
| PATCH | `/api/bookings/{id}/pay` | `ROLE_USER` | Bayar booking dengan JSON payment data |
| PATCH | `/api/bookings/{id}/pay-upload` | `ROLE_USER` | Upload bukti pembayaran multipart |
| POST | `/api/bookings/{id}/xendit-invoice` | `ROLE_USER` | Buat invoice Xendit |
| POST | `/api/bookings/xendit/webhook` | Public | Webhook Xendit |
| PATCH | `/api/bookings/{id}/cancel` | `ROLE_USER` | Batalkan booking sendiri |
| GET | `/api/bookings` | `ROLE_ADMIN_APP` | Semua booking |
| GET | `/api/bookings/hotel/{hotelId}` | `ROLE_ADMIN_APP`, `ROLE_ADMIN_HOTEL` | Booking berdasarkan hotel |
| GET | `/api/bookings/availability/hotel/{hotelId}` | Public | Ketersediaan kamar hotel |
| GET | `/api/bookings/dashboard/stats` | `ROLE_ADMIN_APP` | Statistik dashboard booking |
| GET | `/api/bookings/download-excel` | `ROLE_ADMIN_APP` | Export booking ke Excel |
| PATCH | `/api/bookings/{id}/status` | `ROLE_ADMIN_APP`, `ROLE_ADMIN_HOTEL` | Update status booking |
| DELETE | `/api/bookings/{id}` | `ROLE_ADMIN_APP` | Hapus booking |

Query utama `GET /api/bookings/my`:

- `status`, default `all`
- `page`
- `size`

## Authentication

Setelah login, backend mengembalikan JWT. Kirim token pada request private:

```http
Authorization: Bearer <jwt_token>
```

Role yang digunakan:

| Role | Deskripsi |
| --- | --- |
| `ROLE_USER` | Customer/pengunjung yang dapat melakukan booking |
| `ROLE_ADMIN_HOTEL` | Admin pengelola hotel tertentu |
| `ROLE_ADMIN_APP` | Super admin aplikasi |

## Upload File

Endpoint upload menggunakan `multipart/form-data`.

| Endpoint | Field |
| --- | --- |
| `/api/users/me/profile-picture` | `file` |
| `/api/hotels/upload-image` | `file`, optional `hotel_id` |
| `/api/room-types/upload-image` | `file`, `hotel_id` |
| `/api/bookings/{id}/pay-upload` | `payment_method`, `payment_proof` |
| `/api/hotels/upload-excel` | `file` |

Folder upload dipetakan oleh Docker Compose:

| Service | Volume |
| --- | --- |
| user-service | `./user-service/uploads:/app/uploads/user-service` |
| hotel-service | `./hotel-service/uploads:/app/uploads/hotel-service` |
| booking-service | `./booking-service/uploads:/app/uploads/booking-service` |

## Payment

Booking-service mendukung dua jalur pembayaran:

- Pembayaran manual melalui `PATCH /api/bookings/{id}/pay` atau `PATCH /api/bookings/{id}/pay-upload`
- Pembayaran invoice Xendit melalui `POST /api/bookings/{id}/xendit-invoice`

Webhook Xendit diterima di:

```text
POST /api/bookings/xendit/webhook
```

Header callback token:

```http
X-CALLBACK-TOKEN: <xendit_callback_token>
```

## Database

Database yang digunakan adalah PostgreSQL melalui Spring Data JPA/Hibernate.

Tabel utama berdasarkan domain service:

| Domain | Data |
| --- | --- |
| User | customer/user, OTP token, role |
| Hotel | hotel, city, facility, hotel image, room type, room type image |
| Booking | booking, status booking, data pembayaran |

Catatan:

- Semua backend service dikonfigurasi memakai PostgreSQL.
- `spring.jpa.hibernate.ddl-auto` default dari Docker Compose adalah `update`.
- Booking-service memiliki logic pencegahan overselling kamar di level service/database sesuai implementasi project.

## Development Notes

- Frontend memanggil backend melalui `/api/*` yang diarahkan ke API Gateway.
- API Gateway mengatur CORS lewat `CORS_ALLOWED_ORIGINS`.
- Jika menjalankan backend manual, pastikan environment variable DB, JWT, SMTP, dan Xendit sudah tersedia.
- Jika Xendit belum dikonfigurasi, fitur booking manual tetap bisa digunakan selama endpoint manual berjalan.
- Jangan menyimpan file `.env` berisi secret ke repository.

## Testing dan Build

Backend:

```bash
cd user-service
mvn test
```

```bash
cd hotel-service
mvn test
```

```bash
cd booking-service
mvn test
```

```bash
cd api-gateway
mvn test
```

Frontend:

```bash
cd frontend
pnpm build
```

atau:

```bash
cd frontend
npm run build
```
