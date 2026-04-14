/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode
} from "react";
import { runtimeConfig } from "@/config/runtime";
import type { SignInRequest, UserSession } from "@/types/auth";

interface AuthContextValue {
  readonly isAuthenticated: boolean;
  readonly isSigningIn: boolean;
  readonly session: UserSession | null;
  readonly supportsLocalSignIn: boolean;
  readonly signIn: (request: SignInRequest) => Promise<void>;
  readonly signOut: () => void;
}

const MOCK_SESSION_STORAGE_KEY = "oems-web-mock-session";

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const toMockSession = (request: SignInRequest): UserSession => ({
  displayName: request.displayName.trim() || "OEMS User",
  role: request.role,
  userId: `mock-${request.role.toLowerCase()}`
});

const readStoredSession = (): UserSession | null => {
  if (!runtimeConfig.enableMockAuth) {
    return null;
  }

  try {
    const rawValue = window.sessionStorage.getItem(MOCK_SESSION_STORAGE_KEY);
    if (!rawValue) {
      return null;
    }

    const parsedValue = JSON.parse(rawValue) as UserSession;
    if (!parsedValue.displayName || !parsedValue.role || !parsedValue.userId) {
      return null;
    }

    return parsedValue;
  } catch {
    return null;
  }
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<UserSession | null>(() => readStoredSession());
  const [isSigningIn, setIsSigningIn] = useState(false);

  const signOut = useCallback(() => {
    setSession(null);
    window.sessionStorage.removeItem(MOCK_SESSION_STORAGE_KEY);
  }, []);

  const signIn = useCallback(async (request: SignInRequest) => {
    if (!runtimeConfig.enableMockAuth) {
      throw new Error("OIDC login is not enabled yet. Set VITE_ENABLE_MOCK_AUTH=true for local login.");
    }

    setIsSigningIn(true);
    await new Promise((resolve) => {
      window.setTimeout(resolve, 300);
    });

    const nextSession = toMockSession(request);
    setSession(nextSession);
    window.sessionStorage.setItem(MOCK_SESSION_STORAGE_KEY, JSON.stringify(nextSession));
    setIsSigningIn(false);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      isAuthenticated: Boolean(session),
      isSigningIn,
      session,
      signIn,
      signOut,
      supportsLocalSignIn: runtimeConfig.enableMockAuth
    }),
    [isSigningIn, session, signIn, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
};
