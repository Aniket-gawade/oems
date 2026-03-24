package com.project.oems.oemsapi.application.order;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.project.oems.common.domain.exception.BusinessRuleViolation;
import com.project.oems.common.error.ErrorCode;
import com.project.oems.oemsapi.config.idempotency.IdempotencyProperties;
import com.project.oems.oemsapi.infrastructure.order.IdempotencyKeyEntity;
import com.project.oems.oemsapi.infrastructure.order.IdempotencyKeyRepository;
import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.MeterRegistry;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.Instant;
import java.util.Optional;

@Service
public class IdempotencyService {

    private static final Logger log = LoggerFactory.getLogger(IdempotencyService.class);
    private static final int PROCESSING_STATUS = 0;
    private static final String PROCESSING_RESPONSE_BODY = "{}";

    private final IdempotencyKeyRepository idempotencyKeyRepository;
    private final IdempotencyProperties idempotencyProperties;
    private final ObjectMapper objectMapper;
    private final Counter replayCounter;
    private final Counter conflictCounter;
    private final StringRedisTemplate redisTemplate;
    @PersistenceContext
    private EntityManager entityManager;

    public IdempotencyService(IdempotencyKeyRepository idempotencyKeyRepository,
                              IdempotencyProperties idempotencyProperties,
                              MeterRegistry meterRegistry,
                              Optional<StringRedisTemplate> redisTemplate) {
        this.idempotencyKeyRepository = idempotencyKeyRepository;
        this.idempotencyProperties = idempotencyProperties;
        this.objectMapper = new ObjectMapper().findAndRegisterModules();
        this.replayCounter = Counter.builder("idempotency_replay_total")
                .description("Total number of idempotency replay responses.")
                .register(meterRegistry);
        this.conflictCounter = Counter.builder("idempotency_conflict_total")
                .description("Total number of idempotency conflict responses.")
                .register(meterRegistry);
        this.redisTemplate = redisTemplate.orElse(null);
    }

    public BeginResult begin(String idemKey, String requestHash, Instant now) {
        Optional<ReplaySnapshot> cacheReplay = lookupReplayFromCache(idemKey, requestHash, now);
        if (cacheReplay.isPresent()) {
            replayCounter.increment();
            ReplaySnapshot replaySnapshot = cacheReplay.get();
            return BeginResult.replay(replaySnapshot.responseStatus(), replaySnapshot.responseBody());
        }

        Optional<IdempotencyKeyEntity> existing = idempotencyKeyRepository.findByIdemKey(idemKey);
        if (existing.isPresent()) {
            return evaluateExisting(existing.get(), requestHash, now);
        }

        return reserveNew(idemKey, requestHash, now);
    }

    public void complete(IdempotencyKeyEntity reservation,
                         int responseStatus,
                         Object responseBody,
                         String orderId,
                         Instant now) {
        reservation.setResponseStatus(responseStatus);
        reservation.setResponseBody(toJson(responseBody));
        reservation.setOrderId(orderId);
        reservation.setExpiresAt(now.plus(idempotencyProperties.getTtl()));

        IdempotencyKeyEntity persisted = idempotencyKeyRepository.save(reservation);
        cacheReplaySnapshot(persisted, now);
    }

    @Scheduled(fixedDelayString = "${oems.idempotency.cleanup-interval-ms:600000}")
    @Transactional
    public void cleanupExpiredRecords() {
        Instant now = Instant.now();
        long deleted = idempotencyKeyRepository.deleteByExpiresAtBefore(now);
        if (deleted > 0) {
            log.info("Deleted {} expired idempotency records at {}", deleted, now);
        }
    }

    private BeginResult reserveNew(String idemKey, String requestHash, Instant now) {
        IdempotencyKeyEntity reservation = new IdempotencyKeyEntity(
                null,
                idemKey,
                requestHash,
                null,
                PROCESSING_STATUS,
                PROCESSING_RESPONSE_BODY,
                now,
                now.plus(idempotencyProperties.getTtl())
        );

        try {
            return BeginResult.reserved(idempotencyKeyRepository.saveAndFlush(reservation));
        } catch (DataIntegrityViolationException ex) {
            entityManager.clear();
            IdempotencyKeyEntity existing = idempotencyKeyRepository.findByIdemKey(idemKey)
                    .orElseThrow(() -> new IllegalStateException(
                            "Idempotency key collision detected but no existing row found for key: " + idemKey,
                            ex
                    ));
            return evaluateExisting(existing, requestHash, now);
        }
    }

    private BeginResult evaluateExisting(IdempotencyKeyEntity existing, String requestHash, Instant now) {
        if (isExpired(existing, now)) {
            idempotencyKeyRepository.delete(existing);
            idempotencyKeyRepository.flush();
            return reserveNew(existing.getIdemKey(), requestHash, now);
        }

        if (!existing.getRequestHash().equals(requestHash)) {
            conflictCounter.increment();
            throw new BusinessRuleViolation(
                    ErrorCode.IDEMPOTENCY_CONFLICT,
                    "Idempotency key already used with different payload."
            );
        }

        if (existing.getResponseStatus() == PROCESSING_STATUS) {
            conflictCounter.increment();
            throw new BusinessRuleViolation(
                    ErrorCode.IDEMPOTENCY_CONFLICT,
                    "Idempotency key is currently being processed. Retry with backoff."
            );
        }

        replayCounter.increment();
        cacheReplaySnapshot(existing, now);
        return BeginResult.replay(existing.getResponseStatus(), parseJson(existing.getResponseBody()));
    }

    private Optional<ReplaySnapshot> lookupReplayFromCache(String idemKey, String requestHash, Instant now) {
        if (!idempotencyProperties.isRedisCacheEnabled() || redisTemplate == null) {
            return Optional.empty();
        }

        try {
            String encoded = redisTemplate.opsForValue().get(redisKey(idemKey));
            if (encoded == null) {
                return Optional.empty();
            }

            CachedReplaySnapshot cached = objectMapper.readValue(encoded, CachedReplaySnapshot.class);
            if (cached.expiresAt().isBefore(now) || cached.responseStatus() == PROCESSING_STATUS) {
                redisTemplate.delete(redisKey(idemKey));
                return Optional.empty();
            }
            if (!cached.requestHash().equals(requestHash)) {
                return Optional.empty();
            }
            return Optional.of(new ReplaySnapshot(cached.responseStatus(), parseJson(cached.responseBody())));
        } catch (Exception ex) {
            log.warn("Redis idempotency cache read failed for key={}. Falling back to DB.", idemKey, ex);
            return Optional.empty();
        }
    }

    private void cacheReplaySnapshot(IdempotencyKeyEntity entity, Instant now) {
        if (!idempotencyProperties.isRedisCacheEnabled() || redisTemplate == null) {
            return;
        }
        if (entity.getResponseStatus() == PROCESSING_STATUS) {
            return;
        }

        Duration ttl = Duration.between(now, entity.getExpiresAt());
        if (ttl.isNegative() || ttl.isZero()) {
            return;
        }

        CachedReplaySnapshot cacheValue = new CachedReplaySnapshot(
                entity.getRequestHash(),
                entity.getResponseStatus(),
                entity.getResponseBody(),
                entity.getExpiresAt()
        );
        try {
            String encoded = objectMapper.writeValueAsString(cacheValue);
            redisTemplate.opsForValue().set(redisKey(entity.getIdemKey()), encoded, ttl);
        } catch (Exception ex) {
            log.warn("Redis idempotency cache write failed for key={}.", entity.getIdemKey(), ex);
        }
    }

    private String redisKey(String idemKey) {
        return idempotencyProperties.getRedisKeyPrefix() + idemKey;
    }

    private boolean isExpired(IdempotencyKeyEntity entity, Instant now) {
        return entity.getExpiresAt() != null && !entity.getExpiresAt().isAfter(now);
    }

    private Object parseJson(String payload) {
        try {
            return objectMapper.readValue(payload, Object.class);
        } catch (JsonProcessingException ex) {
            throw new IllegalStateException("Failed to parse persisted idempotency response payload.", ex);
        }
    }

    private String toJson(Object payload) {
        try {
            return objectMapper.writeValueAsString(payload);
        } catch (JsonProcessingException ex) {
            throw new IllegalStateException("Failed to serialize idempotency response payload.", ex);
        }
    }

    public record BeginResult(
            IdempotencyKeyEntity reservation,
            Integer replayStatus,
            Object replayBody
    ) {

        public static BeginResult reserved(IdempotencyKeyEntity reservation) {
            return new BeginResult(reservation, null, null);
        }

        public static BeginResult replay(int replayStatus, Object replayBody) {
            return new BeginResult(null, replayStatus, replayBody);
        }

        public boolean isReplay() {
            return replayStatus != null;
        }
    }

    private record ReplaySnapshot(int responseStatus, Object responseBody) {
    }

    private record CachedReplaySnapshot(
            String requestHash,
            int responseStatus,
            String responseBody,
            Instant expiresAt
    ) {
    }
}
