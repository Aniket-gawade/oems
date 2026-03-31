package com.project.oems.oemsapi.infrastructure.db;

import org.flywaydb.core.Flyway;
import org.flywaydb.core.api.output.MigrateResult;
import org.junit.jupiter.api.Test;
import org.testcontainers.containers.MySQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.utility.DockerImageName;

import java.util.Arrays;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@Testcontainers(disabledWithoutDocker = true)
class FlywayMigrationOrderTest {

    @Container
    private static final MySQLContainer<?> MYSQL = new MySQLContainer<>(DockerImageName.parse("mysql:8.4.6"))
            .withDatabaseName("oems_migration_test")
            .withUsername("oems")
            .withPassword("oems");

    @Test
    void appliesAllMigrationsInOrder() {
        Flyway flyway = Flyway.configure()
                .dataSource(MYSQL.getJdbcUrl(), MYSQL.getUsername(), MYSQL.getPassword())
                .locations("classpath:db/migration")
                .baselineOnMigrate(true)
                .load();

        MigrateResult result = flyway.migrate();
        assertThat(result.migrationsExecuted).isEqualTo(14);

        List<String> appliedVersions = Arrays.stream(flyway.info().applied())
                .filter(migration -> migration.getVersion() != null)
                .map(migration -> migration.getVersion().getVersion())
                .toList();

        assertThat(appliedVersions).containsExactly(
                "0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13"
        );
    }
}
