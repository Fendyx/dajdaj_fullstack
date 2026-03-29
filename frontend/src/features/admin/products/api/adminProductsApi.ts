import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { RootState } from "@/store/store";

export interface ProductRaw {
  _id: string;
  slug: string;
  name: { en: string; pl: string };
  description: { en: string; pl: string };
  descriptionProductPage: { en: string; pl: string };
  price: number;
  category: string;
  keywords: { en: string[]; pl: string[] }; // ← добавлено
  image: string;
  images: string[];
  threeDModelSrc: string | null;
  isNew: boolean;
  isPopular: boolean;
  isPersonalized: boolean;
  personalizationType: string | null;
  phrases: { en: string[]; pl: string[] };
  specifications: { label: { en: string; pl: string }; value: { en: string; pl: string } }[];
  orderExamples: { image: string; caption: { en: string; pl: string } }[];
  faq: { question: { en: string; pl: string }; answer: { en: string; pl: string } }[];
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export const adminProductsApi = createApi({
  reducerPath: "adminProductsApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${import.meta.env.VITE_API_URL}/api`,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth?.token;
      if (token) headers.set("Authorization", `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ["AdminProducts"],
  endpoints: (builder) => ({
    getAdminProducts: builder.query<ProductRaw[], void>({
      query: () => "/admin/products",
      providesTags: ["AdminProducts"],
    }),
    updateProduct: builder.mutation<ProductRaw, { id: string; data: Partial<ProductRaw> }>({
      query: ({ id, data }) => ({
        url: `/admin/products/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["AdminProducts"],
    }),
    deleteProduct: builder.mutation<{ message: string }, string>({
      query: (id) => ({ url: `/admin/products/${id}`, method: "DELETE" }),
      invalidatesTags: ["AdminProducts"],
    }),
  }),
});

export const {
  useGetAdminProductsQuery,
  useUpdateProductMutation,
  useDeleteProductMutation,
} = adminProductsApi;