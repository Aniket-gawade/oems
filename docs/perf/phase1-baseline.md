# Phase 1 Performance Baseline (`POST /v1/orders`)

Date: 2026-03-31  
Environment: local workstation, `test,mock-auth` profile (H2 in-memory DB), single app instance on `http://localhost:8080`  
Benchmark tool used for captured metrics: `scripts/benchmark-post-orders.js`  
Load script for reproducible k6 runs: `scripts/load-post-orders.js`

## Commands used

1. Start API (baseline config):

```powershell
$env:SPRING_PROFILES_ACTIVE="test,mock-auth"
$env:SERVER_PORT="8080"
./mvnw.cmd -f apps/oems-api/pom.xml org.codehaus.mojo:exec-maven-plugin:3.6.1:java `
  -Dexec.mainClass=com.project.oems.oemsapi.OemsApiApplication `
  -Dexec.classpathScope=test
```

2. Run baseline benchmark:

```powershell
$env:DURATION_SECONDS="60"
$env:CONCURRENCY="20"
$env:OEMS_BASE_URL="http://localhost:8080"
node scripts/benchmark-post-orders.js
```

3. Start API with tuned profile:

```powershell
$env:SPRING_PROFILES_ACTIVE="test,mock-auth,perf"
$env:SERVER_PORT="8080"
./mvnw.cmd -f apps/oems-api/pom.xml org.codehaus.mojo:exec-maven-plugin:3.6.1:java `
  -Dexec.mainClass=com.project.oems.oemsapi.OemsApiApplication `
  -Dexec.classpathScope=test
```

4. Rerun benchmark with same load settings.

## Results

### Baseline (pre-tuning)

Run file: `.tmp/perf-baseline-before.json`

- Concurrency: `20`
- Duration: `60s`
- Requests/sec: `115.70`
- Failure rate: `0%`
- p95 latency: `475.76 ms`
- p99 latency: `908.05 ms`

### Tuned (profile: `perf`)

Run file: `.tmp/perf-baseline-after-rerun.json`

- Concurrency: `20`
- Duration: `60s`
- Requests/sec: `315.37`
- Failure rate: `0%`
- p95 latency: `121.80 ms`
- p99 latency: `215.91 ms`

### Stress validation

Pre-tuning run at `CONCURRENCY=60` exhausted the default Hikari pool (`max=10`) and produced `100%` request errors (`.tmp/perf-baseline-before-warm-c60.json`), with `HikariPool-1 connection not available` errors in logs.  
Tuned run at `CONCURRENCY=60` stayed stable (`.tmp/perf-baseline-after-warm-c60.json`):

- Requests/sec: `331.38`
- Failure rate: `0%`
- p95 latency: `328.45 ms`
- p99 latency: `419.74 ms`

## Tuning changes applied

Tuning values are defined in `apps/oems-api/src/main/resources/application-perf.properties` and included by `staging` profile:

- Tomcat thread/connection settings (`threads.max`, `accept-count`, `max-connections`)
- Hikari pool sizing/timeouts (`maximum-pool-size=30`, `minimum-idle=10`, timeout tuning)
- Hibernate insert/update batching hints (`hibernate.jdbc.batch_size`, ordered writes)
