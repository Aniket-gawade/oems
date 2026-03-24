package com.project.oems.oemsapi.application.order;

public record OrderHttpResponse(
        int status,
        Object body,
        boolean replay
) {
}
