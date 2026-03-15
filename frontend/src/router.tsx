import { createBrowserRouter } from "react-router-dom";

// Layouts
import { MainLayout } from "@/layouts/MainLayout";

// Pages
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

// Routing
import { PrivateRoute } from "@/components/routing/PrivateRoute";
import { CheckoutSuccess } from "./pages/Checkout/CheckoutSuccess/CheckoutSuccess";

export const router = createBrowserRouter([
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

      // ── Главное изменение: product/:id → products/:slug ──
      { path: "products/:slug", element: <ProductPage /> },

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
]);