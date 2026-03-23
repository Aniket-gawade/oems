package com.project.oems.oemsapi.application.order;

import com.project.oems.contracts.order.OrderType;
import com.project.oems.contracts.order.Side;
import com.project.oems.oemsapi.domain.order.OrderDraft;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class OrderNotionalCalculatorTest {

    private final OrderNotionalCalculator calculator = new OrderNotionalCalculator();

    @Test
    void calculatesNotionalForLimitOrderUsingLimitPrice() {
        OrderDraft orderDraft = new OrderDraft(
                "coid-1001",
                "trader1",
                "AAPL",
                Side.BUY,
                OrderType.LIMIT,
                new BigDecimal("10.00000000"),
                new BigDecimal("200.00000000")
        );

        BigDecimal notional = calculator.calculate(orderDraft, new BigDecimal("999.00000000"));

        assertThat(notional).isEqualByComparingTo("2000.00000000");
    }

    @Test
    void calculatesNotionalForMarketOrderUsingReferencePrice() {
        OrderDraft orderDraft = new OrderDraft(
                "coid-1002",
                "trader1",
                "AAPL",
                Side.BUY,
                OrderType.MARKET,
                new BigDecimal("10.00000000"),
                null
        );

        BigDecimal notional = calculator.calculate(orderDraft, new BigDecimal("200.12345678"));

        assertThat(notional).isEqualByComparingTo("2001.23456780");
    }

    @Test
    void marketOrderWithoutReferencePriceFails() {
        OrderDraft orderDraft = new OrderDraft(
                "coid-1003",
                "trader1",
                "AAPL",
                Side.BUY,
                OrderType.MARKET,
                new BigDecimal("10.00000000"),
                null
        );

        assertThatThrownBy(() -> calculator.calculate(orderDraft, null))
                .isInstanceOf(NullPointerException.class);
    }
}
