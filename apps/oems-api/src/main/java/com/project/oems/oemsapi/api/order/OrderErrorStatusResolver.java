package com.project.oems.oemsapi.api.order;

import com.project.oems.common.error.ErrorCode;
import org.springframework.http.HttpStatus;

public final class OrderErrorStatusResolver {

    private OrderErrorStatusResolver() {
    }

    public static HttpStatus resolve(ErrorCode errorCode) {
        return switch (errorCode) {
            case INSTRUMENT_NOT_FOUND -> HttpStatus.NOT_FOUND;
            case IDEMPOTENCY_CONFLICT -> HttpStatus.CONFLICT;
            case INSTRUMENT_NOT_TRADABLE, INSTRUMENT_QTY_OUT_OF_RANGE, INSTRUMENT_TICK_SIZE_VIOLATION,
                 RISK_MAX_QTY_EXCEEDED, RISK_MAX_NOTIONAL_EXCEEDED, RISK_PRICE_BAND_EXCEEDED ->
                    HttpStatus.UNPROCESSABLE_CONTENT;
            case VALIDATION_ERROR -> HttpStatus.BAD_REQUEST;
            default -> HttpStatus.BAD_REQUEST;
        };
    }
}
