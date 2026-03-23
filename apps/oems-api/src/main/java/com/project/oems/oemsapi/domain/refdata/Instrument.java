package com.project.oems.oemsapi.domain.refdata;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Objects;

public record Instrument(
        Long id,
        String symbol,
        String name,
        boolean tradable,
        BigDecimal tickSize,
        BigDecimal minQty,
        BigDecimal maxQty,
        Instant createdAt,
        Instant updatedAt
) {

    public Instrument {
        Objects.requireNonNull(symbol, "symbol must not be null");
        Objects.requireNonNull(name, "name must not be null");
        Objects.requireNonNull(tickSize, "tickSize must not be null");
        Objects.requireNonNull(minQty, "minQty must not be null");
        Objects.requireNonNull(maxQty, "maxQty must not be null");
        Objects.requireNonNull(createdAt, "createdAt must not be null");
        Objects.requireNonNull(updatedAt, "updatedAt must not be null");

        if (tickSize.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("tickSize must be greater than zero.");
        }
        if (minQty.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("minQty must be greater than zero.");
        }
        if (maxQty.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("maxQty must be greater than zero.");
        }
        if (minQty.compareTo(maxQty) > 0) {
            throw new IllegalArgumentException("minQty must be less than or equal to maxQty.");
        }
    }
}
