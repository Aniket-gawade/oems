package com.project.oems.oemsapi.infrastructure.order;

import org.springframework.data.jpa.repository.JpaRepository;

import java.time.Instant;
import java.util.Optional;

public interface IdempotencyKeyRepository extends JpaRepository<IdempotencyKeyEntity, Long> {

    Optional<IdempotencyKeyEntity> findByIdemKey(String idemKey);

    long deleteByExpiresAtBefore(Instant threshold);
}
