import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/Auth.css";

function getPasswordStrength(password) {
  if (!password) return null;
  let score = 0;
  if (password.length >= 8) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;
  if (score <= 1) return "weak";
  if (score <= 2) return "fair";
  return "strong";
}

function Icon({ name }) {
  const commonProps = {
    className: "auth-svg-icon",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": "true",
  };

  const paths = {
    leaf: (
      <>
        <path d="M11 20A7 7 0 0 1 4 13c0-5 4-9 13-9 1 9-4 13-9 13" />
        <path d="M9 15c2-3 5-5 8-6" />
      </>
    ),
    zap: <path d="M13 2 4 14h7l-1 8 10-12h-7l0-8Z" />,
    shield: (
      <>
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
        <path d="m9 12 2 2 4-4" />
      </>
    ),
    recycle: (
      <>
        <path d="m7 19-4-7 4-7" />
        <path d="M3 12h13" />
        <path d="m17 5 4 7-4 7" />
      </>
    ),
    card: (
      <>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="M3 10h18" />
      </>
    ),
    mail: (
      <>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="m3 7 9 6 9-6" />
      </>
    ),
    lock: (
      <>
        <rect x="4" y="11" width="16" height="9" rx="2" />
        <path d="M8 11V7a4 4 0 0 1 8 0v4" />
      </>
    ),
    user: (
      <>
        <path d="M20 21a8 8 0 0 0-16 0" />
        <circle cx="12" cy="7" r="4" />
      </>
    ),
    phone: (
      <>
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.12 4.2 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.35 1.9.65 2.8a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.28-1.22a2 2 0 0 1 2.11-.45c.9.3 1.84.52 2.8.65A2 2 0 0 1 22 16.92Z" />
      </>
    ),
    eye: (
      <>
        <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
        <circle cx="12" cy="12" r="3" />
      </>
    ),
    eyeOff: (
      <>
        <path d="m3 3 18 18" />
        <path d="M10.58 10.58A2 2 0 0 0 13.42 13.42" />
        <path d="M9.88 4.24A10.5 10.5 0 0 1 12 4c6.5 0 10 8 10 8a18.6 18.6 0 0 1-2.12 3.19" />
        <path d="M6.61 6.61A18.3 18.3 0 0 0 2 12s3.5 8 10 8a10.7 10.7 0 0 0 5.39-1.61" />
      </>
    ),
  };

  return <svg {...commonProps}>{paths[name]}</svg>;
}

export default function Auth() {
  const [mode, setMode] = useState("login");
  const [showPw, setShowPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const { login, signup } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from || "/";

  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [loginErrors, setLoginErrors] = useState({});
  const [signupForm, setSignupForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    terms: false,
  });
  const [signupErrors, setSignupErrors] = useState({});

  const pwStrength = getPasswordStrength(signupForm.password);

  function validateLogin() {
    const errors = {};
    if (!loginForm.email) errors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(loginForm.email)) errors.email = "Enter a valid email";
    if (!loginForm.password) errors.password = "Password is required";
    return errors;
  }

  function validateSignup() {
    const errors = {};
    if (!signupForm.firstName.trim()) errors.firstName = "Required";
    if (!signupForm.lastName.trim()) errors.lastName = "Required";
    if (!signupForm.email) errors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(signupForm.email)) errors.email = "Enter a valid email";
    if (!signupForm.phone) errors.phone = "Phone is required";
    else if (!/^[6-9]\d{9}$/.test(signupForm.phone)) errors.phone = "Enter a valid 10-digit Indian mobile number";
    if (!signupForm.password) errors.password = "Password is required";
    else if (signupForm.password.length < 8) errors.password = "Minimum 8 characters";
    else if (!/[A-Z]/.test(signupForm.password)) errors.password = "Add at least one uppercase letter";
    else if (!/[0-9]/.test(signupForm.password)) errors.password = "Add at least one number";
    if (!signupForm.confirmPassword) errors.confirmPassword = "Please confirm your password";
    else if (signupForm.password !== signupForm.confirmPassword) errors.confirmPassword = "Passwords do not match";
    if (!signupForm.terms) errors.terms = "Please accept the terms to continue";
    return errors;
  }

  const handleLoginSubmit = async (event) => {
    event.preventDefault();
    const errors = validateLogin();
    if (Object.keys(errors).length) {
      setLoginErrors(errors);
      return;
    }

    setLoginErrors({});
    setApiError("");
    setLoading(true);
    try {
      await login(loginForm);
      setSuccess("Welcome back. Redirecting you now...");
      navigate(redirectTo, { replace: true });
    } catch (error) {
      setApiError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignupSubmit = async (event) => {
    event.preventDefault();
    const errors = validateSignup();
    if (Object.keys(errors).length) {
      setSignupErrors(errors);
      return;
    }

    setSignupErrors({});
    setApiError("");
    setLoading(true);
    try {
      await signup({
        name: `${signupForm.firstName.trim()} ${signupForm.lastName.trim()}`.trim(),
        email: signupForm.email,
        phone: signupForm.phone,
        password: signupForm.password,
      });
      setSuccess("Account created. Redirecting you now...");
      navigate(redirectTo, { replace: true });
    } catch (error) {
      setApiError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (nextMode) => {
    setMode(nextMode);
    setSuccess("");
    setApiError("");
    setLoginErrors({});
    setSignupErrors({});
    setLoading(false);
  };

  const pwBars = [1, 2, 3].map((n) => {
    if (!pwStrength) return "";
    if (pwStrength === "weak") return n === 1 ? "weak" : "";
    if (pwStrength === "fair") return n <= 2 ? "fair" : "";
    return "strong";
  });

  return (
    <div className="auth-page">
      <div className="auth-left">
        <Link to="/" className="auth-logo">
          <span className="auth-logo-main">The Organic Editorial</span>
          <span className="auth-logo-sub">Premium Groceries</span>
        </Link>

        <div className="auth-left-body">
          <div className="auth-left-tag">100% Organic - Farm to Doorstep</div>
          <h2 className="auth-left-title">
            Fresh from the<br />farm, <em>straight to</em><br />your kitchen.
          </h2>
          <p className="auth-left-desc">
            Sign in to keep your cart, wishlist, orders, and saved addresses synced securely with your account.
          </p>
          <div className="auth-features">
            <div className="auth-feature"><div className="auth-feature-icon"><Icon name="zap" /></div><span>Express delivery in 30 minutes</span></div>
            <div className="auth-feature"><div className="auth-feature-icon"><Icon name="shield" /></div><span>JWT-secured account access</span></div>
            <div className="auth-feature"><div className="auth-feature-icon"><Icon name="recycle" /></div><span>Eco-friendly packaging</span></div>
            <div className="auth-feature"><div className="auth-feature-icon"><Icon name="card" /></div><span>UPI, cards, net banking, and COD</span></div>
          </div>
        </div>

        <div className="auth-left-footer">2026 The Organic Editorial - FSSAI Licensed</div>
      </div>

      <div className="auth-right">
        <div className="auth-form-wrap">
          <div className="auth-tabs">
            <button className={`auth-tab${mode === "login" ? " active" : ""}`} onClick={() => switchMode("login")}>
              Sign In
            </button>
            <button className={`auth-tab${mode === "signup" ? " active" : ""}`} onClick={() => switchMode("signup")}>
              Create Account
            </button>
          </div>

          {apiError && <div className="auth-alert error">{apiError}</div>}
          {success && <div className="auth-alert success">{success}</div>}

          {mode === "login" && (
            <>
              <h1 className="auth-heading">Welcome back</h1>
              <p className="auth-subheading">Sign in to continue shopping</p>

              <form className="auth-form" onSubmit={handleLoginSubmit}>
                <div className="auth-field">
                  <label className="auth-label">Email Address</label>
                  <div className="auth-input-wrap">
                    <span className="auth-input-icon"><Icon name="mail" /></span>
                    <input
                      type="email"
                      className={`auth-input${loginErrors.email ? " error" : ""}`}
                      placeholder="your@email.com"
                      value={loginForm.email}
                      onChange={(event) => setLoginForm({ ...loginForm, email: event.target.value })}
                    />
                  </div>
                  {loginErrors.email && <span className="auth-error">{loginErrors.email}</span>}
                </div>

                <div className="auth-field">
                  <label className="auth-label">Password</label>
                  <div className="auth-input-wrap">
                    <span className="auth-input-icon"><Icon name="lock" /></span>
                    <input
                      type={showPw ? "text" : "password"}
                      className={`auth-input${loginErrors.password ? " error" : ""}`}
                      placeholder="Your password"
                      value={loginForm.password}
                      onChange={(event) => setLoginForm({ ...loginForm, password: event.target.value })}
                    />
                    <button
                      type="button"
                      className="auth-pw-toggle"
                      onClick={() => setShowPw(!showPw)}
                      aria-label={showPw ? "Hide password" : "Show password"}
                    >
                      <Icon name={showPw ? "eyeOff" : "eye"} />
                    </button>
                  </div>
                  {loginErrors.password && <span className="auth-error">{loginErrors.password}</span>}
                </div>

                <button type="submit" className="auth-submit" disabled={loading}>
                  {loading ? (
                    <>
                      <div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />
                      Signing in...
                    </>
                  ) : "Sign In"}
                </button>
              </form>

              <div className="auth-switch">
                Don't have an account? <button onClick={() => switchMode("signup")}>Create one free</button>
              </div>
            </>
          )}

          {mode === "signup" && (
            <>
              <h1 className="auth-heading">Create account</h1>
              <p className="auth-subheading">Join India's organic grocery store</p>

              <form className="auth-form" onSubmit={handleSignupSubmit}>
                <div className="auth-name-row">
                  <div className="auth-field">
                        <label className="auth-label">First Name</label>
                        <div className="auth-input-wrap">
                      <span className="auth-input-icon"><Icon name="user" /></span>
                      <input
                        type="text"
                        className={`auth-input${signupErrors.firstName ? " error" : ""}`}
                        placeholder="First name"
                        value={signupForm.firstName}
                        onChange={(event) => setSignupForm({ ...signupForm, firstName: event.target.value })}
                      />
                    </div>
                    {signupErrors.firstName && <span className="auth-error">{signupErrors.firstName}</span>}
                  </div>
                  <div className="auth-field">
                        <label className="auth-label">Last Name</label>
                        <div className="auth-input-wrap">
                      <span className="auth-input-icon"><Icon name="user" /></span>
                      <input
                        type="text"
                        className={`auth-input${signupErrors.lastName ? " error" : ""}`}
                        placeholder="Last name"
                        value={signupForm.lastName}
                        onChange={(event) => setSignupForm({ ...signupForm, lastName: event.target.value })}
                      />
                    </div>
                    {signupErrors.lastName && <span className="auth-error">{signupErrors.lastName}</span>}
                  </div>
                </div>

                <div className="auth-field">
                  <label className="auth-label">Email Address</label>
                  <div className="auth-input-wrap">
                    <span className="auth-input-icon"><Icon name="mail" /></span>
                    <input
                      type="email"
                      className={`auth-input${signupErrors.email ? " error" : ""}`}
                      placeholder="your@email.com"
                      value={signupForm.email}
                      onChange={(event) => setSignupForm({ ...signupForm, email: event.target.value })}
                    />
                  </div>
                  {signupErrors.email && <span className="auth-error">{signupErrors.email}</span>}
                </div>

                <div className="auth-field">
                  <label className="auth-label">Mobile Number</label>
                  <div className="auth-input-wrap">
                    <span className="auth-input-icon"><Icon name="phone" /></span>
                    <input
                      type="tel"
                      className={`auth-input${signupErrors.phone ? " error" : ""}`}
                      placeholder="9876543210"
                      value={signupForm.phone}
                      onChange={(event) =>
                        setSignupForm({ ...signupForm, phone: event.target.value.replace(/\D/g, "").slice(0, 10) })
                      }
                    />
                  </div>
                  {signupErrors.phone && <span className="auth-error">{signupErrors.phone}</span>}
                </div>

                <div className="auth-field">
                  <label className="auth-label">Password</label>
                  <div className="auth-input-wrap">
                    <span className="auth-input-icon"><Icon name="lock" /></span>
                    <input
                      type={showPw ? "text" : "password"}
                      className={`auth-input${signupErrors.password ? " error" : ""}`}
                      placeholder="Min. 8 characters"
                      value={signupForm.password}
                      onChange={(event) => setSignupForm({ ...signupForm, password: event.target.value })}
                    />
                    <button
                      type="button"
                      className="auth-pw-toggle"
                      onClick={() => setShowPw(!showPw)}
                      aria-label={showPw ? "Hide password" : "Show password"}
                    >
                      <Icon name={showPw ? "eyeOff" : "eye"} />
                    </button>
                  </div>
                  {signupForm.password && (
                    <div className="pw-strength">
                      <div className="pw-strength-bars">
                        {pwBars.map((cls, index) => <div key={index} className={`pw-bar${cls ? ` ${cls}` : ""}`} />)}
                      </div>
                      <span className={`pw-strength-label ${pwStrength}`}>
                        {pwStrength === "weak" ? "Weak password" : pwStrength === "fair" ? "Fair password" : "Strong password"}
                      </span>
                    </div>
                  )}
                  {signupErrors.password && <span className="auth-error">{signupErrors.password}</span>}
                </div>

                <div className="auth-field">
                  <label className="auth-label">Confirm Password</label>
                  <div className="auth-input-wrap">
                    <span className="auth-input-icon"><Icon name="lock" /></span>
                    <input
                      type={showConfirmPw ? "text" : "password"}
                      className={`auth-input${signupErrors.confirmPassword ? " error" : ""}`}
                      placeholder="Repeat your password"
                      value={signupForm.confirmPassword}
                      onChange={(event) => setSignupForm({ ...signupForm, confirmPassword: event.target.value })}
                    />
                    <button
                      type="button"
                      className="auth-pw-toggle"
                      onClick={() => setShowConfirmPw(!showConfirmPw)}
                      aria-label={showConfirmPw ? "Hide password" : "Show password"}
                    >
                      <Icon name={showConfirmPw ? "eyeOff" : "eye"} />
                    </button>
                  </div>
                  {signupErrors.confirmPassword && <span className="auth-error">{signupErrors.confirmPassword}</span>}
                </div>

                <label className="auth-terms">
                  <input
                    type="checkbox"
                    checked={signupForm.terms}
                    onChange={(event) => setSignupForm({ ...signupForm, terms: event.target.checked })}
                  />
                  <span>I agree to the Terms of Service and Privacy Policy</span>
                </label>
                {signupErrors.terms && <span className="auth-error">{signupErrors.terms}</span>}

                <button type="submit" className="auth-submit" disabled={loading}>
                  {loading ? (
                    <>
                      <div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />
                      Creating account...
                    </>
                  ) : "Create Account"}
                </button>
              </form>

              <div className="auth-switch">
                Already have an account? <button onClick={() => switchMode("login")}>Sign in</button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
