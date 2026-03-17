package com.project.oems.oemsapi.config.security;

import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.core.OAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2TokenValidatorResult;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.util.StringUtils;

import java.util.List;

public class JwtAudienceValidator implements OAuth2TokenValidator<Jwt> {

    private final String expectedAudience;

    public JwtAudienceValidator(String expectedAudience) {
        this.expectedAudience = expectedAudience;
    }

    @Override
    public OAuth2TokenValidatorResult validate(Jwt token) {
        if (!StringUtils.hasText(expectedAudience)) {
            return OAuth2TokenValidatorResult.success();
        }

        List<String> audience = token.getAudience();
        if (audience == null || audience.isEmpty()) {
            return OAuth2TokenValidatorResult.success();
        }

        if (audience.contains(expectedAudience)) {
            return OAuth2TokenValidatorResult.success();
        }

        OAuth2Error error = new OAuth2Error(
                "invalid_token",
                "Token audience does not include expected audience '" + expectedAudience + "'.",
                null
        );
        return OAuth2TokenValidatorResult.failure(error);
    }
}
