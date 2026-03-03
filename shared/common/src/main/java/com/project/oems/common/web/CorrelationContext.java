package com.project.oems.common.web;

public final class CorrelationContext {

    private static final ThreadLocal<String> TRACE_ID = new ThreadLocal<>();

    private CorrelationContext() {
    }

    public static void setTraceId(String traceId) {
        TRACE_ID.set(traceId);
    }

    public static String getTraceId() {
        return TRACE_ID.get();
    }

    public static void clear() {
        TRACE_ID.remove();
    }
}
