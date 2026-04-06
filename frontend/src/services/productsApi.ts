//frontend/src/services/productsApi.ts
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { Product } from "@/types/product";

export interface ProductSuggestion {
  slug: string;
  name: string;
  price: number;
  image: string;
  category: string;
}

// ── API ───────────────────────────────────────────────────────────────────────
export const productsApi = createApi({
  reducerPath: "productsApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${import.meta.env.VITE_API_URL}/api/`,
  }),
  tagTypes: ["Products"],
  endpoints: (builder) => ({
    getAllProducts: builder.query<Product[], string>({
      query: (lang = "en") => `products?lang=${lang}`,
      providesTags: ["Products"],
    }),

    getProductBySlug: builder.query<Product, { slug: string; lang?: string }>({
      query: ({ slug, lang = "en" }) => `products/${slug}?lang=${lang}`,
      providesTags: (result, error, arg) => [{ type: "Products", id: arg.slug }],
    }),

    // Suggestions для autocomplete — вызывается с debounce из SearchModal
    searchProducts: builder.query<
      ProductSuggestion[],
      { q: string; lang?: string; limit?: number }
    >({
      query: ({ q, lang = "en", limit = 6 }) =>
        `products/search?q=${encodeURIComponent(q)}&lang=${lang}&limit=${limit}`,
      // Не кэшируем агрессивно — результаты поиска должны быть свежими
      keepUnusedDataFor: 30,
    }),
  }),
});

export const {
  useGetAllProductsQuery,
  useGetProductBySlugQuery,
  useSearchProductsQuery,
} = productsApi;