import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { RootState } from "@/store/store"; // 👈 Подключаем типы стора

export const adminApi = createApi({
  reducerPath: "adminApi",
  baseQuery: fetchBaseQuery({
    // ✅ ИСПРАВЛЕНО: Меняем process.env на import.meta.env
    baseUrl: `${import.meta.env.VITE_API_URL}/api`,
    prepareHeaders: (headers, { getState }) => {
      // ✅ ИСПРАВЛЕНО: Добавляем TypeScript типизацию RootState
      const token = (getState() as RootState).auth?.token;
      
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
      // Авто-обновление каждые 10 секунд
      pollingInterval: 10000, 
    }),
  }),
});

export const { 
  useGetAllOrdersQuery, 
  useUpdateOrderStatusMutation,
  useGetDashboardStatsQuery 
} = adminApi;