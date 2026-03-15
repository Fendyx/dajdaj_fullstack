import { useTranslation } from "react-i18next";
import { Package, Heart, Ticket, Settings } from "lucide-react";
import "./ProfileTabs.css";

interface ProfileTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function ProfileTabs({ activeTab, onTabChange }: ProfileTabsProps) {
  const { t } = useTranslation();

  const tabs = [
    { id: "orders",    label: t("userProfile.orders"),   icon: Package  },
    { id: "favorites", label: t("userProfile.favorites"), icon: Heart    },
    { id: "discounts", label: t("userProfile.discounts"), icon: Ticket   },
    { id: "settings",  label: t("userProfile.settings", "Settings"), icon: Settings },
  ];

  return (
    <div className="up-tabs-header">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        return (
          <button
            key={tab.id}
            className={`up-tab-btn ${activeTab === tab.id ? "active" : ""}`}
            onClick={() => onTabChange(tab.id)}
          >
            <Icon className="tab-icon" size={18} strokeWidth={2} />
            <span className="tab-label">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}