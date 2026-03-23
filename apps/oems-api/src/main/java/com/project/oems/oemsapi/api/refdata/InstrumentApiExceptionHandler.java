package com.project.oems.oemsapi.api.refdata;

import com.project.oems.common.domain.exception.BusinessException;
import com.project.oems.common.error.ApiError;
import com.project.oems.common.error.ErrorCode;
import com.project.oems.common.web.CorrelationContext;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;

@RestControllerAdvice(assignableTypes = InstrumentController.class)
public class InstrumentApiExceptionHandler {

    @ExceptionHandler(BusinessException.class)
    ResponseEntity<ApiError> handleBusinessException(BusinessException exception, HttpServletRequest request) {
        HttpStatus httpStatus = resolveStatus(exception.getErrorCode());
        ApiError apiError = new ApiError(
                exception.getErrorCode(),
                exception.getMessage(),
                httpStatus.value(),
                request.getRequestURI(),
                Instant.now(),
                resolveTraceId(),
                Map.of()
        );
        return ResponseEntity.status(httpStatus).body(apiError);
    }

    private HttpStatus resolveStatus(ErrorCode errorCode) {
        return switch (errorCode) {
            case INSTRUMENT_NOT_FOUND -> HttpStatus.NOT_FOUND;
            case INSTRUMENT_NOT_TRADABLE, INSTRUMENT_QTY_OUT_OF_RANGE, INSTRUMENT_TICK_SIZE_VIOLATION ->
                    HttpStatus.UNPROCESSABLE_CONTENT;
            default -> HttpStatus.BAD_REQUEST;
        };
    }

    private String resolveTraceId() {
        String traceId = CorrelationContext.getTraceId();
        if (StringUtils.hasText(traceId)) {
            return traceId;
        }
        return UUID.randomUUID().toString();
    }
}
