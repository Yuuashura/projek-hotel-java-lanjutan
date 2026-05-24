package com.ngninep.hotel.controller;

import com.ngninep.hotel.dto.req.HotelRequest;
import com.ngninep.hotel.dto.res.HotelResponse;
import com.ngninep.hotel.dto.res.WebResponse;
import com.ngninep.hotel.repository.HotelImageRepository;
import com.ngninep.hotel.service.FileStorageService;
import com.ngninep.hotel.service.HotelService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/hotels")
public class HotelController {

    private final HotelService hotelService;
    private final FileStorageService fileStorageService;

    public HotelController(HotelService hotelService, FileStorageService fileStorageService) {
        this.hotelService = hotelService;
        this.fileStorageService = fileStorageService;
    }


    // Publik — browse & search hotel
    @GetMapping
    public ResponseEntity<WebResponse<List<HotelResponse>>> getAll(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Integer cityId,
            @RequestParam(required = false) Long minPrice,
            @RequestParam(required = false) Long maxPrice,
            @RequestParam(required = false) Float minRating,
            @RequestParam(required = false) Boolean featured,
            @RequestParam(required = false) Boolean onSale,
            @RequestParam(required = false) List<Integer> facilityIds,
            @RequestParam(required = false) String sortBy,
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size) {
        WebResponse<List<HotelResponse>> response = WebResponse.<List<HotelResponse>>builder()
                .status("200")
                .message("Success")
                .data(hotelService.search(keyword, cityId, minPrice, maxPrice, minRating, featured, onSale, facilityIds, sortBy, page, size))
                .build();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/featured")
    public ResponseEntity<WebResponse<List<HotelResponse>>> getFeatured() {
        WebResponse<List<HotelResponse>> response = WebResponse.<List<HotelResponse>>builder()
                .status("200")
                .message("Success")
                .data(hotelService.getFeatured())
                .build();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/latest")
    public ResponseEntity<WebResponse<List<HotelResponse>>> getLatest(@RequestParam(required = false) Integer limit) {
        WebResponse<List<HotelResponse>> response = WebResponse.<List<HotelResponse>>builder()
                .status("200")
                .message("Success")
                .data(hotelService.getLatest(limit))
                .build();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/on-sale")
    public ResponseEntity<WebResponse<List<HotelResponse>>> getOnSale(@RequestParam(required = false) Integer limit) {
        WebResponse<List<HotelResponse>> response = WebResponse.<List<HotelResponse>>builder()
                .status("200")
                .message("Success")
                .data(hotelService.getOnSale(limit))
                .build();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/popular-cities")
    public ResponseEntity<WebResponse<List<Map<String, Object>>>> getPopularCities(@RequestParam(required = false) Integer limit) {
        WebResponse<List<Map<String, Object>>> response = WebResponse.<List<Map<String, Object>>>builder()
                .status("200")
                .message("Success")
                .data(hotelService.getPopularCities(limit))
                .build();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/popular-facilities")
    public ResponseEntity<WebResponse<List<Map<String, Object>>>> getPopularFacilities(@RequestParam(required = false) Integer limit) {
        WebResponse<List<Map<String, Object>>> response = WebResponse.<List<Map<String, Object>>>builder()
                .status("200")
                .message("Success")
                .data(hotelService.getPopularFacilities(limit))
                .build();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/stats")
    public ResponseEntity<WebResponse<Map<String, Object>>> getStats() {
        WebResponse<Map<String, Object>> response = WebResponse.<Map<String, Object>>builder()
                .status("200")
                .message("Success")
                .data(hotelService.getStats())
                .build();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<WebResponse<HotelResponse>> getById(@PathVariable int id) {
        WebResponse<HotelResponse> response = WebResponse.<HotelResponse>builder()
                .status("200")
                .message("Success")
                .data(hotelService.getById(id))
                .build();
        return ResponseEntity.ok(response);
    }

    // Admin Hotel & Admin Aplikasi — kelola hotel
    @PostMapping
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN_HOTEL', 'ROLE_ADMIN_APP')")
    public ResponseEntity<WebResponse<HotelResponse>> create(@Valid @RequestBody HotelRequest request) {
        WebResponse<HotelResponse> response = WebResponse.<HotelResponse>builder()
                .status("200")
                .message("Success")
                .data(hotelService.create(request))
                .build();
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN_HOTEL', 'ROLE_ADMIN_APP')")
    public ResponseEntity<WebResponse<HotelResponse>> update(@PathVariable int id,
            @Valid @RequestBody HotelRequest request) {
        WebResponse<HotelResponse> response = WebResponse.<HotelResponse>builder()
                .status("200")
                .message("Success")
                .data(hotelService.update(id, request))
                .build();
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/facilities/{facilityId}")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN_HOTEL', 'ROLE_ADMIN_APP')")
    public ResponseEntity<WebResponse<HotelResponse>> addFacility(@PathVariable int id, @PathVariable int facilityId) {
        WebResponse<HotelResponse> response = WebResponse.<HotelResponse>builder()
                .status("200")
                .message("Fasilitas hotel berhasil ditambahkan")
                .data(hotelService.addFacility(id, facilityId))
                .build();
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}/facilities/{facilityId}")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN_HOTEL', 'ROLE_ADMIN_APP')")
    public ResponseEntity<WebResponse<HotelResponse>> removeFacility(@PathVariable int id, @PathVariable int facilityId) {
        WebResponse<HotelResponse> response = WebResponse.<HotelResponse>builder()
                .status("200")
                .message("Fasilitas hotel berhasil dihapus")
                .data(hotelService.removeFacility(id, facilityId))
                .build();
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN_HOTEL', 'ROLE_ADMIN_APP')")
    public ResponseEntity<WebResponse<Void>> delete(@PathVariable int id) {
        hotelService.delete(id);
        WebResponse<Void> response = WebResponse.<Void>builder()
                .status("200")
                .message("Success")
                .build();
        return ResponseEntity.ok(response);
    }

    @PostMapping("/uploadHotel")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN_HOTEL', 'ROLE_ADMIN_APP')")
    public ResponseEntity<String> uploadExcel(@RequestParam("file") MultipartFile file) {
        try{
            hotelService.uploadExcel(file);
            return ResponseEntity.ok("Excel berhasil diunggah");
        }catch(Exception e){
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping(value = "/upload-excel", consumes = "multipart/form-data")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN_HOTEL', 'ROLE_ADMIN_APP')")
    public ResponseEntity<WebResponse<Void>> uploadExcelFile(@RequestParam("file") MultipartFile file) {
        try {
            hotelService.uploadExcel(file);
            WebResponse<Void> response = WebResponse.<Void>builder()
                    .status("200")
                    .message("Excel berhasil diunggah")
                    .build();
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage());
        }
    }

    @PostMapping(value = "/upload-image", consumes = "multipart/form-data")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN_HOTEL', 'ROLE_ADMIN_APP')")
    public ResponseEntity<WebResponse<Map<String, String>>> uploadImage(@RequestParam("file") MultipartFile file) {
        String imageUrl = fileStorageService.saveHotelImage(file);
        WebResponse<Map<String, String>> response = WebResponse.<Map<String, String>>builder()
                .status("200")
                .message("Gambar hotel berhasil diunggah")
                .data(Map.of("url", imageUrl))
                .build();
        return ResponseEntity.ok(response);
    }
}
