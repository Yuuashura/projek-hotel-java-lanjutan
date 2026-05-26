package com.ngninep.hotel.service;

import com.ngninep.hotel.dto.req.HotelRequest;
import com.ngninep.hotel.dto.res.HotelResponse;
import com.ngninep.hotel.dto.res.PagedResult;

import java.io.ByteArrayInputStream;
import java.util.List;
import java.util.Map;

import org.springframework.web.multipart.MultipartFile;

public interface HotelService {
    List<HotelResponse> getAll();
    PagedResult<HotelResponse> search(String keyword, Integer cityId, Long minPrice, Long maxPrice,
                                      Float minRating, Boolean featured, Boolean onSale,
                                      List<Integer> facilityIds, String sortBy, Integer page, Integer size);
    List<HotelResponse> getFeatured();
    List<HotelResponse> getLatest(Integer limit);
    List<HotelResponse> getOnSale(Integer limit);
    List<Map<String, Object>> getPopularCities(Integer limit);
    List<Map<String, Object>> getPopularFacilities(Integer limit);
    Map<String, Object> getStats();
    HotelResponse getById(int id);
    HotelResponse addFacility(int hotelId, int facilityId);
    HotelResponse removeFacility(int hotelId, int facilityId);
    HotelResponse create(HotelRequest request);
    HotelResponse update(int id, HotelRequest request);
    void delete(int id);

    // Excel
    public void uploadExcel(MultipartFile file) throws Exception;
    public ByteArrayInputStream downloadExcel() throws Exception;
    public ByteArrayInputStream generateUploadTemplate() throws Exception;

}
