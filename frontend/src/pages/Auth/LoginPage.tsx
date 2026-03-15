import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Eye, EyeOff } from "lucide-react";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { loginUser } from "@/features/auth/authSlice";
import { AuthLayout } from "@/features/auth/components/AuthLayout";

export function LoginPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const auth = useAppSelector((state) => state.auth);

  const params = new URLSearchParams(location.search);
  const redirect = params.get("redirect");
  
  const [user, setUser] = useState({ email: "", password: "" });
  const [showPass, setShowPass] = useState(false);

  useEffect(() => {
    if (auth._id) {
      navigate(redirect || "/");
    }
  }, [auth._id, navigate, redirect]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(loginUser(user));
  };

  const handleSocialLogin = (provider: "google" | "facebook") => {
    // 🔥 Используем только Vite синтаксис! Fallback на пустую строку, чтобы TS не ругался.
    const apiUrl = import.meta.env.VITE_API_URL || "";
    window.location.href = `${apiUrl}/api/oauth/${provider}`;
  };

  return (
    <AuthLayout>
      <form className="auth-form" onSubmit={handleSubmit}>
        <h2>{t("login.title", "Welcome Back")}</h2>

        <div className="input-group">
          <label>{t("login.email", "Email")}</label>
          <input
            type="email"
            value={user.email}
            onChange={(e) => setUser({ ...user, email: e.target.value })}
            required
          />
        </div>

        <div className="input-group">
          <label>{t("login.password", "Password")}</label>
          <input
            type={showPass ? "text" : "password"}
            value={user.password}
            onChange={(e) => setUser({ ...user, password: e.target.value })}
            required
          />
          <div className="eye-icon" onClick={() => setShowPass(!showPass)}>
            {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
          </div>
        </div>

        {/* 🔥 Исправили auth.loginStatus на auth.status */}
        <button type="submit" className="auth-submit-btn" disabled={auth.status === "pending"}>
          {auth.status === "pending" ? t("login.submitting", "Logging in...") : t("login.submit", "Login")}
        </button>

        {/* 🔥 Исправили auth.loginError на auth.error */}
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
          {t("login.noAccount", "Don't have an account?")} 
          <span onClick={() => navigate("/register")}>{t("login.register", "Register")}</span>
        </p>
      </form>
    </AuthLayout>
  );
}