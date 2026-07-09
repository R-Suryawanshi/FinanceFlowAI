
import { Request, Response, NextFunction } from "express";
import { AuthService } from "./auth";

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    username: string;
    email: string;
    name: string;
    role: string;
    isActive: boolean;
  };
}

export async function authenticateToken(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: "Access token required" });
  }

  const decoded = AuthService.verifyToken(token);
  if (!decoded) {
    return res.status(403).json({ error: "Invalid or expired token" });
  }

  const user = await AuthService.getUserById(decoded.userId);
  if (!user) {
    return res.status(403).json({ error: "User not found" });
  }

  req.user = user;
  next();
}

export function requireRole(role: string) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    if (req.user.role !== role) {
      return res.status(403).json({ error: "Insufficient permissions" });
    }

    next();
  };
}
