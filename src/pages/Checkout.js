import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { cartApi, orderApi } from "../services/api";
import { formatPrice } from "../utils/productUtils";
import Footer from "../components/Footer";
import "../styles/Checkout.css";

const deliveryOptions = [
  { id: "express", tag: "Express", title: "Within 45 mins", sub: "Fastest available slot" },
  { id: "scheduled", tag: "Scheduled", title: "Tomorrow, 8 AM - 10 AM", sub: "Best for planned deliveries" },
];

const paymentMethods = [
  { id: "upi", title: "UPI", sub: "Google Pay, PhonePe, Paytm" },
  { id: "card", title: "Credit / Debit Card", sub: "Visa, Mastercard, RuPay" },
  { id: "netbanking", title: "Net Banking", sub: "All major banks supported" },
  { id: "cod", title: "Cash on Delivery", sub: "Pay when you receive" },
];

export default function Checkout() {
  const { user } = useAuth();
  const { refreshCart } = useCart();
  const [selectedDelivery, setSelectedDelivery] = useState("express");
  const [selectedPayment, setSelectedPayment] = useState("card");
  const [order, setOrder] = useState(null);
  const [pricing, setPricing] = useState(null);
  const [pricingLoading, setPricingLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const couponCode = location.state?.couponCode || null;

  const defaultAddress = useMemo(() => {
    const saved = user?.address?.find((item) => item.isDefault) || user?.address?.[0];
    return {
      fullName: saved?.fullName || user?.name || "",
      phone: (saved?.phone || user?.phone || "").replace(/\D/g, "").slice(-10),
      line1: saved?.line1 || "",
      line2: saved?.line2 || "",
      city: saved?.city || "",
      state: saved?.state || "",
      pincode: saved?.pincode || "",
    };
  }, [user]);

  const [address, setAddress] = useState(defaultAddress);

  useEffect(() => {
    setAddress(defaultAddress);
  }, [defaultAddress]);

  useEffect(() => {
    let active = true;
    setPricingLoading(true);
    setError("");

    cartApi
      .checkoutPreview(couponCode)
      .then((response) => {
        if (!active) return;
        setPricing(response.data.cart);
        refreshCart().catch(() => {});
      })
      .catch((apiError) => {
        if (!active) return;
        setPricing(null);
        if (apiError.status === 400 && apiError.error === "CartEmpty") {
          navigate("/cart", { replace: true });
          return;
        }
        setError(apiError.message || "Unable to load checkout totals.");
      })
      .finally(() => {
        if (active) setPricingLoading(false);
      });

    return () => {
      active = false;
    };
  }, [couponCode, navigate, refreshCart]);

  const handleAddressChange = (event) => {
    setAddress((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const validateAddress = () => {
    if (!address.fullName.trim()) return "Delivery name is required.";
    if (!/^[6-9]\d{9}$/.test(address.phone)) return "Enter a valid 10-digit Indian mobile number.";
    if (!address.line1.trim()) return "Address line 1 is required.";
    if (!address.city.trim()) return "City is required.";
    if (!address.state.trim()) return "State is required.";
    if (!/^\d{6}$/.test(address.pincode)) return "Pincode must be 6 digits.";
    return "";
  };

  const handlePlaceOrder = async () => {
    const validationMessage = validateAddress();
    if (validationMessage) {
      setError(validationMessage);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await orderApi.create({
        deliveryAddress: address,
        paymentMethod: selectedPayment,
        deliveryType: selectedDelivery,
        deliverySlot: selectedDelivery === "express" ? "Within 45 mins" : "Tomorrow, 8 AM - 10 AM",
        couponCode: pricing?.couponCode || couponCode,
      });
      setOrder(response.data.order);
      await refreshCart();
    } catch (apiError) {
      setError(apiError.message || "Unable to place order.");
    } finally {
      setLoading(false);
    }
  };

  const handleSuccessClose = () => {
    navigate("/profile", { replace: true });
  };

  const summary = pricing;
  const placedTotal = order?.total;

  if (pricingLoading) {
    return (
      <div className="page-wrapper checkout-page">
        <div className="loading-spinner"><div className="spinner" /></div>
        <Footer />
      </div>
    );
  }

  if (!summary?.items?.length && !order) {
    return null;
  }

  return (
    <div className="page-wrapper checkout-page">
      <div className="container">
        <h1 className="section-title" style={{ marginBottom: 24 }}>Checkout</h1>
        {error && <div className="alert-error">{error}</div>}
        {summary?.warnings?.length > 0 && (
          <div className="alert-error" style={{ marginBottom: 16 }}>
            {summary.warnings.map((warning) => (
              <div key={warning}>{warning}</div>
            ))}
          </div>
        )}

        <div className="checkout-layout">
          <div>
            <div className="checkout-section">
              <div className="checkout-section-header">
                <div className="checkout-section-icon">1</div>
                <h3>Delivery Address</h3>
              </div>
              <div className="checkout-section-body">
                <div className="checkout-address-form">
                  <div className="form-group">
                    <label className="form-label">Full Name</label>
                    <input className="form-input" name="fullName" value={address.fullName} onChange={handleAddressChange} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Phone</label>
                    <input className="form-input" name="phone" value={address.phone} onChange={handleAddressChange} maxLength="10" />
                  </div>
                  <div className="form-group full">
                    <label className="form-label">Address Line 1</label>
                    <input className="form-input" name="line1" value={address.line1} onChange={handleAddressChange} />
                  </div>
                  <div className="form-group full">
                    <label className="form-label">Address Line 2</label>
                    <input className="form-input" name="line2" value={address.line2} onChange={handleAddressChange} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">City</label>
                    <input className="form-input" name="city" value={address.city} onChange={handleAddressChange} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">State</label>
                    <input className="form-input" name="state" value={address.state} onChange={handleAddressChange} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Pincode</label>
                    <input className="form-input" name="pincode" value={address.pincode} onChange={handleAddressChange} maxLength="6" />
                  </div>
                </div>
              </div>
            </div>

            <div className="checkout-section">
              <div className="checkout-section-header">
                <div className="checkout-section-icon">2</div>
                <h3>Delivery Schedule</h3>
              </div>
              <div className="checkout-section-body">
                <div className="delivery-options">
                  {deliveryOptions.map((option) => (
                    <div
                      key={option.id}
                      className={`delivery-option${selectedDelivery === option.id ? " selected" : ""}`}
                      onClick={() => setSelectedDelivery(option.id)}
                    >
                      <div className="delivery-option-radio" />
                      <div className="delivery-option-info">
                        <div className="delivery-option-tag">{option.tag}</div>
                        <div className="delivery-option-title">{option.title}</div>
                        <div className="delivery-option-sub">{option.sub}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="checkout-section">
              <div className="checkout-section-header">
                <div className="checkout-section-icon">3</div>
                <h3>Payment Method</h3>
              </div>
              <div className="checkout-section-body">
                <div className="payment-options">
                  {paymentMethods.map((method) => (
                    <div
                      key={method.id}
                      className={`payment-option${selectedPayment === method.id ? " selected" : ""}`}
                      onClick={() => setSelectedPayment(method.id)}
                    >
                      <span className="payment-option-icon">{method.title.slice(0, 2)}</span>
                      <div className="payment-option-info">
                        <div className="payment-option-title">{method.title}</div>
                        <div className="payment-option-sub">{method.sub}</div>
                      </div>
                      <div className="payment-radio" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="checkout-order-summary">
            <div className="cos-head">Order Summary</div>
            <div className="cos-body">
              {summary.items.map((item) => (
                <div className="cos-item" key={item.id}>
                  <img src={item.image} alt={item.name} />
                  <div className="cos-item-info">
                    <div className="cos-item-name">{item.name}</div>
                    <div className="cos-item-qty">Qty: {item.quantity}</div>
                  </div>
                  <div className="cos-item-price">{formatPrice(item.price * item.quantity)}</div>
                </div>
              ))}

              <div className="cos-divider" />

              <div className="cos-row"><span>Subtotal</span><span>{formatPrice(summary.subtotal)}</span></div>
              <div className="cos-row">
                <span>Delivery Fee</span>
                <span>{summary.deliveryFee === 0 ? "FREE" : formatPrice(summary.deliveryFee)}</span>
              </div>
              <div className="cos-row"><span>GST (5%)</span><span>{formatPrice(summary.gst)}</span></div>
              {summary.discount > 0 && (
                <div className="cos-row">
                  <span>Coupon{summary.couponCode ? ` (${summary.couponCode})` : ""}</span>
                  <span>-{formatPrice(summary.discount)}</span>
                </div>
              )}

              <div className="cos-row total">
                <span>Total</span>
                <span>{formatPrice(placedTotal ?? summary.grandTotal)}</span>
              </div>

              <button className="place-order-btn" onClick={handlePlaceOrder} disabled={loading || !summary.readyForCheckout}>
                {loading ? "Placing order..." : "Place Order"}
              </button>
              <div style={{ textAlign: "center", fontSize: 11, color: "var(--text-muted)", marginTop: 8 }}>
                Totals are calculated on the server from current prices and stock.
              </div>

              <div className="guarantee-note">
                <strong>The Organic Guarantee</strong> - if freshness misses the mark, support can refund you quickly.
              </div>
            </div>
          </div>
        </div>
      </div>

      {order && (
        <div className="order-success-overlay">
          <div className="order-success-modal">
            <div className="success-icon" aria-hidden="true">
              <svg width="56" height="56" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="28" cy="28" r="28" fill="#e8f5ec"/>
                <circle cx="28" cy="28" r="20" fill="#1e6b33"/>
                <polyline points="18,28 25,35 38,21" stroke="#ffffff" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h2 className="success-title">Order Placed</h2>
            <p className="success-sub">Your groceries are being packed and will be on their way soon.</p>
            <div className="success-order-id">Order ID: #{order.orderId}</div>
            <div className="success-eta">
              Estimated delivery: {selectedDelivery === "express" ? "Within 45 mins" : "Tomorrow, 8 AM - 10 AM"}
            </div>
            {placedTotal != null && (
              <div className="success-eta" style={{ marginTop: 8 }}>
                Amount charged: {formatPrice(placedTotal)}
              </div>
            )}
            <button className="btn-primary" style={{ width: "100%" }} onClick={handleSuccessClose}>View Orders</button>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
