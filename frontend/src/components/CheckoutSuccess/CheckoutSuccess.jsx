import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';
import './CheckoutSuccess.css';

const CheckoutSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { token } = useSelector((state) => state.auth);
  const searchParams = new URLSearchParams(location.search);
  const orderToken = searchParams.get('orderToken');
  const paymentIntentId = searchParams.get('payment_intent');
  const redirectStatus = searchParams.get('redirect_status');
  
  const [status, setStatus] = useState('checking');
  const [order, setOrder] = useState(null);
  const [pollCount, setPollCount] = useState(0);

  useEffect(() => {
    if (!orderToken && !paymentIntentId) {
      setStatus('error');
      return;
    }

    checkPaymentStatus();
  }, [orderToken, paymentIntentId, token]);

  const checkPaymentStatus = async () => {
    try {
      console.log("🔄 Checking payment status:", { orderToken, paymentIntentId, redirectStatus });

      // Если есть redirect_status от Stripe
      if (redirectStatus === 'succeeded') {
        setStatus('paid');
        return;
      }

      // Сначала пробуем синхронизировать статус
      if (paymentIntentId || orderToken) {
        const syncResponse = await axios.post(
          `${process.env.REACT_APP_API_URL}/api/stripe/sync-payment-status`,
          { orderToken, paymentIntentId },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        console.log("🔄 Sync response:", syncResponse.data);

        if (syncResponse.data.orderStatus === 'paid') {
          setStatus('paid');
          setOrder(syncResponse.data);
          return;
        }

        if (syncResponse.data.paymentIntentStatus === 'succeeded') {
          setStatus('paid');
          return;
        }
      }

      // Если есть orderToken, опрашиваем статус заказа
      if (orderToken) {
        await pollOrderStatus();
      } else {
        setStatus('timeout');
      }

    } catch (error) {
      console.error('❌ Status check error:', error);
      // Пробуем опрос если есть orderToken
      if (orderToken) {
        await pollOrderStatus();
      } else {
        setStatus('error');
      }
    }
  };

  const pollOrderStatus = async (attempt = 0) => {
    if (attempt >= 30) {
      setStatus('timeout');
      return;
    }

    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/stripe/order-status/${orderToken}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log(`📊 Poll attempt ${attempt}:`, response.data.status);

      if (response.data.status === 'paid') {
        setStatus('paid');
        setOrder(response.data);
      } else if (response.data.status === 'processing') {
        setStatus('processing');
        // Продолжаем опрос
        setTimeout(() => pollOrderStatus(attempt + 1), 2000);
      } else {
        // Продолжаем опрос для pending статуса
        setTimeout(() => pollOrderStatus(attempt + 1), 2000);
      }
    } catch (error) {
      console.error(`❌ Poll attempt ${attempt} failed:`, error);
      setTimeout(() => pollOrderStatus(attempt + 1), 2000);
    }
  };

  const retryPayment = () => {
    navigate('/checkout');
  };

  const goHome = () => {
    navigate('/');
  };

  return (
    <div className="checkout-success">
      <div className="success-container">
        {status === 'paid' && (
          <div className="success-message">
            <div className="success-icon">✅</div>
            <h1>Payment Successful!</h1>
            <p>Thank you for your purchase. Your order has been confirmed.</p>
            {order && (
              <div className="order-details">
                <h3>Order Details</h3>
                <p><strong>Order Number:</strong> {order.orderNumber}</p>
                <p><strong>Amount:</strong> ${order.totalPrice}</p>
                <p><strong>Status:</strong> {order.status}</p>
              </div>
            )}
            <button onClick={goHome} className="home-btn">
              Continue Shopping
            </button>
          </div>
        )}

        {status === 'processing' && (
          <div className="processing-message">
            <div className="processing-spinner"></div>
            <h1>Processing Payment...</h1>
            <p>Your payment is being processed. This may take a few moments.</p>
            <p>Please do not close this page.</p>
          </div>
        )}

        {status === 'checking' && (
          <div className="checking-message">
            <div className="loading-spinner"></div>
            <h1>Verifying Payment...</h1>
            <p>Please wait while we confirm your payment status.</p>
          </div>
        )}

        {status === 'timeout' && (
          <div className="timeout-message">
            <div className="timeout-icon">⚠️</div>
            <h1>Payment Processing</h1>
            <p>Your payment is still being processed. This may take a few minutes.</p>
            <p>You will receive a confirmation email once it's completed.</p>
            <div className="action-buttons">
              <button onClick={retryPayment} className="retry-btn">
                Back to Checkout
              </button>
              <button onClick={goHome} className="home-btn">
                Go Home
              </button>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="error-message">
            <div className="error-icon">❌</div>
            <h1>Payment Issue</h1>
            <p>There was an issue verifying your payment. Please check your email for confirmation or try again.</p>
            <div className="action-buttons">
              <button onClick={retryPayment} className="retry-btn">
                Try Again
              </button>
              <button onClick={goHome} className="home-btn">
                Go Home
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CheckoutSuccess;