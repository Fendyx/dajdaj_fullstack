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
        // ✅ ИСПРАВЛЕНИЕ: Твой backend (auth.js) ждет именно этот формат
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
    }),
  }),
});

export const { 
  useGetAllOrdersQuery, 
  useUpdateOrderStatusMutation,
  useGetDashboardStatsQuery 
} = adminApi;