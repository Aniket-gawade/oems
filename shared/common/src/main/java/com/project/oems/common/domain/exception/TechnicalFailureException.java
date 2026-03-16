package com.project.oems.common.domain.exception;

public final class TechnicalFailureException extends RuntimeException {

    public TechnicalFailureException(String message) {
        super(message);
    }

    public TechnicalFailureException(String message, Throwable cause) {
        super(message, cause);
    }
}
