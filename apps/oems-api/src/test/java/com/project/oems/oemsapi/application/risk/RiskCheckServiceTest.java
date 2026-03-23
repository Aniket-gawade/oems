package com.project.oems.oemsapi.application.risk;

import com.project.oems.contracts.order.OrderType;
import com.project.oems.contracts.order.Side;
import com.project.oems.contracts.risk.RiskRejectCode;
import com.project.oems.oemsapi.domain.order.OrderDraft;
import com.project.oems.oemsapi.domain.refdata.Instrument;
import com.project.oems.oemsapi.domain.risk.RiskCheckResult;
import com.project.oems.oemsapi.infrastructure.risk.RiskAuditEventEntity;
import com.project.oems.oemsapi.infrastructure.risk.RiskAuditEventRepository;
import com.project.oems.oemsapi.infrastructure.risk.RiskLimitEntity;
import com.project.oems.oemsapi.infrastructure.risk.RiskLimitMapper;
import com.project.oems.oemsapi.infrastructure.risk.RiskLimitRepository;
import io.micrometer.core.instrument.simple.SimpleMeterRegistry;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class RiskCheckServiceTest {

    @Mock
    private RiskLimitRepository riskLimitRepository;

    @Mock
    private RiskAuditEventRepository riskAuditEventRepository;

    private SimpleMeterRegistry meterRegistry;
    private RiskCheckService riskCheckService;

    @BeforeEach
    void setUp() {
        meterRegistry = new SimpleMeterRegistry();
        when(riskAuditEventRepository.save(any(RiskAuditEventEntity.class)))
                .thenAnswer(invocation -> invocation.getArgument(0, RiskAuditEventEntity.class));
        riskCheckService = new RiskCheckService(
                riskLimitRepository,
                new RiskLimitMapper(),
                riskAuditEventRepository,
                meterRegistry
        );
    }

    @Test
    void maxQtyEqualToLimitPassesAndJustAboveFails() {
        mockRiskLimit("trader1", "AAPL",
                new BigDecimal("5000.00000000"),
                new BigDecimal("1000000.00000000"),
                new BigDecimal("5.0000"));

        RiskCheckResult atLimit = riskCheckService.evaluate(
                draft("trader1", "AAPL", OrderType.LIMIT, new BigDecimal("5000.00000000"), new BigDecimal("200.00")),
                instrument("AAPL"),
                "trader1"
        );
        RiskCheckResult aboveLimit = riskCheckService.evaluate(
                draft("trader1", "AAPL", OrderType.LIMIT, new BigDecimal("5000.00000001"), new BigDecimal("200.00")),
                instrument("AAPL"),
                "trader1"
        );

        assertThat(atLimit.isPass()).isTrue();
        assertThat(aboveLimit.isFail()).isTrue();
        assertThat(aboveLimit.rejectCode()).isEqualTo(RiskRejectCode.RISK_MAX_QTY_EXCEEDED);
    }

    @Test
    void maxNotionalBoundaryUsesFixedScaleAndFailsWhenExceeded() {
        mockRiskLimit("trader1", "AAPL",
                new BigDecimal("10.00000000"),
                new BigDecimal("1000.00000000"),
                new BigDecimal("5.0000"));

        RiskCheckResult atLimit = riskCheckService.evaluate(
                draft("trader1", "AAPL", OrderType.LIMIT, new BigDecimal("10.00000000"), new BigDecimal("100.00000000")),
                instrument("AAPL"),
                "trader1"
        );
        RiskCheckResult aboveLimit = riskCheckService.evaluate(
                draft("trader1", "AAPL", OrderType.LIMIT, new BigDecimal("10.00000000"), new BigDecimal("100.00000001")),
                instrument("AAPL"),
                "trader1"
        );

        assertThat(atLimit.isPass()).isTrue();
        assertThat(aboveLimit.isFail()).isTrue();
        assertThat(aboveLimit.rejectCode()).isEqualTo(RiskRejectCode.RISK_MAX_NOTIONAL_EXCEEDED);
        assertThat(aboveLimit.auditPayload().get("notional")).isEqualTo("1000.00000010");
    }

    @Test
    void priceBandBoundariesPassAndOutsideBandFails() {
        mockRiskLimit("trader1", "AAPL",
                new BigDecimal("5000.00000000"),
                new BigDecimal("1000000.00000000"),
                new BigDecimal("5.0000"));

        RiskCheckResult lowerBoundary = riskCheckService.evaluate(
                draft("trader1", "AAPL", OrderType.LIMIT, new BigDecimal("10.00000000"), new BigDecimal("190.00000000")),
                instrument("AAPL"),
                "trader1"
        );
        RiskCheckResult upperBoundary = riskCheckService.evaluate(
                draft("trader1", "AAPL", OrderType.LIMIT, new BigDecimal("10.00000000"), new BigDecimal("210.00000000")),
                instrument("AAPL"),
                "trader1"
        );
        RiskCheckResult outsideBoundary = riskCheckService.evaluate(
                draft("trader1", "AAPL", OrderType.LIMIT, new BigDecimal("10.00000000"), new BigDecimal("210.01000000")),
                instrument("AAPL"),
                "trader1"
        );

        assertThat(lowerBoundary.isPass()).isTrue();
        assertThat(upperBoundary.isPass()).isTrue();
        assertThat(outsideBoundary.isFail()).isTrue();
        assertThat(outsideBoundary.rejectCode()).isEqualTo(RiskRejectCode.RISK_PRICE_BAND_EXCEEDED);
    }

    @Test
    void ruleOrderIsDeterministicAndFailFast() {
        mockRiskLimit("trader1", "AAPL",
                new BigDecimal("5000.00000000"),
                new BigDecimal("1000.00000000"),
                new BigDecimal("5.0000"));

        RiskCheckResult result = riskCheckService.evaluate(
                draft("trader1", "AAPL", OrderType.LIMIT, new BigDecimal("6000.00000000"), new BigDecimal("1000.00000000")),
                instrument("AAPL"),
                "trader1"
        );

        assertThat(result.isFail()).isTrue();
        assertThat(result.rejectCode()).isEqualTo(RiskRejectCode.RISK_MAX_QTY_EXCEEDED);
    }

    @Test
    void missingRiskProfileUsesFallbackPolicy() {
        when(riskLimitRepository.findTopByTraderIdAndSymbol("trader-x", "AAPL")).thenReturn(Optional.empty());
        when(riskLimitRepository.findTopByTraderIdAndSymbolIsNull("trader-x")).thenReturn(Optional.empty());

        RiskCheckResult passResult = riskCheckService.evaluate(
                draft("trader-x", "AAPL", OrderType.MARKET, new BigDecimal("100.00000000"), null),
                instrument("AAPL"),
                "trader-x"
        );
        RiskCheckResult failResult = riskCheckService.evaluate(
                draft("trader-x", "AAPL", OrderType.MARKET, new BigDecimal("1001.00000000"), null),
                instrument("AAPL"),
                "trader-x"
        );

        assertThat(passResult.isPass()).isTrue();
        assertThat(passResult.auditPayload().get("riskLimitSource")).isEqualTo("fallback-default");
        assertThat(failResult.isFail()).isTrue();
        assertThat(failResult.rejectCode()).isEqualTo(RiskRejectCode.RISK_MAX_QTY_EXCEEDED);
    }

    @Test
    void rejectCountersIncrementPerRejectCodeAndAuditPayloadIsPersisted() {
        mockRiskLimit("trader1", "AAPL",
                new BigDecimal("5000.00000000"),
                new BigDecimal("1000000.00000000"),
                new BigDecimal("5.0000"));

        RiskCheckResult result = riskCheckService.evaluate(
                draft("trader1", "AAPL", OrderType.LIMIT, new BigDecimal("5001.00000000"), new BigDecimal("200.00000000")),
                instrument("AAPL"),
                "trader1"
        );

        assertThat(result.isFail()).isTrue();
        assertThat(result.rejectCode()).isEqualTo(RiskRejectCode.RISK_MAX_QTY_EXCEEDED);
        assertThat(meterRegistry.get("oems.risk.reject.total")
                .tag("rejectCode", "RISK_MAX_QTY_EXCEEDED")
                .counter()
                .count()).isEqualTo(1.0);

        ArgumentCaptor<RiskAuditEventEntity> captor = ArgumentCaptor.forClass(RiskAuditEventEntity.class);
        verify(riskAuditEventRepository).save(captor.capture());
        RiskAuditEventEntity saved = captor.getValue();
        assertThat(saved.getDecision()).isEqualTo("FAIL");
        assertThat(saved.getRejectCode()).isEqualTo("RISK_MAX_QTY_EXCEEDED");
        assertThat(saved.getPayloadJson()).contains("\"rejectCode\":\"RISK_MAX_QTY_EXCEEDED\"");
    }

    private void mockRiskLimit(String traderId,
                               String symbol,
                               BigDecimal maxQty,
                               BigDecimal maxNotional,
                               BigDecimal priceBandPct) {
        Instant now = Instant.parse("2026-03-20T10:15:30Z");
        RiskLimitEntity entity = new RiskLimitEntity(
                1L,
                traderId,
                symbol,
                maxQty,
                maxNotional,
                priceBandPct,
                now,
                now
        );
        when(riskLimitRepository.findTopByTraderIdAndSymbol(traderId, symbol))
                .thenReturn(Optional.of(entity));
    }

    private OrderDraft draft(String traderId,
                             String symbol,
                             OrderType orderType,
                             BigDecimal quantity,
                             BigDecimal price) {
        return new OrderDraft(traderId, symbol, Side.BUY, orderType, quantity, price);
    }

    private Instrument instrument(String symbol) {
        Instant now = Instant.parse("2026-03-20T10:15:30Z");
        return new Instrument(
                1L,
                symbol,
                "Instrument " + symbol,
                true,
                new BigDecimal("0.01"),
                new BigDecimal("1.00000000"),
                new BigDecimal("100000.00000000"),
                now,
                now
        );
    }
}
