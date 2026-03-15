import { Navigate, useLocation } from "react-router-dom";
import { useAppSelector } from "@/store/hooks";

interface PrivateRouteProps {
  children: React.ReactNode;
}

export const PrivateRoute = ({ children }: PrivateRouteProps) => {
  const { token } = useAppSelector((state) => state.auth);
  const location = useLocation();

  // Оставляем твои логи, но прячем их в режиме production, чтобы не мусорить в консоли реальных юзеров
  if (import.meta.env.MODE === "development") {
    console.groupCollapsed("🔐 [PrivateRoute]");
    console.log("📍 Current route:", location.pathname);
    console.log("🔑 token:", token ? "Present" : "Missing");
    console.groupEnd();
  }

  if (!token) {
    console.warn("🚫 [PrivateRoute] No token — redirecting to /login");
    // Магия редиректа: сохраняем путь, куда хотел попасть юзер
    const currentPath = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?redirect=${currentPath}`} replace />;
  }

  // Если токен есть — просто рендерим дочерние элементы
  return <>{children}</>;
};