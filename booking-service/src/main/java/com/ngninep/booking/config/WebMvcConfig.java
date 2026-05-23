package com.ngninep.booking.config;

import com.ngninep.booking.service.FileStorageService;
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
        registry.addResourceHandler("/api/bookings/uploads/payment-proofs/**")
                .addResourceLocations(fileStorageService.getPaymentProofRoot().toUri().toString());
    }
}
