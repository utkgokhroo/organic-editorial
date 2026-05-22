import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useRequireAuth } from "../hooks/useRequireAuth";
import ProductCard from "../components/ProductCard";
import Footer from "../components/Footer";
import { productApi } from "../services/api";
import { formatPrice } from "../utils/productUtils";
import "../styles/ProductDetail.css";

const nutritionData = {
  Dairy: [
    { label: "Serving Size", value: "250ml" },
    { label: "Calories", value: "150 kcal" },
    { label: "Total Fat", value: "8g" },
    { label: "Saturated Fat", value: "5g" },
    { label: "Protein", value: "8g" },
    { label: "Calcium", value: "30% DV" },
  ],
  Fruits: [
    { label: "Serving Size", value: "100g" },
    { label: "Calories", value: "52 kcal" },
    { label: "Carbohydrates", value: "14g" },
    { label: "Dietary Fiber", value: "2.4g" },
    { label: "Vitamin C", value: "14% DV" },
  ],
  default: [
    { label: "Serving Size", value: "100g" },
    { label: "Calories", value: "120 kcal" },
    { label: "Carbohydrates", value: "22g" },
    { label: "Protein", value: "4g" },
    { label: "Fat", value: "2g" },
  ],
};

function ProductDetailIcon({ name }) {
  const commonProps = {
    className: "product-detail-svg",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": "true",
  };

  const icons = {
    delivery: (
      <>
        <path d="M10 17h4V5H2v12h3" />
        <path d="M14 8h4l4 4v5h-3" />
        <circle cx="7.5" cy="17.5" r="2.5" />
        <circle cx="16.5" cy="17.5" r="2.5" />
      </>
    ),
    eco: (
      <>
        <path d="M5 12a7 7 0 0 1 12-5" />
        <path d="M19 6v5h-5" />
        <path d="M19 12a7 7 0 0 1-12 5" />
        <path d="M5 18v-5h5" />
      </>
    ),
    farm: (
      <>
        <path d="M3 21V9l9-6 9 6v12" />
        <path d="M9 21v-7h6v7" />
        <path d="M7 10h10" />
      </>
    ),
    clock: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </>
    ),
    source: (
      <>
        <path d="M12 22s7-5.3 7-12a7 7 0 1 0-14 0c0 6.7 7 12 7 12Z" />
        <circle cx="12" cy="10" r="2.5" />
      </>
    ),
    stock: (
      <>
        <path d="m21 8-9-5-9 5 9 5 9-5Z" />
        <path d="M3 8v8l9 5 9-5V8" />
        <path d="M12 13v8" />
      </>
    ),
    cert: (
      <>
        <path d="M12 3 5 6v5c0 4.4 2.9 8.4 7 10 4.1-1.6 7-5.6 7-10V6l-7-3Z" />
        <path d="m9 12 2 2 4-5" />
      </>
    ),
  };

  return <svg {...commonProps}>{icons[name]}</svg>;
}

function RatingStars({ rating }) {
  const activeStars = Math.max(1, Math.round(rating || 0));

  return (
    <span className="detail-stars" aria-label={`${Number(rating || 0).toFixed(1)} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, index) => (
        <svg
          key={index}
          className={`detail-star-icon${index < activeStars ? " active" : ""}`}
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path d="m12 2.5 2.9 6 6.6 1-4.8 4.7 1.1 6.6L12 17.7l-5.8 3.1 1.1-6.6-4.8-4.7 6.6-1L12 2.5Z" />
        </svg>
      ))}
    </span>
  );
}

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { requireAuth } = useRequireAuth();
  const { cart, dispatch, wishlist, wishlistDispatch } = useCart();
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [qty, setQty] = useState(1);
  const [activeThumb, setActiveThumb] = useState(0);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");

    productApi
      .get(id)
      .then((response) => {
        if (!active) return;
        const currentProduct = response.data.product;
        setProduct(currentProduct);
        setQty(1);
        setActiveThumb(0);

        productApi.list({
          category: currentProduct.category,
          limit: 4,
          sort: "rating",
        })
          .then((relatedResponse) => {
            if (active) {
              setRelated(relatedResponse.data.products.filter((item) => item.id !== currentProduct.id).slice(0, 4));
            }
          })
          .catch(() => {
            if (active) setRelated([]);
          });
      })
      .catch((apiError) => {
        if (!active) return;
        setError(apiError.message || "Unable to load this product.");
        setProduct(null);
        setRelated([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="page-wrapper product-detail-page">
        <div className="loading-spinner"><div className="spinner" /></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="page-wrapper" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div className="empty-state">
          <div className="icon">Not found</div>
          <h3>{error || "Product not found"}</h3>
          <button className="btn-primary" onClick={() => navigate("/products")}>Browse Products</button>
        </div>
      </div>
    );
  }

  const cartItem = cart.items.find((item) => item.id === product.id);
  const inWishlist = wishlist.some((item) => item.id === product.id);
  const discount = product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;
  const nutrition = nutritionData[product.category] || nutritionData.default;
  const thumbImages = [product.image];

  const addToCart = async () => {
    if (!requireAuth()) return;
    setBusy(true);
    try {
      await dispatch({ type: "ADD_ITEM", payload: { ...product, quantity: qty } });
      setError("");
    } catch (apiError) {
      setError(apiError.message);
    } finally {
      setBusy(false);
    }
  };

  const updateCartQty = async (nextQty) => {
    if (!requireAuth()) return;
    setBusy(true);
    try {
      await dispatch({ type: "UPDATE_QTY", payload: { id: product.id, qty: nextQty } });
      setError("");
    } catch (apiError) {
      setError(apiError.message);
    } finally {
      setBusy(false);
    }
  };

  const toggleWishlist = async () => {
    if (!requireAuth()) return;
    setBusy(true);
    try {
      await wishlistDispatch({
        type: inWishlist ? "REMOVE_WISHLIST" : "ADD_WISHLIST",
        payload: product,
      });
      setError("");
    } catch (apiError) {
      setError(apiError.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="page-wrapper product-detail-page">
      <div className="container">
        <div className="breadcrumb">
          <Link to="/">Home</Link>
          <span>/</span>
          <Link to="/products">Products</Link>
          <span>/</span>
          <Link to={`/products?category=${product.category}`}>{product.category}</Link>
          <span>/</span>
          <span>{product.name}</span>
        </div>

        {error && <div className="alert-error">{error}</div>}

        <div className="product-detail-grid">
          <div className="product-images">
            <div className="main-img-wrap">
              <img src={thumbImages[activeThumb]} alt={product.name} />
              {product.badge && (
                <span className="detail-badge" style={{ background: product.badgeColor || "#2e7d32" }}>
                  {product.badge}
                </span>
              )}
            </div>
            <div className="thumb-row">
              {thumbImages.map((src, index) => (
                <div
                  key={src}
                  className={`thumb${index === activeThumb ? " active" : ""}`}
                  onClick={() => setActiveThumb(index)}
                >
                  <img src={src} alt="" />
                </div>
              ))}
            </div>
          </div>

          <div className="product-detail-info">
            <div className="detail-category">{product.category}</div>
            <h1 className="detail-name">{product.name}</h1>
            <div className="detail-brand">By {product.brand} - {product.unit}</div>

            <div className="detail-rating-row">
              <RatingStars rating={product.rating} />
              <span className="detail-rating-num">{product.rating.toFixed(1)}</span>
              <span className="detail-reviews">({product.reviews.toLocaleString("en-IN")} reviews)</span>
            </div>

            <div className="detail-price-row">
              <span className="detail-price">{formatPrice(product.price)}</span>
              {discount > 0 && (
                <>
                  <span className="detail-original-price">{formatPrice(product.originalPrice)}</span>
                  <span className="detail-discount-badge">{discount}% OFF</span>
                </>
              )}
            </div>

            <div className={`detail-stock ${product.inStock ? "in-stock" : "out-of-s"}`}>
              <div className="stock-dot" />
              {product.inStock ? `In Stock - ${product.stock} available` : "Out of Stock"}
            </div>

            <hr className="detail-divider" />

            {product.inStock && !cartItem && (
              <div className="qty-section">
                <div className="qty-label">Quantity</div>
                <div className="detail-qty-control">
                  <button className="detail-qty-btn" onClick={() => setQty(Math.max(1, qty - 1))}>-</button>
                  <span className="detail-qty-num">{qty}</span>
                  <button className="detail-qty-btn" onClick={() => setQty(Math.min(product.stock, qty + 1))}>+</button>
                </div>
              </div>
            )}

            <div className="detail-cta-row">
              {cartItem ? (
                <div className="detail-qty-control" style={{ flex: 1, justifyContent: "center" }}>
                  <button className="detail-qty-btn" onClick={() => updateCartQty(cartItem.quantity - 1)} disabled={busy}>-</button>
                  <span className="detail-qty-num">{cartItem.quantity} in cart</span>
                  <button className="detail-qty-btn" onClick={() => updateCartQty(cartItem.quantity + 1)} disabled={busy}>+</button>
                </div>
              ) : (
                <button className="add-cart-btn" onClick={addToCart} disabled={!product.inStock || busy}>
                  {product.inStock ? (busy ? "Adding..." : "Add to Cart") : "Out of Stock"}
                </button>
              )}
              <button className="wishlist-btn-detail" onClick={toggleWishlist} disabled={busy}>
                {inWishlist ? "Saved" : "Save"}
              </button>
            </div>

            <div className="detail-perks">
              <div className="perk-item">
                <span className="perk-icon"><ProductDetailIcon name="delivery" /></span>
                <span><strong>Free morning delivery</strong> on orders above Rs. 499</span>
              </div>
              <div className="perk-item">
                <span className="perk-icon"><ProductDetailIcon name="eco" /></span>
                <span><strong>Zero waste packaging</strong> with reusable cooling bags</span>
              </div>
              <div className="perk-item">
                <span className="perk-icon"><ProductDetailIcon name="farm" /></span>
                <span><strong>Sourced from:</strong> {product.farm || "verified organic partners"}</span>
              </div>
              <div className="perk-item">
                <span className="perk-icon"><ProductDetailIcon name="clock" /></span>
                <span><strong>Delivery in {product.deliveryTime || "45 mins"}</strong> in your area</span>
              </div>
            </div>
          </div>
        </div>

        <div className="product-story">
          <h2 className="story-title">Product Story</h2>
          <p className="story-text">{product.description}</p>
          <div className="story-tags">
            <div className="story-tag">
              <span className="story-tag-icon"><ProductDetailIcon name="source" /></span>
              <span className="story-tag-copy">
                <strong>Source</strong>
                <span>{product.farm || "Verified supplier"}</span>
              </span>
            </div>
            <div className="story-tag">
              <span className="story-tag-icon"><ProductDetailIcon name="stock" /></span>
              <span className="story-tag-copy">
                <strong>Stock</strong>
                <span>{product.stock} units</span>
              </span>
            </div>
            <div className="story-tag">
              <span className="story-tag-icon"><ProductDetailIcon name="cert" /></span>
              <span className="story-tag-copy">
                <strong>Cert</strong>
                <span>NPOP Organic</span>
              </span>
            </div>
          </div>

          <h2 className="story-title" style={{ marginTop: 28 }}>Nutritional Facts</h2>
          <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 12 }}>
            Values are representative and may vary by harvest and batch.
          </p>
          <table className="nutrition-table">
            <thead>
              <tr>
                <th>Nutrient</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {nutrition.map((row) => (
                <tr key={row.label}>
                  <td>{row.label}</td>
                  <td>{row.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {related.length > 0 && (
          <div className="related-section">
            <div className="home-section-header">
              <h2 className="section-title">Complete Your Pantry</h2>
              <Link to={`/products?category=${product.category}`} className="view-all-link">View All</Link>
            </div>
            <div className="products-grid">
              {related.map((item) => (
                <ProductCard key={item.id} product={item} />
              ))}
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
