package com.project.oems.common.math;

import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

class DecimalMathTest {

    @Test
    void normalizeUsesDeterministicScaleAndRounding() {
        BigDecimal normalized = DecimalMath.normalize(new BigDecimal("123.456789876"));
        assertEquals(new BigDecimal("123.45678988"), normalized);
    }

    @Test
    void multiplyUsesDeterministicScaleAndRounding() {
        BigDecimal result = DecimalMath.multiply(
            new BigDecimal("10.12345678"),
            new BigDecimal("2.50000000")
        );
        assertEquals(new BigDecimal("25.30864195"), result);
    }

    @Test
    void divideUsesDeterministicScaleAndRounding() {
        BigDecimal result = DecimalMath.divide(
            new BigDecimal("10"),
            new BigDecimal("3")
        );
        assertEquals(new BigDecimal("3.33333333"), result);
    }

    @Test
    void divideRejectsNullInputs() {
        assertThrows(NullPointerException.class, () -> DecimalMath.divide(null, BigDecimal.ONE));
        assertThrows(NullPointerException.class, () -> DecimalMath.divide(BigDecimal.ONE, null));
    }
}
