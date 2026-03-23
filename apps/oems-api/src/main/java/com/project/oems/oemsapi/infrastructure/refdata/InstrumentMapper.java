package com.project.oems.oemsapi.infrastructure.refdata;

import com.project.oems.oemsapi.domain.refdata.Instrument;
import org.springframework.stereotype.Component;

@Component
public class InstrumentMapper {

    public Instrument toDomain(InstrumentEntity entity) {
        return new Instrument(
                entity.getId(),
                entity.getSymbol(),
                entity.getName(),
                entity.isTradable(),
                entity.getTickSize(),
                entity.getMinQty(),
                entity.getMaxQty(),
                entity.getCreatedAt(),
                entity.getUpdatedAt()
        );
    }

    public InstrumentEntity toEntity(Instrument instrument) {
        return new InstrumentEntity(
                instrument.id(),
                instrument.symbol(),
                instrument.name(),
                instrument.tradable(),
                instrument.tickSize(),
                instrument.minQty(),
                instrument.maxQty(),
                instrument.createdAt(),
                instrument.updatedAt()
        );
    }
}
