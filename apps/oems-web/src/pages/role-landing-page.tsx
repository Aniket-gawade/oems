import { Navigate } from "react-router-dom";
import { useAuth } from "@/app/providers/auth-provider";
import { getDefaultRouteForRole } from "@/app/routes/route-registry";

export const RoleLandingPage = () => {
  const { session } = useAuth();

  if (!session) {
    return <Navigate replace to="/login" />;
  }

  return <Navigate replace to={getDefaultRouteForRole(session.role)} />;
};
