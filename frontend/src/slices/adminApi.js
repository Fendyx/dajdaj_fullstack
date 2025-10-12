// src/slices/adminApi.js
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const adminApi = createApi({
  reducerPath: "adminApi",
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.REACT_APP_API_URL + '/api',
    prepareHeaders: (headers, { getState }) => {
      const token = getState().auth?.token;
      if (token) headers.set("Authorization", `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ['Orders'],
  endpoints: (builder) => ({
    // Получение всех заказов
    getAllOrders: builder.query({
      query: () => "/orders", // должен быть роут на сервере, который возвращает все заказы
      providesTags: ['Orders'],
    }),

    // Изменение статуса заказа
    updateOrderStatus: builder.mutation({
      query: ({ orderId, status }) => ({
        url: `/orders/${orderId}/status`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: ['Orders'],
    }),
  }),
});

export const { useGetAllOrdersQuery, useUpdateOrderStatusMutation } = adminApi;
