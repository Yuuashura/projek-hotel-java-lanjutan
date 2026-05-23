# 🚀 Panduan Deployment Gratisan (Microservices & Frontend)

Dokumen ini berisi panduan lengkap untuk melakukan *deployment* seluruh sistem aplikasi **NgiNep** (Frontend + Backend Microservices) secara gratis menggunakan layanan cloud modern.

---

## 📊 Pemetaan Arsitektur & Layanan

Sistem kita terdiri dari komponen-komponen berikut:
1. **Database:** PostgreSQL (Sudah di-host gratis secara online di **Supabase Cloud**).
2. **Frontend:** React + Vite (Akan di-host di **Vercel** atau **Netlify**).
3. **Backend (Microservices):** 
   * `api-gateway` (Port `8080`)
   * `user-service` (Port `8081`)
   * `hotel-service` (Port `8082`)
   * `booking-service` (Port `8083`)

---

## 🛠️ Pilihan Strategi Deployment Gratisan

Ada 3 pilihan cara deploy gratisan yang bisa Anda pilih berdasarkan tingkat kesulitan dan kebutuhan:

| Metode | Layanan Cloud | Batasan Free Tier | Rekomendasi Penggunaan |
| :--- | :--- | :--- | :--- |
| **Pilihan 1 (Terbaik & Stabil)** | **Oracle Cloud Always Free (VM)** + **Vercel** | Gratis selamanya, kapasitas RAM besar (hingga 24GB ARM), 4 CPU. | **Sangat Direkomendasikan.** Cocok untuk jangka panjang, semua microservices jalan lancar di satu server Docker Compose. |
| **Pilihan 2 (Mudah & Serverless)** | **Koyeb** + **Vercel** | Limitasi memori 512MB per container gratis. | Cocok untuk uji coba cepat tanpa kartu kredit. Tiap microservice dideploy sebagai container terpisah. |
| **Pilihan 3 (Demo / Pengujian Instan)** | **Localtunnel / Ngrok** + **Vercel** | Backend tetap berjalan di laptop Anda, di-expose ke internet lewat terowongan aman. | Sangat pas untuk kebutuhan demo mendadak atau penilaian tugas tanpa perlu setup server cloud. |

---

## 📌 Bagaimana dengan Railway?

**Railway** adalah platform PAAS yang sangat populer karena kemudahan *one-click deployment*. Namun, untuk skenario microservices, berikut yang perlu Anda ketahui:

### 1. Batasan Akun Gratis (Trial Tier) Railway Saat Ini
* **Bukan Gratis Selamanya:** Dulu Railway mereset saldo gratis tiap bulan, namun sekarang modelnya berubah menjadi **Trial Tier** dengan saldo gratis sekali pakai sebesar **$5.00** dan batas running time **500 jam**.
* **Konsumsi Waktu Microservices:** Karena proyek kita memiliki 4 microservice yang harus menyala bersamaan, maka konsumsi jam running adalah:
  $$\text{Konsumsi Per Hari} = 4 \text{ service} \times 24 \text{ jam} = 96 \text{ jam/hari}$$
  Kuota gratis **500 jam** Anda akan habis dalam waktu **5 hari** saja ($500 \div 96 = 5.2 \text{ hari}$).
* **Solusi Berbayar:** Setelah kuota trial habis, Anda harus upgrade ke *Hobby Plan* ($5/bulan) yang menggunakan sistem bayar sesuai pemakaian (*pay-as-you-go*).

### 2. Cara Deploy ke Railway (Jika Tetap Ingin Mencoba / Uji Coba Sementara)
Jika Anda hanya ingin mendeploy selama beberapa hari untuk keperluan demo tugas/penilaian:
1. **Buat Project di Railway:** Login ke [Railway.app](https://railway.app/) menggunakan akun GitHub Anda.
2. **Deploy Microservices Baru:**
   * Klik **"New Project"** > **"Deploy from GitHub repo"**.
   * Pilih repositori Anda.
   * Pada kolom **Root Directory**, tentukan folder microservice yang ingin dideploy (contoh: `user-service`). Railway akan otomatis mendeteksi `Dockerfile` yang telah kita buat di folder tersebut.
   * Ulangi langkah di atas untuk `hotel-service`, `booking-service`, dan `api-gateway`.
3. **Set Environment Variables:**
   * Di panel masing-masing service di Railway, masuk ke tab **Variables** dan tambahkan:
     * `SPRING_DATASOURCE_URL` = `jdbc:postgresql://aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?sslmode=require&prepareThreshold=0`
     * `SPRING_DATASOURCE_USERNAME` = `postgres.kpepeocugzbyugpgywvy`
     * `SPRING_DATASOURCE_PASSWORD` = `yuuashura12`
4. **Konfigurasi Routing di API Gateway:**
   * Dapatkan URL publik bawaan Railway untuk setiap service (contoh: `https://user-service-production.up.railway.app`).
   * Pada service `api-gateway` di Railway, masuk ke tab **Variables** dan tambahkan:
     * `SPRING_CLOUD_GATEWAY_ROUTES_0_URI` = `https://user-service-production.up.railway.app`
     * `SPRING_CLOUD_GATEWAY_ROUTES_1_URI` = `https://hotel-service-production.up.railway.app`
     * `SPRING_CLOUD_GATEWAY_ROUTES_2_URI` = `https://booking-service-production.up.railway.app`
   * Buka port `8080` pada gateway agar dapat diakses publik dari frontend Vercel.

---

## 📦 Tahap 1: Dockerisasi Aplikasi (Wajib untuk Cloud)

Untuk memudahkan deployment di cloud (Oracle Cloud atau Koyeb), kita perlu membuat berkas konfigurasi Docker.

### 1. Buat `Dockerfile` Ringkas pada Setiap Folder Backend
Karena memori server gratisan sangat terbatas (dan proses *compiling* menggunakan Maven memakan banyak RAM), **jangan lakukan Maven build di dalam container**. Lakukan build `.jar` secara lokal terlebih dahulu menggunakan perintah:
```bash
mvn clean package -DskipTests
```
Lalu buat file dengan nama `Dockerfile` (tanpa ekstensi) di setiap folder backend berikut:

#### 📁 `api-gateway/Dockerfile`
```dockerfile
FROM eclipse-temurin:17-jre-jammy
WORKDIR /app
COPY target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
```

#### 📁 `user-service/Dockerfile`
```dockerfile
FROM eclipse-temurin:17-jre-jammy
WORKDIR /app
COPY target/*.jar app.jar
EXPOSE 8081
ENTRYPOINT ["java", "-jar", "app.jar"]
```

#### 📁 `hotel-service/Dockerfile`
```dockerfile
FROM eclipse-temurin:17-jre-jammy
WORKDIR /app
COPY target/*.jar app.jar
EXPOSE 8082
ENTRYPOINT ["java", "-jar", "app.jar"]
```

#### 📁 `booking-service/Dockerfile`
```dockerfile
FROM eclipse-temurin:17-jre-jammy
WORKDIR /app
COPY target/*.jar app.jar
EXPOSE 8083
ENTRYPOINT ["java", "-jar", "app.jar"]
```

### 2. Buat File `docker-compose.yml` di Root Project
Buat file `docker-compose.yml` di folder paling luar (`Projekan Java Lanjutan/docker-compose.yml`) untuk menyatukan semua service:

```yaml
version: '3.8'

services:
  user-service:
    build: ./user-service
    ports:
      - "8081:8081"
    environment:
      - SPRING_DATASOURCE_URL=jdbc:postgresql://aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?sslmode=require&prepareThreshold=0
      - SPRING_DATASOURCE_USERNAME=postgres.kpepeocugzbyugpgywvy
      - SPRING_DATASOURCE_PASSWORD=yuuashura12

  hotel-service:
    build: ./hotel-service
    ports:
      - "8082:8082"
    environment:
      - SPRING_DATASOURCE_URL=jdbc:postgresql://aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?sslmode=require&prepareThreshold=0
      - SPRING_DATASOURCE_USERNAME=postgres.kpepeocugzbyugpgywvy
      - SPRING_DATASOURCE_PASSWORD=yuuashura12

  booking-service:
    build: ./booking-service
    ports:
      - "8083:8083"
    environment:
      - SPRING_DATASOURCE_URL=jdbc:postgresql://aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?sslmode=require&prepareThreshold=0
      - SPRING_DATASOURCE_USERNAME=postgres.kpepeocugzbyugpgywvy
      - SPRING_DATASOURCE_PASSWORD=yuuashura12

  api-gateway:
    build: ./api-gateway
    ports:
      - "8080:8080"
    depends_on:
      - user-service
      - hotel-service
      - booking-service
    environment:
      # Override routing agar gateway mengarah ke container docker, bukan localhost
      - SPRING_CLOUD_GATEWAY_ROUTES_0_URI=http://user-service:8081
      - SPRING_CLOUD_GATEWAY_ROUTES_1_URI=http://hotel-service:8082
      - SPRING_CLOUD_GATEWAY_ROUTES_2_URI=http://booking-service:8083
```

---

## 🌩️ Langkah Deploy: Pilihan 1 — Oracle Cloud (Sangat Direkomendasikan)
Oracle Cloud memberikan akses VM gratis selamanya (*Always Free*) dengan spesifikasi CPU ARM Ampere hingga **4 OCPU dan 24 GB RAM**. Ini sangat mewah untuk menjalankan aplikasi microservices Spring Boot.

### Langkah-langkah:
1. **Daftar Oracle Cloud Free Tier:** Masuk ke situs resmi Oracle Cloud dan buat akun gratis.
2. **Buat Instance VM:**
   * Pilih Image: **Ubuntu (Minimal)**.
   * Pilih Shape: **VM.Standard.A1.Flex** (Pilih 2 atau 4 OCPU, RAM 12GB atau 24GB).
3. **Konfigurasi Network (Ingress Rule):**
   * Di panel subnet VM Anda, buka *Security Lists*.
   * Tambahkan *Ingress Rule* untuk mengizinkan port `8080` (API Gateway) diakses publik (CIDR: `0.0.0.0/0`).
4. **Hubungkan & Install Docker di VM:**
   * Akses VM Anda menggunakan SSH dari terminal:
     ```bash
     ssh -i <private_key_anda> ubuntu@<IP_PUBLIC_VM>
     ```
   * Install Docker dan Docker Compose di dalam VM:
     ```bash
     sudo apt update && sudo apt install docker.io docker-compose -y
     ```
5. **Jalankan Aplikasi:**
   * Git clone repositori project Anda ke dalam VM.
   * Lakukan compile lokal dan push kode, lalu jalankan docker compose di server:
     ```bash
     sudo docker-compose up --build -d
     ```
   * Backend Anda kini online di alamat `http://<IP_PUBLIC_VM>:8080`.

---

## 🌩️ Langkah Deploy: Pilihan 2 — Koyeb (Serverless Container Gratis)
Jika tidak ingin mengelola server Linux sendiri, Koyeb adalah layanan termudah untuk mendeploy Docker container secara gratis.

### Langkah-langkah:
1. **Hubungkan Repositori:** Buat akun di **Koyeb** dan sambungkan ke akun GitHub Anda.
2. **Deploy Masing-masing Service:**
   * Buat aplikasi baru di Koyeb.
   * Setiap service (`user-service`, `hotel-service`, `booking-service`) dideploy secara terpisah menggunakan deteksi Dockerfile otomatis dari Koyeb.
   * Pastikan memasukkan Environment Variable database Supabase pada menu config Koyeb masing-masing.
3. **Deploy API Gateway:**
   * Dedeploy `api-gateway` dan dapatkan URL publik yang diberikan oleh Koyeb (contoh: `https://api-gateway-username.koyeb.app`).
   * Konfigurasikan environment variable routing di Koyeb untuk API Gateway agar mengarah ke URL publik Koyeb milik service masing-masing:
     * `SPRING_CLOUD_GATEWAY_ROUTES_0_URI` = `https://user-service-username.koyeb.app`
     * `SPRING_CLOUD_GATEWAY_ROUTES_1_URI` = `https://hotel-service-username.koyeb.app`
     * `SPRING_CLOUD_GATEWAY_ROUTES_2_URI` = `https://booking-service-username.koyeb.app`

---

## 🌩️ Langkah Deploy: Pilihan 3 — Local Tunnel (Untuk Demo Instan)
Apabila Anda hanya perlu mengaktifkan demo untuk diuji dosen/penguji jarak jauh secara instan tanpa melakukan setup server cloud, Anda bisa melakukan *tunneling* dari laptop lokal Anda.

### Langkah-langkah:
1. Jalankan seluruh microservice Anda secara lokal di IntelliJ / STS (pada port `8080` hingga `8083`).
2. Instal alat tunnel gratis seperti **localtunnel** secara global di Node.js:
   ```bash
   npm install -g localtunnel
   ```
3. Expose port API Gateway (`8080`) Anda ke publik:
   ```bash
   lt --port 8080 --subdomain nginep-api
   ```
   *Subdomain dapat disesuaikan*. Anda akan mendapatkan URL publik instan seperti `https://nginep-api.localtunnel.me`. URL inilah yang akan menjadi gerbang utama bagi frontend Anda di Vercel.

---

## 🖥️ Tahap 2: Deploy Frontend React ke Vercel (100% Gratis & Mudah)

Vercel sangat optimal untuk mendeploy website frontend berbasis Vite React.

### Langkah-langkah:
1. **Siapkan Konfigurasi Vite:**
   Pastikan file konfigurasi API url di React Anda membaca dari Environment Variable. Cek file `frontend/.env.production` atau buat baru dengan isi:
   ```env
   VITE_API_URL=https://<URL_API_GATEWAY_PUBLIK_ANDA>
   ```
   *(Ganti `<URL_API_GATEWAY_PUBLIK_ANDA>` dengan alamat IP VM Oracle Cloud port 8080, URL Koyeb API Gateway, atau URL Localtunnel Anda).*
2. **Push Project ke GitHub:**
   Pastikan seluruh perubahan project terunggah ke repositori GitHub Anda.
3. **Deploy di Vercel:**
   * Buka [Vercel](https://vercel.com) dan login menggunakan akun GitHub Anda.
   * Klik **"Add New"** > **"Project"** lalu import repositori project Anda.
   * Di pengaturan project, atur **Root Directory** ke folder `frontend`.
   * Pada kolom **Environment Variables**, tambahkan:
     * Key: `VITE_API_URL`
     * Value: `https://<URL_API_GATEWAY_PUBLIK_ANDA>`
   * Klik **Deploy**. Selesai! Website Anda akan aktif dalam hitungan detik dengan domain gratis `.vercel.app`.

---

> **💡 Tips Tambahan:** Supabase Cloud yang Anda gunakan memiliki fitur pooling transaksi bawaan. Gunakan URL koneksi port `6543` dengan parameter `sslmode=require&prepareThreshold=0` seperti yang tercantum dalam file `docker-compose.yml` di atas untuk mencegah masalah overload koneksi database yang dibatasi pada tier gratis.
