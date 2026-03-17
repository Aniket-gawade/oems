package com.project.oems.oemsapi.api;

import com.project.oems.oemsapi.application.security.TraderIdExtractor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/v1/orders")
public class OrderSecurityProbeController {

    private final TraderIdExtractor traderIdExtractor;

    public OrderSecurityProbeController(TraderIdExtractor traderIdExtractor) {
        this.traderIdExtractor = traderIdExtractor;
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> placeOrder(Authentication authentication) {
        String traderId = traderIdExtractor.extract(authentication);
        Map<String, Object> body = Map.of(
                "status", "NEW",
                "traderId", traderId,
                "orderId", UUID.randomUUID().toString()
        );
        return ResponseEntity.status(HttpStatus.ACCEPTED).body(body);
    }

    @GetMapping("/{orderId}")
    public ResponseEntity<Map<String, Object>> getOrder(@PathVariable String orderId,
                                                        Authentication authentication) {
        String traderId = traderIdExtractor.extract(authentication);
        Map<String, Object> body = Map.of(
                "orderId", orderId,
                "status", "NEW",
                "traderId", traderId
        );
        return ResponseEntity.ok(body);
    }
}
