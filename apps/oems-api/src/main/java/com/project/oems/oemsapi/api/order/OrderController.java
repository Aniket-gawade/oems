package com.project.oems.oemsapi.api.order;

import com.project.oems.common.domain.exception.BusinessRuleViolation;
import com.project.oems.common.error.ErrorCode;
import com.project.oems.contracts.order.OrderStatus;
import com.project.oems.contracts.risk.RiskRejectCode;
import com.project.oems.oemsapi.application.refdata.InstrumentService;
import com.project.oems.oemsapi.application.risk.RiskCheckService;
import com.project.oems.oemsapi.application.security.TraderIdExtractor;
import com.project.oems.oemsapi.domain.order.OrderDraft;
import com.project.oems.oemsapi.domain.refdata.Instrument;
import com.project.oems.oemsapi.domain.risk.RiskCheckResult;
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

import java.time.Instant;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/v1/orders")
public class OrderController {

    private final TraderIdExtractor traderIdExtractor;
    private final InstrumentService instrumentService;
    private final RiskCheckService riskCheckService;

    public OrderController(TraderIdExtractor traderIdExtractor,
                           InstrumentService instrumentService,
                           RiskCheckService riskCheckService) {
        this.traderIdExtractor = traderIdExtractor;
        this.instrumentService = instrumentService;
        this.riskCheckService = riskCheckService;
    }

    @PostMapping
    public ResponseEntity<PlaceOrderResponse> placeOrder(@Valid @RequestBody PlaceOrderRequest request,
                                                         Authentication authentication) {
        String traderId = traderIdExtractor.extract(authentication);
        OrderDraft orderDraft = request.toDraft(traderId);

        Instrument instrument = instrumentService.validateTradable(
                orderDraft.symbol(),
                orderDraft.quantity(),
                orderDraft.price()
        );

        RiskCheckResult riskResult = riskCheckService.evaluate(orderDraft, instrument, traderId);
        if (riskResult.isFail()) {
            throw new BusinessRuleViolation(toErrorCode(riskResult.rejectCode()), riskResult.message());
        }

        PlaceOrderResponse response = new PlaceOrderResponse(
                UUID.randomUUID(),
                OrderStatus.NEW,
                orderDraft.symbol(),
                orderDraft.side(),
                orderDraft.orderType(),
                orderDraft.quantity(),
                orderDraft.price(),
                Instant.now()
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

    private ErrorCode toErrorCode(RiskRejectCode rejectCode) {
        return switch (rejectCode) {
            case RISK_MAX_QTY_EXCEEDED -> ErrorCode.RISK_MAX_QTY_EXCEEDED;
            case RISK_MAX_NOTIONAL_EXCEEDED -> ErrorCode.RISK_MAX_NOTIONAL_EXCEEDED;
            case RISK_PRICE_BAND_EXCEEDED -> ErrorCode.RISK_PRICE_BAND_EXCEEDED;
        };
    }
}
