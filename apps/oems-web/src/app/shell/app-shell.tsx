import { NavLink, Outlet, useMatches, useNavigate } from "react-router-dom";
import { useAuth } from "@/app/providers/auth-provider";
import { useNotifications } from "@/app/providers/notification-provider";
import { getNavigationRoutes } from "@/app/routes/route-registry";

interface MatchHandle {
  readonly title?: string;
}

const isMatchHandle = (handle: unknown): handle is MatchHandle =>
  typeof handle === "object" && handle !== null && "title" in handle;

export const AppShell = () => {
  const { session, signOut } = useAuth();
  const { notify } = useNotifications();
  const navigate = useNavigate();
  const matches = useMatches();
  const routeTitle = [...matches]
    .reverse()
    .map((match) => (isMatchHandle(match.handle) ? match.handle.title : undefined))
    .find(Boolean);

  const navRoutes = session ? getNavigationRoutes(session.role) : [];

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <header className="app-header">
        <div className="app-header__brand">
          <p className="app-header__kicker">OEMS</p>
          <p className="app-header__title">Phase 2 Shell</p>
        </div>
        <div className="app-header__user">
          {session ? (
            <p className="user-chip">
              <span className="user-chip__name">{session.displayName}</span>
              <span className="user-chip__role">{session.role}</span>
            </p>
          ) : null}
          <button
            className="button button--ghost"
            onClick={() => {
              signOut();
              notify({
                message: "Session cleared.",
                severity: "info",
                title: "Signed out"
              });
              navigate("/login", { replace: true });
            }}
            type="button"
          >
            Sign out
          </button>
        </div>
      </header>

      <div className="app-body">
        <nav aria-label="Main navigation" className="app-nav">
          <ul>
            {navRoutes.map((route) => (
              <li key={route.id}>
                <NavLink className={({ isActive }) => (isActive ? "nav-link nav-link--active" : "nav-link")} to={route.path}>
                  {route.navLabel}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
        <main className="app-content" id="main-content" tabIndex={-1}>
          {routeTitle ? <p className="page-context">{routeTitle}</p> : null}
          <Outlet />
        </main>
      </div>
    </div>
  );
};
