import React from "react";
import { Link } from "react-router-dom";
import "../styles/Footer.css";

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
            <a href="#!" className="social-btn">📘</a>
            <a href="#!" className="social-btn">📸</a>
            <a href="#!" className="social-btn">🐦</a>
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
            <input type="email" placeholder="your@email.com" />
            <button>Join →</button>
          </div>
          <div className="footer-contact-info">
            <span>📞 +91 94136 26864</span>
            <span>✉️ hello@theorganiceditorial.in</span>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <div className="container">
          <span>© 2024 The Organic Editorial. All rights reserved. | GSTIN: 29AABCU9603R1ZX</span>
          <div className="footer-payments">
            <span>UPI</span><span>Visa</span><span>Mastercard</span><span>NetBanking</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
