# OEMS Phase 1 Tasks Board (Atomic, Start-to-End)

Last updated: 2026-03-17

## How to use this board

1. Execute tasks in order (`T001` -> `T260`).
2. Create one branch per task or one branch per small task group.
3. Mark tasks complete only when the `Done when` condition is true.
4. Do not skip dependencies.

Status legend:

- `[ ]` Not started
- `[x]` Done

---

## Phase A - Project Setup and Working Agreements

1. [x] `T001` Create `docs/PHASE1_PRD.md` with scope, non-scope, and user stories.  
Done when: document includes place order + get order story.

2. [x] `T002` Define functional acceptance criteria for `POST /v1/orders`.  
Done when: success + all failure cases are listed.

3. [x] `T003` Define functional acceptance criteria for `GET /v1/orders/{id}`.  
Done when: success + not found + unauthorized are listed.

4. [x] `T004` Define non-functional targets (p95 latency, uptime target, log traceability).  
Done when: numeric targets exist in `docs/PHASE1_PRD.md`.

5. [x] `T005` Create `docs/adr/ADR-001-modular-monolith-phase1.md`.  
Done when: context/decision/alternatives/consequences are filled.

6. [x] `T006` Create `docs/adr/ADR-002-mysql-primary-store.md`.  
Done when: rationale for MySQL is recorded.

7. [x] `T007` Create `docs/adr/ADR-003-keycloak-auth.md`.  
Done when: token strategy and role model are documented.

8. [x] `T008` Create `docs/adr/ADR-004-idempotency-model.md`.  
Done when: DB-first idempotency flow is documented.

9. [x] `T009` Create `docs/DEFINITION_OF_DONE_PHASE1.md`.  
Done when: measurable completion checklist is present.

10. [x] `T010` Create `docs/CONTRIBUTING_PHASE1.md` with branch/PR conventions.  
Done when: naming, commit style, PR checklist are defined.

---

## Phase B - Local Tooling and Infrastructure

11. [x] `T011` Install JDK 25 and verify with `java -version`.  
Done when: version output shows JDK 25.

12. [x] `T012` Install Maven 3.9+ and verify with `mvn -version`.  
Done when: Maven command works.

13. [x] `T013` Install Docker Desktop and verify `docker version`.  
Done when: client + server output is visible.

14. [x] `T014` Add root `.env.example` with local infra variables.  
Done when: file contains mysql, redis, keycloak values.

15. [x] `T015` Add `docker-compose.yml` service for MySQL 8.4 LTS.  
Done when: `mysql` service starts.

16. [x] `T016` Add `docker-compose.yml` service for Redis 8.6.  
Done when: `redis` service starts.

17. [x] `T017` Add `docker-compose.yml` service for Keycloak 26.5.x.  
Done when: Keycloak admin console is accessible.

18. [x] `T018` Add optional Prometheus service to compose.  
Done when: Prometheus UI is reachable.

19. [x] `T019` Add optional Grafana service to compose.  
Done when: Grafana UI is reachable.

20. [x] `T020` Create `docs/SETUP.md` with exact local startup steps.  
Done when: new developer can run setup without verbal help.

21. [x] `T021` Create `scripts/dev-up.ps1` to start compose services.  
Done when: one command brings infra up.

22. [x] `T022` Create `scripts/dev-down.ps1` to stop services and optional volume reset.  
Done when: services stop cleanly.

23. [x] `T023` Create `scripts/dev-healthcheck.ps1` for infra readiness checks.  
Done when: script fails if any required service is down.

24. [x] `T024` Add `.gitignore` entries for local secrets and IDE files.  
Done when: `.env` and local artifacts are not tracked.

---

## Phase C - Architecture and API Design Artifacts

25. [x] `T025` Create `docs/architecture/01-system-context.md` with Mermaid diagram.  
Done when: user, API, DB, Redis, Keycloak nodes are shown.

26. [x] `T026` Create `docs/architecture/02-container-view.md`.  
Done when: modules (`order`, `risk`, `audit`, `ref-data`) are shown.

27. [x] `T027` Create `docs/architecture/03-sequence-place-order.md`.  
Done when: success and idempotent replay paths are shown.

28. [x] `T028` Create `docs/architecture/04-erd.md`.  
Done when: `instrument`, `order_book`, `order_event`, `idempotency_key` are modeled.

29. [x] `T029` Create `docs/api/openapi-phase1.yaml` skeleton.  
Done when: OpenAPI file validates as YAML.

30. [x] `T030` Add `POST /v1/orders` contract to OpenAPI.  
Done when: request/response/error schemas are present.

31. [x] `T031` Add `GET /v1/orders/{orderId}` contract to OpenAPI.  
Done when: path param and response schemas are present.

32. [x] `T032` Add `GET /v1/instruments/{symbol}` contract to OpenAPI.  
Done when: instrument response schema exists.

33. [x] `T033` Define canonical API error schema with `traceId`.  
Done when: all endpoints reference the same error schema.

34. [x] `T034` Add OpenAPI examples for success and each rejection code.  
Done when: spec includes example payloads.

35. [x] `T035` Create `docs/API_ERROR_CODES.md` with machine-readable codes.  
Done when: codes are unique and categorized.

36. [x] `T036` Create `docs/DOMAIN_GLOSSARY.md` with order/risk terminology.  
Done when: all business terms used in APIs are defined.

---

## Phase D - Application Bootstrap (Codebase Foundation)

37. [x] `T037` Create or refactor to root parent Maven `pom.xml` with module list.  
Done when: effective POM is valid.

38. [x] `T038` Create module `shared/common` if missing.  
Done when: module builds and is importable.

39. [x] `T039` Create module `shared/contracts` if missing.  
Done when: module builds and is importable.

40. [x] `T040` Create module `apps/oems-api` (Phase 1 deployable app).  
Done when: Spring app starts from this module.

41. [x] `T041` Add dependency management section (versions in one place).  
Done when: child modules rely on managed versions.

42. [x] `T042` Configure Java release level in parent POM (`25`).  
Done when: compile target is consistent across modules.

43. [x] `T043` Add Spring Boot starter dependencies to `oems-api`.  
Done when: app starts with web/security/data-jpa/actuator.

44. [x] `T044` Add Flyway and MySQL driver dependencies.  
Done when: migration runs on startup.

45. [x] `T045` Add Redis starter dependency.  
Done when: Redis template bean can be created.

46. [x] `T046` Add validation starter dependency.  
Done when: Bean Validation annotations work on DTOs.

47. [x] `T047` Create package layout (`api`, `application`, `domain`, `infrastructure`, `config`).  
Done when: structure exists and follows layering.

48. [x] `T048` Add `application-local.properties` with local DB/Redis/Keycloak settings.  
Done when: app runs with `local` profile.

49. [x] `T049` Add `application-test.properties` for test runtime overrides.  
Done when: tests can run isolated from local profile.

50. [x] `T050` Add startup banner/logging configuration for profile visibility.  
Done when: startup logs show active profile and ports.

51. [x] `T051` Add root scripts for build/test/run shortcuts.  
Done when: developer runs build with a single command.

52. [x] `T052` Ensure baseline `mvn clean verify` passes from root.  
Done when: build is green on clean checkout.

---

## Phase E - Database Schema and Migrations

53. [x] `T053` Create migration folder `db/migration`.  
Done when: Flyway detects folder.

54. [x] `T054` Create `V1__create_instrument_table.sql`.  
Done when: table and core constraints exist.

55. [x] `T055` Create `V2__create_order_book_table.sql`.  
Done when: order columns + status field exist.

56. [x] `T056` Create `V3__create_order_event_table.sql`.  
Done when: event table references `order_book`.

57. [x] `T057` Create `V4__create_idempotency_key_table.sql`.  
Done when: unique key and response cache columns exist.

58. [x] `T058` Create `V5__create_risk_limit_table.sql`.  
Done when: trader and symbol-specific risk limits exist.

59. [x] `T059` Add index migration for order query performance.  
Done when: index for `(trader_id, created_at)` exists.

60. [x] `T060` Add index migration for event retrieval by order id.  
Done when: order event lookup is index-backed.

61. [x] `T061` Add check constraints for side/orderType values.  
Done when: invalid values cannot be inserted.

62. [x] `T062` Add check constraints for positive quantity and notional.  
Done when: invalid numeric values are blocked.

63. [x] `T063` Create `V6__seed_instrument_data.sql` with test symbols.  
Done when: app starts with tradable instruments available.

64. [x] `T064` Create `V7__seed_risk_limits.sql` with baseline limits.  
Done when: risk checks can run without manual DB inserts.

65. [x] `T065` Configure `spring.jpa.hibernate.ddl-auto=validate`.  
Done when: schema mismatch fails startup.

66. [x] `T066` Configure `spring.flyway.enabled=true`.  
Done when: migration logs appear at startup.

67. [x] `T067` Configure migration baseline behavior for empty DB.  
Done when: fresh DB starts without manual steps.

68. [x] `T068` Add migration test that verifies all migrations apply in order.  
Done when: test fails on broken SQL.

69. [x] `T069` Add rollback policy doc `docs/DB_CHANGE_POLICY.md`.  
Done when: team knows roll-forward strategy.

70. [x] `T070` Add script `scripts/db-reset-local.ps1`.  
Done when: one command recreates local DB state.

71. [x] `T071` Add script `scripts/db-connect.ps1` helper.  
Done when: command opens mysql client for local DB quickly.

72. [x] `T072` Verify migrations on completely fresh containerized DB.  
Done when: app boots and all tables are present.

---
## Phase F - Shared Contracts and Core Domain Types

73. [x] `T073` Add enum `OrderType` (`MARKET`, `LIMIT`) in contracts module.  
Done when: shared enum used by API + domain.

74. [x] `T074` Add enum `Side` (`BUY`, `SELL`) in contracts module.  
Done when: side is not represented as free string in code.

75. [x] `T075` Add enum `OrderStatus` (`NEW`, `REJECTED`) for Phase 1.  
Done when: persisted status uses enum mapping.

76. [x] `T076` Add enum `RiskRejectCode` set in contracts module.  
Done when: risk responses use machine codes.

77. [x] `T077` Add `ApiError` class in `shared/common`.  
Done when: all APIs can return standardized error object.

78. [x] `T078` Add `ErrorCode` enum for global application errors.  
Done when: centralized error catalog exists.

79. [x] `T079` Add `CorrelationContext` helper for trace id propagation.  
Done when: trace id can be set/get/clear per request.

80. [x] `T080` Add decimal precision utility for deterministic calculations.  
Done when: calculations use deterministic scale/rounding.

81. [x] `T081` Add value object `Quantity` for positive quantity rules.  
Done when: negative/zero quantity blocked at constructor level.

82. [x] `T082` Add domain exception classes (`BusinessRuleViolation`, etc.).  
Done when: business failures are distinct from technical failures.

83. [x] `T083` Add domain event type constants for order events.  
Done when: event names are centralized.

84. [x] `T084` Add mapping utility for enum <-> DB string serialization.  
Done when: conversion logic is unit-tested.

85. [x] `T085` Add contract versioning policy doc in `docs/CONTRACT_VERSIONING.md`.  
Done when: backward compatibility rules are explicit.

86. [x] `T086` Add unit tests for shared enums and value objects.  
Done when: invalid inputs are rejected by tests.

87. [x] `T087` Add unit tests for decimal calculation utility.  
Done when: expected scales/rounding are verified.

88. [x] `T088` Add package-level architecture test to enforce module boundaries.  
Done when: forbidden dependency usage fails test.

89. [x] `T089` Ensure shared modules have no Spring Boot runtime dependency leaks.  
Done when: shared modules remain lightweight.

90. [x] `T090` Publish internal shared-module usage guide in docs.  
Done when: examples show how APIs consume shared contracts.

---

## Phase G - Security and Identity

91. [x] `T091` Configure Keycloak realm `oems` manually (or import JSON).  
Done when: realm exists in local Keycloak.

92. [x] `T092` Configure Keycloak client `oems-api`.  
Done when: client credentials and redirect config are valid.

93. [x] `T093` Create Keycloak roles `TRADER` and `OPS`.  
Done when: both roles visible in realm role list.

94. [x] `T094` Create test user `trader1` with role `TRADER`.  
Done when: token includes trader role claim.

95. [x] `T095` Create test user `ops1` with role `OPS`.  
Done when: token includes ops role claim.

96. [x] `T096` Add Keycloak realm-export file to repo for reproducibility.  
Done when: local setup can import realm automatically.

97. [x] `T097` Configure Spring Security resource-server JWT properties.  
Done when: app validates Keycloak-issued JWT.

98. [x] `T098` Create security config class with endpoint authorization rules.  
Done when: order endpoints require `ROLE_TRADER`.

99. [x] `T099` Secure actuator endpoints to ops role or internal network.  
Done when: unauthorized users cannot access sensitive endpoints.

100. [x] `T100` Add CORS configuration for intended client origin(s).  
Done when: browser clients can call API without CORS failure.

101. [x] `T101` Add helper to extract `traderId` from JWT claims.  
Done when: application service receives resolved trader id.

102. [x] `T102` Add authentication failure handler with standardized `ApiError`.  
Done when: `401` format matches global error schema.

103. [x] `T103` Add authorization failure handler with standardized `ApiError`.  
Done when: `403` format matches global error schema.

104. [x] `T104` Add integration test for `401` without token.  
Done when: test verifies status + body fields.

105. [x] `T105` Add integration test for `403` with wrong role.  
Done when: non-trader role cannot place orders.

106. [x] `T106` Add integration test for valid trader token.  
Done when: authorized request reaches controller.

107. [x] `T107` Add security docs in `docs/SECURITY_PHASE1.md`.  
Done when: token flow and claims mapping documented.

108. [x] `T108` Add secrets policy (`never commit real credentials`).  
Done when: docs + `.gitignore` enforce safe practice.

109. [x] `T109` Add optional local mock auth mode for faster API development tests.  
Done when: dedicated profile can bypass Keycloak in local dev only.

110. [x] `T110` Run security smoke test script for protected endpoints.  
Done when: script passes all expected auth outcomes.

---

## Phase H - Reference Data Module Implementation

111. [x] `T111` Create JPA entity `InstrumentEntity`.  
Done when: entity maps all instrument table columns.

112. [x] `T112` Create repository interface for instrument queries.  
Done when: `findBySymbol` exists.

113. [x] `T113` Create domain model `Instrument`.  
Done when: domain object independent of JPA annotations.

114. [x] `T114` Create mapper between entity and domain model.  
Done when: conversion is unit-tested.

115. [x] `T115` Create `InstrumentService#getBySymbol`.  
Done when: returns domain object or not-found error.

116. [x] `T116` Create `InstrumentService#validateTradable`.  
Done when: checks symbol existence and tradable flag.

117. [x] `T117` Add validation for quantity against instrument min/max.  
Done when: out-of-range quantity fails with business code.

118. [x] `T118` Add validation for price tick-size compliance.  
Done when: off-tick price is rejected.

119. [x] `T119` Create API DTO for instrument response.  
Done when: response contract matches OpenAPI.

120. [x] `T120` Create `GET /v1/instruments/{symbol}` controller endpoint.  
Done when: endpoint returns 200 for valid symbol.

121. [x] `T121` Add not-found handling for unknown symbol in controller.  
Done when: endpoint returns standardized `404`.

122. [x] `T122` Add controller integration test for known symbol.  
Done when: JSON fields match expected values.

123. [x] `T123` Add controller integration test for unknown symbol.  
Done when: `404` and error code verified.

124. [x] `T124` Add unit tests for tradable validation logic.  
Done when: tradable false case is covered.

125. [x] `T125` Add unit tests for tick-size and qty-range checks.  
Done when: edge values pass/fail correctly.

126. [x] `T126` Add seed migration update for at least 5 instruments.  
Done when: local API can query multiple symbols.

127. [x] `T127` Add endpoint-level security rule for instrument read.  
Done when: only authenticated users can read instrument.

128. [x] `T128` Add API docs snippet for instrument endpoint usage.  
Done when: docs include sample request/response.

---

## Phase I - Risk Module Implementation

129. [x] `T129` Create JPA entity `RiskLimitEntity`.  
Done when: entity maps trader/symbol limits.

130. [x] `T130` Create repository method for exact trader+symbol lookup.  
Done when: method returns optional symbol-specific rule.

131. [x] `T131` Create repository method for trader default rule lookup.  
Done when: fallback rule query exists.

132. [x] `T132` Create domain model `RiskLimit`.  
Done when: model stores maxQty/maxNotional/priceBandPct.

133. [x] `T133` Create risk result model (`PASS` or `FAIL`).  
Done when: includes reject code + message.

134. [x] `T134` Implement `checkMaxQty` rule.  
Done when: qty above limit returns failure code.

135. [x] `T135` Implement `checkMaxNotional` rule.  
Done when: notional above limit returns failure code.

136. [x] `T136` Implement `checkPriceBand` rule.  
Done when: outside band returns failure code.

137. [x] `T137` Implement rule execution order and fail-fast behavior.  
Done when: first failing rule is deterministically returned.

138. [x] `T138` Implement rounding/precision policy in risk calculations.  
Done when: BigDecimal scale is fixed and tested.

139. [x] `T139` Create `RiskCheckService#evaluate(orderDraft, instrument, trader)`.  
Done when: service returns pass/fail object.

140. [x] `T140` Add unit tests for max quantity edge cases.  
Done when: equal-to-limit and just-above-limit are tested.

---
141. [x] `T141` Add unit tests for max notional edge cases.  
Done when: decimal precision cases are tested.

142. [x] `T142` Add unit tests for price-band rule edge cases.  
Done when: lower and upper boundary behavior is tested.

143. [x] `T143` Add integration test with seeded risk limits.  
Done when: API-driven flow triggers expected risk outcomes.

144. [x] `T144` Add risk reject message catalog in `docs/RISK_CODES.md`.  
Done when: each reject code has meaning and operator action.

145. [x] `T145` Add fallback behavior when no risk profile found.  
Done when: default policy is explicit and tested.

146. [x] `T146` Add metrics counter per risk reject code.  
Done when: each rejection increments labeled metric.

147. [x] `T147` Add structured audit payload section for risk results.  
Done when: reject reason appears in persisted event payload.

148. [x] `T148` Add API mapping for risk failure status code.  
Done when: chosen status is consistently returned.

149. [x] `T149` Add negative test for missing/invalid price in LIMIT order.  
Done when: proper validation/risk path verified.

150. [x] `T150` Add positive test for MARKET order without price.  
Done when: request accepted when other checks pass.

---

## Phase J - Order Placement API (Core Flow)

151. [x] `T151` Create order request DTO per OpenAPI schema.  
Done when: DTO includes Bean Validation annotations.

152. [x] `T152` Create order response DTO per OpenAPI schema.  
Done when: response object includes required fields.

153. [x] `T153` Create JPA entity `OrderEntity` mapping `order_book`.  
Done when: all DB columns are mapped.

154. [x] `T154` Create JPA entity `OrderEventEntity` mapping `order_event`.  
Done when: entity supports JSON payload storage.

155. [x] `T155` Create order repository with `findById`.  
Done when: repository returns order by UUID.

156. [x] `T156` Create order event repository with `findByOrderId`.  
Done when: events can be retrieved by order id.

157. [x] `T157` Create domain model `OrderDraft` for pre-persistence validation.  
Done when: draft construction validates mandatory invariants.

158. [x] `T158` Create domain model `Order` for persisted state.  
Done when: status, timestamps, and version are present.

159. [x] `T159` Implement notional calculation utility.  
Done when: LIMIT and MARKET notional policy is coded and tested.

160. [x] `T160` Create `OrderApplicationService#placeOrder`.  
Done when: method orchestrates validate -> risk -> persist path.

161. [x] `T161` Add transaction boundary for place-order service method.  
Done when: order and event persist atomically.

162. [x] `T162` Validate request field combinations (MARKET vs LIMIT price rules).  
Done when: invalid combinations return validation error.

163. [x] `T163` Wire instrument validation inside place-order flow.  
Done when: unknown/non-tradable symbols are rejected.

164. [x] `T164` Wire risk validation inside place-order flow.  
Done when: risk-failed orders are rejected with codes.

165. [x] `T165` Persist accepted order with `NEW` status.  
Done when: DB row created for accepted order.

166. [x] `T166` Persist rejected order with `REJECTED` status and reason.  
Done when: DB row stores rejection metadata.

167. [x] `T167` Persist `ORDER_RECEIVED` event before decision.  
Done when: every request has initial audit event.

168. [x] `T168` Persist `ORDER_ACCEPTED` event for accepted orders.  
Done when: accepted orders have acceptance event row.

169. [x] `T169` Persist `ORDER_REJECTED` event for rejected orders.  
Done when: rejected orders have rejection event row.

170. [x] `T170` Create controller `POST /v1/orders`.  
Done when: endpoint accepts and returns contract-compliant JSON.

171. [x] `T171` Add authentication principal -> trader id mapping in controller/service.  
Done when: order row contains trader id from token claim.

172. [x] `T172` Add request/response logging for order endpoint (without secrets).  
Done when: logs include order id and trace id.

173. [x] `T173` Add integration test for successful LIMIT order.  
Done when: returns 201 and DB rows are persisted.

174. [x] `T174` Add integration test for successful MARKET order.  
Done when: no price path works as designed.

175. [x] `T175` Add integration test for instrument-not-found rejection.  
Done when: status and error code are correct.

176. [x] `T176` Add integration test for risk max qty rejection.  
Done when: rejection reason code matches expected.

177. [x] `T177` Add integration test for risk max notional rejection.  
Done when: rejection reason code matches expected.

178. [x] `T178` Add integration test for risk price band rejection.  
Done when: rejection reason code matches expected.

179. [x] `T179` Add integration test to verify events persisted for every order attempt.  
Done when: each call has `ORDER_RECEIVED` + terminal event.

180. [x] `T180` Add API docs for place-order endpoint in cookbook links.  
Done when: docs reference real request/response examples.

---

## Phase K - Idempotency and Duplicate-Safety

181. [x] `T181` Create JPA entity `IdempotencyKeyEntity`.  
Done when: table mapping includes request hash and response snapshot.

182. [x] `T182` Create repository `findByIdemKey`.  
Done when: lookup by header key is supported.

183. [x] `T183` Create request-hash utility from canonical JSON payload.  
Done when: stable hash for same payload regardless of field order.

184. [x] `T184` Add requirement check for `Idempotency-Key` header presence.  
Done when: missing header yields deterministic error.

185. [x] `T185` Add idempotency pre-check before business processing.  
Done when: existing key path short-circuits business flow.

186. [x] `T186` Implement "same key + same hash" replay response logic.  
Done when: existing response is returned without new DB order insert.

187. [x] `T187` Implement "same key + different hash" conflict logic.  
Done when: endpoint returns `409` with conflict code.

188. [x] `T188` Implement transactional insert lock for new idempotency key.  
Done when: concurrent duplicate calls do not double-insert orders.

189. [x] `T189` Persist final response snapshot in idempotency table.  
Done when: replay returns same status/body as original.

190. [x] `T190` Add idempotency TTL policy column handling.  
Done when: expiration timestamp is stored and used.

191. [x] `T191` Add Redis fast-path cache for idempotency lookup (optional).  
Done when: cache hit path works and DB remains source of truth.

192. [x] `T192` Add scheduled cleanup job for expired idempotency records.  
Done when: cleanup removes old rows safely.

193. [x] `T193` Add integration test for repeated same request + same key.  
Done when: same order id returned both times.

194. [x] `T194` Add integration test for same key + different payload.  
Done when: `409 IDEMPOTENCY_CONFLICT` is returned.

195. [x] `T195` Add concurrency integration test with same key in parallel.  
Done when: only one order row created.

196. [x] `T196` Add load test scenario with retries and idempotency keys.  
Done when: duplicate order creation rate is zero.

197. [x] `T197` Add operational query doc for idempotency troubleshooting.  
Done when: docs show SQL for inspecting key collisions.

198. [x] `T198` Add metric `idempotency_replay_total`.  
Done when: replay path increments metric.

199. [x] `T199` Add metric `idempotency_conflict_total`.  
Done when: conflict path increments metric.

200. [x] `T200` Add API docs note: client key generation and retry policy.  
Done when: client behavior guidance is explicit.

---
## Phase L - Query, Audit, Error Model, and Observability

201. [ ] `T201` Create query DTO for order details response.  
Done when: response includes status, symbol, qty, price, timestamps.

202. [ ] `T202` Implement `OrderQueryService#getOrderById(orderId, traderId)`.  
Done when: service enforces trader-scoped access.

203. [ ] `T203` Add controller `GET /v1/orders/{orderId}`.  
Done when: endpoint returns contract-compliant response.

204. [ ] `T204` Add `404` handling for unknown order id.  
Done when: standardized not-found error returned.

205. [ ] `T205` Add trader ownership check for queried order.  
Done when: trader cannot read another trader's order.

206. [ ] `T206` Add service method to fetch order events by order id.  
Done when: events returned ordered by timestamp.

207. [ ] `T207` Add ops/internal endpoint to read order events.  
Done when: audit trail can be queried by ops role.

208. [ ] `T208` Add security rule for audit endpoint (`ROLE_OPS`).  
Done when: trader token cannot access ops audit endpoint.

209. [ ] `T209` Add global exception handler class.  
Done when: all unhandled exceptions map to standard error.

210. [ ] `T210` Map validation exceptions to `VALIDATION_ERROR`.  
Done when: field errors use common payload shape.

211. [ ] `T211` Map business exceptions to domain-specific error codes.  
Done when: risk/instrument/idempotency failures are explicit.

212. [ ] `T212` Map auth exceptions to standardized `401`/`403` payloads.  
Done when: payload includes code, path, timestamp, trace id.

213. [ ] `T213` Add request filter to propagate/generate `X-Trace-Id`.  
Done when: all requests include trace id context.

214. [ ] `T214` Add trace id and trader id to logging pattern (MDC).  
Done when: logs are correlated by request.

215. [ ] `T215` Add metrics `orders_accepted_total` and `orders_rejected_total`.  
Done when: counters increment on each terminal order outcome.

216. [ ] `T216` Add timer metric for `POST /v1/orders` latency.  
Done when: p95 is visible in metrics backend.

217. [ ] `T217` Expose actuator health/info/prometheus endpoints.  
Done when: endpoints are reachable and secured.

218. [ ] `T218` Add Prometheus scrape config and Grafana dashboard baseline.  
Done when: dashboard shows latency/error/rejection trends.

219. [ ] `T219` Add alert rule for latency breach.  
Done when: test alert can be triggered intentionally.

220. [ ] `T220` Add alert rule for elevated rejection spike.  
Done when: reject surge generates alert.

---

## Phase M - Testing and Quality Automation

221. [ ] `T221` Configure JUnit 5 baseline test setup across modules.  
Done when: all modules run tests from root build.

222. [ ] `T222` Configure Testcontainers for MySQL integration tests.  
Done when: integration suite starts isolated MySQL.

223. [ ] `T223` Configure Testcontainers for Redis integration tests.  
Done when: idempotency tests run with isolated Redis.

224. [ ] `T224` Add integration test for `POST /orders` success path.  
Done when: order + events + response are asserted.

225. [ ] `T225` Add integration test for instrument-not-found rejection.  
Done when: status/code/payload fields are verified.

226. [ ] `T226` Add integration test for all three risk rejection cases.  
Done when: each risk reject code is covered.

227. [ ] `T227` Add integration test for idempotent replay (same key, same payload).  
Done when: second call returns same order response.

228. [ ] `T228` Add integration test for idempotency conflict (same key, different payload).  
Done when: response is `409` with conflict code.

229. [ ] `T229` Add integration test for parallel duplicate submissions.  
Done when: exactly one order row is created.

230. [ ] `T230` Add integration test for `GET /orders/{id}` success and ownership control.  
Done when: owner allowed, non-owner denied.

231. [ ] `T231` Add integration test for audit event endpoint authorization.  
Done when: only ops role can fetch audit events.

232. [ ] `T232` Add JSON contract tests against OpenAPI examples.  
Done when: payloads conform to spec in CI.

233. [ ] `T233` Add code coverage reporting and threshold (for example 80%).  
Done when: CI fails if below threshold.

234. [ ] `T234` Add architecture rule tests (package/layer boundaries).  
Done when: invalid cross-layer dependencies fail build.

235. [ ] `T235` Add static analysis and format checks to build.  
Done when: style and smell checks run automatically.

236. [ ] `T236` Add regression test dataset for known risk scenarios.  
Done when: dataset can be rerun after any logic change.

---

## Phase N - Performance, CI/CD, Deployment, UAT

237. [ ] `T237` Add load script for `POST /v1/orders` (k6/Gatling).  
Done when: configurable VU and duration parameters exist.

238. [ ] `T238` Run baseline performance test and capture p95/p99.  
Done when: report saved in `docs/perf/phase1-baseline.md`.

239. [ ] `T239` Tune DB pool and app configs based on baseline results.  
Done when: latency and error profile improves measurably.

240. [ ] `T240` Add CI pipeline stages: compile, unit, integration, package.  
Done when: PR cannot merge unless all stages pass.

241. [ ] `T241` Add dependency vulnerability scan step in CI.  
Done when: report is produced for each build.

242. [ ] `T242` Add Dockerfile for production image build.  
Done when: image starts and passes health endpoint check.

243. [ ] `T243` Add deployment manifest (compose or k8s) for staging.  
Done when: staging deploy is reproducible via one command/pipeline.

244. [ ] `T244` Add migration execution in deployment workflow.  
Done when: schema updates apply automatically on deploy.

245. [ ] `T245` Add release checklist doc for Phase 1.  
Done when: checklist covers build, tests, deploy, smoke, monitor.

246. [ ] `T246` Create UAT script for trader happy path and failures.  
Done when: script includes expected API responses.

247. [ ] `T247` Execute UAT and collect sign-off from stakeholders.  
Done when: sign-off recorded or blockers logged.

248. [ ] `T248` Fix UAT blockers and rerun affected scenarios.  
Done when: no blocker remains open.

249. [ ] `T249` Deploy to target environment and run smoke tests.  
Done when: health and core APIs are green post-deploy.

250. [ ] `T250` Run 24-hour post-release monitoring and document incidents.  
Done when: `docs/POST_RELEASE_PHASE1.md` is created.

---

## Milestone Gates

251. [x] `T251` Gate 1 complete: planning + setup + architecture docs done.  
Depends on: `T001` to `T036`.

252. [x] `T252` Gate 2 complete: bootstrap + DB + shared core completed.  
Depends on: `T037` to `T090`.

253. [x] `T253` Gate 3 complete: security + reference data + risk completed.  
Depends on: `T091` to `T150`.

254. [x] `T254` Gate 4 complete: order placement + idempotency completed.  
Depends on: `T151` to `T200`.

255. [ ] `T255` Gate 5 complete: query + errors + observability completed.  
Depends on: `T201` to `T220`.

256. [ ] `T256` Gate 6 complete: testing and quality automation completed.  
Depends on: `T221` to `T236`.

257. [ ] `T257` Gate 7 complete: perf + CI/CD + deployment completed.  
Depends on: `T237` to `T245`.

258. [ ] `T258` Gate 8 complete: UAT + go-live completed.  
Depends on: `T246` to `T250`.

259. [ ] `T259` Gate 9 complete: all milestone gates closed.  
Depends on: `T251` to `T258`.

260. [ ] `T260` Phase 1 officially complete.  
Depends on: `T001` to `T259`.
