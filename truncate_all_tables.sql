-- ============================================================
-- TRUNCATE ALL TRANSACTIONAL TABLES
-- Keep: cities, facilities
-- Admin default: tzyudistira@gmail.com / wkwkwk123
-- Execute in Supabase SQL Editor
-- ============================================================

-- 1. Drop trigger
DROP TRIGGER IF EXISTS trg_prevent_room_overselling ON bookings;
DROP FUNCTION IF EXISTS ngninep_prevent_room_overselling();

-- 2. Truncate (child first)
TRUNCATE TABLE room_type_facilities CASCADE;
TRUNCATE TABLE room_type_images CASCADE;
TRUNCATE TABLE hotel_facilities CASCADE;
TRUNCATE TABLE hotel_images CASCADE;
TRUNCATE TABLE room_types CASCADE;
TRUNCATE TABLE hotels CASCADE;
TRUNCATE TABLE bookings CASCADE;
TRUNCATE TABLE otp_tokens CASCADE;
TRUNCATE TABLE customers CASCADE;

-- 3. Insert admin default
INSERT INTO customers (first_name, last_name, email, password, role, is_verified, is_banned)
VALUES (
  'Admin',
  'NgiNep',
  'tzyudistira@gmail.com',
  crypt('wkwkwk123', gen_salt('bf', 10)),
  'ROLE_ADMIN_APP',
  true,
  false
);

-- 4. Verify
SELECT 'cities' AS tabel, COUNT(*) AS jumlah FROM cities
UNION ALL
SELECT 'facilities', COUNT(*) FROM facilities
UNION ALL
SELECT 'customers', COUNT(*) FROM customers
UNION ALL
SELECT 'hotels', COUNT(*) FROM hotels
UNION ALL
SELECT 'bookings', COUNT(*) FROM bookings
UNION ALL
SELECT 'room_types', COUNT(*) FROM room_types
ORDER BY tabel;
