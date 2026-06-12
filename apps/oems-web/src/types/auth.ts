export type UserRole = "TRADER" | "OPS";
export type AuthMode = "mock" | "oidc";
export type AuthNoticeCode =
  | "AUTH_REQUIRED"
  | "AUTH_SERVER_UNAVAILABLE"
  | "SESSION_EXPIRED"
  | "SESSION_TERMINATED";

export interface UserSession {
  readonly userId: string;
  readonly displayName: string;
  readonly role: UserRole;
  readonly authMode: AuthMode;
  readonly accessToken: string | null;
  readonly expiresAtEpochSeconds: number | null;
}

export interface SignInRequest {
  readonly displayName?: string;
  readonly role?: UserRole;
  readonly returnPath?: string;
}
