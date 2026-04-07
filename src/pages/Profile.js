import React, { useState } from "react";
import Footer from "../components/Footer";
import "../styles/Profile.css";

const tabs = [
  { id: "overview", icon: "🏠", label: "Overview" },
  { id: "orders", icon: "📦", label: "My Orders" },
  { id: "addresses", icon: "📍", label: "Addresses" },
  { id: "settings", icon: "⚙️", label: "Settings" },
];

const sampleOrders = [
  { id: "OE78432891", date: "28 Mar 2024", total: 432, items: 4, status: "delivered" },
  { id: "OE78201345", date: "22 Mar 2024", total: 218, items: 2, status: "delivered" },
  { id: "OE77965210", date: "15 Mar 2024", total: 567, items: 6, status: "cancelled" },
  { id: "OE78653001", date: "2 Apr 2024", total: 189, items: 1, status: "processing" },
];

export default function Profile() {
  const [activeTab, setActiveTab] = useState("overview");
  const [form, setForm] = useState({
    firstName: "Priya",
    lastName: "Sharma",
    email: "priya.sharma@gmail.com",
    phone: "+91 98765 43210",
    dob: "1992-07-15",
    gender: "Female",
  });
  const [saved, setSaved] = useState(false);

  const handleFormChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setSaved(false);
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const statusClass = (s) => {
    if (s === "delivered") return "status-delivered";
    if (s === "processing") return "status-processing";
    return "status-cancelled";
  };

  const statusEmoji = (s) => {
    if (s === "delivered") return "✅";
    if (s === "processing") return "⏳";
    return "❌";
  };

  return (
    <div className="page-wrapper profile-page">
      <div className="container">
        <div className="profile-layout">
          {/* Sidebar */}
          <aside className="profile-sidebar">
            <div className="profile-avatar-section">
              <div className="avatar-circle">👤</div>
              <div className="profile-name">{form.firstName} {form.lastName}</div>
              <div className="profile-email">{form.email}</div>
              <div className="profile-member">🌿 Member since Jan 2023</div>
            </div>
            <nav className="profile-nav">
              {tabs.map((t) => (
                <div
                  key={t.id}
                  className={`profile-nav-item${activeTab === t.id ? " active" : ""}`}
                  onClick={() => setActiveTab(t.id)}
                >
                  <span className="profile-nav-icon">{t.icon}</span>
                  {t.label}
                </div>
              ))}
              <div className="profile-nav-item" style={{ color: "var(--red)", marginTop: 8 }}>
                <span className="profile-nav-icon">🚪</span>
                Sign Out
              </div>
            </nav>
          </aside>

          {/* Main content */}
          <div className="profile-content">
            {activeTab === "overview" && (
              <>
                <div className="profile-content-header">
                  <h2>Welcome back, {form.firstName}! 🌿</h2>
                  <p>Here's a snapshot of your organic journey</p>
                </div>
                <div className="profile-content-body">
                  <div className="profile-stats">
                    <div className="stat-card">
                      <div className="stat-value">14</div>
                      <div className="stat-label">Total Orders</div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-value">₹4.2k</div>
                      <div className="stat-label">Total Spent</div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-value">82</div>
                      <div className="stat-label">Green Points</div>
                    </div>
                  </div>

                  <h3 style={{ fontFamily: "var(--font-display)", fontSize: 17, fontWeight: 700, marginBottom: 16 }}>
                    Recent Orders
                  </h3>
                  {sampleOrders.slice(0, 2).map((o) => (
                    <div className="order-item" key={o.id}>
                      <div className="order-header">
                        <div>
                          <div className="order-id">#{o.id}</div>
                          <div className="order-date">{o.date}</div>
                        </div>
                        <span className={`order-status ${statusClass(o.status)}`}>
                          {statusEmoji(o.status)} {o.status.charAt(0).toUpperCase() + o.status.slice(1)}
                        </span>
                      </div>
                      <div className="order-body">
                        <div>
                          <div className="order-items-count">{o.items} items</div>
                          <div className="order-total">₹{o.total}</div>
                        </div>
                        <button className="btn-outline" style={{ padding: "8px 16px", fontSize: 12 }}>
                          View Details
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {activeTab === "orders" && (
              <>
                <div className="profile-content-header">
                  <h2>My Orders</h2>
                  <p>Your complete order history</p>
                </div>
                <div className="profile-content-body">
                  {sampleOrders.map((o) => (
                    <div className="order-item" key={o.id}>
                      <div className="order-header">
                        <div>
                          <div className="order-id">#{o.id}</div>
                          <div className="order-date">{o.date}</div>
                        </div>
                        <span className={`order-status ${statusClass(o.status)}`}>
                          {statusEmoji(o.status)} {o.status.charAt(0).toUpperCase() + o.status.slice(1)}
                        </span>
                      </div>
                      <div className="order-body">
                        <div>
                          <div className="order-items-count">{o.items} items</div>
                          <div className="order-total">₹{o.total}</div>
                        </div>
                        <div style={{ display: "flex", gap: 8 }}>
                          <button className="btn-outline" style={{ padding: "8px 14px", fontSize: 12 }}>View</button>
                          {o.status === "delivered" && (
                            <button className="btn-primary" style={{ padding: "8px 14px", fontSize: 12 }}>Reorder</button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {activeTab === "addresses" && (
              <>
                <div className="profile-content-header">
                  <h2>Saved Addresses</h2>
                  <p>Manage your delivery locations</p>
                </div>
                <div className="profile-content-body">
                  <div className="address-grid">
                    <div className="address-item default-address">
                      <div className="default-tag">Default</div>
                      <div className="address-type">🏠 Home</div>
                      <div className="address-name">Priya Sharma</div>
                      <div className="address-text">
                        Flat 4B, Green Valley Apartments,<br />
                        Koramangala 5th Block,<br />
                        Bengaluru – 560095, Karnataka<br />
                        📞 +91 98765 43210
                      </div>
                    </div>
                    <div className="address-item">
                      <div className="address-type">💼 Office</div>
                      <div className="address-name">Priya Sharma</div>
                      <div className="address-text">
                        3rd Floor, Prestige Tech Park,<br />
                        Outer Ring Road, Marathahalli,<br />
                        Bengaluru – 560103, Karnataka<br />
                        📞 +91 98765 43210
                      </div>
                    </div>
                  </div>
                  <button className="btn-outline" style={{ marginTop: 16 }}>+ Add New Address</button>
                </div>
              </>
            )}

            {activeTab === "settings" && (
              <>
                <div className="profile-content-header">
                  <h2>Profile Settings</h2>
                  <p>Update your personal information</p>
                </div>
                <div className="profile-content-body">
                  <div className="form-grid">
                    <div className="form-group">
                      <label className="form-label">First Name</label>
                      <input className="form-input" name="firstName" value={form.firstName} onChange={handleFormChange} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Last Name</label>
                      <input className="form-input" name="lastName" value={form.lastName} onChange={handleFormChange} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Email Address</label>
                      <input className="form-input" name="email" type="email" value={form.email} onChange={handleFormChange} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Phone Number</label>
                      <input className="form-input" name="phone" value={form.phone} onChange={handleFormChange} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Date of Birth</label>
                      <input className="form-input" name="dob" type="date" value={form.dob} onChange={handleFormChange} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Gender</label>
                      <select className="form-input" name="gender" value={form.gender} onChange={handleFormChange}>
                        <option>Male</option>
                        <option>Female</option>
                        <option>Other</option>
                        <option>Prefer not to say</option>
                      </select>
                    </div>
                  </div>
                  <div className="form-actions">
                    <button className="btn-primary" onClick={handleSave}>
                      {saved ? "✅ Saved!" : "Save Changes"}
                    </button>
                    <button className="btn-outline">Cancel</button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
