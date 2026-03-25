import { configureStore } from "@reduxjs/toolkit";
// Slices
import authReducer from "@/features/auth/authSlice";
import cartReducer from "@/features/cart/cartSlice";
// Public APIs
import { userApi } from "@/services/userApi";
import { productsApi } from "@/services/productsApi";
import { categoriesApi } from "@/services/categoriesApi";
// Admin APIs (per-feature)
import { adminOrdersApi } from "@/features/admin/orders/api/adminOrdersApi";
import { adminUsersApi } from "@/features/admin/users/api/adminUsersApi";
import { adminProductsApi } from "@/features/admin/products/api/adminProductsApi";
import { adminCategoriesApi } from "@/features/admin/categories/api/adminCategoriesApi";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    cart: cartReducer,
    [userApi.reducerPath]: userApi.reducer,
    [productsApi.reducerPath]: productsApi.reducer,
    [categoriesApi.reducerPath]: categoriesApi.reducer,
    [adminOrdersApi.reducerPath]: adminOrdersApi.reducer,
    [adminUsersApi.reducerPath]: adminUsersApi.reducer,
    [adminProductsApi.reducerPath]: adminProductsApi.reducer,
    [adminCategoriesApi.reducerPath]: adminCategoriesApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      userApi.middleware,
      productsApi.middleware,
      categoriesApi.middleware,
      adminOrdersApi.middleware,
      adminUsersApi.middleware,
      adminProductsApi.middleware,
      adminCategoriesApi.middleware,
    ),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;