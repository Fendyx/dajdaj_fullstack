import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Shield } from "lucide-react";
import axios from "axios";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { fetchUserProfile } from "@/features/auth/authSlice";
import "./GdprGate.css";

export function GdprGate() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const token = useAppSelector((state) => state.auth.token);
  const gdprAccepted = useAppSelector((state) => (state.auth as any).gdprConsent?.accepted);
  const userLoaded = useAppSelector((state) => state.auth.userLoaded);

  const [checked, setChecked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Показываем только если юзер залогинен, профиль загружен, и согласие не принято
  if (!token || !userLoaded || gdprAccepted !== false) return null;

  const handleAccept = async () => {
    if (!checked) return;
    setLoading(true);
    setError("");
    try {
      await axios.patch(
        `${import.meta.env.VITE_API_URL}/api/user/gdpr-consent`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await dispatch(fetchUserProfile());
    } catch {
      setError(t("gdpr.error", "Something went wrong. Please try again."));
      setLoading(false);
    }
  };

  return (
    <div className="gdpr-gate-overlay">
      <div className="gdpr-gate-modal">
        <div className="gdpr-gate-icon">
          <Shield size={32} />
        </div>
        <h2>{t("gdpr.title", "One more step")}</h2>
        <p>{t("gdpr.desc", "Before you continue, please review and accept our Privacy Policy and Terms of Service.")}</p>

        <div className="gdpr-gate-checkbox">
          <input
            type="checkbox"
            id="gdprGateConsent"
            checked={checked}
            onChange={(e) => setChecked(e.target.checked)}
          />
          <label htmlFor="gdprGateConsent">
            {t("register.gdpr.text", "I have read and accept the")}{" "}
            <Link to="/privacy" target="_blank">{t("register.gdpr.privacy", "Privacy Policy")}</Link>
            {" "}{t("register.gdpr.and", "and")}{" "}
            <Link to="/terms" target="_blank">{t("register.gdpr.terms", "Terms of Service")}</Link>
          </label>
        </div>

        {error && <p className="gdpr-gate-error">{error}</p>}

        <button
          className="gdpr-gate-btn"
          onClick={handleAccept}
          disabled={!checked || loading}
        >
          {loading ? t("gdpr.accepting", "Saving...") : t("gdpr.accept", "Continue")}
        </button>
      </div>
    </div>
  );
}