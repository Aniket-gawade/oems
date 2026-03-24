package com.project.oems.oemsapi.application.order;

import org.junit.jupiter.api.Test;

import java.util.LinkedHashMap;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

class CanonicalRequestHashUtilTest {

    private final CanonicalRequestHashUtil hashUtil = new CanonicalRequestHashUtil();

    @Test
    void samePayloadWithDifferentFieldOrderProducesSameHash() {
        Map<String, Object> first = new LinkedHashMap<>();
        first.put("traderId", "trader1");
        first.put("symbol", "AAPL");
        first.put("quantity", "10");
        first.put("price", "200");

        Map<String, Object> second = new LinkedHashMap<>();
        second.put("price", "200");
        second.put("quantity", "10");
        second.put("symbol", "AAPL");
        second.put("traderId", "trader1");

        assertThat(hashUtil.hash(first)).isEqualTo(hashUtil.hash(second));
    }

    @Test
    void differentPayloadProducesDifferentHash() {
        Map<String, Object> first = Map.of(
                "traderId", "trader1",
                "symbol", "AAPL",
                "quantity", "10"
        );
        Map<String, Object> second = Map.of(
                "traderId", "trader1",
                "symbol", "AAPL",
                "quantity", "11"
        );

        assertThat(hashUtil.hash(first)).isNotEqualTo(hashUtil.hash(second));
    }
}
