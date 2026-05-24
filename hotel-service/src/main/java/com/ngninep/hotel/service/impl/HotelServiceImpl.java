package com.ngninep.hotel.service.impl;

import com.ngninep.hotel.dto.req.HotelRequest;
import com.ngninep.hotel.dto.res.CityResponse;
import com.ngninep.hotel.dto.res.FacilityResponse;
import com.ngninep.hotel.dto.res.HotelImageResponse;
import com.ngninep.hotel.dto.res.HotelResponse;
import com.ngninep.hotel.dto.res.RoomTypeImageResponse;
import com.ngninep.hotel.entity.City;
import com.ngninep.hotel.entity.Facility;
import com.ngninep.hotel.entity.Hotel;
import com.ngninep.hotel.entity.HotelFacility;
import com.ngninep.hotel.entity.HotelImage;
import com.ngninep.hotel.repository.CityRepository;
import com.ngninep.hotel.repository.FacilityRepository;
import com.ngninep.hotel.repository.HotelFacilityRepository;
import com.ngninep.hotel.repository.HotelImageRepository;
import com.ngninep.hotel.repository.HotelRepository;
import com.ngninep.hotel.service.HotelService;
import lombok.RequiredArgsConstructor;

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
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class HotelServiceImpl implements HotelService {

    private final HotelRepository hotelRepository;
    private final CityRepository cityRepository;
    private final HotelImageRepository hotelImageRepository;
    private final FacilityRepository facilityRepository;
    private final HotelFacilityRepository hotelFacilityRepository;

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
    @Transactional(readOnly = true)
    public List<HotelResponse> search(String keyword, Integer cityId, Long minPrice, Long maxPrice,
                                      Float minRating, Boolean featured, Boolean onSale,
                                      List<Integer> facilityIds, String sortBy, Integer page, Integer size) {
        List<Hotel> hotels = hotelRepository.findAll().stream()
                .filter(hotel -> matchesKeyword(hotel, keyword))
                .filter(hotel -> cityId == null || (hotel.getCity() != null && hotel.getCity().getIdCity() == cityId))
                .filter(hotel -> minRating == null || hotel.getRating() >= minRating)
                .filter(hotel -> featured == null || hotel.isFeatured() == featured)
                .filter(hotel -> onSale == null || hotel.isOnSale() == onSale)
                .filter(hotel -> matchesFacilities(hotel, facilityIds))
                .filter(hotel -> matchesPrice(hotel, minPrice, maxPrice))
                .sorted(getHotelComparator(sortBy))
                .collect(Collectors.toList());

        return applyPagination(hotels, page, size).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<HotelResponse> getFeatured() {
        return hotelRepository.findByFeaturedTrue().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<HotelResponse> getLatest(Integer limit) {
        return hotelRepository.findAll().stream()
                .sorted(Comparator.comparingInt(Hotel::getIdHotel).reversed())
                .limit(safeLimit(limit))
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<HotelResponse> getOnSale(Integer limit) {
        return hotelRepository.findAll().stream()
                .filter(Hotel::isOnSale)
                .sorted(Comparator.comparingInt(Hotel::getIdHotel).reversed())
                .limit(safeLimit(limit))
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getPopularCities(Integer limit) {
        return hotelRepository.findAll().stream()
                .filter(hotel -> hotel.getCity() != null)
                .collect(Collectors.groupingBy(Hotel::getCity, Collectors.counting()))
                .entrySet().stream()
                .sorted(Map.Entry.<City, Long>comparingByValue().reversed())
                .limit(safeLimit(limit))
                .map(entry -> {
                    City city = entry.getKey();
                    Map<String, Object> data = new LinkedHashMap<>();
                    data.put("id_city", city.getIdCity());
                    data.put("name", city.getName());
                    data.put("province", city.getProvince());
                    data.put("hotel_count", entry.getValue());
                    return data;
                })
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getPopularFacilities(Integer limit) {
        return hotelRepository.findAll().stream()
                .flatMap(hotel -> hotel.getFacilities() == null ? java.util.stream.Stream.empty() : hotel.getFacilities().stream())
                .filter(hotelFacility -> hotelFacility.getFacility() != null)
                .collect(Collectors.groupingBy(HotelFacility::getFacility, Collectors.counting()))
                .entrySet().stream()
                .sorted(Map.Entry.<Facility, Long>comparingByValue().reversed())
                .limit(safeLimit(limit))
                .map(entry -> {
                    Facility facility = entry.getKey();
                    Map<String, Object> data = new LinkedHashMap<>();
                    data.put("id_facility", facility.getIdFacility());
                    data.put("name", facility.getName());
                    data.put("icon", facility.getIcon());
                    data.put("hotel_count", entry.getValue());
                    return data;
                })
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Map<String, Object> getStats() {
        List<Hotel> hotels = hotelRepository.findAll();
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("total_hotels", hotels.size());
        data.put("total_cities", cityRepository.count());
        data.put("total_facilities", facilityRepository.count());
        data.put("featured_hotels", hotels.stream().filter(Hotel::isFeatured).count());
        data.put("on_sale_hotels", hotels.stream().filter(Hotel::isOnSale).count());
        return data;
    }

    @Override
    public HotelResponse getById(int id) {
        Hotel hotel = hotelRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Hotel tidak ditemukan"));
        return mapToResponse(hotel);
    }

    @Override
    @Transactional
    public HotelResponse addFacility(int hotelId, int facilityId) {
        Hotel hotel = hotelRepository.findById(hotelId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Hotel tidak ditemukan"));
        Facility facility = facilityRepository.findById(facilityId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Fasilitas tidak valid"));

        if (!hotelFacilityRepository.existsByHotel_IdHotelAndFacility_IdFacility(hotelId, facilityId)) {
            hotelFacilityRepository.save(HotelFacility.builder()
                    .hotel(hotel)
                    .facility(facility)
                    .build());
        }

        return getById(hotelId);
    }

    @Override
    @Transactional
    public HotelResponse removeFacility(int hotelId, int facilityId) {
        if (!hotelRepository.existsById(hotelId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Hotel tidak ditemukan");
        }
        if (!facilityRepository.existsById(facilityId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Fasilitas tidak valid");
        }

        hotelFacilityRepository.deleteByHotel_IdHotelAndFacility_IdFacility(hotelId, facilityId);
        return getById(hotelId);
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

    private boolean matchesKeyword(Hotel hotel, String keyword) {
        if (keyword == null || keyword.isBlank()) {
            return true;
        }

        String normalizedKeyword = keyword.toLowerCase();
        return containsIgnoreCase(hotel.getName(), normalizedKeyword)
                || containsIgnoreCase(hotel.getAddress(), normalizedKeyword)
                || containsIgnoreCase(hotel.getType(), normalizedKeyword)
                || (hotel.getCity() != null && containsIgnoreCase(hotel.getCity().getName(), normalizedKeyword));
    }

    private boolean containsIgnoreCase(String value, String normalizedKeyword) {
        return value != null && value.toLowerCase().contains(normalizedKeyword);
    }

    private boolean matchesFacilities(Hotel hotel, List<Integer> facilityIds) {
        if (facilityIds == null || facilityIds.isEmpty()) {
            return true;
        }

        List<Integer> hotelFacilityIds = hotel.getFacilities() == null ? List.of()
                : hotel.getFacilities().stream()
                .filter(hotelFacility -> hotelFacility.getFacility() != null)
                .map(hotelFacility -> hotelFacility.getFacility().getIdFacility())
                .collect(Collectors.toList());

        return hotelFacilityIds.containsAll(facilityIds);
    }

    private boolean matchesPrice(Hotel hotel, Long minPrice, Long maxPrice) {
        Long price = getMinRoomPrice(hotel);
        if (price == null) {
            return minPrice == null && maxPrice == null;
        }

        return (minPrice == null || price >= minPrice) && (maxPrice == null || price <= maxPrice);
    }

    private Long getMinRoomPrice(Hotel hotel) {
        if (hotel.getRoomTypes() == null || hotel.getRoomTypes().isEmpty()) {
            return null;
        }

        return hotel.getRoomTypes().stream()
                .map(roomType -> roomType.getPrice_per_night())
                .filter(price -> price != null && price >= 0)
                .min(Long::compareTo)
                .orElse(null);
    }

    private Comparator<Hotel> getHotelComparator(String sortBy) {
        if ("price_asc".equalsIgnoreCase(sortBy)) {
            return Comparator.comparing(hotel -> getMinRoomPrice(hotel), Comparator.nullsLast(Long::compareTo));
        }
        if ("price_desc".equalsIgnoreCase(sortBy)) {
            return Comparator.comparing((Hotel hotel) -> getMinRoomPrice(hotel), Comparator.nullsLast(Long::compareTo)).reversed();
        }
        if ("rating".equalsIgnoreCase(sortBy)) {
            return Comparator.comparing(Hotel::getRating).reversed();
        }

        return Comparator.comparingInt(Hotel::getIdHotel).reversed();
    }

    private List<Hotel> applyPagination(List<Hotel> hotels, Integer page, Integer size) {
        if (page == null && size == null) {
            return hotels;
        }

        int safePage = page != null && page >= 0 ? page : 0;
        int safeSize = size != null && size > 0 ? Math.min(size, 100) : 10;
        int fromIndex = Math.min(safePage * safeSize, hotels.size());
        int toIndex = Math.min(fromIndex + safeSize, hotels.size());
        return hotels.subList(fromIndex, toIndex);
    }

    private int safeLimit(Integer limit) {
        return limit != null && limit > 0 ? Math.min(limit, 50) : 6;
    }
}
