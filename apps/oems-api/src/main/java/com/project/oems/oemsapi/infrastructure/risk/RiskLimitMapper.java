package com.project.oems.oemsapi.infrastructure.risk;

import com.project.oems.oemsapi.domain.risk.RiskLimit;
import org.springframework.stereotype.Component;

@Component
public class RiskLimitMapper {

    public RiskLimit toDomain(RiskLimitEntity entity) {
        return new RiskLimit(
                entity.getTraderId(),
                entity.getSymbol(),
                entity.getMaxQty(),
                entity.getMaxNotional(),
                entity.getPriceBandPct()
        );
    }
}
