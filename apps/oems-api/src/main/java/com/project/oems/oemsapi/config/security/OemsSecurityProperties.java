package com.project.oems.oemsapi.config.security;

import org.springframework.boot.context.properties.ConfigurationProperties;

import java.util.ArrayList;
import java.util.List;

@ConfigurationProperties(prefix = "oems.security")
public class OemsSecurityProperties {

    private final Cors cors = new Cors();
    private final Jwt jwt = new Jwt();
    private final MockAuth mockAuth = new MockAuth();

    public Cors getCors() {
        return cors;
    }

    public Jwt getJwt() {
        return jwt;
    }

    public MockAuth getMockAuth() {
        return mockAuth;
    }

    public static class Cors {
        private List<String> allowedOrigins = new ArrayList<>(List.of("http://localhost:3000"));

        public List<String> getAllowedOrigins() {
            return allowedOrigins;
        }

        public void setAllowedOrigins(List<String> allowedOrigins) {
            this.allowedOrigins = allowedOrigins;
        }
    }

    public static class Jwt {
        private String expectedAudience = "oems-api";

        public String getExpectedAudience() {
            return expectedAudience;
        }

        public void setExpectedAudience(String expectedAudience) {
            this.expectedAudience = expectedAudience;
        }
    }

    public static class MockAuth {
        private boolean enabled = false;
        private String defaultTraderId = "trader1";
        private List<String> defaultRoles = new ArrayList<>(List.of("TRADER"));

        public boolean isEnabled() {
            return enabled;
        }

        public void setEnabled(boolean enabled) {
            this.enabled = enabled;
        }

        public String getDefaultTraderId() {
            return defaultTraderId;
        }

        public void setDefaultTraderId(String defaultTraderId) {
            this.defaultTraderId = defaultTraderId;
        }

        public List<String> getDefaultRoles() {
            return defaultRoles;
        }

        public void setDefaultRoles(List<String> defaultRoles) {
            this.defaultRoles = defaultRoles;
        }
    }
}
