package com.project.oems.oemsapi.application.order;

import com.project.oems.common.domain.exception.BusinessException;
import com.project.oems.common.error.ApiError;
import com.project.oems.common.error.ErrorCode;
import com.project.oems.common.web.CorrelationContext;
import com.project.oems.contracts.order.OrderStatus;
import com.project.oems.oemsapi.api.order.PlaceOrderResponse;
import com.project.oems.oemsapi.domain.order.Order;
import com.project.oems.oemsapi.domain.order.OrderDraft;
import com.project.oems.oemsapi.infrastructure.order.IdempotencyKeyEntity;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;

@Service
public class IdempotentOrderPlacementService {

    private final OrderApplicationService orderApplicationService;
    private final IdempotencyService idempotencyService;

    public IdempotentOrderPlacementService(OrderApplicationService orderApplicationService,
                                           IdempotencyService idempotencyService) {
        this.orderApplicationService = orderApplicationService;
        this.idempotencyService = idempotencyService;
    }

    @Transactional
    public OrderHttpResponse placeOrder(String idempotencyKey,
                                        String requestHash,
                                        String requestPath,
                                        OrderDraft orderDraft) {
        Instant now = Instant.now();
        IdempotencyService.BeginResult beginResult = idempotencyService.begin(idempotencyKey, requestHash, now);
        if (beginResult.isReplay()) {
            return new OrderHttpResponse(beginResult.replayStatus(), beginResult.replayBody(), true);
        }

        IdempotencyKeyEntity reservation = beginResult.reservation();
        try {
            OrderPlacementResult placementResult = orderApplicationService.placeOrder(orderDraft);
            return handlePlacementResult(placementResult, requestPath, reservation);
        } catch (BusinessException ex) {
            HttpStatus status = resolveStatus(ex.getErrorCode());
            ApiError error = buildApiError(ex.getErrorCode(), ex.getMessage(), status.value(), requestPath);
            idempotencyService.complete(reservation, status.value(), error, null, Instant.now());
            return new OrderHttpResponse(status.value(), error, false);
        }
    }

    private OrderHttpResponse handlePlacementResult(OrderPlacementResult placementResult,
                                                    String requestPath,
                                                    IdempotencyKeyEntity reservation) {
        Order order = placementResult.order();
        if (placementResult.isRejected()) {
            HttpStatus status = resolveStatus(placementResult.rejectionErrorCode());
            ApiError error = buildApiError(
                    placementResult.rejectionErrorCode(),
                    placementResult.rejectionMessage(),
                    status.value(),
                    requestPath
            );
            idempotencyService.complete(
                    reservation,
                    status.value(),
                    error,
                    order.id().toString(),
                    Instant.now()
            );
            return new OrderHttpResponse(status.value(), error, false);
        }

        PlaceOrderResponse response = new PlaceOrderResponse(
                order.id(),
                OrderStatus.NEW,
                order.symbol(),
                order.side(),
                order.orderType(),
                order.quantity(),
                order.price(),
                order.createdAt()
        );
        idempotencyService.complete(
                reservation,
                HttpStatus.CREATED.value(),
                response,
                order.id().toString(),
                Instant.now()
        );
        return new OrderHttpResponse(HttpStatus.CREATED.value(), response, false);
    }

    private ApiError buildApiError(ErrorCode errorCode,
                                   String message,
                                   int status,
                                   String path) {
        return new ApiError(
                errorCode,
                message,
                status,
                path,
                Instant.now(),
                resolveTraceId(),
                Map.of()
        );
    }

    private HttpStatus resolveStatus(ErrorCode errorCode) {
        return switch (errorCode) {
            case INSTRUMENT_NOT_FOUND -> HttpStatus.NOT_FOUND;
            case IDEMPOTENCY_CONFLICT -> HttpStatus.CONFLICT;
            case INSTRUMENT_NOT_TRADABLE, INSTRUMENT_QTY_OUT_OF_RANGE, INSTRUMENT_TICK_SIZE_VIOLATION,
                 RISK_MAX_QTY_EXCEEDED, RISK_MAX_NOTIONAL_EXCEEDED, RISK_PRICE_BAND_EXCEEDED ->
                    HttpStatus.UNPROCESSABLE_CONTENT;
            case VALIDATION_ERROR -> HttpStatus.BAD_REQUEST;
            default -> HttpStatus.BAD_REQUEST;
        };
    }

    private String resolveTraceId() {
        String traceId = CorrelationContext.getTraceId();
        if (StringUtils.hasText(traceId)) {
            return traceId;
        }
        return UUID.randomUUID().toString();
    }
}
