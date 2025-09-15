import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loginUser } from "../../slices/authSlice";
import { useLocation, useNavigate } from "react-router-dom";
import { StyledForm } from "./StyledForm";
import AuthLayout from "./AuthLayout";
import loginImage from "../../assets/img/greece_1.png";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const auth = useSelector((state) => state.auth);

  // читаем ?redirect=/cart
  const params = new URLSearchParams(location.search);
  const redirect = params.get("redirect");

  const [user, setUser] = useState({
    email: "",
    password: "",
  });

  useEffect(() => {
    if (auth._id) {
      navigate(redirect || "/"); // если есть redirect → туда, иначе на главную
    }
  }, [auth._id, navigate, redirect]);

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(loginUser(user));
  };

  return (
    <AuthLayout imagePosition="left" imageSrc={loginImage}>
      <StyledForm onSubmit={handleSubmit}>
        <h2>Logowanie</h2>
        <input
          type="email"
          placeholder="Email"
          value={user.email}
          onChange={(e) => setUser({ ...user, email: e.target.value })}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={user.password}
          onChange={(e) => setUser({ ...user, password: e.target.value })}
          required
        />
        <button type="submit">
          {auth.loginStatus === "pending" ? "Submitting..." : "Logowanie"}
        </button>
        {auth.loginStatus === "rejected" && <p>{auth.loginError}</p>}

        <p style={{ marginTop: "1rem" }}>
          Nie masz konta?{" "}
          <span
            style={{ color: "#007bff", cursor: "pointer" }}
            onClick={() => navigate("/register")}
          >
            Rejestracja
          </span>
        </p>
      </StyledForm>
    </AuthLayout>
  );
};

export default Login;

