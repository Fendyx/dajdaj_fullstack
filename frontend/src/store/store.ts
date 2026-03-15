import { configureStore } from "@reduxjs/toolkit";

// 🧠 Слайсы (Локальное состояние)
import authReducer from "@/features/auth/authSlice";
import cartReducer from "@/features/cart/cartSlice";
// ❌ productsReducer удален навсегда!

// 🌐 RTK Query API (Сетевые запросы)
import { userApi } from "@/services/userApi";
import { productsApi } from "@/services/productsApi";
import { adminApi } from "@/features/admin/adminApi";           // Убедись, что положил их сюда
import { adminUsersApi } from "@/features/admin/adminUsersApi"; // Убедись, что положил их сюда

export const store = configureStore({
  reducer: {
    auth: authReducer,
    cart: cartReducer,
    
    // Подключаем редьюсеры RTK Query
    [userApi.reducerPath]: userApi.reducer,
    [productsApi.reducerPath]: productsApi.reducer,
    [adminApi.reducerPath]: adminApi.reducer,
    [adminUsersApi.reducerPath]: adminUsersApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      userApi.middleware,
      productsApi.middleware,
      adminApi.middleware,
      adminUsersApi.middleware
    ),
});

// 👇 МАГИЯ TYPESCRIPT 👇
// Эти типы вытаскивают всю структуру твоего Redux-стейта автоматически
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;