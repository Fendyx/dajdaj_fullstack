import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { useGetUserProfileQuery } from "@/services/userApi";
import { logoutUser } from "@/features/auth/authSlice";
import { ProfileGreeting } from "@/features/profile/components/ProfileGreeting/ProfileGreeting";
import { CardGallery } from "@/features/profile/components/CardGallery/CardGallery";
import { ProfileTabs } from "@/features/profile/components/Tabs/ProfileTabs";
import { OrdersTab } from "@/features/profile/components/Tabs/OrdersTab/OrdersTab";
import { FavoritesTab } from "@/features/profile/components/Tabs/FavoritesTab/FavoritesTab";
import { DiscountsTab } from "@/features/profile/components/Tabs/DiscountsTab/DiscountsTab";
import { SettingsTab } from "@/features/profile/components/Tabs/SettingsTab/SettingsTab";
import { EditProfileModal } from "@/features/profile/components/EditProfileModal/EditProfileModal";
import { CreateNewProfileModal } from "@/features/profile/components/CreateNewProfileModal/CreateNewProfileModal";

export function ProfilePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const token = useAppSelector((state) => state.auth.token);

  const [activeTab, setActiveTab]                 = useState("orders");
  const [isEditModalOpen, setIsEditModalOpen]     = useState(false);
  const [editingDeliveryId, setEditingDeliveryId] = useState<number | null>(null);
  const [isNewProfileModalOpen, setIsNewProfileModalOpen] = useState(false);

  useEffect(() => {
    if (!token) navigate("/login");
  }, [token, navigate]);

  const { data: userProfile, isLoading: isProfileLoading } = useGetUserProfileQuery(
    undefined,
    { skip: !token }
  );

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate("/login");
  };

  // Открываем Edit, запоминаем какой deliveryId редактируем
  const handleEditProfile = (deliveryId: number) => {
    setEditingDeliveryId(deliveryId);
    setIsEditModalOpen(true);
  };

  if (!token) return null;

  return (
    <div className="up-container max-w-7xl mx-auto py-8 px-4">

      <ProfileGreeting onLogout={handleLogout} />

      <div className="up-gallery-wrapper my-8">
        {isProfileLoading ? (
          <div className="flex items-center justify-center h-[200px] text-gray-500">
            <div className="up-spinner mr-3" />
            <span>{t("profile.loading", "Loading profile...")}</span>
          </div>
        ) : (
          // CardGallery сам разберёт defaultDeliveryId и построит порядок карточек
          <CardGallery
            userProfile={userProfile}
            onEditProfile={handleEditProfile}
            onAddNewProfile={() => setIsNewProfileModalOpen(true)}
            onLogOut={handleLogout}
          />
        )}
      </div>

      <ProfileTabs activeTab={activeTab} onTabChange={setActiveTab} />

      <div className="up-tab-content mt-6">
        {activeTab === "orders"    && <OrdersTab />}
        {activeTab === "favorites" && <FavoritesTab />}
        {activeTab === "discounts" && <DiscountsTab />}
        {activeTab === "settings"  && <SettingsTab />}
      </div>

      <EditProfileModal
        isOpen={isEditModalOpen}
        deliveryId={editingDeliveryId}
        onClose={() => { setIsEditModalOpen(false); setEditingDeliveryId(null); }}
      />

      <CreateNewProfileModal
        isOpen={isNewProfileModalOpen}
        onClose={() => setIsNewProfileModalOpen(false)}
      />

    </div>
  );
}