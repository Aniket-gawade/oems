# OEMS Phase 2 Tasks Board (Frontend, Atomic, Start-to-End)

Last updated: 2026-04-05

## How to use this board

1. Execute tasks in order (`F001` -> `F245`).
2. Create one branch per task or one branch per small task group.
3. Mark tasks complete only when the `Done when` condition is true.
4. Do not skip dependencies.
5. QA should execute manual scenarios in **Phase J** and attach evidence to each completed task.

Status legend:

- `[ ]` Not started
- `[x]` Done

---

## Phase A - Frontend Scope, UX, and Acceptance Criteria

1. [x] `F001` Create `docs/PHASE2_PRD.md` with frontend scope, non-scope, and user stories.  
Done when: PRD includes trader + ops UI journeys.

2. [x] `F002` Define frontend personas (`TRADER`, `OPS`, `QA`) and their goals.  
Done when: persona-specific outcomes are documented.

3. [x] `F003` Define Phase 2 screen inventory.  
Done when: login, dashboard, place-order, order-detail, and ops-audit screens are listed.

4. [x] `F004` Define navigation IA and route map.  
Done when: route list and role visibility matrix are documented.

5. [x] `F005` Define non-functional targets (FCP, interaction latency, accessibility baseline).  
Done when: numeric targets exist in `docs/PHASE2_PRD.md`.

6. [x] `F006` Define browser and device support matrix.  
Done when: minimum versions + viewport breakpoints are documented.

7. [x] `F007` Define frontend security requirements for token/session handling.  
Done when: storage and expiry strategy is explicit.

8. [x] `F008` Define frontend API dependencies against Phase 1 backend contracts.  
Done when: endpoint-to-screen mapping is documented.

9. [x] `F009` Define UX acceptance criteria for place-order flow.  
Done when: success + validation + rejection experiences are specified.

10. [x] `F010` Define UX acceptance criteria for order lookup/detail flow.  
Done when: found + not-found + unauthorized cases are specified.

11. [x] `F011` Define UX acceptance criteria for ops audit trail flow.  
Done when: role-restricted access and event display rules are documented.

12. [x] `F012` Define global loading, empty, and error state patterns.  
Done when: pattern catalog with examples is documented.

13. [x] `F013` Define notification/toast and inline form-error standards.  
Done when: severity and placement rules are documented.

14. [x] `F014` Define manual QA acceptance template for each feature.  
Done when: template includes preconditions, steps, expected result, and evidence.

15. [x] `F015` Create `docs/DEFINITION_OF_DONE_PHASE2.md`.  
Done when: measurable completion checklist is present.

---

## Phase B - Frontend Bootstrap, Tooling, and Local Runtime

16. [x] `F016` Create ADR for frontend stack selection in `docs/adr/ADR-005-frontend-stack-phase2.md`.  
Done when: rationale and alternatives are recorded.

17. [x] `F017` Scaffold new frontend app module at `apps/oems-web`.  
Done when: app boots locally with a starter page.

18. [x] `F018` Configure TypeScript strict mode and path aliases.  
Done when: compile passes with strict checks enabled.

19. [x] `F019` Add package manager lockfile and enforce deterministic install.  
Done when: clean install is reproducible on a new machine.

20. [x] `F020` Configure ESLint for TypeScript + React rules.  
Done when: lint command runs and fails on violations.

21. [x] `F021` Configure Prettier formatting and script integration.  
Done when: format command updates files consistently.

22. [x] `F022` Configure unit test runner (Vitest/Jest) with DOM test utilities.  
Done when: sample unit test runs in CI mode.

23. [x] `F023` Configure Playwright for browser E2E tests.  
Done when: one smoke test runs headless in local env.

24. [x] `F024` Add frontend `.env.example` with API/auth/runtime variables.  
Done when: env file documents all required keys.

25. [x] `F025` Configure local API proxy to backend service.  
Done when: browser calls succeed without local CORS issues.

26. [x] `F026` Add scripts for `dev`, `build`, `test`, `lint`, and `e2e`.  
Done when: scripts execute from app root.

27. [x] `F027` Add container build file for frontend app.  
Done when: container starts and serves frontend assets.

28. [x] `F028` Add frontend service entry in `docker-compose.yml` (optional local UI).  
Done when: compose can run API + web together.

29. [x] `F029` Add `scripts/run-oems-web.ps1` for one-command local web startup.  
Done when: script starts app with documented defaults.

30. [x] `F030` Add `scripts/web-healthcheck.ps1` for frontend readiness checks.  
Done when: script fails when app is unreachable.

31. [x] `F031` Create `docs/SETUP_PHASE2_FRONTEND.md` with setup and run steps.  
Done when: new developer can launch UI without verbal help.

32. [x] `F032` Add frontend CI steps (install, lint, test, build) in `.github/workflows/ci.yml`.  
Done when: PR pipeline runs frontend stages.

33. [x] `F033` Add dependency vulnerability scan for frontend packages.  
Done when: scan report is generated in CI.

34. [x] `F034` Add pre-commit checks for changed frontend files.  
Done when: commit hook blocks lint/test failures.

35. [x] `F035` Verify clean bootstrap on fresh clone and document results.  
Done when: setup works on a machine without cached dependencies.

---

## Phase C - App Shell, Routing, and Design System Foundation

36. [x] `F036` Create `docs/PHASE2_DESIGN_TOKENS.md` for typography/color/spacing rules.  
Done when: token catalog is documented with values.

37. [x] `F037` Implement global CSS variables from token definitions.  
Done when: core UI styles consume token variables.

38. [x] `F038` Implement base layout shell (header, nav, content region).  
Done when: shell renders consistently across routes.

39. [x] `F039` Implement responsive breakpoints for mobile/tablet/desktop.  
Done when: shell remains usable at supported widths.

40. [x] `F040` Add route registry and route metadata model.  
Done when: all routes are declared in one place.

41. [x] `F041` Implement public route handling (`/login`, auth callback pages).  
Done when: unauthenticated users can access only public routes.

42. [x] `F042` Implement protected route wrapper.  
Done when: protected routes redirect when session is missing.

43. [x] `F043` Implement role-based route gating (`TRADER`, `OPS`).  
Done when: unauthorized roles cannot load restricted screens.

44. [x] `F044` Add global app providers (auth, API client, query cache, notifications).  
Done when: app bootstraps with providers in one entry module.

45. [x] `F045` Add global toast/notification system with severity levels.  
Done when: success/warn/error toasts are reusable across screens.

46. [x] `F046` Implement reusable form primitives (`Input`, `Select`, `NumberInput`, `Button`).  
Done when: primitives are used by at least one screen.

47. [x] `F047` Implement reusable table/list primitives for data rendering.  
Done when: table supports loading and empty variants.

48. [x] `F048` Implement status badge component for order states.  
Done when: `NEW` and `REJECTED` badges are visually distinct.

49. [x] `F049` Implement skeleton loaders for async UI sections.  
Done when: key screens show skeletons during fetch.

50. [x] `F050` Implement reusable empty-state component.  
Done when: empty views use a single consistent component.

51. [x] `F051` Implement reusable error-state component with retry action.  
Done when: recoverable screens can retry from error state.

52. [x] `F052` Add page-level error boundary for runtime rendering failures.  
Done when: app shows fallback UI instead of white screen.

53. [x] `F053` Create `Not Found` route page.  
Done when: invalid URLs route to custom 404 screen.

54. [x] `F054` Create `Unauthorized` route page.  
Done when: unauthorized navigation shows explicit access message.

55. [x] `F055` Add loading overlay utility for blocking actions.  
Done when: submit actions can lock UI consistently.

56. [x] `F056` Add component documentation (Storybook or equivalent).  
Done when: core components have interactive docs.

57. [x] `F057` Add visual baseline snapshots for shell + primitives.  
Done when: snapshot drift is detectable in CI.

58. [x] `F058` Add accessibility checks for base components.  
Done when: no critical a11y violations on shell screens.

59. [x] `F059` Add keyboard navigation baseline across app shell.  
Done when: nav and primary actions are keyboard-accessible.

60. [x] `F060` Update frontend architecture doc in `docs/architecture/05-frontend-container-view.md`.  
Done when: frontend modules and dependencies are documented.

---

## Phase D - Authentication, Session, and Authorization UX

61. [x] `F061` Integrate OIDC/Keycloak client in frontend app.  
Done when: login redirect flow is wired to configured realm/client.

62. [x] `F062` Implement login initiation and callback handling pages.  
Done when: successful auth returns user to protected app route.

63. [x] `F063` Implement logout flow and session cleanup.  
Done when: logout clears session and redirects to login/public route.

64. [x] `F064` Implement token refresh/renewal strategy.  
Done when: long-lived session continues without manual relogin.

65. [x] `F065` Implement API auth interceptor to attach bearer token.  
Done when: protected backend calls include valid `Authorization` header.

66. [x] `F066` Implement expired-session handling with user-friendly prompt.  
Done when: expired token results in clean re-auth flow.

67. [x] `F067` Implement auth failure mapping for `401` responses.  
Done when: session is reset and user is redirected appropriately.

68. [x] `F068` Implement authorization failure mapping for `403` responses.  
Done when: user sees permission message without app crash.

69. [x] `F069` Implement role-based navigation menu visibility.  
Done when: trader and ops users see correct menu options.

70. [x] `F070` Display signed-in user identity and role in header.  
Done when: user chip shows trader/ops context.

71. [x] `F071` Add mock-auth local mode for fast QA/developer testing.  
Done when: profile flag can emulate trader and ops sessions.

72. [x] `F072` Add local mock-auth safety guard (non-prod only).  
Done when: mock mode is disabled in staging/production builds.

73. [x] `F073` Add auth flow smoke tests (unit/integration).  
Done when: callback, logout, and guard logic are covered.

74. [x] `F074` Add Playwright auth smoke tests for trader and ops users.  
Done when: automated login path works for both roles.

75. [x] `F075` Document frontend auth configuration in `docs/SECURITY_PHASE2_FRONTEND.md`.  
Done when: setup, callbacks, and role behavior are documented.

76. [x] `F076` Add unavailable-auth-server fallback UX.  
Done when: user sees actionable guidance when IdP is down.

77. [x] `F077` Add auth telemetry events (login success/failure, logout).  
Done when: non-PII events are emitted to logging endpoint/console.

78. [x] `F078` Validate CORS and redirect configuration in local + staging.  
Done when: no browser auth/callback errors remain.

79. [x] `F079` Add manual auth regression checklist section in QA docs.  
Done when: checklist has explicit pass/fail criteria.

80. [x] `F080` Execute and record auth regression in local environment.  
Done when: trader + ops auth scenarios are marked pass/fail.

---

## Phase E - API Contracts, Data Layer, and Error Mapping

81. [x] `F081` Generate frontend API types from `docs/api/openapi-phase1.yaml`.  
Done when: generated types compile and are versioned.

82. [x] `F082` Implement typed API client module for Phase 1 endpoints.  
Done when: all used endpoints are exposed via typed functions.

83. [x] `F083` Implement standardized API error parser for shared `ApiError` payload.  
Done when: parser maps `code`, `message`, `traceId`, and field errors.

84. [x] `F084` Implement frontend error-code map to user-facing messages.  
Done when: known backend codes have deterministic UI text.

85. [x] `F085` Implement request correlation support (`X-Trace-Id` capture/display).  
Done when: trace id is available in error details UI.

86. [x] `F086` Implement idempotency-key utility for order submissions.  
Done when: unique key generation strategy is centralized.

87. [x] `F087` Implement safe retry policy for idempotent GET requests only.  
Done when: POST `/v1/orders` is excluded from auto-retry.

88. [x] `F088` Implement `getInstrument(symbol)` API hook/service.  
Done when: service handles 200 + 404 + error mapping.

89. [x] `F089` Implement `placeOrder(payload, idempotencyKey)` API hook/service.  
Done when: service supports success, rejection, replay, and conflict responses.

90. [x] `F090` Implement `getOrder(orderId)` API hook/service.  
Done when: service handles ownership-scoped not-found behavior.

91. [x] `F091` Implement `getOpsOrderEvents(orderId)` API hook/service.  
Done when: service is restricted to ops-enabled flows.

92. [x] `F092` Implement query key factory and cache policy definitions.  
Done when: stale/cache timings are explicit per endpoint.

93. [x] `F093` Implement shared request state helpers (`loading`, `error`, `empty`).  
Done when: screen hooks use common state helpers.

94. [x] `F094` Implement field-level validation mapping from backend errors.  
Done when: backend validation errors bind to correct form fields.

95. [x] `F095` Implement risk reject-code display mapping using `docs/RISK_CODES.md`.  
Done when: `MAX_QTY`, `MAX_NOTIONAL`, `PRICE_BAND` show clear UX messages.

96. [x] `F096` Implement idempotency replay response UX contract in data layer.  
Done when: replayed response is detectable by UI.

97. [x] `F097` Implement idempotency conflict response UX contract in data layer.  
Done when: conflict response exposes actionable message + key context.

98. [x] `F098` Add API adapter unit tests for all request/response mappers.  
Done when: mapper tests cover success and failure branches.

99. [x] `F099` Add integration tests for error parser and trace-id extraction.  
Done when: tests validate standardized error handling.

100. [x] `F100` Add integration test for idempotency replay handling path.  
Done when: second same-key response maps correctly in UI state.

101. [x] `F101` Add integration test for idempotency conflict handling path.  
Done when: same-key different-payload error maps correctly.

102. [x] `F102` Add mock API fixtures for frontend manual testing.  
Done when: QA can run UI in mock mode for deterministic scenarios.

103. [x] `F103` Create `docs/OEMS_PHASE2_API_INTEGRATION.md` for frontend API usage.  
Done when: each screen-to-endpoint mapping is documented.

104. [x] `F104` Add contract drift check between generated types and OpenAPI spec in CI.  
Done when: CI fails when API contract generation is stale.

105. [x] `F105` Validate full frontend data layer against local running backend.  
Done when: all integrated endpoints work in local e2e smoke.

---

## Phase F - Trader Workbench (Order Entry and Submission Flow)

106. [ ] `F106` Create trader dashboard route and baseline layout.  
Done when: trader lands on dashboard after login.

107. [ ] `F107` Create place-order page route and page shell.  
Done when: page is accessible from trader navigation.

108. [ ] `F108` Implement order ticket form fields (`symbol`, `side`, `orderType`, `quantity`, `price`).  
Done when: all required inputs render and bind state.

109. [ ] `F109` Implement dynamic field behavior for `MARKET` vs `LIMIT` orders.  
Done when: price input is shown/required only for `LIMIT`.

110. [ ] `F110` Implement client-side validation matching backend rules.  
Done when: invalid inputs are blocked pre-submit with clear messages.

111. [ ] `F111` Implement decimal input controls and precision formatting.  
Done when: quantity/price precision behavior is consistent.

112. [ ] `F112` Implement instrument symbol search/autocomplete.  
Done when: user can quickly locate seeded symbols.

113. [ ] `F113` Fetch and display instrument constraints (tradable, min/max qty, tick size).  
Done when: constraints are visible before submission.

114. [ ] `F114` Implement notional preview calculation in UI.  
Done when: preview updates as quantity/price fields change.

115. [ ] `F115` Implement submit-state locking and duplicate-click guard.  
Done when: multiple rapid clicks produce only one outgoing submit.

116. [ ] `F116` Attach generated idempotency key on each new submit action.  
Done when: outgoing order request always includes an idempotency key.

117. [ ] `F117` Implement success state with order-id link and summary toast.  
Done when: successful order shows order id and next action link.

118. [ ] `F118` Implement rejection state panel with backend reject code/message.  
Done when: rejected orders display clear reason and guidance.

119. [ ] `F119` Implement validation-error inline binding for backend field errors.  
Done when: backend `VALIDATION_ERROR` highlights exact controls.

120. [ ] `F120` Implement network-failure UX with retry option.  
Done when: temporary failures show retry path without data loss.

121. [ ] `F121` Preserve user draft on non-success submit outcomes.  
Done when: draft values remain after error/rejection.

122. [ ] `F122` Implement post-success reset behavior for order form.  
Done when: form resets to default state after successful submit.

123. [ ] `F123` Implement "resubmit with same idempotency key" QA/debug control (non-prod only).  
Done when: QA can intentionally test replay path from UI.

124. [ ] `F124` Implement "submit with edited payload same key" QA/debug control (non-prod only).  
Done when: QA can intentionally trigger conflict path from UI.

125. [ ] `F125` Add large-notional confirmation prompt before final submit.  
Done when: configured threshold forces explicit user confirmation.

126. [ ] `F126` Add keyboard-first submission support for power users.  
Done when: form can be completed and submitted without mouse.

127. [ ] `F127` Add recent submission list widget on trader dashboard.  
Done when: latest order attempts appear with status badges.

128. [ ] `F128` Add quick link from recent submissions to order-detail route.  
Done when: clicking row navigates to `/orders/{orderId}`.

129. [ ] `F129` Implement unknown-instrument error UX on order form.  
Done when: unknown symbol path is distinguishable from generic failure.

130. [ ] `F130` Implement risk-reject helper text mapped to reject code.  
Done when: each risk reject code has actionable user hint.

131. [ ] `F131` Add unit tests for order form validation and conditional fields.  
Done when: tests cover both MARKET and LIMIT validation branches.

132. [ ] `F132` Add integration tests for place-order success and rejection flows.  
Done when: API/UI integration assertions pass for core scenarios.

133. [ ] `F133` Add integration tests for idempotency replay/conflict UX states.  
Done when: replay and conflict states render expected UI.

134. [ ] `F134` Add Playwright E2E tests for trader happy paths (LIMIT + MARKET).  
Done when: end-to-end tests pass against local backend.

135. [ ] `F135` Validate accessibility of order form (labels, errors, focus order).  
Done when: no critical a11y issues remain on order screen.

---

## Phase G - Order Lookup, Details, and User Activity View

136. [ ] `F136` Create order lookup page with order-id search input.  
Done when: user can submit a valid order id search.

137. [ ] `F137` Add client-side UUID validation for order-id input.  
Done when: invalid format is blocked before API request.

138. [ ] `F138` Implement order-detail fetch and summary panel.  
Done when: detail panel shows key order fields from API.

139. [ ] `F139` Render order status with semantic badges and labels.  
Done when: statuses are visually and textually clear.

140. [ ] `F140` Format quantity/price/notional with consistent number rules.  
Done when: numeric formatting matches product standards.

141. [ ] `F141` Format timestamps to user-local display with UTC tooltip.  
Done when: displayed time is consistent and understandable.

142. [ ] `F142` Add deep-link route handling for `/orders/:orderId`.  
Done when: direct URL loads order detail page.

143. [ ] `F143` Add copy actions for order id and trace id.  
Done when: copied values are available via one click.

144. [ ] `F144` Implement loading skeleton for order detail fetch.  
Done when: skeleton appears while request is in-flight.

145. [ ] `F145` Implement neutral "order not found" UX for `404` path.  
Done when: user receives non-technical guidance.

146. [ ] `F146` Implement ownership-denied handling aligned with backend behavior.  
Done when: unauthorized lookup displays same not-found treatment.

147. [ ] `F147` Add retry action for transient order-detail fetch failures.  
Done when: retry re-executes request and updates UI.

148. [ ] `F148` Add optional auto-refresh toggle for order detail.  
Done when: toggle periodically refetches order data.

149. [ ] `F149` Implement order event timeline component for user context.  
Done when: event list renders in chronological order.

150. [ ] `F150` Map event types (`ORDER_RECEIVED`, `ORDER_ACCEPTED`, `ORDER_REJECTED`) to UX labels.  
Done when: timeline uses human-readable event names.

151. [ ] `F151` Add role-aware behavior for timeline data sources.  
Done when: trader sees allowed data, ops gets expanded event detail.

152. [ ] `F152` Prevent trader-triggered calls to ops-only endpoints.  
Done when: no forbidden ops API request is made by trader flow.

153. [ ] `F153` Add export-as-JSON action for order detail (QA evidence support).  
Done when: exported payload includes order and visible metadata.

154. [ ] `F154` Add unit tests for detail formatters and event mappers.  
Done when: formatter/mapping edge cases are covered.

155. [ ] `F155` Add integration test for successful order lookup path.  
Done when: rendered fields match API response contract.

156. [ ] `F156` Add integration test for order not-found path.  
Done when: 404 UX behavior is verified.

157. [ ] `F157` Add Playwright E2E: submit order then open detail via link.  
Done when: e2e test validates end-to-end user journey.

158. [ ] `F158` Validate mobile responsiveness for order lookup/detail screens.  
Done when: layouts remain usable across supported viewport widths.

159. [ ] `F159` Validate accessibility semantics for timeline and summary regions.  
Done when: screen-reader landmarks and labels are correct.

160. [ ] `F160` Update user-facing usage notes in `docs/OEMS_PHASE2_USER_GUIDE.md`.  
Done when: order search/detail workflows are documented with screenshots.

---

## Phase H - Ops Views, Audit Trail UX, and Client Observability

161. [ ] `F161` Create ops dashboard route and navigation entry.  
Done when: ops users can access dashboard from main nav.

162. [ ] `F162` Enforce ops-only route guard for audit screens.  
Done when: non-ops users are denied before render.

163. [ ] `F163` Create audit search form (order id based).  
Done when: ops can submit valid order id for audit lookup.

164. [ ] `F164` Implement ops audit event table from `/v1/ops/orders/{orderId}/events`.  
Done when: events render with timestamp/type/payload indicators.

165. [ ] `F165` Implement JSON payload viewer for audit event details.  
Done when: payload can be expanded/collapsed per row.

166. [ ] `F166` Add syntax highlighting and copy action in payload viewer.  
Done when: ops can copy payload content reliably.

167. [ ] `F167` Add risk-audit context rendering when reject-related fields exist.  
Done when: risk metadata appears in a dedicated section.

168. [ ] `F168` Display backend trace id on audit errors for debugging.  
Done when: error panel includes trace id value when available.

169. [ ] `F169` Add filters for event type and timestamp range in audit table.  
Done when: filter controls narrow displayed events correctly.

170. [ ] `F170` Add export action for audit events (JSON).  
Done when: ops can export viewed audit events for incident analysis.

171. [ ] `F171` Implement `401`/`403` UX for ops audit endpoints.  
Done when: auth and permission failures are clearly differentiated.

172. [ ] `F172` Implement empty-state UX for orders with no audit events.  
Done when: empty message explains expected conditions.

173. [ ] `F173` Add client timing display for audit request latency (debug mode).  
Done when: QA/ops can inspect fetch duration per request.

174. [ ] `F174` Add frontend client-log events for key ops actions.  
Done when: lookup/export actions are logged without PII leakage.

175. [ ] `F175` Add integration test for ops audit happy path.  
Done when: ops event table renders expected payload for valid order id.

176. [ ] `F176` Add integration test for trader role denied on ops route.  
Done when: trader cannot access or call ops endpoints.

177. [ ] `F177` Add Playwright E2E test for ops audit workflow.  
Done when: e2e verifies auth + search + event rendering.

178. [ ] `F178` Validate accessibility for audit table and JSON viewer controls.  
Done when: controls are keyboard and screen-reader accessible.

179. [ ] `F179` Document ops UI runbook in `docs/OEMS_PHASE2_OPS_RUNBOOK.md`.  
Done when: audit lookup and troubleshooting flow is documented.

180. [ ] `F180` Run local observability UX smoke and record findings.  
Done when: trace ids, error details, and client logs are verified.

---

## Phase I - Frontend Quality Automation and CI Gates

181. [ ] `F181` Enforce frontend unit-test coverage threshold (for example 80%).  
Done when: CI fails below configured threshold.

182. [ ] `F182` Add visual regression baseline for core pages.  
Done when: snapshot diffs are reported in CI artifacts.

183. [ ] `F183` Add Playwright smoke suite to CI pipeline.  
Done when: smoke suite runs on PR for frontend changes.

184. [ ] `F184` Add Playwright regression suite for order workflows.  
Done when: critical trader/ops journeys are automated.

185. [ ] `F185` Add deterministic test-data setup helpers for E2E runs.  
Done when: E2E tests no longer rely on manual environment prep.

186. [ ] `F186` Add automated check for OpenAPI contract drift in frontend adapters.  
Done when: adapter/spec mismatch fails CI.

187. [ ] `F187` Add bundle-size budget checks for production build output.  
Done when: CI reports failure on budget breach.

188. [ ] `F188` Add Lighthouse CI checks for performance and accessibility budgets.  
Done when: thresholds are enforced per core route.

189. [ ] `F189` Add frontend SAST/dependency scanning in CI.  
Done when: scan report is generated and policy-enforced.

190. [ ] `F190` Add flaky-test handling and rerun policy documentation.  
Done when: team has explicit retry/escalation rules.

191. [ ] `F191` Create `docs/FRONTEND_TEST_STRATEGY_PHASE2.md`.  
Done when: unit/integration/e2e scope and ownership are defined.

192. [ ] `F192` Add one-command local QA automation script (`scripts/test-web.ps1`).  
Done when: script runs lint + unit + integration + selected e2e.

193. [ ] `F193` Add test artifact capture (screenshots/videos/traces) for failures.  
Done when: failing CI runs upload debugging artifacts.

194. [ ] `F194` Add merge gate requiring frontend quality checks to pass.  
Done when: protected branch blocks merge on failing frontend jobs.

195. [ ] `F195` Verify full frontend validation flow from clean clone.  
Done when: documented validate command passes end-to-end.

---

## Phase J - Manual QA Functional Test Board (Execution-Focused)

196. [ ] `F196` Create `docs/OEMS_PHASE2_MANUAL_QA_CHECKLIST.md` with test-case IDs.  
Done when: checklist contains preconditions/steps/expected/evidence fields.

197. [ ] `F197` Define QA environment matrix (local/staging, browser matrix, device matrix).  
Done when: matrix is approved and published in QA checklist.

198. [ ] `F198` Define and verify QA test accounts (`trader1`, `ops1`, invalid-role user).  
Done when: credentials/access paths are validated before test execution.

199. [ ] `F199` Execute manual test: trader login happy path.  
Done when: trader reaches trader dashboard successfully.

200. [ ] `F200` Execute manual test: ops login happy path.  
Done when: ops reaches ops dashboard successfully.

201. [ ] `F201` Execute manual test: unauthorized user blocked from protected routes.  
Done when: unauthorized user cannot access trader/ops screens.

202. [ ] `F202` Execute manual test: place LIMIT order success path.  
Done when: UI shows success with created `orderId`.

203. [ ] `F203` Execute manual test: place MARKET order success path.  
Done when: UI submits without price and returns success.

204. [ ] `F204` Execute manual test: LIMIT order missing price validation.  
Done when: submit is blocked with clear validation message.

205. [ ] `F205` Execute manual test: MARKET order with price is rejected per policy.  
Done when: frontend/backend response is shown correctly to user.

206. [ ] `F206` Execute manual test: unknown instrument rejection path.  
Done when: rejection reason is visible and actionable.

207. [ ] `F207` Execute manual test: risk max-quantity rejection path.  
Done when: correct reject code/message appears in UI.

208. [ ] `F208` Execute manual test: risk max-notional rejection path.  
Done when: correct reject code/message appears in UI.

209. [ ] `F209` Execute manual test: risk price-band rejection path.  
Done when: correct reject code/message appears in UI.

210. [ ] `F210` Execute manual test: same idempotency key + same payload replay path.  
Done when: repeated submit returns original response without duplicate order.

211. [ ] `F211` Execute manual test: same idempotency key + changed payload conflict path.  
Done when: UI shows idempotency conflict outcome.

212. [ ] `F212` Execute manual test: order lookup success by order id.  
Done when: detail page shows correct order fields and status.

213. [ ] `F213` Execute manual test: order lookup not found path.  
Done when: user sees not-found UX without crash.

214. [ ] `F214` Execute manual test: trader blocked from ops audit screens.  
Done when: trader cannot render ops route or fetch ops events.

215. [ ] `F215` Execute manual test: ops can view order audit events.  
Done when: ops sees event list and payload details.

216. [ ] `F216` Execute manual test: network interruption and recovery during order submit.  
Done when: retry path works and draft data is preserved.

217. [ ] `F217` Execute manual test: trace-id visibility on error responses.  
Done when: UI exposes trace id for QA/support debugging.

218. [ ] `F218` Execute manual test: responsive behavior on mobile/tablet/desktop.  
Done when: core screens remain usable at target breakpoints.

219. [ ] `F219` Execute manual test: keyboard-only accessibility journey.  
Done when: key user flows are operable without mouse.

220. [ ] `F220` Collect QA evidence and defect links for all manual test cases.  
Done when: each case has pass/fail status and evidence attachment.

---

## Phase K - UAT, Staging Rollout, and Go-Live

221. [ ] `F221` Create `docs/RELEASE_CHECKLIST_PHASE2.md`.  
Done when: checklist covers build, deploy, smoke, rollback, and monitoring.

222. [ ] `F222` Add frontend artifact build/publish step to release workflow.  
Done when: release pipeline outputs deployable frontend artifact.

223. [ ] `F223` Add/update staging deployment manifest to include frontend service.  
Done when: staging can deploy API + web UI together.

224. [ ] `F224` Deploy frontend release candidate to staging and run smoke tests.  
Done when: login + place-order + order-lookup smoke checks pass in staging.

225. [ ] `F225` Execute full QA regression in staging environment.  
Done when: Phase J test cases are rerun against staging and logged.

226. [ ] `F226` Execute UAT with trader and ops stakeholders.  
Done when: stakeholder feedback and outcomes are documented.

227. [ ] `F227` Record UAT sign-off or blockers in `docs/UAT_PHASE2.md`.  
Done when: sign-off exists or blockers are explicitly listed.

228. [ ] `F228` Resolve UAT blockers and rerun impacted scenarios.  
Done when: all blocker defects are closed or accepted with rationale.

229. [ ] `F229` Finalize production rollout + rollback playbook for frontend.  
Done when: rollout and rollback steps are documented and reviewed.

230. [ ] `F230` Execute go-live smoke + 24h post-release monitoring report.  
Done when: `docs/POST_RELEASE_PHASE2.md` is published.

---

## Milestone Gates

231. [x] `F231` Gate 1 complete: planning + bootstrap complete.  
Depends on: `F001` to `F035`.

232. [x] `F232` Gate 2 complete: shell + routing + auth foundations complete.  
Depends on: `F036` to `F080`.

233. [ ] `F233` Gate 3 complete: API integration layer complete.  
Depends on: `F081` to `F105`.

234. [ ] `F234` Gate 4 complete: trader place-order journey complete.  
Depends on: `F106` to `F135`.

235. [ ] `F235` Gate 5 complete: order lookup/detail journey complete.  
Depends on: `F136` to `F160`.

236. [ ] `F236` Gate 6 complete: ops audit journey complete.  
Depends on: `F161` to `F180`.

237. [ ] `F237` Gate 7 complete: frontend automation and CI quality gates complete.  
Depends on: `F181` to `F195`.

238. [ ] `F238` Gate 8 complete: manual QA core scenarios complete.  
Depends on: `F196` to `F213`.

239. [ ] `F239` Gate 9 complete: manual QA security/accessibility/responsive scenarios complete.  
Depends on: `F214` to `F220`.

240. [ ] `F240` Gate 10 complete: staging release candidate validated.  
Depends on: `F221` to `F225`.

241. [ ] `F241` Gate 11 complete: UAT sign-off achieved.  
Depends on: `F226` to `F228`.

242. [ ] `F242` Gate 12 complete: rollout and rollback readiness achieved.  
Depends on: `F229`.

243. [ ] `F243` Gate 13 complete: go-live and post-release monitoring complete.  
Depends on: `F230`.

244. [ ] `F244` Gate 14 complete: all milestone gates closed.  
Depends on: `F231` to `F243`.

245. [ ] `F245` Phase 2 frontend officially complete.  
Depends on: `F001` to `F244`.
