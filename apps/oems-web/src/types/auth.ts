export type UserRole = "TRADER" | "OPS";

export interface UserSession {
  readonly userId: string;
  readonly displayName: string;
  readonly role: UserRole;
}

export interface SignInRequest {
  readonly displayName: string;
  readonly role: UserRole;
}
