import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { registerUser } from "../../slices/authSlice";
import { StyledForm } from "./StyledForm";
import AuthLayout from "./AuthLayout";
import registerImage from "../../assets/img/greece_1.png";

const Register = () => {
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
  });

  useEffect(() => {
    if (auth._id) {
      // 👉 Meta Pixel: зарегистрирован
      if (window.fbq) {
        window.fbq("track", "CompleteRegistration", {
          value: 0,
          currency: "PLN",
        });
      }

      navigate(redirect || "/");
    }
  }, [auth._id, navigate, redirect]);

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(registerUser(user));
  };

  return (
    <AuthLayout imagePosition="right" imageSrc={registerImage}>
      <StyledForm onSubmit={handleSubmit}>
        <h2>Rejestracja</h2>
        <input
          type="text"
          placeholder="Name"
          value={user.name}
          onChange={(e) => setUser({ ...user, name: e.target.value })}
          required
        />
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
          {auth.registerStatus === "pending" ? "Submitting..." : "Rejestracja"}
        </button>
        {auth.registerStatus === "rejected" && <p>{auth.registerError}</p>}

        <p style={{ marginTop: "1rem" }}>
          Masz już konto?{" "}
          <span
            style={{ color: "#007bff", cursor: "pointer" }}
            onClick={() => navigate("/login")}
          >
            Logowanie
          </span>
        </p>
      </StyledForm>
    </AuthLayout>
  );
};

export default Register;


