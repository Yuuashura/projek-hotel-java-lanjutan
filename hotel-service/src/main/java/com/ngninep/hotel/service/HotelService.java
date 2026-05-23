package com.ngninep.hotel.service;

import com.ngninep.hotel.dto.req.HotelRequest;
import com.ngninep.hotel.dto.res.HotelResponse;

import java.io.ByteArrayInputStream;
import java.util.List;

import org.springframework.web.multipart.MultipartFile;

public interface HotelService {
    List<HotelResponse> getAll();
    List<HotelResponse> search(String keyword, Integer cityId, Integer page, Integer size);
    List<HotelResponse> getFeatured();
    HotelResponse getById(int id);
    HotelResponse create(HotelRequest request);
    HotelResponse update(int id, HotelRequest request);
    void delete(int id);

    // Excel
    public void uploadExcel(MultipartFile file) throws Exception;
    public ByteArrayInputStream downloadExcel() throws Exception;
    public ByteArrayInputStream generateUploadTemplate() throws Exception;

}
