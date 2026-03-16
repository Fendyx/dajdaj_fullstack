import { Outlet } from "react-router-dom";
import { AdminSidebar } from "@/features/admin/sidebar/AdminSidebar";
import "./AdminLayout.css";

export function AdminLayout() {
  return (
    <div className="admin-layout">
      <AdminSidebar />
      <main className="admin-content">
        <Outlet />
      </main>
    </div>
  );
}