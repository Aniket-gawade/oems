import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/app/providers/auth-provider";
import { ErrorState } from "@/components/feedback/error-state";

export const AuthCallbackPage = () => {
  const { completeSignInCallback } = useAuth();
  const navigate = useNavigate();
  const [callbackError, setCallbackError] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;

    void completeSignInCallback()
      .then((targetPath) => {
        if (!isActive) {
          return;
        }

        navigate(targetPath, { replace: true });
      })
      .catch((error) => {
        if (!isActive) {
          return;
        }

        setCallbackError(error instanceof Error ? error.message : "Auth callback failed.");
      });

    return () => {
      isActive = false;
    };
  }, [completeSignInCallback, navigate]);

  return (
    <main className="public-page">
      <section className="auth-card">
        {callbackError ? (
          <>
            <ErrorState
              description={callbackError}
              onRetry={() => {
                navigate("/login", { replace: true });
              }}
              title="Authentication callback failed"
            />
            <Link className="button button--secondary" to="/login">
              Back to login
            </Link>
          </>
        ) : (
          <>
            <h1>Auth callback</h1>
            <p>Finalizing your authenticated session...</p>
          </>
        )}
      </section>
    </main>
  );
};
