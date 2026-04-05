import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/store/hooks"; 
import { useTrack } from '@/hooks/useTrack';
import { clearCart } from "@/features/cart/cartSlice";
import { CheckCircle, PackageOpen, ArrowRight, Loader2 } from "lucide-react"; 
import "./CheckoutSuccess.css";
import { LottiePlayer } from "@/features/marketing/components/HeroBanner/LottiePlayer";

function ImageWithFallback({ src, alt }: { src: string; alt: string }) {
  const [error, setError] = React.useState(false);
  return (
    <img
      src={!error && src ? src : "https://via.placeholder.com/150?text=Image+not+available"}
      alt={alt}
      onError={() => setError(true)}
      className="che-product-image"
    />
  );
}

export function CheckoutSuccess() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate(); 
  const { token } = useAppSelector((state) => state.auth); 

  const [order, setOrder] = useState<any>(null);
  const [status, setStatus] = useState("idle");
  const [personalImage, setPersonalImage] = useState<string | null>(null); // ← фото юзера
  const mountedRef = useRef(true);

  useEffect(() => {
    dispatch(clearCart());
    return () => { mountedRef.current = false; };
  }, [dispatch]);

  const params = new URLSearchParams(window.location.search);
  const orderToken = params.get("orderToken");
  const API = import.meta.env.VITE_API_URL || "";

  const track = useTrack();
  useEffect(() => {
    if (status === 'paid' && order) {
      track('order_complete', { 
        orderId: order.orderId,
        total: order.totalPrice 
      });
    }
  }, [status]);

  // ← Подгружаем фото из personalOrder когда заказ загружен
  useEffect(() => {
    if (!order?.products) return;
    const personalOrderId = order.products[0]?.personalOrderId;
    if (!personalOrderId) return;

    axios.get(`${API}/api/personal-orders/${personalOrderId}`)
      .then(res => setPersonalImage(res.data.images?.[0] ?? null))
      .catch(() => {});
  }, [order]);

  useEffect(() => {
    if (!orderToken) return;

    let attempts = 0;
    const maxAttempts = 40;
    mountedRef.current = true;
    setStatus("waiting");

    const attemptFetch = async () => {
      if (!mountedRef.current) return;
      attempts += 1;

      try {
        console.log(`🔄 Polling attempt ${attempts} for order: ${orderToken}`);

        const config: any = {};
        if (token) {
          config.headers = { Authorization: `Bearer ${token}` };
        }

        const res = await axios.get(
          `${API}/api/stripe/order-status/${encodeURIComponent(orderToken)}`,
          { timeout: 10000, ...config }
        );

        if (!mountedRef.current) return;
        const data = res.data;
        console.log(`✅ Order found:`, { status: data.status, orderId: data.orderId });
        setOrder(data);

        if (data.status === "paid") {
          setStatus("paid");
          return;
        }

        if (attempts >= 5 && data.status === "pending") {
          console.log("🔍 Checking payment status directly with Stripe...");
          try {
            const paymentCheck = await axios.post(
              `${API}/api/stripe/sync-payment-status`, 
              { orderToken },
              { timeout: 15000, ...config } 
            );

            if (paymentCheck.data.orderStatus === "paid") {
              const updatedOrder = await axios.get(
                `${API}/api/stripe/order-status/${encodeURIComponent(orderToken)}`,
                { timeout: 10000, ...config }
              );
              setOrder(updatedOrder.data);
              setStatus("paid");
              return;
            }
          } catch (paymentErr: any) {
            console.log("⚠️ Payment check failed:", paymentErr.message);
          }
        }

        if (attempts < maxAttempts) {
          const delay = Math.min(5000, 1000 * Math.floor(attempts / 3));
          setTimeout(attemptFetch, delay);
        } else {
          setStatus("timeout");
        }
      } catch (err: any) {
        if (!mountedRef.current) return;

        const statusCode = err.response?.status;

        if (statusCode === 403) {
          console.warn("🔒 Access denied. Redirecting to login.");
          const returnUrl = `/checkout-success?orderToken=${orderToken}`;
          navigate(`/login?redirect=${encodeURIComponent(returnUrl)}`);
          return; 
        }

        if (statusCode === 404 && attempts < 10) { 
          const delay = Math.min(2000, 300 * attempts);
          setTimeout(attemptFetch, delay);
        } else if (statusCode === 404) {
          setStatus("not_found");
        } else if (attempts < maxAttempts) {
          setTimeout(attemptFetch, 1500);
        } else {
          setStatus("error");
        }
      }
    };

    setTimeout(attemptFetch, 1000);
    return () => { mountedRef.current = false; };
  }, [orderToken, API, token, navigate]); 

  if (!orderToken) {
    return (
      <div className="che-container">
        <h1 className="che-thank-you">Order not found</h1>
        <p className="che-confirmation-text">Missing order token in URL.</p>
        <button className="che-btn-secondary" onClick={() => navigate("/")}>
          Back to Home
        </button>
      </div>
    );
  }

  if (status === "waiting" || status === "idle") {
    return (
      <div className="che-container">
        <div className="che-loading-spinner text-blue-500 mb-6">
          <Loader2 className="animate-spin" size={48} />
        </div>
        <h1 className="che-thank-you">Processing your order...</h1>
        <p className="che-confirmation-text">
          We are confirming your payment and preparing order details.
          This usually takes a few seconds.
        </p>
      </div>
    );
  }

  if (status === "not_found" || status === "timeout" || status === "error") {
    return (
      <div className="che-container">
        <h1 className="che-thank-you">Processing your order</h1>
        <p className="che-confirmation-text">
          {status === "not_found"
            ? "Your order is being processed. If your payment was successful, the order will appear shortly."
            : "We're still processing your payment. This can take a few minutes."
          }
          <br /><br />
          You can safely close this page and check your email for confirmation.
          Your order will appear in "My Orders" once processing is complete.
        </p>
        <div className="che-buttons">
          <button className="che-btn-primary" onClick={() => window.location.reload()}>
            Check Status Again
            <ArrowRight size={20} className="che-arrow-icon" />
          </button>
          <button className="che-btn-secondary" onClick={() => navigate("/profile")}>
            View My Orders
          </button>
        </div>
      </div>
    );
  }

  const orderNumber = order?.orderNumber || `#${String(order?.orderId || "").slice(-8)}`;
  const firstProduct = order?.products?.[0] || {};

  return (
    <div className="che-container">
      <div className="che-icon-wrapper">
        <div className="che-icon-bg"></div>
        <div className="che-icon-foreground"></div>
      </div>
      <LottiePlayer />

      <h1 className="che-thank-you">Thank you for your purchase!</h1>
      <p className="che-confirmation-text">
        Your order has been placed successfully. You can track it in "My Orders".
      </p>

      <div className="che-order-number">
        <PackageOpen className="che-order-icon" size={20} />
        <span>Order {orderNumber}</span>
      </div>

      <div className="che-product-card">
        <div className="che-product-details">
          <div className="che-image-container">
            {/* ← personalImage если есть, иначе фото продукта */}
            <ImageWithFallback 
              src={personalImage ?? firstProduct?.image} 
              alt={firstProduct?.name || "Product"} 
            />
          </div>

          <div className="che-product-info flex-1">
            <h3 className="text-lg font-bold mb-1">{firstProduct?.name}</h3>
            <p className="text-sm text-gray-500 mb-2">
              Quantity: {firstProduct?.quantity}
              {order?.products && order.products.length > 1 && ` (+${order.products.length - 1} more)`}
            </p>
            <span className="che-price text-lg font-bold text-blue-600">{order?.totalPrice} PLN</span>
          </div>

          <div className="che-status-icon hidden sm:flex">
            <CheckCircle className="che-small-success-icon" size={24} />
          </div>
        </div>
      </div>

      <div className="che-buttons">
        <button className="che-btn-primary" onClick={() => navigate("/profile")}>
          View My Orders
          <ArrowRight size={20} className="che-arrow-icon" />
        </button>

        <button className="che-btn-secondary" onClick={() => navigate("/")}>
          Continue Shopping
        </button>
      </div>

      <p className="che-email-note">
        A confirmation email has been sent to {order?.deliveryInfo?.email || "your email"}.
      </p>
    </div>
  );
}