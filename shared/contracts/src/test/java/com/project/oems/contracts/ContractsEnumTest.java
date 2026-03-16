package com.project.oems.contracts;

import com.project.oems.contracts.order.OrderStatus;
import com.project.oems.contracts.order.OrderType;
import com.project.oems.contracts.order.Side;
import com.project.oems.contracts.risk.RiskRejectCode;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertArrayEquals;

class ContractsEnumTest {

    @Test
    void orderTypeContainsPhaseOneValues() {
        assertArrayEquals(
            new OrderType[]{OrderType.MARKET, OrderType.LIMIT},
            OrderType.values()
        );
    }

    @Test
    void sideContainsBuyAndSell() {
        assertArrayEquals(
            new Side[]{Side.BUY, Side.SELL},
            Side.values()
        );
    }

    @Test
    void orderStatusContainsPhaseOneValues() {
        assertArrayEquals(
            new OrderStatus[]{OrderStatus.NEW, OrderStatus.REJECTED},
            OrderStatus.values()
        );
    }

    @Test
    void riskRejectCodeContainsExpectedCodes() {
        assertArrayEquals(
            new RiskRejectCode[]{
                RiskRejectCode.RISK_MAX_QTY_EXCEEDED,
                RiskRejectCode.RISK_MAX_NOTIONAL_EXCEEDED,
                RiskRejectCode.RISK_PRICE_BAND_EXCEEDED
            },
            RiskRejectCode.values()
        );
    }
}
