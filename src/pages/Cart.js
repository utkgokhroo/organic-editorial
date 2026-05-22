import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { cartApi } from "../services/api";
import { formatPrice } from "../utils/productUtils";
import Footer from "../components/Footer";
import "../styles/Cart.css";

export default function Cart() {
  const { isAuthenticated } = useAuth();
  const {
    cart,
    dispatch,
    itemCount,
    freeDeliveryThreshold,
    availableCouponCodes,
    cartLoading,
    cartError,
    refreshCart,
  } = useCart();
  const [coupon, setCoupon] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [couponPricing, setCouponPricing] = useState(null);
  const [couponMsg, setCouponMsg] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [actionError, setActionError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      refreshCart().catch(() => {});
    }
  }, [isAuthenticated, refreshCart]);

  const applyCoupon = async () => {
    const code = coupon.trim();
    if (!code) {
      setCouponCode("");
      setCouponPricing(null);
      setCouponMsg("");
      return;
    }

    setCouponLoading(true);
    setCouponMsg("");
    try {
      const response = await cartApi.previewCoupon(code);
      const priced = response.data.cart;
      setCouponCode(priced.couponCode || "");
      setCouponPricing(priced.couponValid ? priced : null);
      setCouponMsg(
        priced.couponMessage || (priced.discount > 0 ? `Coupon applied. You saved ${formatPrice(priced.discount)}.` : "Invalid coupon code.")
      );
    } catch (error) {
      setCouponCode("");
      setCouponPricing(null);
      setCouponMsg(error.message || "Unable to validate coupon.");
    } finally {
      setCouponLoading(false);
    }
  };

  const runCartAction = async (action) => {
    setActionError("");
    setCouponPricing(null);
    setCouponCode("");
    setCouponMsg("");
    try {
      await dispatch(action);
    } catch (error) {
      setActionError(error.message);
    }
  };

  const summary = couponPricing || cart;
  const discount = summary.discount || 0;
  const displaySubtotal = summary.subtotal;
  const displayGst = summary.gst;
  const displayDelivery = summary.deliveryFee;
  const displayTotal = summary.grandTotal ?? summary.total;
  const progressPct = freeDeliveryThreshold
    ? Math.min((displaySubtotal / freeDeliveryThreshold) * 100, 100)
    : 0;
  const remaining = Math.max(freeDeliveryThreshold - displaySubtotal, 0);

  if (!isAuthenticated) {
    return (
      <div className="page-wrapper cart-page">
        <div className="container">
          <div className="empty-state" style={{ background: "#fff", borderRadius: "var(--radius-xl)", border: "1px solid var(--border-light)" }}>
            <div className="icon" aria-hidden="true">
              <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{color:"var(--green)"}}>
                <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
              </svg>
            </div>
            <h3>Sign in to view your cart</h3>
            <p>Your cart is synced with your account so checkout stays accurate.</p>
            <Link to="/login" className="btn-primary" style={{ marginTop: 8 }}>Sign In</Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (cartLoading && cart.items.length === 0) {
    return (
      <div className="page-wrapper cart-page">
        <div className="loading-spinner"><div className="spinner" /></div>
        <Footer />
      </div>
    );
  }

  if (cart.items.length === 0) {
    return (
      <div className="page-wrapper cart-page">
        <div className="container">
          <h1 className="section-title" style={{ marginBottom: 32 }}>Your Selection</h1>
          {(cartError || actionError) && <div className="alert-error">{cartError || actionError}</div>}
          <div className="empty-state" style={{ background: "#fff", borderRadius: "var(--radius-xl)", border: "1px solid var(--border-light)" }}>
            <div className="icon" aria-hidden="true">
              <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{color:"var(--green)"}}>
                <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
              </svg>
            </div>
            <h3>Your cart is empty</h3>
            <p>Explore the fresh selection and add your favourites.</p>
            <Link to="/products" className="btn-primary" style={{ marginTop: 8 }}>Start Shopping</Link>
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

        {(cartError || actionError) && <div className="alert-error">{cartError || actionError}</div>}
        {cart.warnings?.length > 0 && (
          <div className="alert-error" style={{ marginBottom: 16 }}>
            {cart.warnings.map((warning) => (
              <div key={warning}>{warning}</div>
            ))}
          </div>
        )}

        <div className="cart-layout">
          <div className="cart-items-section">
            <div className="cart-section-head">
              <h2>Cart Items</h2>
              <button
                style={{ fontSize: 13, color: "var(--red)", background: "none", border: "none", cursor: "pointer", fontFamily: "var(--font-body)", fontWeight: 600 }}
                onClick={() => runCartAction({ type: "CLEAR_CART" })}
                disabled={cartLoading}
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
                  <span className="cart-item-price">{formatPrice(item.price * item.quantity)}</span>
                </div>
                <div className="cart-item-actions">
                  <div className="cart-qty-control">
                    <button
                      className="cart-qty-btn"
                      onClick={() => runCartAction({ type: "UPDATE_QTY", payload: { id: item.id, qty: item.quantity - 1 } })}
                      disabled={cartLoading}
                    >
                      -
                    </button>
                    <span className="cart-qty-num">{item.quantity}</span>
                    <button
                      className="cart-qty-btn"
                      onClick={() => runCartAction({ type: "UPDATE_QTY", payload: { id: item.id, qty: item.quantity + 1 } })}
                      disabled={cartLoading}
                    >
                      +
                    </button>
                  </div>
                  <button
                    className="cart-remove-btn"
                    onClick={() => runCartAction({ type: "REMOVE_ITEM", payload: item.id })}
                    title="Remove"
                    disabled={cartLoading}
                  >
                    Remove
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
                  <div className="fdp-text">Add {formatPrice(remaining)} more for free delivery</div>
                  <div className="fdp-bar"><div className="fdp-fill" style={{ width: `${progressPct}%` }} /></div>
                </div>
              )}

              <div className="summary-row"><span>Subtotal ({itemCount} items)</span><span>{formatPrice(displaySubtotal)}</span></div>
              <div className="summary-row"><span>GST (5%)</span><span>{formatPrice(displayGst)}</span></div>
              <div className="summary-row">
                <span>Delivery Fee</span>
                <span className={displayDelivery === 0 ? "free" : ""}>{displayDelivery === 0 ? "FREE" : formatPrice(displayDelivery)}</span>
              </div>
              {discount > 0 && (
                <div className="summary-row">
                  <span>Coupon Discount</span>
                  <span className="discount">-{formatPrice(discount)}</span>
                </div>
              )}
              <div className="summary-row total"><span>Total</span><span>{formatPrice(displayTotal)}</span></div>

              <div className="coupon-row">
                <input
                  type="text"
                  className="coupon-input"
                  placeholder="Promo code"
                  value={coupon}
                  onChange={(event) => setCoupon(event.target.value)}
                  onKeyDown={(event) => event.key === "Enter" && !couponLoading && applyCoupon()}
                  disabled={couponLoading}
                />
                <button className="coupon-btn" onClick={applyCoupon} disabled={couponLoading}>
                  {couponLoading ? "..." : "Apply"}
                </button>
              </div>
              {couponMsg && (
                <div style={{ fontSize: 12, marginBottom: 12, color: discount > 0 ? "var(--green)" : "var(--red)" }}>
                  {couponMsg}
                </div>
              )}

              <button
                className="checkout-btn"
                onClick={() => navigate("/checkout", { state: { couponCode: couponPricing?.couponCode || couponCode || null } })}
                disabled={cartLoading || !cart.readyForCheckout}
              >
                Checkout Now
              </button>
              <div className="secure-badge">Secure checkout and sustainable packaging</div>

              {availableCouponCodes.length > 0 && (
                <div style={{ marginTop: 16, fontSize: 11, color: "var(--text-muted)", lineHeight: 1.6 }}>
                  Try: {availableCouponCodes.map((code, index) => (
                    <strong key={code}>
                      {index > 0 ? ", " : ""}
                      {code}
                    </strong>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}