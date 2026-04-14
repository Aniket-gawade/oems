import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/app/providers/auth-provider";
import type { UserRole } from "@/types/auth";

interface RoleGuardProps {
  readonly allowedRoles?: readonly UserRole[];
  readonly children: ReactNode;
}

export const RoleGuard = ({ allowedRoles, children }: RoleGuardProps) => {
  const { session } = useAuth();
  const location = useLocation();

  if (!allowedRoles || allowedRoles.length === 0) {
    return <>{children}</>;
  }

  if (!session || !allowedRoles.includes(session.role)) {
    return <Navigate replace state={{ from: location.pathname }} to="/unauthorized" />;
  }

  return <>{children}</>;
};
