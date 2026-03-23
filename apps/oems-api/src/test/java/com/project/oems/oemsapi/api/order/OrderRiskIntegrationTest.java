package com.project.oems.oemsapi.api.order;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Instant;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.http.MediaType.APPLICATION_JSON;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.MOCK)
@AutoConfigureMockMvc
@ActiveProfiles("test")
class OrderRiskIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Test
    void marketOrderWithoutPriceIsAcceptedWhenChecksPass() throws Exception {
        mockMvc.perform(post("/v1/orders")
                        .with(traderJwt())
                        .contentType(APPLICATION_JSON)
                        .content("""
                                {
                                  "clientOrderId": "mk-1001",
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
                .andExpect(jsonPath("$.price").isEmpty());
    }

    @Test
    void limitOrderMissingPriceReturnsValidationError() throws Exception {
        mockMvc.perform(post("/v1/orders")
                        .with(traderJwt())
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
    void limitOrderOffTickPriceFollowsRiskValidationPath() throws Exception {
        mockMvc.perform(post("/v1/orders")
                        .with(traderJwt())
                        .contentType(APPLICATION_JSON)
                        .content("""
                                {
                                  "clientOrderId": "lim-1002",
                                  "symbol": "AAPL",
                                  "side": "BUY",
                                  "orderType": "LIMIT",
                                  "quantity": 10,
                                  "price": 200.005
                                }
                                """))
                .andExpect(status().isUnprocessableEntity())
                .andExpect(jsonPath("$.code").value("INSTRUMENT_TICK_SIZE_VIOLATION"))
                .andExpect(jsonPath("$.status").value(422));
    }

    @Test
    void seededRiskLimitRejectsQtyAndPersistsAuditPayload() throws Exception {
        mockMvc.perform(post("/v1/orders")
                        .with(traderJwt())
                        .contentType(APPLICATION_JSON)
                        .content("""
                                {
                                  "clientOrderId": "risk-1001",
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

        String rejectCode = jdbcTemplate.queryForObject(
                "SELECT reject_code FROM risk_audit_event ORDER BY id DESC LIMIT 1",
                String.class
        );
        String payload = jdbcTemplate.queryForObject(
                "SELECT payload_json FROM risk_audit_event ORDER BY id DESC LIMIT 1",
                String.class
        );

        assertThat(rejectCode).isEqualTo("RISK_MAX_QTY_EXCEEDED");
        assertThat(payload).contains("\"rejectCode\":\"RISK_MAX_QTY_EXCEEDED\"");
        assertThat(payload).contains("\"riskLimitSource\":\"trader-symbol\"");
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
}
