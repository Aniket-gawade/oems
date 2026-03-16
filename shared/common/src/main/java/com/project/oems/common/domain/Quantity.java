package com.project.oems.common.domain;

import com.project.oems.common.math.DecimalMath;

import java.math.BigDecimal;
import java.util.Objects;

public record Quantity(BigDecimal value) {

    public Quantity {
        Objects.requireNonNull(value, "quantity must not be null");
        if (value.signum() <= 0) {
            throw new IllegalArgumentException("quantity must be greater than zero");
        }
        value = DecimalMath.normalize(value);
    }

    public static Quantity of(BigDecimal value) {
        return new Quantity(value);
    }

    public static Quantity of(String value) {
        return new Quantity(new BigDecimal(value));
    }

    public BigDecimal asBigDecimal() {
        return value;
    }
}
