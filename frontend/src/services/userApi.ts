import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { RootState } from "@/store/store";

export const userApi = createApi({
  reducerPath: "userApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${import.meta.env.VITE_API_URL}/api`,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth?.token || localStorage.getItem("token");
      if (token) headers.set("Authorization", `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ["Favorites", "Orders", "Profile"],
  endpoints: (builder) => ({

    // ── Профиль ───────────────────────────────────────────────────────────────
    getUserProfile: builder.query({
      query: () => "/user/profile",
      providesTags: ["Profile"],
    }),

    // ── Доставка ──────────────────────────────────────────────────────────────

    // Добавить новый профиль доставки
    addDeliveryData: builder.mutation({
      query: (data) => ({
        url: "/user/delivery",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Profile"],
    }),

    // Обновить существующий профиль доставки
    updateDeliveryData: builder.mutation<any, { deliveryId: number; data: any }>({
      query: ({ deliveryId, data }) => ({
        url: `/user/delivery/${deliveryId}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["Profile"],
    }),

    // Удалить профиль доставки
    deleteDeliveryData: builder.mutation<any, number>({
      query: (deliveryId) => ({
        url: `/user/delivery/${deliveryId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Profile"],
    }),

    // Сделать профиль доставки дефолтным
    setDefaultDelivery: builder.mutation<any, number>({
      query: (deliveryId) => ({
        url: `/user/delivery/${deliveryId}/set-default`,
        method: "PATCH",
      }),
      invalidatesTags: ["Profile"],
    }),

    // ── Заказы ────────────────────────────────────────────────────────────────
    getUserOrders: builder.query<any, void>({
      query: () => "/user/orders",
      providesTags: ["Orders"],
    }),

    getOrderByToken: builder.query({
      query: (orderToken) => `/orders/token/${orderToken}`,
      providesTags: ["Orders"],
    }),

    // ── Скидки ────────────────────────────────────────────────────────────────
    getUserDiscounts: builder.query<any, void>({
      query: () => "/user/discounts",
    }),

    // ── Избранное ─────────────────────────────────────────────────────────────
    getUserFavorites: builder.query<any, void>({
      query: () => "/user/favorites",
      providesTags: ["Favorites"],
    }),

    addFavorite: builder.mutation({
      query: (productId) => ({
        url: `/user/favorites/${productId}`,
        method: "POST",
      }),
      invalidatesTags: ["Favorites"],
    }),

    removeFavorite: builder.mutation({
      query: (productId) => ({
        url: `/user/favorites/${productId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Favorites"],
    }),

  }),
});

export const {
  useGetUserProfileQuery,
  useAddDeliveryDataMutation,
  useUpdateDeliveryDataMutation,
  useDeleteDeliveryDataMutation,
  useSetDefaultDeliveryMutation,
  useGetUserOrdersQuery,
  useGetOrderByTokenQuery,
  useGetUserDiscountsQuery,
  useGetUserFavoritesQuery,
  useAddFavoriteMutation,
  useRemoveFavoriteMutation,
} = userApi;