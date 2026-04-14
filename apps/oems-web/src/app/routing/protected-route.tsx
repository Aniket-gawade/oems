import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/app/providers/auth-provider";

export const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate replace state={{ from: `${location.pathname}${location.search}` }} to="/login" />;
  }

  return <>{children}</>;
};
