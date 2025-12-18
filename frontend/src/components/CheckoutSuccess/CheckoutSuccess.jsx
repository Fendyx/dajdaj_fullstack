import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux"; // 1. Добавлен useSelector
import { clearCart } from "../../slices/cartSlice";
import { FaCheckCircle, FaBoxOpen, FaArrowRight, FaSpinner } from "react-icons/fa";
import { useNavigate } from "react-router-dom"; // 2. Добавлен useNavigate
import "./CheckoutSuccess.css";

function ImageWithFallback({ src, alt }) {
  const [error, setError] = React.useState(false);
  return (
    <img
      src={!error ? src : "https://via.placeholder.com/150?text=Image+not+available"}
      alt={alt}
      onError={() => setError(true)}
      className="che-product-image"
    />
  );
}

export default function CheckoutSuccess() {
  const dispatch = useDispatch();
  const navigate = useNavigate(); // 3. Инициализация навигации
  const { token } = useSelector((state) => state.auth); // 4. Получаем токен из Redux

  const [order, setOrder] = useState(null);
  const [status, setStatus] = useState("idle"); // idle, waiting, paid, timeout, not_found, error
  const mountedRef = useRef(true);

  useEffect(() => {
    dispatch(clearCart());
    return () => { mountedRef.current = false; };
  }, [dispatch]);

  const params = new URLSearchParams(window.location.search);
  const orderToken = params.get("orderToken");
  const API = process.env.REACT_APP_API_URL || "";

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

        // 5. Конфигурация заголовков (отправляем токен, если он есть)
        const config = {};
        if (token) {
          config.headers = { Authorization: `Bearer ${token}` };
        }

        // ВАЖНО: Убедись, что путь совпадает с твоим backend (обычно api/stripe/order-status)
        const res = await axios.get(
          `${API}/api/stripe/order-status/${encodeURIComponent(orderToken)}`,
          { 
            timeout: 10000,
            ...config // 6. Передаем конфиг с токеном
          }
        );

        if (!mountedRef.current) return;
        const data = res.data;
        console.log(`✅ Order found:`, { status: data.status, orderId: data.orderId });
        setOrder(data);

        if (data.status === "paid") {
          setStatus("paid");
          return;
        }

        // Если заказ все еще pending после 5 попыток, проверяем статус платежа в Stripe
        if (attempts >= 5 && data.status === "pending") {
          console.log("🔍 Checking payment status directly with Stripe...");
          try {
            const paymentCheck = await axios.post(
              `${API}/api/stripe/sync-payment-status`, // Убедись в правильности пути
              { orderToken },
              { timeout: 15000, ...config } // Тоже передаем токен
            );
            console.log("💰 Payment check result:", paymentCheck.data);

            if (paymentCheck.data.orderStatus === "paid") {
              // Повторный запрос за обновленным заказом
              const updatedOrder = await axios.get(
                `${API}/api/stripe/order-status/${encodeURIComponent(orderToken)}`,
                { timeout: 10000, ...config }
              );
              setOrder(updatedOrder.data);
              setStatus("paid");
              return;
            }
          } catch (paymentErr) {
            console.log("⚠️ Payment check failed:", paymentErr.message);
          }
        }

        // Продолжаем опрос
        if (attempts < maxAttempts) {
          const delay = Math.min(5000, 1000 * Math.floor(attempts / 3));
          console.log(`⏳ Order not paid yet, waiting ${delay}ms for next attempt`);
          setTimeout(attemptFetch, delay);
        } else {
          console.log(`⏰ Timeout after ${maxAttempts} attempts`);
          setStatus("timeout");
        }
      } catch (err) {
        if (!mountedRef.current) return;

        const statusCode = err.response?.status;
        console.log(`❌ Polling attempt ${attempts} failed:`, {
          statusCode,
          error: err.message
        });

        // 7. ОБРАБОТКА ОШИБКИ ДОСТУПА (403)
        if (statusCode === 403) {
          console.warn("🔒 Access denied. Redirecting to login.");
          const returnUrl = `/checkout-success?orderToken=${orderToken}`;
          // Редирект на логин, чтобы после входа вернуть пользователя сюда
          navigate(`/login?redirect=${encodeURIComponent(returnUrl)}`);
          return; // Останавливаем поллинг
        }

        if (statusCode === 404 && attempts < 10) { 
          const delay = Math.min(2000, 300 * attempts);
          console.log(`🔄 Order not found yet, retrying in ${delay}ms`);
          setTimeout(attemptFetch, delay);
        } else if (statusCode === 404) {
          console.log(`🔍 Order not found after ${attempts} attempts`);
          setStatus("not_found");
        } else if (attempts < maxAttempts) {
          setTimeout(attemptFetch, 1500);
        } else {
          console.log(`💥 Final error after ${attempts} attempts:`, err);
          setStatus("error");
        }
      }
    };

    setTimeout(attemptFetch, 1000);
    return () => { mountedRef.current = false; };
  }, [orderToken, API, token, navigate]); // Добавлены зависимости

  if (!orderToken) {
    return (
      <div className="che-container">
        <h1 className="che-thank-you">Order not found</h1>
        <p className="che-confirmation-text">Missing order token in URL.</p>
        <button className="che-btn-secondary" onClick={() => (window.location.href = "/")}>
          Back to Home
        </button>
      </div>
    );
  }

  if (status === "waiting" || status === "idle") {
    return (
      <div className="che-container">
        <div className="che-loading-spinner">
          <FaSpinner className="che-spinner-icon" />
        </div>
        <h1 className="che-thank-you">Processing your order...</h1>
        <p className="che-confirmation-text">
          We are confirming your payment and preparing order details.
          This usually takes a few seconds.
        </p>
        <div className="che-loading-dots">
          <span></span>
          <span></span>
          <span></span>
        </div>
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
            <FaArrowRight className="che-arrow-icon" />
          </button>
          <button className="che-btn-secondary" onClick={() => (window.location.href = "/profile")}>
            View My Orders
          </button>
          <button className="che-btn-secondary" onClick={() => (window.location.href = "/")}>
            Back to Home
          </button>
        </div>
        <p className="che-email-note">
          Check your email for order confirmation. Contact support if you don't receive it within 15 minutes.
        </p>
      </div>
    );
  }

  // status === "paid" and we have order
  const orderNumber = order.orderNumber || `#${String(order.orderId || "").slice(-8)}`;
  const firstProduct = order.products?.[0] || {};

  return (
    <div className="che-container">
      <div className="che-icon-wrapper">
        <div className="che-icon-bg"></div>
        <div className="che-icon-foreground">
          <FaCheckCircle className="che-success-icon" />
        </div>
      </div>

      <h1 className="che-thank-you">Thank you for your purchase!</h1>
      <p className="che-confirmation-text">
        Your order has been placed successfully. You can track it in "My Orders".
      </p>

      <div className="che-order-number">
        <FaBoxOpen className="che-order-icon" />
        <span>Order {orderNumber}</span>
      </div>

      <div className="che-product-card">
        <div className="che-product-details">
          <div className="che-image-container">
            <ImageWithFallback
              src={firstProduct?.image}
              alt={firstProduct?.name || "Product"}
            />
          </div>

          <div className="che-product-info">
            <h3>{firstProduct?.name}</h3>
            <p>
              Quantity: {firstProduct?.quantity}
              {order.products && order.products.length > 1 && ` (+${order.products.length - 1} more)`}
            </p>
            <span className="che-price">{order.totalPrice} PLN</span>
          </div>

          <div className="che-status-icon">
            <FaCheckCircle className="che-small-success-icon" />
          </div>
        </div>
      </div>

      <div className="che-buttons">
        <button className="che-btn-primary" onClick={() => (window.location.href = "/profile")}>
          View My Orders
          <FaArrowRight className="che-arrow-icon" />
        </button>

        <button className="che-btn-secondary" onClick={() => (window.location.href = "/")}>
          Continue Shopping
        </button>
      </div>

      <p className="che-email-note">
        A confirmation email has been sent to {order.deliveryInfo?.email || "your email"}.
        <br />
        You will receive shipping updates via email.
      </p>
    </div>
  );
}