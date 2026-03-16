import { configureStore } from "@reduxjs/toolkit";

// 🧠 Слайсы
import authReducer from "@/features/auth/authSlice";
import cartReducer from "@/features/cart/cartSlice";

// 🌐 RTK Query API
import { userApi } from "@/services/userApi";
import { productsApi } from "@/services/productsApi";

// 🛡 Admin APIs (разбиты по фичам)
import { adminOrdersApi } from "@/features/admin/orders/api/adminOrdersApi";
import { adminUsersApi } from "@/features/admin/users/api/adminUsersApi";
import { adminProductsApi } from "@/features/admin/products/api/adminProductsApi";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    cart: cartReducer,

    [userApi.reducerPath]: userApi.reducer,
    [productsApi.reducerPath]: productsApi.reducer,

    [adminOrdersApi.reducerPath]: adminOrdersApi.reducer,
    [adminUsersApi.reducerPath]: adminUsersApi.reducer,
    [adminProductsApi.reducerPath]: adminProductsApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      userApi.middleware,
      productsApi.middleware,
      adminOrdersApi.middleware,
      adminUsersApi.middleware,
      adminProductsApi.middleware,
    ),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;