import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { RootState } from "@/store/store";

export interface UserListItem {
  _id: string;
  clientId: number;
  name: string;
  email: string;
  cardNumber: string;
  registrationDate: string;
  role: "user" | "admin" | "superadmin";
}

export interface UserFull extends UserListItem {
  discounts: { code: string; value: number; expiresAt: string }[];
  favorites: string[];
  deliveryDatas: {
    deliveryId: number;
    personalData: { name?: string; surname?: string; email?: string; phone?: string };
    delivery: { address?: string; method?: string };
  }[];
  defaultDeliveryId: number | null;
  gdprConsent: { accepted: boolean; acceptedAt?: string; version?: string } | null;
}

export const adminUsersApi = createApi({
  reducerPath: "adminUsersApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${import.meta.env.VITE_API_URL}/api`,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth?.token;
      if (token) headers.set("Authorization", `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ["Users"],
  endpoints: (builder) => ({
    getAllUsers: builder.query<UserListItem[], void>({
      query: () => "/users",
      providesTags: ["Users"],
    }),
    getUserById: builder.query<UserFull, string>({
      query: (id) => `/users/${id}`,
      providesTags: (_res, _err, id) => [{ type: "Users", id }],
    }),
    deleteUser: builder.mutation<{ message: string }, string>({
      query: (id) => ({ url: `/users/${id}`, method: "DELETE" }),
      invalidatesTags: ["Users"],
    }),
    promoteUserToAdmin: builder.mutation<{ message: string; user: UserListItem }, string>({
      query: (id) => ({ url: `/users/promote/${id}`, method: "PUT" }),
      invalidatesTags: ["Users"],
    }),
  }),
});

export const {
  useGetAllUsersQuery,
  useGetUserByIdQuery,
  useDeleteUserMutation,
  usePromoteUserToAdminMutation,
} = adminUsersApi;