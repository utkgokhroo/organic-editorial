import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import Footer from "../components/Footer";
import "../styles/Checkout.css";

const deliveryOptions = [
  { id: "express", tag: "Express", title: "Within 45 Mins", sub: "Free for Prime members", price: 0 },
  { id: "scheduled", tag: "Scheduled", title: "Tomorrow, 8AM – 10AM", sub: "Select other slots available", price: 0 },
];

const paymentMethods = [
  { id: "upi", icon: "📱", title: "UPI (Google Pay, PhonePe)", sub: "Instant & Secure" },
  { id: "card", icon: "💳", title: "Credit / Debit Card", sub: "Ending in 4243" },
  { id: "netbanking", icon: "🏦", title: "Net Banking", sub: "All major banks supported" },
  { id: "cod", icon: "💵", title: "Cash on Delivery", sub: "Pay when you receive" },
];

export default function Checkout() {
  const { cart, dispatch, subtotal, gst, delivery, total } = useCart();
  const [selectedDelivery, setSelectedDelivery] = useState("express");
  const [selectedPayment, setSelectedPayment] = useState("card");
  const [showSuccess, setShowSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const orderId = `OE${Date.now().toString().slice(-8)}`;

  const handlePlaceOrder = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setShowSuccess(true);
    }, 1800);
  };

  const handleSuccessClose = () => {
    dispatch({ type: "CLEAR_CART" });
    navigate("/");
  };

  if (cart.items.length === 0 && !showSuccess) {
    navigate("/cart");
    return null;
  }

  return (
    <div className="page-wrapper checkout-page">
      <div className="container">
        <h1 className="section-title" style={{ marginBottom: 24 }}>Checkout</h1>

        <div className="checkout-layout">
          <div>
            {/* Delivery Address */}
            <div className="checkout-section">
              <div className="checkout-section-header">
                <div className="checkout-section-icon">📍</div>
                <h3>Delivery Address</h3>
                <button className="change-btn">Change</button>
              </div>
              <div className="checkout-section-body">
                <div className="address-card">
                  <div className="address-name">Utkarsh Gokhroo</div>
                  <div className="address-line">
                    VIT Mens' Hostel, VIT Vellore,<br />
                    Katpadi, Brahmapuram – 632014,<br />
                    Tamil Nadu, India
                  </div>
                  <div className="address-phone">📞 +91 94136 26864</div>
                </div>
              </div>
            </div>

            {/* Delivery Schedule */}
            <div className="checkout-section">
              <div className="checkout-section-header">
                <div className="checkout-section-icon">🕐</div>
                <h3>Delivery Schedule</h3>
              </div>
              <div className="checkout-section-body">
                <div className="delivery-options">
                  {deliveryOptions.map((opt) => (
                    <div
                      key={opt.id}
                      className={`delivery-option${selectedDelivery === opt.id ? " selected" : ""}`}
                      onClick={() => setSelectedDelivery(opt.id)}
                    >
                      <div className="delivery-option-radio" />
                      <div className="delivery-option-info">
                        <div className="delivery-option-tag">{opt.tag}</div>
                        <div className="delivery-option-title">{opt.title}</div>
                        <div className="delivery-option-sub">{opt.sub}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Payment */}
            <div className="checkout-section">
              <div className="checkout-section-header">
                <div className="checkout-section-icon">💳</div>
                <h3>Payment Method</h3>
              </div>
              <div className="checkout-section-body">
                <div className="payment-options">
                  {paymentMethods.map((pm) => (
                    <div
                      key={pm.id}
                      className={`payment-option${selectedPayment === pm.id ? " selected" : ""}`}
                      onClick={() => setSelectedPayment(pm.id)}
                    >
                      <span className="payment-option-icon">{pm.icon}</span>
                      <div className="payment-option-info">
                        <div className="payment-option-title">{pm.title}</div>
                        <div className="payment-option-sub">{pm.sub}</div>
                      </div>
                      <div className="payment-radio" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right: Order Summary */}
          <div className="checkout-order-summary">
            <div className="cos-head">Order Summary</div>
            <div className="cos-body">
              {cart.items.map((item) => (
                <div className="cos-item" key={item.id}>
                  <img src={item.image} alt={item.name} />
                  <div className="cos-item-info">
                    <div className="cos-item-name">{item.name}</div>
                    <div className="cos-item-qty">Qty: {item.quantity}</div>
                  </div>
                  <div className="cos-item-price">₹{item.price * item.quantity}</div>
                </div>
              ))}

              <div className="cos-divider" />

              <div className="cos-row"><span>Subtotal</span><span>₹{subtotal}</span></div>
              <div className="cos-row"><span>Delivery Fee</span><span style={{ color: "var(--green)", fontWeight: 700 }}>FREE</span></div>
              <div className="cos-row"><span>GST (5%)</span><span>₹{gst}</span></div>

              <div className="cos-row total">
                <span>Total</span>
                <span>₹{total}</span>
              </div>

              <button
                className="place-order-btn"
                onClick={handlePlaceOrder}
                disabled={loading}
              >
                {loading ? "Processing..." : "Place Order"}
              </button>
              <div style={{ textAlign: "center", fontSize: 11, color: "var(--text-muted)", marginTop: 8 }}>
                🔒 128-bit SSL Secured Payment
              </div>

              <div className="guarantee-note">
                🌿 <strong>The Organic Guarantee</strong> — If you're not satisfied with the freshness of your items, we'll refund you instantly. No questions asked.
              </div>
            </div>
          </div>
        </div>
      </div>

      {showSuccess && (
        <div className="order-success-overlay">
          <div className="order-success-modal">
            <div className="success-icon">🎉</div>
            <h2 className="success-title">Order Placed!</h2>
            <p className="success-sub">
              Your organic goodies are being freshly packed and will be on their way soon.
            </p>
            <div className="success-order-id">Order ID: #{orderId}</div>
            <div className="success-eta">
              ⚡ Estimated delivery: {selectedDelivery === "express" ? "Within 45 mins" : "Tomorrow, 8–10 AM"}
            </div>
            <button className="btn-primary" style={{ width: "100%" }} onClick={handleSuccessClose}>
              Back to Home
            </button>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
