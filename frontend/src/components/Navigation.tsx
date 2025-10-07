import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/useAuth";
import "./Navigation.css";

export const Navigation = () => {
  const { logout } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="navigation">
      <div className="navigation-container">
        <div className="navigation-links">
          <Link to="/" className="navigation-brand">
            🏠 MindX App
          </Link>
          <Link
            to="/"
            className={`navigation-link ${isActive("/") ? "active" : ""}`}
          >
            Dashboard
          </Link>
          <Link
            to="/profile"
            className={`navigation-link ${
              isActive("/profile") ? "active" : ""
            }`}
          >
            Profile
          </Link>
          <Link
            to="/settings"
            className={`navigation-link ${
              isActive("/settings") ? "active" : ""
            }`}
          >
            Settings
          </Link>
        </div>
        <button onClick={logout} className="navigation-logout">
          🚪 Logout
        </button>
      </div>
    </nav>
  );
};
