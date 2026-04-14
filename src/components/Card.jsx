import axios from "axios";
import { useDispatch } from "react-redux";
import { BASE_URL } from "../utils/constants";
import { removeUserFromFeed } from "../utils/feedSlice";

const Card = ({ user }) => {
  const { _id, firstName, lastName, photoUrl, about, gender, age } = user;
  const dispatch = useDispatch();

  const handleSendRequest = async (status, userId) => {
    try {
      await axios.post(
        BASE_URL + "/request/send/" + status + "/" + userId,
        {},
        { withCredentials: true }
      );
      dispatch(removeUserFromFeed(userId));
    } catch (err) {
      console.error(err);
    }
  };

  const fallbackAvatar = `https://ui-avatars.com/api/?name=${firstName}+${lastName}&background=7c3aed&color=fff&size=400`;

  return (
    <div className="profile-card-wrapper animate-fade-in-up">
      <div
        className="profile-card"
        style={{
          width: 340,
          borderRadius: 24,
          overflow: "hidden",
          position: "relative",
          background: "rgba(255,255,255,0.04)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(255,255,255,0.1)",
          boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
        }}
      >
        {/* Photo */}
        <div style={{ position: "relative", height: 380, overflow: "hidden" }}>
          <img
            src={photoUrl || fallbackAvatar}
            alt={`${firstName} ${lastName}`}
            onError={(e) => { e.target.src = fallbackAvatar; }}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
              transition: "transform 0.5s ease",
            }}
          />
          {/* Gradient overlay */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(to top, rgba(6,6,18,0.95) 0%, rgba(6,6,18,0.4) 50%, transparent 100%)",
            }}
          />
          {/* Name / age overlay */}
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              padding: "20px 20px 16px",
            }}
          >
            <h2
              style={{
                fontSize: "1.5rem",
                fontWeight: 700,
                color: "#fff",
                marginBottom: 4,
                fontFamily: "Inter, sans-serif",
                lineHeight: 1.2,
              }}
            >
              {firstName} {lastName}
            </h2>
            {gender && age && (
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <span
                  style={{
                    padding: "3px 10px",
                    borderRadius: 99,
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    background: "rgba(124,58,237,0.5)",
                    border: "1px solid rgba(124,58,237,0.6)",
                    color: "#ddd6fe",
                    fontFamily: "Inter, sans-serif",
                  }}
                >
                  {age} yrs
                </span>
                <span
                  style={{
                    padding: "3px 10px",
                    borderRadius: 99,
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    background: "rgba(6,182,212,0.3)",
                    border: "1px solid rgba(6,182,212,0.5)",
                    color: "#a5f3fc",
                    fontFamily: "Inter, sans-serif",
                  }}
                >
                  {gender}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* About section */}
        {about && (
          <div style={{ padding: "14px 20px 4px" }}>
            <p
              style={{
                fontSize: "0.875rem",
                color: "rgba(255,255,255,0.55)",
                lineHeight: 1.6,
                fontFamily: "Inter, sans-serif",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {about}
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div
          style={{
            display: "flex",
            gap: 12,
            padding: "16px 20px 20px",
          }}
        >
          {/* Ignore */}
          <button
            className="btn-glass-danger"
            onClick={() => handleSendRequest("ignored", _id)}
            style={{
              flex: 1,
              padding: "12px",
              borderRadius: 14,
              fontSize: "0.9rem",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              fontFamily: "Inter, sans-serif",
            }}
          >
            <span style={{ fontSize: "1.1rem" }}>✕</span> Pass
          </button>

          {/* Interested */}
          <button
            className="btn-glow-pink"
            onClick={() => handleSendRequest("interested", _id)}
            style={{
              flex: 1,
              padding: "12px",
              borderRadius: 14,
              fontSize: "0.9rem",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              fontFamily: "Inter, sans-serif",
            }}
          >
            <span style={{ fontSize: "1.1rem" }}>♥</span> Connect
          </button>
        </div>
      </div>
    </div>
  );
};

export default Card;