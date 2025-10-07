import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { useAuth } from "./contexts/useAuth";
import { Login } from "./components/Login";
import { Register } from "./components/Register";
import { Dashboard } from "./components/Dashboard";
import { Profile } from "./components/Profile";
import { Settings } from "./components/Settings";
import { OpenIDCallback } from "./components/OpenIDCallback";
import { Navigation } from "./components/Navigation";
import "./App.css";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="container">
        <div className="card">
          <h2>🔄 Loading...</h2>
          <p>Checking authentication status...</p>
        </div>
      </div>
    );
  }

  return isAuthenticated ? (
    <>
      <Navigation />
      {children}
    </>
  ) : (
    <Navigate to="/login" replace />
  );
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="container">
        <div className="card">
          <h2>🔄 Loading...</h2>
          <p>Checking authentication status...</p>
        </div>
      </div>
    );
  }

  return isAuthenticated ? <Navigate to="/" replace /> : <>{children}</>;
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            }
          />

          {/* OpenID Callback Route */}
          <Route path="/auth/callback" element={<OpenIDCallback />} />

          {/* Protected Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            }
          />

          {/* Fallback - redirect to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
