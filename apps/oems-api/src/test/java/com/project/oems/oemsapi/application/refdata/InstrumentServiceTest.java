package com.project.oems.oemsapi.application.refdata;

import com.project.oems.common.domain.exception.BusinessRuleViolation;
import com.project.oems.common.error.ErrorCode;
import com.project.oems.oemsapi.domain.refdata.Instrument;
import com.project.oems.oemsapi.infrastructure.refdata.InstrumentEntity;
import com.project.oems.oemsapi.infrastructure.refdata.InstrumentMapper;
import com.project.oems.oemsapi.infrastructure.refdata.InstrumentRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class InstrumentServiceTest {

    @Mock
    private InstrumentRepository instrumentRepository;

    private InstrumentService instrumentService;

    @BeforeEach
    void setUp() {
        instrumentService = new InstrumentService(instrumentRepository, new InstrumentMapper());
    }

    @Test
    void getBySymbolReturnsInstrumentForKnownSymbol() {
        when(instrumentRepository.findBySymbol("AAPL")).thenReturn(Optional.of(instrumentEntity("AAPL", true)));

        Instrument instrument = instrumentService.getBySymbol("AAPL");

        assertThat(instrument.symbol()).isEqualTo("AAPL");
        assertThat(instrument.name()).isEqualTo("Apple Inc.");
    }

    @Test
    void getBySymbolThrowsInstrumentNotFoundForUnknownSymbol() {
        when(instrumentRepository.findBySymbol("UNKNOWN")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> instrumentService.getBySymbol("UNKNOWN"))
                .isInstanceOf(BusinessRuleViolation.class)
                .satisfies(ex -> assertThat(((BusinessRuleViolation) ex).getErrorCode())
                        .isEqualTo(ErrorCode.INSTRUMENT_NOT_FOUND));
    }

    @Test
    void validateTradableRejectsNonTradableInstrument() {
        when(instrumentRepository.findBySymbol("TSLA")).thenReturn(Optional.of(instrumentEntity("TSLA", false)));

        assertThatThrownBy(() -> instrumentService.validateTradable("TSLA"))
                .isInstanceOf(BusinessRuleViolation.class)
                .satisfies(ex -> assertThat(((BusinessRuleViolation) ex).getErrorCode())
                        .isEqualTo(ErrorCode.INSTRUMENT_NOT_TRADABLE));
    }

    @Test
    void validateTradableWithOrderFieldsAcceptsEdgeValues() {
        when(instrumentRepository.findBySymbol("AAPL")).thenReturn(Optional.of(instrumentEntity("AAPL", true)));

        assertThatCode(() -> instrumentService.validateTradable(
                "AAPL",
                new BigDecimal("1.00000000"),
                new BigDecimal("100.05")
        )).doesNotThrowAnyException();

        assertThatCode(() -> instrumentService.validateTradable(
                "AAPL",
                new BigDecimal("100000.00000000"),
                new BigDecimal("100.10")
        )).doesNotThrowAnyException();
    }

    @Test
    void validateTradableWithOrderFieldsRejectsQuantityOutsideRange() {
        when(instrumentRepository.findBySymbol("AAPL")).thenReturn(Optional.of(instrumentEntity("AAPL", true)));

        assertThatThrownBy(() -> instrumentService.validateTradable(
                "AAPL",
                new BigDecimal("0.99999999"),
                new BigDecimal("100.00")
        )).isInstanceOf(BusinessRuleViolation.class)
                .satisfies(ex -> assertThat(((BusinessRuleViolation) ex).getErrorCode())
                        .isEqualTo(ErrorCode.INSTRUMENT_QTY_OUT_OF_RANGE));

        assertThatThrownBy(() -> instrumentService.validateTradable(
                "AAPL",
                new BigDecimal("100000.00000001"),
                new BigDecimal("100.00")
        )).isInstanceOf(BusinessRuleViolation.class)
                .satisfies(ex -> assertThat(((BusinessRuleViolation) ex).getErrorCode())
                        .isEqualTo(ErrorCode.INSTRUMENT_QTY_OUT_OF_RANGE));
    }

    @Test
    void validateTradableWithOrderFieldsRejectsOffTickPrice() {
        when(instrumentRepository.findBySymbol("AAPL")).thenReturn(Optional.of(instrumentEntity("AAPL", true)));

        assertThatThrownBy(() -> instrumentService.validateTradable(
                "AAPL",
                new BigDecimal("10.00000000"),
                new BigDecimal("100.03")
        )).isInstanceOf(BusinessRuleViolation.class)
                .satisfies(ex -> assertThat(((BusinessRuleViolation) ex).getErrorCode())
                        .isEqualTo(ErrorCode.INSTRUMENT_TICK_SIZE_VIOLATION));
    }

    private InstrumentEntity instrumentEntity(String symbol, boolean tradable) {
        Instant now = Instant.parse("2026-03-17T10:15:30Z");
        return new InstrumentEntity(
                1L,
                symbol,
                "AAPL".equals(symbol) ? "Apple Inc." : symbol + " Name",
                tradable,
                new BigDecimal("0.05"),
                new BigDecimal("1.00000000"),
                new BigDecimal("100000.00000000"),
                now,
                now
        );
    }
}
