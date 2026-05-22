import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useRequireAuth } from "../hooks/useRequireAuth";
import { formatPrice } from "../utils/productUtils";
import "../styles/ProductCard.css";

export default function ProductCard({ product }) {
  const { requireAuth } = useRequireAuth();
  const { cart, dispatch, wishlist, wishlistDispatch } = useCart();
  const [busy, setBusy] = useState(false);

  const cartItem = cart.items.find((item) => item.id === product.id);
  const inWishlist = wishlist.some((item) => item.id === product.id);
  const discount = product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const runAction = async (event, action) => {
    event.preventDefault();
    event.stopPropagation();
    if (!requireAuth()) return;
    setBusy(true);
    try {
      await action();
    } catch (_error) {
      // CartContext/AuthContext own the user-visible error state.
    } finally {
      setBusy(false);
    }
  };

  return (
    <Link to={`/product/${product.id}`} className={`product-card${!product.inStock ? " out-of-stock" : ""}`}>
      <div className="product-img-wrap">
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={(event) => {
            event.currentTarget.onerror = null;
            event.currentTarget.src = `https://picsum.photos/seed/${product.id}/400/300`;
          }}
        />
        {product.badge && (
          <span className="product-badge" style={{ background: product.badgeColor || "#2e7d32" }}>
            {product.badge}
          </span>
        )}
        <button
          className="product-wishlist-btn"
          onClick={(event) =>
            runAction(event, () =>
              wishlistDispatch({
                type: inWishlist ? "REMOVE_WISHLIST" : "ADD_WISHLIST",
                payload: product,
              })
            )
          }
          aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
          disabled={busy}
        >
          {inWishlist ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="#1e6b33" stroke="#1e6b33" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
          )}
        </button>
        {!product.inStock && (
          <div className="out-of-stock-overlay">
            <span className="out-of-stock-label">OUT OF STOCK</span>
          </div>
        )}
      </div>

      <div className="product-info">
        <span className="product-brand">{product.brand}</span>
        <span className="product-name">{product.name}</span>
        <span className="product-unit">{product.unit}</span>

        <div className="product-rating">
          <span className="stars">
            {Array.from({ length: 5 }, (_, i) => (
              <span key={i} style={{ color: i < Math.round(product.rating || 0) ? "#f4a024" : "#ddd" }}>★</span>
            ))}
          </span>
          <span>{product.rating.toFixed(1)}</span>
          <span className="count">({product.reviews.toLocaleString("en-IN")})</span>
        </div>

        <div className="product-price-row">
          <span className="price-main">{formatPrice(product.price)}</span>
          {discount > 0 && (
            <>
              <span className="price-original">{formatPrice(product.originalPrice)}</span>
              <span className="price-discount">{discount}% off</span>
            </>
          )}
        </div>

        <div className="product-delivery">Delivery in {product.deliveryTime || "45 mins"}</div>

        <div className="product-actions" onClick={(event) => event.preventDefault()}>
          {cartItem ? (
            <div className="qty-control">
              <button
                className="qty-btn"
                onClick={(event) =>
                  runAction(event, () =>
                    dispatch({ type: "UPDATE_QTY", payload: { id: product.id, qty: cartItem.quantity - 1 } })
                  )
                }
                disabled={busy}
              >
                -
              </button>
              <span className="qty-count">{cartItem.quantity}</span>
              <button
                className="qty-btn"
                onClick={(event) =>
                  runAction(event, () =>
                    dispatch({ type: "UPDATE_QTY", payload: { id: product.id, qty: cartItem.quantity + 1 } })
                  )
                }
                disabled={busy}
              >
                +
              </button>
            </div>
          ) : (
            <button
              className="add-to-cart-btn"
              onClick={(event) => runAction(event, () => dispatch({ type: "ADD_ITEM", payload: product }))}
              disabled={!product.inStock || busy}
            >
              {product.inStock ? (busy ? "Adding..." : "Add to Cart") : "Unavailable"}
            </button>
          )}
        </div>
      </div>
    </Link>
  );
}
