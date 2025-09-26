
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
    res.json({ success: true, message: 'Logged out successfully' });
  });

  // User Profile routes
  app.get('/api/profile', authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const profile = await storage.getUserProfile(req.user!.id);
      res.json({ success: true, profile });
    } catch (error) {
      console.error('Profile fetch error:', error);
      res.status(500).json({ error: 'Failed to fetch profile' });
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

      res.json({ success: true, profile });
    } catch (error) {
      console.error('Profile update error:', error);
      res.status(500).json({ error: 'Failed to update profile' });
    }
  });

  // Service Types routes
  app.get('/api/services', async (req, res) => {
    try {
      const services = await storage.getServiceTypes();
      res.json({ success: true, services });
    } catch (error) {
      console.error('Services fetch error:', error);
      res.status(500).json({ error: 'Failed to fetch services' });
    }
  });

  app.post('/api/services', authenticateToken, requireRole('admin'), async (req: AuthenticatedRequest, res) => {
    try {
      const service = await storage.createServiceType(req.body);
      res.json({ success: true, service });
    } catch (error) {
      console.error('Service creation error:', error);
      res.status(500).json({ error: 'Failed to create service' });
    }
  });

  // User Services routes
  app.get('/api/user-services', authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const services = await storage.getUserServices(req.user!.id);
      res.json({ success: true, services });
    } catch (error) {
      console.error('User services fetch error:', error);
      res.status(500).json({ error: 'Failed to fetch user services' });
    }
  });

  app.post('/api/user-services', authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const serviceData = {
        ...req.body,
        userId: req.user!.id,
        outstandingAmount: req.body.amount,
        status: 'pending'
      };

      const service = await storage.createUserService(serviceData);

      // Create notification
      await storage.createNotification({
        userId: req.user!.id,
        title: 'Loan Application Submitted',
        message: `Your ${req.body.serviceType} application for ₹${req.body.amount} has been submitted successfully.`,
        type: 'info'
      });

      res.json({ success: true, service });
    } catch (error) {
      console.error('Service application error:', error);
      res.status(500).json({ error: 'Failed to submit application' });
    }
  });

  // Admin routes for managing user services
  app.get('/api/admin/user-services', authenticateToken, requireRole('admin'), async (req, res) => {
    try {
      const services = await storage.getAllUserServices();
      res.json({ success: true, services });
    } catch (error) {
      console.error('Admin services fetch error:', error);
      res.status(500).json({ error: 'Failed to fetch services' });
    }
  });

  app.put('/api/admin/user-services/:id', authenticateToken, requireRole('admin'), async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;

      // If status is being changed to approved, generate EMI schedule
      if (updates.status === 'approved' && req.body.generateSchedule) {
        const service = await storage.updateUserService(id, updates);
        
        if (service && service.amount && service.interestRate && service.tenure) {
          const schedule = storage.generateEmiSchedule(
            service.id,
            Number(service.amount),
            Number(service.interestRate),
            service.tenure,
            new Date()
          );
          
          await storage.createEmiSchedule(schedule);
        }
      } else {
        await storage.updateUserService(id, updates);
      }

      res.json({ success: true, message: 'Service updated successfully' });
    } catch (error) {
      console.error('Service update error:', error);
      res.status(500).json({ error: 'Failed to update service' });
    }
  });

  // EMI Calculator routes
  app.post('/api/calculate-emi', async (req, res) => {
    try {
      const { amount, rate, tenure } = req.body;
      
      if (!amount || !rate || !tenure) {
        return res.status(400).json({ error: 'Amount, rate, and tenure are required' });
      }

      const emi = storage.calculateEMI(Number(amount), Number(rate), Number(tenure));
      const totalAmount = emi * Number(tenure);
      const totalInterest = totalAmount - Number(amount);

      res.json({
        success: true,
        calculation: {
          emi,
          totalAmount,
          totalInterest,
          principal: Number(amount)
        }
      });
    } catch (error) {
      console.error('EMI calculation error:', error);
      res.status(500).json({ error: 'Failed to calculate EMI' });
    }
  });

  // EMI Schedule routes
  app.get('/api/emi-schedule/:serviceId', authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const { serviceId } = req.params;
      const schedule = await storage.getEmiSchedule(serviceId);
      res.json({ success: true, schedule });
    } catch (error) {
      console.error('EMI schedule fetch error:', error);
      res.status(500).json({ error: 'Failed to fetch EMI schedule' });
    }
  });

  // Payment routes
  app.get('/api/payments', authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const payments = await storage.getUserPayments(req.user!.id);
      res.json({ success: true, payments });
    } catch (error) {
      console.error('Payments fetch error:', error);
      res.status(500).json({ error: 'Failed to fetch payments' });
    }
  });

  app.post('/api/payments', authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const paymentData = {
        ...req.body,
        paymentDate: new Date(),
        status: 'success' // In real implementation, this would be pending until payment gateway confirmation
      };

      const payment = await storage.createPayment(paymentData);

      // Create notification
      await storage.createNotification({
        userId: req.user!.id,
        title: 'Payment Successful',
        message: `Your payment of ₹${req.body.amount} has been processed successfully.`,
        type: 'success'
      });

      res.json({ success: true, payment });
    } catch (error) {
      console.error('Payment creation error:', error);
      res.status(500).json({ error: 'Failed to process payment' });
    }
  });

  // Gold rates routes
  app.get('/api/gold-rates', async (req, res) => {
    try {
      const rates = await storage.getCurrentGoldRates();
      res.json({ success: true, rates });
    } catch (error) {
      console.error('Gold rates fetch error:', error);
      res.status(500).json({ error: 'Failed to fetch gold rates' });
    }
  });

  app.post('/api/gold-rates', authenticateToken, requireRole('admin'), async (req, res) => {
    try {
      const rate = await storage.createGoldRate(req.body);
      res.json({ success: true, rate });
    } catch (error) {
      console.error('Gold rate creation error:', error);
      res.status(500).json({ error: 'Failed to create gold rate' });
    }
  });

  // Interest rates routes
  app.get('/api/interest-rates', async (req, res) => {
    try {
      const { serviceTypeId } = req.query;
      const rates = await storage.getInterestRates(serviceTypeId as string);
      res.json({ success: true, rates });
    } catch (error) {
      console.error('Interest rates fetch error:', error);
      res.status(500).json({ error: 'Failed to fetch interest rates' });
    }
  });

  // Notifications routes
  app.get('/api/notifications', authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const notifications = await storage.getUserNotifications(req.user!.id);
      res.json({ success: true, notifications });
    } catch (error) {
      console.error('Notifications fetch error:', error);
      res.status(500).json({ error: 'Failed to fetch notifications' });
    }
  });

  app.put('/api/notifications/:id/read', authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.markNotificationAsRead(id);
      res.json({ success: true, message: 'Notification marked as read' });
    } catch (error) {
      console.error('Notification update error:', error);
      res.status(500).json({ error: 'Failed to update notification' });
    }
  });

  // Dashboard analytics
  app.get('/api/dashboard/stats', authenticateToken, requireRole('admin'), async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json({ success: true, stats });
    } catch (error) {
      console.error('Dashboard stats error:', error);
      res.status(500).json({ error: 'Failed to fetch dashboard stats' });
    }
  });

  // Document routes
  app.get('/api/documents', authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const documents = await storage.getUserDocuments(req.user!.id);
      res.json({ success: true, documents });
    } catch (error) {
      console.error('Documents fetch error:', error);
      res.status(500).json({ error: 'Failed to fetch documents' });
    }
  });

  app.post('/api/documents', authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const documentData = {
        ...req.body,
        userId: req.user!.id,
        fileUrl: req.body.fileUrl || `/uploads/${req.body.fileName}` // In real implementation, handle file upload
      };

      const document = await storage.createDocument(documentData);
      res.json({ success: true, document });
    } catch (error) {
      console.error('Document upload error:', error);
      res.status(500).json({ error: 'Failed to upload document' });
    }
  });

  // Chat API endpoint
  app.post('/api/chat', authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const { message, currentPage, conversationHistory = [] } = req.body;

      if (!message || typeof message !== 'string') {
        return res.status(400).json({ error: 'Message is required' });
      }

      const context: ChatContext = {
        currentPage: currentPage || 'home',
        conversationHistory: conversationHistory as ChatMessage[],
        user: req.user
      };

      const response = await geminiService.generateResponse(message, context);
      
      try {
        const responseData = JSON.parse(response);
        res.json({
          success: true,
          response: responseData.content,
          structuredData: responseData.structuredData
        });
      } catch {
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
