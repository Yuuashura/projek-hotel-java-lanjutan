package com.ngninep.hotel.repository;

import com.ngninep.hotel.entity.Hotel;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface HotelRepository extends JpaRepository<Hotel, Integer> {
    List<Hotel> findByCity_IdCity(int cityId);
    Page<Hotel> findByCity_IdCity(int cityId, Pageable pageable);
    List<Hotel> findByFeaturedTrue();
    List<Hotel> findByNameContainingIgnoreCase(String keyword);
    Page<Hotel> findByNameContainingIgnoreCase(String keyword, Pageable pageable);

    @Query(value = """
            SELECT
                h.id_hotel,
                h.name,
                h.address,
                h.type,
                h.description,
                h.admin_hotel_id,
                h.is_featured,
                h.is_on_sale,
                h.discount_percent,
                h.rating,
                c.id_city,
                c.name AS city_name,
                c.province,
                img.id_image,
                img.image_url,
                img.sort_order,
                price.min_price
            FROM hotels h
            LEFT JOIN cities c ON c.id_city = h.city_id
            LEFT JOIN LATERAL (
                SELECT hi.id_image, hi.image_url, hi.sort_order
                FROM hotel_images hi
                WHERE hi.hotel_id = h.id_hotel
                ORDER BY hi.sort_order ASC, hi.id_image ASC
                LIMIT 1
            ) img ON TRUE
            LEFT JOIN LATERAL (
                SELECT MIN(rt.price_per_night) AS min_price
                FROM room_types rt
                WHERE rt.hotel_id = h.id_hotel
            ) price ON TRUE
            WHERE (:keyword IS NULL
                OR LOWER(h.name) LIKE LOWER(CONCAT('%', CAST(:keyword AS TEXT), '%'))
                OR LOWER(h.address) LIKE LOWER(CONCAT('%', CAST(:keyword AS TEXT), '%'))
                OR LOWER(h.type) LIKE LOWER(CONCAT('%', CAST(:keyword AS TEXT), '%'))
                OR LOWER(c.name) LIKE LOWER(CONCAT('%', CAST(:keyword AS TEXT), '%')))
              AND (:cityId IS NULL OR h.city_id = :cityId)
              AND (:minRating IS NULL OR h.rating >= :minRating)
              AND (:featured IS NULL OR h.is_featured = :featured)
              AND (:onSale IS NULL OR h.is_on_sale = :onSale)
              AND (:minPrice IS NULL OR price.min_price >= :minPrice)
              AND (:maxPrice IS NULL OR price.min_price <= :maxPrice)
            ORDER BY
                CASE WHEN :sortBy = 'price_asc' THEN price.min_price END ASC NULLS LAST,
                CASE WHEN :sortBy = 'price_desc' THEN price.min_price END DESC NULLS LAST,
                CASE WHEN :sortBy = 'rating' THEN h.rating END DESC,
                h.id_hotel DESC
            """,
            countQuery = """
            SELECT COUNT(*)
            FROM hotels h
            LEFT JOIN cities c ON c.id_city = h.city_id
            LEFT JOIN LATERAL (
                SELECT MIN(rt.price_per_night) AS min_price
                FROM room_types rt
                WHERE rt.hotel_id = h.id_hotel
            ) price ON TRUE
            WHERE (:keyword IS NULL
                OR LOWER(h.name) LIKE LOWER(CONCAT('%', CAST(:keyword AS TEXT), '%'))
                OR LOWER(h.address) LIKE LOWER(CONCAT('%', CAST(:keyword AS TEXT), '%'))
                OR LOWER(h.type) LIKE LOWER(CONCAT('%', CAST(:keyword AS TEXT), '%'))
                OR LOWER(c.name) LIKE LOWER(CONCAT('%', CAST(:keyword AS TEXT), '%')))
              AND (:cityId IS NULL OR h.city_id = :cityId)
              AND (:minRating IS NULL OR h.rating >= :minRating)
              AND (:featured IS NULL OR h.is_featured = :featured)
              AND (:onSale IS NULL OR h.is_on_sale = :onSale)
              AND (:minPrice IS NULL OR price.min_price >= :minPrice)
              AND (:maxPrice IS NULL OR price.min_price <= :maxPrice)
            """,
            nativeQuery = true)
    Page<Object[]> findHotelListPage(@Param("keyword") String keyword,
                                     @Param("cityId") Integer cityId,
                                     @Param("minPrice") Long minPrice,
                                     @Param("maxPrice") Long maxPrice,
                                     @Param("minRating") Float minRating,
                                     @Param("featured") Boolean featured,
                                     @Param("onSale") Boolean onSale,
                                     @Param("sortBy") String sortBy,
                                     Pageable pageable);
}
