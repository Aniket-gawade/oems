package com.project.oems.common.domain.event;

public final class OrderEventType {

    public static final String ORDER_RECEIVED = "ORDER_RECEIVED";
    public static final String ORDER_ACCEPTED = "ORDER_ACCEPTED";
    public static final String ORDER_REJECTED = "ORDER_REJECTED";

    private OrderEventType() {
    }
}
