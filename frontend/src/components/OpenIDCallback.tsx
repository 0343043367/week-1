import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/useAuth";
import "./Auth.css";

export const OpenIDCallback = () => {
  const navigate = useNavigate();
  const { setAuthData } = useAuth();
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [message, setMessage] = useState("Processing OpenID authentication...");
  const hasProcessed = useRef(false);

  useEffect(() => {
    const handleCallback = async () => {
      // Prevent double execution (React Strict Mode calls useEffect twice)
      if (hasProcessed.current) {
        return;
      }
      hasProcessed.current = true;

      try {
        // Get authorization code from URL (MindX redirected here)
        const params = new URLSearchParams(window.location.search);
        const code = params.get("code");
        const state = params.get("state");

        if (!code) {
          throw new Error("No authorization code received");
        }

        // Exchange code for token via backend
        const API_URL =
          import.meta.env.VITE_API_URL ||
          (window.location.hostname === "localhost"
            ? "http://localhost:3000"
            : "");

        const response = await fetch(
          `${API_URL}/auth/openid/callback?code=${code}&state=${state || ""}`
        );

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || "Authentication failed");
        }

        const data = await response.json();

        // Update AuthContext with token and user data
        setAuthData(data.token, data.user);

        setStatus("success");
        setMessage("Authentication successful! Redirecting...");

        // Redirect to home page after 1 second
        setTimeout(() => {
          navigate("/", { replace: true });
        }, 1000);
      } catch (error) {
        console.error("OpenID callback error:", error);
        setStatus("error");
        setMessage(
          error instanceof Error
            ? error.message
            : "Authentication failed. Please try again."
        );

        // Redirect to login after 3 seconds
        setTimeout(() => {
          window.location.href = "/";
        }, 3000);
      }
    };

    handleCallback();
  }, [navigate, setAuthData]);

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>
          {status === "loading" && "🔄 Processing..."}
          {status === "success" && "✅ Success!"}
          {status === "error" && "❌ Error"}
        </h2>
        <p className="auth-subtitle">{message}</p>

        {status === "loading" && (
          <div
            style={{
              textAlign: "center",
              padding: "2rem 0",
            }}
          >
            <div
              style={{
                width: "50px",
                height: "50px",
                border: "4px solid #f3f3f3",
                borderTop: "4px solid #667eea",
                borderRadius: "50%",
                animation: "spin 1s linear infinite",
                margin: "0 auto",
              }}
            />
          </div>
        )}

        {status === "success" && (
          <div style={{ textAlign: "center", fontSize: "48px" }}>🎉</div>
        )}

        {status === "error" && (
          <div
            style={{
              textAlign: "center",
              padding: "1rem",
              background: "#fee",
              borderRadius: "8px",
              color: "#c33",
            }}
          >
            Please try logging in again
          </div>
        )}
      </div>
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};
