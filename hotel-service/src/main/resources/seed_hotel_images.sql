-- Seed local hotel images for every hotel that does not have images yet.
-- Image files must exist in: uploads/hotel-service/hotel-images/
-- Public URL is served by hotel-service via /api/hotels/uploads/**
-- Re-running this file skips hotels that already have at least one image.

WITH image_pool(idx, image_url) AS (
    VALUES
    (1, '/api/hotels/uploads/nginep-hotel-01.jpg'),
    (2, '/api/hotels/uploads/nginep-hotel-02.jpg'),
    (3, '/api/hotels/uploads/nginep-hotel-03.jpg'),
    (4, '/api/hotels/uploads/nginep-hotel-04.jpg'),
    (5, '/api/hotels/uploads/nginep-hotel-05.jpg'),
    (6, '/api/hotels/uploads/nginep-hotel-06.jpg'),
    (7, '/api/hotels/uploads/nginep-hotel-07.jpg'),
    (8, '/api/hotels/uploads/nginep-hotel-08.jpg'),
    (9, '/api/hotels/uploads/nginep-hotel-09.jpg'),
    (10, '/api/hotels/uploads/nginep-hotel-10.jpg'),
    (11, '/api/hotels/uploads/nginep-hotel-11.jpg'),
    (12, '/api/hotels/uploads/nginep-hotel-12.jpg'),
    (13, '/api/hotels/uploads/nginep-hotel-13.jpg'),
    (14, '/api/hotels/uploads/nginep-hotel-14.jpg'),
    (15, '/api/hotels/uploads/nginep-hotel-15.jpg'),
    (16, '/api/hotels/uploads/nginep-hotel-16.jpg'),
    (17, '/api/hotels/uploads/nginep-hotel-17.jpg'),
    (18, '/api/hotels/uploads/nginep-hotel-18.jpg'),
    (19, '/api/hotels/uploads/nginep-hotel-19.jpg'),
    (20, '/api/hotels/uploads/nginep-hotel-20.jpg')
),
target_hotels AS (
    SELECT
        h.id_hotel,
        row_number() OVER (ORDER BY h.id_hotel) AS rn
    FROM hotels h
    WHERE NOT EXISTS (
        SELECT 1
        FROM hotel_images hi
        WHERE hi.hotel_id = h.id_hotel
    )
),
image_slots AS (
    SELECT
        th.id_hotel,
        slot.sort_order,
        (((th.rn + slot.offset_value - 2) % 20) + 1) AS image_idx
    FROM target_hotels th
    CROSS JOIN (
        VALUES
        (0, 0),
        (1, 7),
        (2, 14)
    ) AS slot(sort_order, offset_value)
)
INSERT INTO hotel_images (hotel_id, image_url, sort_order)
SELECT
    image_slots.id_hotel,
    image_pool.image_url,
    image_slots.sort_order
FROM image_slots
JOIN image_pool ON image_pool.idx = image_slots.image_idx
ORDER BY image_slots.id_hotel, image_slots.sort_order;
