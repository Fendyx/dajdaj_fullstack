import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const userApi = createApi({
  reducerPath: "userApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${process.env.REACT_APP_API_URL}/api`,
    prepareHeaders: (headers, { getState }) => {
      const token = getState().auth?.token || localStorage.getItem("token");
      if (token) headers.set("Authorization", `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ["Favorites", "Orders"],
  endpoints: (builder) => ({
    getUserOrders: builder.query({
      query: () => "/user/orders",
      providesTags: ["Orders"],
    }),
    getUserDiscounts: builder.query({
      query: () => "/user/discounts",
    }),
    getUserFavorites: builder.query({
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
    getUserProfile: builder.query({
      query: () => "/user/profile",
    }),
    addDeliveryData: builder.mutation({
      query: (data) => ({
        url: "/user/delivery",
        method: "POST",
        body: data,
      }),
    }),

    // ✅ исправлено: теперь путь соответствует бэку
    getOrderByToken: builder.query({
      query: (orderToken) => `/orders/token/${orderToken}`,  // ✅ просто /orders/:token
      providesTags: ["Orders"],
    }),
  }),
});

export const {
  useGetUserOrdersQuery,
  useGetUserDiscountsQuery,
  useGetUserFavoritesQuery,
  useAddFavoriteMutation,
  useRemoveFavoriteMutation,
  useGetUserProfileQuery,
  useAddDeliveryDataMutation,
  useGetOrderByTokenQuery,
} = userApi;
