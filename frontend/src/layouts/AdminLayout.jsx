import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import AdminDashboard from "../Admin/AdminDashboard";

export default function AdminLayout() {
  const { role, userLoaded } = useSelector((state) => state.auth);

  if (!userLoaded) return <p>Загрузка профиля...</p>;
  if (role !== "superadmin" && role !== "admin") {
    return <Navigate to="/" replace />;
  }
  

  return (
    <div className="admin-wrapper">
      <AdminDashboard />
    </div>
  );
}
