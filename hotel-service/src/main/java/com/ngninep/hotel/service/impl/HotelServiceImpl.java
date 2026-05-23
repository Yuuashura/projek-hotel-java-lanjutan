package com.ngninep.hotel.service.impl;

import com.ngninep.hotel.dto.req.HotelRequest;
import com.ngninep.hotel.dto.res.CityResponse;
import com.ngninep.hotel.dto.res.FacilityResponse;
import com.ngninep.hotel.dto.res.HotelImageResponse;
import com.ngninep.hotel.dto.res.HotelResponse;
import com.ngninep.hotel.dto.res.RoomTypeImageResponse;
import com.ngninep.hotel.entity.City;
import com.ngninep.hotel.entity.Hotel;
import com.ngninep.hotel.entity.HotelImage;
import com.ngninep.hotel.repository.CityRepository;
import com.ngninep.hotel.repository.HotelImageRepository;
import com.ngninep.hotel.repository.HotelRepository;
import com.ngninep.hotel.service.HotelService;
import lombok.RequiredArgsConstructor;
import lombok.Value;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class HotelServiceImpl implements HotelService {

    private final HotelRepository hotelRepository;
    private final CityRepository cityRepository;
    private final HotelImageRepository hotelImageRepository;

    private HotelResponse mapToResponse(Hotel hotel) {
        CityResponse cityResponse = null;
        if (hotel.getCity() != null) {
            cityResponse = CityResponse.builder()
                    .idCity(hotel.getCity().getIdCity())
                    .name(hotel.getCity().getName())
                    .province(hotel.getCity().getProvince())
                    .build();
        }

        List<Object> imagesResponse = new ArrayList<>();
        if (hotel.getImages() != null) {
            imagesResponse = hotel.getImages().stream().map(img -> HotelImageResponse.builder()
                    .idImage(img.getIdImage())
                    .imageUrl(img.getImage_url())
                    .sortOrder(img.getSort_order())
                    .build()).collect(Collectors.toList());
        }

        List<Object> facilitiesResponse = new ArrayList<>();
        if (hotel.getFacilities() != null) {
            facilitiesResponse = hotel.getFacilities().stream().map(hf -> {
                if (hf.getFacility() != null) {
                    return FacilityResponse.builder()
                            .idFacility(hf.getFacility().getIdFacility())
                            .name(hf.getFacility().getName())
                            .icon(hf.getFacility().getIcon())
                            .build();
                }
                return null;
            }).filter(java.util.Objects::nonNull).collect(Collectors.toList());
        }

        List<com.ngninep.hotel.dto.res.RoomTypeResponse> roomTypesResponse = new ArrayList<>();
        if (hotel.getRoomTypes() != null) {
            roomTypesResponse = hotel.getRoomTypes().stream().map(rt -> com.ngninep.hotel.dto.res.RoomTypeResponse
                    .builder()
                    .idRoomType(rt.getIdRoomType())
                    .name(rt.getName())
                    .hotelId(hotel.getIdHotel())
                    .description(rt.getDescription())
                    .pricePerNight(rt.getPrice_per_night())
                    .maxGuest(rt.getMax_guest())
                    .smoking(rt.isSmoking())
                    .roomAvailable(rt.getRoom_available())
                    .images(rt.getImages() != null ? rt.getImages().stream().map(img -> RoomTypeImageResponse.builder()
                            .idImage(img.getIdImage())
                            .imageUrl(img.getImage_url())
                            .sortOrder(img.getSort_order())
                            .build()).collect(Collectors.toList()) : new ArrayList<>())
                    .facilities(new ArrayList<>()) // Can be mapped later if needed
                    .build()).collect(Collectors.toList());
        }

        return HotelResponse.builder()
                .idHotel(hotel.getIdHotel())
                .name(hotel.getName())
                .city(cityResponse)
                .address(hotel.getAddress())
                .type(hotel.getType())
                .description(hotel.getDescription())
                .adminHotelId(hotel.getAdmin_hotel_id())
                .featured(hotel.isFeatured())
                .onSale(hotel.isOnSale())
                .discountPercent(hotel.getDiscount_percent())
                .rating(hotel.getRating())
                .images(imagesResponse)
                .facilities(facilitiesResponse)
                .roomTypes(roomTypesResponse)
                .build();
    }

    @Override
    public List<HotelResponse> getAll() {
        return hotelRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<HotelResponse> search(String keyword, Integer cityId, Integer page, Integer size) {
        List<Hotel> hotels;
        Pageable pageable = toPageable(page, size);
        if (keyword != null && !keyword.isBlank()) {
            hotels = pageable != null
                    ? hotelRepository.findByNameContainingIgnoreCase(keyword, pageable).getContent()
                    : hotelRepository.findByNameContainingIgnoreCase(keyword);
        } else if (cityId != null) {
            hotels = pageable != null
                    ? hotelRepository.findByCity_IdCity(cityId, pageable).getContent()
                    : hotelRepository.findByCity_IdCity(cityId);
        } else {
            hotels = pageable != null
                    ? hotelRepository.findAll(pageable).getContent()
                    : hotelRepository.findAll();
        }

        return hotels.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Override
    public List<HotelResponse> getFeatured() {
        return hotelRepository.findByFeaturedTrue().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public HotelResponse getById(int id) {
        Hotel hotel = hotelRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Hotel tidak ditemukan"));
        return mapToResponse(hotel);
    }

    @Override
    @Transactional
    public HotelResponse create(HotelRequest request) {
        City city = cityRepository.findById(request.getCityId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Kota tidak valid"));

        Hotel hotel = Hotel.builder()
                .name(request.getName())
                .city(city)
                .address(request.getAddress())
                .type(request.getType())
                .description(request.getDescription())
                .admin_hotel_id(request.getAdminHotelId())
                .featured(request.isFeatured())
                .onSale(request.isOnSale())
                .discount_percent(request.getDiscountPercent())
                .rating(request.getRating())
                .build();

        Hotel saved = hotelRepository.save(hotel);

        // Simpan gambar jika ada
        if (request.getImageUrl() != null && !request.getImageUrl().isBlank()) {
            String[] urls = request.getImageUrl().split("\\|\\|\\|");
            for (int i = 0; i < urls.length; i++) {
                String url = urls[i].trim();
                if (!url.isEmpty()) {
                    hotelImageRepository.save(HotelImage.builder()
                            .hotel(saved)
                            .image_url(url)
                            .sort_order(i)
                            .build());
                }
            }
        }

        return mapToResponse(hotelRepository.findById(saved.getIdHotel()).orElse(saved));
    }

    @Override
    @Transactional
    public HotelResponse update(int id, HotelRequest request) {
        Hotel hotel = hotelRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Hotel tidak ditemukan"));

        City city = cityRepository.findById(request.getCityId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Kota tidak valid"));

        hotel.setName(request.getName());
        hotel.setCity(city);
        hotel.setAddress(request.getAddress());
        hotel.setType(request.getType());
        hotel.setDescription(request.getDescription());
        hotel.setAdmin_hotel_id(request.getAdminHotelId());
        hotel.setFeatured(request.isFeatured());
        hotel.setOnSale(request.isOnSale());
        hotel.setDiscount_percent(request.getDiscountPercent());
        hotel.setRating(request.getRating());

        Hotel saved = hotelRepository.save(hotel);

        // Update gambar jika ada yang baru
        if (request.getImageUrl() != null && !request.getImageUrl().isBlank()) {
            // Hapus semua gambar lama dan ganti dengan yang baru
            hotelImageRepository.deleteByHotelId(id);
            String[] urls = request.getImageUrl().split("\\|\\|\\|");
            for (int i = 0; i < urls.length; i++) {
                String url = urls[i].trim();
                if (!url.isEmpty()) {
                    hotelImageRepository.save(HotelImage.builder()
                            .hotel(saved)
                            .image_url(url)
                            .sort_order(i)
                            .build());
                }
            }
        }

        return mapToResponse(hotelRepository.findById(saved.getIdHotel()).orElse(saved));
    }

    @Override
    public void delete(int id) {
        Hotel hotel = hotelRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Hotel tidak ditemukan"));
        hotelRepository.delete(hotel);
    }

    // E X C E L H A N D L I N G B A G I A N I N I
    @org.springframework.beans.factory.annotation.Value("${app.file.upload-path}")
    private String uploadPath;

    @Override
    public void uploadExcel(MultipartFile file) throws Exception {
        // validasi file kosong
        if (file.isEmpty()) {
            throw new RuntimeException("File kosong");
        }

        String fileName = file.getOriginalFilename();
        if (fileName == null || !fileName.endsWith(".xlsx")) {
            throw new RuntimeException("File harus berupa excel");
        }

        // create folder jika belum ada
        Path folderPath = Paths.get(uploadPath);
        if (!Files.exists(folderPath)) {
            Files.createDirectories(folderPath);
        }

        String savedFileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();

        // lokasi final file
        Path filePath = folderPath.resolve(savedFileName);

        // save file fisik
        Files.copy(file.getInputStream(), filePath);

        // baca excel
        InputStream inputStream = file.getInputStream();
        Workbook workbook = new XSSFWorkbook(inputStream);

        // posisi sheet / tab di Excel dimulai dari index 0
        Sheet sheet = workbook.getSheetAt(0);

        // upload mulai dari row ke-2
        // karena row ke-1 (index 0) adalah header

        // TIPS: tambahkan validasi / kondisi IF, misal jika ada row atau kolom yang kosong

        for (int i = 1; i <= sheet.getLastRowNum(); i++) {

            
            Row row = sheet.getRow(i);
            if (row == null) {
                continue;
            }

            // validasi jika baris/kolom nama kosong
            if (row.getCell(0) == null || row.getCell(0).getStringCellValue().trim().isEmpty()) {
                continue;
            }

            Hotel newHotel = new Hotel();
            newHotel.setName(row.getCell(0).getStringCellValue());

            // set city
            if (row.getCell(1) != null) {
                int cityId = (int) row.getCell(1).getNumericCellValue();
                City city = cityRepository.findById(cityId)
                        .orElseThrow(() -> new RuntimeException("Kota dengan ID " + cityId + " tidak ditemukan"));
                newHotel.setCity(city);
            }

            if (row.getCell(2) != null) {
                newHotel.setAddress(row.getCell(2).getStringCellValue());
            }

            if (row.getCell(3) != null) {
                newHotel.setType(row.getCell(3).getStringCellValue());
            }

            if (row.getCell(4) != null) {
                newHotel.setDescription(row.getCell(4).getStringCellValue());
            }

            if (row.getCell(5) != null) {
                newHotel.setAdmin_hotel_id((int) row.getCell(5).getNumericCellValue());
            }

            if (row.getCell(6) != null) {
                newHotel.setFeatured(row.getCell(6).getBooleanCellValue());
            }

            if (row.getCell(7) != null) {
                newHotel.setOnSale(row.getCell(7).getBooleanCellValue());
            }

            if (row.getCell(8) != null) {
                newHotel.setDiscount_percent((int) row.getCell(8).getNumericCellValue());
            }

            if (row.getCell(9) != null) {
                newHotel.setRating((float) row.getCell(9).getNumericCellValue());
            }

            hotelRepository.save(newHotel);
        }

        // workbook Excel harus ditutup setelah digunakan, agar tidak menghabiskan memory
        workbook.close();
    }

    @Override
    public java.io.ByteArrayInputStream downloadExcel() throws Exception {
        return null;
    }

    @Override
    public java.io.ByteArrayInputStream generateUploadTemplate() throws Exception {
        return null;
    }

    private Pageable toPageable(Integer page, Integer size) {
        if (page == null && size == null) {
            return null;
        }

        int safePage = page != null && page >= 0 ? page : 0;
        int safeSize = size != null && size > 0 ? Math.min(size, 100) : 10;
        return PageRequest.of(safePage, safeSize);
    }
}
