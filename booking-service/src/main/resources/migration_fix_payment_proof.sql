-- =============================================
-- MIGRATION: Fix payment_proof column type
-- Run this script once on your MySQL database
-- =============================================

-- Ubah kolom payment_proof dari VARCHAR menjadi MEDIUMTEXT
-- agar bisa menyimpan data base64 gambar (hingga 16MB)
USE ngninep_booking;

ALTER TABLE bookings 
  MODIFY COLUMN payment_proof MEDIUMTEXT;

-- Verifikasi
DESCRIBE bookings;
