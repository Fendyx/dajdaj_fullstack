import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, userLoaded } = useSelector((s) => s.auth);

  // Wait until we know whether the JWT was valid or not
  if (!userLoaded) {
    return <div>Loading your session…</div>;
  }

  return isAuthenticated ? children : <Navigate to="/login" />;
};

export default PrivateRoute;
