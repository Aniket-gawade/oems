import { useMemo, useState, type FormEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/app/providers/auth-provider";
import { useNotifications } from "@/app/providers/notification-provider";
import { getDefaultRouteForRole } from "@/app/routes/route-registry";
import { LoadingOverlay } from "@/components/feedback/loading-overlay";
import { Button } from "@/components/primitives/button";
import { Input } from "@/components/primitives/input";
import { Select } from "@/components/primitives/select";

export const LoginPage = () => {
  const { isSigningIn, signIn, supportsLocalSignIn } = useAuth();
  const { notify } = useNotifications();
  const navigate = useNavigate();
  const location = useLocation();

  const [displayName, setDisplayName] = useState("Trader One");
  const [role, setRole] = useState<"TRADER" | "OPS">("TRADER");
  const [error, setError] = useState<string | null>(null);

  const redirectTo = useMemo(() => {
    if (typeof location.state === "object" && location.state && "from" in location.state) {
      return String(location.state.from);
    }

    return getDefaultRouteForRole(role);
  }, [location.state, role]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    try {
      await signIn({ displayName, role });
      notify({
        message: `Signed in as ${displayName} (${role}).`,
        severity: "success",
        title: "Signed in"
      });
      navigate(redirectTo, { replace: true });
    } catch (signInError) {
      setError(signInError instanceof Error ? signInError.message : "Sign-in failed");
      notify({
        message: "Unable to start session.",
        severity: "error",
        title: "Sign-in failed"
      });
    }
  };

  return (
    <main className="public-page">
      <section className="auth-card">
        <h1>OEMS Login</h1>
        <p>Use local mock login for Phase C shell and routing validation.</p>

        {!supportsLocalSignIn ? (
          <p className="login-note">
            Set <code>VITE_ENABLE_MOCK_AUTH=true</code> in <code>apps/oems-web/.env</code> to enable local sign-in
            until OIDC integration is completed in Phase D.
          </p>
        ) : (
          <form className="form-grid loading-region" onSubmit={handleSubmit}>
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
              onChange={(event) => setRole(event.target.value as "TRADER" | "OPS")}
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
        )}
      </section>
    </main>
  );
};
