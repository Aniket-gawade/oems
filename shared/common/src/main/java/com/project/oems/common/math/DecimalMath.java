package com.project.oems.common.math;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Objects;

public final class DecimalMath {

    public static final int DEFAULT_SCALE = 8;
    public static final RoundingMode DEFAULT_ROUNDING = RoundingMode.HALF_UP;

    private DecimalMath() {
    }

    public static BigDecimal normalize(BigDecimal value) {
        return normalize(value, DEFAULT_SCALE);
    }

    public static BigDecimal normalize(BigDecimal value, int scale) {
        Objects.requireNonNull(value, "value must not be null");
        return value.setScale(scale, DEFAULT_ROUNDING);
    }

    public static BigDecimal multiply(BigDecimal left, BigDecimal right) {
        return multiply(left, right, DEFAULT_SCALE);
    }

    public static BigDecimal multiply(BigDecimal left, BigDecimal right, int scale) {
        Objects.requireNonNull(left, "left must not be null");
        Objects.requireNonNull(right, "right must not be null");
        return left.multiply(right).setScale(scale, DEFAULT_ROUNDING);
    }

    public static BigDecimal divide(BigDecimal dividend, BigDecimal divisor) {
        return divide(dividend, divisor, DEFAULT_SCALE);
    }

    public static BigDecimal divide(BigDecimal dividend, BigDecimal divisor, int scale) {
        Objects.requireNonNull(dividend, "dividend must not be null");
        Objects.requireNonNull(divisor, "divisor must not be null");
        return dividend.divide(divisor, scale, DEFAULT_ROUNDING);
    }
}
