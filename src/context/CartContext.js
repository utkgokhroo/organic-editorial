import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useAuth } from "./AuthContext";
import { cartApi, userApi } from "../services/api";
import { normalizeCart } from "../utils/productUtils";

const CartContext = createContext(null);

const EMPTY_CART = normalizeCart({ items: [] });

export function CartProvider({ children }) {
  const { isAuthenticated, token } = useAuth();
  const [cart, setCart] = useState(EMPTY_CART);
  const [wishlist, setWishlist] = useState([]);
  const [cartLoading, setCartLoading] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [cartError, setCartError] = useState("");

  const requireAuth = useCallback(() => {
    if (!isAuthenticated) {
      const message = "Please sign in to manage your cart.";
      setCartError(message);
      throw new Error(message);
    }
  }, [isAuthenticated]);

  const refreshCart = useCallback(async () => {
    if (!isAuthenticated) {
      setCart(EMPTY_CART);
      return EMPTY_CART;
    }

    setCartLoading(true);
    try {
      const response = await cartApi.get();
      setCart(response.data.cart);
      setCartError("");
      return response.data.cart;
    } catch (error) {
      setCartError(error.message);
      throw error;
    } finally {
      setCartLoading(false);
    }
  }, [isAuthenticated]);

  const refreshWishlist = useCallback(async () => {
    if (!isAuthenticated) {
      setWishlist([]);
      return [];
    }

    setWishlistLoading(true);
    try {
      const response = await userApi.getWishlist();
      setWishlist(response.data.wishlist);
      return response.data.wishlist;
    } catch (error) {
      setCartError(error.message);
      throw error;
    } finally {
      setWishlistLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (token && isAuthenticated) {
      refreshCart().catch(() => {});
      refreshWishlist().catch(() => {});
    } else {
      setCart(EMPTY_CART);
      setWishlist([]);
    }
  }, [token, isAuthenticated, refreshCart, refreshWishlist]);

  const dispatch = useCallback(
    async (action) => {
      requireAuth();
      setCartLoading(true);

      try {
        let response;
        const payload = action.payload || {};
        const productId = payload.productId || payload.id || action.payload;

        switch (action.type) {
          case "ADD_ITEM":
            response = await cartApi.addItem(productId, payload.quantity || 1);
            break;
          case "REMOVE_ITEM":
            response = await cartApi.removeItem(productId);
            break;
          case "UPDATE_QTY":
            response = await cartApi.updateItem(payload.productId || payload.id, payload.qty ?? payload.quantity);
            break;
          case "CLEAR_CART":
            response = await cartApi.clear();
            break;
          case "MOVE_TO_WISHLIST":
            await userApi.addToWishlist(productId);
            await refreshWishlist();
            response = await cartApi.removeItem(productId);
            break;
          default:
            return cart;
        }

        setCart(response.data.cart);
        setCartError("");
        return response.data.cart;
      } catch (error) {
        setCartError(error.message);
        throw error;
      } finally {
        setCartLoading(false);
      }
    },
    [cart, refreshWishlist, requireAuth]
  );

  const wishlistDispatch = useCallback(
    async (action) => {
      requireAuth();
      setWishlistLoading(true);

      try {
        const payload = action.payload || {};
        const productId = payload.productId || payload.id || action.payload;
        let response;

        switch (action.type) {
          case "ADD_WISHLIST":
            response = await userApi.addToWishlist(productId);
            break;
          case "REMOVE_WISHLIST":
            response = await userApi.removeFromWishlist(productId);
            break;
          default:
            return wishlist;
        }

        setWishlist(response.data.wishlist);
        setCartError("");
        return response.data.wishlist;
      } catch (error) {
        setCartError(error.message);
        throw error;
      } finally {
        setWishlistLoading(false);
      }
    },
    [requireAuth, wishlist]
  );

  const value = useMemo(
    () => ({
      cart,
      dispatch,
      wishlist,
      wishlistDispatch,
      refreshCart,
      refreshWishlist,
      cartLoading,
      wishlistLoading,
      cartError,
      subtotal: cart.subtotal,
      gst: cart.gst,
      delivery: cart.deliveryFee,
      deliveryFee: cart.deliveryFee,
      total: cart.total,
      grandTotal: cart.grandTotal ?? cart.total,
      discount: cart.discount ?? 0,
      couponCode: cart.couponCode ?? null,
      itemCount: cart.itemCount,
      freeDeliveryThreshold: cart.freeDeliveryThreshold ?? 0,
      availableCouponCodes: cart.availableCouponCodes ?? [],
      warnings: cart.warnings ?? [],
      readyForCheckout: cart.readyForCheckout ?? false,
    }),
    [cart, dispatch, wishlist, wishlistDispatch, refreshCart, refreshWishlist, cartLoading, wishlistLoading, cartError]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
}