import { useState } from "react";
import Card from "./Card";
import { useDispatch } from "react-redux";
import axios from "axios";
import { BASE_URL } from "../utils/constants";
import { addUser } from "../utils/userSlice";

const GENDER_OPTIONS = ["Male", "Female", "Other"];

const EditProfile = ({ user }) => {
  const [firstName, setFirstName] = useState(user.firstName || "");
  const [lastName, setLastName] = useState(user.lastName || "");
  const [photoUrl, setPhotoUrl] = useState(user.photoUrl || "");
  const [age, setAge] = useState(user.age || "");
  const [gender, setGender] = useState(user.gender || "");
  const [about, setAbout] = useState(user.about || "");
  const [error, setError] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  const saveProfile = async () => {
    setError("");
    setLoading(true);
    try {
      const res = await axios.patch(
        BASE_URL + "/profile/edit",
        { firstName, lastName, photoUrl, age, gender, about },
        { withCredentials: true }
      );
      dispatch(addUser(res?.data?.data));
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } catch (err) {
      setError(err.response?.data || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: "100%",
    padding: "11px 14px",
    borderRadius: 12,
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.1)",
    color: "#e2e8f0",
    fontSize: "0.875rem",
    fontFamily: "Inter, sans-serif",
    outline: "none",
    transition: "all 0.3s ease",
  };

  const labelStyle = {
    display: "block",
    marginBottom: 6,
    fontSize: "0.75rem",
    fontWeight: 600,
    color: "rgba(255,255,255,0.45)",
    letterSpacing: "0.07em",
    textTransform: "uppercase",
    fontFamily: "Inter, sans-serif",
  };

  const onFocus = (e) => {
    e.target.style.borderColor = "#7c3aed";
    e.target.style.boxShadow = "0 0 0 3px rgba(124,58,237,0.2)";
    e.target.style.background = "rgba(124,58,237,0.05)";
  };
  const onBlur = (e) => {
    e.target.style.borderColor = "rgba(255,255,255,0.1)";
    e.target.style.boxShadow = "none";
    e.target.style.background = "rgba(255,255,255,0.05)";
  };

  return (
    <>
      {/* Success Toast */}
      {showToast && (
        <div
          style={{
            position: "fixed",
            top: 80,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 1000,
            padding: "14px 24px",
            borderRadius: 14,
            background: "rgba(34,197,94,0.15)",
            border: "1px solid rgba(34,197,94,0.4)",
            color: "#86efac",
            fontFamily: "Inter, sans-serif",
            fontWeight: 600,
            fontSize: "0.9rem",
            backdropFilter: "blur(20px)",
            boxShadow: "0 8px 30px rgba(0,0,0,0.3)",
            animation: "fadeInUp 0.3s ease",
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          ✅ Profile saved successfully!
        </div>
      )}

      <div
        style={{
          minHeight: "calc(100vh - 140px)",
          padding: "48px 24px 80px",
          maxWidth: 1100,
          margin: "0 auto",
        }}
      >
        {/* Header */}
        <div style={{ marginBottom: 36 }} className="animate-fade-in">
          <span className="section-badge">✏️ Profile</span>
          <h1
            style={{
              fontSize: "2rem",
              fontWeight: 800,
              marginTop: 14,
              marginBottom: 6,
              fontFamily: "Inter, sans-serif",
              color: "#fff",
              letterSpacing: "-0.02em",
            }}
          >
            Edit Your Profile
          </h1>
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.9rem", fontFamily: "Inter, sans-serif" }}>
            Keep your profile fresh — first impressions matter!
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr auto",
            gap: 32,
            alignItems: "start",
          }}
          className="edit-profile-grid"
        >
          {/* Form */}
          <div className="glass-card animate-fade-in-up" style={{ padding: 32 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
              {/* First Name */}
              <div>
                <label style={labelStyle}>First Name</label>
                <input
                  type="text"
                  value={firstName}
                  style={inputStyle}
                  onChange={(e) => setFirstName(e.target.value)}
                  onFocus={onFocus}
                  onBlur={onBlur}
                  placeholder="John"
                />
              </div>

              {/* Last Name */}
              <div>
                <label style={labelStyle}>Last Name</label>
                <input
                  type="text"
                  value={lastName}
                  style={inputStyle}
                  onChange={(e) => setLastName(e.target.value)}
                  onFocus={onFocus}
                  onBlur={onBlur}
                  placeholder="Doe"
                />
              </div>
            </div>

            {/* Photo URL */}
            <div style={{ marginTop: 18 }}>
              <label style={labelStyle}>Photo URL</label>
              <input
                type="text"
                value={photoUrl}
                style={inputStyle}
                onChange={(e) => setPhotoUrl(e.target.value)}
                onFocus={onFocus}
                onBlur={onBlur}
                placeholder="https://example.com/photo.jpg"
              />
              {/* Live thumbnail */}
              {photoUrl && (
                <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 10 }}>
                  <img
                    src={photoUrl}
                    alt="Preview"
                    onError={(e) => { e.target.style.display = "none"; }}
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 10,
                      objectFit: "cover",
                      border: "1px solid rgba(255,255,255,0.15)",
                    }}
                  />
                  <span style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.35)", fontFamily: "Inter, sans-serif" }}>
                    Live preview
                  </span>
                </div>
              )}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, marginTop: 18 }}>
              {/* Age */}
              <div>
                <label style={labelStyle}>Age</label>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <button
                    onClick={() => setAge((prev) => Math.max(0, Number(prev) - 1))}
                    style={{
                      width: 36,
                      height: 40,
                      borderRadius: 10,
                      background: "rgba(255,255,255,0.06)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      color: "#e2e8f0",
                      fontSize: "1.2rem",
                      cursor: "pointer",
                      flexShrink: 0,
                      fontFamily: "Inter, sans-serif",
                      transition: "all 0.2s ease",
                    }}
                    className="hover:bg-white/10"
                  >−</button>
                  <input
                    type="number"
                    value={age}
                    style={{ ...inputStyle, textAlign: "center" }}
                    onChange={(e) => setAge(e.target.value)}
                    onFocus={onFocus}
                    onBlur={onBlur}
                    placeholder="25"
                    min="1"
                    max="99"
                  />
                  <button
                    onClick={() => setAge((prev) => Math.min(99, Number(prev) + 1))}
                    style={{
                      width: 36,
                      height: 40,
                      borderRadius: 10,
                      background: "rgba(255,255,255,0.06)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      color: "#e2e8f0",
                      fontSize: "1.2rem",
                      cursor: "pointer",
                      flexShrink: 0,
                      fontFamily: "Inter, sans-serif",
                      transition: "all 0.2s ease",
                    }}
                    className="hover:bg-white/10"
                  >+</button>
                </div>
              </div>

              {/* Gender Toggle */}
              <div>
                <label style={labelStyle}>Gender</label>
                <div className="gender-toggle">
                  {GENDER_OPTIONS.map((opt) => (
                    <button
                      key={opt}
                      className={`gender-option${gender === opt ? " active" : ""}`}
                      onClick={() => setGender(opt)}
                    >
                      {opt === "Male" ? "♂ " : opt === "Female" ? "♀ " : "⚧ "}
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* About */}
            <div style={{ marginTop: 18 }}>
              <label style={labelStyle}>About</label>
              <textarea
                value={about}
                style={{
                  ...inputStyle,
                  height: 100,
                  resize: "vertical",
                  lineHeight: 1.6,
                }}
                onChange={(e) => setAbout(e.target.value)}
                onFocus={onFocus}
                onBlur={onBlur}
                placeholder="Tell other developers about yourself, your skills, interests..."
              />
            </div>

            {/* Error */}
            {error && (
              <div
                style={{
                  marginTop: 14,
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

            {/* Save Button */}
            <button
              className="btn-glow"
              onClick={saveProfile}
              disabled={loading}
              style={{
                width: "100%",
                marginTop: 24,
                padding: "13px",
                borderRadius: 12,
                cursor: loading ? "not-allowed" : "pointer",
                fontSize: "0.95rem",
                opacity: loading ? 0.7 : 1,
                fontFamily: "Inter, sans-serif",
              }}
            >
              {loading ? (
                <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                  <span className="loading loading-spinner loading-sm" />
                  Saving...
                </span>
              ) : (
                "💾 Save Profile"
              )}
            </button>
          </div>

          {/* Live Preview */}
          <div
            className="animate-fade-in-up"
            style={{ animationDelay: "0.1s", position: "sticky", top: 90 }}
          >
            <p
              style={{
                textAlign: "center",
                marginBottom: 12,
                fontSize: "0.75rem",
                fontWeight: 600,
                color: "rgba(255,255,255,0.35)",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                fontFamily: "Inter, sans-serif",
              }}
            >
              Live Preview
            </p>
            <Card user={{ firstName, lastName, photoUrl, age, gender, about }} />
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .edit-profile-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </>
  );
};

export default EditProfile;