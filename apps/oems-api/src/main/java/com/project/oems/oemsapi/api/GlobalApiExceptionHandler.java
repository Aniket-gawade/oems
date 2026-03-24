package com.project.oems.oemsapi.api;

import com.project.oems.common.domain.exception.BusinessException;
import com.project.oems.common.error.ApiError;
import com.project.oems.common.error.ErrorCode;
import com.project.oems.common.web.CorrelationContext;
import com.project.oems.oemsapi.config.error.ApiErrorStatusResolver;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.ConstraintViolationException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.util.StringUtils;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestControllerAdvice
public class GlobalApiExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalApiExceptionHandler.class);

    @ExceptionHandler(BusinessException.class)
    ResponseEntity<ApiError> handleBusinessException(BusinessException exception, HttpServletRequest request) {
        HttpStatus httpStatus = ApiErrorStatusResolver.resolve(exception.getErrorCode());
        return response(
                exception.getErrorCode(),
                exception.getMessage(),
                httpStatus,
                request.getRequestURI(),
                Map.of()
        );
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    ResponseEntity<ApiError> handleValidationException(MethodArgumentNotValidException exception,
                                                       HttpServletRequest request) {
        List<Map<String, String>> fieldErrors = exception.getBindingResult().getFieldErrors().stream()
                .map(this::toFieldErrorPayload)
                .toList();

        return response(
                ErrorCode.VALIDATION_ERROR,
                "Request validation failed.",
                HttpStatus.BAD_REQUEST,
                request.getRequestURI(),
                Map.of("fieldErrors", fieldErrors)
        );
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    ResponseEntity<ApiError> handleMessageNotReadable(HttpMessageNotReadableException exception,
                                                      HttpServletRequest request) {
        return response(
                ErrorCode.VALIDATION_ERROR,
                "Request body is malformed or contains invalid values.",
                HttpStatus.BAD_REQUEST,
                request.getRequestURI(),
                Map.of()
        );
    }

    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    ResponseEntity<ApiError> handleTypeMismatch(MethodArgumentTypeMismatchException exception,
                                                HttpServletRequest request) {
        String parameter = exception.getName();
        String message = "Invalid value for parameter '" + parameter + "'.";
        return response(
                ErrorCode.VALIDATION_ERROR,
                message,
                HttpStatus.BAD_REQUEST,
                request.getRequestURI(),
                Map.of()
        );
    }

    @ExceptionHandler(ConstraintViolationException.class)
    ResponseEntity<ApiError> handleConstraintViolation(ConstraintViolationException exception,
                                                       HttpServletRequest request) {
        List<Map<String, String>> violations = exception.getConstraintViolations().stream()
                .map(this::toViolationPayload)
                .toList();

        return response(
                ErrorCode.VALIDATION_ERROR,
                "Request validation failed.",
                HttpStatus.BAD_REQUEST,
                request.getRequestURI(),
                Map.of("fieldErrors", violations)
        );
    }

    @ExceptionHandler(Exception.class)
    ResponseEntity<ApiError> handleUnexpectedException(Exception exception, HttpServletRequest request) {
        log.error("Unhandled exception processing path={}", request.getRequestURI(), exception);
        return response(
                ErrorCode.INTERNAL_SERVER_ERROR,
                "Unexpected internal error occurred.",
                HttpStatus.INTERNAL_SERVER_ERROR,
                request.getRequestURI(),
                Map.of()
        );
    }

    private Map<String, String> toFieldErrorPayload(FieldError fieldError) {
        return Map.of(
                "field", fieldError.getField(),
                "reason", StringUtils.hasText(fieldError.getDefaultMessage())
                        ? fieldError.getDefaultMessage()
                        : "invalid value"
        );
    }

    private Map<String, String> toViolationPayload(ConstraintViolation<?> violation) {
        return Map.of(
                "field", violation.getPropertyPath().toString(),
                "reason", violation.getMessage()
        );
    }

    private ResponseEntity<ApiError> response(ErrorCode code,
                                              String message,
                                              HttpStatus httpStatus,
                                              String path,
                                              Map<String, Object> details) {
        ApiError apiError = new ApiError(
                code,
                message,
                httpStatus.value(),
                path,
                Instant.now(),
                resolveTraceId(),
                details
        );
        return ResponseEntity.status(httpStatus).body(apiError);
    }

    private String resolveTraceId() {
        String traceId = CorrelationContext.getTraceId();
        if (StringUtils.hasText(traceId)) {
            return traceId;
        }
        return UUID.randomUUID().toString();
    }
}
