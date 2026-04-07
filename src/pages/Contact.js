import React, { useState } from "react";
import Footer from "../components/Footer";
import "../styles/Contact.css";

const contactInfo = [
  { icon: "📞", title: "Call Us", value: "+91 98765 43210", sub: "Mon–Sat, 8AM–8PM IST" },
  { icon: "✉️", title: "Email Us", value: "hello@theorganiceditorial.in", sub: "We reply within 2 hours" },
  { icon: "📍", title: "Warehouse", value: "Koramangala, Bengaluru – 560095", sub: "No walk-in, delivery only" },
  { icon: "💬", title: "WhatsApp", value: "+91 98765 43210", sub: "Quick order support" },
];

const hours = [
  { day: "Monday – Friday", time: "8:00 AM – 9:00 PM" },
  { day: "Saturday", time: "8:00 AM – 8:00 PM" },
  { day: "Sunday", time: "9:00 AM – 6:00 PM" },
  { day: "Public Holidays", time: "10:00 AM – 4:00 PM" },
];

export default function Contact() {
  const [form, setForm] = useState({
    name: "", email: "", phone: "", subject: "", category: "General Inquiry", message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => { setLoading(false); setSubmitted(true); }, 1500);
  };

  return (
    <div className="page-wrapper contact-page">
      <div className="container">
        <div style={{ display: "flex", gap: 12, alignItems: "center", fontSize: 13, color: "var(--text-muted)", marginBottom: 8 }}>
          <span>Home</span><span>/</span><span>Contact</span>
        </div>

        <div className="contact-layout">
          <div className="contact-info-section">
            <h1 className="contact-hero-text">
              We're here for<br />
              your <span>organic</span><br />
              journey
            </h1>
            <p className="contact-intro">
              Questions about your order, sourcing practices, or just want to chat about good food?
              Our team of organic enthusiasts is here to help.
            </p>

            <div className="contact-cards">
              {contactInfo.map((c, i) => (
                <div className="contact-card" key={i}>
                  <div className="contact-card-icon">{c.icon}</div>
                  <div>
                    <div className="contact-card-title">{c.title}</div>
                    <div className="contact-card-value">{c.value}</div>
                    <div className="contact-card-sub">{c.sub}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="hours-table">
              <div className="hours-table-title">Operating Hours</div>
              {hours.map((h) => (
                <div className="hours-row" key={h.day}>
                  <span className="hours-day">{h.day}</span>
                  <span className="hours-time">{h.time}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="contact-form-section">
            {submitted ? (
              <div className="contact-success">
                <div className="contact-success-icon">🌿</div>
                <h3>Message Received!</h3>
                <p>
                  Thank you for reaching out, {form.name.split(" ")[0]}!<br />
                  Our team will get back to you within 2 hours.
                </p>
                <button
                  className="btn-primary"
                  style={{ marginTop: 24 }}
                  onClick={() => { setSubmitted(false); setForm({ name: "", email: "", phone: "", subject: "", category: "General Inquiry", message: "" }); }}
                >
                  Send Another
                </button>
              </div>
            ) : (
              <>
                <div className="contact-form-header">
                  <h2>Send us a message</h2>
                  <p>We'll respond within 2 hours on working days</p>
                </div>
                <form className="contact-form-body" onSubmit={handleSubmit}>
                  <div className="contact-select-wrap">
                    <div className="form-group">
                      <label className="form-label">Your Name *</label>
                      <input
                        className="form-input"
                        name="name"
                        placeholder="Priya Sharma"
                        value={form.name}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Phone Number</label>
                      <input
                        className="form-input"
                        name="phone"
                        placeholder="+91 98765 43210"
                        value={form.phone}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email Address *</label>
                    <input
                      className="form-input"
                      name="email"
                      type="email"
                      placeholder="priya@email.com"
                      value={form.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Category</label>
                    <select className="form-input" name="category" value={form.category} onChange={handleChange}>
                      <option>General Inquiry</option>
                      <option>Order Issue</option>
                      <option>Product Question</option>
                      <option>Delivery Problem</option>
                      <option>Refund Request</option>
                      <option>Bulk Orders</option>
                      <option>Sourcing & Farming</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Subject *</label>
                    <input
                      className="form-input"
                      name="subject"
                      placeholder="Brief subject of your message"
                      value={form.subject}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Message *</label>
                    <textarea
                      className="form-textarea"
                      name="message"
                      placeholder="Tell us how we can help..."
                      value={form.message}
                      onChange={handleChange}
                      required
                      rows={4}
                    />
                  </div>
                  <button
                    type="submit"
                    className="contact-submit-btn"
                    disabled={loading}
                  >
                    {loading ? "Sending..." : "Send Message →"}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
