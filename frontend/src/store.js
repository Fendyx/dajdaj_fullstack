import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import cartReducer from "./slices/cartSlice";
import productsReducer from "./slices/productsSlice";

import { userApi } from "./slices/userApi";
import { productsApi } from "./slices/productsApi";
import { adminApi } from "./slices/adminApi"; // для заказов
import { adminUsersApi } from "./slices/adminUsersApi"; // для пользователей

export const store = configureStore({
  reducer: {
    auth: authReducer,
    cart: cartReducer,
    products: productsReducer,
    [userApi.reducerPath]: userApi.reducer,
    [productsApi.reducerPath]: productsApi.reducer,
    [adminApi.reducerPath]: adminApi.reducer, // RTK Query редьюсер для заказов
    [adminUsersApi.reducerPath]: adminUsersApi.reducer, // RTK Query редьюсер для пользователей
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      userApi.middleware,
      productsApi.middleware,
      adminApi.middleware,
      adminUsersApi.middleware
    ),
});
