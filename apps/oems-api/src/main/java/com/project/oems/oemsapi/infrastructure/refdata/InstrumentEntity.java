package com.project.oems.oemsapi.infrastructure.refdata;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "instrument")
public class InstrumentEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "symbol", nullable = false, length = 32, unique = true)
    private String symbol;

    @Column(name = "name", nullable = false, length = 128)
    private String name;

    @Column(name = "tradable", nullable = false)
    private boolean tradable;

    @Column(name = "tick_size", nullable = false, precision = 18, scale = 8)
    private BigDecimal tickSize;

    @Column(name = "min_qty", nullable = false, precision = 18, scale = 8)
    private BigDecimal minQty;

    @Column(name = "max_qty", nullable = false, precision = 18, scale = 8)
    private BigDecimal maxQty;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    protected InstrumentEntity() {
    }

    public InstrumentEntity(Long id,
                            String symbol,
                            String name,
                            boolean tradable,
                            BigDecimal tickSize,
                            BigDecimal minQty,
                            BigDecimal maxQty,
                            Instant createdAt,
                            Instant updatedAt) {
        this.id = id;
        this.symbol = symbol;
        this.name = name;
        this.tradable = tradable;
        this.tickSize = tickSize;
        this.minQty = minQty;
        this.maxQty = maxQty;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getSymbol() {
        return symbol;
    }

    public void setSymbol(String symbol) {
        this.symbol = symbol;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public boolean isTradable() {
        return tradable;
    }

    public void setTradable(boolean tradable) {
        this.tradable = tradable;
    }

    public BigDecimal getTickSize() {
        return tickSize;
    }

    public void setTickSize(BigDecimal tickSize) {
        this.tickSize = tickSize;
    }

    public BigDecimal getMinQty() {
        return minQty;
    }

    public void setMinQty(BigDecimal minQty) {
        this.minQty = minQty;
    }

    public BigDecimal getMaxQty() {
        return maxQty;
    }

    public void setMaxQty(BigDecimal maxQty) {
        this.maxQty = maxQty;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }
}
