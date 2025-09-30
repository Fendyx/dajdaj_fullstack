import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loginUser } from "../../slices/authSlice";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { StyledForm } from "./StyledForm";
import AuthLayout from "./AuthLayout";
import loginImage from "../../assets/img/greece_1.png";
import { FcGoogle } from "react-icons/fc";
import { FaFacebookF } from "react-icons/fa";

const Login = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const auth = useSelector((state) => state.auth);

  const params = new URLSearchParams(location.search);
  const redirect = params.get("redirect");

  const [user, setUser] = useState({
    email: "",
    password: "",
  });

  useEffect(() => {
    if (auth._id) navigate(redirect || "/");
  }, [auth._id, navigate, redirect]);

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(loginUser(user));
  };

  return (
    <AuthLayout imagePosition="left" imageSrc={loginImage}>
      <StyledForm onSubmit={handleSubmit}>
        <h2>{t("login.title")}</h2>

        <input
          type="email"
          placeholder={t("login.email")}
          value={user.email}
          onChange={(e) => setUser({ ...user, email: e.target.value })}
          required
        />
        <input
          type="password"
          placeholder={t("login.password")}
          value={user.password}
          onChange={(e) => setUser({ ...user, password: e.target.value })}
          required
        />

        <button type="submit">
          {auth.loginStatus === "pending" ? t("login.submitting") : t("login.submit")}
        </button>
        {auth.loginStatus === "rejected" && <p>{auth.loginError}</p>}

        {/* Соц. кнопки */}
        <div className="social-login">
        <button
          type="button"
          className="google-btn"
          onClick={() => window.location.href = "https://dajdaj-fullstack-backend.onrender.com/api/oauth/google"}
        >
          <FcGoogle size={20} style={{ marginRight: "8px" }} />
          {t("login.google")}
        </button>

        <button
          type="button"
          className="facebook-btn"
          onClick={() => window.location.href = "https://dajdaj-fullstack-backend.onrender.com/api/oauth/facebook"}
        >
          <FaFacebookF size={20} style={{ marginRight: "8px" }} />
          {t("login.facebook")}
        </button>
        </div>

        <p style={{ marginTop: "1rem" }}>
          {t("login.noAccount")}{" "}
          <span
            style={{ color: "#007bff", cursor: "pointer" }}
            onClick={() => navigate("/register")}
          >
            {t("login.register")}
          </span>
        </p>
      </StyledForm>
    </AuthLayout>
  );
};

export default Login;
