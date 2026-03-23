package com.project.oems.oemsapi.infrastructure.order;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OrderEventRepository extends JpaRepository<OrderEventEntity, Long> {

    List<OrderEventEntity> findByOrderIdOrderByCreatedAtAsc(String orderId);
}
