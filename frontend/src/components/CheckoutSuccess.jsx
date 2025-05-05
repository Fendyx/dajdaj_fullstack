import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { clearCart } from "../slices/cartSlice";

const CheckoutSuccess = () => {
    const dispatch = useDispatch();
    
    useEffect(() => {
        // Очищаем корзину при загрузке страницы успешной оплаты
        dispatch(clearCart());
    }, [dispatch]);

    return (
        <div className="checkout-success">
            <h2>Checkout Successful</h2>
            <p>Your order has been placed successfully!</p>
            <p>Thank you for your purchase.</p>
        </div>
    );
}

export default CheckoutSuccess;