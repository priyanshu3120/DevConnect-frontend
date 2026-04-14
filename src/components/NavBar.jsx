import { useSelector, useDispatch } from "react-redux";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { BASE_URL } from "../utils/constants";
import axios from "axios";
import { removeUser } from "../utils/userSlice";

const NavBar = () => {
  const user = useSelector((store) => store.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await axios.post(BASE_URL + "/logout", {}, { withCredentials: true });
      dispatch(removeUser());
      return navigate("/login");
    } catch (err) {
      console.error(err);
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div className="devconnect-nav navbar px-6 py-3">
      {/* Logo */}
      <div className="flex-1">
        <Link
          to="/feed"
          className="flex items-center gap-2 group no-underline"
          style={{ textDecoration: "none" }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: "linear-gradient(135deg, #7c3aed, #06b6d4)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "18px",
              flexShrink: 0,
              boxShadow: "0 4px 14px rgba(124,58,237,0.4)",
              transition: "transform 0.3s ease",
            }}
            className="group-hover:scale-110"
          >
            ⚡
          </div>
          <span
            className="gradient-text font-extrabold text-xl tracking-tight"
            style={{ fontFamily: "Inter, sans-serif" }}
          >
            DevConnect
          </span>
        </Link>
      </div>

      {/* Nav links + user menu */}
      <div className="flex items-center gap-3">
        {user && (
          <>
            {/* Nav Links */}
            <div className="hidden md:flex items-center gap-1">
              {[
                { path: "/feed", label: "Discover" },
                { path: "/connections", label: "Connections" },
                { path: "/requests", label: "Requests" },
              ].map(({ path, label }) => (
                <Link
                  key={path}
                  to={path}
                  style={{
                    padding: "6px 14px",
                    borderRadius: 10,
                    fontSize: "0.875rem",
                    fontWeight: 500,
                    fontFamily: "Inter, sans-serif",
                    textDecoration: "none",
                    transition: "all 0.25s ease",
                    background: isActive(path)
                      ? "rgba(124,58,237,0.2)"
                      : "transparent",
                    color: isActive(path) ? "#a78bfa" : "rgba(255,255,255,0.6)",
                    border: isActive(path)
                      ? "1px solid rgba(124,58,237,0.4)"
                      : "1px solid transparent",
                  }}
                >
                  {label}
                </Link>
              ))}
            </div>

            {/* Avatar + Dropdown */}
            <div className="dropdown dropdown-end">
              <div
                tabIndex={0}
                role="button"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "6px 12px 6px 6px",
                  borderRadius: 99,
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  cursor: "pointer",
                  transition: "all 0.25s ease",
                }}
                className="hover:border-violet-500/40 hover:bg-white/10"
              >
                <div
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: "50%",
                    overflow: "hidden",
                    border: "2px solid rgba(124,58,237,0.6)",
                    flexShrink: 0,
                  }}
                >
                  <img
                    alt={user.firstName}
                    src={user.photoUrl}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    onError={(e) => {
                      e.target.src = `https://ui-avatars.com/api/?name=${user.firstName}+${user.lastName}&background=7c3aed&color=fff`;
                    }}
                  />
                </div>
                <span
                  style={{
                    fontSize: "0.875rem",
                    fontWeight: 500,
                    color: "#e2e8f0",
                    fontFamily: "Inter, sans-serif",
                  }}
                  className="hidden sm:block"
                >
                  {user.firstName}
                </span>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ opacity: 0.5 }}>
                  <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </div>

              {/* Dropdown Menu */}
              <ul
                tabIndex={-1}
                style={{
                  marginTop: 10,
                  minWidth: 200,
                  background: "rgba(14,10,31,0.95)",
                  backdropFilter: "blur(20px)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 16,
                  padding: 8,
                  boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
                }}
                className="dropdown-content z-[100] menu"
              >
                {[
                  { to: "/profile", label: "✏️  Edit Profile" },
                  { to: "/connections", label: "🤝  Connections" },
                  { to: "/requests", label: "📥  Requests" },
                ].map(({ to, label }) => (
                  <li key={to}>
                    <Link
                      to={to}
                      style={{
                        borderRadius: 10,
                        padding: "9px 14px",
                        fontSize: "0.875rem",
                        fontWeight: 500,
                        color: "rgba(255,255,255,0.75)",
                        fontFamily: "Inter, sans-serif",
                        transition: "all 0.2s ease",
                        display: "block",
                      }}
                    >
                      {label}
                    </Link>
                  </li>
                ))}
                <li>
                  <div
                    style={{
                      margin: "6px 8px 2px",
                      height: 1,
                      background: "rgba(255,255,255,0.07)",
                    }}
                  />
                </li>
                <li>
                  <button
                    onClick={handleLogout}
                    style={{
                      borderRadius: 10,
                      padding: "9px 14px",
                      fontSize: "0.875rem",
                      fontWeight: 500,
                      color: "#fca5a5",
                      fontFamily: "Inter, sans-serif",
                      background: "transparent",
                      border: "none",
                      cursor: "pointer",
                      width: "100%",
                      textAlign: "left",
                      transition: "all 0.2s ease",
                    }}
                    className="hover:bg-red-500/10"
                  >
                    🚪  Logout
                  </button>
                </li>
              </ul>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default NavBar;