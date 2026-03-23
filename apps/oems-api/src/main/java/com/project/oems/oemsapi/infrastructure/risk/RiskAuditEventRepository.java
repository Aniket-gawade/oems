package com.project.oems.oemsapi.infrastructure.risk;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface RiskAuditEventRepository extends JpaRepository<RiskAuditEventEntity, Long> {

    Optional<RiskAuditEventEntity> findTopByOrderByIdDesc();
}
