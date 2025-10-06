import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "mindx-dev-secret-change-me";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "24h";

// Extended Request interface to include user
export interface AuthRequest extends Request {
  user?: {
    email: string;
    name: string;
    iat?: number;
    exp?: number;
  };
}

// JWT authentication middleware
export const authenticateJWT = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers["authorization"];

  if (!authHeader) {
    return res.status(401).json({
      error: "Access denied",
      message: "No authorization token provided",
    });
  }

  const token = authHeader.split(" ")[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      error: "Access denied",
      message: "Invalid token format. Use: Bearer <token>",
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      email: string;
      name: string;
    };
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({
      error: "Invalid token",
      message:
        error instanceof Error ? error.message : "Token verification failed",
    });
  }
};

// Generate JWT token helper function
export const generateToken = (payload: {
  email: string;
  name: string;
}): string => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  } as jwt.SignOptions);
};

// Optional authentication (for routes that work with or without auth)
export const optionalAuth = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers["authorization"];

  if (!authHeader) {
    next();
    return;
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      email: string;
      name: string;
    };
    req.user = decoded;
  } catch (error) {
    // Token invalid but continue anyway
    console.log("Invalid token in optional auth:", error);
  }

  next();
};

// Rate limiting placeholder
export const rateLimiter = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // TODO: Implement proper rate limiting with Redis
  res.setHeader("X-RateLimit-Limit", "100");
  res.setHeader("X-RateLimit-Remaining", "99");
  next();
};
