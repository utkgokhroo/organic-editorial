import React, { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import ProductCard from "../components/ProductCard";
import Footer from "../components/Footer";
import { products } from "../data/products";
import "../styles/ProductDetail.css";

const nutritionData = {
  "Dairy": [
    { label: "Serving Size", value: "250ml" },
    { label: "Calories", value: "150 kcal" },
    { label: "Total Fat", value: "8g" },
    { label: "Saturated Fat", value: "5g" },
    { label: "Protein", value: "8g" },
    { label: "Calcium", value: "30% DV" },
    { label: "Vitamin D", value: "15% DV" },
  ],
  "Fruits": [
    { label: "Serving Size", value: "100g" },
    { label: "Calories", value: "52 kcal" },
    { label: "Carbohydrates", value: "14g" },
    { label: "Dietary Fiber", value: "2.4g" },
    { label: "Vitamin C", value: "14% DV" },
    { label: "Potassium", value: "107mg" },
  ],
  "default": [
    { label: "Serving Size", value: "100g" },
    { label: "Calories", value: "120 kcal" },
    { label: "Carbohydrates", value: "22g" },
    { label: "Protein", value: "4g" },
    { label: "Fat", value: "2g" },
    { label: "Sodium", value: "5mg" },
  ],
};

function resolveImage(src, seed) {
  if (!src) return `https://picsum.photos/seed/${seed}/800/600`;
  if (src.startsWith("http://") || src.startsWith("https://")) return src;
  return `${process.env.PUBLIC_URL}/${src}`;
}

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const product = products.find((p) => p.id === Number(id));
  const { cart, dispatch, wishlist, wishlistDispatch } = useCart();
  const [qty, setQty] = useState(0);
  const [activeThumb, setActiveThumb] = useState(0);

  if (!product) {
    return (
      <div className="page-wrapper" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div className="empty-state">
          <div className="icon">😕</div>
          <h3>Product not found</h3>
          <button className="btn-primary" onClick={() => navigate("/products")}>Browse Products</button>
        </div>
      </div>
    );
  }

  const cartItem = cart.items.find((i) => i.id === product.id);
  const inWishlist = wishlist.some((i) => i.id === product.id);
  const discount = product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const nutrition = nutritionData[product.category] || nutritionData["default"];

  const related = products.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 4);

  const thumbImages = [product.image];

  const handleAddToCart = () => {
    for (let i = 0; i < qty; i++) {
      dispatch({ type: "ADD_ITEM", payload: product });
    }
  };

  const toggleWishlist = () => {
    if (inWishlist) {
      wishlistDispatch({ type: "REMOVE_WISHLIST", payload: product.id });
    } else {
      wishlistDispatch({ type: "ADD_WISHLIST", payload: product });
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

        <div className="product-detail-grid">
          {/* Images */}
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
              {thumbImages.map((src, i) => (
                <div
                  key={i}
                  className={`thumb${i === activeThumb ? " active" : ""}`}
                  onClick={() => setActiveThumb(i)}
                >
                  <img src={src} alt="" />
                </div>
              ))}
            </div>
          </div>

          {/* Info */}
          <div className="product-detail-info">
            <div className="detail-category">{product.category}</div>
            <h1 className="detail-name">{product.name}</h1>
            <div className="detail-brand">By {product.brand} · {product.unit}</div>

            <div className="detail-rating-row">
              <span className="detail-stars">
                {"★".repeat(Math.floor(product.rating))}{"☆".repeat(5 - Math.floor(product.rating))}
              </span>
              <span className="detail-rating-num">{product.rating}</span>
              <span className="detail-reviews">({product.reviews.toLocaleString()} reviews)</span>
            </div>

            <div className="detail-price-row">
              <span className="detail-price">₹{product.price}</span>
              {discount > 0 && (
                <>
                  <span className="detail-original-price">₹{product.originalPrice}</span>
                  <span className="detail-discount-badge">{discount}% OFF</span>
                </>
              )}
            </div>

            <div className={`detail-stock ${product.inStock ? "in-stock" : "out-of-s"}`}>
              <div className="stock-dot" />
              {product.inStock ? `In Stock · Only 5 left` : "Out of Stock"}
            </div>

            <hr className="detail-divider" />

            {product.inStock && !cartItem && qty > 0 && (
            <div className="qty-section">
              <div className="qty-label">Quantity</div>
              <div className="detail-qty-control">
                <button className="detail-qty-btn" onClick={() => setQty(Math.max(0, qty - 1))}>−</button>
                <span className="detail-qty-num">{qty}</span>
                <button className="detail-qty-btn" onClick={() => setQty(qty + 1)}>+</button>
              </div>
            </div>
             )}

            <div className="detail-cta-row">
              {cartItem ? (
                <div className="detail-qty-control" style={{ flex: 1, justifyContent: "center" }}>
                  <button className="detail-qty-btn" onClick={() => dispatch({ type: "UPDATE_QTY", payload: { id: product.id, qty: cartItem.quantity - 1 } })}>−</button>
                  <span className="detail-qty-num">{cartItem.quantity} in cart</span>
                  <button className="detail-qty-btn" onClick={() => dispatch({ type: "UPDATE_QTY", payload: { id: product.id, qty: cartItem.quantity + 1 } })}>+</button>
                </div>
              ) : (
              <button
                className="add-cart-btn"
                onClick={() => {
                  const addQty = qty < 1 ? 1 : qty;
                  for (let i = 0; i < addQty; i++) {
                    dispatch({ type: "ADD_ITEM", payload: product });
                  }
                  setQty(0);
                }}
                disabled={!product.inStock}
              >
                {product.inStock ? "🛒 Add to Cart" : "Out of Stock"}
              </button>
            )}
              <button className="wishlist-btn-detail" onClick={toggleWishlist}>
                {inWishlist ? "❤️" : "🤍"}
              </button>
            </div>

            <div className="detail-perks">
              <div className="perk-item">
                <span className="perk-icon">🚀</span>
                <span><strong>Free Morning Delivery</strong> · On orders above ₹{499}</span>
              </div>
              <div className="perk-item">
                <span className="perk-icon">♻️</span>
                <span><strong>Zero Waste Packaging</strong> · Eco-friendly cooling bags</span>
              </div>
              <div className="perk-item">
                <span className="perk-icon">🌿</span>
                <span><strong>Sourced from:</strong> {product.farm}</span>
              </div>
              <div className="perk-item">
                <span className="perk-icon">⚡</span>
                <span><strong>Delivery in {product.deliveryTime}</strong> in your area</span>
              </div>
            </div>
          </div>
        </div>

        {/* Product Story */}
        <div className="product-story">
          <h2 className="story-title">Product Story</h2>
          <p className="story-text">{product.description}</p>
          <div className="story-tags">
            <div className="story-tag">SOURCE <span>{product.farm}</span></div>
            <div className="story-tag">PROCESS <span>Non-Homogenized</span></div>
            <div className="story-tag">CERT <span>NPOP Organic</span></div>
          </div>

          <h2 className="story-title" style={{ marginTop: 28 }}>Nutritional Facts</h2>
          <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 12 }}>
            *Values based on a 2,000 calorie diet and may vary based on your needs.
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

        {/* Complete Your Pantry */}
        {related.length > 0 && (
          <div className="related-section">
            <div className="home-section-header">
              <h2 className="section-title">Complete Your Pantry</h2>
              <Link to={`/products?category=${product.category}`} className="view-all-link">View All →</Link>
            </div>
            <div className="products-grid">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
