import { useState } from "react";
import { useAuth } from "../contexts/useAuth";

interface ProtectedData {
  message: string;
  user?: { name: string; email: string };
  timestamp: string;
}

export const Dashboard = () => {
  const { user, token, logout } = useAuth();
  const [apiUrl, setApiUrl] = useState("http://localhost:3000");
  const [protectedData, setProtectedData] = useState<ProtectedData | null>(
    null
  );
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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
        <h2>🔒 Test Protected API</h2>
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

      <div className="card">
        <button onClick={logout} className="btn-logout">
          🚪 Logout
        </button>
      </div>

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
