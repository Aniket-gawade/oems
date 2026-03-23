package com.project.oems.oemsapi.api.refdata;

import com.project.oems.oemsapi.domain.refdata.Instrument;

import java.math.BigDecimal;

public record InstrumentResponse(
        String symbol,
        String name,
        boolean tradable,
        BigDecimal tickSize,
        BigDecimal minQty,
        BigDecimal maxQty
) {

    public static InstrumentResponse from(Instrument instrument) {
        return new InstrumentResponse(
                instrument.symbol(),
                instrument.name(),
                instrument.tradable(),
                instrument.tickSize(),
                instrument.minQty(),
                instrument.maxQty()
        );
    }
}
