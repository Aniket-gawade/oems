package com.project.oems.oemsapi.application.order;

import com.project.oems.common.error.ErrorCode;
import com.project.oems.oemsapi.domain.order.Order;

public record OrderPlacementResult(
        Order order,
        ErrorCode rejectionErrorCode,
        String rejectionMessage
) {

    public static OrderPlacementResult accepted(Order order) {
        return new OrderPlacementResult(order, null, null);
    }

    public static OrderPlacementResult rejected(Order order, ErrorCode rejectionErrorCode, String rejectionMessage) {
        return new OrderPlacementResult(order, rejectionErrorCode, rejectionMessage);
    }

    public boolean isRejected() {
        return rejectionErrorCode != null;
    }
}
