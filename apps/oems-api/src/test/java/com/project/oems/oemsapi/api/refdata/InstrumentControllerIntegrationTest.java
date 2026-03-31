package com.project.oems.oemsapi.api.refdata;

import com.project.oems.oemsapi.support.ContainerizedIntegrationTest;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Instant;
import java.util.List;
import java.util.Map;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class InstrumentControllerIntegrationTest extends ContainerizedIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void getInstrumentByKnownSymbolReturnsExpectedPayload() throws Exception {
        mockMvc.perform(get("/v1/instruments/AAPL").with(traderJwt()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.symbol").value("AAPL"))
                .andExpect(jsonPath("$.name").value("Apple Inc."))
                .andExpect(jsonPath("$.tradable").value(true))
                .andExpect(jsonPath("$.tickSize").value(0.01))
                .andExpect(jsonPath("$.minQty").value(1.0))
                .andExpect(jsonPath("$.maxQty").value(100000.0));
    }

    @Test
    void getInstrumentByUnknownSymbolReturnsStandardized404() throws Exception {
        mockMvc.perform(get("/v1/instruments/UNKNOWN").with(traderJwt()))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code").value("INSTRUMENT_NOT_FOUND"))
                .andExpect(jsonPath("$.status").value(404))
                .andExpect(jsonPath("$.path").value("/v1/instruments/UNKNOWN"))
                .andExpect(jsonPath("$.traceId").isString());
    }

    @Test
    void getInstrumentWithoutTokenReturns401() throws Exception {
        mockMvc.perform(get("/v1/instruments/AAPL"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value("UNAUTHORIZED"));
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
