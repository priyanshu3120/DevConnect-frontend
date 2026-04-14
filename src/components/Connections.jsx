import axios from "axios";
import { useEffect } from "react";
import { BASE_URL } from "../utils/constants";
import { useDispatch, useSelector } from "react-redux";
import { addConnections } from "../utils/connectionSlice";

const ConnectionSkeleton = () => (
  <div
    style={{
      borderRadius: 20,
      overflow: "hidden",
      background: "rgba(255,255,255,0.03)",
      border: "1px solid rgba(255,255,255,0.06)",
      padding: 20,
      display: "flex",
      gap: 14,
    }}
  >
    <div className="skeleton-shimmer" style={{ width: 60, height: 60, borderRadius: "50%", flexShrink: 0 }} />
    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
      <div className="skeleton-shimmer" style={{ height: 18, width: "50%", borderRadius: 6 }} />
      <div className="skeleton-shimmer" style={{ height: 14, width: "30%", borderRadius: 6 }} />
      <div className="skeleton-shimmer" style={{ height: 12, width: "80%", borderRadius: 6 }} />
    </div>
  </div>
);

const EmptyConnections = () => (
  <div
    className="glass-card animate-fade-in-up"
    style={{ padding: "60px 40px", textAlign: "center", maxWidth: 400, margin: "0 auto" }}
  >
    <div style={{ fontSize: 56, marginBottom: 18 }} className="animate-float">🤝</div>
    <h2
      className="gradient-text"
      style={{ fontSize: "1.4rem", fontWeight: 700, marginBottom: 10, fontFamily: "Inter, sans-serif" }}
    >
      No connections yet
    </h2>
    <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.875rem", fontFamily: "Inter, sans-serif", lineHeight: 1.6 }}>
      Start swiping on the Discover page to build your developer network!
    </p>
  </div>
);

const Connections = () => {
  const connections = useSelector((store) => store.connections);
  const dispatch = useDispatch();

  const fetchConnections = async () => {
    try {
      const res = await axios.get(BASE_URL + "/user/connections", { withCredentials: true });
      dispatch(addConnections(res.data.data));
    } catch (err) {
      console.error("Error fetching connections", err);
    }
  };

  useEffect(() => {
    // Always fetch fresh so newly accepted connections appear immediately
    fetchConnections();
  }, []);

  return (
    <div
      style={{
        minHeight: "calc(100vh - 140px)",
        padding: "48px 24px 80px",
        maxWidth: 900,
        margin: "0 auto",
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: 36 }} className="animate-fade-in">
        <span className="section-badge">🤝 Network</span>
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
          Your Connections
        </h1>
        {connections && connections.length > 0 && (
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.9rem", fontFamily: "Inter, sans-serif" }}>
            {connections.length} developer{connections.length !== 1 ? "s" : ""} in your network
          </p>
        )}
      </div>

      {/* Content */}
      {!connections ? (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: 16,
          }}
        >
          {[1, 2, 3, 4].map((i) => <ConnectionSkeleton key={i} />)}
        </div>
      ) : connections.length === 0 ? (
        <EmptyConnections />
      ) : (
        <div
          className="stagger-children"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: 16,
          }}
        >
          {connections.map((connection) => {
            const { _id, firstName, lastName, photoUrl, age, gender, about } = connection;
            const fallback = `https://ui-avatars.com/api/?name=${firstName}+${lastName}&background=7c3aed&color=fff`;
            return (
              <div
                key={_id}
                className="glass-card animate-fade-in-up"
                style={{ padding: 20, cursor: "default" }}
              >
                <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                  {/* Avatar */}
                  <div style={{ position: "relative", flexShrink: 0 }}>
                    <div
                      style={{
                        width: 60,
                        height: 60,
                        borderRadius: "50%",
                        overflow: "hidden",
                        border: "2px solid rgba(124,58,237,0.5)",
                      }}
                      className="avatar-pulse"
                    >
                      <img
                        src={photoUrl || fallback}
                        alt={`${firstName} ${lastName}`}
                        onError={(e) => { e.target.src = fallback; }}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    </div>
                    {/* Online dot */}
                    <div
                      style={{
                        position: "absolute",
                        bottom: 2,
                        right: 2,
                        width: 12,
                        height: 12,
                        borderRadius: "50%",
                        background: "#22c55e",
                        border: "2px solid #0e0a1f",
                      }}
                    />
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h3
                      style={{
                        fontSize: "1rem",
                        fontWeight: 700,
                        color: "#fff",
                        marginBottom: 4,
                        fontFamily: "Inter, sans-serif",
                      }}
                    >
                      {firstName} {lastName}
                    </h3>
                    {age && gender && (
                      <p
                        style={{
                          fontSize: "0.775rem",
                          color: "#a78bfa",
                          marginBottom: 6,
                          fontFamily: "Inter, sans-serif",
                          fontWeight: 500,
                        }}
                      >
                        {age} · {gender}
                      </p>
                    )}
                    {about && (
                      <p
                        style={{
                          fontSize: "0.825rem",
                          color: "rgba(255,255,255,0.45)",
                          lineHeight: 1.5,
                          fontFamily: "Inter, sans-serif",
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                      >
                        {about}
                      </p>
                    )}
                  </div>
                </div>

                {/* Chat placeholder */}
                <div style={{ marginTop: 14 }}>
                  <button
                    className="btn-glow-cyan"
                    style={{
                      width: "100%",
                      padding: "9px",
                      borderRadius: 12,
                      fontSize: "0.825rem",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 6,
                      fontFamily: "Inter, sans-serif",
                    }}
                    title="Chat coming soon"
                  >
                    💬 Message
                    <span
                      style={{
                        fontSize: "0.65rem",
                        padding: "2px 6px",
                        borderRadius: 99,
                        background: "rgba(255,255,255,0.15)",
                        letterSpacing: "0.04em",
                        fontWeight: 700,
                      }}
                    >
                      SOON
                    </span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Connections;