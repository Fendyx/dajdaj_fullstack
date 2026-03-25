import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { RootState } from "@/store/store";
import type { CategoryConfig } from "@/services/categoriesApi";

export const adminCategoriesApi = createApi({
  reducerPath: "adminCategoriesApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${import.meta.env.VITE_API_URL}/api`,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth?.token;
      if (token) headers.set("Authorization", `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ["AdminCategory"],
  endpoints: (builder) => ({
    getAdminCategories: builder.query<CategoryConfig[], void>({
      query: () => "/admin/categories",
      providesTags: ["AdminCategory"],
    }),
    createCategory: builder.mutation<CategoryConfig, Partial<CategoryConfig>>({
      query: (body) => ({ url: "/admin/categories", method: "POST", body }),
      invalidatesTags: ["AdminCategory"],
    }),
    updateCategory: builder.mutation<CategoryConfig, { id: string; data: Partial<CategoryConfig> }>({
      query: ({ id, data }) => ({ url: `/admin/categories/${id}`, method: "PATCH", body: data }),
      invalidatesTags: ["AdminCategory"],
    }),
    deleteCategory: builder.mutation<void, string>({
      query: (id) => ({ url: `/admin/categories/${id}`, method: "DELETE" }),
      invalidatesTags: ["AdminCategory"],
    }),
  }),
});

export const {
  useGetAdminCategoriesQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
} = adminCategoriesApi;