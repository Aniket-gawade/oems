package com.project.oems.oemsapi.application.refdata;

import com.project.oems.common.domain.exception.BusinessRuleViolation;
import com.project.oems.common.error.ErrorCode;
import com.project.oems.oemsapi.domain.refdata.Instrument;
import com.project.oems.oemsapi.infrastructure.refdata.InstrumentMapper;
import com.project.oems.oemsapi.infrastructure.refdata.InstrumentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.math.RoundingMode;

@Service
@Transactional(readOnly = true)
public class InstrumentService {

    private final InstrumentRepository instrumentRepository;
    private final InstrumentMapper instrumentMapper;

    public InstrumentService(InstrumentRepository instrumentRepository, InstrumentMapper instrumentMapper) {
        this.instrumentRepository = instrumentRepository;
        this.instrumentMapper = instrumentMapper;
    }

    public Instrument getBySymbol(String symbol) {
        String normalizedSymbol = normalizeSymbol(symbol);
        return instrumentRepository.findBySymbol(normalizedSymbol)
                .map(instrumentMapper::toDomain)
                .orElseThrow(() -> new BusinessRuleViolation(
                        ErrorCode.INSTRUMENT_NOT_FOUND,
                        "Instrument symbol not found: " + normalizedSymbol
                ));
    }

    public Instrument validateTradable(String symbol) {
        Instrument instrument = getBySymbol(symbol);
        if (!instrument.tradable()) {
            throw new BusinessRuleViolation(
                    ErrorCode.INSTRUMENT_NOT_TRADABLE,
                    "Instrument is currently not tradable: " + instrument.symbol()
            );
        }
        return instrument;
    }

    public Instrument validateTradable(String symbol, BigDecimal quantity, BigDecimal price) {
        Instrument instrument = validateTradable(symbol);
        validateQuantityRange(instrument, quantity);
        validateTickSize(instrument, price);
        return instrument;
    }

    public void validateQuantityRange(Instrument instrument, BigDecimal quantity) {
        if (quantity == null) {
            throw new BusinessRuleViolation(ErrorCode.VALIDATION_ERROR, "Quantity must be provided.");
        }
        if (quantity.compareTo(instrument.minQty()) < 0 || quantity.compareTo(instrument.maxQty()) > 0) {
            throw new BusinessRuleViolation(
                    ErrorCode.INSTRUMENT_QTY_OUT_OF_RANGE,
                    "Quantity must be within range [" + instrument.minQty().toPlainString() + ", "
                            + instrument.maxQty().toPlainString() + "] for symbol " + instrument.symbol()
            );
        }
    }

    public void validateTickSize(Instrument instrument, BigDecimal price) {
        if (price == null) {
            return;
        }
        if (price.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BusinessRuleViolation(ErrorCode.VALIDATION_ERROR, "Price must be greater than zero.");
        }
        if (instrument.tickSize().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalStateException("Instrument tick size must be greater than zero.");
        }
        try {
            price.divide(instrument.tickSize(), 0, RoundingMode.UNNECESSARY);
        } catch (ArithmeticException ex) {
            throw new BusinessRuleViolation(
                    ErrorCode.INSTRUMENT_TICK_SIZE_VIOLATION,
                    "Price " + price.toPlainString() + " is not aligned with tick size "
                            + instrument.tickSize().toPlainString() + " for symbol " + instrument.symbol(),
                    ex
            );
        }
    }

    private String normalizeSymbol(String symbol) {
        if (!StringUtils.hasText(symbol)) {
            throw new BusinessRuleViolation(ErrorCode.VALIDATION_ERROR, "Instrument symbol must be provided.");
        }
        return symbol.trim();
    }
}
