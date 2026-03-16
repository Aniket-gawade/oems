package com.project.oems.common.error;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class ErrorCodeTest {

    @Test
    void containsExpectedGlobalAndDomainErrorCodes() {
        assertEquals(ErrorCode.VALIDATION_ERROR, ErrorCode.valueOf("VALIDATION_ERROR"));
        assertEquals(ErrorCode.IDEMPOTENCY_CONFLICT, ErrorCode.valueOf("IDEMPOTENCY_CONFLICT"));
        assertEquals(ErrorCode.INTERNAL_SERVER_ERROR, ErrorCode.valueOf("INTERNAL_SERVER_ERROR"));
        assertTrue(ErrorCode.values().length >= 11);
    }
}
