import React from "react";
import { Link } from "react-router-dom";
import "../styles/Footer.css";

function FooterIcon({ name }) {
  const commonProps = {
    className: "footer-svg-icon",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": "true",
  };

  const icons = {
    journal: (
      <>
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15Z" />
        <path d="M8 7h8" />
        <path d="M8 11h6" />
      </>
    ),
    camera: (
      <>
        <path d="M4 8h3l2-3h6l2 3h3v11H4V8Z" />
        <circle cx="12" cy="13" r="3.5" />
      </>
    ),
    recipes: (
      <>
        <path d="M5 3v18" />
        <path d="M19 3v18" />
        <path d="M5 8h14" />
        <path d="M5 16h14" />
        <path d="M9 3v5" />
        <path d="M15 16v5" />
      </>
    ),
    phone: (
      <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.3 1.7.6 2.5a2 2 0 0 1-.5 2.1L8 9.5a16 16 0 0 0 6.5 6.5l1.2-1.2a2 2 0 0 1 2.1-.5c.8.3 1.6.5 2.5.6a2 2 0 0 1 1.7 2Z" />
    ),
    mail: (
      <>
        <path d="M4 4h16v16H4V4Z" />
        <path d="m4 7 8 6 8-6" />
      </>
    ),
  };

  return <svg {...commonProps}>{icons[name]}</svg>;
}

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner container">
        <div className="footer-brand">
          <div className="footer-logo">
            <span className="footer-logo-main">The Organic Editorial</span>
          </div>
          <p className="footer-tagline">
            Curating the finest organic produce and artisan goods from local heritage farms directly to your kitchen.
          </p>
          <div className="footer-socials">
            <a href="#!" className="social-btn" aria-label="Journal">
              <FooterIcon name="journal" />
            </a>
            <a href="#!" className="social-btn" aria-label="Gallery">
              <FooterIcon name="camera" />
            </a>
            <a href="#!" className="social-btn" aria-label="Recipes">
              <FooterIcon name="recipes" />
            </a>
          </div>
        </div>

        <div className="footer-links-group">
          <h4>Discover</h4>
          <ul>
            <li><Link to="/products">All Products</Link></li>
            <li><Link to="/products?category=Fruits">Fresh Fruits</Link></li>
            <li><Link to="/products?category=Vegetables">Vegetables</Link></li>
            <li><Link to="/products?category=Dairy">Dairy & Eggs</Link></li>
          </ul>
        </div>

        <div className="footer-links-group">
          <h4>Customer Care</h4>
          <ul>
            <li><Link to="/contact">Help Center</Link></li>
            <li><a href="#!">Shipping Info</a></li>
            <li><a href="#!">Returns Policy</a></li>
            <li><a href="#!">Track Your Order</a></li>
          </ul>
        </div>

        <div className="footer-links-group">
          <h4>Legal</h4>
          <ul>
            <li><a href="#!">Privacy Policy</a></li>
            <li><a href="#!">Terms of Service</a></li>
            <li><a href="#!">Sustainability</a></li>
            <li><a href="#!">FSSAI License</a></li>
          </ul>
        </div>

        <div className="footer-newsletter">
          <h4>Join the Journal</h4>
          <p>Seasonal picks, recipes & exclusive deals.</p>
          <div className="newsletter-form">
            <input type="email" placeholder="your@email.com" aria-label="Newsletter email" />
            <button>Join -&gt;</button>
          </div>
          <div className="footer-contact-info">
            <span><FooterIcon name="phone" /> +91 94136 26864</span>
            <span><FooterIcon name="mail" /> support@theorganiceditorial.in</span>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <div className="container">
          <span>&copy; 2026 The Organic Editorial. All rights reserved. | GSTIN: 29AABCU9603R1ZX</span>
          <div className="footer-payments">
            <span>UPI</span><span>Visa</span><span>Mastercard</span><span>NetBanking</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
