import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const adminUsersApi = createApi({
  reducerPath: "adminUsersApi",
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.REACT_APP_API_URL + "/api",
    prepareHeaders: (headers, { getState }) => {
      const token = getState().auth?.token;
      if (token) headers.set("Authorization", `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ["Users"],
  endpoints: (builder) => ({
    getAllUsers: builder.query({
      query: () => "/users",
      providesTags: ["Users"],
    }),
    deleteUser: builder.mutation({
      query: (id) => ({
        url: `/users/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Users"],
    }),
    getAdmins: builder.query({
      query: () => "/users/admins",
      providesTags: ["Users"],
    }),
    findUserByEmail: builder.query({
      query: (email) => `/users/find-by-email?email=${encodeURIComponent(email)}`,
    }),
    promoteUserToAdmin: builder.mutation({
      query: (id) => ({
        url: `/users/promote/${id}`,
        method: "PUT",
      }),
      invalidatesTags: ["Users"],
    }),
  }),
});

export const {
  useGetAllUsersQuery,
  useDeleteUserMutation,
  useGetAdminsQuery,
  useFindUserByEmailQuery,
  usePromoteUserToAdminMutation,
} = adminUsersApi;


