//frontend/src/features/auth/authSlice.ts
import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : "/api";

// 1️⃣ ПОЛНАЯ ТИПИЗАЦИЯ СТЕЙТА (все поля из твоего старого проекта)
export interface AuthState {
  token: string | null;
  _id: string;
  clientId: string;
  name: string;
  email: string;
  role: string;
  phoneNumber: string;
  registrationDate: string;
  cardNumber: string;
  address: {
    street: string;
    city: string;
    postalCode: string;
  };
  discounts: any[];
  favorites: any[];
  deliveryDatas: any[]; // Тот самый массив, который нужен в Checkout

  // Технические поля
  isAuthenticated: boolean;
  userLoaded: boolean;
  status: "idle" | "pending" | "succeeded" | "failed";
  error: string | null;

  gdprConsent: {
    accepted: boolean | null;
    acceptedAt?: string;
    version?: string;
  } | null;
}

const initialState: AuthState = {
  token: localStorage.getItem("token") || null,
  _id: "",
  clientId: "",
  name: "",
  email: "",
  role: "",
  phoneNumber: "",
  registrationDate: "",
  cardNumber: "",
  address: { street: "", city: "", postalCode: "" },
  discounts: [],
  favorites: [],
  deliveryDatas: [],
  
  isAuthenticated: !!localStorage.getItem("token"),
  userLoaded: false,
  status: "idle",
  error: null,
  gdprConsent: null,
};

// Вспомогательная функция для заголовков
const getAuthHeaders = (token: string | null) => ({
  headers: { Authorization: `Bearer ${token}` },
});

// 2️⃣ THUNKS

export const fetchUserProfile = createAsyncThunk(
  "auth/fetchUserProfile",
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { auth: AuthState };
      if (!state.auth.token) throw new Error("No token");

      const res = await axios.get(`${API_URL}/user/profile`, getAuthHeaders(state.auth.token));
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (values: any, { dispatch, rejectWithValue }) => {
    try {
      const res = await axios.post(`${API_URL}/login`, values);
      const token = res.data;
      localStorage.setItem("token", token);
      dispatch(setToken(token));
      await dispatch(fetchUserProfile());
      return token;
    } catch (err: any) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const registerUser = createAsyncThunk(
  "auth/registerUser",
  async (values: any, { dispatch, rejectWithValue }) => {
    try {
      const { confirmPassword, ...cleanValues } = values;
      const res = await axios.post(`${API_URL}/register`, cleanValues);
      const token = res.data;
      localStorage.setItem("token", token);
      dispatch(setToken(token));
      await dispatch(fetchUserProfile());
      return token;
    } catch (err: any) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

// 3️⃣ СЛАЙС
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setToken(state, action: PayloadAction<string>) {
      state.token = action.payload;
      state.isAuthenticated = true;
    },
    logoutAction(state) {
      localStorage.removeItem("token");
      return { ...initialState, token: null, userLoaded: true };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserProfile.pending, (state) => {
        state.status = "pending";
        state.error = null;
      })
      .addCase(fetchUserProfile.fulfilled, (state, { payload }) => {
        // Эквивалент твоего Object.assign(state, payload)
        // Но теперь TypeScript знает, что в payload лежат нужные поля
        return {
          ...state,
          ...payload,
          isAuthenticated: true,
          userLoaded: true,
          status: "succeeded",
        };
      })
      .addCase(fetchUserProfile.rejected, (state, { payload }) => {
        state.status = "failed";
        state.error = typeof payload === "string" 
          ? payload 
          : (payload as any)?.message || "Unknown error";
        state.isAuthenticated = false;
        state.userLoaded = true;
      })
      // Статусы для логина и регистрации теперь общие
      .addMatcher(
        (action) => action.type.endsWith("/pending") && (action.type.includes("login") || action.type.includes("register")),
        (state) => { 
          state.status = "pending"; 
          state.error = null; 
        }
      )
      // 2. Обработка успеха (Fulfilled)
      .addMatcher(
        (action) => action.type.endsWith("/fulfilled") && (action.type.includes("login") || action.type.includes("register")),
        (state) => { 
          state.status = "succeeded"; 
        }
      )
      // 3. Обработка ошибки (Rejected)
      .addMatcher(
        (action) => action.type.endsWith("/rejected") && (action.type.includes("login") || action.type.includes("register")),
        // 🔥 Вот тут добавляем тип для action
        (state, action: PayloadAction<any>) => { 
          state.status = "failed"; 
          // ✅ Вытаскиваем строку из объекта если надо
          state.error = typeof action.payload === "string" 
            ? action.payload 
            : action.payload?.message || "Unknown error";
        }
      );
  },
});

export const { setToken, logoutAction } = authSlice.actions;
export const logoutUser = logoutAction; // Для совместимости
export default authSlice.reducer;