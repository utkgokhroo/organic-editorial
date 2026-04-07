import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import Footer from "../components/Footer";
import { products, categories, bannerDeals } from "../data/products";
import "../styles/Home.css";

const trustItems = [
  { icon: "🌿", title: "100% Organic", desc: "Certified by NPOP & PGS-India" },
  { icon: "⚡", title: "Express Delivery", desc: "30-min delivery in select areas" },
  { icon: "🔄", title: "Easy Returns", desc: "No-questions-asked freshness guarantee" },
  { icon: "🔒", title: "Secure Payments", desc: "UPI, Cards & Net Banking accepted" },
];

export default function Home() {
  const [activeBanner, setActiveBanner] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const t = setInterval(() => setActiveBanner((p) => (p + 1) % bannerDeals.length), 4000);
    return () => clearInterval(t);
  }, []);

  const featured = products.filter((p) => p.inStock).slice(0, 8);
  const trending = products.filter((p) => p.badge && p.inStock).slice(0, 4);
  const deals = products.filter((p) => p.originalPrice > p.price && p.inStock).slice(0, 2);

  return (
    <div className="page-wrapper home-page">
      <div className="container">
        {/* Hero Banner */}
        <div className="hero-slider">
          {bannerDeals.map((banner, idx) => (
            <div
              key={banner.id}
              className="hero-slide"
              style={{
                background: banner.bg,
                display: idx === activeBanner ? "flex" : "none",
              }}
            >
              <div className="hero-content">
                <div className="hero-label">Market Curation</div>
                <h1 className="hero-title">{banner.title}</h1>
                <p className="hero-subtitle">{banner.subtitle}</p>
                <Link to="/products" className="hero-btn">
                  {banner.cta} →
                </Link>
              </div>
              <img src={banner.image} alt={banner.title} className="hero-image" />
            </div>
          ))}
          <div className="hero-dots">
            {bannerDeals.map((_, i) => (
              <button
                key={i}
                className={`hero-dot${i === activeBanner ? " active" : ""}`}
                onClick={() => setActiveBanner(i)}
              />
            ))}
          </div>
        </div>

        {/* Categories */}
        <div className="home-section">
          <div className="home-section-header">
            <div>
              <h2 className="section-title">Shop by Category</h2>
              <p className="section-subtitle">Fresh picks from every aisle</p>
            </div>
            <Link to="/products" className="view-all-link">View All →</Link>
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

        {/* Trust Strip */}
        <div className="trust-strip">
          {trustItems.map((t, i) => (
            <div className="trust-item" key={i}>
              <span className="trust-icon">{t.icon}</span>
              <div>
                <div className="trust-title">{t.title}</div>
                <div className="trust-desc">{t.desc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Trending */}
        <div className="home-section">
          <div className="home-section-header">
            <div>
              <h2 className="section-title">Trending Now</h2>
              <p className="section-subtitle">Most loved by our community</p>
            </div>
            <Link to="/products" className="view-all-link">View All →</Link>
          </div>
          <div className="products-grid">
            {trending.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>

        {/* Deal Banner */}
        <div className="deal-banner">
          <div>
            <div className="deal-label">Best Deals of the Week</div>
            <div className="deal-title">
              Hand-picked by<br />our curators
            </div>
            <p className="deal-desc">
              Our team scours local farms and trusted brands to bring you the best value every week.
            </p>
            <Link to="/products" className="hero-btn" style={{ background: "#fff", color: "#1b5e20" }}>
              Explore Deals →
            </Link>
          </div>
          <div className="deal-items">
            {deals.map((p) => (
              <div
                className="deal-item"
                key={p.id}
                onClick={() => navigate(`/product/${p.id}`)}
                style={{ cursor: "pointer" }}
              >
                <img src={p.image} alt={p.name} />
                <div>
                  <div className="deal-item-name">{p.name}</div>
                  <div className="deal-item-offer">
                    {Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100)}% OFF · ₹{p.price}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Featured Products */}
        <div className="home-section">
          <div className="home-section-header">
            <div>
              <h2 className="section-title">Our Selection</h2>
              <p className="section-subtitle">Curated for optimal nutrition & taste</p>
            </div>
            <Link to="/products" className="view-all-link">View All →</Link>
          </div>
          <div className="products-grid">
            {featured.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
