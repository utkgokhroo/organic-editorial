import React from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import "../styles/ProductCard.css";

function resolveImage(src, seed) {
  if (!src) return `https://picsum.photos/seed/${seed}/800/600`;
  if (src.startsWith("http://") || src.startsWith("https://")) return src;
  return `${process.env.PUBLIC_URL}/${src}`;
}

export default function ProductCard({ product }) {
  const { cart, dispatch, wishlist, wishlistDispatch } = useCart();

  const cartItem = cart.items.find((i) => i.id === product.id);
  const inWishlist = wishlist.some((i) => i.id === product.id);

  const addToCart = (e) => {
    e.preventDefault();
    dispatch({ type: "ADD_ITEM", payload: product });
  };

  const updateQty = (e, qty) => {
    e.preventDefault();
    dispatch({ type: "UPDATE_QTY", payload: { id: product.id, qty } });
  };

  const toggleWishlist = (e) => {
    e.preventDefault();
    if (inWishlist) {
      wishlistDispatch({ type: "REMOVE_WISHLIST", payload: product.id });
    } else {
      wishlistDispatch({ type: "ADD_WISHLIST", payload: product });
    }
  };

  const discount = product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <Link to={`/product/${product.id}`} className={`product-card${!product.inStock ? " out-of-stock" : ""}`}>
      <div className="product-img-wrap">
        <img
        src={product.image}
        alt={product.name}
        loading="lazy"
        referrerPolicy="no-referrer"
        onError={(e) => {
          e.target.onerror = null;
          e.target.src = `https://picsum.photos/seed/${product.id}/400/300`;
        }}  
/>
        {product.badge && (
          <span
            className="product-badge"
            style={{ background: product.badgeColor || "#2e7d32" }}
          >
            {product.badge}
          </span>
        )}
        <button className="product-wishlist-btn" onClick={toggleWishlist}>
          {inWishlist ? "❤️" : "🤍"}
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
          <span className="stars">{"★".repeat(Math.floor(product.rating))}</span>
          <span>{product.rating}</span>
          <span className="count">({product.reviews.toLocaleString()})</span>
        </div>

        <div className="product-price-row">
          <span className="price-main">₹{product.price}</span>
          {product.originalPrice > product.price && (
            <>
              <span className="price-original">₹{product.originalPrice}</span>
              <span className="price-discount">{discount}% off</span>
            </>
          )}
        </div>

        <div className="product-delivery">
          ⚡ Delivery in {product.deliveryTime}
        </div>

        <div className="product-actions" onClick={(e) => e.preventDefault()}>
          {cartItem ? (
            <div className="qty-control">
              <button className="qty-btn" onClick={(e) => updateQty(e, cartItem.quantity - 1)}>−</button>
              <span className="qty-count">{cartItem.quantity}</span>
              <button className="qty-btn" onClick={(e) => updateQty(e, cartItem.quantity + 1)}>+</button>
            </div>
          ) : (
            <button
              className="add-to-cart-btn"
              onClick={addToCart}
              disabled={!product.inStock}
            >
              {product.inStock ? "Add to Cart" : "Unavailable"}
            </button>
          )}
        </div>
      </div>
    </Link>
  );
}
