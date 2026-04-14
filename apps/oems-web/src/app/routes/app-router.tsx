import type { ReactNode } from "react";
import { createBrowserRouter, createMemoryRouter, type RouteObject } from "react-router-dom";
import { ProtectedRoute } from "@/app/routing/protected-route";
import { PublicRoute } from "@/app/routing/public-route";
import { RoleGuard } from "@/app/routing/role-guard";
import { APP_ROUTE_REGISTRY, type AppRouteMetadata } from "@/app/routes/route-registry";
import { AppShell } from "@/app/shell/app-shell";
import { PageErrorBoundary } from "@/components/feedback/page-error-boundary";

const stripLeadingSlash = (path: string): string => path.replace(/^\//, "");

const withPageBoundary = (element: ReactNode): ReactNode => <PageErrorBoundary>{element}</PageErrorBoundary>;

const buildProtectedChildRoute = (route: AppRouteMetadata): RouteObject => {
  const guardedElement = <RoleGuard allowedRoles={route.allowedRoles}>{withPageBoundary(route.element)}</RoleGuard>;
  const handle = { routeId: route.id, title: route.title };

  if (route.path === "/") {
    return {
      element: guardedElement,
      handle,
      index: true
    };
  }

  return {
    element: guardedElement,
    handle,
    path: stripLeadingSlash(route.path)
  };
};

const buildPublicRoute = (route: AppRouteMetadata): RouteObject => ({
  element: (
    <PublicRoute redirectIfAuthenticated={route.redirectIfAuthenticated}>
      {withPageBoundary(route.element)}
    </PublicRoute>
  ),
  handle: { routeId: route.id, title: route.title },
  path: route.path
});

const buildRouteObjects = (): RouteObject[] => {
  const publicRoutes = APP_ROUTE_REGISTRY.filter((route) => route.access === "public" && route.path !== "*").map(
    buildPublicRoute
  );
  const notFoundRoute = APP_ROUTE_REGISTRY.find((route) => route.path === "*");
  const protectedChildren = APP_ROUTE_REGISTRY.filter((route) => route.access === "protected" && route.useShell).map(
    buildProtectedChildRoute
  );

  const routeObjects: RouteObject[] = [
    ...publicRoutes,
    {
      children: protectedChildren,
      element: (
        <ProtectedRoute>
          <AppShell />
        </ProtectedRoute>
      ),
      path: "/"
    }
  ];

  if (notFoundRoute) {
    routeObjects.push({
      element: withPageBoundary(notFoundRoute.element),
      path: notFoundRoute.path
    });
  }

  return routeObjects;
};

export const createAppBrowserRouter = () => createBrowserRouter(buildRouteObjects());

export const createAppMemoryRouter = (initialEntries: readonly string[] = ["/"]) =>
  createMemoryRouter(buildRouteObjects(), {
    initialEntries: [...initialEntries]
  });
