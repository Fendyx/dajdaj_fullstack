import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { registerUser } from "../../slices/authSlice";
import { StyledForm } from "./StyledForm";
import AuthLayout from "./AuthLayout";
import registerImage from "../../assets/img/greece_1.png";
import { FcGoogle } from "react-icons/fc";
import { FaFacebookF } from "react-icons/fa";

const Register = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const auth = useSelector((state) => state.auth);

  const params = new URLSearchParams(location.search);
  const redirect = params.get("redirect");

  const [user, setUser] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  useEffect(() => {
    if (auth._id) navigate(redirect || "/");
  }, [auth._id, navigate, redirect]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (user.password !== user.confirmPassword) {
      alert(t("register.passwordMismatch"));
      return;
    }
    dispatch(registerUser(user));
  };

  return (
    <AuthLayout imagePosition="right" imageSrc={registerImage}>
      <StyledForm onSubmit={handleSubmit}>
        <h2>{t("register.title")}</h2>

        <input
          type="text"
          placeholder={t("register.name")}
          value={user.name}
          onChange={(e) => setUser({ ...user, name: e.target.value })}
          required
        />
        <input
          type="email"
          placeholder={t("register.email")}
          value={user.email}
          onChange={(e) => setUser({ ...user, email: e.target.value })}
          required
        />
        <input
          type="password"
          placeholder={t("register.password")}
          value={user.password}
          onChange={(e) => setUser({ ...user, password: e.target.value })}
          required
        />
        <input
          type="password"
          placeholder={t("register.confirmPassword")}
          value={user.confirmPassword}
          onChange={(e) =>
            setUser({ ...user, confirmPassword: e.target.value })
          }
          required
        />

        <button type="submit">
          {auth.registerStatus === "pending"
            ? t("register.submitting")
            : t("register.submit")}
        </button>
        {auth.registerStatus === "rejected" && <p>{auth.registerError}</p>}

        {/* ✅ Кнопки соц. логина */}
        <div className="social-login">
        <button
          type="button"
          className="google-btn"
          onClick={() => window.location.href = `${import.meta.env.REACT_APP_API_URL}/api/oauth/google`}
        >
          <FcGoogle size={20} style={{ marginRight: "8px" }} />
          {t("register.google")}
        </button>

        <button
          type="button"
          className="facebook-btn"
          onClick={() => window.location.href = `${import.meta.env.REACT_APP_API_URL}/api/oauth/facebook`}
        >
          <FaFacebookF size={20} style={{ marginRight: "8px" }} />
          {t("register.facebook")}
        </button>
        </div>

        <p style={{ marginTop: "1rem" }}>
          {t("register.alreadyHaveAccount")}{" "}
          <span
            style={{ color: "#007bff", cursor: "pointer" }}
            onClick={() => navigate("/login")}
          >
            {t("register.login")}
          </span>
        </p>
      </StyledForm>
    </AuthLayout>
  );
};

export default Register;
