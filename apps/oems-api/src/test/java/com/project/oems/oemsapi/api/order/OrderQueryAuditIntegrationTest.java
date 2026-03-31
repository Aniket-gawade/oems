package com.project.oems.oemsapi.api.order;

import com.jayway.jsonpath.JsonPath;
import com.project.oems.oemsapi.support.ContainerizedIntegrationTest;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class OrderQueryAuditIntegrationTest extends ContainerizedIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void getOrderByIdReturnsOrderForOwner() throws Exception {
        String orderId = createOrder("query-4001", "trader1", "idem-query-4001");

        mockMvc.perform(get("/v1/orders/{orderId}", orderId).with(traderJwt("trader1")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.orderId").value(orderId))
                .andExpect(jsonPath("$.traderId").value("trader1"))
                .andExpect(jsonPath("$.status").value("NEW"))
                .andExpect(jsonPath("$.symbol").value("AAPL"))
                .andExpect(jsonPath("$.side").value("BUY"))
                .andExpect(jsonPath("$.orderType").value("LIMIT"))
                .andExpect(jsonPath("$.quantity").value(10))
                .andExpect(jsonPath("$.price").value(200.0))
                .andExpect(jsonPath("$.createdAt").isString())
                .andExpect(jsonPath("$.updatedAt").isString());
    }

    @Test
    void getOrderByIdReturns404ForUnknownOrder() throws Exception {
        UUID unknownOrderId = UUID.randomUUID();
        mockMvc.perform(get("/v1/orders/{orderId}", unknownOrderId).with(traderJwt("trader1")))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code").value("RESOURCE_NOT_FOUND"))
                .andExpect(jsonPath("$.status").value(404))
                .andExpect(jsonPath("$.path").value("/v1/orders/" + unknownOrderId));
    }

    @Test
    void getOrderByIdReturns404ForDifferentTrader() throws Exception {
        String orderId = createOrder("query-4002", "trader1", "idem-query-4002");

        mockMvc.perform(get("/v1/orders/{orderId}", orderId).with(traderJwt("trader2")))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code").value("RESOURCE_NOT_FOUND"))
                .andExpect(jsonPath("$.status").value(404));
    }

    @Test
    void opsCanReadOrderAuditEvents() throws Exception {
        String orderId = createOrder("query-4003", "trader1", "idem-query-4003");

        mockMvc.perform(get("/v1/ops/orders/{orderId}/events", orderId).with(opsJwt()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].orderId").value(orderId))
                .andExpect(jsonPath("$[0].eventType").value("ORDER_RECEIVED"))
                .andExpect(jsonPath("$[0].createdAt").isString())
                .andExpect(jsonPath("$[1].orderId").value(orderId))
                .andExpect(jsonPath("$[1].eventType").value("ORDER_ACCEPTED"))
                .andExpect(jsonPath("$[1].createdAt").isString());
    }

    @Test
    void traderCannotReadOrderAuditEvents() throws Exception {
        String orderId = createOrder("query-4004", "trader1", "idem-query-4004");

        mockMvc.perform(get("/v1/ops/orders/{orderId}/events", orderId).with(traderJwt("trader1")))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("FORBIDDEN"));
    }

    private String createOrder(String clientOrderId, String traderId, String idempotencyKey) throws Exception {
        String response = mockMvc.perform(post("/v1/orders")
                        .with(traderJwt(traderId))
                        .header("Idempotency-Key", idempotencyKey)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "clientOrderId": "%s",
                                  "symbol": "AAPL",
                                  "side": "BUY",
                                  "orderType": "LIMIT",
                                  "quantity": 10,
                                  "price": 200.00
                                }
                                """.formatted(clientOrderId)))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString();
        return JsonPath.read(response, "$.orderId");
    }

    private SecurityMockMvcRequestPostProcessors.JwtRequestPostProcessor traderJwt(String traderId) {
        return SecurityMockMvcRequestPostProcessors.jwt()
                .jwt(jwt -> jwt
                        .issuedAt(Instant.now())
                        .expiresAt(Instant.now().plusSeconds(3600))
                        .subject(traderId + "-sub")
                        .claim("preferred_username", traderId)
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
}
