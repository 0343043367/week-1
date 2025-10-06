import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/useAuth";
import "./Auth.css";

interface LoginProps {
  onSwitchToRegister?: () => void;
}

export const Login = ({ onSwitchToRegister }: LoginProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, loginWithOpenID } = useAuth();

  // Reset loading state whenever location changes (e.g., when user navigates back)
  useEffect(() => {
    setLoading(false);
  }, [location]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(email, password);
      // Success - user will be redirected automatically
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenIDLogin = async () => {
    setLoading(true);
    try {
      await loginWithOpenID();
    } catch (err) {
      setError(err instanceof Error ? err.message : "OpenID login failed");
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>🔐 Login</h2>
        <p className="auth-subtitle">Welcome back to MindX Week 1</p>

        {error && <div className="error-message">❌ {error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              disabled={loading}
              minLength={6}
            />
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? "🔄 Logging in..." : "🚀 Login"}
          </button>
        </form>

        <div className="divider">
          <span>OR</span>
        </div>

        <button
          type="button"
          className="btn-openid"
          onClick={handleOpenIDLogin}
          disabled={loading}
        >
          {loading ? "🔄 Redirecting..." : "🎓 Login with MindX ID"}
        </button>

        <div className="auth-switch">
          Don't have an account?{" "}
          <button
            onClick={() =>
              onSwitchToRegister ? onSwitchToRegister() : navigate("/register")
            }
            className="link-button"
            disabled={loading}
          >
            Register here
          </button>
        </div>
      </div>
    </div>
  );
};
