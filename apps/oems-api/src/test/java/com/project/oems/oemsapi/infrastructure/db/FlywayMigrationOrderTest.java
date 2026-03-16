package com.project.oems.oemsapi.infrastructure.db;

import org.flywaydb.core.Flyway;
import org.flywaydb.core.api.output.MigrateResult;
import org.junit.jupiter.api.Test;

import java.util.Arrays;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

class FlywayMigrationOrderTest {

    @Test
    void appliesAllMigrationsInOrder() {
        String dbName = "oems_migration_" + UUID.randomUUID().toString().replace("-", "");
        String jdbcUrl = "jdbc:h2:mem:" + dbName + ";MODE=MySQL;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE";

        Flyway flyway = Flyway.configure()
            .dataSource(jdbcUrl, "sa", "")
            .locations("classpath:db/migration")
            .baselineOnMigrate(true)
            .load();

        MigrateResult result = flyway.migrate();
        assertThat(result.migrationsExecuted).isEqualTo(12);

        List<String> appliedVersions = Arrays.stream(flyway.info().applied())
            .filter(migration -> migration.getVersion() != null)
            .map(migration -> migration.getVersion().getVersion())
            .toList();

        assertThat(appliedVersions).containsExactly(
            "0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11"
        );
    }
}
