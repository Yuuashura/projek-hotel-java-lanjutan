package com.ngninep.hotel.config;

import com.ngninep.hotel.service.FileStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
@RequiredArgsConstructor
public class WebMvcConfig implements WebMvcConfigurer {

    private final FileStorageService fileStorageService;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/api/hotels/uploads/**")
                .addResourceLocations(fileStorageService.getHotelImageRoot().toUri().toString());
        registry.addResourceHandler("/api/room-types/uploads/**")
                .addResourceLocations(fileStorageService.getRoomTypeImageRoot().toUri().toString());
    }
}
