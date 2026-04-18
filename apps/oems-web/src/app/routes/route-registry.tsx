import type { ReactNode } from "react";
import { AuthCallbackPage } from "@/pages/auth-callback-page";
import { AuthSilentCallbackPage } from "@/pages/auth-silent-callback-page";
import { ComponentDocsPage } from "@/pages/component-docs-page";
import { LoginPage } from "@/pages/login-page";
import { NotFoundPage } from "@/pages/not-found-page";
import { OpsAuditDetailPage } from "@/pages/ops-audit-detail-page";
import { OpsAuditSearchPage } from "@/pages/ops-audit-search-page";
import { OpsDashboardPage } from "@/pages/ops-dashboard-page";
import { OrderDetailPage } from "@/pages/order-detail-page";
import { OrderLookupPage } from "@/pages/order-lookup-page";
import { PlaceOrderPage } from "@/pages/place-order-page";
import { RoleLandingPage } from "@/pages/role-landing-page";
import { TraderDashboardPage } from "@/pages/trader-dashboard-page";
import { UnauthorizedPage } from "@/pages/unauthorized-page";
import type { UserRole } from "@/types/auth";

export type RouteAccess = "public" | "protected";

export interface AppRouteMetadata {
  readonly id: string;
  readonly path: string;
  readonly title: string;
  readonly access: RouteAccess;
  readonly allowedRoles?: readonly UserRole[];
  readonly navLabel?: string;
  readonly navOrder?: number;
  readonly useShell?: boolean;
  readonly redirectIfAuthenticated?: boolean;
  readonly element: ReactNode;
}

export const APP_ROUTE_REGISTRY: readonly AppRouteMetadata[] = [
  {
    access: "public",
    element: <LoginPage />,
    id: "login",
    path: "/login",
    redirectIfAuthenticated: true,
    title: "Login"
  },
  {
    access: "public",
    element: <AuthCallbackPage />,
    id: "auth-callback",
    path: "/auth/callback",
    redirectIfAuthenticated: true,
    title: "Auth Callback"
  },
  {
    access: "public",
    element: <AuthSilentCallbackPage />,
    id: "auth-silent-callback",
    path: "/auth/silent-callback",
    title: "Auth Silent Callback"
  },
  {
    access: "protected",
    allowedRoles: ["TRADER", "OPS"],
    element: <RoleLandingPage />,
    id: "role-landing",
    path: "/",
    title: "Landing",
    useShell: true
  },
  {
    access: "protected",
    allowedRoles: ["TRADER"],
    element: <TraderDashboardPage />,
    id: "trader-dashboard",
    navLabel: "Trader Dashboard",
    navOrder: 10,
    path: "/trader",
    title: "Trader Dashboard",
    useShell: true
  },
  {
    access: "protected",
    allowedRoles: ["TRADER"],
    element: <PlaceOrderPage />,
    id: "place-order",
    navLabel: "Place Order",
    navOrder: 20,
    path: "/trader/place-order",
    title: "Place Order",
    useShell: true
  },
  {
    access: "protected",
    allowedRoles: ["TRADER", "OPS"],
    element: <OrderLookupPage />,
    id: "order-lookup",
    navLabel: "Order Lookup",
    navOrder: 30,
    path: "/orders/lookup",
    title: "Order Lookup",
    useShell: true
  },
  {
    access: "protected",
    allowedRoles: ["TRADER", "OPS"],
    element: <OrderDetailPage />,
    id: "order-detail",
    path: "/orders/:orderId",
    title: "Order Detail",
    useShell: true
  },
  {
    access: "protected",
    allowedRoles: ["OPS"],
    element: <OpsDashboardPage />,
    id: "ops-dashboard",
    navLabel: "Ops Dashboard",
    navOrder: 40,
    path: "/ops",
    title: "Ops Dashboard",
    useShell: true
  },
  {
    access: "protected",
    allowedRoles: ["OPS"],
    element: <OpsAuditSearchPage />,
    id: "ops-audit-search",
    navLabel: "Ops Audit",
    navOrder: 50,
    path: "/ops/audit",
    title: "Ops Audit Search",
    useShell: true
  },
  {
    access: "protected",
    allowedRoles: ["OPS"],
    element: <OpsAuditDetailPage />,
    id: "ops-audit-detail",
    path: "/ops/audit/:orderId",
    title: "Ops Audit Detail",
    useShell: true
  },
  {
    access: "protected",
    allowedRoles: ["TRADER", "OPS"],
    element: <ComponentDocsPage />,
    id: "component-docs",
    navLabel: "Component Docs",
    navOrder: 90,
    path: "/component-docs",
    title: "Component Docs",
    useShell: true
  },
  {
    access: "protected",
    allowedRoles: ["TRADER", "OPS"],
    element: <UnauthorizedPage />,
    id: "unauthorized",
    path: "/unauthorized",
    title: "Unauthorized",
    useShell: true
  },
  {
    access: "public",
    element: <NotFoundPage />,
    id: "not-found",
    path: "*",
    title: "Not Found"
  }
];

export const getDefaultRouteForRole = (role: UserRole): string => (role === "OPS" ? "/ops" : "/trader");

export const getNavigationRoutes = (role: UserRole): readonly AppRouteMetadata[] =>
  APP_ROUTE_REGISTRY.filter(
    (route) =>
      route.access === "protected" &&
      Boolean(route.navLabel) &&
      Boolean(route.allowedRoles?.includes(role))
  )
    .slice()
    .sort((leftRoute, rightRoute) => (leftRoute.navOrder ?? 0) - (rightRoute.navOrder ?? 0));
