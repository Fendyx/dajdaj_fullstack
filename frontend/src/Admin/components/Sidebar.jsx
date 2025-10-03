// components/Sidebar.jsx
import "./Sidebar.css";
import { FaShoppingCart, FaUsers, FaBox, FaUserShield } from "react-icons/fa";
import Button from "./ui/Button";

export default function Sidebar({ activeTab, onTabChange }) {
  const navItems = [
    { id: "orders", label: "Orders", icon: FaShoppingCart },
    { id: "users", label: "Users", icon: FaUsers },
    { id: "products", label: "Products", icon: FaBox },
    { id: "admins", label: "Admins", icon: FaUserShield },
  ];

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h2>AdminPro</h2>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Button
              key={item.id}
              variant={activeTab === item.id ? "secondary" : "ghost"}
              className="sidebar-btn"
              onClick={() => onTabChange(item.id)}
            >
              <Icon className="sidebar-icon" />
              {item.label}
            </Button>
          );
        })}
      </nav>
    </div>
  );
}
