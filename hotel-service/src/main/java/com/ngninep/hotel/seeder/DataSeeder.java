package com.ngninep.hotel.seeder;

import com.ngninep.hotel.entity.City;
import com.ngninep.hotel.entity.Facility;
import com.ngninep.hotel.repository.CityRepository;
import com.ngninep.hotel.repository.FacilityRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final CityRepository cityRepository;
    private final FacilityRepository facilityRepository;

    @Override
    public void run(String... args) {
        if (cityRepository.count() == 0) {
            cityRepository.saveAll(List.of(
                City.builder().name("Jakarta").province("DKI Jakarta").build(),
                City.builder().name("Bandung").province("Jawa Barat").build(),
                City.builder().name("Surabaya").province("Jawa Timur").build(),
                City.builder().name("Bali").province("Bali").build(),
                City.builder().name("Yogyakarta").province("DI Yogyakarta").build(),
                City.builder().name("Semarang").province("Jawa Tengah").build(),
                City.builder().name("Medan").province("Sumatera Utara").build(),
                City.builder().name("Makassar").province("Sulawesi Selatan").build(),
                City.builder().name("Palembang").province("Sumatera Selatan").build(),
                City.builder().name("Lombok").province("Nusa Tenggara Barat").build()
            ));
        }

        if (facilityRepository.count() == 0) {
            facilityRepository.saveAll(List.of(
                Facility.builder().name("Free WiFi").icon("wifi").build(),
                Facility.builder().name("AC").icon("snowflake").build(),
                Facility.builder().name("Kolam Renang").icon("swimmer").build(),
                Facility.builder().name("Parkir Gratis").icon("car").build(),
                Facility.builder().name("Sarapan").icon("coffee").build(),
                Facility.builder().name("Restoran").icon("utensils").build(),
                Facility.builder().name("Gym").icon("dumbbell").build(),
                Facility.builder().name("Spa").icon("spa").build(),
                Facility.builder().name("Resepsionis 24 Jam").icon("clock").build(),
                Facility.builder().name("Laundry").icon("washing-machine").build(),
                Facility.builder().name("TV").icon("tv").build(),
                Facility.builder().name("Mini Bar").icon("glass").build(),
                Facility.builder().name("Brankas").icon("safe").build(),
                Facility.builder().name("Shuttle").icon("bus").build(),
                Facility.builder().name("Kasur Bayi").icon("baby").build()
            ));
        }
    }
}
