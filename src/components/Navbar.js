import React, { useEffect, useRef, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { productApi } from "../services/api";
import { formatPrice } from "../utils/productUtils";
import "../styles/Navbar.css";

function NavIcon({ name }) {
  const commonProps = {
    className: "nav-svg-icon",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": "true",
  };

  const icons = {
    search: (
      <>
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.35-4.35" />
      </>
    ),
    heart: (
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 1 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78Z" />
    ),
    cart: (
      <>
        <circle cx="9" cy="21" r="1" />
        <circle cx="20" cy="21" r="1" />
        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h8.72a2 2 0 0 0 2-1.61L23 6H6" />
      </>
    ),
    user: (
      <>
        <path d="M20 21a8 8 0 0 0-16 0" />
        <circle cx="12" cy="7" r="4" />
      </>
    ),
    logout: (
      <>
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
        <path d="M16 17l5-5-5-5" />
        <path d="M21 12H9" />
      </>
    ),
  };

  return <svg {...commonProps}>{icons[name]}</svg>;
}

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const { itemCount, wishlist } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searching, setSearching] = useState(false);
  const searchRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setResults([]);
      return;
    }

    const timer = setTimeout(() => {
      setSearching(true);
      productApi
        .list({ search: trimmed, limit: 5, sort: "featured" })
        .then((response) => setResults(response.data.products))
        .catch(() => setResults([]))
        .finally(() => setSearching(false));
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    const handler = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
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

  const submitSearch = () => {
    if (!query.trim()) return;
    setResults([]);
    navigate(`/products?search=${encodeURIComponent(query.trim())}`);
    setQuery("");
  };

  const handleLogout = async () => {
    await logout();
    setMenuOpen(false);
    navigate("/");
  };

  const mobileLinks = [
    { to: "/", label: "Home" },
    { to: "/products", label: "All Products" },
    { to: "/wishlist", label: "Wishlist" },
    { to: "/cart", label: "Cart" },
    { to: "/contact", label: "Contact" },
  ];

  return (
    <>
      <div className="delivery-bar">
        Free delivery on orders above <strong>Rs. 499</strong> &nbsp;-&nbsp; 30-minute express delivery available
      </div>
      <nav className={`navbar${scrolled ? " scrolled" : ""}`}>
        <div className="navbar-inner">
          <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
            <span /><span /><span />
          </button>
          <Link to="/" className="nav-logo">
            <span className="nav-logo-main">The Organic</span>
            <span className="nav-logo-sub">Editorial</span>
          </Link>

          <div className="nav-search" ref={searchRef}>
            <span className="search-icon"><NavIcon name="search" /></span>
            <input
              type="text"
              placeholder="Search for products, brands..."
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") submitSearch();
              }}
            />
            {(results.length > 0 || searching) && (
              <div className="search-dropdown">
                {searching && <div className="search-result-item">Searching...</div>}
                {!searching && results.map((result) => (
                  <div
                    key={result.id}
                    className="search-result-item"
                    onClick={() => handleResultClick(result.id)}
                  >
                    <img src={result.image} alt={result.name} className="search-result-img" />
                    <div>
                      <div className="search-result-name">{result.name}</div>
                      <div className="search-result-price">{formatPrice(result.price)}</div>
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
              { to: isAuthenticated ? "/profile" : "/login", label: isAuthenticated ? "Profile" : "Sign In" },
            ].map(({ to, label }) => (
              <NavLink
                key={`${to}-${label}`}
                to={to}
                end={to === "/"}
                className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}
              >
                {label}
              </NavLink>
            ))}
          </nav>

          <div className="nav-actions">
            <Link to="/wishlist" className="nav-icon-btn" title="Wishlist" aria-label="Wishlist">
              <NavIcon name="heart" />
              {wishlist.length > 0 && <span className="nav-badge">{wishlist.length}</span>}
            </Link>
            <Link to="/cart" className="nav-icon-btn" title="Cart" aria-label="Cart">
              <NavIcon name="cart" />
              {itemCount > 0 && <span className="nav-badge">{itemCount}</span>}
            </Link>
            {isAuthenticated ? (
              <>
                <Link
                  to="/profile"
                  className="nav-icon-btn nav-profile-btn"
                  title="Profile"
                  aria-label="View profile"
                >
                  <NavIcon name="user" />
                </Link>
                <button
                  className="nav-icon-btn nav-signout-btn"
                  title="Sign Out"
                  aria-label="Sign out"
                  onClick={handleLogout}
                >
                  <NavIcon name="logout" />
                  <span>Sign Out</span>
                </button>
              </>
            ) : (
              <Link to="/login" className="nav-icon-btn" title="Sign In" aria-label="Sign in">
                <NavIcon name="user" />
              </Link>
            )}
          </div>
        </div>
      </nav>
      <div className={`mobile-menu${menuOpen ? " open" : ""}`}>
        {mobileLinks.map(({ to, label }) => (
          <Link key={to} to={to} className="mobile-nav-link" onClick={() => setMenuOpen(false)}>
            {label}
          </Link>
        ))}
        {isAuthenticated ? (
          <>
            <Link to="/profile" className="mobile-nav-link" onClick={() => setMenuOpen(false)}>Profile</Link>
            <button className="mobile-nav-link mobile-nav-button" onClick={handleLogout}>Sign Out</button>
          </>
        ) : (
          <Link to="/login" className="mobile-nav-link" onClick={() => setMenuOpen(false)}>Sign In</Link>
        )}
      </div>
    </>
  );
}
