package com.project.oems.oemsapi.api.order;

import com.project.oems.common.domain.exception.BusinessException;
import com.project.oems.common.error.ApiError;
import com.project.oems.common.error.ErrorCode;
import com.project.oems.common.web.CorrelationContext;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.http.converter.HttpMessageNotReadableException;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestControllerAdvice(assignableTypes = OrderController.class)
public class OrderApiExceptionHandler {

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

    @ExceptionHandler(MethodArgumentNotValidException.class)
    ResponseEntity<ApiError> handleValidationException(MethodArgumentNotValidException exception,
                                                       HttpServletRequest request) {
        List<Map<String, String>> fieldErrors = exception.getBindingResult().getFieldErrors().stream()
                .map(this::toFieldErrorPayload)
                .toList();

        ApiError apiError = new ApiError(
                ErrorCode.VALIDATION_ERROR,
                "Request validation failed.",
                HttpStatus.BAD_REQUEST.value(),
                request.getRequestURI(),
                Instant.now(),
                resolveTraceId(),
                Map.of("fieldErrors", fieldErrors)
        );
        return ResponseEntity.badRequest().body(apiError);
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    ResponseEntity<ApiError> handleMessageNotReadable(HttpMessageNotReadableException exception,
                                                      HttpServletRequest request) {
        ApiError apiError = new ApiError(
                ErrorCode.VALIDATION_ERROR,
                "Request body is malformed or contains invalid values.",
                HttpStatus.BAD_REQUEST.value(),
                request.getRequestURI(),
                Instant.now(),
                resolveTraceId(),
                Map.of()
        );
        return ResponseEntity.badRequest().body(apiError);
    }

    private HttpStatus resolveStatus(ErrorCode errorCode) {
        return switch (errorCode) {
            case INSTRUMENT_NOT_FOUND -> HttpStatus.NOT_FOUND;
            case INSTRUMENT_NOT_TRADABLE, INSTRUMENT_QTY_OUT_OF_RANGE, INSTRUMENT_TICK_SIZE_VIOLATION,
                 RISK_MAX_QTY_EXCEEDED, RISK_MAX_NOTIONAL_EXCEEDED, RISK_PRICE_BAND_EXCEEDED ->
                    HttpStatus.UNPROCESSABLE_CONTENT;
            case VALIDATION_ERROR -> HttpStatus.BAD_REQUEST;
            default -> HttpStatus.BAD_REQUEST;
        };
    }

    private Map<String, String> toFieldErrorPayload(FieldError fieldError) {
        return Map.of(
                "field", fieldError.getField(),
                "reason", StringUtils.hasText(fieldError.getDefaultMessage())
                        ? fieldError.getDefaultMessage()
                        : "invalid value"
        );
    }

    private String resolveTraceId() {
        String traceId = CorrelationContext.getTraceId();
        if (StringUtils.hasText(traceId)) {
            return traceId;
        }
        return UUID.randomUUID().toString();
    }
}
