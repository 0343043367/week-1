import { useAuth } from "../contexts/useAuth";
import "./Auth.css";

export const Profile = () => {
  const { user, token } = useAuth();

  return (
    <div className="container">
      <header>
        <img
          src="https://mindx.edu.vn/logo.svg"
          alt="MindX Logo"
          className="logo"
        />
        <h1>👤 User Profile</h1>
        <p className="subtitle">Your account information</p>
      </header>

      <div className="card success">
        <h2>📋 Profile Details</h2>
        <div className="info-grid">
          <div className="info-item">
            <span className="label">Full Name:</span>
            <span className="value">{user?.name || "N/A"}</span>
          </div>
          <div className="info-item">
            <span className="label">Email Address:</span>
            <span className="value">{user?.email || "N/A"}</span>
          </div>
          <div className="info-item">
            <span className="label">Account Created:</span>
            <span className="value">
              {user?.createdAt
                ? new Date(user.createdAt).toLocaleDateString("vi-VN")
                : "N/A"}
            </span>
          </div>
        </div>
      </div>

      <div className="card">
        <h2>🔐 Authentication Token</h2>
        <div className="info-item">
          <span className="label">JWT Token (first 100 characters):</span>
          <div
            style={{
              background: "#f4f4f4",
              padding: "1rem",
              borderRadius: "8px",
              marginTop: "0.5rem",
              wordBreak: "break-all",
              fontSize: "0.85rem",
              fontFamily: "monospace",
            }}
          >
            {token?.substring(0, 100)}...
          </div>
        </div>
        <p
          style={{
            marginTop: "1rem",
            color: "var(--text-secondary)",
            fontSize: "0.9rem",
          }}
        >
          This token is used to authenticate API requests
        </p>
      </div>

      <div className="card">
        <h2>ℹ️ Account Information</h2>
        <p style={{ lineHeight: "1.8", color: "var(--text-secondary)" }}>
          This is your protected profile page. Only authenticated users can
          access this page. Your authentication token is stored securely in
          localStorage and sent with every API request to protected endpoints.
        </p>
      </div>

      <footer>
        <p>
          🚀 MindX Engineer Onboarding - Week 1
          <br />
          <span className="tech-stack">
            Protected Route Example - React + TypeScript
          </span>
        </p>
      </footer>
    </div>
  );
};
