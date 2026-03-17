package com.project.oems.oemsapi.config.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.project.oems.common.error.ApiError;
import com.project.oems.common.error.ErrorCode;
import com.project.oems.common.web.CorrelationContext;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import java.io.IOException;
import java.time.Instant;
import java.util.Map;
import java.util.UUID;

@Component
public class ApiAuthenticationEntryPoint implements AuthenticationEntryPoint {

    private final ObjectMapper objectMapper = new ObjectMapper()
            .registerModule(new JavaTimeModule())
            .disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);

    @Override
    public void commence(HttpServletRequest request,
                         HttpServletResponse response,
                         AuthenticationException authException) throws IOException {
        ApiError apiError = new ApiError(
                ErrorCode.UNAUTHORIZED,
                "Missing or invalid bearer token.",
                HttpStatus.UNAUTHORIZED.value(),
                request.getRequestURI(),
                Instant.now(),
                resolveTraceId(),
                Map.of()
        );

        response.setStatus(HttpStatus.UNAUTHORIZED.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.getWriter().write(objectMapper.writeValueAsString(apiError));
    }

    private String resolveTraceId() {
        String traceId = CorrelationContext.getTraceId();
        if (StringUtils.hasText(traceId)) {
            return traceId;
        }
        return UUID.randomUUID().toString();
    }
}
