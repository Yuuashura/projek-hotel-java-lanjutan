package com.ngninep.hotel.service.impl;

import com.ngninep.hotel.dto.req.HotelRequest;
import com.ngninep.hotel.dto.res.CityResponse;
import com.ngninep.hotel.dto.res.FacilityResponse;
import com.ngninep.hotel.dto.res.HotelImageResponse;
import com.ngninep.hotel.dto.res.HotelResponse;
import com.ngninep.hotel.dto.res.PageMetadata;
import com.ngninep.hotel.dto.res.PagedResult;
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
import com.ngninep.hotel.util.Message;
import lombok.RequiredArgsConstructor;

import org.apache.poi.ss.usermodel.CellStyle;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellType;
import org.apache.poi.ss.usermodel.Font;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class HotelServiceImpl implements HotelService {

    private final HotelRepository hotelRepository;
    private final CityRepository cityRepository;
    private final HotelImageRepository hotelImageRepository;
    private final FacilityRepository facilityRepository;
    private final HotelFacilityRepository hotelFacilityRepository;

    private boolean isAdminHotel() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication != null && authentication.getAuthorities().stream()
                .anyMatch(authority -> "ROLE_ADMIN_HOTEL".equals(authority.getAuthority()));
    }

    private int getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        Object credentials = authentication != null ? authentication.getCredentials() : null;
        if (credentials instanceof Integer) {
            return (Integer) credentials;
        }
        throw new ResponseStatusException(HttpStatus.FORBIDDEN, Message.HOTEL_ACCESS_DENIED);
    }

    private void validateHotelOwnership(Hotel hotel) {
        if (isAdminHotel() && hotel.getAdmin_hotel_id() != getCurrentUserId()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, Message.HOTEL_ACCESS_DENIED);
        }
    }

    @Override
    public void validateImageUploadAccess(Integer hotelId) {
        if (!isAdminHotel()) {
            return;
        }

        if (hotelId == null) {
            return;
        }

        Hotel hotel = hotelRepository.findById(hotelId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, Message.HOTEL_NOT_FOUND));
        validateHotelOwnership(hotel);
    }

    private HotelResponse mapToResponse(Hotel hotel) {
        return mapToResponse(hotel, hotel.getFacilities());
    }

    private HotelResponse mapToResponse(Hotel hotel, List<HotelFacility> hotelFacilities) {
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
        if (hotelFacilities != null) {
            facilitiesResponse = hotelFacilities.stream().map(hf -> {
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
                .minPrice(getMinRoomPrice(hotel))
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
    public PagedResult<HotelResponse> search(String keyword, Integer cityId, Long minPrice, Long maxPrice,
                                             Float minRating, Boolean featured, Boolean onSale,
                                             List<Integer> facilityIds, String sortBy, Integer page, Integer size) {
        if (canUseDatabasePagination(keyword, cityId, minPrice, maxPrice, minRating, featured, onSale, facilityIds, sortBy)) {
            return searchWithDatabasePagination(keyword, cityId, minPrice, maxPrice, minRating, featured, onSale, sortBy, page, size);
        }

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

        List<HotelResponse> data = applyPagination(hotels, page, size).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());

        return PagedResult.<HotelResponse>builder()
                .data(data)
                .pagination(buildPagination(hotels.size(), data.size(), page, size))
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<HotelResponse> getFeatured() {
        return hotelRepository.findByFeaturedTrue().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private boolean canUseDatabasePagination(String keyword, Integer cityId, Long minPrice, Long maxPrice,
                                             Float minRating, Boolean featured, Boolean onSale,
                                             List<Integer> facilityIds, String sortBy) {
        return facilityIds == null || facilityIds.isEmpty();
    }

    private PagedResult<HotelResponse> searchWithDatabasePagination(String keyword, Integer cityId,
                                                                     Long minPrice, Long maxPrice, Float minRating,
                                                                     Boolean featured, Boolean onSale, String sortBy,
                                                                     Integer page, Integer size) {
        Pageable pageable = PageRequest.of(safePage(page), safePageSize(size));
        String normalizedKeyword = keyword != null && !keyword.isBlank() ? keyword.trim() : null;
        String normalizedSort = normalizeSortBy(sortBy);
        Page<Object[]> hotelPage = hotelRepository.findHotelListPage(
                normalizedKeyword,
                cityId,
                minPrice,
                maxPrice,
                minRating,
                featured,
                onSale,
                normalizedSort,
                pageable);

        List<HotelResponse> data = hotelPage.getContent().stream()
                .map(this::mapListRowToResponse)
                .collect(Collectors.toList());

        return PagedResult.<HotelResponse>builder()
                .data(data)
                .pagination(PageMetadata.builder()
                        .currentPage(hotelPage.getNumber())
                        .pageSize(hotelPage.getSize())
                        .totalItems(hotelPage.getTotalElements())
                        .totalPages(hotelPage.getTotalPages())
                        .hasNext(hotelPage.hasNext())
                        .hasPrevious(hotelPage.hasPrevious())
                        .build())
                .build();
    }

    private HotelResponse mapListRowToResponse(Object[] row) {
        Long minPrice = row[16] != null ? ((Number) row[16]).longValue() : null;

        CityResponse cityResponse = null;
        if (row[10] != null) {
            cityResponse = CityResponse.builder()
                    .idCity(((Number) row[10]).intValue())
                    .name((String) row[11])
                    .province((String) row[12])
                    .build();
        }

        List<Object> imagesResponse = new ArrayList<>();
        if (row[13] != null) {
            imagesResponse.add(HotelImageResponse.builder()
                    .idImage(((Number) row[13]).intValue())
                    .imageUrl((String) row[14])
                    .sortOrder(row[15] != null ? ((Number) row[15]).intValue() : 0)
                    .build());
        }

        return HotelResponse.builder()
                .idHotel(((Number) row[0]).intValue())
                .name((String) row[1])
                .address((String) row[2])
                .type((String) row[3])
                .description((String) row[4])
                .adminHotelId(row[5] != null ? ((Number) row[5]).intValue() : 0)
                .featured(Boolean.TRUE.equals(row[6]))
                .onSale(Boolean.TRUE.equals(row[7]))
                .discountPercent(row[8] != null ? ((Number) row[8]).intValue() : 0)
                .rating(row[9] != null ? ((Number) row[9]).floatValue() : 0)
                .city(cityResponse)
                .minPrice(minPrice)
                .images(imagesResponse)
                .facilities(new ArrayList<>())
                .roomTypes(new ArrayList<>())
                .build();
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
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, Message.HOTEL_NOT_FOUND));
        return mapToResponse(hotel);
    }

    @Override
    @Transactional
    public HotelResponse addFacility(int hotelId, int facilityId) {
        Hotel hotel = hotelRepository.findById(hotelId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, Message.HOTEL_NOT_FOUND));
        validateHotelOwnership(hotel);
        Facility facility = facilityRepository.findById(facilityId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, Message.FACILITY_INVALID));

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
        Hotel hotel = hotelRepository.findById(hotelId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, Message.HOTEL_NOT_FOUND));
        validateHotelOwnership(hotel);
        if (!facilityRepository.existsById(facilityId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, Message.FACILITY_INVALID);
        }

        hotelFacilityRepository.deleteByHotel_IdHotelAndFacility_IdFacility(hotelId, facilityId);
        return getById(hotelId);
    }

    @Override
    @Transactional
    public HotelResponse create(HotelRequest request) {
        City city = cityRepository.findById(request.getCityId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, Message.CITY_INVALID));

        Hotel hotel = Hotel.builder()
                .name(request.getName())
                .city(city)
                .address(request.getAddress())
                .type(request.getType())
                .description(request.getDescription())
                .admin_hotel_id(isAdminHotel() ? getCurrentUserId() : request.getAdminHotelId())
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

        List<HotelFacility> facilities = syncHotelFacilities(saved, request.getFacilityIds());
        return mapToResponse(saved, facilities);
    }

    @Override
    @Transactional
    public HotelResponse update(int id, HotelRequest request) {
        Hotel hotel = hotelRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, Message.HOTEL_NOT_FOUND));
        validateHotelOwnership(hotel);

        City city = cityRepository.findById(request.getCityId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, Message.CITY_INVALID));

        hotel.setName(request.getName());
        hotel.setCity(city);
        hotel.setAddress(request.getAddress());
        hotel.setType(request.getType());
        hotel.setDescription(request.getDescription());
        hotel.setAdmin_hotel_id(isAdminHotel() ? getCurrentUserId() : request.getAdminHotelId());
        hotel.setFeatured(request.isFeatured());
        hotel.setOnSale(request.isOnSale());
        hotel.setDiscount_percent(request.getDiscountPercent());
        hotel.setRating(request.getRating());

        Hotel saved = hotelRepository.save(hotel);
        List<HotelFacility> facilities = null;
        if (request.getFacilityIds() != null) {
            facilities = syncHotelFacilities(saved, request.getFacilityIds());
        }

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

        return facilities == null
                ? mapToResponse(hotelRepository.findById(saved.getIdHotel()).orElse(saved))
                : mapToResponse(saved, facilities);
    }

    @Override
    public void delete(int id) {
        Hotel hotel = hotelRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, Message.HOTEL_NOT_FOUND));
        validateHotelOwnership(hotel);
        hotelRepository.delete(hotel);
    }

    // E X C E L H A N D L I N G B A G I A N I N I
    @org.springframework.beans.factory.annotation.Value("${app.file.upload-path}")
    private String uploadPath;

    @Override
    @Transactional
    public void uploadExcel(MultipartFile file) throws Exception {
        // validasi file kosong
        if (file.isEmpty()) {
            throw new RuntimeException(Message.FILE_EMPTY);
        }

        String fileName = file.getOriginalFilename();
        if (fileName == null || !fileName.endsWith(".xlsx")) {
            throw new RuntimeException(Message.FILE_MUST_BE_EXCEL);
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
                        .orElseThrow(() -> new RuntimeException(String.format(Message.CITY_WITH_ID_NOT_FOUND, cityId)));
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

            Hotel saved = hotelRepository.save(newHotel);
            syncHotelFacilities(saved, parseFacilityIds(row.getCell(10)));
        }

        // workbook Excel harus ditutup setelah digunakan, agar tidak menghabiskan memory
        workbook.close();
    }

    @Override
    @Transactional(readOnly = true)
    public ByteArrayInputStream downloadExcel() throws Exception {
        String[] headers = {
                "ID Hotel",
                "Nama Hotel",
                "Kota",
                "Provinsi",
                "Alamat",
                "Tipe",
                "Rating",
                "Featured",
                "On Sale",
                "Diskon (%)",
                "Admin Hotel ID",
                "Jumlah Tipe Kamar",
                "Harga Termurah",
                "Fasilitas",
                "Jumlah Foto"
        };

        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Data Hotel");
            CellStyle headerStyle = workbook.createCellStyle();
            Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerStyle.setFont(headerFont);

            Row headerRow = sheet.createRow(0);
            for (int i = 0; i < headers.length; i++) {
                headerRow.createCell(i).setCellValue(headers[i]);
                headerRow.getCell(i).setCellStyle(headerStyle);
            }

            List<Hotel> hotels = hotelRepository.findAll().stream()
                    .sorted(Comparator.comparingInt(Hotel::getIdHotel))
                    .collect(Collectors.toList());

            int rowIndex = 1;
            for (Hotel hotel : hotels) {
                Row row = sheet.createRow(rowIndex++);
                row.createCell(0).setCellValue(hotel.getIdHotel());
                row.createCell(1).setCellValue(safeString(hotel.getName()));
                row.createCell(2).setCellValue(hotel.getCity() != null ? safeString(hotel.getCity().getName()) : "");
                row.createCell(3).setCellValue(hotel.getCity() != null ? safeString(hotel.getCity().getProvince()) : "");
                row.createCell(4).setCellValue(safeString(hotel.getAddress()));
                row.createCell(5).setCellValue(safeString(hotel.getType()));
                row.createCell(6).setCellValue(hotel.getRating());
                row.createCell(7).setCellValue(hotel.isFeatured() ? "Ya" : "Tidak");
                row.createCell(8).setCellValue(hotel.isOnSale() ? "Ya" : "Tidak");
                row.createCell(9).setCellValue(hotel.getDiscount_percent());
                row.createCell(10).setCellValue(hotel.getAdmin_hotel_id());
                row.createCell(11).setCellValue(hotel.getRoomTypes() != null ? hotel.getRoomTypes().size() : 0);
                Long minPrice = getMinRoomPrice(hotel);
                row.createCell(12).setCellValue(minPrice != null ? minPrice : 0);
                row.createCell(13).setCellValue(formatFacilities(hotel));
                row.createCell(14).setCellValue(hotel.getImages() != null ? hotel.getImages().size() : 0);
            }

            for (int i = 0; i < headers.length; i++) {
                sheet.autoSizeColumn(i);
            }

            workbook.write(outputStream);
            return new ByteArrayInputStream(outputStream.toByteArray());
        }
    }

    @Override
    public java.io.ByteArrayInputStream generateUploadTemplate() throws Exception {
        String[] headers = {
                "Nama Hotel",
                "City ID",
                "Alamat",
                "Tipe",
                "Deskripsi",
                "Admin Hotel ID",
                "Featured",
                "On Sale",
                "Diskon (%)",
                "Rating",
                "Facility IDs"
        };

        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Template Hotel");
            CellStyle headerStyle = workbook.createCellStyle();
            Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerStyle.setFont(headerFont);

            Row headerRow = sheet.createRow(0);
            for (int i = 0; i < headers.length; i++) {
                headerRow.createCell(i).setCellValue(headers[i]);
                headerRow.getCell(i).setCellStyle(headerStyle);
            }

            Row exampleRow = sheet.createRow(1);
            exampleRow.createCell(0).setCellValue("Contoh Hotel");
            exampleRow.createCell(1).setCellValue(1);
            exampleRow.createCell(2).setCellValue("Jl. Contoh No. 1");
            exampleRow.createCell(3).setCellValue("Bintang 4");
            exampleRow.createCell(4).setCellValue("Deskripsi hotel");
            exampleRow.createCell(5).setCellValue(1);
            exampleRow.createCell(6).setCellValue(true);
            exampleRow.createCell(7).setCellValue(false);
            exampleRow.createCell(8).setCellValue(0);
            exampleRow.createCell(9).setCellValue(4.5);
            exampleRow.createCell(10).setCellValue("1,2,5");

            for (int i = 0; i < headers.length; i++) {
                sheet.autoSizeColumn(i);
            }

            workbook.write(outputStream);
            return new ByteArrayInputStream(outputStream.toByteArray());
        }
    }

    private List<HotelFacility> syncHotelFacilities(Hotel hotel, List<Integer> facilityIds) {
        Set<Integer> requestedIds = facilityIds == null
                ? Set.of()
                : facilityIds.stream()
                .filter(java.util.Objects::nonNull)
                .collect(Collectors.toCollection(LinkedHashSet::new));

        List<Facility> facilities = facilityRepository.findAllById(requestedIds);
        if (facilities.size() != requestedIds.size()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, Message.FACILITY_IDS_INVALID);
        }

        hotelFacilityRepository.deleteByHotel_IdHotel(hotel.getIdHotel());
        hotelFacilityRepository.flush();

        List<HotelFacility> relations = facilities.stream()
                .map(facility -> HotelFacility.builder()
                        .hotel(hotel)
                        .facility(facility)
                        .build())
                .collect(Collectors.toList());

        return relations.isEmpty() ? relations : hotelFacilityRepository.saveAll(relations);
    }

    private List<Integer> parseFacilityIds(Cell cell) {
        if (cell == null || cell.getCellType() == CellType.BLANK) {
            return List.of();
        }

        String value = cell.getCellType() == CellType.NUMERIC
                ? String.valueOf((int) cell.getNumericCellValue())
                : cell.toString();

        try {
            return java.util.Arrays.stream(value.split(","))
                    .map(String::trim)
                    .filter(item -> !item.isEmpty())
                    .map(Integer::valueOf)
                    .collect(Collectors.toList());
        } catch (NumberFormatException exception) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, Message.FACILITY_IDS_INVALID);
        }
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

    private String normalizeSortBy(String sortBy) {
        if ("price_asc".equalsIgnoreCase(sortBy)) {
            return "price_asc";
        }
        if ("price_desc".equalsIgnoreCase(sortBy)) {
            return "price_desc";
        }
        if ("rating".equalsIgnoreCase(sortBy)) {
            return "rating";
        }
        return "default";
    }

    private int safePage(Integer page) {
        return page != null && page >= 0 ? page : 0;
    }

    private int safePageSize(Integer size) {
        return size != null && size > 0 ? Math.min(size, 25) : 25;
    }

    private List<Hotel> applyPagination(List<Hotel> hotels, Integer page, Integer size) {
        if (page == null && size == null) {
            return hotels;
        }

        int safePage = safePage(page);
        int safeSize = safePageSize(size);
        int fromIndex = Math.min(safePage * safeSize, hotels.size());
        int toIndex = Math.min(fromIndex + safeSize, hotels.size());
        return hotels.subList(fromIndex, toIndex);
    }

    private PageMetadata buildPagination(long totalItems, int returnedItems, Integer page, Integer size) {
        boolean paged = page != null || size != null;
        int safePage = paged ? safePage(page) : 0;
        int safeSize = paged ? safePageSize(size) : returnedItems;
        int totalPages = safeSize > 0 ? (int) Math.ceil((double) totalItems / safeSize) : 0;

        return PageMetadata.builder()
                .currentPage(safePage)
                .pageSize(safeSize)
                .totalItems(totalItems)
                .totalPages(totalPages)
                .hasNext(paged && safePage + 1 < totalPages)
                .hasPrevious(paged && safePage > 0 && totalPages > 0)
                .build();
    }

    private int safeLimit(Integer limit) {
        return limit != null && limit > 0 ? Math.min(limit, 50) : 6;
    }

    private String safeString(String value) {
        return value != null ? value : "";
    }

    private String formatFacilities(Hotel hotel) {
        if (hotel.getFacilities() == null || hotel.getFacilities().isEmpty()) {
            return "";
        }

        return hotel.getFacilities().stream()
                .map(HotelFacility::getFacility)
                .filter(java.util.Objects::nonNull)
                .map(Facility::getName)
                .filter(name -> name != null && !name.isBlank())
                .collect(Collectors.joining(", "));
    }
}
