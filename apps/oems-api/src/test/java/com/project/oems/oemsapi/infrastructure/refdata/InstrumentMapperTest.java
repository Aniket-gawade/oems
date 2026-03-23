package com.project.oems.oemsapi.infrastructure.refdata;

import com.project.oems.oemsapi.domain.refdata.Instrument;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.Instant;

import static org.assertj.core.api.Assertions.assertThat;

class InstrumentMapperTest {

    private final InstrumentMapper mapper = new InstrumentMapper();

    @Test
    void mapsEntityToDomain() {
        Instant createdAt = Instant.parse("2026-03-17T10:15:30Z");
        Instant updatedAt = Instant.parse("2026-03-18T10:15:30Z");
        InstrumentEntity entity = new InstrumentEntity(
                11L,
                "AAPL",
                "Apple Inc.",
                true,
                new BigDecimal("0.01"),
                new BigDecimal("1.00000000"),
                new BigDecimal("100000.00000000"),
                createdAt,
                updatedAt
        );

        Instrument instrument = mapper.toDomain(entity);

        assertThat(instrument.id()).isEqualTo(11L);
        assertThat(instrument.symbol()).isEqualTo("AAPL");
        assertThat(instrument.name()).isEqualTo("Apple Inc.");
        assertThat(instrument.tradable()).isTrue();
        assertThat(instrument.tickSize()).isEqualByComparingTo("0.01");
        assertThat(instrument.minQty()).isEqualByComparingTo("1.00000000");
        assertThat(instrument.maxQty()).isEqualByComparingTo("100000.00000000");
        assertThat(instrument.createdAt()).isEqualTo(createdAt);
        assertThat(instrument.updatedAt()).isEqualTo(updatedAt);
    }

    @Test
    void mapsDomainToEntity() {
        Instant createdAt = Instant.parse("2026-03-17T10:15:30Z");
        Instant updatedAt = Instant.parse("2026-03-18T10:15:30Z");
        Instrument instrument = new Instrument(
                21L,
                "TSLA",
                "Tesla, Inc.",
                false,
                new BigDecimal("0.05"),
                new BigDecimal("1.00000000"),
                new BigDecimal("50000.00000000"),
                createdAt,
                updatedAt
        );

        InstrumentEntity entity = mapper.toEntity(instrument);

        assertThat(entity.getId()).isEqualTo(21L);
        assertThat(entity.getSymbol()).isEqualTo("TSLA");
        assertThat(entity.getName()).isEqualTo("Tesla, Inc.");
        assertThat(entity.isTradable()).isFalse();
        assertThat(entity.getTickSize()).isEqualByComparingTo("0.05");
        assertThat(entity.getMinQty()).isEqualByComparingTo("1.00000000");
        assertThat(entity.getMaxQty()).isEqualByComparingTo("50000.00000000");
        assertThat(entity.getCreatedAt()).isEqualTo(createdAt);
        assertThat(entity.getUpdatedAt()).isEqualTo(updatedAt);
    }
}
