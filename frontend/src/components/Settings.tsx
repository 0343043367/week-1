import { useState } from "react";
import { useAuth } from "../contexts/useAuth";
import "./Auth.css";

export const Settings = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<"account" | "security">("account");

  return (
    <div className="container">
      <header>
        <img
          src="https://mindx.edu.vn/logo.svg"
          alt="MindX Logo"
          className="logo"
        />
        <h1>⚙️ Settings</h1>
        <p className="subtitle">Manage your account settings</p>
      </header>

      <div className="card">
        <div
          style={{
            display: "flex",
            gap: "1rem",
            marginBottom: "2rem",
            borderBottom: "2px solid var(--border-color)",
          }}
        >
          <button
            onClick={() => setActiveTab("account")}
            style={{
              background: "none",
              border: "none",
              borderBottom:
                activeTab === "account"
                  ? "3px solid var(--primary-color)"
                  : "none",
              padding: "1rem 1.5rem",
              cursor: "pointer",
              fontWeight: activeTab === "account" ? "700" : "400",
              color:
                activeTab === "account"
                  ? "var(--primary-color)"
                  : "var(--text-secondary)",
              transition: "all 0.2s",
              marginBottom: "-2px",
            }}
          >
            Account
          </button>
          <button
            onClick={() => setActiveTab("security")}
            style={{
              background: "none",
              border: "none",
              borderBottom:
                activeTab === "security"
                  ? "3px solid var(--primary-color)"
                  : "none",
              padding: "1rem 1.5rem",
              cursor: "pointer",
              fontWeight: activeTab === "security" ? "700" : "400",
              color:
                activeTab === "security"
                  ? "var(--primary-color)"
                  : "var(--text-secondary)",
              transition: "all 0.2s",
              marginBottom: "-2px",
            }}
          >
            Security
          </button>
        </div>

        {activeTab === "account" && (
          <div>
            <h2>📝 Account Settings</h2>
            <div className="info-grid" style={{ marginTop: "1.5rem" }}>
              <div className="info-item">
                <span className="label">Display Name:</span>
                <span className="value">{user?.name}</span>
              </div>
              <div className="info-item">
                <span className="label">Email:</span>
                <span className="value">{user?.email}</span>
              </div>
            </div>
            <div
              style={{
                marginTop: "2rem",
                padding: "1rem",
                background: "#f8f9fa",
                borderRadius: "8px",
              }}
            >
              <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
                💡 <strong>Note:</strong> This is a demo application. Account
                editing functionality is not implemented in this version.
              </p>
            </div>
          </div>
        )}

        {activeTab === "security" && (
          <div>
            <h2>🔒 Security Settings</h2>
            <div style={{ marginTop: "1.5rem" }}>
              <div
                style={{
                  padding: "1.5rem",
                  background: "#fff5f5",
                  borderRadius: "8px",
                  border: "1px solid var(--error-color)",
                  marginBottom: "1.5rem",
                }}
              >
                <h3
                  style={{ color: "var(--error-color)", marginBottom: "1rem" }}
                >
                  🚨 Danger Zone
                </h3>
                <p
                  style={{
                    marginBottom: "1rem",
                    color: "var(--text-secondary)",
                  }}
                >
                  Logging out will clear your authentication token and you'll
                  need to login again.
                </p>
                <button onClick={logout} className="btn-logout">
                  🚪 Logout from Account
                </button>
              </div>

              <div
                style={{
                  padding: "1rem",
                  background: "#f8f9fa",
                  borderRadius: "8px",
                }}
              >
                <p
                  style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}
                >
                  💡 <strong>Note:</strong> Password change and 2FA features are
                  not implemented in this demo version.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      <footer>
        <p>
          🚀 MindX Engineer Onboarding - Week 1
          <br />
          <span className="tech-stack">
            Protected Settings Page - React + TypeScript
          </span>
        </p>
      </footer>
    </div>
  );
};
