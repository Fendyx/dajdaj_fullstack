import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { RootState } from "@/store/store";

export interface OrderProduct {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  personalOrderId?: string;
}

export interface Order {
  _id: string;
  orderNumber: string;
  orderToken: string;
  paymentIntentId?: string;
  userId?: { _id: string; email: string; name: string } | null;
  products: OrderProduct[];
  totalPrice: number;
  status: "pending" | "processing" | "paid" | "shipping" | "delivered" | "canceled" | "failed";
  createdAt: string;
  deliveryInfo?: {
    method?: string;
    name?: string;
    phone?: string;
    address?: { street?: string; city?: string; postalCode?: string };
    email?: string;
  };
}

export const adminOrdersApi = createApi({
  reducerPath: "adminOrdersApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${import.meta.env.VITE_API_URL}/api`,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth?.token;
      if (token) headers.set("Authorization", `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ["Orders"],
  endpoints: (builder) => ({
    getAllOrders: builder.query<Order[], void>({
      query: () => "/orders",
      // Сортируем на клиенте: самый новый сверху
      transformResponse: (res: Order[]) =>
        [...res].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        ),
      providesTags: ["Orders"],
    }),
    updateOrderStatus: builder.mutation<Order, { orderId: string; status: Order["status"] }>({
      query: ({ orderId, status }) => ({
        url: `/orders/${orderId}/status`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: ["Orders"],
    }),
  }),
});

export const { useGetAllOrdersQuery, useUpdateOrderStatusMutation } = adminOrdersApi;