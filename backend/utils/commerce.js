// ─────────────────────────────────────────────────────────
//  Commerce — single source of truth for pricing rules
// ─────────────────────────────────────────────────────────

const GST_RATE = 0.05;
const DELIVERY_FEE = 49;
const FREE_DELIVERY_THRESHOLD = 499;

const COUPONS = {
  ORGANIC10: { type: "percent", value: 10, minSubtotal: 0 },
  FRESH20: { type: "percent", value: 20, minSubtotal: 499 },
  FLAT50: { type: "flat", value: 50, minSubtotal: 299 },
};

/**
 * Sale/unit price after discount percentage (matches Product.salePrice virtual).
 */
const computeSalePrice = (price, discount = 0) => {
  const listPrice = Number(price) || 0;
  const discountPct = Number(discount) || 0;
  if (discountPct <= 0) return listPrice;
  return Math.round(listPrice * (1 - discountPct / 100));
};

/**
 * Sum of line totals from cart/order items [{ price, quantity }].
 */
const computeSubtotal = (items = []) =>
  items.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 0), 0);

const computeGst = (subtotal) => Math.round(Number(subtotal) * GST_RATE);

const computeDeliveryFee = (subtotal) =>
  Number(subtotal) >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE;

const computeItemCount = (items = []) =>
  items.reduce((sum, item) => sum + Number(item.quantity || 0), 0);

/**
 * Validate coupon and return discount amount.
 */
const getCouponDiscount = (code, subtotal) => {
  if (!code) {
    return { couponCode: null, discount: 0, valid: false, message: null };
  }

  const normalizedCode = String(code).trim().toUpperCase();
  const coupon = COUPONS[normalizedCode];

  if (!coupon) {
    return {
      couponCode: null,
      discount: 0,
      valid: false,
      message: "Invalid coupon code.",
    };
  }

  if (Number(subtotal) < coupon.minSubtotal) {
    return {
      couponCode: null,
      discount: 0,
      valid: false,
      message: `This coupon requires a minimum subtotal of Rs. ${coupon.minSubtotal}.`,
    };
  }

  const discount =
    coupon.type === "percent"
      ? Math.round(Number(subtotal) * (coupon.value / 100))
      : coupon.value;

  return {
    couponCode: normalizedCode,
    discount,
    valid: true,
    message: `Coupon applied. You saved Rs. ${discount}.`,
  };
};

/**
 * Full cart/order pricing breakdown.
 * `total` = subtotal + gst + delivery (before coupon).
 * `grandTotal` = total - discount.
 */
const computePricing = (items = [], couponCode = null) => {
  const subtotal = computeSubtotal(items);
  const gst = computeGst(subtotal);
  const deliveryFee = computeDeliveryFee(subtotal);
  const total = subtotal + gst + deliveryFee;
  const coupon = getCouponDiscount(couponCode, subtotal);
  const discount = Math.min(coupon.discount, total);
  const grandTotal = Math.max(0, total - discount);

  return {
    subtotal,
    gst,
    deliveryFee,
    total,
    discount,
    couponCode: discount > 0 ? coupon.couponCode : null,
    couponValid: coupon.valid && discount > 0,
    couponMessage: coupon.message,
    grandTotal,
    itemCount: computeItemCount(items),
    freeDeliveryThreshold: FREE_DELIVERY_THRESHOLD,
    gstRate: GST_RATE,
    deliveryFeeAmount: DELIVERY_FEE,
  };
};

/**
 * Build API cart payload from mongoose cart document or plain items array.
 */
const buildCartPayload = (cartLike, couponCode = null) => {
  const items = Array.isArray(cartLike?.items) ? cartLike.items : cartLike || [];
  const pricing = computePricing(items, couponCode);

  return {
    _id: cartLike?._id,
    items,
    updatedAt: cartLike?.updatedAt,
    ...pricing,
  };
};

const listCouponCodes = () => Object.keys(COUPONS);

module.exports = {
  GST_RATE,
  DELIVERY_FEE,
  FREE_DELIVERY_THRESHOLD,
  COUPONS,
  computeSalePrice,
  computeSubtotal,
  computeGst,
  computeDeliveryFee,
  computeItemCount,
  getCouponDiscount,
  computePricing,
  buildCartPayload,
  listCouponCodes,
};
