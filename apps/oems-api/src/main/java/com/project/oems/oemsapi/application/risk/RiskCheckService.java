package com.project.oems.oemsapi.application.risk;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.project.oems.contracts.order.OrderType;
import com.project.oems.contracts.risk.RiskRejectCode;
import com.project.oems.oemsapi.domain.order.OrderDraft;
import com.project.oems.oemsapi.domain.refdata.Instrument;
import com.project.oems.oemsapi.domain.risk.RiskCheckResult;
import com.project.oems.oemsapi.domain.risk.RiskDecision;
import com.project.oems.oemsapi.domain.risk.RiskLimit;
import com.project.oems.oemsapi.infrastructure.risk.RiskAuditEventEntity;
import com.project.oems.oemsapi.infrastructure.risk.RiskAuditEventRepository;
import com.project.oems.oemsapi.infrastructure.risk.RiskLimitMapper;
import com.project.oems.oemsapi.infrastructure.risk.RiskLimitRepository;
import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.MeterRegistry;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Optional;

import static com.project.oems.common.math.DecimalMath.DEFAULT_SCALE;
import static com.project.oems.common.math.DecimalMath.divide;
import static com.project.oems.common.math.DecimalMath.multiply;
import static com.project.oems.common.math.DecimalMath.normalize;

@Service
@Transactional
public class RiskCheckService {

    private static final BigDecimal HUNDRED = new BigDecimal("100");
    private static final RiskLimit FALLBACK_LIMIT_TEMPLATE = new RiskLimit(
            "DEFAULT",
            null,
            new BigDecimal("1000.00000000"),
            new BigDecimal("100000.00000000"),
            new BigDecimal("10.0000")
    );

    private final RiskLimitRepository riskLimitRepository;
    private final RiskLimitMapper riskLimitMapper;
    private final RiskAuditEventRepository riskAuditEventRepository;
    private final MeterRegistry meterRegistry;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public RiskCheckService(RiskLimitRepository riskLimitRepository,
                            RiskLimitMapper riskLimitMapper,
                            RiskAuditEventRepository riskAuditEventRepository,
                            MeterRegistry meterRegistry) {
        this.riskLimitRepository = riskLimitRepository;
        this.riskLimitMapper = riskLimitMapper;
        this.riskAuditEventRepository = riskAuditEventRepository;
        this.meterRegistry = meterRegistry;
    }

    public RiskCheckResult evaluate(OrderDraft orderDraft, Instrument instrument, String traderId) {
        ResolvedRiskLimit resolvedRiskLimit = resolveRiskLimit(traderId, instrument.symbol());
        RiskLimit riskLimit = resolvedRiskLimit.riskLimit();

        BigDecimal referencePrice = deriveReferencePrice(riskLimit);
        BigDecimal effectivePrice = resolveEffectivePrice(orderDraft, referencePrice);
        BigDecimal notional = multiply(orderDraft.quantity(), effectivePrice, DEFAULT_SCALE);

        Map<String, Object> baseAuditPayload = buildBaseAuditPayload(
                orderDraft,
                riskLimit,
                resolvedRiskLimit.source(),
                referencePrice,
                effectivePrice,
                notional
        );

        Optional<RiskCheckResult> maxQtyFail = checkMaxQty(orderDraft, riskLimit, baseAuditPayload);
        if (maxQtyFail.isPresent()) {
            return finalizeResult(orderDraft, maxQtyFail.get());
        }

        Optional<RiskCheckResult> maxNotionalFail = checkMaxNotional(notional, riskLimit, baseAuditPayload);
        if (maxNotionalFail.isPresent()) {
            return finalizeResult(orderDraft, maxNotionalFail.get());
        }

        Optional<RiskCheckResult> priceBandFail = checkPriceBand(orderDraft, referencePrice, riskLimit, baseAuditPayload);
        if (priceBandFail.isPresent()) {
            return finalizeResult(orderDraft, priceBandFail.get());
        }

        RiskCheckResult passResult = RiskCheckResult.pass(
                "Risk checks passed.",
                withOutcome(baseAuditPayload, "PASS", null, "All rules passed.")
        );
        return finalizeResult(orderDraft, passResult);
    }

    private Optional<RiskCheckResult> checkMaxQty(OrderDraft orderDraft,
                                                  RiskLimit riskLimit,
                                                  Map<String, Object> baseAuditPayload) {
        BigDecimal quantity = normalize(orderDraft.quantity(), DEFAULT_SCALE);
        if (quantity.compareTo(riskLimit.maxQty()) > 0) {
            String message = "Order quantity exceeds configured risk limit.";
            return Optional.of(RiskCheckResult.fail(
                    RiskRejectCode.RISK_MAX_QTY_EXCEEDED,
                    message,
                    withOutcome(baseAuditPayload, "FAIL", RiskRejectCode.RISK_MAX_QTY_EXCEEDED.name(), message)
            ));
        }
        return Optional.empty();
    }

    private Optional<RiskCheckResult> checkMaxNotional(BigDecimal notional,
                                                       RiskLimit riskLimit,
                                                       Map<String, Object> baseAuditPayload) {
        BigDecimal normalizedNotional = normalize(notional, DEFAULT_SCALE);
        if (normalizedNotional.compareTo(riskLimit.maxNotional()) > 0) {
            String message = "Order notional exceeds configured risk limit.";
            return Optional.of(RiskCheckResult.fail(
                    RiskRejectCode.RISK_MAX_NOTIONAL_EXCEEDED,
                    message,
                    withOutcome(baseAuditPayload, "FAIL", RiskRejectCode.RISK_MAX_NOTIONAL_EXCEEDED.name(), message)
            ));
        }
        return Optional.empty();
    }

    private Optional<RiskCheckResult> checkPriceBand(OrderDraft orderDraft,
                                                     BigDecimal referencePrice,
                                                     RiskLimit riskLimit,
                                                     Map<String, Object> baseAuditPayload) {
        if (orderDraft.orderType() != OrderType.LIMIT || orderDraft.price() == null) {
            return Optional.empty();
        }

        BigDecimal price = normalize(orderDraft.price(), DEFAULT_SCALE);
        BigDecimal pct = divide(riskLimit.priceBandPct(), HUNDRED, DEFAULT_SCALE);
        BigDecimal lowerBound = normalize(referencePrice.subtract(multiply(referencePrice, pct, DEFAULT_SCALE)));
        BigDecimal upperBound = normalize(referencePrice.add(multiply(referencePrice, pct, DEFAULT_SCALE)));

        if (price.compareTo(lowerBound) < 0 || price.compareTo(upperBound) > 0) {
            String message = "Limit price is outside allowed price band.";
            Map<String, Object> payload = new LinkedHashMap<>(baseAuditPayload);
            payload.put("priceBandLower", lowerBound.toPlainString());
            payload.put("priceBandUpper", upperBound.toPlainString());
            return Optional.of(RiskCheckResult.fail(
                    RiskRejectCode.RISK_PRICE_BAND_EXCEEDED,
                    message,
                    withOutcome(payload, "FAIL", RiskRejectCode.RISK_PRICE_BAND_EXCEEDED.name(), message)
            ));
        }

        return Optional.empty();
    }

    private ResolvedRiskLimit resolveRiskLimit(String traderId, String symbol) {
        return riskLimitRepository.findTopByTraderIdAndSymbol(traderId, symbol)
                .map(riskLimitMapper::toDomain)
                .map(riskLimit -> new ResolvedRiskLimit(riskLimit, "trader-symbol"))
                .or(() -> riskLimitRepository.findTopByTraderIdAndSymbolIsNull(traderId)
                        .map(riskLimitMapper::toDomain)
                        .map(riskLimit -> new ResolvedRiskLimit(riskLimit, "trader-default")))
                .orElseGet(() -> {
                    RiskLimit fallback = new RiskLimit(
                            traderId,
                            symbol,
                            FALLBACK_LIMIT_TEMPLATE.maxQty(),
                            FALLBACK_LIMIT_TEMPLATE.maxNotional(),
                            FALLBACK_LIMIT_TEMPLATE.priceBandPct()
                    );
                    return new ResolvedRiskLimit(fallback, "fallback-default");
                });
    }

    private BigDecimal deriveReferencePrice(RiskLimit riskLimit) {
        return divide(riskLimit.maxNotional(), riskLimit.maxQty(), DEFAULT_SCALE);
    }

    private BigDecimal resolveEffectivePrice(OrderDraft orderDraft, BigDecimal referencePrice) {
        if (orderDraft.orderType() == OrderType.LIMIT && orderDraft.price() != null) {
            return normalize(orderDraft.price(), DEFAULT_SCALE);
        }
        return normalize(referencePrice, DEFAULT_SCALE);
    }

    private Map<String, Object> buildBaseAuditPayload(OrderDraft orderDraft,
                                                      RiskLimit riskLimit,
                                                      String source,
                                                      BigDecimal referencePrice,
                                                      BigDecimal effectivePrice,
                                                      BigDecimal notional) {
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("traderId", orderDraft.traderId());
        payload.put("symbol", orderDraft.symbol());
        payload.put("orderType", orderDraft.orderType().name());
        payload.put("quantity", normalize(orderDraft.quantity(), DEFAULT_SCALE).toPlainString());
        payload.put("price", orderDraft.price() == null ? null : normalize(orderDraft.price(), DEFAULT_SCALE).toPlainString());
        payload.put("effectivePrice", effectivePrice.toPlainString());
        payload.put("referencePrice", referencePrice.toPlainString());
        payload.put("notional", normalize(notional, DEFAULT_SCALE).toPlainString());
        payload.put("riskLimitSource", source);
        payload.put("riskLimit", Map.of(
                "maxQty", riskLimit.maxQty().toPlainString(),
                "maxNotional", riskLimit.maxNotional().toPlainString(),
                "priceBandPct", riskLimit.priceBandPct().toPlainString()
        ));
        return payload;
    }

    private Map<String, Object> withOutcome(Map<String, Object> basePayload,
                                            String outcome,
                                            String rejectCode,
                                            String message) {
        Map<String, Object> payload = new LinkedHashMap<>(basePayload);
        payload.put("outcome", outcome);
        payload.put("rejectCode", rejectCode);
        payload.put("message", message);
        return payload;
    }

    private RiskCheckResult finalizeResult(OrderDraft orderDraft, RiskCheckResult result) {
        if (result.isFail()) {
            incrementRejectCounter(result.rejectCode());
        }
        persistAuditEvent(orderDraft, result);
        return result;
    }

    private void incrementRejectCounter(RiskRejectCode rejectCode) {
        Counter.builder("oems.risk.reject.total")
                .description("Count of rejected risk checks by reject code.")
                .tag("rejectCode", rejectCode.name())
                .register(meterRegistry)
                .increment();
    }

    private void persistAuditEvent(OrderDraft orderDraft, RiskCheckResult result) {
        String payloadJson = toJson(result.auditPayload());
        RiskAuditEventEntity event = new RiskAuditEventEntity(
                null,
                orderDraft.traderId(),
                orderDraft.symbol(),
                result.decision().name(),
                result.rejectCode() == null ? null : result.rejectCode().name(),
                payloadJson,
                Instant.now()
        );
        riskAuditEventRepository.save(event);
    }

    private String toJson(Map<String, Object> payload) {
        try {
            return objectMapper.writeValueAsString(payload);
        } catch (JsonProcessingException ex) {
            throw new IllegalStateException("Failed to serialize risk audit payload.", ex);
        }
    }

    private record ResolvedRiskLimit(RiskLimit riskLimit, String source) {
    }
}
