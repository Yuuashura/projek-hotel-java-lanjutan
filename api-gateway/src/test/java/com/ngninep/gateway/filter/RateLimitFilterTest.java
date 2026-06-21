package com.ngninep.gateway.filter;

import org.junit.jupiter.api.Test;
import org.springframework.mock.http.server.reactive.MockServerHttpRequest;
import org.springframework.mock.web.server.MockServerWebExchange;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.net.InetSocketAddress;
import java.util.concurrent.atomic.AtomicReference;

import static org.junit.jupiter.api.Assertions.assertEquals;

class RateLimitFilterTest {

    @Test
    void replacesForgedInternalClientIpHeader() {
        RateLimitFilter filter = new RateLimitFilter();
        ReflectionTestUtils.setField(filter, "MAX_REQUESTS_PER_MINUTE", 100);
        ReflectionTestUtils.setField(filter, "WINDOW_SECOND", 300L);
        ReflectionTestUtils.setField(filter, "trustedProxyHops", 0);

        MockServerHttpRequest request = MockServerHttpRequest
                .post("/api/auth/login")
                .remoteAddress(new InetSocketAddress("192.0.2.44", 41234))
                .header("X-NgiNep-Client-IP", "198.51.100.99")
                .build();
        ServerWebExchange exchange = MockServerWebExchange.from(request);
        AtomicReference<ServerWebExchange> forwardedExchange = new AtomicReference<>();

        filter.filter(exchange, currentExchange -> {
            forwardedExchange.set(currentExchange);
            return Mono.empty();
        }).block();

        assertEquals(
                "192.0.2.44",
                forwardedExchange.get().getRequest().getHeaders().getFirst("X-NgiNep-Client-IP")
        );
    }
}
