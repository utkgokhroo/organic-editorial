import React, { createContext, useContext, useReducer, useEffect } from "react";

const CartContext = createContext();

const GST_RATE = 0.05;
const DELIVERY_FEE = 49;
const FREE_DELIVERY_THRESHOLD = 499;

function cartReducer(state, action) {
  switch (action.type) {
    case "ADD_ITEM": {
      const existing = state.items.find((i) => i.id === action.payload.id);
      if (existing) {
        return {
          ...state,
          items: state.items.map((i) =>
            i.id === action.payload.id ? { ...i, quantity: i.quantity + 1 } : i
          ),
        };
      }
      return { ...state, items: [...state.items, { ...action.payload, quantity: 1 }] };
    }
    case "REMOVE_ITEM":
      return { ...state, items: state.items.filter((i) => i.id !== action.payload) };
    case "UPDATE_QTY": {
      if (action.payload.qty < 1) {
        return { ...state, items: state.items.filter((i) => i.id !== action.payload.id) };
      }
      return {
        ...state,
        items: state.items.map((i) =>
          i.id === action.payload.id ? { ...i, quantity: action.payload.qty } : i
        ),
      };
    }
    case "CLEAR_CART":
      return { ...state, items: [] };
    case "MOVE_TO_WISHLIST":
      return { ...state, items: state.items.filter((i) => i.id !== action.payload) };
    default:
      return state;
  }
}

function wishlistReducer(state, action) {
  switch (action.type) {
    case "ADD_WISHLIST":
      if (state.find((i) => i.id === action.payload.id)) return state;
      return [...state, action.payload];
    case "REMOVE_WISHLIST":
      return state.filter((i) => i.id !== action.payload);
    default:
      return state;
  }
}

export function CartProvider({ children }) {
  const savedCart = JSON.parse(localStorage.getItem("oe_cart") || '{"items":[]}');
  const savedWishlist = JSON.parse(localStorage.getItem("oe_wishlist") || "[]");

  const [cart, dispatch] = useReducer(cartReducer, savedCart);
  const [wishlist, wishlistDispatch] = useReducer(wishlistReducer, savedWishlist);

  useEffect(() => {
    localStorage.setItem("oe_cart", JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem("oe_wishlist", JSON.stringify(wishlist));
  }, [wishlist]);

  const subtotal = cart.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const gst = Math.round(subtotal * GST_RATE);
  const delivery = subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE;
  const total = subtotal + gst + delivery;
  const itemCount = cart.items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        dispatch,
        wishlist,
        wishlistDispatch,
        subtotal,
        gst,
        delivery,
        total,
        itemCount,
        FREE_DELIVERY_THRESHOLD,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
