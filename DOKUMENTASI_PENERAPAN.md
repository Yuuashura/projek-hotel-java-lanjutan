# Dokumentasi Penerapan Improvement NgiNep

Dokumentasi ini menjelaskan perubahan yang diterapkan pada proyek NgiNep untuk memperkuat alur admin, validasi booking, pagination, dan konfigurasi development.

## Ringkasan Perubahan

Perubahan utama yang sudah diterapkan:

- Validasi bisnis pada booking.
- Auto-cancel booking `PENDING` yang melewati batas pembayaran.
- Validasi transisi status booking.
- Pagination pada backend untuk endpoint list besar.
- Pagination UI pada halaman admin dengan 25 data per halaman.
- Perbaikan halaman admin agar bisa membaca response backend secara konsisten.
- Perbaikan handling token expired/invalid di frontend.
- Upload gambar dipindahkan dari base64 JSON ke file multipart.
- Bukti pembayaran, foto profil, foto hotel, dan foto room type sekarang disimpan sebagai file dan database hanya menyimpan URL.
- Upload hotel dari file Excel `.xlsx` tersedia di dashboard admin.
- Penambahan file contoh konfigurasi dan `.gitignore`.

## Backend

### 1. Validasi Bisnis Booking

Service: `booking-service`

File utama:

- `booking-service/src/main/java/com/ngninep/booking/service/impl/BookingServiceImpl.java`

Validasi yang ditambahkan:

- `check_out` harus setelah `check_in`.
- `check_in` tidak boleh tanggal lampau.
- Booking yang melewati `paymentDeadline` tidak bisa dibayar.
- Booking expired otomatis diubah menjadi `CANCELLED`.

Contoh validasi:

```java
if (!request.getCheckOut().isAfter(request.getCheckIn())) {
    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Tanggal check-out harus setelah check-in");
}

if (request.getCheckIn().isBefore(LocalDate.now())) {
    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Tanggal check-in tidak boleh tanggal lampau");
}
```

### 2. Auto Cancel Booking Expired

Booking dengan status `PENDING` yang melewati `paymentDeadline` akan otomatis berubah menjadi `CANCELLED`.

Implementasi:

- Scheduler berjalan setiap 5 menit.
- Method `expirePendingBookings()` mencari booking expired.
- Semua booking expired disimpan ulang dengan status `CANCELLED`.

File:

- `booking-service/src/main/java/com/ngninep/booking/BookingServiceApplication.java`
- `booking-service/src/main/java/com/ngninep/booking/service/impl/BookingServiceImpl.java`

Annotation yang digunakan:

```java
@EnableScheduling
```

Scheduler:

```java
@Scheduled(fixedDelay = 300000)
@Transactional
public void expirePendingBookings() {
    ...
}
```

### 3. Validasi Transisi Status Booking

Status booking sekarang tidak bisa diubah sembarangan.

Aturan transisi:

| Status Saat Ini | Status Tujuan Yang Diizinkan |
|---|---|
| `PENDING` | `CONFIRMED`, `CANCELLED` |
| `CONFIRMED` | `COMPLETED`, `CANCELLED` |
| `CANCELLED` | Tidak bisa diubah lagi |
| `COMPLETED` | Tidak bisa diubah lagi |

Tujuannya agar admin tidak bisa mengubah status secara tidak logis, misalnya dari `CANCELLED` kembali ke `CONFIRMED`.

### 4. Pagination Backend

Pagination ditambahkan pada endpoint list besar agar data tidak selalu diambil penuh dari database.

Endpoint yang mendukung `page` dan `size`:

| Service | Endpoint |
|---|---|
| Booking Service | `GET /api/bookings?page=0&size=25` |
| Booking Service | `GET /api/bookings/my?page=0&size=25` |
| Booking Service | `GET /api/bookings/hotel/{hotelId}?page=0&size=25` |
| Hotel Service | `GET /api/hotels?page=0&size=25` |
| User Service | `GET /api/users?page=0&size=25` |

Catatan:

- `page` dimulai dari `0`.
- `size` default adalah `10` jika tidak dikirim.
- `size` maksimal dibatasi `100`.
- Response masih berbentuk list biasa agar kompatibel dengan frontend lama.

Contoh request:

```http
GET http://localhost:8080/api/bookings?page=0&size=25
Authorization: Bearer <token-admin>
```

### 5. Upload File Multipart

Upload gambar sebelumnya memakai base64 di body JSON. Cara itu berat karena ukuran payload membesar dan semua data gambar ikut melewati JSON parser.

Sekarang upload gambar memakai `multipart/form-data`. Backend menyimpan file ke folder upload lokal, lalu mengembalikan URL. Database hanya menyimpan URL tersebut.

Endpoint upload yang ditambahkan:

| Kebutuhan | Service | Endpoint | Field File |
|---|---|---|---|
| Bukti pembayaran booking | Booking Service | `PATCH /api/bookings/{id}/pay-upload` | `payment_proof` |
| Foto profil user | User Service | `POST /api/users/me/profile-picture` | `file` |
| Foto hotel | Hotel Service | `POST /api/hotels/upload-image` | `file` |
| Foto room type | Hotel Service | `POST /api/room-types/upload-image` | `file` |

Validasi file:

- Format yang diterima: `jpg`, `jpeg`, `png`, `webp`.
- Maksimal ukuran file: `5MB`.
- File kosong ditolak.

Contoh response upload gambar:

```json
{
  "status": "200",
  "message": "Image uploaded",
  "data": {
    "url": "/api/hotels/uploads/0184d8a8-0a3b-4d74-a250-0c78f55b7c1a.png"
  }
}
```

Contoh request bukti pembayaran:

```http
PATCH http://localhost:8080/api/bookings/12/pay-upload
Authorization: Bearer <token-user>
Content-Type: multipart/form-data

payment_method=BANK_TRANSFER
payment_proof=<file-gambar>
```

Folder penyimpanan default:

| Service | Folder |
|---|---|
| User Service | `uploads/user-service/profile-pictures` |
| Booking Service | `uploads/booking-service/payment-proofs` |
| Hotel Service | `uploads/hotel-service/hotel-images` |
| Hotel Service | `uploads/hotel-service/room-type-images` |

Folder ini sudah diabaikan oleh `.gitignore` karena berisi data runtime.

### 6. Upload Hotel Dari Excel

Admin dapat menambahkan data hotel dari file Excel `.xlsx`.

Endpoint:

```http
POST http://localhost:8080/api/hotels/upload-excel
Authorization: Bearer <token-admin>
Content-Type: multipart/form-data

file=<file.xlsx>
```

Role yang boleh mengakses:

- `ROLE_ADMIN_HOTEL`
- `ROLE_ADMIN_APP`

Catatan:

- Hanya file `.xlsx` yang diterima.
- Import memakai logic Excel yang sudah ada di `HotelServiceImpl`.
- Setelah upload sukses, frontend mengambil ulang data hotel/statistik dashboard.

## Frontend

### 1. Helper Response API

File baru:

- `frontend/src/utils/response.js`

Helper ini dibuat karena response backend belum sepenuhnya seragam. Ada endpoint yang mengembalikan array langsung dan ada yang mengembalikan format wrapper seperti:

```json
{
  "status": "200",
  "message": "Success",
  "data": []
}
```

Helper:

```js
export const unwrapList = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.content)) return payload.content;
  if (Array.isArray(payload?.data?.content)) return payload.data.content;
  return [];
};
```

Manfaat:

- Halaman admin tidak error ketika bentuk response berbeda.
- Data booking, hotel, dan pengunjung tetap bisa dibaca.
- Error backend bisa ditampilkan dengan pesan yang lebih jelas.

### 2. Pagination UI Admin

File baru:

- `frontend/src/components/admin/PaginationControls.jsx`

Komponen ini menampilkan:

- Tombol `Prev`.
- Tombol `Next`.
- Nomor halaman.
- Informasi halaman saat ini.
- Informasi jumlah data yang sedang ditampilkan.

Format tampilan:

```text
Halaman 1 dari 3 - Menampilkan 1-25 dari 63 data - 25 per halaman
```

Jumlah data per halaman:

```js
const PAGE_SIZE = 25;
```

### 3. Halaman Admin Yang Sudah Dipasang Pagination

Pagination 25 per halaman diterapkan di:

| Halaman | File |
|---|---|
| Kelola Pemesanan | `frontend/src/pages/admin/AdminBookings.jsx` |
| Kelola Pengunjung | `frontend/src/pages/admin/AdminVisitors.jsx` |
| Kelola Hotel | `frontend/src/pages/admin/AdminHotels.jsx` |

Cara kerja:

1. Data diambil dari API.
2. Data disimpan dalam state.
3. Search/filter dijalankan di frontend.
4. Hasil search/filter dipotong menjadi 25 data per halaman.
5. User bisa pindah halaman dengan tombol `Prev`, `Next`, atau nomor halaman.

Contoh implementasi:

```js
const PAGE_SIZE = 25;
const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
const currentPage = Math.min(page, totalPages - 1);
const paginated = filtered.slice(
  currentPage * PAGE_SIZE,
  (currentPage + 1) * PAGE_SIZE
);
```

### 4. Perbaikan Admin Bookings

File:

- `frontend/src/pages/admin/AdminBookings.jsx`

Perubahan:

- Data booking dibaca dengan `unwrapList()`.
- Error backend ditampilkan dengan `getErrorMessage()`.
- Search tetap bekerja untuk nama, email, dan ID booking.
- Filter status tetap bekerja.
- Setelah filter/search berubah, halaman kembali ke page pertama.
- Tabel hanya menampilkan 25 data per halaman.

### 5. Perbaikan Admin Visitors

File:

- `frontend/src/pages/admin/AdminVisitors.jsx`

Perubahan:

- Data user dibaca dengan `unwrapList()`.
- Data city juga dibaca dengan `unwrapList()`.
- User difilter agar hanya role `ROLE_USER` yang tampil sebagai pengunjung.
- Search tetap bekerja untuk email, nama, dan nomor telepon.
- Tabel hanya menampilkan 25 data per halaman.

### 6. Perbaikan Admin Hotels

File:

- `frontend/src/pages/admin/AdminHotels.jsx`

Perubahan:

- Data hotel dibaca dengan `unwrapList()`.
- Data city dibaca dengan `unwrapList()`.
- Error fetch hotel ditampilkan.
- Tabel hanya menampilkan 25 hotel per halaman.

### 7. Handling Token Invalid

File:

- `frontend/src/utils/api.js`

Sebelumnya frontend hanya membersihkan session jika response `401`.

Sekarang frontend juga membersihkan session jika mendapat `403` kosong dari Spring Security.

Tujuannya:

- Jika token lama/invalid tersimpan di `localStorage`, admin tidak stuck di halaman admin.
- User diarahkan kembali ke login.

Implementasi:

```js
const status = error.response?.status;
const hasBackendMessage = Boolean(error.response?.data?.message);

if (status === 401 || (status === 403 && !hasBackendMessage)) {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  ...
}
```

### 8. Upload File Di Frontend

File baru:

- `frontend/src/utils/uploads.js`

Helper ini menangani validasi file gambar dan upload `FormData`.

```js
const imageUrl = await uploadFile('/api/hotels/upload-image', file);
```

`frontend/src/utils/api.js` juga disesuaikan agar saat request berisi `FormData`, header `Content-Type: application/json` dilepas. Ini penting supaya browser bisa memasang boundary `multipart/form-data` otomatis.

Halaman yang sudah memakai upload multipart:

| Halaman | File | Perubahan |
|---|---|---|
| Payment | `frontend/src/pages/user/Payment.jsx` | Upload bukti pembayaran ke `/api/bookings/{id}/pay-upload` |
| Profile | `frontend/src/pages/user/Profile.jsx` | Upload foto profil ke `/api/users/me/profile-picture` |
| Admin Hotels | `frontend/src/pages/admin/AdminHotels.jsx` | Upload foto hotel ke `/api/hotels/upload-image` |
| Admin Room Types | `frontend/src/pages/admin/AdminRoomTypes.jsx` | Upload foto room type ke `/api/room-types/upload-image` |

### 9. Upload Excel Di Dashboard Admin

Tombol upload Excel tersedia di:

| Halaman | File |
|---|---|
| Dashboard Admin | `frontend/src/pages/admin/AdminDashboard.jsx` |
| Kelola Hotel | `frontend/src/pages/admin/AdminHotels.jsx` |

Alur penggunaan:

1. Admin klik tombol `Upload Hotel Excel`.
2. Admin memilih file `.xlsx`.
3. Frontend mengirim `multipart/form-data` ke `/api/hotels/upload-excel`.
4. Jika sukses, dashboard/hotel list dimuat ulang.
5. Jika gagal, pesan error backend ditampilkan.

## Konfigurasi Project

### 1. `.gitignore`

File baru:

- `.gitignore`

Isi penting:

```gitignore
target/
node_modules/
dist/

.env
.env.*
!.env.example

**/src/main/resources/application.properties
**/src/main/resources/application-*.properties
!**/src/main/resources/application.properties.example

*.log
uploads/
**/uploads/
*.xlsx
*.xls
hotel-service/UsersThinkPadDocumentsdoc/
```

Tujuannya:

- Mencegah build output masuk Git.
- Mencegah credential lokal masuk Git.
- Mencegah file upload/generated ikut ter-commit.

### 2. File Contoh Konfigurasi

File yang ditambahkan atau dirapikan:

- `user-service/src/main/resources/application.properties.example`
- `hotel-service/src/main/resources/application.properties.example`
- `booking-service/src/main/resources/application.properties.example`

Konsep:

- Credential asli tidak ditulis langsung.
- Nilai sensitif dibaca dari environment variable.

Contoh:

```properties
spring.datasource.url=${DB_URL:jdbc:postgresql://localhost:5432/ngninep_user}
spring.datasource.username=${DB_USERNAME:postgres}
spring.datasource.password=${DB_PASSWORD:postgres}
jwt.secret=${JWT_SECRET:change-this-minimum-32-character-secret}
app.file.upload-path=${APP_FILE_UPLOAD_PATH:uploads/user-service}
```

Untuk upload file, setiap service mempunyai konfigurasi:

```properties
app.file.upload-path=${APP_FILE_UPLOAD_PATH:uploads/<nama-service>}
```

Contoh:

```properties
app.file.upload-path=${APP_FILE_UPLOAD_PATH:uploads/hotel-service}
```

## Cara Menjalankan Project

Jalankan semua service di terminal terpisah.

### 1. User Service

```powershell
cd user-service
.\mvnw.cmd spring-boot:run
```

Port:

```text
http://localhost:8081
```

### 2. Hotel Service

```powershell
cd hotel-service
.\mvnw.cmd spring-boot:run
```

Port:

```text
http://localhost:8082
```

### 3. Booking Service

```powershell
cd booking-service
.\mvnw.cmd spring-boot:run
```

Port:

```text
http://localhost:8083
```

### 4. API Gateway

```powershell
cd api-gateway
.\mvnw.cmd spring-boot:run
```

Port:

```text
http://localhost:8080
```

### 5. Frontend

```powershell
cd frontend
npm run dev
```

Port:

```text
http://localhost:5173
```

## Cara Pengujian

### 1. Cek Endpoint Public

```powershell
curl http://localhost:8080/api/cities
curl http://localhost:8080/api/hotels
curl http://localhost:8080/api/hotels?page=0&size=25
```

Expected:

- Status HTTP `200`.
- Response berisi `status`, `message`, dan `data`.

### 2. Cek Endpoint Admin

Login sebagai admin untuk mendapatkan JWT.

Lalu cek:

```powershell
curl -H "Authorization: Bearer <token-admin>" http://localhost:8080/api/bookings
curl -H "Authorization: Bearer <token-admin>" http://localhost:8080/api/users
```

Expected:

- Status HTTP `200`.
- Data booking dan user muncul.

### 3. Cek Validasi Booking

Kirim booking dengan tanggal check-in dan check-out yang sama.

Expected:

```json
{
  "status": "400",
  "message": "Tanggal check-out harus setelah check-in",
  "data": null
}
```

### 4. Cek Frontend Admin

Buka:

```text
http://localhost:5173/admin/bookings
http://localhost:5173/admin/visitors
http://localhost:5173/admin/hotels
```

Expected:

- Data tampil.
- Pagination muncul jika data lebih dari 25.
- Tombol `Prev` dan `Next` bekerja.
- Nomor halaman bisa diklik.
- Search/filter mengembalikan halaman ke page pertama.

### 5. Cek Upload Gambar

Login sesuai role, lalu tes dari frontend:

```text
http://localhost:5173/user/payment/<id-booking>
http://localhost:5173/profile
http://localhost:5173/admin/hotels
http://localhost:5173/admin/room-types
```

Expected:

- Preview gambar muncul dari file lokal sebelum submit.
- Setelah upload, database menyimpan URL, bukan base64.
- URL gambar dapat diakses lewat gateway, misalnya `/api/hotels/uploads/<nama-file>`.

### 6. Cek Upload Excel Hotel

Buka:

```text
http://localhost:5173/admin
http://localhost:5173/admin/hotels
```

Expected:

- Tombol upload Excel muncul.
- File selain `.xlsx` ditolak.
- Setelah `.xlsx` sukses diupload, data hotel/statistik dimuat ulang.

## Verifikasi Build

Frontend sudah diuji dengan:

```powershell
npm run build
```

Hasil:

```text
build sukses
```

Backend sudah diuji dengan:

```powershell
.\mvnw.cmd -q test
```

Service yang sudah dites:

- `user-service`
- `hotel-service`
- `booking-service`

Catatan:

- Test backend saat ini masih memakai database development sesuai `application.properties`.
- Untuk pengembangan berikutnya, sebaiknya dibuat profile khusus test agar test tidak menyentuh database development.

## Catatan Pengembangan Berikutnya

Hal yang masih dapat ditingkatkan:

1. Response pagination sebaiknya dilengkapi metadata:

```json
{
  "data": [],
  "page": 0,
  "size": 25,
  "totalElements": 100,
  "totalPages": 4
}
```

2. Frontend admin sebaiknya mengambil page langsung dari backend jika jumlah data sudah besar.

3. Tambahkan test khusus untuk:

- Validasi tanggal booking.
- Auto-cancel booking expired.
- Admin booking list.
- Admin visitor list.
- Pagination frontend.

4. Tambahkan profile test:

```text
application-test.properties
```

5. Pertimbangkan migrasi database dengan Flyway atau Liquibase agar struktur database lebih terkontrol.
