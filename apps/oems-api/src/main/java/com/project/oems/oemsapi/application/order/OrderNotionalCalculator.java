package com.project.oems.oemsapi.application.order;

import com.project.oems.contracts.order.OrderType;
import com.project.oems.oemsapi.domain.order.OrderDraft;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.Objects;

import static com.project.oems.common.math.DecimalMath.DEFAULT_SCALE;
import static com.project.oems.common.math.DecimalMath.multiply;
import static com.project.oems.common.math.DecimalMath.normalize;

@Component
public class OrderNotionalCalculator {

    public BigDecimal calculate(OrderDraft orderDraft, BigDecimal marketReferencePrice) {
        Objects.requireNonNull(orderDraft, "orderDraft must not be null");
        BigDecimal effectivePrice = resolveEffectivePrice(orderDraft, marketReferencePrice);
        return multiply(normalize(orderDraft.quantity(), DEFAULT_SCALE), effectivePrice, DEFAULT_SCALE);
    }

    public BigDecimal resolveEffectivePrice(OrderDraft orderDraft, BigDecimal marketReferencePrice) {
        if (orderDraft.orderType() == OrderType.LIMIT) {
            Objects.requireNonNull(orderDraft.price(), "LIMIT order must include price");
            return normalize(orderDraft.price(), DEFAULT_SCALE);
        }
        Objects.requireNonNull(marketReferencePrice, "marketReferencePrice is required for MARKET orders");
        return normalize(marketReferencePrice, DEFAULT_SCALE);
    }
}
