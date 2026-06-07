package com.ngninep.gateway.filter;

import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;

import reactor.core.publisher.Mono;

@Component
public class RateLimitFilter implements GlobalFilter{
    @Value("${max_request}")
    int MAX_REQUESTS_PER_MINUTE;

    @Value("${time_window_second}")
    Long WINDOW_SECOND;

    private final Map<String, ReqInfo> req = new ConcurrentHashMap<>();

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        
        String ip = 
            exchange.getRequest()
                    .getRemoteAddress()
                    .getAddress()
                    .getHostAddress();

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
        return chain.filter(exchange);
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
