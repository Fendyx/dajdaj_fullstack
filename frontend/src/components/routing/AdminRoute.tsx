import { Navigate, useLocation } from "react-router-dom";
import { useAppSelector } from "@/store/hooks";

interface AdminRouteProps {
  children: React.ReactNode;
}

export const AdminRoute = ({ children }: AdminRouteProps) => {
  const { token, role, userLoaded } = useAppSelector((state) => state.auth);
  const location = useLocation();

  // Ждём пока профиль загрузится, чтобы не флипать в /login раньше времени
  if (!userLoaded) return null;

  if (!token) {
    const currentPath = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?redirect=${currentPath}`} replace />;
  }

  if (role !== "admin" && role !== "superadmin") {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};