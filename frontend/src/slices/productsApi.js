import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const productsApi = createApi({
  reducerPath: "productsApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${process.env.REACT_APP_API_URL}/`,
  }),
  endpoints: (builder) => ({
    getAllProducts: builder.query({
      query: (lang = "en") => `products?lang=${lang}`,
    }),

    // Новый эндпоинт для загрузки продукта по slug
    getProductBySlug: builder.query({
      query: ({ slug, lang = "en" }) => `products/slug/${slug}?lang=${lang}`,
    }),
  }),
});

// Экспортируем хуки
export const { 
  useGetAllProductsQuery, 
  useGetProductBySlugQuery 
} = productsApi;
