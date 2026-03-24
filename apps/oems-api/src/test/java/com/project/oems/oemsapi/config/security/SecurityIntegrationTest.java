package com.project.oems.oemsapi.config.security;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Instant;
import java.util.List;
import java.util.Map;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.MOCK)
@AutoConfigureMockMvc
@ActiveProfiles("test")
class SecurityIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void postOrdersWithoutTokenReturns401WithApiErrorBody() throws Exception {
        mockMvc.perform(post("/v1/orders")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value("UNAUTHORIZED"))
                .andExpect(jsonPath("$.status").value(401))
                .andExpect(jsonPath("$.path").value("/v1/orders"))
                .andExpect(jsonPath("$.traceId").isString());
    }

    @Test
    void postOrdersWithOpsRoleReturns403() throws Exception {
        mockMvc.perform(post("/v1/orders")
                        .with(SecurityMockMvcRequestPostProcessors.jwt()
                                .jwt(jwt -> jwt
                                        .issuedAt(Instant.now())
                                        .expiresAt(Instant.now().plusSeconds(3600))
                                        .subject("ops1")
                                        .claim("preferred_username", "ops1")
                                        .claim("aud", List.of("oems-api"))
                                        .claim("realm_access", Map.of("roles", List.of("OPS"))))
                                .authorities(new SimpleGrantedAuthority("ROLE_OPS"))))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("FORBIDDEN"))
                .andExpect(jsonPath("$.status").value(403))
                .andExpect(jsonPath("$.path").value("/v1/orders"))
                .andExpect(jsonPath("$.traceId").isString());
    }

    @Test
    void postOrdersWithTraderRoleReachesController() throws Exception {
        mockMvc.perform(post("/v1/orders")
                        .header("Idempotency-Key", "idem-sec-1001")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "clientOrderId": "sec-1001",
                                  "symbol": "AAPL",
                                  "side": "BUY",
                                  "orderType": "MARKET",
                                  "quantity": 10
                                }
                                """)
                        .with(SecurityMockMvcRequestPostProcessors.jwt()
                                .jwt(jwt -> jwt
                                        .issuedAt(Instant.now())
                                        .expiresAt(Instant.now().plusSeconds(3600))
                                        .subject("trader1-sub")
                                        .claim("preferred_username", "trader1")
                                        .claim("aud", List.of("oems-api"))
                                        .claim("realm_access", Map.of("roles", List.of("TRADER"))))
                                .authorities(new SimpleGrantedAuthority("ROLE_TRADER"))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value("NEW"))
                .andExpect(jsonPath("$.symbol").value("AAPL"))
                .andExpect(jsonPath("$.orderType").value("MARKET"))
                .andExpect(jsonPath("$.quantity").value(10))
                .andExpect(jsonPath("$.orderId").isString())
                .andExpect(jsonPath("$.createdAt").isString());
    }

    @Test
    void actuatorHealthIsPublic() throws Exception {
        mockMvc.perform(get("/actuator/health"))
                .andExpect(status().isOk());
    }

    @Test
    void actuatorPrometheusIsRestrictedToOpsRole() throws Exception {
        mockMvc.perform(get("/actuator/prometheus"))
                .andExpect(status().isUnauthorized());

        mockMvc.perform(get("/actuator/prometheus")
                        .with(SecurityMockMvcRequestPostProcessors.jwt()
                                .jwt(jwt -> jwt
                                        .issuedAt(Instant.now())
                                        .expiresAt(Instant.now().plusSeconds(3600))
                                        .subject("trader1-sub")
                                        .claim("preferred_username", "trader1")
                                        .claim("aud", List.of("oems-api"))
                                        .claim("realm_access", Map.of("roles", List.of("TRADER"))))
                                .authorities(new SimpleGrantedAuthority("ROLE_TRADER"))))
                .andExpect(status().isForbidden());

        mockMvc.perform(get("/actuator/prometheus")
                        .with(SecurityMockMvcRequestPostProcessors.jwt()
                                .jwt(jwt -> jwt
                                        .issuedAt(Instant.now())
                                        .expiresAt(Instant.now().plusSeconds(3600))
                                        .subject("ops1-sub")
                                        .claim("preferred_username", "ops1")
                                        .claim("aud", List.of("oems-api"))
                                        .claim("realm_access", Map.of("roles", List.of("OPS"))))
                                .authorities(new SimpleGrantedAuthority("ROLE_OPS"))))
                .andExpect(status().isOk());
    }
}
