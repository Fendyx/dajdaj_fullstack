// AdminDashboard.jsx
import { useState } from "react";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import OrdersPage from "./components/OrdersPage";
import UsersPage from "./components/UsersPage";
import ProductsPage from "./components/ProductsPage";
import AdminsPage from "./components/AdminsPage";
import "./AdminDashboard.css";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("orders");

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
