import { useState } from "react";
import { useAuth } from "../contexts/useAuth";

interface ProtectedData {
  message: string;
  user?: { name: string; email: string };
  timestamp: string;
}

export const Dashboard = () => {
  const { user, token } = useAuth();
  const [apiUrl, setApiUrl] = useState("http://localhost:3000");
  const [protectedData, setProtectedData] = useState<ProtectedData | null>(
    null
  );
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Show test API section only in development or localhost
  const isDevelopment =
    import.meta.env.DEV ||
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1";

  const testProtectedEndpoint = async () => {
    setLoading(true);
    setError("");
    setProtectedData(null);

    try {
      const response = await fetch(`${apiUrl}/api/protected`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to access protected endpoint");
      }

      const data = await response.json();
      setProtectedData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Request failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <header>
        <img
          src="https://mindx.edu.vn/logo.svg"
          alt="MindX Logo"
          className="logo"
        />
        <h1>🎉 Welcome, {user?.name}!</h1>
        <p className="subtitle">You are successfully logged in</p>
      </header>

      <div className="card success">
        <h2>✅ User Profile</h2>
        <div className="info-grid">
          <div className="info-item">
            <span className="label">Name:</span>
            <span className="value">{user?.name}</span>
          </div>
          <div className="info-item">
            <span className="label">Email:</span>
            <span className="value">{user?.email}</span>
          </div>
          <div className="info-item">
            <span className="label">Token:</span>
            <span
              className="value"
              style={{ fontSize: "12px", wordBreak: "break-all" }}
            >
              {token?.substring(0, 50)}...
            </span>
          </div>
        </div>
      </div>

      <div className="card">
        <h2>📊 Quick Actions</h2>
        <p style={{ marginBottom: "1.5rem", color: "var(--text-secondary)" }}>
          Navigate to different sections of the application using the menu
          above, or explore your profile and settings.
        </p>
        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
          <a
            href="/profile"
            style={{
              textDecoration: "none",
              padding: "0.75rem 1.5rem",
              background: "var(--secondary-color)",
              color: "white",
              borderRadius: "8px",
              fontWeight: "600",
              transition: "all 0.2s",
            }}
          >
            👤 View Profile
          </a>
          <a
            href="/settings"
            style={{
              textDecoration: "none",
              padding: "0.75rem 1.5rem",
              background: "var(--secondary-color)",
              color: "white",
              borderRadius: "8px",
              fontWeight: "600",
              transition: "all 0.2s",
            }}
          >
            ⚙️ Settings
          </a>
        </div>
      </div>

      {/* Test API section - only show in development */}
      {isDevelopment && (
        <>
          <div className="card">
            <h2>🔒 Test Protected API (Development Only)</h2>
            <div className="input-group">
              <label htmlFor="apiUrl">API Base URL:</label>
              <input
                id="apiUrl"
                type="text"
                value={apiUrl}
                onChange={(e) => setApiUrl(e.target.value)}
                placeholder="http://localhost:3000"
              />
            </div>
            <button
              onClick={testProtectedEndpoint}
              disabled={loading}
              className="btn-secondary"
            >
              {loading ? "🔄 Testing..." : "🔒 Test Protected Endpoint"}
            </button>
          </div>

          {error && (
            <div className="card error">
              <h3>❌ Error</h3>
              <p>{error}</p>
            </div>
          )}

          {protectedData && (
            <div className="card success">
              <h2>✅ Protected Data Retrieved</h2>
              <div className="info-grid">
                <div className="info-item">
                  <span className="label">Message:</span>
                  <span className="value">{protectedData.message}</span>
                </div>
                <div className="info-item">
                  <span className="label">User from token:</span>
                  <span className="value">{protectedData.user?.name}</span>
                </div>
                <div className="info-item">
                  <span className="label">Timestamp:</span>
                  <span className="value">
                    {new Date(protectedData.timestamp).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      <footer>
        <p>
          🚀 MindX Engineer Onboarding - Week 1 - Step 5 Complete!
          <br />
          <span className="tech-stack">
            React + TypeScript + Custom JWT Authentication
          </span>
        </p>
      </footer>
    </div>
  );
};
