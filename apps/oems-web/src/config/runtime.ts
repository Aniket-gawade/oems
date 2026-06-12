const parseBooleanFlag = (value: string | undefined, defaultValue: boolean): boolean => {
  if (!value) {
    return defaultValue;
  }

  const normalized = value.trim().toLowerCase();
  if (normalized === "true") {
    return true;
  }

  if (normalized === "false") {
    return false;
  }

  return defaultValue;
};

const normalizeEnvironmentName = (value: string | undefined): string => (value ?? "local").trim().toLowerCase();
const localAuthAllowedEnvironments = new Set(["local", "dev", "development", "test"]);
const fallbackWebOrigin = "http://localhost:5173";

const resolveDefaultWebOrigin = (): string => {
  if (typeof window !== "undefined" && typeof window.location?.origin === "string" && window.location.origin.length > 0) {
    return window.location.origin;
  }

  return fallbackWebOrigin;
};

const toDefaultOidcUri = (path: string): string => new URL(path, resolveDefaultWebOrigin()).toString();

const appEnv = normalizeEnvironmentName(import.meta.env.VITE_APP_ENV);
const mockAuthRequested = parseBooleanFlag(import.meta.env.VITE_ENABLE_MOCK_AUTH, false);
const isProductionBuild = import.meta.env.PROD;
const allowMockAuth = !isProductionBuild && localAuthAllowedEnvironments.has(appEnv);
const enableMockAuth = mockAuthRequested && allowMockAuth;

const oidcIssuer = import.meta.env.VITE_OIDC_ISSUER ?? "http://localhost:8081/realms/oems";
const oidcClientId = import.meta.env.VITE_OIDC_CLIENT_ID ?? "oems-api";
const oidcRedirectUri = import.meta.env.VITE_OIDC_REDIRECT_URI ?? toDefaultOidcUri("/auth/callback");
const oidcPostLogoutRedirectUri = import.meta.env.VITE_OIDC_POST_LOGOUT_REDIRECT_URI ?? toDefaultOidcUri("/login");
const oidcSilentRedirectUri =
  import.meta.env.VITE_OIDC_SILENT_REDIRECT_URI ?? toDefaultOidcUri("/auth/silent-callback");
const oidcScope = import.meta.env.VITE_OIDC_SCOPE ?? "openid profile email";

export const runtimeConfig = {
  allowMockAuth,
  appEnv,
  apiBasePath: import.meta.env.VITE_API_BASE_PATH ?? "/api",
  authMode: enableMockAuth ? "mock" : "oidc",
  enableMockAuth,
  enableMockAuthTelemetry: parseBooleanFlag(import.meta.env.VITE_AUTH_TELEMETRY_ENABLED, true),
  isProductionBuild,
  mockAuthBlockedReason: mockAuthRequested && !allowMockAuth ? "Mock auth is restricted to local/dev/test builds." : null,
  oidcClientId,
  oidcIssuer,
  oidcPostLogoutRedirectUri,
  oidcRedirectUri,
  oidcScope,
  oidcSilentRedirectUri
} as const;
