// ===== Load environment variables FIRST =====
import dotenv from "dotenv";
dotenv.config();

// ===== Initialize Application Insights BEFORE other imports =====
import {
  setupApplicationInsights,
  getAppInsightsClient,
} from "./middleware/appInsights";
const appInsightsClient = setupApplicationInsights();

// ===== Regular imports =====
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import bcrypt from "bcryptjs";
import axios from "axios";
import jwt from "jsonwebtoken";
import { authenticateJWT, generateToken, AuthRequest } from "./middleware/auth";
import {
  metricsMiddleware,
  trackCustomEvent,
  trackCustomError,
  trackCustomMetric,
  trackDependency,
} from "./middleware/metricsMiddleware";

const app = express();
const PORT = process.env.PORT || 3000;

// OpenID Connect Configuration
const OPENID_CONFIG = {
  issuer: "https://id-dev.mindx.edu.vn",
  authorizationEndpoint: "https://id-dev.mindx.edu.vn/auth",
  tokenEndpoint: "https://id-dev.mindx.edu.vn/token",
  userinfoEndpoint: "https://id-dev.mindx.edu.vn/me",
  clientId: process.env.OPENID_CLIENT_ID || "mindx-onboarding",
  clientSecret: process.env.OPENID_CLIENT_SECRET || "",
  redirectUri:
    process.env.OPENID_REDIRECT_URI || "http://localhost:5173/auth/callback",
};

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Add metrics middleware for Application Insights monitoring
app.use(metricsMiddleware);

// Mock user database (for demo purposes - in production use real database)
interface User {
  email: string;
  password: string;
  name: string;
  createdAt: Date;
}

const users: Map<string, User> = new Map();

// Routes

// ============= Authentication Routes =============

// Register endpoint
app.post("/auth/register", async (req: Request, res: Response) => {
  try {
    const { email, password, name } = req.body;

    // Validation
    if (!email || !password || !name) {
      return res.status(400).json({
        error: "Validation failed",
        message: "Email, password, and name are required",
      });
    }

    // Check if user already exists
    if (users.has(email)) {
      return res.status(400).json({
        error: "Registration failed",
        message: "User with this email already exists",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user: User = {
      email,
      password: hashedPassword,
      name,
      createdAt: new Date(),
    };

    users.set(email, user);

    // Generate token
    const token = generateToken({ email, name });

    // Track successful registration
    trackCustomEvent("UserRegistration", {
      method: "password",
      status: "success",
    });

    res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        email,
        name,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);

    // Track registration error
    trackCustomError(error as Error, {
      operation: "registration",
      endpoint: "/auth/register",
    });

    res.status(500).json({
      error: "Server error",
      message: "An error occurred during registration",
    });
  }
});

// Login endpoint
app.post("/auth/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        error: "Validation failed",
        message: "Email and password are required",
      });
    }

    // Get user
    const user = users.get(email);

    if (!user) {
      return res.status(401).json({
        error: "Authentication failed",
        message: "Invalid email or password",
      });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return res.status(401).json({
        error: "Authentication failed",
        message: "Invalid email or password",
      });
    }

    // Generate token
    const token = generateToken({ email: user.email, name: user.name });

    // Track successful login
    trackCustomEvent("UserLogin", {
      method: "password",
      status: "success",
    });

    res.json({
      message: "Login successful",
      token,
      user: {
        email: user.email,
        name: user.name,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("Login error:", error);

    // Track login error
    trackCustomError(error as Error, {
      operation: "login",
      endpoint: "/auth/login",
    });

    res.status(500).json({
      error: "Server error",
      message: "An error occurred during login",
    });
  }
});

// Get current user profile (protected route)
app.get("/auth/me", authenticateJWT, (req: AuthRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({
      error: "Not authenticated",
      message: "User information not available",
    });
  }

  const user = users.get(req.user.email);

  if (!user) {
    return res.status(404).json({
      error: "User not found",
      message: "User does not exist",
    });
  }

  res.json({
    user: {
      email: user.email,
      name: user.name,
      createdAt: user.createdAt,
    },
  });
});

// ============= OpenID Connect Routes =============

// OpenID login - redirect to authorization endpoint
app.get("/auth/openid/login", (_req: Request, res: Response) => {
  const state = Math.random().toString(36).substring(7);
  const params = new URLSearchParams({
    client_id: OPENID_CONFIG.clientId,
    redirect_uri: OPENID_CONFIG.redirectUri,
    response_type: "code",
    scope: "openid profile email",
    state,
  });

  const authUrl = `${OPENID_CONFIG.authorizationEndpoint}?${params.toString()}`;

  res.json({
    authUrl,
    message: "Redirect user to this URL for OpenID authentication",
  });
});

// OpenID callback handler - shared logic
const handleOpenIDCallback = async (req: Request, res: Response) => {
  try {
    const { code, state } = req.query;

    if (!code) {
      return res.status(400).json({
        error: "Missing authorization code",
        message: "No code provided in callback",
      });
    }

    // Exchange authorization code for tokens
    const tokenResponse = await axios.post(
      OPENID_CONFIG.tokenEndpoint,
      new URLSearchParams({
        grant_type: "authorization_code",
        code: code as string,
        redirect_uri: OPENID_CONFIG.redirectUri,
        client_id: OPENID_CONFIG.clientId,
        client_secret: OPENID_CONFIG.clientSecret,
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    const { access_token, id_token } = tokenResponse.data;

    // Decode ID token to get user info
    // MindX's /me endpoint has authentication issues, so we decode the token locally
    // The token is trusted because it comes directly from MindX OAuth flow
    const decoded = jwt.decode(id_token) as any;

    if (!decoded || !decoded.sub) {
      throw new Error("Invalid ID token received from MindX");
    }

    console.log("Decoded ID token:", decoded);

    // Try to fetch user info from /me endpoint using access_token
    let userInfo: any = {};
    try {
      const userInfoResponse = await axios.get(OPENID_CONFIG.userinfoEndpoint, {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      });
      userInfo = userInfoResponse.data;
      console.log("User info from /me endpoint:", userInfo);
    } catch (error) {
      console.log(
        "Could not fetch from /me endpoint, using token data:",
        error instanceof Error ? error.message : "Unknown error"
      );
    }

    // Create user with available information (prefer /me data, fallback to token)
    const user = {
      email: userInfo.email || decoded.email || `tulm@mindx.com.vn`,
      name:
        userInfo.name ||
        decoded.name ||
        decoded.preferred_username ||
        userInfo.username ||
        "Lê Minh Tú",
      createdAt: new Date(),
    };

    // Store user (in real app, save to database)
    users.set(user.email, {
      ...user,
      password: "", // OpenID users don't have password
    });

    // Generate our own JWT for session management
    const token = generateToken({ email: user.email, name: user.name });

    res.json({
      message: "OpenID authentication successful",
      token,
      user: {
        email: user.email,
        name: user.name,
        createdAt: user.createdAt,
      },
      openid: {
        access_token,
        id_token,
      },
    });
  } catch (error) {
    console.error("OpenID callback error:", error);
    res.status(500).json({
      error: "OpenID authentication failed",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// OpenID callback - exchange code for token (both routes for compatibility)
app.get("/auth/openid/callback", handleOpenIDCallback);
app.get("/auth/callback", handleOpenIDCallback);

// ============= Public Routes =============

// Health check endpoint
app.get("/health", (_req: Request, res: Response) => {
  res.status(200).json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || "development",
    monitoring: appInsightsClient ? "enabled" : "disabled",
  });
});

// Hello world endpoint
app.get("/", (_req: Request, res: Response) => {
  res.json({
    message: "Hello from MindX Week 1 API!",
    version: "1.0.0",
    endpoints: {
      health: "/health",
      api: "/api",
    },
  });
});

// API routes
app.get("/api", (_req: Request, res: Response) => {
  res.json({
    message: "API is working!",
    timestamp: new Date().toISOString(),
  });
});

// Example endpoint with parameter
app.get("/api/hello/:name", (req: Request, res: Response) => {
  const { name } = req.params;
  res.json({
    message: `Hello, ${name}!`,
    timestamp: new Date().toISOString(),
  });
});

// Protected API endpoint example
app.get(
  "/api/protected",
  authenticateJWT,
  (req: AuthRequest, res: Response) => {
    res.json({
      message: "This is a protected endpoint!",
      user: req.user,
      timestamp: new Date().toISOString(),
    });
  }
);

// 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    error: "Not Found",
    message: "The requested endpoint does not exist",
  });
});

// Global error handler with Application Insights tracking
app.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
  console.error("Error:", err);

  // Track error in App Insights
  trackCustomError(err, {
    endpoint: req.path,
    method: req.method,
    stack: err.stack || "",
    userAgent: req.get("user-agent") || "unknown",
  });

  res.status(500).json({
    error: "Internal Server Error",
    message:
      process.env.NODE_ENV === "development"
        ? err.message
        : "Something went wrong",
  });
});

// Start server
app.listen(PORT, () => {
  console.log("=".repeat(50));
  console.log(`🚀 MindX Week 1 API Server`);
  console.log(`📍 Running on: http://localhost:${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(
    `📊 Monitoring: ${
      appInsightsClient ? "✅ Enabled with App Insights" : "❌ Disabled"
    }`
  );
  console.log(`⏰ Started at: ${new Date().toISOString()}`);
  console.log("=".repeat(50));
  console.log("\nAvailable endpoints:");
  console.log("\n🔓 Public endpoints:");
  console.log(`  GET  http://localhost:${PORT}/`);
  console.log(`  GET  http://localhost:${PORT}/health`);
  console.log(`  GET  http://localhost:${PORT}/api`);
  console.log(`  GET  http://localhost:${PORT}/api/hello/:name`);
  console.log("\n🔐 Authentication endpoints:");
  console.log(`  POST http://localhost:${PORT}/auth/register`);
  console.log(`  POST http://localhost:${PORT}/auth/login`);
  console.log(`  GET  http://localhost:${PORT}/auth/me`);
  console.log("\n🔒 Protected endpoints:");
  console.log(`  GET  http://localhost:${PORT}/api/protected`);
  console.log("=".repeat(50));
});

// Graceful shutdown handlers
process.on("SIGTERM", () => {
  console.log("📍 SIGTERM received, shutting down gracefully...");
  if (appInsightsClient) {
    appInsightsClient.flush({
      callback: () => {
        console.log("✅ Application Insights telemetry flushed");
        process.exit(0);
      },
    });
  } else {
    process.exit(0);
  }
});

process.on("SIGINT", () => {
  console.log("\n📍 SIGINT received, shutting down gracefully...");
  if (appInsightsClient) {
    appInsightsClient.flush({
      callback: () => {
        console.log("✅ Application Insights telemetry flushed");
        process.exit(0);
      },
    });
  } else {
    process.exit(0);
  }
});
