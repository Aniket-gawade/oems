package com.project.oems.oemsapi.config.security;

import org.springframework.core.convert.converter.Converter;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import java.util.Collection;
import java.util.LinkedHashSet;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Component
public class KeycloakJwtAuthenticationConverter implements Converter<Jwt, AbstractAuthenticationToken> {

    private final JwtGrantedAuthoritiesConverter delegate = new JwtGrantedAuthoritiesConverter();

    @Override
    public AbstractAuthenticationToken convert(Jwt jwt) {
        Set<GrantedAuthority> authorities = new LinkedHashSet<>(delegate.convert(jwt));
        authorities.addAll(toAuthorities(extractRealmRoles(jwt)));

        String principalName = jwt.getClaimAsString("preferred_username");
        if (!StringUtils.hasText(principalName)) {
            principalName = jwt.getSubject();
        }

        return new JwtAuthenticationToken(jwt, authorities, principalName);
    }

    private Set<String> extractRealmRoles(Jwt jwt) {
        Map<String, Object> realmAccess = jwt.getClaimAsMap("realm_access");
        if (realmAccess == null || !realmAccess.containsKey("roles")) {
            return Set.of();
        }

        Object roles = realmAccess.get("roles");
        if (!(roles instanceof Collection<?> roleCollection)) {
            return Set.of();
        }

        return roleCollection.stream()
                .map(String::valueOf)
                .filter(StringUtils::hasText)
                .map(String::trim)
                .collect(Collectors.toCollection(LinkedHashSet::new));
    }

    private Set<GrantedAuthority> toAuthorities(Set<String> roles) {
        return roles.stream()
                .map(role -> role.startsWith("ROLE_") ? role : "ROLE_" + role)
                .map(SimpleGrantedAuthority::new)
                .collect(Collectors.toCollection(LinkedHashSet::new));
    }
}
