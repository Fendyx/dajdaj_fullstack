import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import cartReducer from "./slices/cartSlice";
import productsReducer from "./slices/productsSlice";
import { userApi } from "./slices/userApi";
import { productsApi } from "./slices/productsApi";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    cart: cartReducer,
    products: productsReducer,
    [userApi.reducerPath]: userApi.reducer,
    [productsApi.reducerPath]: productsApi.reducer,
  },
  middleware: (gDM) => gDM().concat(userApi.middleware, productsApi.middleware),
});
