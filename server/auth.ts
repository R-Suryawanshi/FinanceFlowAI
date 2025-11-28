import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { eq } from "drizzle-orm";
import { db } from "./database";
import { users, type User, type InsertUser } from "@shared/schema";

const JWT_SECRET = process.env.JWT_SECRET || "your-fallback-secret-key";
const JWT_EXPIRES_IN = "7d";

export interface AuthResponse {
  success: boolean;
  user?: Omit<User, "password">;
  token?: string;
  message?: string;
  error?: string; // added so frontend can read `result.error`
}

export class AuthService {
  static async hashPassword(password: string): Promise<string> {
    const saltRounds = 12;
    return bcrypt.hash(password, saltRounds);
  }

  static async comparePassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  static generateToken(userId: string): string {
    return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
  }

  static verifyToken(token: string): { userId: string } | null {
    try {
      return jwt.verify(token, JWT_SECRET) as { userId: string };
    } catch {
      return null;
    }
  }

  static async register(userData: Omit<InsertUser, "id" | "createdAt" | "updatedAt">): Promise<AuthResponse> {
    try {
      // Check if user already exists
      const existing = await db.select()
        .from(users)
        .where(eq(users.email, userData.email))
        .limit(1);

      if (existing && existing.length > 0) {
        return { success: false, error: "User already exists" };
      }

      // Hash password
      const hashedPassword = await this.hashPassword(userData.password);

      // Create user
      const inserted = await db.insert(users)
        .values({
          ...userData,
          password: hashedPassword,
        })
        .returning();

      const newUser = Array.isArray(inserted) ? inserted[0] : inserted;

      if (!newUser) {
        return { success: false, error: "Failed to create user" };
      }

      const { password, ...userWithoutPassword } = newUser as User;
      const token = this.generateToken((newUser as User).id);

      return {
        success: true,
        user: userWithoutPassword,
        token,
      };
    } catch (error) {
      console.error("Registration error:", error);
      return { success: false, error: "Registration failed" };
    }
  }

  static async login(email: string, password: string): Promise<AuthResponse> {
    try {
      // Find user by email
      const found = await db.select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);

      const user = Array.isArray(found) ? found[0] : found;

      if (!user) {
        return { success: false, error: "Invalid credentials" };
      }

      // Check password
      const isValidPassword = await this.comparePassword(password, user.password);
      if (!isValidPassword) {
        return { success: false, error: "Invalid credentials" };
      }

      // Check if user is active
      if (!user.isActive) {
        return { success: false, error: "Account is deactivated" };
      }

      // Remove password from response
      const { password: _, ...userWithoutPassword } = user as User;
      const token = this.generateToken((user as User).id);

      return {
        success: true,
        user: userWithoutPassword,
        token,
      };
    } catch (error) {
      console.error("Login error:", error);
      return { success: false, error: "Login failed" };
    }
  }

  static async getUserById(id: string): Promise<Omit<User, "password"> | null> {
    try {
      const found = await db.select()
        .from(users)
        .where(eq(users.id, id))
        .limit(1);

      const user = Array.isArray(found) ? found[0] : found;

      if (!user) return null;

      const { password, ...userWithoutPassword } = user as User;
      return userWithoutPassword;
    } catch (error) {
      console.error("Get user error:", error);
      return null;
    }
  }
}