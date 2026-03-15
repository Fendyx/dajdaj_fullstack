import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Eye, EyeOff } from "lucide-react";
import { Link } from "react-router-dom";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { registerUser } from "@/features/auth/authSlice";
import { AuthLayout } from "@/features/auth/components/AuthLayout";

export function RegisterPage() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const auth = useAppSelector((state) => state.auth);

  const params = new URLSearchParams(location.search);
  const redirect = params.get("redirect");

  const [user, setUser] = useState({
    name: "", email: "", password: "", confirmPassword: ""
  });
  const [gdprConsent, setGdprConsent] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (auth._id) navigate(redirect || "/");
  }, [auth._id, navigate, redirect]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUser(prev => ({ ...prev, [name]: value }));

    if (name === "confirmPassword" || name === "password") {
      const pass = name === "password" ? value : user.password;
      const conf = name === "confirmPassword" ? value : user.confirmPassword;
      if (conf && pass !== conf) setErrorMsg(t("register.passwordMismatch", "Passwords do not match"));
      else setErrorMsg("");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (user.password !== user.confirmPassword) return;
    if (!gdprConsent) return;
    dispatch(registerUser({ ...user, gdprConsent: true }));
  };

  const handleSocialLogin = (provider: "google" | "facebook") => {
    const apiUrl = import.meta.env.VITE_API_URL || "";
    window.location.href = `${apiUrl}/api/oauth/${provider}`;
  };

  return (
    <AuthLayout>
      <form className="auth-form" onSubmit={handleSubmit}>
        <h2>{t("register.title", "Create Account")}</h2>

        <div className="input-group">
          <label>{t("register.name", "Name")}</label>
          <input type="text" name="name" value={user.name} onChange={handleChange} required />
        </div>

        <div className="input-group">
          <label>{t("register.email", "Email")}</label>
          <input type="email" name="email" value={user.email} onChange={handleChange} required />
        </div>

        <div className="input-group">
          <label>{t("register.password", "Password")}</label>
          <input
            type={showPass ? "text" : "password"}
            name="password"
            value={user.password}
            onChange={handleChange}
            className={errorMsg ? "has-error" : ""}
            required
          />
          <div className="eye-icon" onClick={() => setShowPass(!showPass)}>
            {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
          </div>
        </div>

        <div className="input-group">
          <label>{t("register.confirmPassword", "Confirm Password")}</label>
          <input
            type={showConfirmPass ? "text" : "password"}
            name="confirmPassword"
            value={user.confirmPassword}
            onChange={handleChange}
            className={errorMsg ? "has-error" : ""}
            required
          />
          <div className="eye-icon" onClick={() => setShowConfirmPass(!showConfirmPass)}>
            {showConfirmPass ? <EyeOff size={18} /> : <Eye size={18} />}
          </div>
        </div>

        {errorMsg && <p className="error-text">{errorMsg}</p>}

        {/* ✅ GDPR Checkbox */}
        <div className="gdpr-checkbox">
          <input
            type="checkbox"
            id="gdprConsent"
            checked={gdprConsent}
            onChange={(e) => setGdprConsent(e.target.checked)}
            required
          />
          <label htmlFor="gdprConsent">
            {t("register.gdpr.text", "I have read and accept the")}{" "}
            <Link to="/privacy" target="_blank">{t("register.gdpr.privacy", "Privacy Policy")}</Link>
            {" "}{t("register.gdpr.and", "and")}{" "}
            <Link to="/terms" target="_blank">{t("register.gdpr.terms", "Terms of Service")}</Link>
          </label>
        </div>

        <button
          type="submit"
          className="auth-submit-btn"
          disabled={!!errorMsg || !gdprConsent || auth.status === "pending"}
        >
          {auth.status === "pending"
            ? t("register.submitting", "Creating account...")
            : t("register.submit", "Register")}
        </button>

        {auth.status === "failed" && auth.error && (
          <div className="backend-error">{auth.error}</div>
        )}

        <div className="divider">Or continue with</div>

        <div className="social-login">
          <button type="button" className="social-btn google-btn" onClick={() => handleSocialLogin("google")}>
            <span className="font-bold">G</span>oogle
          </button>
          <button type="button" className="social-btn facebook-btn" onClick={() => handleSocialLogin("facebook")}>
            <span className="font-bold">f</span>acebook
          </button>
        </div>

        <p className="switch-auth">
          {t("register.alreadyHaveAccount", "Already have an account?")}
          <span onClick={() => navigate("/login")}>{t("register.login", "Login")}</span>
        </p>
      </form>
    </AuthLayout>
  );
}