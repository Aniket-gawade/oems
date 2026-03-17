package com.project.oems.oemsapi.config.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

public class MockAuthenticationFilter extends OncePerRequestFilter {

    private static final String MOCK_USER_HEADER = "X-Mock-User";
    private static final String MOCK_ROLES_HEADER = "X-Mock-Roles";

    private final OemsSecurityProperties securityProperties;

    public MockAuthenticationFilter(OemsSecurityProperties securityProperties) {
        this.securityProperties = securityProperties;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        if (SecurityContextHolder.getContext().getAuthentication() == null) {
            String traderId = resolveTraderId(request);
            List<String> roles = resolveRoles(request);
            List<GrantedAuthority> authorities = roles.stream()
                    .map(this::toRoleAuthority)
                    .map(SimpleGrantedAuthority::new)
                    .collect(Collectors.toCollection(ArrayList::new));

            Jwt jwt = Jwt.withTokenValue("mock-token")
                    .header("alg", "none")
                    .claim("sub", traderId)
                    .claim("preferred_username", traderId)
                    .claim("realm_access", Map.of("roles", roles))
                    .issuedAt(Instant.now())
                    .expiresAt(Instant.now().plusSeconds(3600))
                    .build();

            JwtAuthenticationToken authentication = new JwtAuthenticationToken(jwt, authorities, traderId);
            SecurityContextHolder.getContext().setAuthentication(authentication);
        }

        filterChain.doFilter(request, response);
    }

    private String resolveTraderId(HttpServletRequest request) {
        String fromHeader = request.getHeader(MOCK_USER_HEADER);
        if (StringUtils.hasText(fromHeader)) {
            return fromHeader.trim();
        }
        return securityProperties.getMockAuth().getDefaultTraderId();
    }

    private List<String> resolveRoles(HttpServletRequest request) {
        String fromHeader = request.getHeader(MOCK_ROLES_HEADER);
        if (StringUtils.hasText(fromHeader)) {
            return List.of(fromHeader.split(",")).stream()
                    .map(String::trim)
                    .filter(StringUtils::hasText)
                    .toList();
        }
        return securityProperties.getMockAuth().getDefaultRoles();
    }

    private String toRoleAuthority(String role) {
        return role.startsWith("ROLE_") ? role : "ROLE_" + role;
    }
}
