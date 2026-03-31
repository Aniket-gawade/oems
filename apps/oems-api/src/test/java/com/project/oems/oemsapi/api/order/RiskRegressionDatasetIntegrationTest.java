package com.project.oems.oemsapi.api.order;

import com.project.oems.oemsapi.support.ContainerizedIntegrationTest;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvFileSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import static org.springframework.http.MediaType.APPLICATION_JSON;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class RiskRegressionDatasetIntegrationTest extends ContainerizedIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @ParameterizedTest(name = "{0}")
    @CsvFileSource(resources = "/datasets/risk-regression-cases.csv", numLinesToSkip = 1)
    void riskRegressionDatasetScenariosStayStable(String caseId,
                                                  String symbol,
                                                  String side,
                                                  String orderType,
                                                  String quantity,
                                                  String price,
                                                  int expectedHttpStatus,
                                                  String expectedCode) throws Exception {
        String suffix = UUID.randomUUID().toString().substring(0, 8).toLowerCase();
        String clientOrderId = "reg-" + caseId.toLowerCase() + "-" + suffix;
        String idempotencyKey = "idem-reg-" + caseId.toLowerCase() + "-" + suffix;
        String payload = requestPayload(clientOrderId, symbol, side, orderType, quantity, price);

        ResultActions result = mockMvc.perform(post("/v1/orders")
                        .with(traderJwt())
                        .header("Idempotency-Key", idempotencyKey)
                        .contentType(APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().is(expectedHttpStatus));

        if (expectedCode != null && !expectedCode.isBlank()) {
            result.andExpect(jsonPath("$.code").value(expectedCode));
            return;
        }

        result.andExpect(jsonPath("$.status").value("NEW"))
                .andExpect(jsonPath("$.symbol").value(symbol))
                .andExpect(jsonPath("$.side").value(side))
                .andExpect(jsonPath("$.orderType").value(orderType))
                .andExpect(jsonPath("$.quantity").value(Integer.parseInt(quantity)));
    }

    private String requestPayload(String clientOrderId,
                                  String symbol,
                                  String side,
                                  String orderType,
                                  String quantity,
                                  String price) {
        String priceField = (price == null || price.isBlank()) ? "" : ",\n  \"price\": %s".formatted(price);
        return """
                {
                  "clientOrderId": "%s",
                  "symbol": "%s",
                  "side": "%s",
                  "orderType": "%s",
                  "quantity": %s%s
                }
                """.formatted(clientOrderId, symbol, side, orderType, quantity, priceField);
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
