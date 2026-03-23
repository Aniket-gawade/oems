package com.project.oems.oemsapi.infrastructure.refdata;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface InstrumentRepository extends JpaRepository<InstrumentEntity, Long> {

    Optional<InstrumentEntity> findBySymbol(String symbol);
}
