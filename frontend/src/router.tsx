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
import { SearchPage } from "@/pages/Search/SearchPage";
// Pages — Help Center
import { HelpCenterPage } from "@/pages/Help/HelpCenterPage";
import { HowToOrderPage } from "@/pages/Help/articles/HowToOrderPage";
import { PersonalizationPage } from "@/pages/Help/articles/PersonalizationPage";
import { DeliveryPage } from "@/pages/Help/articles/DeliveryPage";
import { PaymentsPage } from "@/pages/Help/articles/PaymentsPage";
import { ReturnsPage } from "@/pages/Help/articles/ReturnsPage";
import { DeleteAccountPage } from "@/pages/Help/articles/DeleteAccountPage";
import { PhotoTipsPage } from "@/pages/Help/articles/PhotoTipsPage";
// Pages — Admin
import { OrdersPage } from "@/features/admin/orders/OrdersPage";
import { UsersPage } from "@/features/admin/users/UsersPage";
import { ProductsPage } from "@/features/admin/products/ProductsPage";
import { CategoriesPage } from "@/features/admin/categories/CategoriesPage";
// Routing guards
import { PrivateRoute } from "@/components/routing/PrivateRoute";
import { AdminRoute } from "@/components/routing/AdminRoute";
import { AnalyticsPage } from "./features/admin/analytics/AnalyticsPage";

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
      { path: "search", element: <SearchPage /> },
      { path: "privacy", element: <PrivacyPolicyPage /> },
      { path: "terms", element: <TermsPage /> },
      // ── HELP CENTER ──────────────────────────────────────────
      { path: "pl/pomoc", element: <HelpCenterPage /> },
      { path: "pl/pomoc/jak-zlozyc-zamowienie", element: <HowToOrderPage /> },
      { path: "pl/pomoc/personalizacja-figurki", element: <PersonalizationPage /> },
      { path: "pl/pomoc/dostawa-i-terminy", element: <DeliveryPage /> },
      { path: "pl/pomoc/platnosci", element: <PaymentsPage /> },
      { path: "pl/pomoc/zwroty-i-reklamacje", element: <ReturnsPage /> },
      { path: "pl/pomoc/jak-usunac-konto", element: <DeleteAccountPage /> },
      { path: "pl/pomoc/jak-zrobic-zdjecie", element: <PhotoTipsPage /> },
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
      { path: "analytics", element: <AnalyticsPage /> },
    ],
  },
]);