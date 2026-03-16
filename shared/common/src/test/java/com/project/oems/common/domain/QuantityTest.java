package com.project.oems.common.domain;

import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

class QuantityTest {

    @Test
    void acceptsStrictlyPositiveQuantity() {
        Quantity quantity = Quantity.of("10.123456789");
        assertEquals(new BigDecimal("10.12345679"), quantity.asBigDecimal());
    }

    @Test
    void rejectsZeroQuantity() {
        IllegalArgumentException exception = assertThrows(
            IllegalArgumentException.class,
            () -> Quantity.of(BigDecimal.ZERO)
        );
        assertEquals("quantity must be greater than zero", exception.getMessage());
    }

    @Test
    void rejectsNegativeQuantity() {
        IllegalArgumentException exception = assertThrows(
            IllegalArgumentException.class,
            () -> Quantity.of(new BigDecimal("-1"))
        );
        assertEquals("quantity must be greater than zero", exception.getMessage());
    }

    @Test
    void rejectsNullQuantity() {
        assertThrows(NullPointerException.class, () -> Quantity.of((BigDecimal) null));
    }
}
