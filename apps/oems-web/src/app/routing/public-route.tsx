import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/app/providers/auth-provider";
import { getDefaultRouteForRole } from "@/app/routes/route-registry";

interface PublicRouteProps {
  readonly children: React.ReactNode;
  readonly redirectIfAuthenticated?: boolean;
}

export const PublicRoute = ({ children, redirectIfAuthenticated = false }: PublicRouteProps) => {
  const { isAuthenticated, isAuthLoading, session } = useAuth();
  const location = useLocation();

  if (isAuthLoading && redirectIfAuthenticated) {
    return (
      <main className="public-page">
        <section className="auth-card">
          <h1>Checking session</h1>
          <p>Restoring your authenticated session...</p>
        </section>
      </main>
    );
  }

  if (redirectIfAuthenticated && isAuthenticated && session) {
    const targetPath =
      typeof location.state === "object" && location.state !== null && "from" in location.state
        ? String(location.state.from)
        : getDefaultRouteForRole(session.role);

    return <Navigate replace to={targetPath} />;
  }

  return <>{children}</>;
};
