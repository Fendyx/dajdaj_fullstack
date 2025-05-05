import { createSlice } from "@reduxjs/toolkit";
import { toast } from "react-toastify";

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
      const toastId = "cart-action"; // Общий toastId для всех действий с корзиной

      const existingIndex = state.cartItems.findIndex(
        (item) => item.id === action.payload.id
      );

      if (existingIndex >= 0) {
        state.cartItems[existingIndex] = {
          ...state.cartItems[existingIndex],
          cartQuantity: state.cartItems[existingIndex].cartQuantity + 1,
        };

        // Проверяем, существует ли уже тост с этим ID
        if (toast.isActive(toastId)) {
          toast.update(toastId, {
            render: "Increased product quantity",
            type: toast.TYPE.INFO,
            position: "bottom-left",
            autoClose: 2000,
          });
        } else {
          toast.info("Increased product quantity", {
            position: "bottom-left",
            toastId,
            autoClose: 2000,
          });
        }
      } else {
        let tempProductItem = { ...action.payload, cartQuantity: 1 };
        state.cartItems.push(tempProductItem);

        if (toast.isActive(toastId)) {
          toast.update(toastId, {
            render: "Product added to cart",
            type: toast.TYPE.SUCCESS,
            position: "bottom-left",
            autoClose: 2000,
          });
        } else {
          toast.success("Product added to cart", {
            position: "bottom-left",
            toastId,
            autoClose: 2000,
          });
        }
      }

      localStorage.setItem("cartItems", JSON.stringify(state.cartItems));
    },

    decreaseCart(state, action) {
      const toastId = "cart-action"; // Общий toastId для всех действий с корзиной

      const itemIndex = state.cartItems.findIndex(
        (item) => item.id === action.payload.id
      );

      if (state.cartItems[itemIndex].cartQuantity > 1) {
        state.cartItems[itemIndex].cartQuantity -= 1;

        if (toast.isActive(toastId)) {
          toast.update(toastId, {
            render: "Decreased product quantity",
            type: toast.TYPE.INFO,
            position: "bottom-left",
            autoClose: 2000,
          });
        } else {
          toast.info("Decreased product quantity", {
            position: "bottom-left",
            toastId,
            autoClose: 2000,
          });
        }
      } else if (state.cartItems[itemIndex].cartQuantity === 1) {
        const nextCartItems = state.cartItems.filter(
          (item) => item.id !== action.payload.id
        );
        state.cartItems = nextCartItems;

        if (toast.isActive(toastId)) {
          toast.update(toastId, {
            render: "Product removed from cart",
            type: toast.TYPE.ERROR,
            position: "bottom-left",
            autoClose: 2000,
          });
        } else {
          toast.error("Product removed from cart", {
            position: "bottom-left",
            toastId,
            autoClose: 2000,
          });
        }
      }

      localStorage.setItem("cartItems", JSON.stringify(state.cartItems));
    },

    removeFromCart(state, action) {
      const toastId = "cart-action"; // Общий toastId для всех действий с корзиной

      state.cartItems.map((cartItem) => {
        if (cartItem.id === action.payload.id) {
          const nextCartItems = state.cartItems.filter(
            (item) => item.id !== cartItem.id
          );

          state.cartItems = nextCartItems;

          if (toast.isActive(toastId)) {
            toast.update(toastId, {
              render: "Product removed from cart",
              type: toast.TYPE.ERROR,
              position: "bottom-left",
              autoClose: 2000,
            });
          } else {
            toast.error("Product removed from cart", {
              position: "bottom-left",
              toastId,
              autoClose: 2000,
            });
          }
        }
        localStorage.setItem("cartItems", JSON.stringify(state.cartItems));
        return state;
      });
    },

    getTotals(state, action) {
      let { total, quantity } = state.cartItems.reduce(
        (cartTotal, cartItem) => {
          const { price, cartQuantity } = cartItem;
          const itemTotal = price * cartQuantity;

          cartTotal.total += itemTotal;
          cartTotal.quantity += cartQuantity;

          return cartTotal;
        },
        {
          total: 0,
          quantity: 0,
        }
      );
      total = parseFloat(total.toFixed(2));
      state.cartTotalQuantity = quantity;
      state.cartTotalAmount = total;
    },

    clearCart(state, action) {
      state.cartItems = [];
      localStorage.setItem("cartItems", JSON.stringify(state.cartItems));

      const toastId = "cart-action"; // Общий toastId для всех действий с корзиной
      if (toast.isActive(toastId)) {
        toast.update(toastId, {
          render: "Cart cleared",
          type: toast.TYPE.ERROR,
          position: "bottom-left",
          autoClose: 2000,
        });
      } else {
        toast.error("Cart cleared", {
          position: "bottom-left",
          toastId,
          autoClose: 2000,
        });
      }
    },
  },
});

export const { addToCart, decreaseCart, removeFromCart, getTotals, clearCart } =
  cartSlice.actions;

export default cartSlice.reducer;

