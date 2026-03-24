package com.project.oems.oemsapi.config.idempotency;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import java.time.Duration;

@Component
@ConfigurationProperties(prefix = "oems.idempotency")
public class IdempotencyProperties {

    private Duration ttl = Duration.ofHours(24);
    private boolean redisCacheEnabled = true;
    private String redisKeyPrefix = "oems:idempotency:";

    public Duration getTtl() {
        return ttl;
    }

    public void setTtl(Duration ttl) {
        this.ttl = ttl;
    }

    public boolean isRedisCacheEnabled() {
        return redisCacheEnabled;
    }

    public void setRedisCacheEnabled(boolean redisCacheEnabled) {
        this.redisCacheEnabled = redisCacheEnabled;
    }

    public String getRedisKeyPrefix() {
        return redisKeyPrefix;
    }

    public void setRedisKeyPrefix(String redisKeyPrefix) {
        this.redisKeyPrefix = redisKeyPrefix;
    }
}
