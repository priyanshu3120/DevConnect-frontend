import { useEffect, useRef, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";
import { BASE_URL } from "../utils/constants";
import { getSocket, disconnectSocket } from "../utils/socketManager";

/* ── tiny helpers ─────────────────────────────────────────────── */
const formatTime = (dateStr) => {
  const d = new Date(dateStr);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

const formatDate = (dateStr) => {
  const d = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  if (d.toDateString() === today.toDateString()) return "Today";
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  return d.toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" });
};

const groupByDate = (messages) => {
  const groups = [];
  let currentDate = null;
  messages.forEach((msg) => {
    const date = formatDate(msg.createdAt);
    if (date !== currentDate) {
      groups.push({ type: "divider", label: date });
      currentDate = date;
    }
    groups.push({ type: "message", ...msg });
  });
  return groups;
};

/* ── avatar component ─────────────────────────────────────────── */
const Avatar = ({ user, size = 36 }) => {
  const fallback = `https://ui-avatars.com/api/?name=${user?.firstName}+${user?.lastName}&background=7c3aed&color=fff&size=${size * 2}`;
  return (
    <img
      src={user?.photoUrl || fallback}
      alt={user?.firstName}
      onError={(e) => { e.target.src = fallback; }}
      style={{
        width: size, height: size, borderRadius: "50%",
        objectFit: "cover", flexShrink: 0,
        border: "2px solid rgba(124,58,237,0.4)",
      }}
    />
  );
};

/* ── typing indicator ─────────────────────────────────────────── */
const TypingIndicator = () => (
  <div style={{ display: "flex", alignItems: "center", gap: 4, padding: "8px 14px",
    background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "18px 18px 18px 4px", width: "fit-content" }}>
    {[0, 1, 2].map((i) => (
      <span key={i} style={{
        width: 7, height: 7, borderRadius: "50%",
        background: "rgba(255,255,255,0.5)",
        display: "inline-block",
        animation: "bounce 1.2s infinite",
        animationDelay: `${i * 0.2}s`,
      }} />
    ))}
  </div>
);

/* ── main Chat component ──────────────────────────────────────── */
const Chat = () => {
  const { targetUserId } = useParams();
  const navigate = useNavigate();
  const loggedInUser = useSelector((store) => store.user);

  const [messages, setMessages] = useState([]);
  const [targetUser, setTargetUser] = useState(null);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sending, setSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [connected, setConnected] = useState(false);

  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const socketRef = useRef(null);

  /* scroll to bottom on new messages */
  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  /* fetch chat history + target user info */
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await axios.get(`${BASE_URL}/chat/${targetUserId}`, {
          withCredentials: true,
        });
        setMessages(res.data.messages || []);

        // Extract target user from messages or fetch from connections
        const msgs = res.data.messages || [];
        if (msgs.length > 0) {
          const first = msgs[0];
          const tUser =
            first.senderId._id === targetUserId ? first.senderId : first.receiverId;
          setTargetUser(tUser);
        }
      } catch (err) {
        if (err.response?.status === 403) {
          setError("You are not connected with this user. Connect first to chat.");
        } else {
          setError("Failed to load chat history.");
        }
      } finally {
        setLoading(false);
      }
    };
    if (loggedInUser) fetchHistory();
  }, [targetUserId, loggedInUser]);

  /* fetch target user info from connections if not found in messages */
  useEffect(() => {
    const fetchTargetUser = async () => {
      if (targetUser || loading) return;
      try {
        const res = await axios.get(`${BASE_URL}/user/connections`, {
          withCredentials: true,
        });
        const match = (res.data.data || []).find(
          (u) => u._id === targetUserId
        );
        if (match) setTargetUser(match);
      } catch (_) {}
    };
    fetchTargetUser();
  }, [targetUser, loading, targetUserId]);

  /* socket setup */
  useEffect(() => {
    if (!loggedInUser) return;

    const socket = getSocket();
    socketRef.current = socket;

    if (!socket.connected) socket.connect();

    socket.on("connect", () => {
      setConnected(true);
      socket.emit("joinRoom", { targetUserId });
    });

    socket.on("disconnect", () => setConnected(false));

    socket.on("receiveMessage", (msg) => {
      setMessages((prev) => [...prev, msg]);
      // If the incoming msg is from the other user, stop typing indicator
      if (msg.senderId._id !== loggedInUser._id) {
        setIsTyping(false);
      }
    });

    socket.on("userTyping", ({ userId }) => {
      if (userId !== loggedInUser._id) setIsTyping(true);
    });

    socket.on("userStopTyping", ({ userId }) => {
      if (userId !== loggedInUser._id) setIsTyping(false);
    });

    socket.on("error", ({ message }) => {
      setError(message);
    });

    // If already connected before this effect ran
    if (socket.connected) {
      setConnected(true);
      socket.emit("joinRoom", { targetUserId });
    }

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("receiveMessage");
      socket.off("userTyping");
      socket.off("userStopTyping");
      socket.off("error");
    };
  }, [loggedInUser, targetUserId]);

  /* cleanup on unmount */
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, []);

  /* typing events */
  const handleTyping = (e) => {
    setText(e.target.value);
    const socket = socketRef.current;
    if (!socket) return;

    socket.emit("userTyping", { targetUserId, userId: loggedInUser._id });
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("userStopTyping", { targetUserId, userId: loggedInUser._id });
    }, 1500);
  };

  /* send message */
  const handleSend = async () => {
    const trimmed = text.trim();
    if (!trimmed || sending) return;

    const socket = socketRef.current;
    if (!socket?.connected) {
      setError("Not connected. Please wait...");
      return;
    }

    setSending(true);
    try {
      socket.emit("sendMessage", { targetUserId, text: trimmed });
      setText("");
      socket.emit("userStopTyping", { targetUserId, userId: loggedInUser._id });
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  /* ── render ──────────────────────────────────────────────────── */
  const grouped = groupByDate(messages);

  return (
    <>
      <style>{`
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-6px); }
        }
        .chat-bubble-sent {
          background: linear-gradient(135deg, #7c3aed, #5b21b6);
          border-radius: 18px 18px 4px 18px;
          color: #fff;
          box-shadow: 0 4px 16px rgba(124,58,237,0.35);
        }
        .chat-bubble-received {
          background: rgba(255,255,255,0.07);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 18px 18px 18px 4px;
          color: #e2e8f0;
        }
        .chat-input:focus { outline: none; }
        .send-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .send-btn:not(:disabled):hover {
          box-shadow: 0 6px 24px rgba(124,58,237,0.6);
          transform: scale(1.04);
        }
        .back-btn:hover { background: rgba(255,255,255,0.1); }
        .msg-row { display:flex; gap:10px; margin-bottom:4px; }
        .msg-row.sent { flex-direction: row-reverse; }
        .msg-row.received { flex-direction: row; }
      `}</style>

      <div
        style={{
          minHeight: "calc(100vh - 140px)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "24px 16px 40px",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: 720,
            display: "flex",
            flexDirection: "column",
            height: "calc(100vh - 180px)",
            background: "rgba(255,255,255,0.03)",
            backdropFilter: "blur(24px)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 24,
            overflow: "hidden",
            boxShadow: "0 24px 64px rgba(0,0,0,0.4)",
          }}
        >
          {/* ── Header ──────────────────────────────────────────── */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              padding: "16px 20px",
              borderBottom: "1px solid rgba(255,255,255,0.07)",
              background: "rgba(0,0,0,0.2)",
              flexShrink: 0,
            }}
          >
            <button
              className="back-btn"
              onClick={() => navigate("/connections")}
              style={{
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 10,
                color: "#fff",
                cursor: "pointer",
                padding: "8px 12px",
                fontSize: "1rem",
                transition: "all 0.2s ease",
                fontFamily: "Inter, sans-serif",
              }}
            >
              ←
            </button>

            {targetUser && <Avatar user={targetUser} size={42} />}

            <div style={{ flex: 1 }}>
              <p
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontWeight: 700,
                  fontSize: "1rem",
                  color: "#fff",
                  margin: 0,
                }}
              >
                {targetUser
                  ? `${targetUser.firstName} ${targetUser.lastName}`
                  : "Loading…"}
              </p>
              <p
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: "0.75rem",
                  margin: 0,
                  color: connected ? "#22c55e" : "rgba(255,255,255,0.35)",
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                }}
              >
                <span
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: "50%",
                    background: connected ? "#22c55e" : "rgba(255,255,255,0.25)",
                    display: "inline-block",
                  }}
                />
                {connected ? "Online" : "Connecting…"}
              </p>
            </div>

            {/* Dev badge */}
            <span
              style={{
                padding: "4px 12px",
                borderRadius: 99,
                background: "rgba(124,58,237,0.15)",
                border: "1px solid rgba(124,58,237,0.3)",
                color: "#a78bfa",
                fontSize: "0.7rem",
                fontWeight: 700,
                fontFamily: "Inter, sans-serif",
                letterSpacing: "0.05em",
              }}
            >
              💬 LIVE CHAT
            </span>
          </div>

          {/* ── Message area ─────────────────────────────────────── */}
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "20px 20px 8px",
              display: "flex",
              flexDirection: "column",
              gap: 2,
            }}
          >
            {loading && (
              <div
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 14,
                  color: "rgba(255,255,255,0.3)",
                  fontFamily: "Inter, sans-serif",
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    border: "3px solid rgba(124,58,237,0.2)",
                    borderTop: "3px solid #7c3aed",
                    borderRadius: "50%",
                    animation: "spin 0.8s linear infinite",
                  }}
                />
                <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
                Loading chat…
              </div>
            )}

            {error && !loading && (
              <div
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 16,
                  textAlign: "center",
                  padding: 40,
                }}
              >
                <span style={{ fontSize: 48 }}>🔒</span>
                <p
                  style={{
                    color: "rgba(255,255,255,0.5)",
                    fontFamily: "Inter, sans-serif",
                    fontSize: "0.9rem",
                    lineHeight: 1.6,
                    maxWidth: 320,
                  }}
                >
                  {error}
                </p>
                <button
                  className="btn-glow"
                  onClick={() => navigate("/connections")}
                  style={{
                    padding: "10px 24px",
                    borderRadius: 12,
                    cursor: "pointer",
                    fontFamily: "Inter, sans-serif",
                    fontSize: "0.875rem",
                  }}
                >
                  Go to Connections
                </button>
              </div>
            )}

            {!loading && !error && messages.length === 0 && (
              <div
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 14,
                  textAlign: "center",
                }}
              >
                <span style={{ fontSize: 56 }} className="animate-float">
                  👋
                </span>
                <p
                  style={{
                    color: "rgba(255,255,255,0.45)",
                    fontFamily: "Inter, sans-serif",
                    fontSize: "0.9rem",
                    lineHeight: 1.6,
                  }}
                >
                  No messages yet.
                  <br />
                  Say hello to{" "}
                  <strong style={{ color: "rgba(255,255,255,0.7)" }}>
                    {targetUser?.firstName || "your connection"}
                  </strong>
                  !
                </p>
              </div>
            )}

            {!loading &&
              !error &&
              grouped.map((item, idx) => {
                if (item.type === "divider") {
                  return (
                    <div
                      key={`divider-${idx}`}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        margin: "16px 0 12px",
                      }}
                    >
                      <div
                        style={{
                          flex: 1,
                          height: 1,
                          background: "rgba(255,255,255,0.07)",
                        }}
                      />
                      <span
                        style={{
                          fontSize: "0.7rem",
                          color: "rgba(255,255,255,0.3)",
                          fontFamily: "Inter, sans-serif",
                          fontWeight: 600,
                          letterSpacing: "0.05em",
                          textTransform: "uppercase",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {item.label}
                      </span>
                      <div
                        style={{
                          flex: 1,
                          height: 1,
                          background: "rgba(255,255,255,0.07)",
                        }}
                      />
                    </div>
                  );
                }

                const isSent =
                  item.senderId._id === loggedInUser?._id ||
                  item.senderId === loggedInUser?._id;

                const sender =
                  typeof item.senderId === "object" ? item.senderId : null;

                return (
                  <div
                    key={item._id || idx}
                    className={`msg-row ${isSent ? "sent" : "received"}`}
                    style={{
                      alignItems: "flex-end",
                      marginBottom: 6,
                    }}
                  >
                    {!isSent && sender && (
                      <Avatar user={sender} size={28} />
                    )}

                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: isSent ? "flex-end" : "flex-start",
                        maxWidth: "70%",
                      }}
                    >
                      <div
                        className={
                          isSent ? "chat-bubble-sent" : "chat-bubble-received"
                        }
                        style={{
                          padding: "10px 14px",
                          fontSize: "0.9rem",
                          fontFamily: "Inter, sans-serif",
                          lineHeight: 1.5,
                          wordBreak: "break-word",
                        }}
                      >
                        {item.text}
                      </div>
                      <span
                        style={{
                          fontSize: "0.65rem",
                          color: "rgba(255,255,255,0.25)",
                          fontFamily: "Inter, sans-serif",
                          marginTop: 3,
                          marginLeft: isSent ? 0 : 4,
                          marginRight: isSent ? 4 : 0,
                        }}
                      >
                        {formatTime(item.createdAt)}
                        {isSent && " ✓"}
                      </span>
                    </div>

                    {isSent && loggedInUser && (
                      <Avatar user={loggedInUser} size={28} />
                    )}
                  </div>
                );
              })}

            {/* Typing indicator */}
            {isTyping && (
              <div className="msg-row received" style={{ alignItems: "flex-end" }}>
                {targetUser && <Avatar user={targetUser} size={28} />}
                <TypingIndicator />
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* ── Input bar ────────────────────────────────────────── */}
          {!error && (
            <div
              style={{
                padding: "14px 16px",
                borderTop: "1px solid rgba(255,255,255,0.07)",
                background: "rgba(0,0,0,0.15)",
                display: "flex",
                gap: 10,
                alignItems: "flex-end",
                flexShrink: 0,
              }}
            >
              <div style={{ flex: 1, position: "relative" }}>
                <textarea
                  ref={inputRef}
                  className="chat-input"
                  value={text}
                  onChange={handleTyping}
                  onKeyDown={handleKeyDown}
                  placeholder="Type a message… (Enter to send)"
                  rows={1}
                  style={{
                    width: "100%",
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.12)",
                    borderRadius: 16,
                    padding: "12px 16px",
                    color: "#e2e8f0",
                    fontFamily: "Inter, sans-serif",
                    fontSize: "0.9rem",
                    resize: "none",
                    lineHeight: 1.5,
                    maxHeight: 120,
                    overflow: "auto",
                    transition: "border-color 0.2s ease",
                    boxSizing: "border-box",
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "rgba(124,58,237,0.6)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "rgba(255,255,255,0.12)";
                  }}
                  disabled={loading || !!error}
                />
              </div>

              <button
                className="send-btn"
                onClick={handleSend}
                disabled={!text.trim() || sending || !connected}
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: "50%",
                  border: "none",
                  background: "linear-gradient(135deg, #7c3aed, #5b21b6)",
                  color: "#fff",
                  fontSize: "1.2rem",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  transition: "all 0.2s ease",
                  boxShadow: "0 4px 16px rgba(124,58,237,0.4)",
                }}
                title="Send (Enter)"
              >
                ➤
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Chat;
