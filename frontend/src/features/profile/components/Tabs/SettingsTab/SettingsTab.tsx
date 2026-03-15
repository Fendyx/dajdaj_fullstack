import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { logoutUser } from "@/features/auth/authSlice";
import { Trash2, AlertTriangle } from "lucide-react";
import axios from "axios";
import "./SettingsTab.css";

export function SettingsTab() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const token = useAppSelector((state) => state.auth.token);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    setError(null);
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/user/account`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      dispatch(logoutUser());
      navigate("/");
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to delete account");
      setIsDeleting(false);
    }
  };

  return (
    <div className="st-container">
      <div className="st-section">
        <h3 className="st-section-title">{t("settings.dangerZone", "Danger Zone")}</h3>
        <p className="st-section-desc">
          {t("settings.deleteDesc", "Once you delete your account, all your data will be permanently removed. This action cannot be undone.")}
        </p>

        {!showConfirm ? (
          <button className="st-delete-btn" onClick={() => setShowConfirm(true)}>
            <Trash2 size={16} />
            {t("settings.deleteAccount", "Delete Account")}
          </button>
        ) : (
          <div className="st-confirm-box">
            <div className="st-confirm-warning">
              <AlertTriangle size={20} />
              <span>{t("settings.deleteConfirm", "Are you sure? This cannot be undone.")}</span>
            </div>
            {error && <p className="st-error">{error}</p>}
            <div className="st-confirm-buttons">
              <button
                className="st-confirm-yes"
                onClick={handleDeleteAccount}
                disabled={isDeleting}
              >
                {isDeleting ? t("settings.deleting", "Deleting...") : t("settings.confirmYes", "Yes, delete my account")}
              </button>
              <button
                className="st-confirm-no"
                onClick={() => setShowConfirm(false)}
                disabled={isDeleting}
              >
                {t("settings.confirmNo", "Cancel")}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}