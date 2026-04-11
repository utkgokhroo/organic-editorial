import React, { useState, useEffect, useRef } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { products } from "../data/products";
import "../styles/Navbar.css";

export default function Navbar() {
  const { itemCount, wishlist } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const searchRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (query.trim().length > 1) {
      const filtered = products.filter(
        (p) =>
          p.name.toLowerCase().includes(query.toLowerCase()) ||
          p.brand.toLowerCase().includes(query.toLowerCase()) ||
          p.category.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 5);
      setResults(filtered);
    } else {
      setResults([]);
    }
  }, [query]);

  useEffect(() => {
    const handler = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setResults([]);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleResultClick = (id) => {
    setQuery("");
    setResults([]);
    navigate(`/product/${id}`);
  };

  return (
    <>
      <div className="delivery-bar">
        🌿 Free delivery on orders above <strong>₹499</strong> &nbsp;·&nbsp; ⚡ 30-minute express delivery available
      </div>
      <nav className={`navbar${scrolled ? " scrolled" : ""}`}>
        <div className="navbar-inner">
          <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
            <span /><span /><span />
          </button>
          <Link to="/" className="nav-logo">
            <span className="nav-logo-main">The Organic</span>
            <span className="nav-logo-sub">Editorial</span>
          </Link>

          <div className="nav-search" ref={searchRef}>
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search for products, brands..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && query.trim()) {
                  setResults([]);
                  navigate(`/products?search=${encodeURIComponent(query.trim())}`);
                  setQuery("");
                }
              }}
            />
            {results.length > 0 && (
              <div className="search-dropdown">
                {results.map((r) => (
                  <div
                    key={r.id}
                    className="search-result-item"
                    onClick={() => handleResultClick(r.id)}
                  >
                    <img src={r.image} alt={r.name} className="search-result-img" />
                    <div>
                      <div className="search-result-name">{r.name}</div>
                      <div className="search-result-price">₹{r.price}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <nav className="nav-links">
            {[
              { to: "/", label: "Home" },
              { to: "/products", label: "Products" },
              { to: "/contact", label: "Contact" },
              { to: "/login", label: "Sign In" },
            ].map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                end={to === "/"}
                className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}
              >
                {label}
              </NavLink>
            ))}
          </nav>

          <div className="nav-actions">
            <Link
              to="/wishlist"
              className="nav-icon-btn"
              title="Wishlist"
            >
              🤍
              {wishlist.length > 0 && (
                <span className="nav-badge">{wishlist.length}</span>
              )}
            </Link>
            <Link to="/cart" className="nav-icon-btn" title="Cart">
              🛒
              {itemCount > 0 && (
                <span className="nav-badge">{itemCount}</span>
              )}
            </Link>
            <Link to="/login" className="nav-icon-btn" title="Sign In">
              👤
            </Link>
          </div>
        </div>
      </nav>
      <div className={`mobile-menu${menuOpen ? " open" : ""}`}>
        {[
          { to: "/", label: "🏠 Home" },
          { to: "/products", label: "🛍️ All Products" },
          { to: "/wishlist", label: "🤍 Wishlist" },
          { to: "/cart", label: "🛒 Cart" },
          { to: "/login", label: "👤 Sign In" },
          { to: "/contact", label: "📞 Contact" },
        ].map(({ to, label }) => (
          <Link
            key={to}
            to={to}
            className="mobile-nav-link"
            onClick={() => setMenuOpen(false)}
          >
            {label}
          </Link>
        ))}
      </div>
    </>
  );
}
