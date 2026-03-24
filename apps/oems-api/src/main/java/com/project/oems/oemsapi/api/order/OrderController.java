package com.project.oems.oemsapi.api.order;

import com.project.oems.common.domain.exception.BusinessRuleViolation;
import com.project.oems.common.error.ErrorCode;
import com.project.oems.common.web.CorrelationContext;
import com.project.oems.oemsapi.application.order.CanonicalRequestHashUtil;
import com.project.oems.oemsapi.application.order.IdempotentOrderPlacementService;
import com.project.oems.oemsapi.application.order.OrderHttpResponse;
import com.project.oems.oemsapi.application.security.TraderIdExtractor;
import com.project.oems.oemsapi.domain.order.OrderDraft;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequestMapping("/v1/orders")
public class OrderController {

    private static final Logger log = LoggerFactory.getLogger(OrderController.class);

    private final TraderIdExtractor traderIdExtractor;
    private final CanonicalRequestHashUtil canonicalRequestHashUtil;
    private final IdempotentOrderPlacementService idempotentOrderPlacementService;

    public OrderController(TraderIdExtractor traderIdExtractor,
                           CanonicalRequestHashUtil canonicalRequestHashUtil,
                           IdempotentOrderPlacementService idempotentOrderPlacementService) {
        this.traderIdExtractor = traderIdExtractor;
        this.canonicalRequestHashUtil = canonicalRequestHashUtil;
        this.idempotentOrderPlacementService = idempotentOrderPlacementService;
    }

    @PostMapping
    public ResponseEntity<?> placeOrder(@Valid @RequestBody PlaceOrderRequest request,
                                        @RequestHeader(name = "Idempotency-Key", required = false) String idempotencyKey,
                                        Authentication authentication,
                                        HttpServletRequest httpServletRequest) {
        String normalizedIdempotencyKey = normalizeIdempotencyKey(idempotencyKey);
        String traderId = traderIdExtractor.extract(authentication);
        OrderDraft orderDraft = request.toDraft(traderId);
        String requestHash = canonicalRequestHashUtil.hash(canonicalPayloadForHash(orderDraft));
        String traceId = CorrelationContext.getTraceId();

        log.info("placeOrder request received traderId={} clientOrderId={} symbol={} orderType={} idempotencyKey={} traceId={}",
                traderId, orderDraft.clientOrderId(), orderDraft.symbol(), orderDraft.orderType(), normalizedIdempotencyKey, traceId);

        OrderHttpResponse response = idempotentOrderPlacementService.placeOrder(
                normalizedIdempotencyKey,
                requestHash,
                httpServletRequest.getRequestURI(),
                orderDraft
        );

        if (response.replay()) {
            log.info("placeOrder replayed idempotencyKey={} status={} traceId={}",
                    normalizedIdempotencyKey, response.status(), traceId);
        } else {
            log.info("placeOrder completed idempotencyKey={} status={} traceId={}",
                    normalizedIdempotencyKey, response.status(), traceId);
        }

        return ResponseEntity.status(response.status()).body(response.body());
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

    private String normalizeIdempotencyKey(String idempotencyKey) {
        if (!StringUtils.hasText(idempotencyKey)) {
            throw new BusinessRuleViolation(
                    ErrorCode.VALIDATION_ERROR,
                    "Idempotency-Key header is required."
            );
        }
        String normalized = idempotencyKey.trim();
        if (normalized.length() < 8 || normalized.length() > 128) {
            throw new BusinessRuleViolation(
                    ErrorCode.VALIDATION_ERROR,
                    "Idempotency-Key header must be between 8 and 128 characters."
            );
        }
        return normalized;
    }

    private Map<String, Object> canonicalPayloadForHash(OrderDraft orderDraft) {
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("traderId", orderDraft.traderId());
        payload.put("clientOrderId", orderDraft.clientOrderId());
        payload.put("symbol", orderDraft.symbol());
        payload.put("side", orderDraft.side().name());
        payload.put("orderType", orderDraft.orderType().name());
        payload.put("quantity", normalizeDecimal(orderDraft.quantity()));
        payload.put("price", orderDraft.price() == null ? null : normalizeDecimal(orderDraft.price()));
        return payload;
    }

    private String normalizeDecimal(BigDecimal value) {
        return value.stripTrailingZeros().toPlainString();
    }
}
