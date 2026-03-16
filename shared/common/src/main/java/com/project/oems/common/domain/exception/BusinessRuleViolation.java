package com.project.oems.common.domain.exception;

import com.project.oems.common.error.ErrorCode;

public final class BusinessRuleViolation extends BusinessException {

    public BusinessRuleViolation(ErrorCode errorCode, String message) {
        super(errorCode, message);
    }

    public BusinessRuleViolation(ErrorCode errorCode, String message, Throwable cause) {
        super(errorCode, message, cause);
    }
}
