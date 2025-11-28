import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { AuthService } from "./auth";
import { authenticateToken, requireRole, type AuthenticatedRequest } from "./middleware";
import { initializeDatabase } from "./database";
import { openaiService } from "./openaiService";

export async function registerRoutes(app: Express): Promise<Server> {
  await initializeDatabase();

  // -------------------------
  // Auth: REGISTER
  // -------------------------
  app.post('/api/auth/register', async (req, res) => {
    try {
      const { username, email, password, name, role = "user" } = req.body;

      if (!username || !email || !password || !name) {
        return res.status(400).json({ success: false, error: "All fields are required" });
      }

      const result = await AuthService.register({
        username,
        email,
        password,
        name,
        role,
      });

      if (!result.success) {
        return res.status(400).json({ success: false, error: result.error });
      }

      return res.json({
        success: true,
        user: result.user,
        token: result.token,
      });
    } catch (error) {
      console.error("Registration error:", error);
      return res.status(500).json({ success: false, error: "Registration failed" });
    }
  });

  // -------------------------
  // Auth: LOGIN
  // -------------------------
  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ success: false, error: "Email and password are required" });
      }

      const result = await AuthService.login(email, password);

      if (!result.success) {
        return res.status(401).json({ success: false, error: result.error });
      }

      return res.json({
        success: true,
        user: result.user,
        token: result.token,
      });
    } catch (error) {
      console.error("Login error:", error);
      return res.status(500).json({ success: false, error: "Login failed" });
    }
  });

  // -------------------------
  // Auth: ME
  // -------------------------
  app.get('/api/auth/me', authenticateToken, async (req: AuthenticatedRequest, res) => {
    return res.json({ success: true, user: req.user });
  });

  // -------------------------
  // LOGOUT
  // -------------------------
  app.post('/api/auth/logout', authenticateToken, async (_req, res) => {
    return res.json({ success: true, message: "Logged out successfully" });
  });

  // -------------------------
  // PROFILE
  // -------------------------
  app.get('/api/profile', authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const profile = await storage.getUserProfile(req.user!.id);
      return res.json({ success: true, profile });
    } catch (error) {
      console.error("Profile fetch error:", error);
      return res.status(500).json({ success: false, error: "Failed to fetch profile" });
    }
  });

  app.post('/api/profile', authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const profileData = { ...req.body, userId: req.user!.id };

      let profile = await storage.getUserProfile(req.user!.id);
      if (profile) {
        profile = await storage.updateUserProfile(req.user!.id, req.body);
      } else {
        profile = await storage.createUserProfile(profileData);
      }

      return res.json({ success: true, profile });
    } catch (error) {
      console.error("Profile update error:", error);
      return res.status(500).json({ success: false, error: "Failed to update profile" });
    }
  });

  // -------------------------
  // SERVICES
  // -------------------------
  app.get('/api/services', async (_req, res) => {
    try {
      const services = await storage.getServiceTypes();
      return res.json({ success: true, services });
    } catch (error) {
      console.error("Services fetch error:", error);
      return res.status(500).json({ success: false, error: "Failed to fetch services" });
    }
  });

  app.post('/api/services', authenticateToken, requireRole("admin"), async (req: AuthenticatedRequest, res) => {
    try {
      const service = await storage.createServiceType(req.body);
      return res.json({ success: true, service });
    } catch (error) {
      console.error("Service creation error:", error);
      return res.status(500).json({ success: false, error: "Failed to create service" });
    }
  });

  // -------------------------
  // USER SERVICES
  // -------------------------
  app.get('/api/user-services', authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const services = await storage.getUserServices(req.user!.id);
      return res.json({ success: true, services });
    } catch (error) {
      console.error("User services fetch error:", error);
      return res.status(500).json({ success: false, error: "Failed to fetch user services" });
    }
  });

  app.post('/api/user-services', authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const serviceData = {
        ...req.body,
        userId: req.user!.id,
        outstandingAmount: req.body.amount,
        status: "pending",
      };

      const service = await storage.createUserService(serviceData);

      await storage.createNotification({
        userId: req.user!.id,
        title: "Loan Application Submitted",
        message: `Your ${req.body.serviceType} application for ₹${req.body.amount} has been submitted.`,
        type: "info",
      });

      return res.json({ success: true, service });
    } catch (error) {
      console.error("Service application error:", error);
      return res.status(500).json({ success: false, error: "Failed to submit application" });
    }
  });

  // -------------------------
  // PAYMENTS
  // -------------------------
  app.get('/api/payments', authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const payments = await storage.getUserPayments(req.user!.id);
      return res.json({ success: true, payments });
    } catch (error) {
      console.error("Payments fetch error:", error);
      return res.status(500).json({ success: false, error: "Failed to fetch payments" });
    }
  });

  // -------------------------
  // EMI CALCULATOR
  // -------------------------
  app.post('/api/calculate-emi', async (req, res) => {
    try {
      const { amount, rate, tenure } = req.body;

      if (!amount || !rate || !tenure) {
        return res.status(400).json({
          success: false,
          error: "Amount, rate, and tenure are required",
        });
      }

      const emi = storage.calculateEMI(Number(amount), Number(rate), Number(tenure));
      const totalAmount = emi * tenure;
      const totalInterest = totalAmount - amount;

      return res.json({
        success: true,
        calculation: { emi, totalAmount, totalInterest, principal: amount },
      });
    } catch (error) {
      console.error("EMI calculation error:", error);
      return res.status(500).json({ success: false, error: "Failed to calculate EMI" });
    }
  });

  // -------------------------
  // CHATBOT (OpenAI)
  // -------------------------
  app.post('/api/chat', authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const { message, currentPage, conversationHistory = [] } = req.body;

      if (!message) {
        return res.status(400).json({ success: false, error: "Message is required" });
      }

      const reply = await openaiService.generateResponse(
        message,
        conversationHistory,
        currentPage || "home"
      );

      return res.json({ success: true, response: reply });
    } catch (error) {
      console.error("Chat API error:", error);
      return res.status(500).json({ success: false, error: "Chat failed" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}