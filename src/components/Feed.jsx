import axios from "axios";
import { BASE_URL } from "../utils/constants";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addFeed } from "../utils/feedSlice";
import Card from "./Card";

const FeedSkeleton = () => (
  <div
    style={{
      width: 340,
      borderRadius: 24,
      overflow: "hidden",
      border: "1px solid rgba(255,255,255,0.06)",
    }}
  >
    <div className="skeleton-shimmer" style={{ height: 380 }} />
    <div style={{ padding: "14px 20px 20px", display: "flex", flexDirection: "column", gap: 10 }}>
      <div className="skeleton-shimmer" style={{ height: 24, width: "60%", borderRadius: 8 }} />
      <div className="skeleton-shimmer" style={{ height: 16, width: "40%", borderRadius: 8 }} />
      <div className="skeleton-shimmer" style={{ height: 40, width: "100%", borderRadius: 8, marginTop: 4 }} />
      <div style={{ display: "flex", gap: 12, marginTop: 4 }}>
        <div className="skeleton-shimmer" style={{ flex: 1, height: 46, borderRadius: 14 }} />
        <div className="skeleton-shimmer" style={{ flex: 1, height: 46, borderRadius: 14 }} />
      </div>
    </div>
  </div>
);

const EmptyFeed = () => (
  <div
    className="animate-fade-in-up glass-card"
    style={{
      padding: "60px 40px",
      textAlign: "center",
      maxWidth: 380,
    }}
  >
    <div style={{ fontSize: 64, marginBottom: 20 }} className="animate-float">🌌</div>
    <h2
      className="gradient-text"
      style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: 10, fontFamily: "Inter, sans-serif" }}
    >
      You've seen everyone!
    </h2>
    <p
      style={{
        color: "rgba(255,255,255,0.4)",
        fontSize: "0.9rem",
        fontFamily: "Inter, sans-serif",
        lineHeight: 1.6,
      }}
    >
      No more developers to discover right now. Check back later or review your pending requests.
    </p>
  </div>
);

const Feed = () => {
  const feed = useSelector((store) => store.feed);
  const dispatch = useDispatch();
  const [error, setError] = useState(null);

  const getFeed = async () => {
    // Only skip if feed is already loaded (null means not yet fetched)
    if (feed !== null) return;
    try {
      setError(null);
      const res = await axios.get(BASE_URL + "/feed", { withCredentials: true });
      dispatch(addFeed(res?.data));
    } catch (err) {
      console.error(err);
      setError("Failed to load feed. Please try again.");
    }
  };

  useEffect(() => {
    getFeed();
  }, []);

  return (
    <div
      style={{
        minHeight: "calc(100vh - 140px)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        paddingTop: 48,
        paddingBottom: 80,
      }}
    >
      {/* Section Header */}
      <div style={{ textAlign: "center", marginBottom: 36 }} className="animate-fade-in">
        <span className="section-badge">✨ Discover</span>
        <h1
          style={{
            fontSize: "2rem",
            fontWeight: 800,
            marginTop: 14,
            marginBottom: 8,
            fontFamily: "Inter, sans-serif",
            color: "#fff",
            letterSpacing: "-0.02em",
          }}
        >
          Find Your Dev Partner
        </h1>
        <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.9rem", fontFamily: "Inter, sans-serif" }}>
          Connect and pass — build your developer network
        </p>
      </div>

      {/* Card Area */}
      {feed === null ? (
        error ? (
          <div
            className="glass-card animate-fade-in-up"
            style={{ padding: "40px", textAlign: "center", maxWidth: 380 }}
          >
            <div style={{ fontSize: 48, marginBottom: 14 }}>⚠️</div>
            <p style={{ color: "rgba(255,255,255,0.5)", fontFamily: "Inter, sans-serif", marginBottom: 20 }}>
              {error}
            </p>
            <button
              className="btn-glow"
              onClick={() => { dispatch(addFeed(null)); getFeed(); }}
              style={{ padding: "10px 28px", borderRadius: 12, cursor: "pointer", fontFamily: "Inter, sans-serif" }}
            >
              Retry
            </button>
          </div>
        ) : (
          <FeedSkeleton />
        )
      ) : feed.length <= 0 ? (
        <EmptyFeed />
      ) : (
        <div style={{ position: "relative" }}>
          {/* Ghost stack cards */}
          {feed.length > 2 && (
            <div
              style={{
                position: "absolute",
                top: 8,
                left: "50%",
                transform: "translateX(-50%) rotate(4deg) scale(0.95)",
                width: 340,
                height: 60,
                borderRadius: 24,
                background: "rgba(124,58,237,0.1)",
                border: "1px solid rgba(124,58,237,0.15)",
                zIndex: 0,
              }}
            />
          )}
          {feed.length > 1 && (
            <div
              style={{
                position: "absolute",
                top: 4,
                left: "50%",
                transform: "translateX(-50%) rotate(-2deg) scale(0.97)",
                width: 340,
                height: 60,
                borderRadius: 24,
                background: "rgba(6,182,212,0.08)",
                border: "1px solid rgba(6,182,212,0.12)",
                zIndex: 0,
              }}
            />
          )}
          <div style={{ position: "relative", zIndex: 1 }}>
            <Card user={feed[0]} />
          </div>
          {feed.length > 1 && (
            <p
              style={{
                textAlign: "center",
                marginTop: 16,
                color: "rgba(255,255,255,0.3)",
                fontSize: "0.8rem",
                fontFamily: "Inter, sans-serif",
              }}
            >
              {feed.length - 1} more developer{feed.length - 1 !== 1 ? "s" : ""} waiting
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default Feed;