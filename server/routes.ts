
import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { geminiService, type ChatMessage, type ChatContext } from "./geminiService";
import { AuthService } from "./auth";
import { authenticateToken, requireRole, type AuthenticatedRequest } from "./middleware";
import { initializeDatabase } from "./database";

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize database on startup
  await initializeDatabase();

  // Authentication routes
  app.post('/api/auth/register', async (req, res) => {
    try {
      const { username, email, password, name, role = "user" } = req.body;

      if (!username || !email || !password || !name) {
        return res.status(400).json({ error: 'All fields are required' });
      }

      const result = await AuthService.register({
        username,
        email,
        password,
        name,
        role
      });

      if (!result.success) {
        return res.status(400).json({ error: result.message });
      }

      res.json({
        success: true,
        user: result.user,
        token: result.token
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ error: 'Registration failed' });
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }

      const result = await AuthService.login(email, password);

      if (!result.success) {
        return res.status(401).json({ error: result.message });
      }

      res.json({
        success: true,
        user: result.user,
        token: result.token
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Login failed' });
    }
  });

  app.get('/api/auth/me', authenticateToken, async (req: AuthenticatedRequest, res) => {
    res.json({
      success: true,
      user: req.user
    });
  });

  app.post('/api/auth/logout', authenticateToken, async (req, res) => {
    // For JWT, logout is handled client-side by removing the token
    res.json({ success: true, message: 'Logged out successfully' });
  });

  // Protected user routes
  app.get('/api/users/profile', authenticateToken, async (req: AuthenticatedRequest, res) => {
    res.json({
      success: true,
      user: req.user
    });
  });

  app.put('/api/users/profile', authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const { name, username } = req.body;
      const userId = req.user!.id;

      const updatedUser = await storage.updateUser(userId, {
        name,
        username,
        updatedAt: new Date()
      });

      if (!updatedUser) {
        return res.status(404).json({ error: 'User not found' });
      }

      const { password, ...userWithoutPassword } = updatedUser;
      res.json({
        success: true,
        user: userWithoutPassword
      });
    } catch (error) {
      console.error('Profile update error:', error);
      res.status(500).json({ error: 'Profile update failed' });
    }
  });

  // Admin routes
  app.get('/api/admin/users', authenticateToken, requireRole('admin'), async (req, res) => {
    try {
      // This would need to be implemented in storage
      res.json({
        success: true,
        users: [],
        message: 'Admin users endpoint - implement as needed'
      });
    } catch (error) {
      console.error('Admin users error:', error);
      res.status(500).json({ error: 'Failed to fetch users' });
    }
  });

  // Chat API endpoint - now requires authentication
  app.post('/api/chat', authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const { message, currentPage, conversationHistory = [] } = req.body;

      if (!message || typeof message !== 'string') {
        return res.status(400).json({ error: 'Message is required' });
      }

      const context: ChatContext = {
        currentPage: currentPage || 'home',
        conversationHistory: conversationHistory as ChatMessage[],
        user: req.user // Add user context to chat
      };

      const response = await geminiService.generateResponse(message, context);
      
      // Check if response is structured data
      let responseData;
      try {
        responseData = JSON.parse(response);
        // If parsing succeeds, it's structured data
        res.json({
          success: true,
          response: responseData.content,
          structuredData: responseData.structuredData
        });
      } catch {
        // If parsing fails, it's plain text
        res.json({
          success: true,
          response: response
        });
      }

    } catch (error) {
      console.error('Chat API error:', error);
      res.status(500).json({ 
        error: 'Failed to generate response',
        message: 'Our AI assistant is temporarily unavailable. Please try again in a moment.'
      });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
