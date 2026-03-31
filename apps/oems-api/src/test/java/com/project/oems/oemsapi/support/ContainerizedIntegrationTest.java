package com.project.oems.oemsapi.support;

import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.GenericContainer;
import org.testcontainers.containers.MySQLContainer;
import org.testcontainers.lifecycle.Startables;
import org.testcontainers.utility.DockerImageName;

import java.util.stream.Stream;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.MOCK)
@AutoConfigureMockMvc
@ActiveProfiles("test")
public abstract class ContainerizedIntegrationTest {

    private static final DockerImageName MYSQL_IMAGE = DockerImageName.parse("mysql:8.4.6");
    private static final DockerImageName REDIS_IMAGE = DockerImageName.parse("redis:8.6.0");
    private static final boolean USE_TESTCONTAINERS = Boolean.parseBoolean(
            System.getProperty("oems.it.useTestcontainers", "false")
    );

    static final MySQLContainer<?> MYSQL = new MySQLContainer<>(MYSQL_IMAGE)
            .withDatabaseName("oems_test")
            .withUsername("oems")
            .withPassword("oems");

    static final GenericContainer<?> REDIS = new GenericContainer<>(REDIS_IMAGE)
            .withExposedPorts(6379);

    private static volatile boolean containersStarted;

    private static synchronized void startContainersIfNeeded() {
        if (containersStarted) {
            return;
        }
        Startables.deepStart(Stream.of(MYSQL, REDIS)).join();
        containersStarted = true;
    }

    @DynamicPropertySource
    static void registerContainerProperties(DynamicPropertyRegistry registry) {
        if (!USE_TESTCONTAINERS) {
            registry.add("oems.idempotency.redis-cache-enabled", () -> false);
            return;
        }

        startContainersIfNeeded();
        registry.add("spring.datasource.url", MYSQL::getJdbcUrl);
        registry.add("spring.datasource.username", MYSQL::getUsername);
        registry.add("spring.datasource.password", MYSQL::getPassword);
        registry.add("spring.datasource.driver-class-name", MYSQL::getDriverClassName);
        registry.add("spring.data.redis.host", REDIS::getHost);
        registry.add("spring.data.redis.port", () -> REDIS.getMappedPort(6379));
        registry.add("oems.idempotency.redis-cache-enabled", () -> true);
        registry.add("oems.idempotency.redis-key-prefix", () -> "oems:test:idempotency:");
    }
}
