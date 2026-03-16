package com.project.oems.common.error;

import java.time.Instant;
import java.util.Map;

public record ApiError(
        ErrorCode code,
        String message,
        int status,
        String path,
        Instant timestamp,
        String traceId,
        Map<String, Object> details
) {
}
