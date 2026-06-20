# Alur Seluruh Fitur NgiNep

Dokumen ini menjelaskan alur kerja fitur NgiNep berdasarkan struktur kode saat ini.
Fokus utamanya adalah perjalanan data dari halaman React sampai database atau
layanan eksternal, kemudian kembali lagi menjadi response yang ditampilkan pada
pengguna.

## 1. Gambaran Arsitektur

NgiNep menggunakan arsitektur microservices:

| Komponen | Port | Tanggung jawab |
|---|---:|---|
| Frontend React + Vite | `5173` | View, form, navigasi, tema, bahasa, dan state pengguna |
| API Gateway | `8080` | Pintu masuk seluruh request API dan routing ke microservice |
| User Service | `8081` | Login, register, OTP, JWT, profil, dan pengelolaan pengguna |
| Hotel Service | `8082` | Hotel, kamar, kota, fasilitas, gambar, filter, dan Excel |
| Booking Service | `8083` | Booking, availability, pembayaran, status, email, dan Excel |
| PostgreSQL/Supabase | - | Penyimpanan data user, hotel, kamar, OTP, dan booking |
| Gmail SMTP | eksternal | Mengirim OTP dan notifikasi booking |
| Xendit | eksternal | Membuat invoice dan memberi callback status pembayaran |

Alur umum request:

```text
View React
  -> Axios API Utility
  -> API Gateway :8080
  -> Security Filter / JWT Filter
  -> Controller
  -> Service Interface
  -> Service Implementation
  -> Repository / WebClient / File Storage
  -> PostgreSQL atau layanan eksternal
  -> Response DTO
  -> Controller
  -> API Gateway
  -> View React
```

API Gateway membagi request berdasarkan path:

| Path | Tujuan |
|---|---|
| `/api/auth/**`, `/api/users/**` | User Service |
| `/api/hotels/**`, `/api/room-types/**` | Hotel Service |
| `/api/cities/**`, `/api/facilities/**` | Hotel Service |
| `/api/bookings/**` | Booking Service |

## 2. Lapisan Backend

Setiap service memakai pola yang hampir sama.

### Controller

Controller menerima HTTP request, membaca path/query/body, menjalankan validasi
DTO, mengambil identitas pengguna, kemudian memanggil service.

Contoh:

```text
POST /api/auth/login
-> AuthController.login()
-> AuthService.login()
```

### Service

Service berisi aturan bisnis, seperti:

- email boleh dipakai atau tidak;
- password benar atau salah;
- hotel dimiliki admin yang sedang login atau tidak;
- kamar tersedia pada tanggal tertentu atau tidak;
- status booking boleh berpindah atau tidak;
- invoice Xendit boleh dibuat atau tidak.

### Repository

Repository menggunakan Spring Data JPA untuk membaca dan menulis entity ke
PostgreSQL.

Contoh:

```text
CustomerRepository.findByEmail(email)
BookingRepository.findByCustomerId(customerId)
HotelRepository.findById(hotelId)
```

### Entity

Entity merupakan representasi tabel database, misalnya:

| Service | Entity/tabel utama |
|---|---|
| User Service | `Customer`, `OtpToken` |
| Hotel Service | `Hotel`, `RoomType`, `City`, `Facility`, image dan tabel relasi |
| Booking Service | `Booking` |

### DTO

DTO membatasi bentuk request dan response. Anotasi seperti `@NotBlank`,
`@NotNull`, `@Email`, dan `@Min` memvalidasi input sebelum service dijalankan.

### Security

JWT dikirim frontend melalui:

```http
Authorization: Bearer <token>
```

JWT Filter membaca:

- email sebagai subject;
- `userId`;
- `role`.

Hak akses method diperiksa dengan `@PreAuthorize`, misalnya:

```java
@PreAuthorize("hasAuthority('ROLE_USER')")
@PreAuthorize("hasAuthority('ROLE_ADMIN_APP')")
@PreAuthorize("hasAnyAuthority('ROLE_ADMIN_HOTEL', 'ROLE_ADMIN_APP')")
```

## 3. Frontend dan Route Guard

Provider utama frontend:

```text
PreferencesProvider
  -> AuthProvider
    -> BrowserRouter
      -> Route Guard
        -> Page
```

### PreferencesProvider

Mengelola:

- bahasa Indonesia/Inggris;
- tema terang/gelap;
- penyimpanan preferensi di `localStorage`;
- fungsi translasi `t(key)`.

Fitur ini hanya berjalan di frontend dan tidak memanggil backend.

### AuthProvider

Mengelola:

- token JWT;
- data user aktif;
- pemanggilan `/api/users/me`;
- login/logout pada state aplikasi.

### Route Guard

| Guard | Akses |
|---|---|
| `UserRoute` | Hanya `ROLE_USER` |
| `AdminRoute` | `ROLE_ADMIN_HOTEL` dan `ROLE_ADMIN_APP` |
| `AdminAppRoute` | Hanya `ROLE_ADMIN_APP` |

Jika role tidak sesuai, React melakukan redirect sebelum halaman ditampilkan.
Backend tetap melakukan validasi role lagi agar keamanan tidak hanya bergantung
pada frontend.

---

# FITUR USER SERVICE

## 4. Register User

Halaman: `/register`

Endpoint:

```http
POST /api/auth/register
```

Alur:

```text
Register.jsx
-> mengambil daftar kota dari GET /api/cities
-> user mengisi data
-> POST /api/auth/register
-> API Gateway
-> AuthController.register()
-> validasi RegisterRequest
-> AuthServiceImpl.register()
-> CustomerRepository.findByEmail()
```

Jika email belum terdaftar:

```text
PasswordEncoder.encode(password)
-> buat Customer dengan:
   role = ROLE_USER
   verified = false
   banned = false
-> CustomerRepository.save()
-> OtpService.generateAndSendOtp()
-> OtpTokenRepository.save()
-> OtpMailSender.sendOtpEmailAsync()
-> Gmail SMTP
```

Frontend menerima response sukses, menyimpan email sementara, lalu redirect ke:

```text
/verify-otp?email=...
```

Jika email sudah ada:

- akun verified: response email sudah terdaftar;
- akun belum verified: response `UNVERIFIED_ACCOUNT`, lalu user dapat meminta
  pengiriman OTP ulang.

## 5. Verifikasi OTP Register

Halaman: `/verify-otp`

Endpoint:

```http
POST /api/auth/verify-otp
```

Alur:

```text
VerifyOtp.jsx
-> user memasukkan 6 digit OTP
-> AuthController.verifyOtp()
-> AuthServiceImpl.verifyOtp()
-> CustomerRepository.findByEmail()
-> OtpService.validateOtp(email, code, REGISTER_VERIFICATION)
-> OtpTokenRepository mencari OTP aktif terbaru
```

Validasi OTP:

```text
OTP ada?
-> kode cocok?
-> belum melewati expiredAt?
-> used masih false?
```

Jika valid:

```text
OtpToken.used = true
Customer.verified = true
-> simpan kedua perubahan
-> frontend redirect ke login
```

OTP berlaku selama lima menit.

## 6. Kirim Ulang OTP

Endpoint:

```http
POST /api/auth/resend-otp
```

Alur:

```text
VerifyOtp/Register
-> AuthController.resendOtp()
-> AuthServiceImpl.resendOtp()
-> cek akun ada dan belum verified
-> cari OTP aktif terakhir
-> cek cooldown lima menit
-> tandai semua OTP lama sebagai used
-> generate OTP baru
-> simpan ke otp_tokens
-> kirim email async
```

Cooldown mencegah user meminta OTP terus-menerus.

## 7. Login

Halaman: `/login`

Endpoint:

```http
POST /api/auth/login
```

Alur lengkap:

```text
Login.jsx
-> user mengisi email dan password
-> api.post('/api/auth/login')
-> API Gateway
-> AuthController.login()
-> validasi LoginRequest
-> AuthServiceImpl.login()
-> CustomerRepository.findByEmail()
-> PasswordEncoder.matches()
-> cek verified
-> cek banned
-> CustomUserDetailsService.loadUserByUsername()
-> JwtUtil.generateToken(userDetails, customerId)
```

JWT berisi:

```text
subject = email
role
userId
issuedAt
expiration
```

Response dikembalikan ke frontend:

```text
token + id_customer + email + nama + role
```

Frontend kemudian:

```text
localStorage.setItem('token')
-> GET /api/users/me
-> AuthContext menyimpan profil
-> ROLE_USER diarahkan ke home
-> ROLE_ADMIN_* diarahkan ke /admin/dashboard
```

## 8. Menjaga Sesi Login

Saat halaman direfresh:

```text
AuthProvider membaca token localStorage
-> Axios interceptor menambahkan Authorization Bearer
-> GET /api/users/me
-> JwtFilter memvalidasi token
-> UserController.getProfile()
-> UserServiceImpl.getProfile()
-> CustomerRepository.findByEmail()
-> profil dikembalikan ke AuthContext
```

Jika token tidak valid atau expired, sesi frontend dibersihkan.

## 9. Logout

Logout terjadi di frontend:

```text
User klik Logout
-> modal konfirmasi fixed ditampilkan
-> user memilih Ya
-> animasi loading sekitar dua detik
-> token dan data user dihapus
-> flash notification disimpan
-> halaman direfresh/redirect ke Home
```

Saat ini tidak ada endpoint blacklist JWT. Token berhenti dipakai oleh frontend,
tetapi secara kriptografis tetap valid sampai waktu expiry-nya habis.

## 10. Lupa Password

Halaman: `/forgot-password`

Endpoint:

```http
POST /api/auth/forgot-password
```

Alur:

```text
ForgotPassword.jsx
-> kirim email
-> AuthController.forgotPassword()
-> AuthServiceImpl.forgotPassword()
-> CustomerRepository.findByEmail()
```

Jika akun ada, verified, dan tidak banned:

```text
cek cooldown OTP PASSWORD_RESET
-> invalidasi OTP reset lama
-> buat OTP PASSWORD_RESET
-> simpan ke otp_tokens
-> kirim email async
```

Response selalu dibuat umum:

```text
"Jika email terdaftar, kode reset password akan dikirim."
```

Tujuannya agar orang lain tidak dapat menebak email mana yang terdaftar.

## 11. Verifikasi OTP Reset Password

Halaman: `/reset-password?email=...`

Tahap pertama:

```http
POST /api/auth/verify-reset-otp
```

Alur:

```text
ResetPassword.jsx
-> email berasal dari query dan tidak dapat diedit
-> user memasukkan OTP
-> AuthServiceImpl.verifyResetOtp()
-> cek akun, verified, dan banned
-> OtpService.checkOtp(PASSWORD_RESET)
```

Pada tahap ini OTP hanya diperiksa, belum ditandai used. Jika valid, frontend
baru membuka form password baru.

## 12. Simpan Password Baru

Tahap kedua:

```http
POST /api/auth/reset-password
```

Alur:

```text
ResetPassword.jsx
-> kirim email + OTP + password baru
-> AuthServiceImpl.resetPassword()
-> OtpService.validateOtp(PASSWORD_RESET)
-> OTP ditandai used
-> PasswordEncoder.encode(newPassword)
-> Customer.password diperbarui
-> CustomerRepository.save()
-> redirect ke login
```

## 13. Profil User

Halaman: `/profile`

### Lihat profil

```text
GET /api/users/me
-> JwtFilter
-> UserController.getProfile()
-> UserServiceImpl.getProfile()
-> CustomerRepository.findByEmail()
```

### Edit profil

```text
Profile.jsx
-> PUT /api/users/me
-> UserController.updateProfile()
-> UserServiceImpl.updateProfile()
-> ubah nama, umur, kota, telepon, atau foto
-> CustomerRepository.save()
```

### Upload foto profil

```text
POST /api/users/me/profile-picture
-> multipart/form-data
-> FileStorageService.saveProfilePicture()
-> validasi file
-> simpan ke folder uploads
-> simpan URL file pada Customer.profile_picture
```

### Ganti password

```text
PUT /api/users/me/change-password
-> cek password lama dengan BCrypt
-> cek password baru = konfirmasi
-> encode password baru
-> CustomerRepository.save()
```

---

# FITUR HOTEL SERVICE

## 14. Home dan Rekomendasi Hotel

Halaman: `/`

Frontend memanggil:

```http
GET /api/cities
GET /api/hotels?page=0&size=...
```

Alur:

```text
Home.jsx
-> API Gateway
-> HotelController.search()
-> HotelServiceImpl.search()
-> HotelRepository.findAll()
-> filter/sort/pagination
-> map Hotel menjadi HotelResponse
-> response ke carousel/recommended hotels
```

Frontend menampilkan loading animation sampai data berhasil diterima. Tidak ada
dummy hotel sebagai data awal.

## 15. Daftar Hotel dan Filter

Halaman: `/hotels`

Parameter filter dapat berisi:

- keyword;
- kota;
- harga minimum/maksimum;
- tipe hotel;
- rating;
- fasilitas;
- sorting;
- page dan size.

Alur:

```text
Hotels.jsx
-> bentuk query params
-> GET /api/hotels
-> HotelController.getAll/search()
-> HotelServiceImpl.search()
-> HotelRepository membaca hotel
-> RoomType data dipakai untuk min_price
-> filter dan pagination dibentuk
-> PagedResult<HotelResponse>
-> frontend menampilkan maksimal 25 data per page
```

Metadata pagination berisi:

```text
current_page
page_size
total_items
total_pages
has_next
has_previous
```

## 16. Detail Hotel

Halaman: `/hotels/:id`

Request paralel:

```http
GET /api/hotels/{id}
GET /api/facilities
GET /api/bookings/availability/hotel/{id}
```

### Data hotel

```text
HotelController.getById()
-> HotelServiceImpl.getById()
-> HotelRepository.findById()
-> HotelImageRepository
-> HotelFacilityRepository
-> RoomTypeRepository
-> response detail lengkap
```

### Availability

```text
BookingController.getRoomAvailabilityByHotel()
-> BookingServiceImpl.getRoomAvailabilityByHotel()
-> WebClient ke Hotel Service untuk daftar room type
-> BookingRepository membaca booking PENDING/CONFIRMED
-> hitung penggunaan kamar per tanggal
-> hasil full period dan kamar tersedia
```

Frontend menggabungkan data hotel, fasilitas, kamar, dan availability.

## 17. Kota

Endpoint publik:

```http
GET /api/cities
GET /api/cities/{id}
```

Alur:

```text
CityController
-> CityServiceImpl
-> CityRepository
-> tabel cities
```

CRUD kota hanya untuk `ROLE_ADMIN_APP`:

```http
POST /api/cities
PUT /api/cities/{id}
DELETE /api/cities/{id}
```

## 18. Fasilitas

Endpoint publik:

```http
GET /api/facilities
GET /api/facilities/{id}
```

Alur:

```text
FacilityController
-> FacilityServiceImpl
-> FacilityRepository
-> tabel facilities
```

CRUD master fasilitas hanya untuk `ROLE_ADMIN_APP`.

Relasi fasilitas hotel:

```http
POST /api/hotels/{hotelId}/facilities/{facilityId}
DELETE /api/hotels/{hotelId}/facilities/{facilityId}
```

Service memvalidasi hotel, fasilitas, ownership, kemudian menulis ke tabel relasi
`hotel_facilities`.

Form tambah/edit hotel juga mengirim seluruh fasilitas terpilih melalui:

```json
{
  "facility_ids": [1, 2, 5]
}
```

`HotelServiceImpl` memvalidasi seluruh ID lalu menyinkronkan tabel
`hotel_facilities` dalam transaksi yang sama dengan perubahan hotel. Status
`featured` berdiri sendiri dan tidak pernah dianggap sebagai paket semua
fasilitas.

## 19. Data Hotel Unggulan

Endpoint pendukung Home/Admin:

```http
GET /api/hotels/featured
GET /api/hotels/latest
GET /api/hotels/on-sale
GET /api/hotels/popular-cities
GET /api/hotels/popular-facilities
GET /api/hotels/stats
```

Semua diproses oleh `HotelServiceImpl` dari data hotel yang tersimpan, kemudian
diubah menjadi daftar atau statistik.

---

# FITUR BOOKING SERVICE

## 20. Membuat Booking

Halaman: `/booking/:hotelId`

Frontend lebih dulu mengambil:

```http
GET /api/hotels/{hotelId}
GET /api/room-types/hotel/{hotelId}
```

Saat submit:

```http
POST /api/bookings
Authorization: Bearer <ROLE_USER token>
```

Body utama:

```text
hotel_id
room_type_id
check_in
check_out
number_of_guest
orderer_name
orderer_phone
orderer_email
is_for_self
```

Alur backend:

```text
BookingController.createBooking()
-> mengambil customerId dari credentials JWT
-> BookingServiceImpl.createBooking()
-> validateBookingDates()
-> WebClient GET Hotel Service /api/room-types/{roomTypeId}
-> validateRoomType()
-> cek room type memang milik hotel
-> cek jumlah tamu <= max_guest
-> cek room_available
-> hitung booking overlap pada tanggal yang dipilih
-> calculateTotalPrice()
-> BookingRepository.save()
```

Harga dari frontend tidak dipercaya. Backend menghitung ulang:

```text
jumlah malam = check_out - check_in
harga dasar = jumlah malam × price_per_night

jika room/hotel sedang on sale:
diskon = harga dasar × discount_percent / 100
total harga = harga dasar - diskon

jika tidak ada diskon:
total harga = harga dasar
```

Booking baru disimpan dengan:

```text
status = PENDING
payment_deadline = sekarang + 24 jam
```

Database juga memiliki trigger/function anti-overselling untuk menjadi lapisan
proteksi terakhir jika dua request booking terjadi hampir bersamaan.

Setelah berhasil, frontend redirect ke:

```text
/payment/{bookingId}
```

## 21. Availability dan Anti-Overselling

Booking dianggap memakai stok kamar jika statusnya:

```text
PENDING atau CONFIRMED
```

Dua rentang tanggal dianggap overlap jika:

```text
booking.check_in < request.check_out
AND booking.check_out > request.check_in
```

Alur pengecekan:

```text
BookingService
-> ambil room_available dari Hotel Service
-> BookingRepository menghitung booking overlap
-> jika bookedRooms >= roomAvailable
-> tolak dengan "Kamar sudah penuh pada tanggal tersebut"
```

Trigger PostgreSQL memberikan perlindungan tambahan pada saat insert/update agar
stok tidak menjadi minus akibat request bersamaan.

## 22. My Bookings

Halaman: `/my-bookings`

Endpoint:

```http
GET /api/bookings/my?status=active
GET /api/bookings/my?status=history
```

Alur:

```text
MyBookings.jsx
-> BookingController.getMyBookings()
-> customerId diambil dari JWT
-> BookingServiceImpl.getMyBookings()
-> expirePendingBookings()
-> BookingRepository filter customerId + status
-> BookingResponse dikembalikan
```

Filter:

| Filter | Status |
|---|---|
| `active` | `PENDING`, `CONFIRMED` |
| `history` | `COMPLETED`, `CANCELLED` |
| `all` | seluruh status user tersebut |

Frontend kemudian mengambil nama hotel dan nama room type:

```text
GET /api/hotels/{hotelId}
GET /api/room-types/{roomTypeId}
```

Hasilnya digabung agar card tidak hanya menampilkan ID.

## 23. Membatalkan Booking

Endpoint:

```http
PATCH /api/bookings/{id}/cancel
```

Alur:

```text
MyBookings.jsx
-> BookingController.cancelBooking()
-> customerId dari JWT
-> BookingServiceImpl.cancelBooking()
-> BookingRepository.findById()
-> cek booking milik user
-> hanya status PENDING yang dapat dibatalkan
-> status = CANCELLED
-> BookingRepository.save()
-> EmailNotificationService.sendCancellationEmail()
```

Email dikirim asynchronous sehingga response utama tidak harus menunggu SMTP.

## 24. Pembayaran Xendit

Halaman: `/payment/:bookingId`

Endpoint:

```http
POST /api/bookings/{bookingId}/xendit-invoice
```

Alur:

```text
Payment.jsx
-> GET /api/bookings/my untuk memvalidasi booking
-> POST /xendit-invoice
-> BookingController.createXenditInvoice()
-> XenditPaymentServiceImpl.createInvoice()
-> BookingRepository.findById()
-> cek booking milik customer
-> cek status masih PENDING
-> cek deadline belum lewat
-> cek total_price > 0
```

Jika invoice aktif sudah ada, service mengembalikan invoice lama agar tidak
membuat invoice ganda.

Jika belum ada:

```text
buat external_id unik
-> WebClient POST https://api.xendit.co/v2/invoices
-> Basic Auth menggunakan API key dari environment
-> Xendit mengembalikan invoice_url
-> simpan:
   payment_method = XENDIT
   payment_status
   xendit_invoice_id
   xendit_external_id
   xendit_invoice_url
-> response invoice_url ke frontend
-> browser diarahkan ke halaman pembayaran Xendit
```

## 25. Webhook Xendit

Endpoint publik khusus Xendit:

```http
POST /api/bookings/xendit/webhook
X-CALLBACK-TOKEN: <callback token>
```

Alur:

```text
Xendit
-> API Gateway
-> BookingController.handleXenditWebhook()
-> XenditPaymentServiceImpl.handleInvoiceWebhook()
-> validasi X-CALLBACK-TOKEN
-> cari booking berdasarkan external_id
-> fallback cari berdasarkan xendit_invoice_id
```

Perubahan status:

| Status Xendit | Payment status | Booking status |
|---|---|---|
| `PAID` | `PAID` | `CONFIRMED` |
| `SETTLED` | `SETTLED` | `CONFIRMED` |
| `EXPIRED` | `EXPIRED` | `CANCELLED` jika masih `PENDING` |

Jika pembayaran berhasil:

```text
paid_at disimpan
-> BookingRepository.save()
-> EmailNotificationService.sendPaymentSuccessEmail()
```

Webhook bersifat idempotent: callback ulang untuk invoice yang sama memperbarui
record yang sama, bukan membuat booking baru.

## 26. Pembayaran Manual

Backend masih menyediakan flow lama:

```http
PATCH /api/bookings/{id}/pay
PATCH /api/bookings/{id}/pay-upload
```

Flow upload:

```text
multipart payment_method + payment_proof
-> BookingController
-> FileStorageService.savePaymentProof()
-> BookingServiceImpl.payBooking()
-> cek ownership, status, dan deadline
-> simpan metode dan URL bukti pembayaran
```

Flow ini dapat dipertahankan sebagai alternatif Xendit atau dihapus jika sistem
nantinya hanya memakai payment gateway.

## 27. Expired Booking Scheduler

Setiap sekitar lima menit:

```text
@Scheduled
-> BookingServiceImpl.expirePendingBookings()
-> BookingRepository.findByStatusAndPaymentDeadlineBefore(PENDING, now)
-> seluruh booking lewat deadline menjadi CANCELLED
-> BookingRepository.saveAll()
```

Dengan pembatalan ini, booking expired tidak lagi dihitung sebagai pemakai stok.

---

# FITUR ADMIN

## 28. Dashboard Admin

Halaman: `/admin/dashboard`

### Admin App

Frontend mengambil:

```http
GET /api/hotels?page=0&size=100
GET /api/bookings?page=0&size=100
```

### Admin Hotel

Frontend:

```text
GET /api/hotels
-> pilih hotel yang admin_hotel_id = user.id
-> GET /api/bookings/hotel/{hotelId} untuk setiap hotel miliknya
```

Data kemudian diringkas di frontend menjadi:

- jumlah hotel;
- jumlah booking;
- booking terbaru;
- distribusi status;
- revenue.

Backend juga menyediakan:

```http
GET /api/bookings/dashboard/stats
```

Endpoint tersebut hanya untuk `ROLE_ADMIN_APP`.

## 29. Kelola Hotel

Halaman: `/admin/hotels`

### Tampilkan hotel

```text
AdminHotels.jsx
-> GET /api/hotels
-> HotelController
-> HotelServiceImpl.search()
-> HotelRepository
```

Admin Hotel hanya boleh mengelola hotel yang `admin_hotel_id` sama dengan
`userId` dari JWT.

### Tambah hotel

```http
POST /api/hotels
```

```text
AdminHotels.jsx
-> HotelController.create()
-> validasi HotelRequest
-> HotelServiceImpl.create()
-> CityRepository memastikan kota ada
-> jika ROLE_ADMIN_HOTEL:
   admin_hotel_id dipaksa menjadi userId JWT
-> jika ROLE_ADMIN_APP:
   admin_hotel_id dapat dipilih dari request
-> HotelRepository.save()
-> validasi facility_ids ke FacilityRepository
-> sinkronkan fasilitas terpilih ke hotel_facilities
-> simpan gambar bila tersedia
```

### Edit hotel

```http
PUT /api/hotels/{id}
```

```text
HotelServiceImpl.update()
-> HotelRepository.findById()
-> validasi ownership
-> perbarui data
-> HotelRepository.save()
-> jika facility_ids dikirim:
   sinkronkan relasi hotel_facilities
```

### Hapus hotel

```http
DELETE /api/hotels/{id}
```

Service memvalidasi ownership sebelum menghapus hotel dan relasi yang dimiliki.

## 30. Upload Gambar Hotel

Endpoint:

```http
POST /api/hotels/upload-image
```

Alur:

```text
Admin form memilih file
-> multipart/form-data
-> HotelController.uploadImage()
-> validasi akses hotel jika hotelId dikirim
-> FileStorageService.saveHotelImage()
-> validasi kosong, ukuran, dan tipe file
-> nama file dibuat unik
-> simpan pada uploads/hotel-images
-> kembalikan URL publik
-> URL dipakai saat create/update hotel
```

## 31. Kelola Room Type

Halaman: `/admin/hotels/:hotelId/rooms`

### Tampilkan kamar

```http
GET /api/room-types/hotel/{hotelId}
```

```text
AdminRoomTypes.jsx
-> RoomTypeController.getByHotelId()
-> RoomTypeServiceImpl.getByHotelId()
-> RoomTypeRepository
-> RoomTypeImageRepository
```

### Tambah/edit/hapus

```http
POST /api/room-types
PUT /api/room-types/{id}
DELETE /api/room-types/{id}
```

Service:

```text
cek hotel ada
-> jika Admin Hotel, cek hotel miliknya
-> validasi harga, max guest, dan room available
-> validasi facility_ids dari master facilities
-> RoomTypeRepository.save/delete
-> sinkronkan fasilitas khusus kamar ke room_type_facilities
-> kelola gambar room type
```

Setiap tipe kamar menyimpan pilihan fasilitas sendiri. Contohnya Standard dapat
memiliki WiFi dan shower, sedangkan Deluxe dapat memiliki WiFi, AC, shower, dan
area tempat duduk. Fasilitas hotel tidak otomatis disalin ke fasilitas kamar.

Upload gambar kamar:

```http
POST /api/room-types/upload-image
```

## 32. Kelola Booking Admin

Halaman: `/admin/bookings`

### Admin App

```http
GET /api/bookings
```

### Admin Hotel

```text
GET /api/hotels
-> filter hotel milik admin
-> GET /api/bookings/hotel/{hotelId}
-> BookingService memvalidasi admin_hotel_id melalui WebClient ke Hotel Service
```

Frontend juga mengambil detail hotel agar tabel menampilkan nama hotel.

### Update status

```http
PATCH /api/bookings/{id}/status
```

Alur:

```text
AdminBookings.jsx
-> kirim status baru
-> BookingController.updateStatus()
-> BookingServiceImpl.updateStatus()
-> cari booking
-> jika Admin Hotel, cek booking berasal dari hotel miliknya
-> validateStatusTransition()
-> BookingRepository.save()
```

Aturan transisi:

```text
PENDING -> CONFIRMED atau CANCELLED
CONFIRMED -> COMPLETED atau CANCELLED
CANCELLED -> tidak dapat diubah
COMPLETED -> tidak dapat diubah
```

Catatan notifikasi email:

- payment Xendit berhasil memanggil email konfirmasi;
- pembatalan yang dilakukan user melalui endpoint `/cancel` memanggil email
  pembatalan;
- `updateStatus()` yang dilakukan admin saat ini hanya menyimpan status dan
  belum memanggil `EmailNotificationService`. Jadi perubahan admin menjadi
  `CONFIRMED`, `COMPLETED`, atau `CANCELLED` belum otomatis mengirim email dari
  method tersebut.

## 33. Hapus Booking Permanen

Endpoint:

```http
DELETE /api/bookings/{id}
```

Hanya `ROLE_ADMIN_APP`.

```text
BookingController.deleteBooking()
-> BookingServiceImpl.deleteBooking()
-> BookingRepository.findById()
-> BookingRepository.delete()
```

Berbeda dengan cancel, delete menghilangkan record dari database.

## 34. Kelola Admin Hotel

Halaman: `/admin/admin-hotels`

Hanya `ROLE_ADMIN_APP`.

### Tampilkan admin hotel

```http
GET /api/users/admin-hotels
```

```text
UserController.getAdminHotels()
-> UserServiceImpl.getAdminHotels()
-> CustomerRepository.findByRole(ROLE_ADMIN_HOTEL)
```

### Buat akun admin hotel

```http
POST /api/auth/admin-hotels
```

```text
AdminAdminHotels.jsx
-> AuthController.createAdminHotel()
-> AuthServiceImpl.createAdminHotel()
-> cek email
-> hash password
-> role = ROLE_ADMIN_HOTEL
-> verified = true
-> CustomerRepository.save()
```

Admin hotel kemudian dapat dihubungkan ke hotel melalui `admin_hotel_id`.

### Ban/unban admin

```http
PATCH /api/users/{id}/ban
PATCH /api/users/{id}/unban
```

## 35. Kelola Visitor/User

Halaman: `/admin/visitors`

Hanya `ROLE_ADMIN_APP`.

```text
AdminVisitors.jsx
-> GET /api/users
-> UserController.getAllUsers()
-> UserServiceImpl.getAllUsers()
-> CustomerRepository.findAll()
```

Frontend menggabungkan `city_id` dengan daftar kota dari Hotel Service.

Ban/unban mengubah field `Customer.banned`. User yang banned akan ditolak saat
login.

---

# FILE, EXCEL, EMAIL, DAN OPERASIONAL

## 36. Import Hotel dari Excel

Endpoint:

```http
POST /api/hotels/upload-excel
```

Hanya `ROLE_ADMIN_APP`.

```text
AdminHotels/AdminDashboard
-> upload file Excel
-> HotelController.uploadExcel()
-> HotelServiceImpl.uploadExcel()
-> Apache POI membaca workbook dan row
-> validasi kota/hotel
-> simpan hotel, gambar, dan data terkait
```

## 37. Export Semua Hotel

Endpoint:

```http
GET /api/hotels/download-excel
```

Hanya `ROLE_ADMIN_APP`.

```text
AdminHotels.jsx
-> responseType blob
-> HotelController.downloadExcel()
-> HotelServiceImpl.downloadExcel()
-> HotelRepository.findAll()
-> Apache POI membuat workbook
-> controller mengembalikan file data-hotel.xlsx
-> browser mengunduh file
```

## 38. Export Semua Booking

Endpoint:

```http
GET /api/bookings/download-excel
```

Hanya `ROLE_ADMIN_APP`.

```text
AdminBookings.jsx
-> BookingController.downloadExcel()
-> BookingServiceImpl.downloadExcel()
-> BookingRepository.findAll()
-> WebClient ke Hotel Service untuk nama hotel dan room type
-> Apache POI membuat workbook
-> browser mengunduh data-pemesanan.xlsx
```

## 39. Pengiriman Email

### OTP

```text
OtpServiceImpl
-> OtpMailSender @Async
-> JavaMailSender
-> Gmail SMTP
```

### Booking

```text
Booking/Xendit Service
-> EmailNotificationService @Async
-> membuat template HTML
-> JavaMailSender
-> Gmail SMTP
```

Karena asynchronous, kegagalan email dicatat ke log dan tidak selalu
membatalkan transaksi utama.

## 40. Health Check

Setiap backend memiliki:

```http
GET /health
```

Response menunjukkan service hidup:

```json
{
  "status": "UP",
  "service": "booking-service"
}
```

Health check belum memastikan seluruh dependency sehat. Service dapat berstatus
UP tetapi integrasi SMTP atau Xendit masih bisa gagal saat digunakan.

## 41. Error Handling

Alur error:

```text
Controller/Service melempar exception
-> GlobalExceptionHandler
-> response JSON dengan HTTP status yang sesuai
-> Axios menangkap error
-> halaman menampilkan alert/toast
```

Status umum:

| HTTP | Arti |
|---:|---|
| `200` | Berhasil |
| `400` | Request atau validasi salah |
| `401` | Token/callback tidak valid |
| `403` | Login ada tetapi role/ownership tidak sesuai |
| `404` | Data tidak ditemukan |
| `409` | Konflik, misalnya akun belum verified sudah terdaftar |
| `410` | Batas pembayaran lewat |
| `429` | Terlalu cepat meminta OTP ulang |
| `500` | Error internal yang belum ditangani secara spesifik |
| `502` | Layanan eksternal seperti Xendit gagal |
| `503` | Konfigurasi dependency belum tersedia |

## 42. Ringkasan Aliran Antarservice

### Frontend ke User Service

```text
React -> Gateway -> User Controller -> Auth/User Service
-> Customer/Otp Repository -> PostgreSQL
```

### Frontend ke Hotel Service

```text
React -> Gateway -> Hotel/Room/City/Facility Controller
-> Service -> Repository -> PostgreSQL
```

### Frontend ke Booking Service

```text
React -> Gateway -> Booking Controller
-> Booking Service -> Booking Repository -> PostgreSQL
```

### Booking Service ke Hotel Service

Booking Service memakai `WebClient` untuk:

- mengambil detail room type;
- memastikan room type milik hotel yang benar;
- mengambil stok dan harga kamar;
- mengambil daftar room type untuk availability;
- mengambil nama hotel/room type untuk export;
- memvalidasi ownership Admin Hotel.

```text
Booking Service
-> WebClient
-> Hotel Service
-> Hotel/Room Repository
-> PostgreSQL
-> response kembali ke Booking Service
```

### Booking Service ke Xendit

```text
Booking Service -> Xendit create invoice
Xendit -> hosted payment page
Xendit -> webhook -> Booking Service
Booking Service -> PostgreSQL + Gmail
```

## 43. Contoh Singkat Login Sesuai Pola MVC/Service

```text
View:
Login.jsx

HTTP:
POST /api/auth/login

Gateway:
route /api/auth/** ke user-service:8081

Controller:
AuthController.login()

Service:
AuthServiceImpl.login()

Repository:
CustomerRepository.findByEmail()

Database:
SELECT customer berdasarkan email

Service lanjutan:
BCrypt cek password -> cek verified/banned -> generate JWT

Controller:
mengembalikan LoginResponse

View:
simpan token -> ambil profile -> redirect sesuai role
```

Pola tersebut juga digunakan fitur lain, dengan tambahan komponen tertentu:

- OTP menambahkan `OtpService`, `OtpTokenRepository`, dan Gmail;
- booking menambahkan `WebClient` ke Hotel Service;
- payment menambahkan `WebClient` ke Xendit dan webhook;
- upload menambahkan `FileStorageService`;
- Excel menambahkan Apache POI;
- fitur admin menambahkan `@PreAuthorize` dan ownership validation.
