package com.project.oems.oemsapi.application.security;

import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

@Component
public class TraderIdExtractor {

    public String extract(Authentication authentication) {
        if (!(authentication instanceof JwtAuthenticationToken jwtAuthenticationToken)) {
            throw new IllegalStateException("JWT authentication is required to resolve traderId.");
        }

        Jwt jwt = jwtAuthenticationToken.getToken();
        String traderId = jwt.getClaimAsString("preferred_username");
        if (!StringUtils.hasText(traderId)) {
            traderId = jwt.getSubject();
        }

        if (!StringUtils.hasText(traderId)) {
            throw new IllegalStateException("Token does not include trader identity claims.");
        }

        return traderId;
    }
}
