package com.project.oems.oemsapi.api.order;

import com.project.oems.contracts.order.OrderType;
import com.project.oems.contracts.order.Side;
import com.project.oems.oemsapi.domain.order.OrderDraft;
import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record PlaceOrderRequest(
        @NotBlank String clientOrderId,
        @NotBlank String symbol,
        @NotNull Side side,
        @NotNull OrderType orderType,
        @NotNull
        @DecimalMin(value = "0.00000001")
        @Digits(integer = 18, fraction = 8)
        BigDecimal quantity,
        @DecimalMin(value = "0.00000001")
        @Digits(integer = 18, fraction = 8)
        BigDecimal price
) {

    @AssertTrue(message = "price must be provided for LIMIT orders and omitted for MARKET orders.")
    public boolean isPriceCompatibleWithOrderType() {
        if (orderType == null) {
            return true;
        }
        return switch (orderType) {
            case LIMIT -> price != null;
            case MARKET -> price == null;
        };
    }

    OrderDraft toDraft(String traderId) {
        return new OrderDraft(
                clientOrderId.trim(),
                traderId,
                symbol.trim(),
                side,
                orderType,
                quantity,
                price
        );
    }
}
