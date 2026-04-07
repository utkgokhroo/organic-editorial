import React from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import Footer from "../components/Footer";
import "../styles/Wishlist.css";

export default function Wishlist() {
  const { wishlist, wishlistDispatch, dispatch } = useCart();

  const moveToCart = (item) => {
    dispatch({ type: "ADD_ITEM", payload: item });
    wishlistDispatch({ type: "REMOVE_WISHLIST", payload: item.id });
  };

  const removeFromWishlist = (id) => {
    wishlistDispatch({ type: "REMOVE_WISHLIST", payload: id });
  };

  return (
    <div className="page-wrapper wishlist-page">
      <div className="container">
        <h1 className="section-title">My Wishlist</h1>
        <p className="section-subtitle" style={{ marginBottom: 0 }}>
          {wishlist.length} item{wishlist.length !== 1 ? "s" : ""} curated for your vitality
        </p>

        {wishlist.length === 0 ? (
          <div
            className="empty-state"
            style={{ background: "#fff", borderRadius: "var(--radius-xl)", border: "1px solid var(--border-light)", marginTop: 24 }}
          >
            <div className="icon">🤍</div>
            <h3>Your wishlist is empty</h3>
            <p>Save items you love and come back to them anytime.</p>
            <Link to="/products" className="btn-primary" style={{ marginTop: 8 }}>
              Discover Products
            </Link>
          </div>
        ) : (
          <div className="wishlist-grid">
            {wishlist.map((item) => {
              const discount = item.originalPrice > item.price
                ? Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)
                : 0;
              return (
                <div className="wishlist-card" key={item.id}>
                  <Link to={`/product/${item.id}`} className="wishlist-img-wrap">
                    <img src={item.image} alt={item.name} />
                    {item.badge && (
                      <span className="wishlist-badge" style={{ background: item.badgeColor || "#2e7d32" }}>
                        {item.badge}
                      </span>
                    )}
                  </Link>
                  <button
                    className="wishlist-remove-btn"
                    onClick={() => removeFromWishlist(item.id)}
                    title="Remove from wishlist"
                  >
                    ✕
                  </button>
                  <div className="wishlist-info">
                    <div className="wishlist-item-brand">{item.brand}</div>
                    <Link to={`/product/${item.id}`} className="wishlist-item-name">{item.name}</Link>
                    <div className="wishlist-item-desc">{item.description}</div>
                    <div className="wishlist-price-row">
                      <span className="price-main">₹{item.price}</span>
                      {item.originalPrice > item.price && (
                        <>
                          <span className="price-original">₹{item.originalPrice}</span>
                          <span className="price-discount">{discount}% off</span>
                        </>
                      )}
                    </div>
                    <button className="wishlist-move-btn" onClick={() => moveToCart(item)}>
                      🛒 Move to Cart
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
