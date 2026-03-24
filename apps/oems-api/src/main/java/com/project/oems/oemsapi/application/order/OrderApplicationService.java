package com.project.oems.oemsapi.application.order;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.project.oems.common.domain.event.OrderEventType;
import com.project.oems.common.error.ErrorCode;
import com.project.oems.common.web.CorrelationContext;
import com.project.oems.contracts.order.OrderStatus;
import com.project.oems.contracts.risk.RiskRejectCode;
import com.project.oems.oemsapi.application.refdata.InstrumentService;
import com.project.oems.oemsapi.application.risk.RiskCheckService;
import com.project.oems.oemsapi.domain.order.Order;
import com.project.oems.oemsapi.domain.order.OrderDraft;
import com.project.oems.oemsapi.domain.refdata.Instrument;
import com.project.oems.oemsapi.domain.risk.RiskCheckResult;
import com.project.oems.oemsapi.infrastructure.order.OrderEntity;
import com.project.oems.oemsapi.infrastructure.order.OrderEventEntity;
import com.project.oems.oemsapi.infrastructure.order.OrderEventRepository;
import com.project.oems.oemsapi.infrastructure.order.OrderMapper;
import com.project.oems.oemsapi.infrastructure.order.OrderRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.UUID;

@Service
public class OrderApplicationService {

    private final InstrumentService instrumentService;
    private final RiskCheckService riskCheckService;
    private final OrderNotionalCalculator orderNotionalCalculator;
    private final OrderRepository orderRepository;
    private final OrderEventRepository orderEventRepository;
    private final OrderMapper orderMapper;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public OrderApplicationService(InstrumentService instrumentService,
                                   RiskCheckService riskCheckService,
                                   OrderNotionalCalculator orderNotionalCalculator,
                                   OrderRepository orderRepository,
                                   OrderEventRepository orderEventRepository,
                                   OrderMapper orderMapper) {
        this.instrumentService = instrumentService;
        this.riskCheckService = riskCheckService;
        this.orderNotionalCalculator = orderNotionalCalculator;
        this.orderRepository = orderRepository;
        this.orderEventRepository = orderEventRepository;
        this.orderMapper = orderMapper;
    }

    public OrderPlacementResult placeOrder(OrderDraft orderDraft) {
        Instrument instrument = instrumentService.validateTradable(
                orderDraft.symbol(),
                orderDraft.quantity(),
                orderDraft.price()
        );

        RiskCheckResult riskResult = riskCheckService.evaluate(orderDraft, instrument, orderDraft.traderId());
        BigDecimal effectivePrice = extractEffectivePrice(riskResult);
        BigDecimal notional = orderNotionalCalculator.calculate(orderDraft, effectivePrice);
        Instant now = Instant.now();

        OrderStatus status = riskResult.isPass() ? OrderStatus.NEW : OrderStatus.REJECTED;
        String rejectionReason = riskResult.isFail() ? riskResult.rejectCode().name() : null;

        Order orderToSave = new Order(
                UUID.randomUUID(),
                orderDraft.clientOrderId(),
                orderDraft.traderId(),
                orderDraft.symbol(),
                orderDraft.side(),
                orderDraft.orderType(),
                orderDraft.quantity(),
                orderDraft.price(),
                notional,
                status,
                rejectionReason,
                now,
                now,
                0
        );

        OrderEntity savedEntity = orderRepository.save(orderMapper.toEntity(orderToSave));
        Order savedOrder = orderMapper.toDomain(savedEntity);

        String traceId = CorrelationContext.getTraceId();
        persistOrderEvent(savedOrder.id(), OrderEventType.ORDER_RECEIVED, receivedPayload(orderDraft), traceId, now);
        if (riskResult.isPass()) {
            persistOrderEvent(savedOrder.id(), OrderEventType.ORDER_ACCEPTED, acceptedPayload(savedOrder), traceId, now);
            return OrderPlacementResult.accepted(savedOrder);
        }

        persistOrderEvent(savedOrder.id(), OrderEventType.ORDER_REJECTED, rejectedPayload(savedOrder, riskResult), traceId, now);
        return OrderPlacementResult.rejected(savedOrder, toErrorCode(riskResult.rejectCode()), riskResult.message());
    }

    private Map<String, Object> receivedPayload(OrderDraft orderDraft) {
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("clientOrderId", orderDraft.clientOrderId());
        payload.put("traderId", orderDraft.traderId());
        payload.put("symbol", orderDraft.symbol());
        payload.put("side", orderDraft.side().name());
        payload.put("orderType", orderDraft.orderType().name());
        payload.put("quantity", orderDraft.quantity().toPlainString());
        payload.put("price", orderDraft.price() == null ? null : orderDraft.price().toPlainString());
        payload.put("receivedAt", Instant.now().toString());
        return payload;
    }

    private Map<String, Object> acceptedPayload(Order order) {
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("orderId", order.id().toString());
        payload.put("status", order.status().name());
        payload.put("notional", order.notional().toPlainString());
        payload.put("acceptedAt", order.updatedAt().toString());
        return payload;
    }

    private Map<String, Object> rejectedPayload(Order order, RiskCheckResult riskResult) {
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("orderId", order.id().toString());
        payload.put("status", order.status().name());
        payload.put("rejectCode", riskResult.rejectCode().name());
        payload.put("message", riskResult.message());
        payload.put("notional", order.notional().toPlainString());
        payload.put("riskAudit", riskResult.auditPayload());
        payload.put("rejectedAt", order.updatedAt().toString());
        return payload;
    }

    private void persistOrderEvent(UUID orderId,
                                   String eventType,
                                   Map<String, Object> payload,
                                   String traceId,
                                   Instant createdAt) {
        orderEventRepository.save(new OrderEventEntity(
                null,
                orderId.toString(),
                eventType,
                toJson(payload),
                traceId,
                createdAt
        ));
    }

    private String toJson(Map<String, Object> payload) {
        try {
            return objectMapper.writeValueAsString(payload);
        } catch (JsonProcessingException ex) {
            throw new IllegalStateException("Failed to serialize order event payload.", ex);
        }
    }

    private BigDecimal extractEffectivePrice(RiskCheckResult riskResult) {
        Object value = riskResult.auditPayload().get("effectivePrice");
        if (value == null) {
            throw new IllegalStateException("Risk evaluation did not provide effectivePrice.");
        }
        return new BigDecimal(String.valueOf(value));
    }

    private ErrorCode toErrorCode(RiskRejectCode rejectCode) {
        return switch (rejectCode) {
            case RISK_MAX_QTY_EXCEEDED -> ErrorCode.RISK_MAX_QTY_EXCEEDED;
            case RISK_MAX_NOTIONAL_EXCEEDED -> ErrorCode.RISK_MAX_NOTIONAL_EXCEEDED;
            case RISK_PRICE_BAND_EXCEEDED -> ErrorCode.RISK_PRICE_BAND_EXCEEDED;
        };
    }
}
