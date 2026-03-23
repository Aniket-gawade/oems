package com.project.oems.oemsapi.api.order;

import com.project.oems.common.domain.exception.BusinessRuleViolation;
import com.project.oems.common.web.CorrelationContext;
import com.project.oems.contracts.order.OrderStatus;
import com.project.oems.oemsapi.application.order.OrderApplicationService;
import com.project.oems.oemsapi.application.order.OrderPlacementResult;
import com.project.oems.oemsapi.application.security.TraderIdExtractor;
import com.project.oems.oemsapi.domain.order.OrderDraft;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/v1/orders")
public class OrderController {

    private static final Logger log = LoggerFactory.getLogger(OrderController.class);

    private final TraderIdExtractor traderIdExtractor;
    private final OrderApplicationService orderApplicationService;

    public OrderController(TraderIdExtractor traderIdExtractor,
                           OrderApplicationService orderApplicationService) {
        this.traderIdExtractor = traderIdExtractor;
        this.orderApplicationService = orderApplicationService;
    }

    @PostMapping
    public ResponseEntity<PlaceOrderResponse> placeOrder(@Valid @RequestBody PlaceOrderRequest request,
                                                         Authentication authentication) {
        String traderId = traderIdExtractor.extract(authentication);
        OrderDraft orderDraft = request.toDraft(traderId);
        String traceId = CorrelationContext.getTraceId();

        log.info("placeOrder request received traderId={} clientOrderId={} symbol={} orderType={} traceId={}",
                traderId, orderDraft.clientOrderId(), orderDraft.symbol(), orderDraft.orderType(), traceId);

        OrderPlacementResult result = orderApplicationService.placeOrder(orderDraft);
        if (result.isRejected()) {
            log.info("placeOrder rejected orderId={} code={} traceId={}",
                    result.order().id(), result.rejectionErrorCode(), traceId);
            throw new BusinessRuleViolation(result.rejectionErrorCode(), result.rejectionMessage());
        }

        log.info("placeOrder accepted orderId={} status={} traceId={}",
                result.order().id(), result.order().status(), traceId);

        PlaceOrderResponse response = new PlaceOrderResponse(
                result.order().id(),
                OrderStatus.NEW,
                result.order().symbol(),
                result.order().side(),
                result.order().orderType(),
                result.order().quantity(),
                result.order().price(),
                result.order().createdAt()
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
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
