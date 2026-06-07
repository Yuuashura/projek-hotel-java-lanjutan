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

    @Bean
    public WebClient xenditWebClient(
            WebClient.Builder builder,
            @Value("${xendit.base-url:https://api.xendit.co}") String xenditBaseUrl,
            @Value("${xendit.api-key:}") String apiKey
    ) {
        String baseUrl = xenditBaseUrl != null ? xenditBaseUrl.replaceAll("/+$", "") : "https://api.xendit.co";
        WebClient.Builder webClientBuilder = builder.baseUrl(baseUrl);
        if (apiKey != null && !apiKey.isBlank()) {
            webClientBuilder.defaultHeaders(headers -> headers.setBasicAuth(apiKey, ""));
        }
        return webClientBuilder.build();
    }
}
