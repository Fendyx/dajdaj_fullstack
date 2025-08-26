import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const userApi = createApi({
  reducerPath: "userApi",
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.REACT_APP_API_URL + '/api', // ← ДОБАВИТЬ /api здесь
    prepareHeaders: (headers, { getState }) => {
      const token = getState().auth?.token;
      if (token) headers.set("Authorization", `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ['Favorites'],
  endpoints: (builder) => ({
    getUserOrders: builder.query({
      query: () => "/user/orders",
    }),
    getUserDiscounts: builder.query({
      query: () => "/user/discounts",
    }),
    getUserFavorites: builder.query({
      query: () => "/user/favorites",
      providesTags: ['Favorites'],
    }),
    addFavorite: builder.mutation({
      query: (productId) => ({
        url: `/user/favorites/${productId}`,
        method: "POST",
      }),
      invalidatesTags: ['Favorites'],
    }),
    removeFavorite: builder.mutation({
      query: (productId) => ({
        url: `/user/favorites/${productId}`,
        method: "DELETE",
      }),
      invalidatesTags: ['Favorites'],
    }),
  }),
});

export const {
  useGetUserOrdersQuery,
  useGetUserDiscountsQuery,
  useGetUserFavoritesQuery,
  useAddFavoriteMutation,
  useRemoveFavoriteMutation,
} = userApi;