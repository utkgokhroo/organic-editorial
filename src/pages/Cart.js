import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import Footer from "../components/Footer";
import "../styles/Cart.css";

export default function Cart() {
  const { cart, dispatch, subtotal, gst, delivery, total, itemCount, FREE_DELIVERY_THRESHOLD } = useCart();
  const [coupon, setCoupon] = useState("");
  const [discount, setDiscount] = useState(0);
  const [couponMsg, setCouponMsg] = useState("");
  const navigate = useNavigate();

  const COUPONS = { "ORGANIC10": 50, "FRESH20": 80, "FIRST50": 100 };

  const applyCoupon = () => {
    const c = coupon.trim().toUpperCase();
    if (COUPONS[c]) {
      setDiscount(COUPONS[c]);
      setCouponMsg(`🎉 Coupon applied! You saved ₹${COUPONS[c]}`);
    } else {
      setDiscount(0);
      setCouponMsg("❌ Invalid coupon code");
    }
  };

  const progressPct = Math.min((subtotal / FREE_DELIVERY_THRESHOLD) * 100, 100);
  const remaining = FREE_DELIVERY_THRESHOLD - subtotal;

  if (cart.items.length === 0) {
    return (
      <div className="page-wrapper cart-page">
        <div className="container">
          <h1 className="section-title" style={{ marginBottom: 32 }}>Your Selection</h1>
          <div className="empty-state" style={{ background: "#fff", borderRadius: "var(--radius-xl)", border: "1px solid var(--border-light)" }}>
            <div className="icon">🛒</div>
            <h3>Your cart is empty</h3>
            <p>Looks like you haven't added anything yet. Explore our fresh selection!</p>
            <Link to="/products" className="btn-primary" style={{ marginTop: 8 }}>
              Start Shopping
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="page-wrapper cart-page">
      <div className="container">
        <h1 className="section-title" style={{ marginBottom: 8 }}>Your Selection</h1>
        <p style={{ fontSize: 14, color: "var(--text-muted)", marginBottom: 24 }}>
          {itemCount} item{itemCount !== 1 ? "s" : ""} in your cart
        </p>

        <div className="cart-layout">
          <div className="cart-items-section">
            <div className="cart-section-head">
              <h2>Cart Items</h2>
              <button
                style={{ fontSize: 13, color: "var(--red)", background: "none", border: "none", cursor: "pointer", fontFamily: "var(--font-body)", fontWeight: 600 }}
                onClick={() => dispatch({ type: "CLEAR_CART" })}
              >
                Clear All
              </button>
            </div>

            {cart.items.map((item) => (
              <div className="cart-item" key={item.id}>
                <img src={item.image} alt={item.name} className="cart-item-img" />
                <div className="cart-item-info">
                  <span className="cart-item-brand">{item.brand}</span>
                  <Link to={`/product/${item.id}`} className="cart-item-name">{item.name}</Link>
                  <span className="cart-item-unit">{item.unit}</span>
                  <span className="cart-item-price">₹{item.price * item.quantity}</span>
                </div>
                <div className="cart-item-actions">
                  <div className="cart-qty-control">
                    <button
                      className="cart-qty-btn"
                      onClick={() => dispatch({ type: "UPDATE_QTY", payload: { id: item.id, qty: item.quantity - 1 } })}
                    >−</button>
                    <span className="cart-qty-num">{item.quantity}</span>
                    <button
                      className="cart-qty-btn"
                      onClick={() => dispatch({ type: "UPDATE_QTY", payload: { id: item.id, qty: item.quantity + 1 } })}
                    >+</button>
                  </div>
                  <button
                    className="cart-remove-btn"
                    onClick={() => dispatch({ type: "REMOVE_ITEM", payload: item.id })}
                    title="Remove"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="cart-summary">
            <div className="summary-head">Order Summary</div>
            <div className="summary-body">
              {remaining > 0 && (
                <div className="free-delivery-progress">
                  <div className="fdp-text">Add ₹{remaining} more for FREE delivery</div>
                  <div className="fdp-bar">
                    <div className="fdp-fill" style={{ width: `${progressPct}%` }} />
                  </div>
                </div>
              )}

              <div className="summary-row">
                <span>Subtotal ({itemCount} items)</span>
                <span>₹{subtotal}</span>
              </div>
              <div className="summary-row">
                <span>GST (5%)</span>
                <span>₹{gst}</span>
              </div>
              <div className="summary-row">
                <span>Delivery Fee</span>
                <span className={delivery === 0 ? "free" : ""}>{delivery === 0 ? "FREE" : `₹${delivery}`}</span>
              </div>
              {discount > 0 && (
                <div className="summary-row">
                  <span>Coupon Discount</span>
                  <span className="discount">−₹{discount}</span>
                </div>
              )}
              <div className="summary-row total">
                <span>Total</span>
                <span>₹{total - discount}</span>
              </div>

              <div className="coupon-row">
                <input
                  type="text"
                  className="coupon-input"
                  placeholder="Promo code"
                  value={coupon}
                  onChange={(e) => setCoupon(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && applyCoupon()}
                />
                <button className="coupon-btn" onClick={applyCoupon}>Apply</button>
              </div>
              {couponMsg && (
                <div style={{ fontSize: 12, marginBottom: 12, color: discount > 0 ? "var(--green)" : "var(--red)" }}>
                  {couponMsg}
                </div>
              )}

              <button className="checkout-btn" onClick={() => navigate("/checkout")}>
                Checkout Now →
              </button>
              <div className="secure-badge">
                🔒 Secure Checkout & Sustainable Packaging
              </div>

              <div style={{ marginTop: 16, fontSize: 11, color: "var(--text-muted)", lineHeight: 1.6 }}>
                Try: <strong>ORGANIC10</strong>, <strong>FRESH20</strong>, <strong>FIRST50</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
