package com.project.oems.oemsapi.api.order;

import com.project.oems.oemsapi.application.order.OrderQueryService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/v1/ops/orders")
public class OrderAuditController {

    private final OrderQueryService orderQueryService;

    public OrderAuditController(OrderQueryService orderQueryService) {
        this.orderQueryService = orderQueryService;
    }

    @GetMapping("/{orderId}/events")
    public List<OrderEventResponse> getOrderEvents(@PathVariable UUID orderId) {
        return orderQueryService.getOrderEventsByOrderId(orderId);
    }
}
