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
      const toastId = "cart-action";
      const { customText, ...product } = action.payload;
      
      const existingIndex = state.cartItems.findIndex(
        (item) => item.id === product.id
      );

      if (existingIndex >= 0) {
        state.cartItems[existingIndex] = {
          ...state.cartItems[existingIndex],
          cartQuantity: state.cartItems[existingIndex].cartQuantity + 1,
          ...(customText && { customText }) // Обновляем кастомный текст если он есть
        };

        if (toast.isActive(toastId)) {
          toast.update(toastId, {
            render: customText 
              ? "Zaktualizowano produkt z tekstem" 
              : "Zwiększono ilość produktu",
            type: toast.TYPE.INFO,
            position: "bottom-left",
            autoClose: 2000,
          });
        } else {
          toast.info(customText 
            ? "Zaktualizowano produkt z tekstem" 
            : "Zwiększono ilość produktu", {
            position: "bottom-left",
            toastId,
            autoClose: 2000,
          });
        }
      } else {
        let tempProductItem = { 
          ...product, 
          cartQuantity: 1,
          ...(customText && { customText }) // Добавляем кастомный текст если он есть
        };
        state.cartItems.push(tempProductItem);

        if (toast.isActive(toastId)) {
          toast.update(toastId, {
            render: customText
              ? "Produkt z tekstem dodany do koszyka"
              : "Produkt dodany do koszyka",
            type: customText ? toast.TYPE.SUCCESS : toast.TYPE.INFO,
            position: "bottom-left",
            autoClose: 2000,
          });
        } else {
          toast.success(customText
            ? "	Produkt z dodanym niestandardowym tekstem dodany do koszyka"
            : "Produkt dodany do koszyka", {
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
            render: "Zmniejszono ilość produktu",
            type: toast.TYPE.INFO,
            position: "bottom-left",
            autoClose: 2000,
          });
        } else {
          toast.info("Zmniejszono ilość produktu", {
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
            render: "Produkt został usunięty z koszyka",
            type: toast.TYPE.ERROR,
            position: "bottom-left",
            autoClose: 2000,
          });
        } else {
          toast.error("Produkt został usunięty z koszyka", {
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
              render: "Produkt został usunięty z koszyka",
              type: toast.TYPE.ERROR,
              position: "bottom-left",
              autoClose: 2000,
            });
          } else {
            toast.error("Produkt został usunięty z koszyka", {
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

