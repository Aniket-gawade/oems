package com.project.oems.oemsapi.infrastructure.risk;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "risk_limit")
public class RiskLimitEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "trader_id", nullable = false, length = 64)
    private String traderId;

    @Column(name = "symbol", length = 32)
    private String symbol;

    @Column(name = "max_qty", nullable = false, precision = 18, scale = 8)
    private BigDecimal maxQty;

    @Column(name = "max_notional", nullable = false, precision = 20, scale = 8)
    private BigDecimal maxNotional;

    @Column(name = "price_band_pct", nullable = false, precision = 8, scale = 4)
    private BigDecimal priceBandPct;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    protected RiskLimitEntity() {
    }

    public RiskLimitEntity(Long id,
                           String traderId,
                           String symbol,
                           BigDecimal maxQty,
                           BigDecimal maxNotional,
                           BigDecimal priceBandPct,
                           Instant createdAt,
                           Instant updatedAt) {
        this.id = id;
        this.traderId = traderId;
        this.symbol = symbol;
        this.maxQty = maxQty;
        this.maxNotional = maxNotional;
        this.priceBandPct = priceBandPct;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTraderId() {
        return traderId;
    }

    public void setTraderId(String traderId) {
        this.traderId = traderId;
    }

    public String getSymbol() {
        return symbol;
    }

    public void setSymbol(String symbol) {
        this.symbol = symbol;
    }

    public BigDecimal getMaxQty() {
        return maxQty;
    }

    public void setMaxQty(BigDecimal maxQty) {
        this.maxQty = maxQty;
    }

    public BigDecimal getMaxNotional() {
        return maxNotional;
    }

    public void setMaxNotional(BigDecimal maxNotional) {
        this.maxNotional = maxNotional;
    }

    public BigDecimal getPriceBandPct() {
        return priceBandPct;
    }

    public void setPriceBandPct(BigDecimal priceBandPct) {
        this.priceBandPct = priceBandPct;
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
