import { useState, useEffect } from "react"; // Вернул useEffect
import { useDispatch, useSelector } from "react-redux";
import { loginUser } from "../../slices/authSlice";
import { useNavigate, useLocation } from "react-router-dom"; // Вернул useLocation
import { useTranslation } from "react-i18next";
import { StyledForm, InputGroup } from "./StyledForm";
import AuthLayout from "./AuthLayout";
import { FcGoogle } from "react-icons/fc";
import { FaFacebookF } from "react-icons/fa";
import { FiEye, FiEyeOff } from "react-icons/fi";

const Login = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation(); // Вернул это
  const dispatch = useDispatch();
  const auth = useSelector((state) => state.auth);

  // Вернул логику редиректа
  const params = new URLSearchParams(location.search);
  const redirect = params.get("redirect");
  
  const [user, setUser] = useState({ email: "", password: "" });
  const [showPass, setShowPass] = useState(false);

  // ВОТ ЭТОГО НЕ ХВАТАЛО:
  useEffect(() => {
    if (auth._id) {
      navigate(redirect || "/");
    }
  }, [auth._id, navigate, redirect]);

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(loginUser(user));
  };

  return (
    <AuthLayout>
      <StyledForm onSubmit={handleSubmit}>
        <h2>{t("login.title")}</h2>

        <InputGroup hasLabel>
          <label>{t("login.email")}</label>
          <input
            type="email"
            value={user.email}
            onChange={(e) => setUser({ ...user, email: e.target.value })}
            required
          />
        </InputGroup>

        <InputGroup hasLabel>
          <label>{t("login.password")}</label>
          <input
            type={showPass ? "text" : "password"}
            value={user.password}
            onChange={(e) => setUser({ ...user, password: e.target.value })}
            required
          />
          <div className="eye-icon" onClick={() => setShowPass(!showPass)}>
            {showPass ? <FiEyeOff size={18} /> : <FiEye size={18} />}
          </div>
        </InputGroup>

        <button type="submit">
          {auth.loginStatus === "pending" ? t("login.submitting") : t("login.submit")}
        </button>

        {auth.loginStatus === "rejected" && (
           <div className="backend-error">{auth.loginError}</div>
        )}

        <div className="divider">Or continue with</div>

        <div className="social-login">
          {/* Вернул рабочие ссылки */}
          <button 
            type="button" 
            className="google-btn"
            onClick={() => window.location.href = `${process.env.REACT_APP_API_URL}/api/oauth/google`}
          >
            <FcGoogle size={20} style={{ marginRight: "8px" }} /> Google
          </button>
          
          <button 
            type="button" 
            className="facebook-btn"
            onClick={() => window.location.href = `${process.env.REACT_APP_API_URL}/api/oauth/facebook`}
          >
            <FaFacebookF size={20} style={{ marginRight: "8px", color: "#1877f2" }} /> Facebook
          </button>
        </div>

        <p className="switch-auth">
          {t("login.noAccount")} 
          <span onClick={() => navigate("/register")}>{t("login.register")}</span>
        </p>
      </StyledForm>
    </AuthLayout>
  );
};
export default Login;