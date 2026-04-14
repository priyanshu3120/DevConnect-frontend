import axios from "axios";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { addUser } from "../utils/userSlice";
import { useNavigate } from "react-router-dom";
import { BASE_URL } from "../utils/constants";

const Login = () => {
  const [emailId, setEmailId] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [isLoginForm, setIsLoginForm] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogin = async () => {
    setError("");
    setLoading(true);
    try {
      const res = await axios.post(
        BASE_URL + "/login",
        { emailId, password },
        { withCredentials: true }
      );
      dispatch(addUser(res.data));
      return navigate("/feed");
    } catch (err) {
      setError(err?.response?.data || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async () => {
    setError("");
    setLoading(true);
    try {
      const res = await axios.post(
        BASE_URL + "/signup",
        { firstName, lastName, emailId, password },
        { withCredentials: true }
      );
      dispatch(addUser(res.data.data));
      return navigate("/profile");
    } catch (err) {
      setError(err?.response?.data || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: "100%",
    padding: "12px 16px",
    borderRadius: 12,
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.1)",
    color: "#e2e8f0",
    fontSize: "0.9rem",
    fontFamily: "Inter, sans-serif",
    outline: "none",
    transition: "all 0.3s ease",
  };

  const labelStyle = {
    display: "block",
    marginBottom: 6,
    fontSize: "0.8rem",
    fontWeight: 600,
    color: "rgba(255,255,255,0.5)",
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    fontFamily: "Inter, sans-serif",
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px 16px 80px",
      }}
    >
      <div
        className="animate-fade-in-up"
        style={{ width: "100%", maxWidth: 440 }}
      >
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 20,
              background: "linear-gradient(135deg, #7c3aed, #06b6d4)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 28,
              margin: "0 auto 16px",
              boxShadow: "0 8px 30px rgba(124,58,237,0.4)",
            }}
            className="animate-float"
          >
            ⚡
          </div>
          <h1
            className="gradient-text"
            style={{
              fontSize: "2rem",
              fontWeight: 800,
              letterSpacing: "-0.02em",
              marginBottom: 8,
              fontFamily: "Inter, sans-serif",
            }}
          >
            DevConnect
          </h1>
          <p
            style={{
              color: "rgba(255,255,255,0.4)",
              fontSize: "0.9rem",
              fontFamily: "Inter, sans-serif",
            }}
          >
            {isLoginForm
              ? "Welcome back! Sign in to continue."
              : "Join 1000+ developers. Start connecting."}
          </p>
        </div>

        {/* Card */}
        <div
          className="glass-card"
          style={{ padding: 32 }}
        >
          {/* Toggle Tabs */}
          <div
            style={{
              display: "flex",
              background: "rgba(255,255,255,0.04)",
              borderRadius: 12,
              padding: 4,
              marginBottom: 28,
              gap: 4,
            }}
          >
            {["Login", "Sign Up"].map((tab) => {
              const active =
                (tab === "Login" && isLoginForm) ||
                (tab === "Sign Up" && !isLoginForm);
              return (
                <button
                  key={tab}
                  onClick={() => {
                    setIsLoginForm(tab === "Login");
                    setError("");
                  }}
                  style={{
                    flex: 1,
                    padding: "10px",
                    borderRadius: 10,
                    border: "none",
                    background: active
                      ? "linear-gradient(135deg, #7c3aed, #5b21b6)"
                      : "transparent",
                    color: active ? "white" : "rgba(255,255,255,0.45)",
                    fontWeight: 600,
                    fontSize: "0.875rem",
                    cursor: "pointer",
                    transition: "all 0.25s ease",
                    fontFamily: "Inter, sans-serif",
                    boxShadow: active ? "0 4px 14px rgba(124,58,237,0.35)" : "none",
                  }}
                >
                  {tab}
                </button>
              );
            })}
          </div>

          {/* Fields */}
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            {!isLoginForm && (
              <>
                <div>
                  <label style={labelStyle}>First Name</label>
                  <input
                    type="text"
                    placeholder="John"
                    value={firstName}
                    style={inputStyle}
                    onChange={(e) => setFirstName(e.target.value)}
                    onFocus={(e) => {
                      e.target.style.borderColor = "#7c3aed";
                      e.target.style.boxShadow = "0 0 0 3px rgba(124,58,237,0.2)";
                      e.target.style.background = "rgba(124,58,237,0.05)";
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = "rgba(255,255,255,0.1)";
                      e.target.style.boxShadow = "none";
                      e.target.style.background = "rgba(255,255,255,0.05)";
                    }}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Last Name</label>
                  <input
                    type="text"
                    placeholder="Doe"
                    value={lastName}
                    style={inputStyle}
                    onChange={(e) => setLastName(e.target.value)}
                    onFocus={(e) => {
                      e.target.style.borderColor = "#7c3aed";
                      e.target.style.boxShadow = "0 0 0 3px rgba(124,58,237,0.2)";
                      e.target.style.background = "rgba(124,58,237,0.05)";
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = "rgba(255,255,255,0.1)";
                      e.target.style.boxShadow = "none";
                      e.target.style.background = "rgba(255,255,255,0.05)";
                    }}
                  />
                </div>
              </>
            )}

            <div>
              <label style={labelStyle}>Email Address</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={emailId}
                style={inputStyle}
                onChange={(e) => setEmailId(e.target.value)}
                onFocus={(e) => {
                  e.target.style.borderColor = "#7c3aed";
                  e.target.style.boxShadow = "0 0 0 3px rgba(124,58,237,0.2)";
                  e.target.style.background = "rgba(124,58,237,0.05)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "rgba(255,255,255,0.1)";
                  e.target.style.boxShadow = "none";
                  e.target.style.background = "rgba(255,255,255,0.05)";
                }}
              />
            </div>

            <div>
              <label style={labelStyle}>Password</label>
              <input
                type="password"
                placeholder="Min 8 chars, A-Z, 0-9"
                value={password}
                style={inputStyle}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={(e) => {
                  e.target.style.borderColor = "#7c3aed";
                  e.target.style.boxShadow = "0 0 0 3px rgba(124,58,237,0.2)";
                  e.target.style.background = "rgba(124,58,237,0.05)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "rgba(255,255,255,0.1)";
                  e.target.style.boxShadow = "none";
                  e.target.style.background = "rgba(255,255,255,0.05)";
                }}
              />
            </div>
          </div>

          {/* Error */}
          {error && (
            <div
              style={{
                marginTop: 16,
                padding: "10px 14px",
                borderRadius: 10,
                background: "rgba(239,68,68,0.1)",
                border: "1px solid rgba(239,68,68,0.3)",
                color: "#fca5a5",
                fontSize: "0.85rem",
                fontFamily: "Inter, sans-serif",
              }}
            >
              ⚠️ {error}
            </div>
          )}

          {/* CTA Button */}
          <button
            className="btn-glow"
            onClick={isLoginForm ? handleLogin : handleSignUp}
            disabled={loading}
            style={{
              width: "100%",
              marginTop: 24,
              padding: "13px",
              borderRadius: 12,
              cursor: loading ? "not-allowed" : "pointer",
              fontSize: "0.95rem",
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? (
              <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                <span className="loading loading-spinner loading-sm" />
                {isLoginForm ? "Signing in..." : "Creating account..."}
              </span>
            ) : (
              isLoginForm ? "Sign In →" : "Create Account →"
            )}
          </button>

          {/* Toggle */}
          <p
            style={{
              textAlign: "center",
              marginTop: 20,
              fontSize: "0.875rem",
              color: "rgba(255,255,255,0.4)",
              fontFamily: "Inter, sans-serif",
            }}
          >
            {isLoginForm ? "New to DevConnect?" : "Already have an account?"}{" "}
            <button
              onClick={() => { setIsLoginForm((v) => !v); setError(""); }}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "#a78bfa",
                fontWeight: 600,
                fontFamily: "Inter, sans-serif",
                textDecoration: "underline",
                textDecorationColor: "rgba(167,139,250,0.4)",
              }}
            >
              {isLoginForm ? "Sign up" : "Log in"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
