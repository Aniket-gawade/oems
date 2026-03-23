package com.project.oems.oemsapi.domain.risk;

import com.project.oems.contracts.risk.RiskRejectCode;

import java.util.Map;
import java.util.Objects;

public record RiskCheckResult(
        RiskDecision decision,
        RiskRejectCode rejectCode,
        String message,
        Map<String, Object> auditPayload
) {

    public RiskCheckResult {
        Objects.requireNonNull(decision, "decision must not be null");
        Objects.requireNonNull(message, "message must not be null");
        Objects.requireNonNull(auditPayload, "auditPayload must not be null");
        if (decision == RiskDecision.FAIL && rejectCode == null) {
            throw new IllegalArgumentException("rejectCode is required for FAIL decision.");
        }
    }

    public static RiskCheckResult pass(String message, Map<String, Object> auditPayload) {
        return new RiskCheckResult(RiskDecision.PASS, null, message, auditPayload);
    }

    public static RiskCheckResult fail(RiskRejectCode rejectCode, String message, Map<String, Object> auditPayload) {
        return new RiskCheckResult(RiskDecision.FAIL, rejectCode, message, auditPayload);
    }

    public boolean isPass() {
        return decision == RiskDecision.PASS;
    }

    public boolean isFail() {
        return decision == RiskDecision.FAIL;
    }
}
