package com.project.oems.oemsapi.api.order;

import java.time.Instant;
import java.util.Map;

public record OrderEventResponse(
        Long eventId,
        String orderId,
        String eventType,
        Map<String, Object> payload,
        String traceId,
        Instant createdAt
) {
}
