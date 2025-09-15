import { createSlice } from "@reduxjs/toolkit";
import notify from "../utils/notify";
import i18n from "../i18n"; // импортируем i18n прямо сюда

const initialState = {
  cartItems: localStorage.getItem("cartItems")
    ? JSON.parse(localStorage.getItem("cartItems"))
    : [],
  cartTotalQuantity: 0,
  cartTotalAmount: 0,
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart(state, action) {
      const toastId = "cart-action";
      const { personalization, ...product } = action.payload;

      const existingIndex = state.cartItems.findIndex(
        (item) => item.id === product.id
      );

      if (existingIndex >= 0) {
        state.cartItems[existingIndex] = {
          ...state.cartItems[existingIndex],
          cartQuantity: state.cartItems[existingIndex].cartQuantity + 1,
          ...(personalization && { personalization })
        };

        notify.info(
          personalization
            ? i18n.t("cartToasts.personalizedUpdated")
            : i18n.t("cartToasts.quantityIncreased"),
          { position: "bottom-left", toastId, autoClose: 2000 }
        );
      } else {
        const tempProductItem = {
          ...product,
          cartQuantity: 1,
          ...(personalization && { personalization })
        };
        state.cartItems.push(tempProductItem);

        notify.success(
          personalization
            ? i18n.t("cartToasts.personalizedAdded")
            : i18n.t("cartToasts.added"),
          { position: "bottom-left", toastId, autoClose: 2000 }
        );
      }

      localStorage.setItem("cartItems", JSON.stringify(state.cartItems));
    },

    decreaseCart(state, action) {
      const toastId = "cart-action";
      const itemIndex = state.cartItems.findIndex(
        (item) => item.id === action.payload.id
      );

      if (state.cartItems[itemIndex].cartQuantity > 1) {
        state.cartItems[itemIndex].cartQuantity -= 1;

        notify.info(i18n.t("cartToasts.quantityDecreased"), {
          position: "bottom-left",
          toastId,
          autoClose: 2000,
        });
      } else if (state.cartItems[itemIndex].cartQuantity === 1) {
        state.cartItems = state.cartItems.filter(
          (item) => item.id !== action.payload.id
        );

        notify.error(i18n.t("cartToasts.removed"), {
          position: "bottom-left",
          toastId,
          autoClose: 2000,
        });
      }

      localStorage.setItem("cartItems", JSON.stringify(state.cartItems));
    },

    removeFromCart(state, action) {
      const toastId = "cart-action";
      state.cartItems = state.cartItems.filter(
        (cartItem) => cartItem.id !== action.payload.id
      );

      localStorage.setItem("cartItems", JSON.stringify(state.cartItems));

      notify.error(i18n.t("cartToasts.removed"), {
        position: "bottom-left",
        toastId,
        autoClose: 2000,
      });
    },

    getTotals(state) {
      let { total, quantity } = state.cartItems.reduce(
        (cartTotal, cartItem) => {
          const { price, cartQuantity } = cartItem;
          cartTotal.total += price * cartQuantity;
          cartTotal.quantity += cartQuantity;
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

      const toastId = "cart-action";
      notify.error(i18n.t("cartToasts.cleared"), {
        position: "bottom-left",
        toastId,
        autoClose: 2000,
      });
    },
  },
});

export const { addToCart, decreaseCart, removeFromCart, getTotals, clearCart } =
  cartSlice.actions;

export default cartSlice.reducer;
