package com.ngninep.booking.seeder;

import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class TriggerSeeder implements CommandLineRunner {

    private final JdbcTemplate jdbcTemplate;

    @Override
    public void run(String... args) {
        jdbcTemplate.execute("""
            CREATE OR REPLACE FUNCTION ngninep_prevent_room_overselling()
            RETURNS TRIGGER AS $$
            DECLARE
                v_room_available INTEGER;
                v_booked_rooms INTEGER;
            BEGIN
                IF NEW.check_in IS NULL OR NEW.check_out IS NULL THEN
                    RAISE EXCEPTION 'Tanggal check-in dan check-out wajib diisi';
                END IF;

                IF NEW.check_in >= NEW.check_out THEN
                    RAISE EXCEPTION 'Tanggal check-out harus setelah check-in';
                END IF;

                IF NEW.status IS NULL THEN
                    NEW.status := 'PENDING';
                END IF;

                IF NEW.status NOT IN ('PENDING', 'CONFIRMED') THEN
                    RETURN NEW;
                END IF;

                SELECT rt.room_available
                INTO v_room_available
                FROM room_types rt
                WHERE rt.id_room_type = NEW.room_type_id
                FOR UPDATE;

                IF v_room_available IS NULL THEN
                    RAISE EXCEPTION 'Tipe kamar tidak ditemukan';
                END IF;

                IF v_room_available <= 0 THEN
                    RAISE EXCEPTION 'Kamar tidak tersedia untuk tipe kamar ini';
                END IF;

                SELECT COUNT(*)
                INTO v_booked_rooms
                FROM bookings b
                WHERE b.room_type_id = NEW.room_type_id
                  AND b.status IN ('PENDING', 'CONFIRMED')
                  AND b.check_in < NEW.check_out
                  AND b.check_out > NEW.check_in
                  AND (
                      TG_OP = 'INSERT'
                      OR b.id_booking <> NEW.id_booking
                  );

                IF v_booked_rooms >= v_room_available THEN
                    RAISE EXCEPTION 'Kamar tidak tersedia untuk tanggal tersebut';
                END IF;

                RETURN NEW;
            END;
            $$ LANGUAGE plpgsql
        """);

        jdbcTemplate.execute("""
            DROP TRIGGER IF EXISTS trg_prevent_room_overselling ON bookings
        """);

        jdbcTemplate.execute("""
            CREATE TRIGGER trg_prevent_room_overselling
            BEFORE INSERT OR UPDATE OF room_type_id, check_in, check_out, status
            ON bookings
            FOR EACH ROW
            EXECUTE FUNCTION ngninep_prevent_room_overselling()
        """);
    }
}
