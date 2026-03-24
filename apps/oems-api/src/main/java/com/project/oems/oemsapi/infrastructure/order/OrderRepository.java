package com.project.oems.oemsapi.infrastructure.order;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface OrderRepository extends JpaRepository<OrderEntity, String> {

    Optional<OrderEntity> findByIdAndTraderId(String id, String traderId);
}
