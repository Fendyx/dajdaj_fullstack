import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { url, setHeaders } from "./api";

const initialState = {
  token: localStorage.getItem("token") || "",
  _id: "",
  clientId: "",
  name: "",
  email: "",
  discounts: [],
  favorites: [],
  cardNumber: "",
  registrationDate: "",
  address: { street: "", city: "", postalCode: "" },
  phoneNumber: "",
  registerStatus: "",
  registerError: "",
  loginStatus: "",
  loginError: "",
  getUserStatus: "",
  getUserError: "",
  userLoaded: false,
};

// Получение профиля
export const fetchUserProfile = createAsyncThunk(
  "auth/fetchUserProfile",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${url}/user/profile`, setHeaders());
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Регистрация
export const registerUser = createAsyncThunk(
  "auth/registerUser",
  async (values, { dispatch, rejectWithValue }) => {
    try {
      const res = await axios.post(`${url}/register`, {
        name: values.name,
        email: values.email,
        password: values.password,
      });

      const token = res.data;
      localStorage.setItem("token", token);

      await dispatch(fetchUserProfile());
      return token;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Логин
export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (values, { dispatch, rejectWithValue }) => {
    try {
      const res = await axios.post(`${url}/login`, {
        email: values.email,
        password: values.password,
      });

      const token = res.data;
      localStorage.setItem("token", token);

      await dispatch(fetchUserProfile());
      return token;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logoutUser(state) {
      localStorage.removeItem("token");
      return { ...initialState, token: "" };
    },
    // ✅ Новый редьюсер для установки токена (например, после OAuth)
    setToken(state, action) {
      state.token = action.payload;
      localStorage.setItem("token", action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      // Регистрация
      .addCase(registerUser.pending, (state) => {
        state.registerStatus = "pending";
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.registerStatus = "success";
        state.token = action.payload;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.registerStatus = "rejected";
        state.registerError = action.payload;
      })

      // Логин
      .addCase(loginUser.pending, (state) => {
        state.loginStatus = "pending";
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loginStatus = "success";
        state.token = action.payload;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loginStatus = "rejected";
        state.loginError = action.payload;
      })

      // Профиль
      .addCase(fetchUserProfile.pending, (state) => {
        state.getUserStatus = "pending";
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.getUserStatus = "success";
        Object.assign(state, action.payload);
        state.userLoaded = true;
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.getUserStatus = "rejected";
        state.getUserError = action.payload;
        state.userLoaded = true;
      });
  },
});

export const { logoutUser, setToken } = authSlice.actions; // ✅ экспортируем setToken
export default authSlice.reducer;
