import { createBrowserRouter, Navigate } from "react-router-dom";
// Layouts
import { MainLayout } from "@/layouts/MainLayout";
import { AdminLayout } from "@/layouts/AdminLayout";
// Pages — Shop
import { HomePage } from "@/pages/Home/HomePage";
import { ProfilePage } from "@/pages/Profile/ProfilePage";
import { ProductPage } from "@/pages/Product/ProductPage";
import { CartPage } from "@/pages/Cart/CartPage";
import { CheckoutPage } from "@/pages/Checkout/CheckoutPage";
import { LoginPage } from "@/pages/Auth/LoginPage";
import { RegisterPage } from "@/pages/Auth/RegisterPage";
import { PrivacyPolicyPage } from "@/pages/Legal/PrivacyPolicyPage";
import { TermsPage } from "@/pages/Legal/TermsPage";
import NotFound from "./pages/NotFound/NotFound";
import { CheckoutSuccess } from "./pages/Checkout/CheckoutSuccess/CheckoutSuccess";
import { SearchPage } from "@/pages/Search/SearchPage"; // ← новый импорт
// Pages — Admin
import { OrdersPage } from "@/features/admin/orders/OrdersPage";
import { UsersPage } from "@/features/admin/users/UsersPage";
import { ProductsPage } from "@/features/admin/products/ProductsPage";
import { CategoriesPage } from "@/features/admin/categories/CategoriesPage";
// Routing guards
import { PrivateRoute } from "@/components/routing/PrivateRoute";
import { AdminRoute } from "@/components/routing/AdminRoute";

export const router = createBrowserRouter([
  // ── SHOP ────────────────────────────────────────────────────
  {
    path: "/",
    element: <MainLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "login", element: <LoginPage /> },
      { path: "register", element: <RegisterPage /> },
      { path: "cart", element: <CartPage /> },
      { path: "checkout-stripe", element: <CheckoutPage /> },
      { path: "checkout-success", element: <CheckoutSuccess /> },
      { path: "products/:slug", element: <ProductPage /> },
      { path: "search", element: <SearchPage /> }, // ← новый роут
      { path: "privacy", element: <PrivacyPolicyPage /> },
      { path: "terms", element: <TermsPage /> },
      {
        path: "profile",
        element: (
          <PrivateRoute>
            <ProfilePage />
          </PrivateRoute>
        ),
      },
      { path: "*", element: <NotFound /> },
    ],
  },
  // ── ADMIN ────────────────────────────────────────────────────
  {
    path: "/admin",
    element: (
      <AdminRoute>
        <AdminLayout />
      </AdminRoute>
    ),
    children: [
      { index: true, element: <Navigate to="orders" replace /> },
      { path: "orders", element: <OrdersPage /> },
      { path: "users", element: <UsersPage /> },
      { path: "products", element: <ProductsPage /> },
      { path: "categories", element: <CategoriesPage /> },
    ],
  },
]);