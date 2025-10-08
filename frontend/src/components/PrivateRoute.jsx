import { useSelector } from "react-redux";
import { Navigate, useLocation } from "react-router-dom";

const PrivateRoute = ({ children }) => {
  const { token } = useSelector((state) => state.auth);
  const location = useLocation();

  console.groupCollapsed("🔐 [PrivateRoute]");
  console.log("📍 Current route:", location.pathname);
  console.log("🔑 token:", token);
  console.groupEnd();

  if (!token) {
    console.warn("🚫 [PrivateRoute] No token — redirecting to /login");
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default PrivateRoute;
