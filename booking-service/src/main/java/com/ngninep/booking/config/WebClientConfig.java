package com.ngninep.booking.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.client.WebClient;

@Configuration
public class WebClientConfig {

    @Bean
    public WebClient hotelServiceWebClient(
            WebClient.Builder builder,
            @Value("${hotel.service.url:http://localhost:8082}") String hotelServiceUrl
    ) {
        String baseUrl = hotelServiceUrl != null ? hotelServiceUrl.replaceAll("/+$", "") : "http://localhost:8082";
        return builder.baseUrl(baseUrl).build();
    }
}
