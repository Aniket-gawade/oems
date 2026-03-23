package com.project.oems.oemsapi.infrastructure.risk;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface RiskLimitRepository extends JpaRepository<RiskLimitEntity, Long> {

    Optional<RiskLimitEntity> findTopByTraderIdAndSymbol(String traderId, String symbol);

    Optional<RiskLimitEntity> findTopByTraderIdAndSymbolIsNull(String traderId);
}
