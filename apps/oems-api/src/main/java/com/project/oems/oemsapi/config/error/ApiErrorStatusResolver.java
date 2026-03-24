package com.project.oems.oemsapi.config.error;

import com.project.oems.common.error.ErrorCode;
import org.springframework.http.HttpStatus;

public final class ApiErrorStatusResolver {

    private ApiErrorStatusResolver() {
    }

    public static HttpStatus resolve(ErrorCode errorCode) {
        return switch (errorCode) {
            case VALIDATION_ERROR -> HttpStatus.BAD_REQUEST;
            case UNAUTHORIZED -> HttpStatus.UNAUTHORIZED;
            case FORBIDDEN -> HttpStatus.FORBIDDEN;
            case RESOURCE_NOT_FOUND, INSTRUMENT_NOT_FOUND -> HttpStatus.NOT_FOUND;
            case IDEMPOTENCY_CONFLICT -> HttpStatus.CONFLICT;
            case INSTRUMENT_NOT_TRADABLE, INSTRUMENT_QTY_OUT_OF_RANGE, INSTRUMENT_TICK_SIZE_VIOLATION,
                 RISK_MAX_QTY_EXCEEDED, RISK_MAX_NOTIONAL_EXCEEDED, RISK_PRICE_BAND_EXCEEDED ->
                    HttpStatus.UNPROCESSABLE_CONTENT;
            case INTERNAL_SERVER_ERROR -> HttpStatus.INTERNAL_SERVER_ERROR;
        };
    }
}
