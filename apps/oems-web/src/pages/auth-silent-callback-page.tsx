import { useEffect } from "react";
import { useAuth } from "@/app/providers/auth-provider";

export const AuthSilentCallbackPage = () => {
  const { completeSilentSignInCallback } = useAuth();

  useEffect(() => {
    void completeSilentSignInCallback().catch(() => {
      // Silent renew failures are captured by auth provider telemetry/event handlers.
    });
  }, [completeSilentSignInCallback]);

  return (
    <main className="public-page">
      <section className="auth-card">
        <h1>Silent callback</h1>
        <p>Refreshing session...</p>
      </section>
    </main>
  );
};
