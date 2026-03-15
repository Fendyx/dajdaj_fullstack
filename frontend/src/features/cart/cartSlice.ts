import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

// 1️⃣ Типизация (TypeScript теперь будет подсказывать тебе все поля)
export interface CartItem {
  id: string | number;
  price: number;
  cartQuantity: number;
  personalization?: any;
  [key: string]: any; // Для остальных полей товара (name, image и т.д.)
}

interface DeliveryState {
  method: string | null;
  pickupPoint: any | null;
}

interface CartState {
  cartItems: CartItem[];
  cartTotalQuantity: number;
  cartTotalAmount: number;
  delivery: DeliveryState;
}

// 2️⃣ Инициализация (Чтение из localStorage оставляем тут, это допустимо)
const initialState: CartState = {
  cartItems: localStorage.getItem("cartItems")
    ? JSON.parse(localStorage.getItem("cartItems") as string)
    : [],
  cartTotalQuantity: 0,
  cartTotalAmount: 0,
  delivery: {
    method: null,
    pickupPoint: null,
  },
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart(state, action: PayloadAction<any>) {
      const { personalization, ...product } = action.payload;
      
      // 🔥 ФИКС: Берем тот ID, который существует (защита от разницы MERN стека)
      const productId = product._id || product.id;
      
      const existingIndex = state.cartItems.findIndex(
        (item) => (item._id || item.id) === productId
      );

      if (existingIndex >= 0) {
        state.cartItems[existingIndex].cartQuantity += 1;
        if (personalization) {
          state.cartItems[existingIndex].personalization = personalization;
        }
      } else {
        // Добавляем новый товар
        state.cartItems.push({ ...product, id: productId, cartQuantity: 1, personalization });
      }
      
      localStorage.setItem("cartItems", JSON.stringify(state.cartItems));
    },

    decreaseCart(state, action: PayloadAction<{ id: string | number }>) {
      const itemIndex = state.cartItems.findIndex((item) => item.id === action.payload.id);

      if (state.cartItems[itemIndex].cartQuantity > 1) {
        state.cartItems[itemIndex].cartQuantity -= 1;
      } else {
        state.cartItems = state.cartItems.filter((item) => item.id !== action.payload.id);
      }
      localStorage.setItem("cartItems", JSON.stringify(state.cartItems));
    },

    removeFromCart(state, action: PayloadAction<{ id: string | number }>) {
      state.cartItems = state.cartItems.filter((item) => item.id !== action.payload.id);
      localStorage.setItem("cartItems", JSON.stringify(state.cartItems));
    },

    getTotals(state) {
      const { total, quantity } = state.cartItems.reduce(
        (cartTotal, cartItem) => {
          cartTotal.total += cartItem.price * cartItem.cartQuantity;
          cartTotal.quantity += cartItem.cartQuantity;
          return cartTotal;
        },
        { total: 0, quantity: 0 }
      );

      state.cartTotalQuantity = quantity;
      state.cartTotalAmount = parseFloat(total.toFixed(2));
    },

    clearCart(state) {
      state.cartItems = [];
      localStorage.setItem("cartItems", JSON.stringify(state.cartItems));
    },

    setDeliveryMethod(state, action: PayloadAction<string | null>) {
      state.delivery.method = action.payload;
      state.delivery.pickupPoint = null;
    },

    setPickupPoint(state, action: PayloadAction<any>) {
      state.delivery.pickupPoint = action.payload;
    },
  },
});

export const {
  addToCart,
  decreaseCart,
  removeFromCart,
  getTotals,
  clearCart,
  setDeliveryMethod,
  setPickupPoint,
} = cartSlice.actions;

export default cartSlice.reducer;