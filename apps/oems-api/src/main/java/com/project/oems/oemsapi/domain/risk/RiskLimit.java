package com.project.oems.oemsapi.domain.risk;

import java.math.BigDecimal;
import java.util.Objects;

public record RiskLimit(
        String traderId,
        String symbol,
        BigDecimal maxQty,
        BigDecimal maxNotional,
        BigDecimal priceBandPct
) {

    public RiskLimit {
        Objects.requireNonNull(traderId, "traderId must not be null");
        Objects.requireNonNull(maxQty, "maxQty must not be null");
        Objects.requireNonNull(maxNotional, "maxNotional must not be null");
        Objects.requireNonNull(priceBandPct, "priceBandPct must not be null");
    }
}
