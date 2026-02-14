// src/slices/adminApi.js
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const adminApi = createApi({
  reducerPath: "adminApi",
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.REACT_APP_API_URL + '/api',
    prepareHeaders: (headers, { getState }) => {
      // Получаем токен из Redux стейта
      const token = getState().auth?.token;
      
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Orders', 'Analytics'],
  endpoints: (builder) => ({
    // Получение всех заказов
    getAllOrders: builder.query({
      query: () => "/orders",
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

    // Получение статистики
    getDashboardStats: builder.query({
      query: () => "/analytics/dashboard-stats",
      providesTags: ['Analytics'],
      // Авто-обновление каждые 30 секунд (чтобы видеть лайв трафик)
      pollingInterval: 30000, 
    }),
  }),
});

export const { 
  useGetAllOrdersQuery, 
  useUpdateOrderStatusMutation,
  useGetDashboardStatsQuery 
} = adminApi;