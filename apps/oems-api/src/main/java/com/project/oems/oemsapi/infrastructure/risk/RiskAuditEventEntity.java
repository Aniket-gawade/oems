package com.project.oems.oemsapi.infrastructure.risk;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.Instant;

@Entity
@Table(name = "risk_audit_event")
public class RiskAuditEventEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "trader_id", nullable = false, length = 64)
    private String traderId;

    @Column(name = "symbol", nullable = false, length = 32)
    private String symbol;

    @Column(name = "decision", nullable = false, length = 8)
    private String decision;

    @Column(name = "reject_code", length = 64)
    private String rejectCode;

    @Column(name = "payload_json", nullable = false, length = 16384)
    private String payloadJson;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    protected RiskAuditEventEntity() {
    }

    public RiskAuditEventEntity(Long id,
                                String traderId,
                                String symbol,
                                String decision,
                                String rejectCode,
                                String payloadJson,
                                Instant createdAt) {
        this.id = id;
        this.traderId = traderId;
        this.symbol = symbol;
        this.decision = decision;
        this.rejectCode = rejectCode;
        this.payloadJson = payloadJson;
        this.createdAt = createdAt;
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

    public String getDecision() {
        return decision;
    }

    public void setDecision(String decision) {
        this.decision = decision;
    }

    public String getRejectCode() {
        return rejectCode;
    }

    public void setRejectCode(String rejectCode) {
        this.rejectCode = rejectCode;
    }

    public String getPayloadJson() {
        return payloadJson;
    }

    public void setPayloadJson(String payloadJson) {
        this.payloadJson = payloadJson;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}
