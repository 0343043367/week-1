import { useState, useEffect, useRef, type ReactNode } from "react";
import { AuthContext, type User } from "./AuthContextType";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const isRedirecting = useRef(false);

  // API Base URL - update this to match your backend
  // In production (AKS), use relative path so ingress handles routing
  // In development, use localhost
  const API_URL =
    import.meta.env.VITE_API_URL ||
    (window.location.hostname === "localhost" ? "http://localhost:3000" : ""); // Empty string = same domain, ingress will route /api to backend

  // Load user from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);

    // Reset redirect flag on mount
    return () => {
      isRedirecting.current = false;
    };
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Login failed");
      }

      const data = await response.json();

      setToken(data.token);
      setUser(data.user);

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  const register = async (email: string, password: string, name: string) => {
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password, name }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Registration failed");
      }

      const data = await response.json();

      setToken(data.token);
      setUser(data.user);

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    }
  };

  const loginWithOpenID = async () => {
    // Prevent double execution (React Strict Mode or double clicks)
    if (isRedirecting.current) {
      return;
    }
    isRedirecting.current = true;

    try {
      // Get OpenID authorization URL from backend
      const response = await fetch(`${API_URL}/auth/openid/login`);
      const data = await response.json();

      if (!data.authUrl) {
        throw new Error("Failed to get OpenID authorization URL");
      }

      // Redirect user to MindX OpenID login page
      window.location.href = data.authUrl;
    } catch (error) {
      console.error("OpenID login error:", error);
      isRedirecting.current = false; // Reset on error
      throw error;
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  const setAuthData = (authToken: string, authUser: User) => {
    setToken(authToken);
    setUser(authUser);
    localStorage.setItem("token", authToken);
    localStorage.setItem("user", JSON.stringify(authUser));
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    loginWithOpenID,
    logout,
    setAuthData,
    isAuthenticated: !!token,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
