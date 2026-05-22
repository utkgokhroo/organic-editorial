import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { orderApi, userApi } from "../services/api";
import { formatPrice } from "../utils/productUtils";
import Footer from "../components/Footer";
import "../styles/Profile.css";

const tabs = [
  { id: "overview", icon: "home", label: "Overview" },
  { id: "orders", icon: "package", label: "My Orders" },
  { id: "addresses", icon: "pin", label: "Addresses" },
  { id: "settings", icon: "settings", label: "Settings" },
];

function ProfileIcon({ name }) {
  const commonProps = {
    className: "profile-svg-icon",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": "true",
  };

  const icons = {
    home: (
      <>
        <path d="m3 11 9-8 9 8" />
        <path d="M5 10v10h14V10" />
        <path d="M9 20v-6h6v6" />
      </>
    ),
    package: (
      <>
        <path d="m21 8-9-5-9 5 9 5 9-5Z" />
        <path d="M3 8v8l9 5 9-5V8" />
        <path d="M12 13v8" />
      </>
    ),
    pin: (
      <>
        <path d="M12 22s7-5.3 7-12a7 7 0 1 0-14 0c0 6.7 7 12 7 12Z" />
        <circle cx="12" cy="10" r="2.5" />
      </>
    ),
    settings: (
      <>
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06A1.7 1.7 0 0 0 15 19.4a1.7 1.7 0 0 0-1 .6 1.7 1.7 0 0 0-.4 1.1V21a2 2 0 1 1-4 0v-.09A1.7 1.7 0 0 0 8.6 19.4a1.7 1.7 0 0 0-1.88.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-.6-1 1.7 1.7 0 0 0-1.1-.4H3a2 2 0 1 1 0-4h.09A1.7 1.7 0 0 0 4.6 8.6a1.7 1.7 0 0 0-.34-1.88l-.06-.06A2 2 0 1 1 7.03 3.83l.06.06A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-.6 1.7 1.7 0 0 0 .4-1.1V3a2 2 0 1 1 4 0v.09A1.7 1.7 0 0 0 15.4 4.6a1.7 1.7 0 0 0 1.88-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.7 1.7 0 0 0 19.4 9c.3.3.7.5 1.1.6H21a2 2 0 1 1 0 4h-.09A1.7 1.7 0 0 0 19.4 15Z" />
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

export default function Profile() {
  const { isAuthenticated, user, authLoading, logout, setUser, updateProfile } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [profile, setProfile] = useState(user);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [form, setForm] = useState({ name: "", email: "", phone: "" });
  const userRef = useRef(user);
  const navigate = useNavigate();

  useEffect(() => {
    userRef.current = user;
  }, [user]);

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    let active = true;
    setLoading(true);
    setError("");

    const syncProfile = (nextUser) => {
      if (!nextUser) return;
      setProfile(nextUser);
      setForm({
        name: nextUser.name || "",
        email: nextUser.email || "",
        phone: nextUser.phone || "",
      });
    };

    const loadProfile = async () => {
      const fallbackUser = userRef.current;

      try {
        const profileResponse = await userApi.getProfile();
        if (!active) return;
        const nextUser = profileResponse.data?.user || fallbackUser;
        syncProfile(nextUser);
        if (nextUser) setUser(nextUser);
      } catch (apiError) {
        if (!active) return;
        syncProfile(fallbackUser);
        setError(apiError.message || "Unable to refresh profile details.");
      }

      try {
        const orderResponse = await orderApi.mine({ limit: 20 });
        if (!active) return;
        setOrders(orderResponse.data?.orders || []);
      } catch (apiError) {
        if (!active) return;
        setOrders([]);
        setError((currentError) => {
          const orderMessage = apiError.message || "Unable to load orders.";
          return currentError ? `${currentError} ${orderMessage}` : orderMessage;
        });
      } finally {
        if (active) setLoading(false);
      }
    };

    loadProfile();

    return () => {
      active = false;
    };
  }, [isAuthenticated, setUser]);

  const stats = useMemo(() => {
    const totalSpent = orders.reduce((sum, order) => sum + Number(order.total || 0), 0);
    return {
      orderCount: orders.length,
      totalSpent,
      greenPoints: Math.floor(totalSpent / 100),
    };
  }, [orders]);

  const handleFormChange = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value });
    setMessage("");
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const response = await updateProfile(form);
      setProfile(response.data.user);
      setMessage("Profile saved.");
    } catch (apiError) {
      setError(apiError.message);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/", { replace: true });
  };

  const statusClass = (status) => {
    if (status === "delivered") return "status-delivered";
    if (status === "cancelled") return "status-cancelled";
    return "status-processing";
  };

  const formatDate = (value) => new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const renderOrder = (order) => (
    <div className="order-item" key={order._id || order.orderId}>
      <div className="order-header">
        <div>
          <div className="order-id">#{order.orderId}</div>
          <div className="order-date">{formatDate(order.createdAt)}</div>
        </div>
        <span className={`order-status ${statusClass(order.status)}`}>
          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
        </span>
      </div>
      <div className="order-body">
        <div>
          <div className="order-items-count">{order.items?.length || 0} item{order.items?.length === 1 ? "" : "s"}</div>
          <div className="order-total">{formatPrice(order.total)}</div>
        </div>
        <div className="order-products">
          {(order.items || []).slice(0, 3).map((item) => item.name).join(", ")}
        </div>
      </div>
    </div>
  );

  if (authLoading || loading) {
    return (
      <div className="page-wrapper profile-page">
        <div className="loading-spinner"><div className="spinner" /></div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="page-wrapper profile-page">
      <div className="container">
        {error && <div className="alert-error">{error}</div>}
        {message && <div className="alert-success">{message}</div>}

        <div className="profile-layout">
          <aside className="profile-sidebar">
            <div className="profile-avatar-section">
              <div className="avatar-circle">{(profile?.name || "U").slice(0, 1).toUpperCase()}</div>
              <div className="profile-name">{profile?.name}</div>
              <div className="profile-email">{profile?.email}</div>
              <div className="profile-member">Member since {profile?.createdAt ? formatDate(profile.createdAt) : "today"}</div>
            </div>
            <nav className="profile-nav">
              {tabs.map((tab) => (
                <div
                  key={tab.id}
                  className={`profile-nav-item${activeTab === tab.id ? " active" : ""}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <span className="profile-nav-icon"><ProfileIcon name={tab.icon} /></span>
                  {tab.label}
                </div>
              ))}
              <button className="profile-nav-item profile-signout" onClick={handleLogout}>
                <span className="profile-nav-icon"><ProfileIcon name="logout" /></span>
                Sign Out
              </button>
            </nav>
          </aside>

          <div className="profile-content">
            {activeTab === "overview" && (
              <>
                <div className="profile-content-header">
                  <h2>Welcome back, {profile?.name?.split(" ")[0] || "there"}!</h2>
                  <p>Here is a live snapshot of your organic journey.</p>
                </div>
                <div className="profile-content-body">
                  <div className="profile-stats">
                    <div className="stat-card"><div className="stat-value">{stats.orderCount}</div><div className="stat-label">Total Orders</div></div>
                    <div className="stat-card"><div className="stat-value">{formatPrice(stats.totalSpent)}</div><div className="stat-label">Total Spent</div></div>
                    <div className="stat-card"><div className="stat-value">{stats.greenPoints}</div><div className="stat-label">Green Points</div></div>
                  </div>

                  <h3 style={{ fontFamily: "var(--font-display)", fontSize: 17, fontWeight: 700, marginBottom: 16 }}>
                    Recent Orders
                  </h3>
                  {orders.length === 0 ? (
                    <div className="empty-state compact">
                      <h3>No orders yet</h3>
                      <p>Your placed orders will appear here.</p>
                    </div>
                  ) : (
                    orders.slice(0, 2).map(renderOrder)
                  )}
                </div>
              </>
            )}

            {activeTab === "orders" && (
              <>
                <div className="profile-content-header">
                  <h2>My Orders</h2>
                  <p>Your complete order history from the backend.</p>
                </div>
                <div className="profile-content-body">
                  {orders.length === 0 ? (
                    <div className="empty-state compact">
                      <h3>No orders yet</h3>
                      <p>Place an order and it will show up here.</p>
                    </div>
                  ) : (
                    orders.map(renderOrder)
                  )}
                </div>
              </>
            )}

            {activeTab === "addresses" && (
              <>
                <div className="profile-content-header">
                  <h2>Saved Addresses</h2>
                  <p>Delivery locations saved on your account.</p>
                </div>
                <div className="profile-content-body">
                  {profile?.address?.length ? (
                    <div className="address-grid">
                      {profile.address.map((address) => (
                        <div className={`address-item${address.isDefault ? " default-address" : ""}`} key={address._id}>
                          {address.isDefault && <div className="default-tag">Default</div>}
                          <div className="address-type">{address.type}</div>
                          <div className="address-name">{address.fullName || profile.name}</div>
                          <div className="address-text">
                            {address.line1}<br />
                            {address.line2 ? <>{address.line2}<br /></> : null}
                            {address.city}, {address.state} - {address.pincode}<br />
                            {address.phone || profile.phone}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="empty-state compact">
                      <h3>No saved addresses</h3>
                      <p>Addresses added at checkout or through the API will appear here.</p>
                    </div>
                  )}
                </div>
              </>
            )}

            {activeTab === "settings" && (
              <>
                <div className="profile-content-header">
                  <h2>Profile Settings</h2>
                  <p>Update your account details.</p>
                </div>
                <div className="profile-content-body">
                  <div className="form-grid">
                    <div className="form-group">
                      <label className="form-label">Name</label>
                      <input className="form-input" name="name" value={form.name} onChange={handleFormChange} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Email Address</label>
                      <input className="form-input" name="email" type="email" value={form.email} onChange={handleFormChange} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Phone Number</label>
                      <input className="form-input" name="phone" value={form.phone} onChange={handleFormChange} maxLength="10" />
                    </div>
                  </div>
                  <div className="form-actions">
                    <button className="btn-primary" onClick={handleSave} disabled={saving}>{saving ? "Saving..." : "Save Changes"}</button>
                    <button className="btn-outline" onClick={() => setForm({ name: profile.name || "", email: profile.email || "", phone: profile.phone || "" })}>Cancel</button>
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
