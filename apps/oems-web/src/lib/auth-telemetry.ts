import { runtimeConfig } from "@/config/runtime";

type AuthTelemetryEventName =
  | "auth_login_initiated"
  | "auth_login_succeeded"
  | "auth_login_failed"
  | "auth_logout"
  | "auth_session_expired"
  | "auth_silent_renew_succeeded"
  | "auth_silent_renew_failed";

interface AuthTelemetryPayload {
  readonly authMode: "mock" | "oidc";
  readonly detail?: string;
  readonly role?: "TRADER" | "OPS";
}

export const emitAuthTelemetry = (eventName: AuthTelemetryEventName, payload: AuthTelemetryPayload): void => {
  if (!runtimeConfig.enableMockAuthTelemetry) {
    return;
  }

  console.info("[oems-auth-telemetry]", {
    appEnv: runtimeConfig.appEnv,
    eventName,
    ...payload,
    recordedAt: new Date().toISOString()
  });
};
