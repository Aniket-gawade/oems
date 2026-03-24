package com.project.oems.oemsapi.application.order;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.project.oems.common.domain.exception.ResourceNotFoundException;
import com.project.oems.common.domain.exception.TechnicalFailureException;
import com.project.oems.oemsapi.api.order.OrderDetailResponse;
import com.project.oems.oemsapi.api.order.OrderEventResponse;
import com.project.oems.oemsapi.domain.order.Order;
import com.project.oems.oemsapi.infrastructure.order.OrderEntity;
import com.project.oems.oemsapi.infrastructure.order.OrderEventEntity;
import com.project.oems.oemsapi.infrastructure.order.OrderEventRepository;
import com.project.oems.oemsapi.infrastructure.order.OrderMapper;
import com.project.oems.oemsapi.infrastructure.order.OrderRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@Transactional(readOnly = true)
public class OrderQueryService {

    private static final TypeReference<Map<String, Object>> MAP_TYPE_REFERENCE = new TypeReference<>() {
    };

    private final OrderRepository orderRepository;
    private final OrderEventRepository orderEventRepository;
    private final OrderMapper orderMapper;
    private final ObjectMapper objectMapper;

    public OrderQueryService(OrderRepository orderRepository,
                             OrderEventRepository orderEventRepository,
                             OrderMapper orderMapper) {
        this.orderRepository = orderRepository;
        this.orderEventRepository = orderEventRepository;
        this.orderMapper = orderMapper;
        this.objectMapper = new ObjectMapper().findAndRegisterModules();
    }

    public OrderDetailResponse getOrderById(UUID orderId, String traderId) {
        OrderEntity orderEntity = orderRepository.findByIdAndTraderId(orderId.toString(), traderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found."));
        Order order = orderMapper.toDomain(orderEntity);
        return OrderDetailResponse.from(order);
    }

    public List<OrderEventResponse> getOrderEventsByOrderId(UUID orderId) {
        return orderEventRepository.findByOrderIdOrderByCreatedAtAscIdAsc(orderId.toString())
                .stream()
                .map(this::toEventResponse)
                .toList();
    }

    private OrderEventResponse toEventResponse(OrderEventEntity eventEntity) {
        return new OrderEventResponse(
                eventEntity.getId(),
                eventEntity.getOrderId(),
                eventEntity.getEventType(),
                parsePayload(eventEntity.getPayload()),
                eventEntity.getTraceId(),
                eventEntity.getCreatedAt()
        );
    }

    private Map<String, Object> parsePayload(String payloadJson) {
        try {
            Object parsed = objectMapper.readValue(payloadJson, Object.class);
            if (parsed instanceof Map<?, ?> map) {
                @SuppressWarnings("unchecked")
                Map<String, Object> typedMap = (Map<String, Object>) map;
                return typedMap;
            }
            if (parsed instanceof String nestedJson) {
                return objectMapper.readValue(nestedJson, MAP_TYPE_REFERENCE);
            }
            throw new TechnicalFailureException("Order event payload has unsupported JSON type: " + parsed.getClass().getSimpleName());
        } catch (JsonProcessingException ex) {
            throw new TechnicalFailureException("Failed to deserialize order event payload.", ex);
        }
    }
}
