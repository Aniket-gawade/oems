/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode
} from "react";
import type { User as OidcUser } from "oidc-client-ts";
import { getOidcUserManager } from "@/app/providers/oidc-manager";
import { runtimeConfig } from "@/config/runtime";
import { emitAuthTelemetry } from "@/lib/auth-telemetry";
import { parseJwtPayload } from "@/lib/jwt";
import type { AuthMode, AuthNoticeCode, SignInRequest, UserRole, UserSession } from "@/types/auth";

interface AuthContextValue {
  readonly authMode: AuthMode;
  readonly authNotice: AuthNoticeCode | null;
  readonly clearAuthNotice: () => void;
  readonly completeSignInCallback: () => Promise<string>;
  readonly completeSilentSignInCallback: () => Promise<void>;
  readonly getAccessToken: () => string | null;
  readonly handleApiAuthFailure: (status: number) => void;
  readonly isAuthenticated: boolean;
  readonly isAuthLoading: boolean;
  readonly isSigningIn: boolean;
  readonly session: UserSession | null;
  readonly signIn: (request?: SignInRequest) => Promise<void>;
  readonly signOut: () => Promise<void>;
  readonly supportsLocalSignIn: boolean;
}

const MOCK_SESSION_STORAGE_KEY = "oems-web-mock-session";
const AUTH_NOTICE_STORAGE_KEY = "oems-web-auth-notice";

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const getDefaultRouteForRole = (role: UserRole): string => (role === "OPS" ? "/ops" : "/trader");

const toStringClaim = (claimValue: unknown): string | null =>
  typeof claimValue === "string" && claimValue.trim().length > 0 ? claimValue : null;

const extractRealmRoles = (claims: Record<string, unknown>): readonly string[] => {
  const realmAccessClaim = claims.realm_access;
  if (typeof realmAccessClaim === "object" && realmAccessClaim !== null && "roles" in realmAccessClaim) {
    const rolesClaim = (realmAccessClaim as { roles?: unknown }).roles;
    if (Array.isArray(rolesClaim)) {
      return rolesClaim.filter((role): role is string => typeof role === "string");
    }
  }

  const topLevelRoles = claims.roles;
  if (Array.isArray(topLevelRoles)) {
    return topLevelRoles.filter((role): role is string => typeof role === "string");
  }

  return [];
};

const resolveRole = (roles: readonly string[]): UserRole | null => {
  if (roles.includes("OPS")) {
    return "OPS";
  }

  if (roles.includes("TRADER")) {
    return "TRADER";
  }

  return null;
};

const toMockSession = (request?: SignInRequest): UserSession => {
  const role = request?.role ?? "TRADER";
  const displayName = request?.displayName?.trim() || (role === "OPS" ? "Ops One" : "Trader One");

  return {
    accessToken: null,
    authMode: "mock",
    displayName,
    expiresAtEpochSeconds: null,
    role,
    userId: `mock-${role.toLowerCase()}`
  };
};

const toOidcSession = (oidcUser: OidcUser): UserSession | null => {
  if (!oidcUser.access_token) {
    return null;
  }

  const tokenClaims = parseJwtPayload(oidcUser.access_token) ?? {};
  const profileClaims = oidcUser.profile as Record<string, unknown>;
  const claims = { ...tokenClaims, ...profileClaims };

  const role = resolveRole(extractRealmRoles(claims));
  if (!role) {
    return null;
  }

  const userId =
    toStringClaim(claims.preferred_username) ?? toStringClaim(claims.sub) ?? `oidc-${role.toLowerCase()}`;
  const displayName = toStringClaim(claims.preferred_username) ?? toStringClaim(claims.name) ?? userId;

  return {
    accessToken: oidcUser.access_token,
    authMode: "oidc",
    displayName,
    expiresAtEpochSeconds: oidcUser.expires_at ?? null,
    role,
    userId
  };
};

const readAuthNotice = (): AuthNoticeCode | null => {
  const notice = window.sessionStorage.getItem(AUTH_NOTICE_STORAGE_KEY);
  if (
    notice === "AUTH_REQUIRED" ||
    notice === "AUTH_SERVER_UNAVAILABLE" ||
    notice === "SESSION_EXPIRED" ||
    notice === "SESSION_TERMINATED"
  ) {
    return notice;
  }

  return null;
};

const readStoredMockSession = (): UserSession | null => {
  if (runtimeConfig.authMode !== "mock") {
    return null;
  }

  try {
    const rawValue = window.sessionStorage.getItem(MOCK_SESSION_STORAGE_KEY);
    if (!rawValue) {
      return null;
    }

    const parsedValue = JSON.parse(rawValue) as Partial<UserSession>;
    if (!parsedValue.displayName || !parsedValue.role || !parsedValue.userId) {
      return null;
    }

    return {
      accessToken: null,
      authMode: "mock",
      displayName: parsedValue.displayName,
      expiresAtEpochSeconds: null,
      role: parsedValue.role,
      userId: parsedValue.userId
    };
  } catch {
    return null;
  }
};

const getFailureDetail = (error: unknown): string => {
  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message;
  }

  return "unknown_error";
};

const isAuthServerUnavailableError = (error: unknown): boolean => {
  const message = getFailureDetail(error).toLowerCase();
  return (
    message.includes("failed to fetch") ||
    message.includes("networkerror") ||
    message.includes("econnrefused") ||
    message.includes("fetch")
  );
};

const toCallbackTargetPath = (callbackState: unknown, session: UserSession): string => {
  if (typeof callbackState === "object" && callbackState !== null && "returnPath" in callbackState) {
    const returnPath = (callbackState as { returnPath?: unknown }).returnPath;
    if (typeof returnPath === "string" && returnPath.startsWith("/")) {
      return returnPath;
    }
  }

  return getDefaultRouteForRole(session.role);
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<UserSession | null>(() => readStoredMockSession());
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(runtimeConfig.authMode === "oidc");
  const [authNotice, setAuthNotice] = useState<AuthNoticeCode | null>(() => readAuthNotice());
  const signInCallbackPromiseRef = useRef<Promise<string> | null>(null);
  const silentSignInCallbackPromiseRef = useRef<Promise<void> | null>(null);

  const clearAuthNotice = useCallback(() => {
    setAuthNotice(null);
    window.sessionStorage.removeItem(AUTH_NOTICE_STORAGE_KEY);
  }, []);

  const persistAuthNotice = useCallback((notice: AuthNoticeCode) => {
    setAuthNotice(notice);
    window.sessionStorage.setItem(AUTH_NOTICE_STORAGE_KEY, notice);
  }, []);

  const clearStoredSession = useCallback(() => {
    setSession(null);
    window.sessionStorage.removeItem(MOCK_SESSION_STORAGE_KEY);
  }, []);

  useEffect(() => {
    if (runtimeConfig.authMode !== "oidc") {
      setIsAuthLoading(false);
      return;
    }

    const userManager = getOidcUserManager();
    let isMounted = true;

    const loadInitialUser = async () => {
      try {
        const existingUser = await userManager.getUser();
        if (!isMounted) {
          return;
        }

        if (existingUser && !existingUser.expired) {
          const existingSession = toOidcSession(existingUser);
          if (existingSession) {
            setSession(existingSession);
          } else {
            persistAuthNotice("AUTH_REQUIRED");
            void userManager.removeUser();
          }
        } else if (existingUser?.expired) {
          persistAuthNotice("SESSION_EXPIRED");
          void userManager.removeUser();
        }
      } catch (error) {
        persistAuthNotice("AUTH_SERVER_UNAVAILABLE");
        emitAuthTelemetry("auth_login_failed", {
          authMode: runtimeConfig.authMode,
          detail: getFailureDetail(error)
        });
      } finally {
        if (isMounted) {
          setIsAuthLoading(false);
        }
      }
    };

    const onUserLoaded = (oidcUser: OidcUser) => {
      const loadedSession = toOidcSession(oidcUser);
      if (loadedSession) {
        clearAuthNotice();
        setSession(loadedSession);
      }
    };

    const onUserUnloaded = () => {
      setSession(null);
    };

    const onAccessTokenExpired = () => {
      clearStoredSession();
      persistAuthNotice("SESSION_EXPIRED");
      emitAuthTelemetry("auth_session_expired", { authMode: runtimeConfig.authMode });
      void userManager.removeUser();
    };

    const onAccessTokenExpiring = () => {
      void userManager
        .signinSilent()
        .then((renewedUser) => {
          if (!renewedUser) {
            persistAuthNotice("SESSION_EXPIRED");
            return;
          }

          const renewedSession = toOidcSession(renewedUser);
          if (renewedSession) {
            setSession(renewedSession);
            emitAuthTelemetry("auth_silent_renew_succeeded", {
              authMode: runtimeConfig.authMode,
              role: renewedSession.role
            });
          }
        })
        .catch((error) => {
          emitAuthTelemetry("auth_silent_renew_failed", {
            authMode: runtimeConfig.authMode,
            detail: getFailureDetail(error)
          });
          persistAuthNotice(isAuthServerUnavailableError(error) ? "AUTH_SERVER_UNAVAILABLE" : "SESSION_EXPIRED");
        });
    };

    const onSilentRenewError = (error: Error) => {
      persistAuthNotice(isAuthServerUnavailableError(error) ? "AUTH_SERVER_UNAVAILABLE" : "SESSION_EXPIRED");
      emitAuthTelemetry("auth_silent_renew_failed", {
        authMode: runtimeConfig.authMode,
        detail: getFailureDetail(error)
      });
    };

    userManager.events.addUserLoaded(onUserLoaded);
    userManager.events.addUserUnloaded(onUserUnloaded);
    userManager.events.addAccessTokenExpired(onAccessTokenExpired);
    userManager.events.addAccessTokenExpiring(onAccessTokenExpiring);
    userManager.events.addSilentRenewError(onSilentRenewError);

    void loadInitialUser();

    return () => {
      isMounted = false;
      userManager.events.removeUserLoaded(onUserLoaded);
      userManager.events.removeUserUnloaded(onUserUnloaded);
      userManager.events.removeAccessTokenExpired(onAccessTokenExpired);
      userManager.events.removeAccessTokenExpiring(onAccessTokenExpiring);
      userManager.events.removeSilentRenewError(onSilentRenewError);
    };
  }, [clearAuthNotice, clearStoredSession, persistAuthNotice]);

  const signIn = useCallback(
    async (request?: SignInRequest) => {
      clearAuthNotice();
      setIsSigningIn(true);

      if (runtimeConfig.authMode === "mock") {
        await new Promise((resolve) => {
          window.setTimeout(resolve, 180);
        });

        const nextSession = toMockSession(request);
        setSession(nextSession);
        window.sessionStorage.setItem(MOCK_SESSION_STORAGE_KEY, JSON.stringify(nextSession));
        emitAuthTelemetry("auth_login_succeeded", { authMode: runtimeConfig.authMode, role: nextSession.role });
        setIsSigningIn(false);
        return;
      }

      const userManager = getOidcUserManager();
      try {
        emitAuthTelemetry("auth_login_initiated", { authMode: runtimeConfig.authMode });
        await userManager.signinRedirect({
          state: {
            returnPath: request?.returnPath ?? "/"
          }
        });
      } catch (error) {
        const detail = getFailureDetail(error);
        emitAuthTelemetry("auth_login_failed", { authMode: runtimeConfig.authMode, detail });
        persistAuthNotice(isAuthServerUnavailableError(error) ? "AUTH_SERVER_UNAVAILABLE" : "AUTH_REQUIRED");
        throw new Error(
          isAuthServerUnavailableError(error)
            ? "Unable to reach the authentication server. Verify Keycloak availability and retry."
            : "Unable to initiate sign-in. Please retry."
        );
      } finally {
        setIsSigningIn(false);
      }
    },
    [clearAuthNotice, persistAuthNotice]
  );

  const completeSignInCallback = useCallback(async (): Promise<string> => {
    if (runtimeConfig.authMode === "mock") {
      const callbackSession = toMockSession({ role: "TRADER" });
      setSession(callbackSession);
      window.sessionStorage.setItem(MOCK_SESSION_STORAGE_KEY, JSON.stringify(callbackSession));
      return getDefaultRouteForRole(callbackSession.role);
    }

    if (signInCallbackPromiseRef.current) {
      return signInCallbackPromiseRef.current;
    }

    const userManager = getOidcUserManager();
    const callbackPromise = (async (): Promise<string> => {
      setIsSigningIn(true);

      try {
        const callbackUser = await userManager.signinRedirectCallback();
        const callbackSession = toOidcSession(callbackUser);
        if (!callbackSession) {
          persistAuthNotice("AUTH_REQUIRED");
          throw new Error("Authenticated user is missing required role claims.");
        }

        clearAuthNotice();
        setSession(callbackSession);
        emitAuthTelemetry("auth_login_succeeded", { authMode: runtimeConfig.authMode, role: callbackSession.role });
        return toCallbackTargetPath(callbackUser.state, callbackSession);
      } catch (error) {
        const detail = getFailureDetail(error);
        emitAuthTelemetry("auth_login_failed", { authMode: runtimeConfig.authMode, detail });
        persistAuthNotice(isAuthServerUnavailableError(error) ? "AUTH_SERVER_UNAVAILABLE" : "AUTH_REQUIRED");
        throw new Error(
          isAuthServerUnavailableError(error)
            ? "Authentication callback failed because Keycloak is unavailable."
            : "Authentication callback failed. Please start sign-in again."
        );
      } finally {
        setIsSigningIn(false);
      }
    })();

    signInCallbackPromiseRef.current = callbackPromise;

    try {
      return await callbackPromise;
    } finally {
      signInCallbackPromiseRef.current = null;
    }
  }, [clearAuthNotice, persistAuthNotice]);

  const completeSilentSignInCallback = useCallback(async () => {
    if (runtimeConfig.authMode !== "oidc") {
      return;
    }

    if (silentSignInCallbackPromiseRef.current) {
      return silentSignInCallbackPromiseRef.current;
    }

    const userManager = getOidcUserManager();
    const callbackPromise = userManager.signinSilentCallback();
    silentSignInCallbackPromiseRef.current = callbackPromise;

    try {
      await callbackPromise;
    } finally {
      silentSignInCallbackPromiseRef.current = null;
    }
  }, []);

  const signOut = useCallback(async () => {
    setIsSigningIn(true);
    clearStoredSession();

    if (runtimeConfig.authMode === "mock") {
      emitAuthTelemetry("auth_logout", { authMode: runtimeConfig.authMode });
      setIsSigningIn(false);
      return;
    }

    const userManager = getOidcUserManager();
    try {
      const currentUser = await userManager.getUser();
      await userManager.removeUser();
      emitAuthTelemetry("auth_logout", { authMode: runtimeConfig.authMode });
      await userManager.signoutRedirect({
        id_token_hint: currentUser?.id_token
      });
    } catch (error) {
      persistAuthNotice(isAuthServerUnavailableError(error) ? "AUTH_SERVER_UNAVAILABLE" : "SESSION_TERMINATED");
      setIsSigningIn(false);
      throw error;
    }

    setIsSigningIn(false);
  }, [clearStoredSession, persistAuthNotice]);

  const handleApiAuthFailure = useCallback(
    (status: number) => {
      if (status !== 401) {
        return;
      }

      clearStoredSession();
      persistAuthNotice("SESSION_EXPIRED");
      emitAuthTelemetry("auth_session_expired", { authMode: runtimeConfig.authMode });

      if (runtimeConfig.authMode === "oidc") {
        const userManager = getOidcUserManager();
        void userManager.removeUser();
      }
    },
    [clearStoredSession, persistAuthNotice]
  );

  const getAccessToken = useCallback(() => session?.accessToken ?? null, [session]);

  const value = useMemo<AuthContextValue>(
    () => ({
      authMode: runtimeConfig.authMode,
      authNotice,
      clearAuthNotice,
      completeSignInCallback,
      completeSilentSignInCallback,
      getAccessToken,
      handleApiAuthFailure,
      isAuthenticated: Boolean(session),
      isAuthLoading,
      isSigningIn,
      session,
      signIn,
      signOut,
      supportsLocalSignIn: runtimeConfig.enableMockAuth
    }),
    [
      authNotice,
      clearAuthNotice,
      completeSignInCallback,
      completeSilentSignInCallback,
      getAccessToken,
      handleApiAuthFailure,
      isAuthLoading,
      isSigningIn,
      session,
      signIn,
      signOut
    ]
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
