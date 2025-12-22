import { useState, useEffect } from "react"; // Вернул useEffect
import { useLocation, useNavigate } from "react-router-dom"; // Вернул useLocation
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { registerUser } from "../../slices/authSlice";
import { StyledForm, InputGroup } from "./StyledForm";
import AuthLayout from "./AuthLayout";
import { FcGoogle } from "react-icons/fc";
import { FaFacebookF } from "react-icons/fa";
import { FiEye, FiEyeOff } from "react-icons/fi";

const Register = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation(); // Вернул
  const auth = useSelector((state) => state.auth);

  // Вернул логику редиректа
  const params = new URLSearchParams(location.search);
  const redirect = params.get("redirect");
  
  const [user, setUser] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // ВОТ ЭТОГО НЕ ХВАТАЛО:
  useEffect(() => {
    if (auth._id) {
      navigate(redirect || "/");
    }
  }, [auth._id, navigate, redirect]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser(prev => ({ ...prev, [name]: value }));

    if (name === "confirmPassword" || name === "password") {
      const pass = name === "password" ? value : user.password;
      const conf = name === "confirmPassword" ? value : user.confirmPassword;
      if (conf && pass !== conf) setErrorMsg(t("register.passwordMismatch"));
      else setErrorMsg("");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (user.password !== user.confirmPassword) return;
    dispatch(registerUser(user));
  };

  return (
    <AuthLayout>
      <StyledForm onSubmit={handleSubmit}>
        <h2>{t("register.title")}</h2>

        <InputGroup hasLabel>
          <label>{t("register.name")}</label>
          <input
            type="text"
            name="name"
            value={user.name}
            onChange={handleChange}
            required
          />
        </InputGroup>

        <InputGroup hasLabel>
          <label>{t("register.email")}</label>
          <input
            type="email"
            name="email"
            value={user.email}
            onChange={handleChange}
            required
          />
        </InputGroup>

        <InputGroup hasLabel hasError={!!errorMsg}>
          <label>{t("register.password")}</label>
          <input
            type={showPass ? "text" : "password"}
            name="password"
            value={user.password}
            onChange={handleChange}
            required
          />
          <div className="eye-icon" onClick={() => setShowPass(!showPass)}>
            {showPass ? <FiEyeOff size={18} /> : <FiEye size={18} />}
          </div>
        </InputGroup>

        <InputGroup hasLabel hasError={!!errorMsg}>
          <label>{t("register.confirmPassword")}</label>
          <input
            type={showConfirmPass ? "text" : "password"}
            name="confirmPassword"
            value={user.confirmPassword}
            onChange={handleChange}
            required
          />
          <div className="eye-icon" onClick={() => setShowConfirmPass(!showConfirmPass)}>
            {showConfirmPass ? <FiEyeOff size={18} /> : <FiEye size={18} />}
          </div>
        </InputGroup>

        {errorMsg && <p className="error-text">{errorMsg}</p>}

        <button type="submit" disabled={!!errorMsg || auth.registerStatus === "pending"}>
          {auth.registerStatus === "pending" ? t("register.submitting") : t("register.submit")}
        </button>

        {auth.registerStatus === "rejected" && (
          <div className="backend-error">{auth.registerError}</div>
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
          {t("register.alreadyHaveAccount")} 
          <span onClick={() => navigate("/login")}>{t("register.login")}</span>
        </p>
      </StyledForm>
    </AuthLayout>
  );
};
export default Register;