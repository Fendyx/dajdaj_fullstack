import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { url, setHeaders } from "./api";

// Initial state
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
  deliveryDatas: [],

  registerStatus: "idle",
  registerError: null,

  loginStatus: "idle",
  loginError: null,

  getUserStatus: "idle",
  getUserError: null,

  updateStatus: "idle",
  updateError: null,

  userLoaded: false,      // only true after fetchUserProfile settles
  isAuthenticated: false, // only true if profile fetch succeeded
};

// Thunk to fetch profile, using the token from state
export const fetchUserProfile = createAsyncThunk(
  "auth/fetchUserProfile",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${url}/user/profile`, setHeaders());
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

// Thunk to update profile
export const updateUserProfile = createAsyncThunk(
  "auth/updateUserProfile",
  async (values, { dispatch, rejectWithValue }) => {
    try {
      const res = await axios.put(`${url}/user/update`, values, setHeaders());
      // после обновления сразу тянем свежий профиль
      await dispatch(fetchUserProfile());
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

// Thunk to register. On success we store token + load profile
export const registerUser = createAsyncThunk(
  "auth/registerUser",
  async (values, { dispatch, rejectWithValue }) => {
    try {
      const res = await axios.post(`${url}/register`, values);
      const token = res.data;
      dispatch(setToken(token));
      await dispatch(fetchUserProfile());
      return token;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

// Thunk to login. On success we store token + load profile
export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (values, { dispatch, rejectWithValue }) => {
    try {
      const res = await axios.post(`${url}/login`, values);
      const token = res.data;
      dispatch(setToken(token));
      await dispatch(fetchUserProfile());
      return token;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setToken(state, action) {
      state.token = action.payload;
      localStorage.setItem("token", action.payload);
    },
    logoutUser(state) {
      localStorage.removeItem("token");
      return { ...initialState, token: "" };
    },
  },
  extraReducers: (builder) => {
    builder
      // REGISTER
      .addCase(registerUser.pending, (state) => {
        state.registerStatus = "pending";
        state.registerError = null;
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.registerStatus = "succeeded";
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.registerStatus = "failed";
        state.registerError = action.payload;
      })

      // LOGIN
      .addCase(loginUser.pending, (state) => {
        state.loginStatus = "pending";
        state.loginError = null;
      })
      .addCase(loginUser.fulfilled, (state) => {
        state.loginStatus = "succeeded";
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loginStatus = "failed";
        state.loginError = action.payload;
      })

      // PROFILE FETCH
      .addCase(fetchUserProfile.pending, (state) => {
        state.getUserStatus = "pending";
        state.getUserError = null;
      })
      .addCase(fetchUserProfile.fulfilled, (state, { payload }) => {
        Object.assign(state, payload);
        state.isAuthenticated = true;
        state.userLoaded = true;
        state.getUserStatus = "succeeded";
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.getUserError = action.payload;
        state.isAuthenticated = false;
        state.userLoaded = true;
        state.getUserStatus = "failed";
      })

      // PROFILE UPDATE
      .addCase(updateUserProfile.pending, (state) => {
        state.updateStatus = "pending";
        state.updateError = null;
      })
      .addCase(updateUserProfile.fulfilled, (state, { payload }) => {
        state.updateStatus = "succeeded";
        // локально обновляем, но всё равно fetchUserProfile сделает полное обновление
        Object.assign(state, payload);
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.updateStatus = "failed";
        state.updateError = action.payload;
      });
  },
});

export const { setToken, logoutUser } = authSlice.actions;
export default authSlice.reducer;
