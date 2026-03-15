import { LogOut } from "lucide-react"; // 🔥 Используем Lucide для иконки
import { useTranslation } from "react-i18next";

// 1. Описываем, что именно мы ждем в пропсах
interface ProfileGreetingProps {
  onLogout: () => void;
}

// 2. Указываем этот интерфейс в компоненте
export const ProfileGreeting = ({ onLogout }: ProfileGreetingProps) => {
  const { t } = useTranslation();

  return (
    <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          {t("profile.greeting", "Welcome back!")}
        </h1>
        <p className="text-gray-500">
          {t("profile.subtitle", "Manage your orders and profile data here.")}
        </p>
      </div>

      <button
        onClick={onLogout}
        className="flex items-center gap-2 text-red-500 font-semibold hover:bg-red-50 px-4 py-2 rounded-lg transition-colors"
      >
        <LogOut size={18} />
        <span>{t("profile.logout", "Logout")}</span>
      </button>
    </div>
  );
};