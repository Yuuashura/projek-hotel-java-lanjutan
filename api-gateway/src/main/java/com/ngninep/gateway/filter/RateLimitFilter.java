package com.ngninep.gateway.filter;

import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.web.server.ServerWebExchange;

import reactor.core.publisher.Mono;

@Component
public class RateLimitFilter implements GlobalFilter{
    @Value("${max_request}")
    int MAX_REQUESTS_PER_MINUTE;

    @Value("${time_window_second}")
    Long WINDOW_SECOND;

    @Value("${security.trusted-proxy-hops:0}")
    int trustedProxyHops;

    private final Map<String, ReqInfo> req = new ConcurrentHashMap<>();

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        
        String ip = resolveClientIp(exchange);
        ServerHttpRequest request = exchange.getRequest().mutate()
                .headers(headers -> {
                    headers.remove("X-NgiNep-Client-IP");
                    headers.set("X-NgiNep-Client-IP", ip);
                })
                .build();
        ServerWebExchange sanitizedExchange = exchange.mutate().request(request).build();

        Long now = Instant.now().getEpochSecond();

        ReqInfo info = 
                    req.getOrDefault(
                        ip,
                    new ReqInfo(0, now)
                );

        if ((now - info.windowStart) >= WINDOW_SECOND) {
            info.count = 0;
            info.windowStart = now;
        }
        info.count++;
        req.put(ip, info);

        if (info.count > MAX_REQUESTS_PER_MINUTE) {
            exchange.getResponse().setStatusCode(HttpStatus.TOO_MANY_REQUESTS);
            
            exchange.getResponse()
                    .getHeaders()
                    .add("Content-Type", "application/json");
            
            String body = """
                    {
                        "status": "429",
                        "message": "Too Many Requests"
                    } 
                    """; 
            
            var buffer =
                exchange.getResponse()
                        .bufferFactory()
                        .wrap(body.getBytes());
            return exchange.getResponse()
                            .writeWith(Mono.just(buffer));
        }
        return chain.filter(sanitizedExchange);
    }

    private String resolveClientIp(ServerWebExchange exchange) {
        String remoteIp = exchange.getRequest().getRemoteAddress() == null
                ? "unknown"
                : exchange.getRequest().getRemoteAddress().getAddress().getHostAddress();

        if (trustedProxyHops <= 0) {
            return remoteIp;
        }

        String forwardedFor = exchange.getRequest().getHeaders().getFirst("X-Forwarded-For");
        if (forwardedFor == null || forwardedFor.isBlank()) {
            return remoteIp;
        }

        String[] addresses = forwardedFor.split(",");
        int clientIndex = addresses.length - trustedProxyHops;
        if (clientIndex < 0 || clientIndex >= addresses.length) {
            return remoteIp;
        }

        String candidate = addresses[clientIndex].trim();
        return candidate.isBlank() ? remoteIp : candidate;
    }


    static class ReqInfo {
        int count;
        long windowStart;
        
        public ReqInfo(int count, long windowStart) {
            this.count = count;
            this.windowStart = windowStart;
        }
        
    }


}
