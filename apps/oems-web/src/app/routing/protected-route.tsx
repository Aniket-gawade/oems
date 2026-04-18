import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/app/providers/auth-provider";

export const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated, isAuthLoading } = useAuth();
  const location = useLocation();

  if (isAuthLoading) {
    return (
      <main className="public-page">
        <section className="auth-card">
          <h1>Checking session</h1>
          <p>Restoring your authenticated session...</p>
        </section>
      </main>
    );
  }

  if (!isAuthenticated) {
    return <Navigate replace state={{ from: `${location.pathname}${location.search}` }} to="/login" />;
  }

  return <>{children}</>;
};
