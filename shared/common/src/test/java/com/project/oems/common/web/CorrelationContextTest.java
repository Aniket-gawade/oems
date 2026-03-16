package com.project.oems.common.web;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;

class CorrelationContextTest {

    @Test
    void setAndClearTraceIdWorks() {
        CorrelationContext.setTraceId("trace-123");
        assertEquals("trace-123", CorrelationContext.getTraceId());

        CorrelationContext.clear();
        assertNull(CorrelationContext.getTraceId());
    }
}
