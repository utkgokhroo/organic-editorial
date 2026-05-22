export function resolveImage(src, seed = "organic-editorial") {
  if (!src) return `https://picsum.photos/seed/${seed}/800/600`;
  if (src.startsWith("http://") || src.startsWith("https://")) return src;
  if (src.startsWith("/")) return src;
  return `${process.env.PUBLIC_URL}/${src}`;
}

export function normalizeProduct(raw = {}) {
  const id = raw.id || raw._id;
  const discount = Number(raw.discount ?? 0);
  let originalPrice;
  let salePrice;

  if (raw.salePrice != null) {
    originalPrice = Number(raw.originalPrice ?? raw.price ?? 0);
    salePrice = Number(raw.salePrice);
  } else if (raw.originalPrice != null) {
    originalPrice = Number(raw.originalPrice);
    salePrice = Number(raw.price ?? originalPrice);
  } else {
    originalPrice = Number(raw.price ?? 0);
    salePrice = originalPrice;
  }
  const stock = Number(raw.stock ?? (raw.inStock ? 1 : 0));
  const rating = Number(raw.rating ?? raw.ratings?.average ?? 0);
  const reviews = Number(raw.reviews ?? raw.ratings?.count ?? 0);

  return {
    ...raw,
    id,
    _id: raw._id || id,
    price: salePrice,
    originalPrice,
    discount,
    rating,
    reviews,
    stock,
    inStock: raw.inStock ?? stock > 0,
    image: resolveImage(raw.image, id),
    tags: Array.isArray(raw.tags) ? raw.tags : [],
  };
}

export function normalizeCartItem(raw = {}) {
  const product = raw.product && typeof raw.product === "object" ? raw.product : null;
  const productId = product?._id || raw.product || raw.productId || raw.id;

  return {
    ...raw,
    id: productId,
    productId,
    name: raw.name || product?.name || "Product",
    brand: raw.brand || product?.brand || "",
    unit: raw.unit || product?.unit || "",
    image: resolveImage(raw.image || product?.image, productId),
    price: Number(raw.price ?? product?.salePrice ?? product?.price ?? 0),
    quantity: Number(raw.quantity ?? 1),
  };
}

export function normalizeCart(raw = {}) {
  const items = Array.isArray(raw.items) ? raw.items.map(normalizeCartItem) : [];

  return {
    ...raw,
    items,
    itemCount: Number(raw.itemCount ?? 0),
    subtotal: Number(raw.subtotal ?? 0),
    gst: Number(raw.gst ?? 0),
    deliveryFee: Number(raw.deliveryFee ?? 0),
    total: Number(raw.total ?? 0),
    discount: Number(raw.discount ?? 0),
    grandTotal: Number(raw.grandTotal ?? raw.total ?? 0),
    couponCode: raw.couponCode ?? null,
    freeDeliveryThreshold: Number(raw.freeDeliveryThreshold ?? 0),
    availableCouponCodes: Array.isArray(raw.availableCouponCodes) ? raw.availableCouponCodes : [],
    warnings: Array.isArray(raw.warnings) ? raw.warnings : [],
    readyForCheckout: Boolean(raw.readyForCheckout ?? raw.items?.length > 0),
    couponValid: Boolean(raw.couponValid),
    couponMessage: raw.couponMessage ?? null,
  };
}

export function formatPrice(value) {
  return `Rs. ${Number(value || 0).toLocaleString("en-IN")}`;
}
