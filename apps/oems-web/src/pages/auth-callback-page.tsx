import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/app/providers/auth-provider";
import { useNotifications } from "@/app/providers/notification-provider";

export const AuthCallbackPage = () => {
  const { signIn, supportsLocalSignIn } = useAuth();
  const { notify } = useNotifications();
  const navigate = useNavigate();
  const didRunRef = useRef(false);

  useEffect(() => {
    if (didRunRef.current) {
      return;
    }

    didRunRef.current = true;

    if (!supportsLocalSignIn) {
      return;
    }

    void signIn({ displayName: "Callback User", role: "TRADER" })
      .then(() => {
        notify({
          message: "Callback completed using local mock auth mode.",
          severity: "info",
          title: "Auth callback"
        });
        navigate("/", { replace: true });
      })
      .catch(() => {
        notify({
          message: "Unable to complete callback.",
          severity: "error",
          title: "Auth callback failed"
        });
      });
  }, [navigate, notify, signIn, supportsLocalSignIn]);

  return (
    <main className="public-page">
      <section className="auth-card">
        <h1>Auth callback</h1>
        <p>Finalizing session...</p>
      </section>
    </main>
  );
};
