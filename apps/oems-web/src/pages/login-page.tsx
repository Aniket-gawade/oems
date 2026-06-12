import { useMemo, useState, type FormEvent } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/app/providers/auth-provider";
import { runtimeConfig } from "@/config/runtime";
import { ErrorState } from "@/components/feedback/error-state";
import { LoadingOverlay } from "@/components/feedback/loading-overlay";
import { Button } from "@/components/primitives/button";
import { Input } from "@/components/primitives/input";
import { Select } from "@/components/primitives/select";
import type { AuthNoticeCode, UserRole } from "@/types/auth";

const NOTICE_MESSAGES: Record<AuthNoticeCode, string> = {
  AUTH_REQUIRED: "Sign in to continue.",
  AUTH_SERVER_UNAVAILABLE:
    "Authentication server is unavailable. Verify Keycloak at http://localhost:8081 and retry.",
  SESSION_EXPIRED: "Your session expired. Please sign in again.",
  SESSION_TERMINATED: "Your session was terminated. Sign in again to continue."
};

export const LoginPage = () => {
  const {
    authMode,
    authNotice,
    clearAuthNotice,
    isSigningIn,
    signIn,
    supportsLocalSignIn
  } = useAuth();
  const location = useLocation();

  const [displayName, setDisplayName] = useState("Trader One");
  const [role, setRole] = useState<UserRole>("TRADER");
  const [error, setError] = useState<string | null>(null);

  const returnPath = useMemo(() => {
    if (typeof location.state === "object" && location.state !== null && "from" in location.state) {
      return String(location.state.from);
    }

    return "/";
  }, [location.state]);

  const noticeMessage = authNotice ? NOTICE_MESSAGES[authNotice] : null;

  const runSignIn = async (request?: { role?: UserRole; displayName?: string }) => {
    setError(null);
    clearAuthNotice();

    try {
      await signIn({
        ...request,
        returnPath
      });
    } catch (signInError) {
      setError(signInError instanceof Error ? signInError.message : "Sign-in failed.");
    }
  };

  const handleMockSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await runSignIn({ displayName, role });
  };

  return (
    <main className="public-page">
      <section className="auth-card">
        <h1>OEMS Login</h1>
        <p>
          {authMode === "mock"
            ? "Use local mock login for fast QA and workflow testing."
            : "Sign in with Keycloak (OIDC Authorization Code + PKCE)."}
        </p>

        {noticeMessage ? <p className="auth-notice">{noticeMessage}</p> : null}
        {runtimeConfig.mockAuthBlockedReason ? <p className="auth-notice">{runtimeConfig.mockAuthBlockedReason}</p> : null}

        {supportsLocalSignIn ? (
          <form className="form-grid loading-region" onSubmit={handleMockSubmit}>
            <LoadingOverlay active={isSigningIn} message="Starting session..." />
            <Input
              autoComplete="name"
              label="Display name"
              onChange={(event) => setDisplayName(event.target.value)}
              placeholder="Your display name"
              value={displayName}
            />
            <Select
              label="Role"
              onChange={(event) => setRole(event.target.value as UserRole)}
              options={[
                { label: "Trader", value: "TRADER" },
                { label: "Ops", value: "OPS" }
              ]}
              value={role}
            />
            {error ? <p className="form-error">{error}</p> : null}
            <Button isLoading={isSigningIn} type="submit">
              Sign in
            </Button>
          </form>
        ) : (
          <div className="form-grid loading-region">
            <LoadingOverlay active={isSigningIn} message="Redirecting to Keycloak..." />
            {error ? (
              <ErrorState
                description={`${error} Check OIDC issuer: ${runtimeConfig.oidcIssuer}`}
                onRetry={() => {
                  void runSignIn();
                }}
                title="Sign-in currently unavailable"
              />
            ) : null}
            <Button
              isLoading={isSigningIn}
              onClick={() => {
                void runSignIn();
              }}
              type="button"
            >
              Sign in with Keycloak
            </Button>
            <p className="login-note">
              Redirect URI: <code>{runtimeConfig.oidcRedirectUri}</code>
            </p>
          </div>
        )}
      </section>
    </main>
  );
};
