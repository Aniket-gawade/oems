package com.project.oems.oemsapi.infrastructure.order;

import com.project.oems.oemsapi.domain.order.Order;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
public class OrderMapper {

    public OrderEntity toEntity(Order order) {
        return new OrderEntity(
                order.id().toString(),
                order.clientOrderId(),
                order.traderId(),
                order.symbol(),
                order.side(),
                order.orderType(),
                order.quantity(),
                order.price(),
                order.notional(),
                order.status(),
                order.rejectionReason(),
                order.createdAt(),
                order.updatedAt(),
                order.version()
        );
    }

    public Order toDomain(OrderEntity entity) {
        return new Order(
                UUID.fromString(entity.getId()),
                entity.getClientOrderId(),
                entity.getTraderId(),
                entity.getSymbol(),
                entity.getSide(),
                entity.getOrderType(),
                entity.getQuantity(),
                entity.getPrice(),
                entity.getNotional(),
                entity.getStatus(),
                entity.getRejectionReason(),
                entity.getCreatedAt(),
                entity.getUpdatedAt(),
                entity.getVersion()
        );
    }
}
