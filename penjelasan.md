# 📄 Kamus Sintaks Lengkap Proyek NgiNep

Dokumen ini menjelaskan secara rinci setiap anotasi, kelas, interface, dan eksepsi yang digunakan dalam proyek **NgiNep**. Setiap entri dilengkapi dengan **kegunaan**, **cara pemakaian**, dan **contoh penerapannya** di dalam proyek ini.

---

## 🗂️ Daftar Isi
1. [Spring Boot & Spring Framework (Anotasi & Kelas)](#1-spring-boot--spring-framework)
2. [Spring Security & Autentikasi (Anotasi, Kelas, & Eksepsi)](#2-spring-security--autentikasi)
3. [JPA & Hibernate (Anotasi & Kelas Database)](#3-jpa--hibernate)
4. [Lombok (Anotasi Boilerplate)](#4-lombok)
5. [Java Time & Library Utility (Apache POI & WebClient)](#5-java-time--library-utility)
6. [React JS Hooks & Frontend API](#6-react-js-hooks--frontend-api)

---

## 🍃 1. Spring Boot & Spring Framework

### `@SpringBootApplication`
*   **Kegunaan**: Menandai kelas konfigurasi utama aplikasi Spring Boot. Anotasi ini menggabungkan tiga anotasi:
    1.  `@Configuration`: Membuat kelas sebagai sumber definisi bean.
    2.  `@EnableAutoConfiguration`: Memberi tahu Spring Boot untuk mulai menambahkan bean berdasarkan classpath.
    3.  `@ComponentScan`: Memberi tahu Spring untuk memindai kelas lain dengan anotasi `@Component`, `@Service`, `@Repository`, dan `@RestController` di package yang sama atau turunannya.
*   **Cara Pemakaian**: Diletakkan tepat di atas deklarasi kelas utama aplikasi.
*   **Penerapan**:
    ```java
    @SpringBootApplication
    public class UserApplication {
        public static void main(String[] args) {
            SpringApplication.run(UserApplication.class, args);
        }
    }
    ```

### `@Configuration`
*   **Kegunaan**: Menandakan bahwa kelas tersebut mendefinisikan konfigurasi aplikasi dan dapat mendeklarasikan method-method ber-anotasi `@Bean` untuk dikelola oleh Spring Container.
*   **Cara Pemakaian**: Diletakkan di atas kelas konfigurasi.
*   **Penerapan**: Ditemukan pada `SecurityConfig.java`, `AsyncConfig.java`, dan `WebClientConfig.java`.
    ```java
    @Configuration
    public class AsyncConfig { ... }
    ```

### `@Bean`
*   **Kegunaan**: Digunakan di dalam kelas `@Configuration` untuk menandai suatu method agar objek yang dikembalikan (*return value*) method tersebut didaftarkan sebagai **Bean** di dalam Spring Container (ApplicationContext). Objek ini nantinya bisa di-inject ke kelas mana pun yang membutuhkannya.
*   **Cara Pemakaian**: Diletakkan di atas method pembuat objek.
*   **Penerapan**:
    ```java
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(); // Objek ini akan dikelola Spring
    }
    ```

### `@Component`
*   **Kegunaan**: Menandai kelas Java biasa sebagai Spring-managed Bean (komponen generik). Spring akan secara otomatis mendeteksi kelas ini melalui proses *component scanning* dan menginstansiasinya.
*   **Cara Pemakaian**: Diletakkan di atas deklarasi kelas utilitas atau filter.
*   **Penerapan**: Digunakan pada `JwtFilter.java` dan `OtpMailSender.java`.
    ```java
    @Component
    public class JwtFilter extends OncePerRequestFilter { ... }
    ```

### `@Service`
*   **Kegunaan**: Turunan spesifik dari `@Component` yang digunakan untuk menandai kelas di lapisan Bisnis (*Business Logic Layer*). Berguna agar secara semantik developer tahu ini berisi logika bisnis program.
*   **Cara Pemakaian**: Diletakkan di atas kelas implementasi service.
*   **Penerapan**: Digunakan pada `AuthServiceImpl.java`, `UserServiceImpl.java`, `BookingServiceImpl.java`, dll.
    ```java
    @Service
    public class AuthServiceImpl implements AuthService { ... }
    ```

### `@Repository`
*   **Kegunaan**: Turunan spesifik dari `@Component` yang digunakan di lapisan Akses Data (*Data Access / DAO Layer*). Selain menandai bean database, anotasi ini juga bertugas menerjemahkan kesalahan database (SQL Exception) ke dalam `DataAccessException` bawaan Spring.
*   **Cara Pemakaian**: Diletakkan di atas interface/kelas repository.
*   **Penerapan**: Digunakan pada interface seperti `CustomerRepository.java`. (Catatan: Jika mewarisi `JpaRepository`, Spring secara otomatis menganggapnya Repository bahkan tanpa anotasi ini, namun anotasi tetap disarankan untuk kejelasan struktur).

### `@RestController`
*   **Kegunaan**: Menggabungkan `@Controller` dan `@ResponseBody`. Menandakan bahwa kelas Java tersebut bertindak sebagai controller RESTful API. Semua nilai yang dikembalikan oleh method-method di dalamnya akan dikonversi menjadi data JSON secara otomatis di HTTP response.
*   **Cara Pemakaian**: Diletakkan di atas kelas controller API.
*   **Penerapan**:
    ```java
    @RestController
    @RequestMapping("/api/auth")
    public class AuthController { ... }
    ```

### `@RequestMapping`
*   **Kegunaan**: Memetakan HTTP request ke kelas atau method handler tertentu. Di tingkat kelas, digunakan untuk memberikan prefix (awalan) URL dasar untuk semua endpoint di kelas tersebut.
*   **Cara Pemakaian**: Ditulis dengan parameter URL tujuan.
*   **Penerapan**:
    ```java
    @RestController
    @RequestMapping("/api/users") // Semua endpoint di kelas ini dimulai dengan /api/users
    public class UserController { ... }
    ```

### `@GetMapping` / `@PostMapping` / `@PutMapping` / `@DeleteMapping` / `@PatchMapping`
*   **Kegunaan**: Anotasi khusus untuk memetakan method HTTP request spesifik:
    *   `@GetMapping`: Membaca data (GET).
    *   `@PostMapping`: Menyimpan data baru (POST).
    *   `@PutMapping`: Memperbarui seluruh data objek yang ada (PUT).
    *   `@DeleteMapping`: Menghapus data (DELETE).
    *   `@PatchMapping`: Memperbarui sebagian field objek (PATCH).
*   **Cara Pemakaian**: Diletakkan di atas method handler controller.
*   **Penerapan**:
    ```java
    @PostMapping("/login") // Memetakan request POST ke /api/auth/login
    public ResponseEntity<LoginResponse> login(...) { ... }
    ```

### `@RequestParam`
*   **Kegunaan**: Mengekstrak parameter kueri URL (*Query Parameter*) atau parameter form *multipart* dari request HTTP dan mengikatnya ke dalam variabel method Java.
*   **Cara Pemakaian**: `@RequestParam(value = "nama_param", required = false) T variabel`
*   **Penerapan**:
    ```java
    @GetMapping
    public ResponseEntity<?> getAll(
        @RequestParam(required = false) String keyword, // Mengambil ?keyword=bali
        @RequestParam(required = false) Integer cityId  // Mengambil &cityId=3
    ) { ... }
    ```

### `@PathVariable`
*   **Kegunaan**: Mengekstrak nilai variabel dinamis yang disematkan langsung di dalam pola path URL (*Path Variable*).
*   **Cara Pemakaian**: Menulis variabel dinamis menggunakan kurung kurawal `{var}` di mapping URL, lalu mencocokkannya di parameter method.
*   **Penerapan**:
    ```java
    @GetMapping("/{id}") // Mengambil URL /api/hotels/5
    public ResponseEntity<?> getById(@PathVariable int id) { // id akan bernilai 5
        ...
    }
    ```

### `@RequestBody`
*   **Kegunaan**: Menandai bahwa data JSON yang dikirim di dalam body HTTP request harus diubah (*deserialize*) secara otomatis menjadi objek Java DTO.
*   **Cara Pemakaian**: Diletakkan sebelum deklarasi DTO di parameter method.
*   **Penerapan**:
    ```java
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) { ... }
    ```

### `@Valid`
*   **Kegunaan**: Memicu proses validasi data pada objek DTO berdasarkan batasan (*constraints*) yang dipasang pada properti DTO tersebut (e.g. `@NotBlank`, `@Size`, dll.). Jika tidak valid, Spring akan langsung melempar eksepsi validasi sebelum mengeksekusi logika di dalam method.
*   **Cara Pemakaian**: Diletakkan sebelum `@RequestBody`.
*   **Penerapan**:
    ```java
    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) { ... }
    ```

### `@Value`
*   **Kegunaan**: Memasukkan nilai dari file konfigurasi `application.properties` atau *Environment Variable* langsung ke dalam properti/variabel kelas Java.
*   **Cara Pemakaian**: `@Value("${nama.property:default_value}")`
*   **Penerapan**:
    ```java
    @Value("${jwt.secret}")
    private String secret; // Mengambil nilai dari jwt.secret di application.properties
    ```

### `@Transactional`
*   **Kegunaan**: Mengelola transaksi database secara deklaratif. Jika terjadi error/eksepsi runtime selama eksekusi method, Spring akan membatalkan (*rollback*) seluruh transaksi database yang terjadi dalam method tersebut agar data database tetap konsisten.
*   **Cara Pemakaian**: Diletakkan di atas method atau kelas service.
*   **Penerapan**:
    ```java
    @Transactional
    public BookingResponse createBooking(BookingRequest request, int customerId) {
        // Jika penyimpanan DB gagal di tengah jalan, transaksi dibatalkan otomatis
    }
    ```

### `@Scheduled`
*   **Kegunaan**: Menjalankan method Java secara otomatis sesuai interval waktu tertentu yang dijadwalkan (berjalan di background thread).
*   **Cara Pemakaian**: Memerlukan anotasi `@EnableScheduling` pada kelas konfigurasi utama. Nilai diatur dengan `fixedRate` (ms), `fixedDelay` (ms), atau ekspresi `cron`.
*   **Penerapan**:
    ```java
    @Scheduled(fixedRate = 3600000) // Berjalan otomatis setiap 3.600.000 ms (1 jam)
    public void cleanExpiredOtp() {
        otpTokenRepository.deleteByExpiredAtBefore(LocalDateTime.now());
    }
    ```

### `@Async`
*   **Kegunaan**: Menandakan bahwa method tersebut harus dieksekusi secara asinkron di thread terpisah (*background thread*). Method pemanggil tidak perlu menunggu method asinkron selesai untuk melanjutkan kodenya (non-blocking).
*   **Cara Pemakaian**: Memerlukan anotasi `@EnableAsync` pada kelas konfigurasi. Di atas method ditulis `@Async("namaExecutor")`.
*   **Penerapan**: Digunakan untuk mengirim email OTP agar pendaftaran user terasa instan.
    ```java
    @Async("otpMailTaskExecutor")
    public void sendOtpEmailAsync(String toEmail, String otpCode, OtpToken.Purpose purpose) {
        mailSender.send(message); // Pengiriman email berjalan di thread mandiri
    }
    ```

### `ThreadPoolTaskExecutor`
*   **Kegunaan**: Kelas implementasi executor dari Spring yang membungkus `java.util.concurrent.ThreadPoolExecutor`. Berfungsi untuk membatasi, mengatur, dan mengalokasikan kolam thread untuk menjalankan tugas-tugas asinkron (seperti `@Async` kirim email).
*   **Cara Pemakaian**: Dibuat sebagai `@Bean` di dalam kelas `@Configuration`.
*   **Penerapan**:
    ```java
    @Bean(name = "otpMailTaskExecutor")
    public Executor otpMailTaskExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(2);        // Jumlah thread minimal yang selalu aktif
        executor.setMaxPoolSize(4);         // Jumlah thread maksimal jika antrean penuh
        executor.setQueueCapacity(100);     // Kapasitas antrean tugas sebelum membuat thread baru
        executor.setThreadNamePrefix("otp-mail-"); // Awalan nama thread di log
        executor.initialize();
        return executor;
    }
    ```

### `@RestControllerAdvice` & `@ExceptionHandler`
*   **Kegunaan**:
    *   `@RestControllerAdvice`: Menandakan kelas sebagai penangan eksepsi global (*Global Exception Handler*) untuk semua REST Controller di aplikasi.
    *   `@ExceptionHandler`: Diletakkan di atas method untuk menentukan jenis eksepsi apa yang ditangani oleh method tersebut.
*   **Cara Pemakaian**: Dideklarasikan pada satu kelas khusus global exception.
*   **Penerapan**: Menangkap error validasi atau eksepsi khusus dan memformat output error JSON agar seragam.
    ```java
    @RestControllerAdvice
    public class GlobalExceptionHandler {
        @ExceptionHandler(ResponseStatusException.class)
        public ResponseEntity<?> handleResponseStatusException(ResponseStatusException ex) {
            return ResponseEntity.status(ex.getStatusCode()).body(ex.getReason());
        }
    }
    ```

### `ResponseStatusException`
*   **Kegunaan**: Kelas eksepsi bawaan Spring yang mempermudah pelemparan error HTTP langsung dengan status kode tertentu (misal 404, 400, 401) beserta alasan pesannya.
*   **Cara Pemakaian**: `throw new ResponseStatusException(HttpStatus.KODE, "Pesan Error");`
*   **Penerapan**:
    ```java
    Customer customer = customerRepository.findByEmail(email)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Akun tidak ditemukan"));
    ```

### `MultipartFile`
*   **Kegunaan**: Interface yang merepresentasikan file biner yang diunggah oleh user melalui request HTTP multipart (seperti foto profil, bukti bayar, atau file Excel).
*   **Cara Pemakaian**: Digunakan sebagai tipe parameter di mapping method Controller.
*   **Penerapan**:
    ```java
    @PostMapping("/upload-image")
    public ResponseEntity<?> uploadImage(@RequestParam("file") MultipartFile file) {
        String url = fileStorageService.saveHotelImage(file);
        ...
    }
    ```

---

## 🔒 2. Spring Security & Autentikasi

### `@EnableWebSecurity` & `@EnableMethodSecurity`
*   **Kegunaan**:
    *   `@EnableWebSecurity`: Mengaktifkan modul keamanan web bawaan Spring Security.
    *   `@EnableMethodSecurity`: Mengaktifkan otorisasi berbasis method menggunakan anotasi keamanan seperti `@PreAuthorize`.
*   **Cara Pemakaian**: Dipasang bersamaan di atas kelas konfigurasi keamanan.
*   **Penerapan**: Digunakan pada `SecurityConfig.java`.

### `@PreAuthorize`
*   **Kegunaan**: Membatasi akses ke method tertentu berdasarkan hak akses (*roles/authorities*) pengguna yang terautentikasi. Evaluasi dilakukan menggunakan ekspresi SpEL (Spring Expression Language) sebelum method dieksekusi.
*   **Cara Pemakaian**: `@PreAuthorize("hasAnyAuthority('ROLE_NAME')")` atau `@PreAuthorize("hasRole('ROLE_NAME')")`
*   **Penerapan**: Melindungi endpoint administrasi hotel.
    ```java
    @PostMapping
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN_HOTEL', 'ROLE_ADMIN_APP')")
    public ResponseEntity<?> create(@RequestBody HotelRequest request) { ... }
    ```

### `SecurityFilterChain`
*   **Kegunaan**: Bean konfigurasi yang menentukan urutan filter keamanan (*filter chain*) untuk menangani setiap request masuk. Di sini diatur endpoint mana saja yang bebas diakses, mana yang harus login, konfigurasi CORS, CSRF, status session, dll.
*   **Cara Pemakaian**: Dideklarasikan sebagai `@Bean` dengan parameter `HttpSecurity`.
*   **Penerapan**:
    ```java
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http.csrf(csrf -> csrf.disable()) // Nonaktifkan CSRF untuk stateless API
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/**").permitAll() // Bebas akses
                .anyRequest().authenticated() // Wajib login
            )
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)); // Tanpa session cookie
        return http.build();
    }
    ```

### `OncePerRequestFilter`
*   **Kegunaan**: Kelas dasar abstrak untuk mempermudah pembuatan filter HTTP kustom yang menjamin filter tersebut hanya dieksekusi **satu kali** per request HTTP masuk.
*   **Cara Pemakaian**: Mewarisi `OncePerRequestFilter` dan mengimplementasikan method `doFilterInternal`.
*   **Penerapan**: Kelas `JwtFilter` dibuat dengan mewarisi kelas ini untuk mengekstrak dan memverifikasi token JWT pada setiap request.

### `UserDetailsService` (Interface)
*   **Kegunaan**: Interface inti dari Spring Security yang digunakan untuk memuat data pengguna berdasarkan username (dalam proyek ini menggunakan **email**). Hanya memiliki satu method: `loadUserByUsername()`.
*   **Cara Pemakaian**: Membuat kelas kustom yang mengimplementasikan interface ini, lalu meregistrasikannya sebagai `@Service`.
*   **Penerapan**:
    ```java
    @Service
    public class CustomUserDetailsService implements UserDetailsService {
        @Override
        public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
            ...
        }
    }
    ```

### `UserDetails` (Interface)
*   **Kegunaan**: Interface yang merepresentasikan data kredensial dan otorisasi pengguna yang dibutuhkan oleh Spring Security untuk melakukan validasi.
*   **Cara Pemakaian**: Kita bisa membuat objek kelas pembungkus `org.springframework.security.core.userdetails.User` yang menerapkan interface ini.
*   **Penerapan**: Dibuat dan dikembalikan di akhir method `loadUserByUsername()`.

### `UsernameNotFoundException`
*   **Kegunaan**: Eksepsi khusus Spring Security yang dilemparkan jika method `loadUserByUsername()` gagal menemukan user berdasarkan username/email yang diberikan oleh sistem autentikasi.
*   **Cara Pemakaian**: Dilemparkan menggunakan `.orElseThrow()` saat mengambil data user dari database.
*   **Penerapan**:
    ```java
    Customer customer = customerRepository.findByEmail(email)
            .orElseThrow(() -> new UsernameNotFoundException("User tidak ditemukan: " + email));
    ```

### `SimpleGrantedAuthority`
*   **Kegunaan**: Kelas konkret yang mengimplementasikan interface `GrantedAuthority`. Digunakan untuk menampung representasi string dari role/otoritas user (contoh: `"ROLE_USER"`, `"ROLE_ADMIN_HOTEL"`).
*   **Cara Pemakaian**: `new SimpleGrantedAuthority(roleString)`
*   **Penerapan**: Dimasukkan ke dalam daftar otoritas objek `UserDetails`.
    ```java
    List.of(new SimpleGrantedAuthority(customer.getRole().name()))
    ```

### `UsernamePasswordAuthenticationToken`
*   **Kegunaan**: Kelas representasi token autentikasi yang menyimpan data kredensial pengguna (seperti principal/user details dan daftar otoritas/roles) setelah proses login atau verifikasi token JWT berhasil dilakukan.
*   **Cara Pemakaian**: `new UsernamePasswordAuthenticationToken(principal, credentials, authorities)`
*   **Penerapan**: Dibuat di `JwtFilter` untuk menandai bahwa request tersebut terautentikasi.
    ```java
    UsernamePasswordAuthenticationToken authToken = 
        new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
    ```

### `SecurityContextHolder` & `SecurityContext`
*   **Kegunaan**:
    *   `SecurityContext`: Tempat penyimpanan objek autentikasi (`Authentication`) yang sedang aktif untuk request saat ini.
    *   `SecurityContextHolder`: Kelas utilitas global untuk mengakses `SecurityContext` yang terikat pada thread saat ini (*ThreadLocal*).
*   **Cara Pemakaian**: Digunakan untuk menetapkan pengguna yang berhasil login ke sistem atau mengambil informasi pengguna yang sedang login.
*   **Penerapan**:
    ```// Menyetel status login user di filter
    SecurityContextHolder.getContext().setAuthentication(authToken);

    // Mengambil info email user yang login di controller/service
    String currentEmail = SecurityContextHolder.getContext().getAuthentication().getName();
    ```

---

## 🗄️ 3. JPA & Hibernate (Database ORM)

### JpaRepository<T, ID> (Interface)
*   **Kegunaan**: Interface bawaan Spring Data JPA yang menyediakan kumpulan method siap pakai untuk operasi CRUD (Create, Read, Update, Delete) dan query database tanpa perlu menulis kueri SQL manual.
*   **Cara Pemakaian**: Membuat interface baru yang mewarisi `JpaRepository` dengan mendefinisikan tipe entitas dan tipe data Primary Key-nya.
*   **Penerapan**:
    ```java
    public interface CustomerRepository extends JpaRepository<Customer, Integer> {
        // Spring otomatis mengimplementasikan method save(), findById(), delete(), dll.
        Optional<Customer> findByEmail(String email); // Kueri kustom berbasis penamaan method
    }
    ```

### `@Entity` & `@Table`
*   **Kegunaan**:
    *   `@Entity`: Menandai bahwa kelas Java tersebut merupakan entitas JPA yang memetakan dirinya ke sebuah tabel database relasional.
    *   `@Table`: Mengatur opsi konfigurasi tabel fisik, seperti nama tabel (`name = "customers"`).
*   **Cara Pemakaian**: Diletakkan di tingkat kelas model entitas.
*   **Penerapan**:
    ```java
    @Entity
    @Table(name = "customers")
    public class Customer { ... }
    ```

### `@Id` & `@GeneratedValue`
*   **Kegunaan**:
    *   `@Id`: Menentukan properti yang bertindak sebagai Primary Key tabel.
    *   `@GeneratedValue`: Menentukan strategi penyerahan nilai PK baru. Strategi `GenerationType.IDENTITY` menandakan database akan mengisi kolom PK tersebut menggunakan *auto-increment*.
*   **Cara Pemakaian**: Diletakkan di atas properti id entitas.
*   **Penerapan**:
    ```java
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id_customer;
    ```

### `@Column(columnDefinition = "...")`
*   **Kegunaan**: Mengatur konfigurasi spesifik pada kolom database, seperti tipe data khusus, panjang karakter, atau batasan unik (*unique constraint*).
*   **Cara Pemakaian**: `@Column(name = "nama_kolom", unique = true)`
*   **Penerapan**:
    ```java
    @Column(columnDefinition = "MEDIUMTEXT")
    private String payment_proof; // Mampu menyimpan data teks Base64 yang panjang
    ```

### `@ManyToOne` & `@JoinColumn`
*   **Kegunaan**: Mendefinisikan hubungan banyak-ke-satu (*Many-to-One*) antar tabel di database yang sama.
    *   `@ManyToOne` menyatakan bahwa banyak baris entitas ini merujuk ke satu entitas induk.
    *   `@JoinColumn` mendefinisikan nama fisik kolom Foreign Key (FK) di tabel anak.
*   **Cara Pemakaian**: Diletakkan di atas field bertipe kelas entitas lain.
*   **Penerapan**:
    ```java
    @ManyToOne
    @JoinColumn(name = "hotel_id")
    private Hotel hotel; // Menghubungkan tipe kamar dengan hotel asalnya
    ```

### `@OneToMany(mappedBy = "...", cascade = CascadeType.ALL)`
*   **Kegunaan**: Mendefinisikan hubungan satu-ke-banyak (*One-to-Many*).
    *   `mappedBy`: Merujuk ke nama properti di kelas anak yang memegang relasi `@ManyToOne`.
    *   `cascade = CascadeType.ALL`: Menyebarkan seluruh operasi (save, update, delete) dari entitas induk ke seluruh entitas anak yang terelasi.
*   **Cara Pemakaian**: Diletakkan di atas properti bertipe `List` entitas anak.
*   **Penerapan**:
    ```java
    @OneToMany(mappedBy = "hotel", cascade = CascadeType.ALL)
    private List<RoomType> roomTypes; // Jika hotel dihapus, semua tipe kamar hotel itu juga terhapus
    ```

### `@Enumerated(EnumType.STRING)`
*   **Kegunaan**: Memberi tahu JPA untuk menyimpan nilai field bertipe data Enum ke database dalam bentuk representasi teks String-nya, bukan angka index default (ordinal). Hal ini mempermudah pembacaan database.
*   **Cara Pemakaian**: Diletakkan di atas field bertipe Enum.
*   **Penerapan**:
    ```java
    @Enumerated(EnumType.STRING)
    private Role role; // Menyimpan teks "ROLE_USER" ke database
    ```

---

## 🐜 4. Lombok

### `@Getter` / `@Setter`
*   **Kegunaan**: Secara otomatis membuat method Getter (misal `getEmail()`) dan Setter (misal `setEmail()`) untuk seluruh field di kelas tersebut saat proses kompilasi Java.
*   **Cara Pemakaian**: Diletakkan di atas deklarasi kelas atau field tunggal.

### `@Builder`
*   **Kegunaan**: Mengimplementasikan pola rancangan pembangun (*Builder Pattern*) secara otomatis pada kelas. Memudahkan inisialisasi objek kompleks dengan urutan parameter yang fleksibel dan penulisan yang rapi.
*   **Cara Pemakaian**: Diletakkan di atas deklarasi kelas model.
*   **Penerapan**:
    ```java
    Customer customer = Customer.builder()
            .email("budi@gmail.com")
            .phone("081234567")
            .verified(true)
            .build(); // Membuat objek tanpa repot menulis constructor panjang
    ```

### `@RequiredArgsConstructor`
*   **Kegunaan**: Membuat constructor otomatis untuk kelas yang menerima parameter untuk semua field bertipe `final` atau field ber-anotasi `@NonNull`. Sangat berguna untuk injeksi dependensi (*Dependency Injection*) Spring tanpa perlu menggunakan `@Autowired`.
*   **Cara Pemakaian**: Diletakkan di atas deklarasi kelas.
*   **Penerapan**:
    ```java
    @Service
    @RequiredArgsConstructor
    public class CustomUserDetailsService implements UserDetailsService {
        private final CustomerRepository customerRepository; // Diinjeksi otomatis via constructor
    }
    ```

### `@Slf4j`
*   **Kegunaan**: Menambahkan baris kode logger secara otomatis di belakang layar. Kita bisa langsung menggunakan objek variabel `log` untuk mencetak pesan log ke konsol/terminal.
*   **Cara Pemakaian**: Diletakkan di atas deklarasi kelas Java.
*   **Penerapan**:
    ```java
    @Slf4j
    public class OtpServiceImpl {
        public void generateAndSendOtp(...) {
            log.info("Mengirim OTP..."); // Log dicetak ke terminal
        }
    }
    ```

---

## 🧳 5. Java Time & Library Utility

### `ChronoUnit.DAYS.between(date1, date2)`
*   **Grup**: Java 8 Time API.
*   **Kegunaan**: Menghitung selisih waktu secara presisi dalam satuan unit hari antara dua objek tanggal (`LocalDate` / `LocalDateTime`).
*   **Cara Pemakaian**: `ChronoUnit.DAYS.between(startDate, endDate)`
*   **Penerapan**: Digunakan untuk mencari total hari/malam pemesanan guna menghitung biaya pembayaran.
    ```java
    long nights = ChronoUnit.DAYS.between(booking.getCheckIn(), booking.getCheckOut());
    ```

### `WebClient` & `WebClient.Builder`
*   **Grup**: Spring WebFlux / Reactive Web.
*   **Kegunaan**: Objek HTTP Client modern untuk memicu HTTP request ke REST API eksternal (microservice lain) secara non-blocking maupun blocking.
*   **Cara Pemakaian**: Dikonfigurasi dalam `@Configuration` dan digunakan untuk menembak endpoint target.
*   **Penerapan**: `booking-service` memanggil data `hotel-service` untuk mengecek harga kamar.
    ```java
    WebResponse<RoomTypeSnapshot> body = hotelServiceWebClient.get()
            .uri("/api/room-types/{id}", roomTypeId)
            .retrieve()
            .bodyToMono(new ParameterizedTypeReference<WebResponse<RoomTypeSnapshot>>() {})
            .block(); // .block() memaksa proses menunggu response (Synchronous / Blocking)
    ```

### Apache POI (`Workbook`, `Sheet`, `Row`, `Cell`, `XSSFWorkbook`)
*   **Grup**: Apache POI Library (Maven dependency).
*   **Kegunaan**: Manipulasi dokumen format Microsoft Excel (.xlsx) secara terprogram di dalam kode Java backend.
*   **Cara Pemakaian**:
    *   `Workbook`: Representasi satu berkas file Excel.
    *   `Sheet`: Representasi satu lembar kerja (Tab) di dalam file Excel.
    *   `Row` & `Cell`: Representasi baris dan sel kolom data.
    *   `XSSFWorkbook`: Kelas implementasi POI untuk format file XML Excel (.xlsx).
*   **Penerapan**: Digunakan di `downloadExcel()` dan `uploadExcel()` untuk laporan manajemen hotel & transaksi booking.
    ```java
    Workbook workbook = new XSSFWorkbook(); // Membuat workbook excel baru
    Sheet sheet = workbook.createSheet("Data"); // Membuat sheet baru
    Row headerRow = sheet.createRow(0); // Membuat baris index-0
    headerRow.createCell(0).setCellValue("Nama Kolom"); // Membuat sel di kolom index-0
    ```

---

## ⚛️ 6. React JS Hooks & Frontend API

### `createContext` & `useContext`
*   **Kegunaan**:
    *   `createContext`: Membuat sebuah wadah state global (*Context*) di React agar data bisa didistribusikan secara terpusat ke seluruh komponen aplikasi.
    *   `useContext`: Hook untuk memanggil data yang berada dalam context global tersebut tanpa perlu mengopernya secara manual via props tingkat demi tingkat.
*   **Cara Pemakaian**:
    ```javascript
    const AuthContext = createContext(null);
    export const useAuth = () => useContext(AuthContext);
    ```
*   **Penerapan**: Digunakan untuk mengelola sesi user login (`AuthContext`) dan preferensi bahasa/lokalisasi (`PreferencesContext`).

### `useState`
*   **Kegunaan**: Hook React untuk membuat dan mengelola variabel state internal di dalam komponen fungsional. Perubahan pada nilai state akan otomatis merender ulang UI yang memakai state tersebut.
*   **Cara Pemakaian**: `const [state, setState] = useState(initialValue);`
*   **Penerapan**: Menyimpan inputan form register/login, menyimpan data hotel hasil search, dll.

### `useEffect`
*   **Kegunaan**: Hook React untuk menjalankan efek samping (*side-effect*) fungsional, seperti mengambil data dari API backend, memasang event listener scroll, atau mengecek ketersediaan token di localStorage saat komponen pertama kali dirender.
*   **Cara Pemakaian**: `useEffect(() => { ... }, [dependencies_array]);`
*   **Penerapan**: Memanggil profile pengguna atau daftar hotel secara otomatis saat halaman dibuka.

### `createPortal`
*   **Grup**: `react-dom`.
*   **Kegunaan**: Merender komponen React anak ke dalam node DOM fisik yang berbeda (biasanya di luar root aplikasi, misal langsung disisipkan di bawah `<body>`) untuk menghindari masalah layouting CSS seperti `z-index` atau `overflow: hidden` milik elemen induk.
*   **Cara Pemakaian**: `createPortal(elementJSX, domNode)`
*   **Penerapan**: Digunakan untuk menampilkan notifikasi mengambang (`FlashToast.jsx`) agar melayang di atas semua komponen web.

### Axios Interceptors (`request` & `response`)
*   **Grup**: Axios HTTP Client Library.
*   **Kegunaan**:
    *   `request.use`: Mencegat request HTTP sebelum dikirim. Digunakan untuk memasukkan token JWT secara otomatis ke header Authorization (`Authorization: Bearer <token>`).
    *   `response.use`: Mencegat response HTTP dari server sebelum sampai ke komponen React. Digunakan untuk mendeteksi status error `401/403` (token habis/tidak valid) untuk menghapus token lokal dan mengarahkan paksa pengguna ke halaman login (`/login?expired=true`).
*   **Penerapan**: Ditulis di berkas `frontend/src/utils/api.js`.
