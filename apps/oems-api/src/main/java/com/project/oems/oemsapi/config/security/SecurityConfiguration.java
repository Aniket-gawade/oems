package com.project.oems.oemsapi.config.security;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.boot.security.oauth2.server.resource.autoconfigure.OAuth2ResourceServerProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.convert.converter.Converter;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.annotation.web.configurers.AuthorizeHttpRequestsConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.oauth2.core.DelegatingOAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2TokenValidator;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtValidators;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.AnonymousAuthenticationFilter;
import org.springframework.util.StringUtils;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration(proxyBeanMethods = false)
@EnableConfigurationProperties(OemsSecurityProperties.class)
public class SecurityConfiguration {

    @Bean
    @ConditionalOnProperty(prefix = "oems.security.mock-auth", name = "enabled", havingValue = "false", matchIfMissing = true)
    SecurityFilterChain jwtSecurityFilterChain(HttpSecurity http,
                                               ApiAuthenticationEntryPoint authenticationEntryPoint,
                                               ApiAccessDeniedHandler accessDeniedHandler,
                                               Converter<Jwt, AbstractAuthenticationToken> jwtAuthenticationConverter,
                                               CorsConfigurationSource corsConfigurationSource) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .cors(cors -> cors.configurationSource(corsConfigurationSource))
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .exceptionHandling(exceptions -> exceptions
                        .authenticationEntryPoint(authenticationEntryPoint)
                        .accessDeniedHandler(accessDeniedHandler))
                .authorizeHttpRequests(this::configureAuthorizationRules)
                .oauth2ResourceServer(oauth2 -> oauth2
                        .authenticationEntryPoint(authenticationEntryPoint)
                        .accessDeniedHandler(accessDeniedHandler)
                        .jwt(jwt -> jwt.jwtAuthenticationConverter(jwtAuthenticationConverter)));

        return http.build();
    }

    @Bean
    @ConditionalOnProperty(prefix = "oems.security.mock-auth", name = "enabled", havingValue = "true")
    SecurityFilterChain mockSecurityFilterChain(HttpSecurity http,
                                                ApiAuthenticationEntryPoint authenticationEntryPoint,
                                                ApiAccessDeniedHandler accessDeniedHandler,
                                                CorsConfigurationSource corsConfigurationSource,
                                                MockAuthenticationFilter mockAuthenticationFilter) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .cors(cors -> cors.configurationSource(corsConfigurationSource))
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .exceptionHandling(exceptions -> exceptions
                        .authenticationEntryPoint(authenticationEntryPoint)
                        .accessDeniedHandler(accessDeniedHandler))
                .authorizeHttpRequests(this::configureAuthorizationRules)
                .addFilterBefore(mockAuthenticationFilter, AnonymousAuthenticationFilter.class);

        return http.build();
    }

    private void configureAuthorizationRules(
            AuthorizeHttpRequestsConfigurer<HttpSecurity>.AuthorizationManagerRequestMatcherRegistry auth) {
        auth
                .requestMatchers("/actuator/health", "/actuator/info").permitAll()
                .requestMatchers("/actuator/**").hasRole("OPS")
                .requestMatchers(HttpMethod.POST, "/v1/orders").hasRole("TRADER")
                .requestMatchers(HttpMethod.GET, "/v1/orders/**").hasRole("TRADER")
                .requestMatchers(HttpMethod.GET, "/v1/instruments/**").authenticated()
                .requestMatchers("/v1/**").authenticated()
                .anyRequest().permitAll();
    }

    @Bean
    @ConditionalOnProperty(prefix = "oems.security.mock-auth", name = "enabled", havingValue = "false", matchIfMissing = true)
    JwtDecoder jwtDecoder(OemsSecurityProperties securityProperties,
                          OAuth2ResourceServerProperties resourceServerProperties) {
        String issuerUri = resourceServerProperties.getJwt().getIssuerUri();
        String jwkSetUri = resourceServerProperties.getJwt().getJwkSetUri();
        if (!StringUtils.hasText(issuerUri) || !StringUtils.hasText(jwkSetUri)) {
            throw new IllegalStateException("JWT issuer-uri and jwk-set-uri must be configured.");
        }

        NimbusJwtDecoder jwtDecoder = NimbusJwtDecoder.withJwkSetUri(jwkSetUri).build();
        OAuth2TokenValidator<Jwt> withIssuer = JwtValidators.createDefaultWithIssuer(issuerUri);
        OAuth2TokenValidator<Jwt> withAudience = new JwtAudienceValidator(securityProperties.getJwt().getExpectedAudience());
        jwtDecoder.setJwtValidator(new DelegatingOAuth2TokenValidator<>(withIssuer, withAudience));
        return jwtDecoder;
    }

    @Bean
    CorsConfigurationSource corsConfigurationSource(OemsSecurityProperties securityProperties) {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(securityProperties.getCors().getAllowedOrigins());
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of(
                "Authorization",
                "Content-Type",
                "Idempotency-Key",
                "X-Trace-Id",
                "X-Mock-User",
                "X-Mock-Roles"
        ));
        configuration.setExposedHeaders(List.of("X-Trace-Id"));
        configuration.setAllowCredentials(false);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    @ConditionalOnProperty(prefix = "oems.security.mock-auth", name = "enabled", havingValue = "true")
    MockAuthenticationFilter mockAuthenticationFilter(OemsSecurityProperties securityProperties) {
        return new MockAuthenticationFilter(securityProperties);
    }
}
