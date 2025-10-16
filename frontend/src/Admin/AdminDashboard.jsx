import { useState } from "react";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import OrdersPage from "./components/OrdersPage";
import UsersPage from "./components/UsersPage";
import ProductsPage from "./components/ProductsPage";
import AdminsPage from "./components/AdminsPage";
import "./AdminDashboard.css";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

export default function AdminDashboard() {
  const { role } = useSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState("orders"); // 👈 перемещено выше

  if (role !== "superadmin" && role !== "admin") {
    return <Navigate to="/" replace />;
  }
  

  const renderContent = () => {
    switch (activeTab) {
      case "orders":
        return <OrdersPage />;
      case "users":
        return <UsersPage />;
      case "products":
        return <ProductsPage />;
      case "admins":
        return <AdminsPage />;
      default:
        return <OrdersPage />;
    }
  };

  return (
    <div className="admin-dashboard">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <div className="main-content">
        <Header />
        <main className="content-area">{renderContent()}</main>
      </div>
    </div>
  );
}
