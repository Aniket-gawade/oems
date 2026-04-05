package com.project.oems.oemsapi.api.order;

import com.jayway.jsonpath.JsonPath;
import com.project.oems.oemsapi.support.ContainerizedIntegrationTest;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.concurrent.Callable;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.TimeUnit;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.http.MediaType.APPLICATION_JSON;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class OrderRiskIntegrationTest extends ContainerizedIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Autowired
    private StringRedisTemplate redisTemplate;

    @Value("${oems.idempotency.redis-cache-enabled:false}")
    private boolean redisCacheEnabled;

    @Test
    void successfulLimitOrderPersistsOrderAndEvents() throws Exception {
        String response = mockMvc.perform(post("/v1/orders")
                        .with(traderJwt())
                        .header("Idempotency-Key", "idem-limit-2001")
                        .contentType(APPLICATION_JSON)
                        .content("""
                                {
                                  "clientOrderId": "lim-2001",
                                  "symbol": "AAPL",
                                  "side": "BUY",
                                  "orderType": "LIMIT",
                                  "quantity": 10,
                                  "price": 200.00
                                }
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value("NEW"))
                .andExpect(jsonPath("$.symbol").value("AAPL"))
                .andExpect(jsonPath("$.orderType").value("LIMIT"))
                .andExpect(jsonPath("$.price").value(200.00))
                .andReturn()
                .getResponse()
                .getContentAsString();

        String orderId = JsonPath.read(response, "$.orderId");
        String status = jdbcTemplate.queryForObject(
                "SELECT status FROM order_book WHERE id = ?",
                String.class,
                orderId
        );
        String traderId = jdbcTemplate.queryForObject(
                "SELECT trader_id FROM order_book WHERE id = ?",
                String.class,
                orderId
        );

        assertThat(status).isEqualTo("NEW");
        assertThat(traderId).isEqualTo("trader1");
        assertEvents(orderId, List.of("ORDER_RECEIVED", "ORDER_ACCEPTED"));
    }

    @Test
    void successfulMarketOrderWithoutPriceIsAccepted() throws Exception {
        String response = mockMvc.perform(post("/v1/orders")
                        .with(traderJwt())
                        .header("Idempotency-Key", "idem-market-2002")
                        .contentType(APPLICATION_JSON)
                        .content("""
                                {
                                  "clientOrderId": "mk-2002",
                                  "symbol": "AAPL",
                                  "side": "BUY",
                                  "orderType": "MARKET",
                                  "quantity": 10
                                }
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value("NEW"))
                .andExpect(jsonPath("$.symbol").value("AAPL"))
                .andExpect(jsonPath("$.orderType").value("MARKET"))
                .andExpect(jsonPath("$.price").isEmpty())
                .andReturn()
                .getResponse()
                .getContentAsString();

        String orderId = JsonPath.read(response, "$.orderId");
        BigDecimal notional = jdbcTemplate.queryForObject(
                "SELECT notional FROM order_book WHERE id = ?",
                BigDecimal.class,
                orderId
        );
        assertThat(notional).isGreaterThan(BigDecimal.ZERO);
        assertEvents(orderId, List.of("ORDER_RECEIVED", "ORDER_ACCEPTED"));
    }

    @Test
    void limitOrderMissingPriceReturnsValidationError() throws Exception {
        mockMvc.perform(post("/v1/orders")
                        .with(traderJwt())
                        .header("Idempotency-Key", "idem-invalid-1001")
                        .contentType(APPLICATION_JSON)
                        .content("""
                                {
                                  "clientOrderId": "lim-1001",
                                  "symbol": "AAPL",
                                  "side": "BUY",
                                  "orderType": "LIMIT",
                                  "quantity": 10
                                }
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("VALIDATION_ERROR"))
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.path").value("/v1/orders"));
    }

    @Test
    void instrumentNotFoundReturns404() throws Exception {
        mockMvc.perform(post("/v1/orders")
                        .with(traderJwt())
                        .header("Idempotency-Key", "idem-ins-2003")
                        .contentType(APPLICATION_JSON)
                        .content("""
                                {
                                  "clientOrderId": "ins-2003",
                                  "symbol": "UNKNOWN",
                                  "side": "BUY",
                                  "orderType": "LIMIT",
                                  "quantity": 10,
                                  "price": 200.00
                                }
                                """))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code").value("INSTRUMENT_NOT_FOUND"))
                .andExpect(jsonPath("$.status").value(404));
    }

    @Test
    void riskMaxQtyRejectionPersistsRejectedOrderAndEvents() throws Exception {
        mockMvc.perform(post("/v1/orders")
                        .with(traderJwt())
                        .header("Idempotency-Key", "idem-risk-2004")
                        .contentType(APPLICATION_JSON)
                        .content("""
                                {
                                  "clientOrderId": "risk-2004",
                                  "symbol": "AAPL",
                                  "side": "BUY",
                                  "orderType": "LIMIT",
                                  "quantity": 5001,
                                  "price": 200.00
                                }
                                """))
                .andExpect(status().isUnprocessableEntity())
                .andExpect(jsonPath("$.code").value("RISK_MAX_QTY_EXCEEDED"))
                .andExpect(jsonPath("$.status").value(422));

        String orderId = jdbcTemplate.queryForObject(
                "SELECT id FROM order_book WHERE client_order_id = ?",
                String.class,
                "risk-2004"
        );
        String status = jdbcTemplate.queryForObject(
                "SELECT status FROM order_book WHERE id = ?",
                String.class,
                orderId
        );
        String rejectionReason = jdbcTemplate.queryForObject(
                "SELECT rejection_reason FROM order_book WHERE id = ?",
                String.class,
                orderId
        );
        String rejectCode = jdbcTemplate.queryForObject(
                "SELECT reject_code FROM risk_audit_event ORDER BY id DESC LIMIT 1",
                String.class
        );
        String payload = jdbcTemplate.queryForObject(
                "SELECT payload_json FROM risk_audit_event ORDER BY id DESC LIMIT 1",
                String.class
        );

        assertThat(status).isEqualTo("REJECTED");
        assertThat(rejectionReason).isEqualTo("RISK_MAX_QTY_EXCEEDED");
        assertThat(rejectCode).isEqualTo("RISK_MAX_QTY_EXCEEDED");
        assertThat(payload).contains("\"rejectCode\":\"RISK_MAX_QTY_EXCEEDED\"");
        assertThat(payload).contains("\"riskLimitSource\":\"trader-symbol\"");
        assertEvents(orderId, List.of("ORDER_RECEIVED", "ORDER_REJECTED"));
    }

    @Test
    void riskMaxNotionalRejectionReturnsExpectedCode() throws Exception {
        mockMvc.perform(post("/v1/orders")
                        .with(traderJwt())
                        .header("Idempotency-Key", "idem-risk-2005")
                        .contentType(APPLICATION_JSON)
                        .content("""
                                {
                                  "clientOrderId": "risk-2005",
                                  "symbol": "AAPL",
                                  "side": "BUY",
                                  "orderType": "LIMIT",
                                  "quantity": 5000,
                                  "price": 210.00
                                }
                                """))
                .andExpect(status().isUnprocessableEntity())
                .andExpect(jsonPath("$.code").value("RISK_MAX_NOTIONAL_EXCEEDED"))
                .andExpect(jsonPath("$.status").value(422));
    }

    @Test
    void riskPriceBandRejectionReturnsExpectedCode() throws Exception {
        mockMvc.perform(post("/v1/orders")
                        .with(traderJwt())
                        .header("Idempotency-Key", "idem-risk-2006")
                        .contentType(APPLICATION_JSON)
                        .content("""
                                {
                                  "clientOrderId": "risk-2006",
                                  "symbol": "AAPL",
                                  "side": "BUY",
                                  "orderType": "LIMIT",
                                  "quantity": 10,
                                  "price": 210.01
                                }
                                """))
                .andExpect(status().isUnprocessableEntity())
                .andExpect(jsonPath("$.code").value("RISK_PRICE_BAND_EXCEEDED"))
                .andExpect(jsonPath("$.status").value(422));
    }

    @Test
    void everyOrderAttemptPersistsReceivedAndTerminalEvent() throws Exception {
        String acceptedResponse = mockMvc.perform(post("/v1/orders")
                        .with(traderJwt())
                        .header("Idempotency-Key", "idem-evt-2007")
                        .contentType(APPLICATION_JSON)
                        .content("""
                                {
                                  "clientOrderId": "evt-2007",
                                  "symbol": "AAPL",
                                  "side": "BUY",
                                  "orderType": "LIMIT",
                                  "quantity": 10,
                                  "price": 200.00
                                }
                                """))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString();
        String acceptedOrderId = JsonPath.read(acceptedResponse, "$.orderId");
        assertEvents(acceptedOrderId, List.of("ORDER_RECEIVED", "ORDER_ACCEPTED"));

        mockMvc.perform(post("/v1/orders")
                        .with(traderJwt())
                        .header("Idempotency-Key", "idem-evt-2008")
                        .contentType(APPLICATION_JSON)
                        .content("""
                                {
                                  "clientOrderId": "evt-2008",
                                  "symbol": "AAPL",
                                  "side": "BUY",
                                  "orderType": "LIMIT",
                                  "quantity": 5001,
                                  "price": 200.00
                                }
                                """))
                .andExpect(status().isUnprocessableEntity());

        String rejectedOrderId = jdbcTemplate.queryForObject(
                "SELECT id FROM order_book WHERE client_order_id = ?",
                String.class,
                "evt-2008"
        );
        assertEvents(rejectedOrderId, List.of("ORDER_RECEIVED", "ORDER_REJECTED"));
    }

    @Test
    void missingIdempotencyHeaderReturnsValidationError() throws Exception {
        mockMvc.perform(post("/v1/orders")
                        .with(traderJwt())
                        .contentType(APPLICATION_JSON)
                        .content("""
                                {
                                  "clientOrderId": "idem-3001",
                                  "symbol": "AAPL",
                                  "side": "BUY",
                                  "orderType": "LIMIT",
                                  "quantity": 10,
                                  "price": 200.00
                                }
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("VALIDATION_ERROR"))
                .andExpect(jsonPath("$.status").value(400));
    }

    @Test
    void repeatedSameRequestWithSameKeyReturnsSameOrderId() throws Exception {
        String requestBody = """
                {
                  "clientOrderId": "idem-3002",
                  "symbol": "AAPL",
                  "side": "BUY",
                  "orderType": "LIMIT",
                  "quantity": 10,
                  "price": 200.00
                }
                """;

        String firstResponse = mockMvc.perform(post("/v1/orders")
                        .with(traderJwt())
                        .header("Idempotency-Key", "idem-replay-3002")
                        .contentType(APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString();

        String secondResponse = mockMvc.perform(post("/v1/orders")
                        .with(traderJwt())
                        .header("Idempotency-Key", "idem-replay-3002")
                        .contentType(APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString();

        String firstOrderId = JsonPath.read(firstResponse, "$.orderId");
        String secondOrderId = JsonPath.read(secondResponse, "$.orderId");
        Integer orderCount = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM order_book WHERE client_order_id = ?",
                Integer.class,
                "idem-3002"
        );

        assertThat(firstOrderId).isEqualTo(secondOrderId);
        if (redisCacheEnabled) {
            String replayCacheValue = redisTemplate.opsForValue().get("oems:test:idempotency:idem-replay-3002");
            assertThat(replayCacheValue).isNotBlank();
        }
        assertThat(orderCount).isEqualTo(1);
    }

    @Test
    void sameKeyWithDifferentPayloadReturnsConflict() throws Exception {
        mockMvc.perform(post("/v1/orders")
                        .with(traderJwt())
                        .header("Idempotency-Key", "idem-conflict-3003")
                        .contentType(APPLICATION_JSON)
                        .content("""
                                {
                                  "clientOrderId": "idem-3003-a",
                                  "symbol": "AAPL",
                                  "side": "BUY",
                                  "orderType": "LIMIT",
                                  "quantity": 10,
                                  "price": 200.00
                                }
                                """))
                .andExpect(status().isCreated());

        mockMvc.perform(post("/v1/orders")
                        .with(traderJwt())
                        .header("Idempotency-Key", "idem-conflict-3003")
                        .contentType(APPLICATION_JSON)
                        .content("""
                                {
                                  "clientOrderId": "idem-3003-b",
                                  "symbol": "AAPL",
                                  "side": "BUY",
                                  "orderType": "LIMIT",
                                  "quantity": 11,
                                  "price": 200.00
                                }
                                """))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value("IDEMPOTENCY_CONFLICT"))
                .andExpect(jsonPath("$.status").value(409));
    }

    @Test
    void parallelRequestsWithSameKeyCreateOnlyOneOrder() throws Exception {
        String requestBody = """
                {
                  "clientOrderId": "idem-3004",
                  "symbol": "AAPL",
                  "side": "BUY",
                  "orderType": "LIMIT",
                  "quantity": 10,
                  "price": 200.00
                }
                """;

        CountDownLatch startGate = new CountDownLatch(1);
        ExecutorService executor = Executors.newFixedThreadPool(2);
        try {
            Callable<Integer> task = () -> {
                startGate.await(5, TimeUnit.SECONDS);
                return mockMvc.perform(post("/v1/orders")
                                .with(traderJwt())
                                .header("Idempotency-Key", "idem-parallel-3004")
                                .contentType(APPLICATION_JSON)
                                .content(requestBody))
                        .andReturn()
                        .getResponse()
                        .getStatus();
            };

            Future<Integer> first = executor.submit(task);
            Future<Integer> second = executor.submit(task);
            startGate.countDown();

            int firstStatus = first.get(10, TimeUnit.SECONDS);
            int secondStatus = second.get(10, TimeUnit.SECONDS);

            Integer orderCount = jdbcTemplate.queryForObject(
                    "SELECT COUNT(*) FROM order_book WHERE client_order_id = ?",
                    Integer.class,
                    "idem-3004"
            );

            assertThat(firstStatus).isEqualTo(201);
            assertThat(secondStatus).isEqualTo(201);
            assertThat(orderCount).isEqualTo(1);
        } finally {
            executor.shutdownNow();
        }
    }

    @Test
    void orderOutcomeAndLatencyMetricsArePublished() throws Exception {
        mockMvc.perform(post("/v1/orders")
                        .with(traderJwt())
                        .header("Idempotency-Key", "idem-metric-3005")
                        .contentType(APPLICATION_JSON)
                        .content("""
                                {
                                  "clientOrderId": "metric-3005",
                                  "symbol": "AAPL",
                                  "side": "BUY",
                                  "orderType": "LIMIT",
                                  "quantity": 10,
                                  "price": 200.00
                                }
                                """))
                .andExpect(status().isCreated());

        mockMvc.perform(post("/v1/orders")
                        .with(traderJwt())
                        .header("Idempotency-Key", "idem-metric-3006")
                        .contentType(APPLICATION_JSON)
                        .content("""
                                {
                                  "clientOrderId": "metric-3006",
                                  "symbol": "AAPL",
                                  "side": "BUY",
                                  "orderType": "LIMIT",
                                  "quantity": 5001,
                                  "price": 200.00
                                }
                                """))
                .andExpect(status().isUnprocessableEntity());

        mockMvc.perform(get("/actuator/prometheus").with(opsJwt()))
                .andExpect(status().isOk())
                .andExpect(content().string(org.hamcrest.Matchers.containsString("orders_accepted_total")))
                .andExpect(content().string(org.hamcrest.Matchers.containsString("orders_rejected_total")))
                .andExpect(content().string(org.hamcrest.Matchers.containsString("oems_orders_place_latency_seconds_count")));
    }

    private SecurityMockMvcRequestPostProcessors.JwtRequestPostProcessor traderJwt() {
        return SecurityMockMvcRequestPostProcessors.jwt()
                .jwt(jwt -> jwt
                        .issuedAt(Instant.now())
                        .expiresAt(Instant.now().plusSeconds(3600))
                        .subject("trader1-sub")
                        .claim("preferred_username", "trader1")
                        .claim("aud", List.of("oems-api"))
                        .claim("realm_access", Map.of("roles", List.of("TRADER"))))
                .authorities(new SimpleGrantedAuthority("ROLE_TRADER"));
    }

    private SecurityMockMvcRequestPostProcessors.JwtRequestPostProcessor opsJwt() {
        return SecurityMockMvcRequestPostProcessors.jwt()
                .jwt(jwt -> jwt
                        .issuedAt(Instant.now())
                        .expiresAt(Instant.now().plusSeconds(3600))
                        .subject("ops1-sub")
                        .claim("preferred_username", "ops1")
                        .claim("aud", List.of("oems-api"))
                        .claim("realm_access", Map.of("roles", List.of("OPS"))))
                .authorities(new SimpleGrantedAuthority("ROLE_OPS"));
    }

    private void assertEvents(String orderId, List<String> expectedTypes) {
        List<String> events = jdbcTemplate.query(
                "SELECT event_type FROM order_event WHERE order_id = ? ORDER BY id ASC",
                (rs, rowNum) -> rs.getString("event_type"),
                orderId
        );
        assertThat(events).containsExactlyElementsOf(expectedTypes);
    }
}
