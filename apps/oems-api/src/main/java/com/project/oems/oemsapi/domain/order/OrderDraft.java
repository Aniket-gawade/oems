package com.project.oems.oemsapi.domain.order;

import com.project.oems.contracts.order.OrderType;
import com.project.oems.contracts.order.Side;

import java.math.BigDecimal;
import java.util.Objects;

public record OrderDraft(
        String clientOrderId,
        String traderId,
        String symbol,
        Side side,
        OrderType orderType,
        BigDecimal quantity,
        BigDecimal price
) {

    public OrderDraft {
        if (clientOrderId == null || clientOrderId.isBlank()) {
            throw new IllegalArgumentException("clientOrderId must not be blank");
        }
        Objects.requireNonNull(traderId, "traderId must not be null");
        Objects.requireNonNull(symbol, "symbol must not be null");
        Objects.requireNonNull(side, "side must not be null");
        Objects.requireNonNull(orderType, "orderType must not be null");
        Objects.requireNonNull(quantity, "quantity must not be null");

        if (traderId.isBlank()) {
            throw new IllegalArgumentException("traderId must not be blank");
        }
        if (symbol.isBlank()) {
            throw new IllegalArgumentException("symbol must not be blank");
        }
        if (quantity.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("quantity must be greater than zero");
        }
        if (orderType == OrderType.LIMIT) {
            if (price == null || price.compareTo(BigDecimal.ZERO) <= 0) {
                throw new IllegalArgumentException("LIMIT orders require positive price");
            }
        } else if (price != null) {
            throw new IllegalArgumentException("MARKET orders must not include price");
        }
    }
}
