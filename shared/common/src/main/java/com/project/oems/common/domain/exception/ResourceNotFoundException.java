package com.project.oems.common.domain.exception;

import com.project.oems.common.error.ErrorCode;

public final class ResourceNotFoundException extends BusinessException {

    public ResourceNotFoundException(String message) {
        super(ErrorCode.RESOURCE_NOT_FOUND, message);
    }

    public ResourceNotFoundException(String message, Throwable cause) {
        super(ErrorCode.RESOURCE_NOT_FOUND, message, cause);
    }
}
