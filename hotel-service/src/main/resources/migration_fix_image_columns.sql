-- =============================================
-- MIGRATION: Fix image_url column types  
-- Run this script once on your MySQL database
-- =============================================

USE ngninep_hotel;

-- Ubah kolom image_url di hotel_images supaya support base64
ALTER TABLE hotel_images 
  MODIFY COLUMN image_url MEDIUMTEXT;

-- Ubah kolom image_url di room_type_images supaya support base64
ALTER TABLE room_type_images 
  MODIFY COLUMN image_url MEDIUMTEXT;

-- Verifikasi
DESCRIBE hotel_images;
DESCRIBE room_type_images;
