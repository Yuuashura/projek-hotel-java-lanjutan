# 🏨 NgiNep — Hotel Booking Website

> **CLAUDE.md** — Panduan Proyek untuk AI Assistant & Developer

---

## 📌 Ringkasan Proyek

**NgiNep** adalah aplikasi web pemesanan hotel berbasis arsitektur Microservices yang memungkinkan pengguna mencari, memesan, dan membayar hotel secara online, serta memudahkan Admin Hotel dalam mengelola data hotel, pengunjung, dan pemesanan.

---

## 🛠️ Tech Stack

### Backend
| Teknologi | Keterangan |
|---|---|
| Java Spring Boot (Maven) | Framework utama backend |
| Spring Security + JWT | Autentikasi & Autorisasi stateless |
| Spring Cloud Gateway | API Gateway untuk routing microservices |
| Spring Cloud Netflix Eureka | Service Discovery (opsional, disarankan) |
| Spring Scheduler | Scheduled tasks (auto-update status booking, dll.) |
| JavaMailSender + App Password Gmail | OTP via email saat registrasi |
| Spring Data JPA + Hibernate | ORM untuk akses database |

### Frontend
| Teknologi | Keterangan |
|---|---|
| React JS | Framework utama frontend |
| React Router DOM | Routing halaman |
| Axios | HTTP client ke API |
| Context API / Redux Toolkit | State management (JWT token, user session) |
| Tailwind CSS | UI styling dengan gaya desain **Neubrutalism** (Neo-brutalism) |

### Database & Tools
| Teknologi | Keterangan |
|---|---|
| MySQL + XAMPP | Database relasional & local server |
| Antigravity | Tools deployment / tunneling lokal |
| Google Chrome | Browser utama testing |
| Postman | Testing REST API |

---

## 👥 Aktor Sistem

| Aktor | Deskripsi |
|---|---|
| **Admin Aplikasi** | Super admin, mengelola seluruh data pemesanan lintas hotel |
| **Admin Hotel** | Mengelola hotel, pengunjung, dan pemesanan milik hotelnya sendiri |
| **User / Customer** | Melakukan registrasi, pencarian, pemesanan, dan melihat status pembayaran |

---

## 🗂️ Use Case

| No | Use Case | Aktor |
|---|---|---|
| 1 | Login | Admin Hotel, User |
| 2 | Mengelola Data User (CRUD) | Admin Hotel |
| 3 | Mengelola Data Pengunjung (Ban user) | Admin Hotel |
| 4 | Mengelola Data Pemesanan | Admin Hotel, Admin Aplikasi |
| 5 | Informasi Hotel (Browse/Search) | User |
| 6 | Pemesanan Hotel | User |
| 7 | Informasi Pembayaran & Pesanan | User |

> ⚠️ **Saran**: Tambahkan use case **Logout**, **Register**, dan **Ubah Password** agar alur lebih lengkap. Admin Aplikasi sebaiknya juga punya use case **Kelola Admin Hotel** (tambah/hapus admin hotel).

---

## 🗃️ Class Diagram / Entity

### ⚠️ Prinsip Penting: Microservices — Tidak Ada @JoinColumn Lintas Service

Karena arsitektur microservices, **setiap service punya database sendiri**. Konsekuensinya:
- **Tidak boleh** `@ManyToOne @JoinColumn` ke entity milik service lain
- Relasi lintas service cukup simpan **ID saja** (plain `int` atau `Long`)
- Kalau butuh data dari service lain → panggil via **Feign Client** (HTTP)
- Relasi `@ManyToOne @JoinColumn` **hanya boleh** dipakai antar tabel dalam database service yang sama

```
❌ SALAH (lintas service DB):
Hotel Service menyimpan @ManyToOne Customer admin_hotel
→ Hotel DB dan User DB terpisah, join tidak bisa!

✅ BENAR:
Hotel Service menyimpan plain: private int admin_hotel_id
→ Kalau butuh nama admin-nya, panggil User Service via Feign Client
```

---

### Kepemilikan Tabel City

Tabel `City` **dimiliki oleh Hotel Service** (karena paling sering dipakai untuk filter hotel & search). User Service hanya menyimpan `city_id` sebagai plain integer — kalau butuh nama kotanya, panggil Hotel Service.

```
Hotel Service DB          User Service DB
─────────────────         ────────────────
cities       ←──────────── customers.city_id (plain int, bukan FK)
hotels
```

---

### A. City — di dalam Hotel Service DB

```java
@Entity
@Table(name = "cities")
public class City {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id_city;

    @Column(unique = true)
    private String name;        // "Bandung", "Jakarta", "Bali"

    private String province;    // "Jawa Barat", "DKI Jakarta", "Bali"
}
```

> ✅ Di-seed sekali via `data.sql`. Endpoint publik: `GET /api/cities` (dirouting lewat API Gateway).
> Frontend pakai endpoint ini untuk isi dropdown kota di form Register, Profil, tambah Hotel, dan Search.

**Contoh seed data awal:**
```sql
INSERT INTO cities (name, province) VALUES
('Bandung', 'Jawa Barat'),
('Jakarta', 'DKI Jakarta'),
('Surabaya', 'Jawa Timur'),
('Yogyakarta', 'DI Yogyakarta'),
('Bali', 'Bali'),
('Medan', 'Sumatera Utara'),
('Makassar', 'Sulawesi Selatan'),
('Semarang', 'Jawa Tengah'),
('Palembang', 'Sumatera Selatan'),
('Balikpapan', 'Kalimantan Timur');
```

---

### B. Customer — di dalam User Service DB

```java
@Entity
@Table(name = "customers")
public class Customer {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id_customer;

    private String first_name;
    private String last_name;
    private int age;               // Atau LocalDate date_of_birth

    private int city_id;           // ✅ Plain int — ID kota dari Hotel Service
                                   //    BUKAN @JoinColumn, karena beda database

    private String phone;

    @Column(unique = true)
    private String email;

    private String password;       // BCrypt hash

    private boolean is_banned;
    private boolean is_verified;

    @Enumerated(EnumType.STRING)
    private Role role;             // ROLE_USER, ROLE_ADMIN_HOTEL, ROLE_ADMIN_APP

    private String profile_picture;
}
```

> ✅ Saat tampilkan nama kota di halaman Profil:
> User Service panggil `GET /api/cities/{city_id}` ke Hotel Service via Feign Client, lalu gabungkan di response DTO.

---

### C. Hotel — di dalam Hotel Service DB

```java
@Entity
@Table(name = "hotels")
public class Hotel {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id_hotel;

    private String name;

    @ManyToOne
    @JoinColumn(name = "city_id")
    private City city;

    private String address;
    private String type;           // "Bintang 3", "Budget", "Resort"

    @Column(columnDefinition = "TEXT")
    private String description;

    private int admin_hotel_id;    // Plain int — FK ke User Service

    private boolean is_featured;
    private boolean is_on_sale;
    private int discount_percent;
    private float rating;

    // Relasi dalam satu DB — boleh @JoinColumn:
    @OneToMany(mappedBy = "hotel", cascade = CascadeType.ALL)
    private List<HotelImage> images;        // Gambar-gambar hotel

    @OneToMany(mappedBy = "hotel", cascade = CascadeType.ALL)
    private List<HotelFacility> facilities; // Fasilitas hotel

    @OneToMany(mappedBy = "hotel", cascade = CascadeType.ALL)
    private List<RoomType> roomTypes;       // Tipe-tipe kamar
}
```

> ⚠️ **Perubahan penting**: field `price` dan `room_available` **dipindah ke `RoomType`** — karena tiap tipe kamar punya harga dan ketersediaan yang berbeda. Hotel tidak lagi punya harga tunggal.

---

### C1. HotelImage — Gambar Hotel

```java
@Entity
@Table(name = "hotel_images")
public class HotelImage {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id_image;

    @ManyToOne
    @JoinColumn(name = "hotel_id")
    private Hotel hotel;

    private String image_url;      // URL gambar hotel (eksterior, lobi, kolam, dll.)
    private int sort_order;        // Urutan tampil (0 = foto utama)
}
```

---

### C2. Facility — Master Fasilitas (seed data)

```java
@Entity
@Table(name = "facilities")
public class Facility {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id_facility;

    @Column(unique = true)
    private String name;           // "Free WiFi", "AC", "Shower", "Area Tempat Duduk", dll.
    private String icon;           // Nama icon (misal: "wifi", "snowflake", "shower")
}
```

**Contoh seed data fasilitas:**
```sql
INSERT INTO facilities (name, icon) VALUES
('Free WiFi', 'wifi'),
('AC', 'snowflake'),
('Shower', 'shower'),
('Area Tempat Duduk', 'armchair'),
('Kolam Renang', 'pool'),
('Parkir Gratis', 'car'),
('Sarapan Termasuk', 'coffee'),
('Lift', 'elevator'),
('Restoran', 'utensils'),
('Laundry', 'washing-machine');
```

---

### C3. HotelFacility — Fasilitas yang Dimiliki Hotel (Junction Table)

```java
@Entity
@Table(name = "hotel_facilities")
public class HotelFacility {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @ManyToOne
    @JoinColumn(name = "hotel_id")
    private Hotel hotel;

    @ManyToOne
    @JoinColumn(name = "facility_id")
    private Facility facility;
}
```

---

### C4. RoomType — Tipe Kamar per Hotel

```java
@Entity
@Table(name = "room_types")
public class RoomType {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id_room_type;

    @ManyToOne
    @JoinColumn(name = "hotel_id")
    private Hotel hotel;

    private String name;              // "Standard Room", "Deluxe Room", "Suite", dll.
    private Long price_per_night;     // Harga per malam tipe kamar ini
    private int room_available;       // Jumlah kamar tipe ini yang tersedia
    private int max_guest;            // Kapasitas tamu maksimal per kamar
    private boolean is_smoking;       // true = Smoking Room, false = No Smoking Room

    @Column(columnDefinition = "TEXT")
    private String description;

    // Relasi ke gambar kamar:
    @OneToMany(mappedBy = "roomType", cascade = CascadeType.ALL)
    private List<RoomTypeImage> images;

    // Relasi ke fasilitas khusus kamar:
    @OneToMany(mappedBy = "roomType", cascade = CascadeType.ALL)
    private List<RoomTypeFacility> facilities;
}
```

---

### C5. RoomTypeImage — Gambar per Tipe Kamar

```java
@Entity
@Table(name = "room_type_images")
public class RoomTypeImage {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id_image;

    @ManyToOne
    @JoinColumn(name = "room_type_id")
    private RoomType roomType;

    private String image_url;
    private int sort_order;        // 0 = foto utama tipe kamar
}
```

---

### C6. RoomTypeFacility — Fasilitas per Tipe Kamar (Junction Table)

```java
@Entity
@Table(name = "room_type_facilities")
public class RoomTypeFacility {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @ManyToOne
    @JoinColumn(name = "room_type_id")
    private RoomType roomType;

    @ManyToOne
    @JoinColumn(name = "facility_id")
    private Facility facility;       // Pakai tabel Facility yang sama
}
```

> ✅ Tabel `facilities` dipakai bersama oleh Hotel (fasilitas umum) dan RoomType (fasilitas khusus kamar) — tidak perlu buat tabel fasilitas terpisah.

---

### Perubahan pada Booking — tambah room_type_id

Karena sekarang user memesan **tipe kamar tertentu**, bukan hanya hotel secara umum, entity Booking perlu ditambah `room_type_id`:

```java
// Tambahan di Booking entity:
private int room_type_id;    // Plain int — tipe kamar yang dipesan (dari Hotel Service)
```

> ✅ Saat Booking Service butuh info harga kamar untuk verifikasi `total_price`, panggil `GET /api/room-types/{room_type_id}` ke Hotel Service via Feign Client.

---

### Ringkasan Tabel Hotel Service DB

```
Hotel Service DB
├── cities
├── hotels
├── hotel_images          (gambar eksterior/interior hotel)
├── facilities            (master: WiFi, AC, Shower, dll.) ← seed data
├── hotel_facilities      (junction: hotel ↔ facility)
├── room_types            (Standard, Deluxe, Suite, dll. — punya harga & stok sendiri)
├── room_type_images      (gambar per tipe kamar)
└── room_type_facilities  (junction: room_type ↔ facility)
```

**Diagram relasi:**
```
hotels ──< hotel_images
hotels ──< hotel_facilities >── facilities
hotels ──< room_types ──< room_type_images
                     └──< room_type_facilities >── facilities
```

---

### D. Booking — di dalam Booking Service DB

```java
@Entity
@Table(name = "bookings")
public class Booking {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id_booking;

    // Referensi ke service lain (plain int, bukan @JoinColumn):
    private int customer_id;       // User yang login & melakukan pemesanan
    private int hotel_id;          // Hotel yang dipesan
    private int room_type_id;      // Tipe kamar yang dipesan

    // Detail menginap:
    private LocalDate check_in;
    private LocalDate check_out;
    private int number_of_guest;
    private Long total_price;      // (check_out - check_in) × room_type.price_per_night

    // ✅ Data pemesan — bisa beda dengan customer yang login:
    private String orderer_name;   // Nama pemesan
    private String orderer_phone;  // No. HP pemesan
    private String orderer_email;  // Email pemesan
    private boolean is_for_self;   // true = pesan untuk diri sendiri, false = untuk orang lain

    // Status & pembayaran:
    @Enumerated(EnumType.STRING)
    private BookingStatus status;  // PENDING, CONFIRMED, CANCELLED, COMPLETED

    private String payment_method; // "Transfer BCA", "Transfer BRI", "QRIS", dll.
    private String payment_proof;  // URL bukti pembayaran yang diupload user

    private LocalDateTime created_at;
    private LocalDateTime payment_deadline; // created_at + 24 jam, untuk auto-cancel
}
```

> ✅ **Kenapa data pemesan disimpan langsung di Booking (bukan hanya `customer_id`)?**
> Karena user bisa memesan untuk orang lain — nama, HP, dan email pemesan bisa berbeda dengan data akun yang login. Menyimpannya langsung di Booking juga memastikan data tetap akurat meski user mengubah profilnya di kemudian hari.

> ✅ `payment_deadline = created_at + 24 jam` — Spring Scheduler cek tiap menit/jam, auto-cancel jika sudah lewat deadline dan status masih `PENDING`.

---

### Flow Halaman Pemesanan → Pembayaran

#### Halaman 1: Form Pemesanan (`/booking/:hotelId?roomTypeId=...&checkIn=...&checkOut=...`)

```
Dibagi 2 kolom:

KIRI — Form Data Pemesan:               KANAN — Ringkasan Pesanan:
┌─────────────────────────────┐         ┌──────────────────────────────┐
│ ☑ Pesan untuk saya sendiri  │         │ [Foto kamar]                 │
│ ○ Pesan untuk orang lain    │         │ Nama Hotel                   │
│                             │         │ Tipe Kamar: Deluxe Room      │
│ Nama Pemesan *              │         │ ──────────────────────────── │
│ [Auto-fill jika untuk saya] │         │ 📅 Check-in : Sab, 1 Jun     │
│                             │         │ 📅 Check-out: Sen, 3 Jun     │
│ No. HP Pemesan *            │         │ 🌙 Durasi   : 2 malam        │
│ [Auto-fill jika untuk saya] │         │ 👤 Tamu     : 2 orang        │
│                             │         │ ──────────────────────────── │
│ Email Pemesan *             │         │ Harga/malam : Rp 500.000     │
│ [Auto-fill jika untuk saya] │         │ × 2 malam   : Rp 1.000.000  │
│                             │         │ ──────────────────────────── │
│ Jumlah Tamu *               │         │ TOTAL       : Rp 1.000.000  │
│ [Number stepper]            │         │                              │
│                             │         │ [Lanjut ke Pembayaran →]     │
└─────────────────────────────┘         └──────────────────────────────┘
```

**Logika checkbox "Pesan untuk saya":**
- Default: **tercentang** → field nama, HP, email langsung auto-fill dari data profil user
- Jika **dicentang "Pesan untuk orang lain"** → field dikosongkan & bisa diedit manual
- Submit → `POST /api/bookings` → dapat `id_booking` → redirect ke `/payment/:id_booking`

---

#### Halaman 2: Pembayaran (`/payment/:id_booking`)

```
┌──────────────────────────────────────────────────────────┐
│  Ringkasan Pesanan (read-only, tidak bisa diubah lagi)   │
│  Hotel, Tipe Kamar, Tanggal, Total Harga                 │
│  Pemesan: [nama] · [HP] · [email]                        │
├──────────────────────────────────────────────────────────┤
│  Pilih Metode Pembayaran:                                │
│                                                          │
│  ○ Transfer Bank BCA   → No. Rek: 1234567890            │
│  ○ Transfer Bank BRI   → No. Rek: 0987654321            │
│  ○ Transfer Bank BNI   → No. Rek: 1122334455            │
│  ○ QRIS               → [tampilkan QR Code]             │
│                                                          │
├──────────────────────────────────────────────────────────┤
│  Upload Bukti Pembayaran:                                │
│  [Drag & drop atau klik untuk upload gambar]             │
│                                                          │
│  ⏳ Batas waktu bayar: 23:45:12 (countdown)              │
│                                                          │
│  [Konfirmasi Pembayaran]                                 │
└──────────────────────────────────────────────────────────┘
```

**Aksi "Konfirmasi Pembayaran":**
- Validasi: metode bayar dipilih + bukti diupload
- `PATCH /api/bookings/:id_booking/pay` → simpan `payment_method` + `payment_proof` (URL gambar)
- Status tetap `PENDING` — menunggu Admin Hotel verifikasi
- Redirect ke `/my-bookings` dengan notif: *"Pembayaran berhasil dikirim, menunggu konfirmasi admin"*

> ⚠️ **Saran**: Tampilkan halaman `/payment/:id_booking` hanya jika status booking masih `PENDING`. Jika sudah `CONFIRMED`/`CANCELLED` → redirect ke `/my-bookings`.

---

### Ringkasan Aturan @JoinColumn di Microservices

| Relasi | Boleh @JoinColumn? | Alasan |
|---|---|---|
| Hotel → City | ✅ Ya | Satu database (Hotel Service) |
| Hotel → Customer (admin) | ❌ Tidak | Beda database (Hotel DB vs User DB) |
| Booking → Customer | ❌ Tidak | Beda database (Booking DB vs User DB) |
| Booking → Hotel | ❌ Tidak | Beda database (Booking DB vs Hotel DB) |

**Aturan singkat**: `@JoinColumn` hanya untuk relasi antar tabel **dalam service yang sama**. Relasi ke service lain → simpan plain ID, ambil data via Feign Client.

---

### C. Pemesanan (Booking)

```java
@Entity
@Table(name = "bookings")
public class Booking {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id_booking;        // PK, Auto Increment

    private String check_in;       // ✅ Sebaiknya LocalDate
    private String check_out;      // ✅ Sebaiknya LocalDate
    private int number_of_guest;
    private Long total_price;      // ✅ Sebaiknya Long atau BigDecimal

    @ManyToOne
    @JoinColumn(name = "customer_id")
    private Customer customer;     // FK ke Customer

    @ManyToOne
    @JoinColumn(name = "hotel_id")
    private Hotel hotel;           // FK ke Hotel

    // ✅ TAMBAHAN YANG SANGAT DISARANKAN:
    @Enumerated(EnumType.STRING)
    private BookingStatus status;  // PENDING, CONFIRMED, CANCELLED, COMPLETED

    private LocalDateTime created_at;
    private String payment_method; // Transfer, OVO, dll.
    private String payment_proof;  // URL bukti pembayaran (opsional)
}
```

> ⚠️ **Saran Entity Booking**:
> - Field `check_in` dan `check_out` sangat disarankan menggunakan tipe `LocalDate` bukan `String` agar bisa dihitung selisih hari (untuk `total_price = jumlah_hari × harga_hotel`).
> - `total_price` ubah dari `String` ke `Long` atau `BigDecimal`.
> - Tambahkan `status` (enum: PENDING → CONFIRMED → COMPLETED / CANCELLED) untuk flow pemesanan yang jelas.
> - Tambahkan `created_at` untuk sorting dan audit.
> - **Spring Scheduler** bisa digunakan untuk auto-cancel booking yang statusnya masih PENDING setelah X jam tanpa konfirmasi pembayaran.

---

### D. OTP (Tabel Tambahan)

```java
@Entity
@Table(name = "otp_tokens")
public class OtpToken {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    private String email;
    private String otp_code;       // 6 digit angka acak
    private LocalDateTime expired_at; // Expired dalam 5–10 menit
    private boolean is_used;
}
```

> ✅ Tabel OTP terpisah lebih aman dan mudah di-expire / dihapus dengan **Spring Scheduler**.

---

## 🏗️ Arsitektur Microservices

```
[React Frontend]
       │
       ▼
[API Gateway - Spring Cloud Gateway : 8080]
       │
       ├──► [User Service      : 8081]  → DB: ngninep_user
       ├──► [Hotel Service     : 8082]  → DB: ngninep_hotel
       └──► [Booking Service   : 8083]  → DB: ngninep_booking
                                            (bisa shared DB atau terpisah)
```

### Pembagian Tanggung Jawab Service

| Service | Endpoint Utama | Tanggung Jawab |
|---|---|---|
| **User Service** | `/api/auth/**`, `/api/users/**` | Register, Login, OTP, JWT, Kelola User |
| **Hotel Service** | `/api/hotels/**` | CRUD Hotel, Search Hotel |
| **Booking Service** | `/api/bookings/**` | Pemesanan, Status, Payment Info |

> ⚠️ **Saran Microservices**:
> - Tambahkan **Eureka Service Discovery** agar API Gateway tidak perlu hardcode URL tiap service.
> - Komunikasi antar-service (misal Booking butuh info Hotel) bisa pakai **Feign Client** (synchronous) atau **RabbitMQ/Kafka** (asynchronous, lebih advanced).
> - Pertimbangkan satu database shared vs database terpisah per service — untuk skala belajar/kampus, **satu MySQL instance dengan schema terpisah** sudah cukup.

---

## 🔐 Sistem Keamanan

### JWT (JSON Web Token)

- **Stateless**: Token disimpan di sisi client (localStorage / HttpOnly Cookie)
- Setiap request ke API wajib menyertakan header: `Authorization: Bearer <token>`
- Payload JWT berisi: `userId`, `email`, `role`, `exp` (expiry)
- Token **Access Token** expire: 15–60 menit
- ✅ **Disarankan**: Tambahkan **Refresh Token** (expire: 7 hari, disimpan di DB / Redis) agar user tidak sering logout

### OTP Registrasi via Gmail

#### ⚙️ Aturan OTP (Wajib Diikuti)
| Aturan | Detail |
|---|---|
| Masa berlaku | **5 menit** sejak dikirim (`expired_at = now + 5 menit`) |
| Penggunaan | **Hanya 1x** — setelah dipakai, `is_used = true` |
| Rate limit kirim | **1x per 5 menit** per email — tidak bisa minta OTP baru sebelum 5 menit berlalu |
| Cleanup | Spring Scheduler hapus OTP expired tiap 1 jam |
| Penyimpanan | Tabel `otp_tokens` terpisah, **bukan** di field Customer |

---

#### 🔄 Flow Registrasi Lengkap (Termasuk Edge Case)

```
User isi form Register (email, password, nama, dll.)
       │
       ▼
POST /api/auth/register
       │
       ├─── ❌ Email sudah ada & is_verified = TRUE
       │         → Response: 400 "Email sudah terdaftar"
       │         → Frontend: tampilkan pesan error biasa
       │
       ├─── ⚠️  Email sudah ada & is_verified = FALSE  ← EDGE CASE PENTING
       │         → Response: 409 "UNVERIFIED_ACCOUNT" + {email}
       │         → Frontend: JANGAN tampilkan error biasa
       │         → Tampilkan modal/notif:
       │              "Akun dengan email ini belum diverifikasi.
       │               Lanjutkan verifikasi atau kirim ulang OTP?"
       │         → Tombol "Kirim Ulang OTP" → POST /api/auth/resend-otp
       │         → Redirect ke /verify-otp?email=xxx
       │
       └─── ✅ Email belum ada
                 → Simpan user (is_verified = false)
                 → Generate OTP 6 digit acak
                 → Simpan ke tabel otp_tokens (expired_at = now + 5 menit)
                 → Kirim OTP ke Gmail
                 → Simpan email di sessionStorage frontend
                 → Redirect ke /verify-otp
```

---

#### 🔄 Flow Halaman Verify OTP (`/verify-otp`)

```
Halaman /verify-otp dibuka
       │
       ▼
Ambil email dari sessionStorage
       │
       ├─── ❌ Tidak ada email di sessionStorage
       │         → Redirect ke /register (user tidak bisa akses langsung)
       │
       └─── ✅ Ada email
                 → Tampilkan form input 6 digit OTP
                 → Tampilkan countdown timer 5 menit
                 → Tampilkan tombol "Kirim Ulang OTP" (disabled sampai timer habis)
                        │
                        ▼
                 User submit OTP → POST /api/auth/verify-otp {email, otp_code}
                        │
                        ├─── ❌ OTP salah
                        │         → Response: 400 "Kode OTP tidak valid"
                        │         → Tampilkan pesan error, form tetap terbuka
                        │
                        ├─── ❌ OTP sudah expired (> 5 menit)
                        │         → Response: 410 "Kode OTP sudah kadaluarsa"
                        │         → Tampilkan tombol "Kirim Ulang OTP" aktif
                        │
                        ├─── ❌ OTP sudah dipakai (is_used = true)
                        │         → Response: 400 "Kode OTP sudah digunakan"
                        │         → Tampilkan tombol "Kirim Ulang OTP" aktif
                        │
                        └─── ✅ OTP valid, belum expired, belum dipakai
                                  → Set is_used = true
                                  → Set customer.is_verified = true
                                  → Hapus sessionStorage email
                                  → Response: 200 "Verifikasi berhasil"
                                  → Redirect ke /login dengan notif sukses
```

---

#### 🔄 Flow Resend OTP (`POST /api/auth/resend-otp`)

```
Request: { email }
       │
       ├─── ❌ Email tidak ditemukan di DB
       │         → Response: 404 "Akun tidak ditemukan"
       │
       ├─── ❌ Akun sudah verified
       │         → Response: 400 "Akun sudah terverifikasi, silakan login"
       │
       ├─── ❌ OTP sebelumnya masih aktif (belum 5 menit dari created_at)
       │         → Response: 429 "Mohon tunggu X detik sebelum meminta OTP baru"
       │         → Frontend: tampilkan sisa waktu countdown
       │
       └─── ✅ Boleh kirim OTP baru
                 → Tandai semua OTP lama email ini: is_used = true (invalidate)
                 → Generate OTP baru
                 → Simpan ke otp_tokens (expired_at = now + 5 menit)
                 → Kirim ke Gmail
                 → Response: 200 "OTP baru telah dikirim"
                 → Frontend: reset countdown timer 5 menit
```

---

#### 🔄 Flow Login — Deteksi Akun Belum Verified

```
POST /api/auth/login {email, password}
       │
       ├─── ❌ Password salah
       │         → Response: 401 "Email atau password salah"
       │
       ├─── ❌ Akun di-banned
       │         → Response: 403 "Akun Anda telah dinonaktifkan"
       │
       ├─── ⚠️  is_verified = FALSE  ← TANGANI JUGA DI LOGIN
       │         → Response: 403 "UNVERIFIED_ACCOUNT" + {email}
       │         → Frontend: tampilkan notif:
       │              "Akun belum diverifikasi. Kirim ulang OTP?"
       │         → Tombol "Kirim Ulang OTP" → resend-otp → /verify-otp
       │
       └─── ✅ Valid & verified
                 → Generate JWT → return token → redirect sesuai role
```

---

#### 📦 Struktur Tabel `otp_tokens`

```java
@Entity
@Table(name = "otp_tokens")
public class OtpToken {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    private String email;          // Email tujuan OTP
    private String otp_code;       // 6 digit angka acak
    private LocalDateTime created_at;   // Untuk rate limit (cek < 5 menit)
    private LocalDateTime expired_at;   // created_at + 5 menit
    private boolean is_used;            // true jika sudah dipakai / diinvalidate
}
```

#### 🕐 Spring Scheduler — Cleanup OTP
```java
@Scheduled(fixedRate = 3600000) // Setiap 1 jam
public void cleanExpiredOtp() {
    otpRepository.deleteByExpiredAtBeforeAndIsUsedFalse(LocalDateTime.now());
    // Atau bisa juga hapus semua yang expired > 1 jam lalu
}
```

### Role-Based Access Control (RBAC)

| Endpoint | ROLE_USER | ROLE_ADMIN_HOTEL | ROLE_ADMIN_APP |
|---|---|---|---|
| `GET /api/hotels` | ✅ | ✅ | ✅ |
| `POST /api/hotels` | ❌ | ✅ | ✅ |
| `GET /api/bookings/my` | ✅ | ❌ | ❌ |
| `GET /api/bookings/all` | ❌ | ✅ | ✅ |
| `DELETE /api/users/{id}` | ❌ | ❌ | ✅ |

---

## 📄 Halaman Frontend (React)

### Halaman Publik (Tanpa Login)
| Halaman | Route | Deskripsi |
|---|---|---|
| **Login** | `/login` | Form login email + password |
| **Register** | `/register` | Form register + verifikasi OTP email |
| **OTP Verification** | `/verify-otp` | Input 6 digit OTP dari email |
| **Home** | `/` | Landing page: banner slider rekomendasi, search bar, hotel diskon, FAQ, footer |

#### Detail Halaman Home (`/`)

**1. Navbar**
- Logo + nama NgiNep di kiri
- Menu navigasi: Beranda, Hotel, Promo
- Tombol Masuk & Daftar di kanan (hilang & diganti avatar jika sudah login)

**2. Banner Slider (Hero)**
- Berganti otomatis setiap **3–4 detik** (auto-play)
- Bisa diklik kiri/kanan manual (arrow button)
- Dot indicator di bawah banner
- Berhenti auto-play saat kursor hover
- Konten tiap slide: nama hotel, kota, deskripsi singkat, harga mulai, tombol "Lihat Hotel"
- Data banner dikelola oleh Admin (bisa hardcode dulu atau ambil dari endpoint `GET /api/hotels/featured`)
- ✅ **Saran**: tambahkan field `is_featured` (boolean) di entity Hotel agar Admin bisa tandai hotel yang tampil di banner

**3. Search Bar** (sama seperti halaman `/search`)
- Mengambang di bawah banner, selalu terlihat
- Field: Kota/Hotel, Check-in, Check-out, Jumlah Tamu, tombol Cari
- Submit → redirect ke `/search?city=...&checkIn=...&checkOut=...&guests=...`

**4. Hotel Sedang Diskon**
- Grid 3 kolom kartu hotel
- Badge persentase diskon merah di pojok gambar
- Tampilkan harga coret (harga asli) & harga setelah diskon
- Badge "Terbatas!" jika `room_available <= 3`
- Tombol "Lihat semua" → ke `/search?diskon=true`
- ✅ **Saran**: tambahkan field `discount_percent` (int, 0–100) & `is_on_sale` (boolean) di entity Hotel
- Data: `GET /api/hotels/on-sale`

**5. FAQ (Accordion)**
- Klik pertanyaan → jawaban expand/collapse dengan animasi
- Pertanyaan default yang disarankan:
  1. Bagaimana cara memesan hotel di NgiNep?
  2. Metode pembayaran apa saja yang tersedia?
  3. Apakah saya bisa membatalkan pemesanan?
  4. Berapa lama verifikasi pembayaran?
  5. Apakah data pribadi saya aman?
- Konten FAQ bisa hardcode di frontend (tidak perlu endpoint khusus untuk MVP)

**6. Footer**
- 4 kolom: Brand + sosmed, Layanan, Perusahaan, Bantuan
- Email support: `support@ngninep.id`
- Copyright & badge keamanan transaksi
- Link: Kebijakan Privasi, Syarat & Ketentuan
| **Search** | `/search?city=...&checkIn=...&checkOut=...&guests=...` | Hasil pencarian hotel yang tersedia sesuai tanggal & tamu |
| **Detail Hotel** | `/hotel/:id` | Info lengkap hotel + tombol Pesan |

#### Detail Fitur Search (Traveloka-style)

**Komponen Search Bar** (muncul di Home & Search):
| Field | Tipe Input | Keterangan |
|---|---|---|
| 📍 Kota / Nama Hotel | Text input + dropdown suggestion | Filter berdasarkan `city` atau `name` |
| 📅 Check-in | Date Picker | Tidak boleh memilih tanggal lampau |
| 📅 Check-out | Date Picker | Minimal H+1 dari check-in |
| 👤 Tamu | Number stepper (min 1) | Filter `room_available >= jumlah tamu` |

**Query Parameter URL hasil search:**
```
/search?city=Bandung&checkIn=2025-06-01&checkOut=2025-06-03&guests=2
```

**Logika Backend — Cek Ketersediaan Hotel:**
```
GET /api/hotels/search?city=Bandung&checkIn=2025-06-01&checkOut=2025-06-03&guests=2

Hotel dianggap TERSEDIA jika:
  1. hotel.city LIKE '%Bandung%' (atau nama hotel mengandung keyword)
  2. hotel.room_available > 0
  3. TIDAK ada booking yang bentrok dengan tanggal yang dipilih

Logika bentrok tanggal (overlap):
  Booking bentrok jika: booking.check_in < checkOut AND booking.check_out > checkIn
  → Hotel TIDAK tersedia jika ada booking CONFIRMED/PENDING yang overlap
```

**Query JPA di Booking Repository:**
```java
// Cari hotel yang punya booking bentrok di tanggal tersebut
@Query("""
    SELECT DISTINCT b.hotel.id FROM Booking b
    WHERE b.status IN ('PENDING', 'CONFIRMED')
    AND b.checkIn < :checkOut
    AND b.checkOut > :checkIn
""")
List<Integer> findUnavailableHotelIds(
    @Param("checkIn") LocalDate checkIn,
    @Param("checkOut") LocalDate checkOut
);

// Lalu di Hotel Service, filter hotel yang id-nya TIDAK ada di list tersebut
// + filter city + filter room_available >= guests
```

**Tampilan Hasil Search:**
- Kartu hotel: foto, nama, kota, tipe, harga/malam, sisa kamar, tombol "Pesan"
- Filter samping (sidebar): range harga, tipe hotel, rating bintang
- Sorting: Harga terendah, Rating tertinggi, Terbaru
- Jika tidak ada hasil → tampilkan ilustrasi "Hotel tidak tersedia di tanggal ini"

**Alur Frontend Search:**
```
User isi search bar (kota + check-in + check-out + tamu)
→ Klik "Cari"
→ Redirect ke /search?city=...&checkIn=...&checkOut=...&guests=...
→ Frontend baca query params dari URL
→ GET /api/hotels/search?...
→ Tampilkan hasil kartu hotel
→ User klik "Pesan" → redirect ke /booking/:hotelId
   (check-in & check-out otomatis terisi dari query params)
```

> ✅ **Keuntungan pakai query params di URL**: User bisa share link pencarian, bisa back/forward browser, dan halaman bisa di-refresh tanpa kehilangan hasil pencarian.

### Halaman User (Login Required)
| Halaman | Route | Deskripsi |
|---|---|---|
| **Pemesanan Hotel** | `/booking/:hotelId` | Form check-in, check-out, jumlah tamu |
| **Informasi Pembayaran** | `/payment/:bookingId` | Detail tagihan + instruksi bayar |
| **Pesanan & Riwayat** | `/my-bookings` | Tab "Pesanan Aktif" (PENDING/CONFIRMED) & "Riwayat" (COMPLETED/CANCELLED) |
| **Profil User** | `/profile` | Lihat & edit data diri, ganti password |

#### Detail Halaman Pesanan & Riwayat (`/my-bookings`)

Satu halaman dengan **2 tab** — data dari endpoint yang sama, dibedakan filter status:

| Tab | Filter Status | Endpoint |
|---|---|---|
| **Pesanan Aktif** | `PENDING`, `CONFIRMED` | `GET /api/bookings/my?status=active` |
| **Riwayat Pesanan** | `COMPLETED`, `CANCELLED` | `GET /api/bookings/my?status=history` |

**Tab Pesanan Aktif — tiap kartu menampilkan:**
- Nama hotel, kota, tanggal check-in & check-out, jumlah tamu
- Status badge: `PENDING` (kuning) / `CONFIRMED` (hijau)
- Total harga & metode bayar
- Jika `PENDING`: tombol **"Bayar Sekarang"** → redirect ke `/payment/:bookingId` + countdown batas bayar
- Jika `CONFIRMED`: tombol **"Lihat Detail"**
- Tombol **"Batalkan"** (hanya muncul jika status masih `PENDING`)

**Tab Riwayat Pesanan — tiap kartu menampilkan:**
- Nama hotel, kota, tanggal menginap, total harga
- Status badge: `COMPLETED` (abu-abu hijau) / `CANCELLED` (abu-abu merah)
- Tombol **"Lihat Detail"**
- Jika `COMPLETED`: tombol **"Pesan Lagi"** → redirect ke `/hotel/:id`

> ✅ **Endpoint backend**: `GET /api/bookings/my` — Booking Service ambil `customer_id` dari JWT token (bukan dari request param), lalu filter berdasarkan query param `status=active` atau `status=history`.
Halaman profil dibagi menjadi beberapa tab/section:

| Section | Konten | Aksi |
|---|---|---|
| **Info Pribadi** | first_name, last_name, age/date_of_birth, phone, address | Edit & Simpan |
| **Akun** | Email (read-only), status verifikasi | — |
| **Ganti Password** | Password lama, password baru, konfirmasi password baru | Submit |
| **Foto Profil** | Avatar/foto user (opsional) | Upload gambar |

> ✅ **Catatan implementasi Profil**:
> - Email **tidak bisa diubah** (digunakan sebagai identitas akun & OTP).
> - Ganti password wajib verifikasi **password lama** sebelum set password baru.
> - Jika tambah foto profil, simpan URL-nya di field `profile_picture` (String) di entity Customer.
> - Endpoint: `GET /api/users/me` (lihat profil sendiri), `PUT /api/users/me` (update profil), `PUT /api/users/me/change-password` (ganti password).
> - Gunakan JWT untuk identifikasi user yang sedang login — **jangan pakai `id` dari request body**, tapi ambil dari token.

### Halaman Admin (Admin Hotel)
| Halaman | Route | Deskripsi |
|---|---|---|
| **Dashboard Admin** | `/admin/dashboard` | Statistik: hotel, pengunjung, booking, pemasukan |
| **Hotel Admin** | `/admin/hotels` | CRUD Hotel dengan popup form |
| **Visitor Admin** | `/admin/visitors` | Daftar User (non-admin), aksi Ban |
| **Booking Admin** | `/admin/bookings` | Kelola semua pemesanan, update status |

> ✅ Semua halaman admin menggunakan **Sidebar Navbar** di kiri dengan menu: Dashboard, Hotel, Visitor, Booking.

---

## 🔄 Flow Aplikasi Lengkap

### Flow Registrasi User
```
Register Form → POST /api/auth/register
→ Cek email:
   - Sudah ada & verified     → 400 "Email sudah terdaftar"
   - Sudah ada & BELUM verified → 409 UNVERIFIED_ACCOUNT
                                   → Frontend tampilkan opsi "Kirim Ulang OTP"
                                   → POST /api/auth/resend-otp
                                   → Redirect /verify-otp?email=xxx
   - Belum ada                → Simpan user (is_verified=false)
                                   → Generate & kirim OTP ke Gmail
                                   → Simpan email di sessionStorage
                                   → Redirect /verify-otp
→ User input OTP (ada countdown timer 5 menit)
→ POST /api/auth/verify-otp
→ is_verified=true → Redirect /login
```

### Flow Login
```
Login Form → POST /api/auth/login
→ Validasi email + password (BCrypt)
→ Cek is_verified & is_banned
→ Generate JWT (Access Token + Refresh Token)
→ Return token ke frontend
→ Simpan token di localStorage/Cookie
→ Redirect sesuai Role (User → Home, Admin Hotel → /admin/dashboard)
```

### Flow Pemesanan
```
User pilih hotel → Isi form booking (check_in, check_out, guests)
→ POST /api/bookings
→ Hitung total_price = (check_out - check_in) × hotel.price
→ Kurangi room_available hotel
→ Status booking: PENDING
→ Tampilkan halaman Informasi Pembayaran
→ [Manual/otomatis] Admin konfirmasi → Status: CONFIRMED
→ Spring Scheduler auto-cancel jika 24 jam masih PENDING
```

---

## ⚙️ Spring Boot Systems yang Digunakan

| System | Kegunaan dalam NgiNep |
|---|---|
| **JWT** | Autentikasi stateless untuk semua role |
| **OTP via Gmail** | Verifikasi email saat registrasi |
| **Spring Scheduler** | Auto-cancel booking PENDING, hapus OTP expired |
| **Microservices** | Pisah domain: User, Hotel, Booking |
| **API Gateway** | Single entry point, routing + JWT filter global |
| **Spring Security** | RBAC, filter JWT, enkripsi password BCrypt |
| **Feign Client** | Komunikasi antar-service (Booking ↔ Hotel) |
| **Spring Validation** | Validasi input request body (`@Valid`) |
| **CORS Config** | Izinkan request dari React frontend |

---

## 📁 Struktur Folder yang Disarankan

### Backend (Per Service)
```
user-service/
├── src/main/java/com/ngninep/user/
│   ├── config/          # SecurityConfig, JwtConfig, MailConfig
│   ├── controller/      # AuthController, UserController
│   ├── service/         # AuthService, OtpService, UserService
│   ├── repository/      # CustomerRepository, OtpRepository
│   ├── entity/          # Customer, OtpToken
│   ├── dto/             # RegisterRequest, LoginRequest, LoginResponse
│   ├── security/        # JwtUtil, JwtFilter
│   └── scheduler/       # OtpCleanupScheduler
└── src/main/resources/
    └── application.yml
```

### Frontend (React)
```
src/
├── pages/
│   ├── public/          # Home, Login, Register, Search, HotelDetail
│   ├── user/            # Booking, Payment, MyBookings
│   └── admin/           # Dashboard, HotelAdmin, VisitorAdmin, BookingAdmin
├── components/
│   ├── common/          # Navbar, Footer, Modal, Button
│   └── admin/           # Sidebar, StatCard, DataTable
├── context/             # AuthContext (JWT, user state)
├── services/            # api.js (Axios instance + interceptor)
└── utils/               # formatCurrency, formatDate
```

---

## 🚨 Catatan Penting & Saran Ambigu

### 1. Siapa yang bisa Register?
> ❓ **Ambigu**: Apakah Admin Hotel bisa self-register atau dibuat oleh Admin Aplikasi?
> **Saran**: User biasa bisa self-register via OTP. Admin Hotel dibuat oleh Admin Aplikasi (tidak ada form register untuk Admin Hotel).

### 2. Booking — Siapa yang Konfirmasi Pembayaran?
> ❓ **Ambigu**: Pembayaran manual (transfer) atau otomatis (payment gateway)?
> **Saran**: Untuk MVP, gunakan pembayaran manual — User upload bukti bayar, Admin Hotel konfirmasi. Tambahkan field `payment_proof` (URL gambar) di tabel Booking.

### 3. Admin Hotel Mana yang Bisa Lihat Booking Apa?
> ❓ **Ambigu**: Admin Hotel harus hanya bisa lihat booking untuk hotel-nya sendiri.
> **Saran**: Filter booking berdasarkan `hotel.admin_hotel_id == current_user.id` di backend.

### 4. room_available — Kapan Berkurang/Bertambah?
> **Saran**:
> - Berkurang saat booking di-CONFIRM (bukan saat PENDING)
> - Bertambah lagi saat booking di-CANCEL
> - **Spring Scheduler** auto-tambah kembali saat `check_out` sudah lewat

### 5. OTP — Apakah untuk Login juga atau hanya Register?
> **Saran**: OTP hanya untuk verifikasi email saat **Register** saja (lebih simpel). Login cukup dengan email + password + JWT. Jika ingin 2FA saat login, tambahkan sebagai fitur fase 2.

### 6. Admin Aplikasi — Halaman apa saja?
> ❓ **Belum didefinisikan** halaman untuk Admin Aplikasi.
> **Saran**: Buat halaman `/superadmin/bookings` (kelola semua booking lintas hotel) dan `/superadmin/admins` (kelola akun Admin Hotel).

---

## 🗄️ Setup Database Awal (MySQL via XAMPP)

```sql
CREATE DATABASE ngninep_user;
CREATE DATABASE ngninep_hotel;
CREATE DATABASE ngninep_booking;
```

Konfigurasi di masing-masing `application.yml`:
```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/ngninep_user
    username: root
    password:
  jpa:
    hibernate:
      ddl-auto: update
    show-sql: true

jwt:
  secret: your-very-long-secret-key-here
  expiration: 3600000 # 1 jam

spring:
  mail:
    host: smtp.gmail.com
    port: 587
    username: youremail@gmail.com
    password: your-app-password  # Google App Password (bukan password Gmail biasa)
    properties:
      mail.smtp.auth: true
      mail.smtp.starttls.enable: true
```

---

## 🚀 Cara Menjalankan Proyek

### Backend
```bash
# Jalankan semua service secara berurutan:
# 1. API Gateway
cd api-gateway && mvn spring-boot:run

# 2. User Service
cd user-service && mvn spring-boot:run

# 3. Hotel Service
cd hotel-service && mvn spring-boot:run

# 4. Booking Service
cd booking-service && mvn spring-boot:run
```

### Frontend
```bash
cd frontend
npm install
npm start
# Berjalan di http://localhost:3000
```

---

## 📊 Port yang Digunakan

| Service | Port |
|---|---|
| API Gateway | 8080 |
| User Service | 8081 |
| Hotel Service | 8082 |
| Booking Service | 8083 |
| React Frontend | 3000 |
| MySQL (XAMPP) | 3306 |

---

*Dibuat untuk proyek NgiNep — Hotel Booking Website*
*Stack: Java Spring Boot (Microservices) + React JS + MySQL*
