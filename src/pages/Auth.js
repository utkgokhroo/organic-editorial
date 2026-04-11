import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/Auth.css";

function getPasswordStrength(pw) {
  if (!pw) return null;
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  if (score <= 1) return "weak";
  if (score <= 2) return "fair";
  return "strong";
}

export default function Auth() {
  const [mode, setMode] = useState("login");
  const [showPw, setShowPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [loginErrors, setLoginErrors] = useState({});

  const [signupForm, setSignupForm] = useState({
    firstName: "", lastName: "", email: "", phone: "", password: "", confirmPassword: "", terms: false,
  });
  const [signupErrors, setSignupErrors] = useState({});

  const pwStrength = getPasswordStrength(signupForm.password);

  function validateLogin() {
    const errs = {};
    if (!loginForm.email) errs.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(loginForm.email)) errs.email = "Enter a valid email";
    if (!loginForm.password) errs.password = "Password is required";
    return errs;
  }

  function validateSignup() {
    const errs = {};
    if (!signupForm.firstName.trim()) errs.firstName = "Required";
    if (!signupForm.lastName.trim()) errs.lastName = "Required";
    if (!signupForm.email) errs.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(signupForm.email)) errs.email = "Enter a valid email";
    if (!signupForm.phone) errs.phone = "Phone is required";
    else if (!/^[6-9]\d{9}$/.test(signupForm.phone)) errs.phone = "Enter a valid 10-digit Indian mobile number";
    if (!signupForm.password) errs.password = "Password is required";
    else if (signupForm.password.length < 8) errs.password = "Minimum 8 characters";
    if (!signupForm.confirmPassword) errs.confirmPassword = "Please confirm your password";
    else if (signupForm.password !== signupForm.confirmPassword) errs.confirmPassword = "Passwords do not match";
    if (!signupForm.terms) errs.terms = "Please accept the terms to continue";
    return errs;
  }

  // ── Handlers ──
  const handleLoginSubmit = (e) => {
    e.preventDefault();
    const errs = validateLogin();
    if (Object.keys(errs).length) { setLoginErrors(errs); return; }
    setLoginErrors({});
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      setTimeout(() => navigate("/"), 2000);
    }, 1500);
  };

  const handleSignupSubmit = (e) => {
    e.preventDefault();
    const errs = validateSignup();
    if (Object.keys(errs).length) { setSignupErrors(errs); return; }
    setSignupErrors({});
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      setTimeout(() => navigate("/"), 2500);
    }, 1800);
  };

  const switchMode = (m) => {
    setMode(m);
    setSuccess(false);
    setLoginErrors({});
    setSignupErrors({});
    setLoading(false);
  };

  const pwBars = [1, 2, 3].map((n) => {
    if (!pwStrength) return "";
    if (pwStrength === "weak")   return n === 1 ? "weak" : "";
    if (pwStrength === "fair")   return n <= 2 ? "fair" : "";
    return "strong";
  });

  return (
    <div className="auth-page">
      {/* ── Left panel ── */}
      <div className="auth-left">
        <Link to="/" className="auth-logo">
          <span className="auth-logo-main">The Organic Editorial</span>
          <span className="auth-logo-sub">Premium Groceries</span>
        </Link>

        <div className="auth-left-body">
          <div className="auth-left-tag">
            🌿 100% Organic · Farm to Doorstep
          </div>
          <h2 className="auth-left-title">
            Fresh from the<br />farm, <em>straight to</em><br />your kitchen.
          </h2>
          <p className="auth-left-desc">
            Join thousands of conscious families across India who trust us for certified organic produce, artisan goods and zero-waste delivery.
          </p>
          <div className="auth-features">
            <div className="auth-feature">
              <div className="auth-feature-icon">⚡</div>
              <span>Express delivery in 30 minutes</span>
            </div>
            <div className="auth-feature">
              <div className="auth-feature-icon">🌱</div>
              <span>NPOP certified organic products</span>
            </div>
            <div className="auth-feature">
              <div className="auth-feature-icon">♻️</div>
              <span>100% eco-friendly packaging</span>
            </div>
            <div className="auth-feature">
              <div className="auth-feature-icon">🔒</div>
              <span>Secure UPI & card payments</span>
            </div>
          </div>
        </div>

        <div className="auth-left-footer">
          © 2026 The Organic Editorial · FSSAI Licensed
        </div>
      </div>

      {/* ── Right panel ── */}
      <div className="auth-right">
        <div className="auth-form-wrap">

          {success ? (
            <div className="auth-success">
              <div className="auth-success-icon">✅</div>
              <h2>{mode === "login" ? "Welcome back!" : "Account Created!"}</h2>
              <p>
                {mode === "login"
                  ? "You're logged in. Taking you to the store..."
                  : `Welcome to The Organic Editorial, ${signupForm.firstName || "there"}! Redirecting you home...`}
              </p>
              <div style={{ marginTop: 16 }}>
                <div className="spinner" style={{ margin: "0 auto" }} />
              </div>
            </div>
          ) : (
            <>
              {/* Tabs */}
              <div className="auth-tabs">
                <button
                  className={`auth-tab${mode === "login" ? " active" : ""}`}
                  onClick={() => switchMode("login")}
                >
                  Sign In
                </button>
                <button
                  className={`auth-tab${mode === "signup" ? " active" : ""}`}
                  onClick={() => switchMode("signup")}
                >
                  Create Account
                </button>
              </div>

              {/* ── Login Form ── */}
              {mode === "login" && (
                <>
                  <h1 className="auth-heading">Welcome back</h1>
                  <p className="auth-subheading">Sign in to your account to continue shopping</p>

                  <form className="auth-form" onSubmit={handleLoginSubmit}>
                    <div className="auth-field">
                      <label className="auth-label">Email Address</label>
                      <div className="auth-input-wrap">
                        <span className="auth-input-icon">✉️</span>
                        <input
                          type="email"
                          className={`auth-input${loginErrors.email ? " error" : ""}`}
                          placeholder="your@email.com"
                          value={loginForm.email}
                          onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                        />
                      </div>
                      {loginErrors.email && <span className="auth-error">⚠ {loginErrors.email}</span>}
                    </div>

                    <div className="auth-field">
                      <label className="auth-label">Password</label>
                      <div className="auth-input-wrap">
                        <span className="auth-input-icon">🔒</span>
                        <input
                          type={showPw ? "text" : "password"}
                          className={`auth-input${loginErrors.password ? " error" : ""}`}
                          placeholder="Your password"
                          value={loginForm.password}
                          onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                        />
                        <button
                          type="button"
                          className="auth-pw-toggle"
                          onClick={() => setShowPw(!showPw)}
                        >
                          {showPw ? "🙈" : "👁️"}
                        </button>
                      </div>
                      {loginErrors.password && <span className="auth-error">⚠ {loginErrors.password}</span>}
                    </div>

                    <a href="#!" className="auth-forgot">Forgot your password?</a>

                    <button type="submit" className="auth-submit" disabled={loading}>
                      {loading ? (
                        <>
                          <div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />
                          Signing in...
                        </>
                      ) : "Sign In →"}
                    </button>

                    <div className="auth-divider">or continue with</div>

                    <div className="auth-social-row">
                      <button type="button" className="auth-social-btn">
                        <span className="auth-social-icon">🇬</span> Google
                      </button>
                      <button type="button" className="auth-social-btn">
                        <span className="auth-social-icon">📱</span> Phone OTP
                      </button>
                    </div>
                  </form>

                  <div className="auth-switch">
                    Don't have an account?{" "}
                    <button onClick={() => switchMode("signup")}>Create one free</button>
                  </div>
                </>
              )}

              {/* ── Signup Form ── */}
              {mode === "signup" && (
                <>
                  <h1 className="auth-heading">Create account</h1>
                  <p className="auth-subheading">Join India's finest organic grocery store</p>

                  <form className="auth-form" onSubmit={handleSignupSubmit}>
                    <div className="auth-name-row">
                      <div className="auth-field">
                        <label className="auth-label">First Name</label>
                        <div className="auth-input-wrap">
                          <span className="auth-input-icon">👤</span>
                          <input
                            type="text"
                            className={`auth-input${signupErrors.firstName ? " error" : ""}`}
                            placeholder="Utkarsh"
                            value={signupForm.firstName}
                            onChange={(e) => setSignupForm({ ...signupForm, firstName: e.target.value })}
                          />
                        </div>
                        {signupErrors.firstName && <span className="auth-error">⚠ {signupErrors.firstName}</span>}
                      </div>
                      <div className="auth-field">
                        <label className="auth-label">Last Name</label>
                        <div className="auth-input-wrap">
                          <span className="auth-input-icon">👤</span>
                          <input
                            type="text"
                            className={`auth-input${signupErrors.lastName ? " error" : ""}`}
                            placeholder="Gokhroo"
                            value={signupForm.lastName}
                            onChange={(e) => setSignupForm({ ...signupForm, lastName: e.target.value })}
                          />
                        </div>
                        {signupErrors.lastName && <span className="auth-error">⚠ {signupErrors.lastName}</span>}
                      </div>
                    </div>

                    <div className="auth-field">
                      <label className="auth-label">Email Address</label>
                      <div className="auth-input-wrap">
                        <span className="auth-input-icon">✉️</span>
                        <input
                          type="email"
                          className={`auth-input${signupErrors.email ? " error" : ""}`}
                          placeholder="your@email.com"
                          value={signupForm.email}
                          onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })}
                        />
                      </div>
                      {signupErrors.email && <span className="auth-error">⚠ {signupErrors.email}</span>}
                    </div>

                    <div className="auth-field">
                      <label className="auth-label">Mobile Number</label>
                      <div className="auth-input-wrap">
                        <span className="auth-input-icon">📱</span>
                        <input
                          type="tel"
                          className={`auth-input${signupErrors.phone ? " error" : ""}`}
                          placeholder="98765 43210"
                          value={signupForm.phone}
                          onChange={(e) => setSignupForm({ ...signupForm, phone: e.target.value.replace(/\D/g, "").slice(0, 10) })}
                        />
                      </div>
                      {signupErrors.phone && <span className="auth-error">⚠ {signupErrors.phone}</span>}
                    </div>

                    <div className="auth-field">
                      <label className="auth-label">Password</label>
                      <div className="auth-input-wrap">
                        <span className="auth-input-icon">🔒</span>
                        <input
                          type={showPw ? "text" : "password"}
                          className={`auth-input${signupErrors.password ? " error" : ""}`}
                          placeholder="Min. 8 characters"
                          value={signupForm.password}
                          onChange={(e) => setSignupForm({ ...signupForm, password: e.target.value })}
                        />
                        <button
                          type="button"
                          className="auth-pw-toggle"
                          onClick={() => setShowPw(!showPw)}
                        >
                          {showPw ? "🙈" : "👁️"}
                        </button>
                      </div>
                      {signupForm.password && (
                        <div className="pw-strength">
                          <div className="pw-strength-bars">
                            {pwBars.map((cls, i) => (
                              <div key={i} className={`pw-bar${cls ? " " + cls : ""}`} />
                            ))}
                          </div>
                          <span className={`pw-strength-label ${pwStrength}`}>
                            {pwStrength === "weak" ? "Weak password" : pwStrength === "fair" ? "Fair password" : "Strong password"}
                          </span>
                        </div>
                      )}
                      {signupErrors.password && <span className="auth-error">⚠ {signupErrors.password}</span>}
                    </div>

                    <div className="auth-field">
                      <label className="auth-label">Confirm Password</label>
                      <div className="auth-input-wrap">
                        <span className="auth-input-icon">🔒</span>
                        <input
                          type={showConfirmPw ? "text" : "password"}
                          className={`auth-input${signupErrors.confirmPassword ? " error" : ""}`}
                          placeholder="Repeat your password"
                          value={signupForm.confirmPassword}
                          onChange={(e) => setSignupForm({ ...signupForm, confirmPassword: e.target.value })}
                        />
                        <button
                          type="button"
                          className="auth-pw-toggle"
                          onClick={() => setShowConfirmPw(!showConfirmPw)}
                        >
                          {showConfirmPw ? "🙈" : "👁️"}
                        </button>
                      </div>
                      {signupErrors.confirmPassword && <span className="auth-error">⚠ {signupErrors.confirmPassword}</span>}
                    </div>

                    <label className="auth-terms">
                      <input
                        type="checkbox"
                        checked={signupForm.terms}
                        onChange={(e) => setSignupForm({ ...signupForm, terms: e.target.checked })}
                      />
                      <span>
                        I agree to the{" "}
                        <a href="#!">Terms of Service</a> and{" "}
                        <a href="#!">Privacy Policy</a>
                      </span>
                    </label>
                    {signupErrors.terms && <span className="auth-error">⚠ {signupErrors.terms}</span>}

                    <button type="submit" className="auth-submit" disabled={loading}>
                      {loading ? (
                        <>
                          <div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />
                          Creating account...
                        </>
                      ) : "Create Account →"}
                    </button>

                    <div className="auth-divider">or sign up with</div>

                    <div className="auth-social-row">
                      <button type="button" className="auth-social-btn">
                        <span className="auth-social-icon">🇬</span> Google
                      </button>
                      <button type="button" className="auth-social-btn">
                        <span className="auth-social-icon">📱</span> Phone OTP
                      </button>
                    </div>
                  </form>

                  <div className="auth-switch">
                    Already have an account?{" "}
                    <button onClick={() => switchMode("login")}>Sign in</button>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
