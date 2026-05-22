import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import Footer from "../components/Footer";
import { categories, bannerDeals, products as localProducts } from "../data/products";
import { productApi } from "../services/api";
import { formatPrice, normalizeProduct } from "../utils/productUtils";
import "../styles/Home.css";

// Pre-normalize local products once at module load
const normalizedLocal = localProducts.map(normalizeProduct);

const trustItems = [
  { icon: "🌿", title: "100% Organic", desc: "Certified by NPOP & PGS-India" },
  { icon: "⚡", title: "Express Delivery", desc: "30-min delivery in select areas" },
  { icon: "🔄", title: "Easy Returns", desc: "No-questions-asked freshness guarantee" },
  { icon: "🔒", title: "Secure Payments", desc: "UPI, Cards & Net Banking accepted" },
];

export default function Home() {
  const [activeBanner, setActiveBanner] = useState(0);
  const [featured, setFeatured] = useState([]);
  const [trending, setTrending] = useState([]);
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => setActiveBanner((prev) => (prev + 1) % bannerDeals.length), 4000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");

    // ── Helper: apply local sort ──────────────────────────
    const sortLocal = (arr, sort) => {
      const copy = [...arr];
      switch (sort) {
        case "rating":   return copy.sort((a, b) => b.rating - a.rating);
        case "discount": return copy.sort((a, b) => (b.originalPrice - b.price) / b.originalPrice - (a.originalPrice - a.price) / a.originalPrice);
        default:         return copy; // newest: keep data order
      }
    };

    Promise.all([
      productApi.list({ limit: 8, sort: "newest", inStock: true }),
      productApi.list({ limit: 4, sort: "rating", inStock: true }),
      productApi.list({ limit: 2, sort: "discount", inStock: true }),
    ])
      .then(([featuredResponse, trendingResponse, dealsResponse]) => {
        if (!active) return;
        setFeatured(featuredResponse.data.products);
        setTrending(trendingResponse.data.products);
        setDeals(dealsResponse.data.products);
      })
      .catch(() => {
        // ── API unavailable — fall back to local dataset ──
        if (!active) return;
        const inStock = normalizedLocal.filter((p) => p.inStock);
        setFeatured(sortLocal(inStock, "newest").slice(0, 8));
        setTrending(sortLocal(inStock, "rating").slice(0, 4));
        setDeals(sortLocal(inStock, "discount").slice(0, 2));
        // Don't set an error so the UI renders cleanly with local data
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="page-wrapper home-page">
      <div className="container">
        <div className="hero-slider">
          {bannerDeals.map((banner, index) => (
            <div
              key={banner.id}
              className="hero-slide"
              style={{
                background: banner.bg,
                display: index === activeBanner ? "flex" : "none",
              }}
            >
              <div className="hero-content">
                <div className="hero-label">Market Curation</div>
                <h1 className="hero-title">{banner.title}</h1>
                <p className="hero-subtitle">{banner.subtitle}</p>
                <Link to="/products" className="hero-btn">
                  {banner.cta}
                </Link>
              </div>
              <img src={banner.image} alt={banner.title} className="hero-image" />
            </div>
          ))}
          <div className="hero-dots">
            {bannerDeals.map((_, index) => (
              <button
                key={index}
                className={`hero-dot${index === activeBanner ? " active" : ""}`}
                onClick={() => setActiveBanner(index)}
                aria-label={`Show banner ${index + 1}`}
              />
            ))}
          </div>
        </div>

        <div className="home-section">
          <div className="home-section-header">
            <div>
              <h2 className="section-title">Shop by Category</h2>
              <p className="section-subtitle">Fresh picks from every aisle</p>
            </div>
            <Link to="/products" className="view-all-link">View All</Link>
          </div>
          <div className="categories-grid">
            {categories.map((cat) => (
              <Link
                to={`/products?category=${cat.name}`}
                key={cat.id}
                className="category-card"
                style={{ background: cat.color }}
              >
                <span className="category-icon">{cat.icon}</span>
                <span className="category-name">{cat.name}</span>
              </Link>
            ))}
          </div>
        </div>

        <div className="trust-strip">
          {trustItems.map((item) => (
            <div className="trust-item" key={item.title}>
              <span className="trust-icon">{item.icon}</span>
              <div>
                <div className="trust-title">{item.title}</div>
                <div className="trust-desc">{item.desc}</div>
              </div>
            </div>
          ))}
        </div>

        {error && <div className="alert-error">{error}</div>}
        {loading && <div className="loading-spinner"><div className="spinner" /></div>}

        {!loading && trending.length > 0 && (
          <div className="home-section">
            <div className="home-section-header">
              <div>
                <h2 className="section-title">Trending Now</h2>
                <p className="section-subtitle">Most loved by our community</p>
              </div>
              <Link to="/products?sort=rating" className="view-all-link">View All</Link>
            </div>
            <div className="products-grid">
              {trending.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        )}

        {!loading && deals.length > 0 && (
          <div className="deal-banner">
            <div>
              <div className="deal-label">Best Deals of the Week</div>
              <div className="deal-title">Hand-picked by<br />our curators</div>
              <p className="deal-desc">
                Our team works with trusted farms and brands to bring the best value every week.
              </p>
              <Link to="/products?sort=discount" className="hero-btn" style={{ background: "#fff", color: "#1b5e20" }}>
                Explore Deals
              </Link>
            </div>
            <div className="deal-items">
              {deals.map((product) => (
                <div
                  className="deal-item"
                  key={product.id}
                  onClick={() => navigate(`/product/${product.id}`)}
                  style={{ cursor: "pointer" }}
                >
                  <img src={product.image} alt={product.name} />
                  <div>
                    <div className="deal-item-name">{product.name}</div>
                    <div className="deal-item-offer">
                      {product.discount}% OFF - {formatPrice(product.price)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {!loading && featured.length > 0 && (
          <div className="home-section">
            <div className="home-section-header">
              <div>
                <h2 className="section-title">Our Selection</h2>
                <p className="section-subtitle">Curated for optimal nutrition and taste</p>
              </div>
              <Link to="/products" className="view-all-link">View All</Link>
            </div>
            <div className="products-grid">
              {featured.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        )}

        {!loading && !error && featured.length === 0 && (
          <div className="empty-state">
            <div className="icon">Products</div>
            <h3>No products available yet</h3>
            <p>Add products from the backend or run the product seed script.</p>
            <Link to="/products" className="btn-primary">Browse Products</Link>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}