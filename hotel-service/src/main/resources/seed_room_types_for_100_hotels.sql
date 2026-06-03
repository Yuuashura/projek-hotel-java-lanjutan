-- Seed room types for the 100 hotels inserted by seed_100_hotels.sql.
-- Run this after seed_100_hotels.sql.
-- Re-running this file updates incomplete room types and inserts missing ones.

WITH seed_hotels(name) AS (
    VALUES
    ('NgiNep Grand Bandung'),
    ('Awan Senja Dago'),
    ('Kirana City Hotel'),
    ('Lazuardi Suites'),
    ('Samudra Bali Resort'),
    ('Teras Malioboro Inn'),
    ('Cakrawala Surabaya Hotel'),
    ('Dewata Garden Villa'),
    ('Mentari Semarang Hotel'),
    ('Mahakam Balikpapan Stay'),
    ('Andalas Medan Hotel'),
    ('Sriwijaya Palembang Suites'),
    ('Losari Makassar Hotel'),
    ('Raya Heritage Bandung'),
    ('Urban Nest Jakarta'),
    ('Sagara Kuta Hotel'),
    ('Amerta Ubud Retreat'),
    ('Griya Tugu Yogyakarta'),
    ('Delta Surabaya Inn'),
    ('Nusantara Prime Semarang'),
    ('Borneo Sky Balikpapan'),
    ('Maimun Palace Hotel'),
    ('Ampera Riverside Hotel'),
    ('Phinisi Harbor Stay'),
    ('Citra Dago Residence'),
    ('Langit Selatan Resort'),
    ('Sedayu Malioboro Hotel'),
    ('Kota Lama Semarang Inn'),
    ('Jembatan Merah Surabaya'),
    ('Mega Kuningan Suites'),
    ('Senayan Urban Hotel'),
    ('Padma Sari Bandung'),
    ('Tanjung Bunga Makassar'),
    ('Sultan Deli Medan'),
    ('Kemaro Island Stay'),
    ('Pandanaran Comfort Hotel'),
    ('Balikpapan Bay Hotel'),
    ('Royal Braga Bandung'),
    ('Seruni Pasteur Hotel'),
    ('Jakarta Garden Residence'),
    ('Cendana Thamrin Hotel'),
    ('Uluwatu Cliff Resort'),
    ('Sanur Breeze Hotel'),
    ('Merapi View Lodge'),
    ('Prawirotaman Boutique'),
    ('Tunjungan Premier Hotel'),
    ('Kenjeran Beach Stay'),
    ('Laweyan Heritage Inn'),
    ('Simpang Lima Suites'),
    ('Sepinggan Airport Hotel'),
    ('Kalimantan Grand Stay'),
    ('Toba Urban Medan'),
    ('Kesawan Heritage Hotel'),
    ('Musi River Hotel'),
    ('Palembang City Nest'),
    ('Karebosi Prime Makassar'),
    ('Fort Rotterdam Stay'),
    ('Ciumbuleuit Hills Hotel'),
    ('Setiabudi Family Resort'),
    ('Cikini Arts Hotel'),
    ('Pondok Indah Suites'),
    ('Jimbaran Sunset Resort'),
    ('Canggu Surf Stay'),
    ('Kotagede Boutique Hotel'),
    ('Sleman Garden Villa'),
    ('Gubeng Business Hotel'),
    ('Darmo Comfort Suites'),
    ('Ungaran Valley Hotel'),
    ('Marina Semarang Stay'),
    ('Samarinda Road Hotel'),
    ('Bukit Damai Balikpapan'),
    ('Polonia Grand Medan'),
    ('Ring Road Medan Inn'),
    ('Jakabaring Sport Hotel'),
    ('Musi Heritage Inn'),
    ('Panakkukang City Hotel'),
    ('Samata Garden Stay'),
    ('Lembang Pine Resort'),
    ('Antapani Urban Hotel'),
    ('Kelapa Gading Hotel'),
    ('Kemang Creative Stay'),
    ('Nusa Dua Pearl Resort'),
    ('Denpasar Transit Hotel'),
    ('Gejayan Student Hotel'),
    ('Keraton Royal Stay'),
    ('Mulyosari Family Hotel'),
    ('CitraLand Surabaya Suites'),
    ('Banyumanik Hills Hotel'),
    ('Tembalang Smart Stay'),
    ('Manggar Beach Hotel'),
    ('Balikpapan Executive Suites'),
    ('Merdeka Walk Hotel'),
    ('Kualanamu Transit Inn'),
    ('Ilir Timur Hotel'),
    ('Bukit Siguntang Resort'),
    ('Tamalanrea Business Hotel'),
    ('Akkarena Beach Resort'),
    ('Sukajadi Premium Hotel'),
    ('Pancoran Business Stay'),
    ('Seminyak Luxe Hotel')
),
target_hotels AS (
    SELECT
        h.id_hotel,
        h.name,
        h.type,
        h.rating,
        row_number() OVER (ORDER BY h.id_hotel) AS rn
    FROM hotels h
    JOIN seed_hotels sh ON sh.name = h.name
),
room_templates(room_name, price_multiplier, max_guest, availability_offset, smoking, description_suffix) AS (
    VALUES
    ('Standard Room', 1.00::numeric, 2, 0, false, 'Kamar nyaman dengan fasilitas utama untuk perjalanan singkat.'),
    ('Deluxe Room', 1.45::numeric, 3, 2, false, 'Kamar lebih luas dengan area istirahat dan suasana premium.'),
    ('Suite Room', 2.10::numeric, 4, 4, true, 'Suite eksklusif dengan ruang ekstra untuk pengalaman menginap terbaik.')
),
room_seed AS (
    SELECT
        th.id_hotel,
        CASE
            WHEN th.type ILIKE '%budget%' AND rt.room_name = 'Standard Room' THEN 'Cozy Single Room'
            WHEN th.type ILIKE '%budget%' AND rt.room_name = 'Deluxe Room' THEN 'Smart Double Room'
            WHEN th.type ILIKE '%budget%' AND rt.room_name = 'Suite Room' THEN 'Family Room'
            WHEN th.type ILIKE '%resort%' AND rt.room_name = 'Standard Room' THEN 'Garden View Room'
            WHEN th.type ILIKE '%resort%' AND rt.room_name = 'Deluxe Room' THEN 'Pool View Room'
            WHEN th.type ILIKE '%resort%' AND rt.room_name = 'Suite Room' THEN 'Ocean Suite'
            WHEN th.type ILIKE '%villa%' AND rt.room_name = 'Standard Room' THEN 'Garden Villa'
            WHEN th.type ILIKE '%villa%' AND rt.room_name = 'Deluxe Room' THEN 'Private Pool Villa'
            WHEN th.type ILIKE '%villa%' AND rt.room_name = 'Suite Room' THEN 'Family Villa'
            WHEN th.type ILIKE '%boutique%' AND rt.room_name = 'Standard Room' THEN 'Classic Room'
            WHEN th.type ILIKE '%boutique%' AND rt.room_name = 'Deluxe Room' THEN 'Signature Room'
            WHEN th.type ILIKE '%boutique%' AND rt.room_name = 'Suite Room' THEN 'Heritage Suite'
            WHEN th.type ILIKE '%apartment%' AND rt.room_name = 'Standard Room' THEN 'Studio Room'
            WHEN th.type ILIKE '%apartment%' AND rt.room_name = 'Deluxe Room' THEN 'One Bedroom Suite'
            WHEN th.type ILIKE '%apartment%' AND rt.room_name = 'Suite Room' THEN 'Two Bedroom Suite'
            ELSE rt.room_name
        END AS room_name,
        (
            CASE
                WHEN th.type ILIKE '%budget%' THEN 250000
                WHEN th.type ILIKE '%bintang 3%' THEN 420000
                WHEN th.type ILIKE '%bintang 4%' THEN 680000
                WHEN th.type ILIKE '%bintang 5%' THEN 1150000
                WHEN th.type ILIKE '%resort%' THEN 980000
                WHEN th.type ILIKE '%villa%' THEN 1250000
                WHEN th.type ILIKE '%boutique%' THEN 560000
                WHEN th.type ILIKE '%apartment%' THEN 520000
                ELSE 500000
            END * rt.price_multiplier
        )::bigint AS price_per_night,
        (6 + ((th.rn + rt.availability_offset) % 10))::int AS room_available,
        rt.max_guest,
        rt.smoking,
        rt.description_suffix AS description
    FROM target_hotels th
    CROSS JOIN room_templates rt
),
updated_existing AS (
    UPDATE room_types existing
    SET
        price_per_night = CASE
            WHEN existing.price_per_night IS NULL OR existing.price_per_night <= 0 THEN rs.price_per_night
            ELSE existing.price_per_night
        END,
        room_available = CASE
            WHEN existing.room_available IS NULL OR existing.room_available <= 0 THEN rs.room_available
            ELSE existing.room_available
        END,
        max_guest = CASE
            WHEN existing.max_guest IS NULL OR existing.max_guest <= 0 THEN rs.max_guest
            ELSE existing.max_guest
        END,
        is_smoking = rs.smoking,
        description = CASE
            WHEN existing.description IS NULL OR btrim(existing.description) = '' THEN rs.description
            ELSE existing.description
        END
    FROM room_seed rs
    WHERE existing.hotel_id = rs.id_hotel
      AND existing.name = rs.room_name
      AND (
          existing.price_per_night IS NULL
          OR existing.price_per_night <= 0
          OR existing.room_available IS NULL
          OR existing.room_available <= 0
          OR existing.max_guest IS NULL
          OR existing.max_guest <= 0
          OR existing.description IS NULL
          OR btrim(existing.description) = ''
      )
    RETURNING existing.id_room_type
)
INSERT INTO room_types (
    hotel_id,
    name,
    price_per_night,
    room_available,
    max_guest,
    is_smoking,
    description
)
SELECT
    rs.id_hotel,
    rs.room_name,
    rs.price_per_night,
    rs.room_available,
    rs.max_guest,
    rs.smoking,
    rs.description
FROM room_seed rs
WHERE NOT EXISTS (
    SELECT 1
    FROM room_types existing
    WHERE existing.hotel_id = rs.id_hotel
      AND existing.name = rs.room_name
)
ORDER BY rs.id_hotel, rs.price_per_night;
