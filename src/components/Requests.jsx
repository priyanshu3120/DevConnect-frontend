import axios from "axios";
import { BASE_URL } from "../utils/constants";
import { useDispatch, useSelector } from "react-redux";
import { addRequests, removeRequest } from "../utils/requestSlice";
import { removeConnections } from "../utils/connectionSlice";
import { useEffect } from "react";

const RequestSkeleton = () => (
  <div
    style={{
      borderRadius: 20,
      background: "rgba(255,255,255,0.03)",
      border: "1px solid rgba(255,255,255,0.06)",
      padding: 20,
      display: "flex",
      alignItems: "center",
      gap: 14,
    }}
  >
    <div className="skeleton-shimmer" style={{ width: 60, height: 60, borderRadius: "50%", flexShrink: 0 }} />
    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
      <div className="skeleton-shimmer" style={{ height: 18, width: "45%", borderRadius: 6 }} />
      <div className="skeleton-shimmer" style={{ height: 13, width: "28%", borderRadius: 6 }} />
    </div>
    <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
      <div className="skeleton-shimmer" style={{ width: 80, height: 40, borderRadius: 12 }} />
      <div className="skeleton-shimmer" style={{ width: 80, height: 40, borderRadius: 12 }} />
    </div>
  </div>
);

const EmptyRequests = () => (
  <div
    className="glass-card animate-fade-in-up"
    style={{ padding: "60px 40px", textAlign: "center", maxWidth: 420, margin: "0 auto" }}
  >
    <div style={{ fontSize: 56, marginBottom: 18 }} className="animate-float">📭</div>
    <h2
      className="gradient-text"
      style={{ fontSize: "1.4rem", fontWeight: 700, marginBottom: 10, fontFamily: "Inter, sans-serif" }}
    >
      No pending requests
    </h2>
    <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.875rem", fontFamily: "Inter, sans-serif", lineHeight: 1.6 }}>
      When developers show interest in connecting with you, their requests will appear here.
    </p>
  </div>
);

const Requests = () => {
  const requests = useSelector((store) => store.requests);
  const dispatch = useDispatch();

  const reviewRequest = async (status, _id) => {
    try {
      await axios.post(
        BASE_URL + "/request/review/" + status + "/" + _id,
        {},
        { withCredentials: true }
      );
      // Remove the request from the requests list
      dispatch(removeRequest(_id));
      // If accepted, clear connections cache so Connections page re-fetches fresh
      if (status === "accepted") {
        dispatch(removeConnections());
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchRequests = async () => {
    try {
      const res = await axios.get(BASE_URL + "/user/requests/received", { withCredentials: true });
      dispatch(addRequests(res.data.data));
    } catch (err) {
      console.error(err);
    }
  };

  // Always re-fetch on mount (don't use stale Redux cache for requests)
  // This ensures dismissed/accepted requests don't reappear on revisit

  useEffect(() => {
    // Always fetch fresh — no stale-cache guard here
    fetchRequests();
  }, []);

  return (
    <div
      style={{
        minHeight: "calc(100vh - 140px)",
        padding: "48px 24px 80px",
        maxWidth: 800,
        margin: "0 auto",
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: 36 }} className="animate-fade-in">
        <span className="section-badge">📥 Requests</span>
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
          Connection Requests
        </h1>
        {requests && requests.length > 0 && (
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.9rem", fontFamily: "Inter, sans-serif" }}>
            {requests.length} pending request{requests.length !== 1 ? "s" : ""}
          </p>
        )}
      </div>

      {/* Content */}
      {!requests ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {[1, 2, 3].map((i) => <RequestSkeleton key={i} />)}
        </div>
      ) : requests.length === 0 ? (
        <EmptyRequests />
      ) : (
        <div className="stagger-children" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {requests.map((request, idx) => {
            const { _id, firstName, lastName, photoUrl, age, gender, about } = request.fromUserId;
            const fallback = `https://ui-avatars.com/api/?name=${firstName}+${lastName}&background=ec4899&color=fff`;

            return (
              <div
                key={_id}
                className="glass-card animate-fade-in-up"
                style={{
                  padding: "18px 20px",
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  flexWrap: "wrap",
                  animationDelay: `${idx * 0.07}s`,
                }}
              >
                {/* Avatar */}
                <div
                  style={{
                    width: 60,
                    height: 60,
                    borderRadius: "50%",
                    overflow: "hidden",
                    border: "2px solid rgba(236,72,153,0.5)",
                    flexShrink: 0,
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

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3
                    style={{
                      fontSize: "1rem",
                      fontWeight: 700,
                      color: "#fff",
                      fontFamily: "Inter, sans-serif",
                      marginBottom: 3,
                    }}
                  >
                    {firstName} {lastName}
                  </h3>
                  {age && gender && (
                    <p
                      style={{
                        fontSize: "0.775rem",
                        color: "#f9a8d4",
                        fontFamily: "Inter, sans-serif",
                        fontWeight: 500,
                        marginBottom: 3,
                      }}
                    >
                      {age} · {gender}
                    </p>
                  )}
                  {about && (
                    <p
                      style={{
                        fontSize: "0.825rem",
                        color: "rgba(255,255,255,0.4)",
                        fontFamily: "Inter, sans-serif",
                        display: "-webkit-box",
                        WebkitLineClamp: 1,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {about}
                    </p>
                  )}
                </div>

                {/* Action Buttons */}
                <div style={{ display: "flex", gap: 10, flexShrink: 0 }}>
                  <button
                    className="btn-glass-danger"
                    onClick={() => reviewRequest("rejected", request._id)}
                    style={{
                      padding: "9px 18px",
                      borderRadius: 12,
                      fontSize: "0.85rem",
                      cursor: "pointer",
                      fontFamily: "Inter, sans-serif",
                      fontWeight: 600,
                    }}
                  >
                    ✕ Reject
                  </button>
                  <button
                    className="btn-glow-pink"
                    onClick={() => reviewRequest("accepted", request._id)}
                    style={{
                      padding: "9px 18px",
                      borderRadius: 12,
                      fontSize: "0.85rem",
                      cursor: "pointer",
                      fontFamily: "Inter, sans-serif",
                      fontWeight: 600,
                      color: "white",
                    }}
                  >
                    ✓ Accept
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

export default Requests;
