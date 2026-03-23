package com.project.oems.oemsapi.domain.order;

import com.project.oems.contracts.order.OrderType;
import com.project.oems.contracts.order.Side;

import java.math.BigDecimal;
import java.util.Objects;

public record OrderDraft(
        String traderId,
        String symbol,
        Side side,
        OrderType orderType,
        BigDecimal quantity,
        BigDecimal price
) {

    public OrderDraft {
        Objects.requireNonNull(traderId, "traderId must not be null");
        Objects.requireNonNull(symbol, "symbol must not be null");
        Objects.requireNonNull(side, "side must not be null");
        Objects.requireNonNull(orderType, "orderType must not be null");
        Objects.requireNonNull(quantity, "quantity must not be null");
    }
}
