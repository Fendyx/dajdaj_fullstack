//frontend/src/services/productsApi.ts
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// ── Типы ──────────────────────────────────────────────────────────────────────
export interface Specification {
  label: string;
  value: string;
}

export interface OrderExample {
  image: string;
  caption: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface Product {
  slug: string;
  name: string;
  price: number;
  image: string;
  images?: string[];
  category: string;
  description?: string;
  descriptionProductPage?: string;
  isNew?: boolean;
  isPopular?: boolean;
  isPersonalized?: boolean;
  personalizationType?: string | null;
  phrases?: string[];
  threeDModelSrc?: string | null;
  specifications?: Specification[];
  orderExamples?: OrderExample[];
  faq?: FaqItem[];
  sortOrder?: number;
}

// Лёгкий объект который возвращает /search endpoint
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