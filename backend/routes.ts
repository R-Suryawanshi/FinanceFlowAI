import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { AuthService } from "./auth";
import { authenticateToken, requireRole, type AuthenticatedRequest } from "./middleware";
import { initializeDatabase } from "./database";
import { openaiService } from "./openAIService";

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
      if (!profile) {
        return res.json({ success: true, profile: null });
      }

      // Return both snake_case and camelCase keys for frontend/Drizzle compatibility
      const responseProfile = {
        ...profile,
        phone_number: profile.phoneNumber,
        date_of_birth: profile.dateOfBirth,
        marital_status: profile.maritalStatus,
        company_name: profile.companyName,
        monthly_income: profile.monthlyIncome,
        credit_score: profile.creditScore,
        pan_number: profile.panNumber,
        aadhar_number: profile.aadharNumber,
        bank_name: profile.bankName,
        account_number: profile.accountNumber,
        ifsc_code: profile.ifscCode,
        account_holder_name: profile.accountHolderName,
        account_type: profile.accountType,
      };

      return res.json({ success: true, profile: responseProfile });
    } catch (error) {
      console.error("Profile fetch error:", error);
      return res.status(500).json({ success: false, error: "Failed to fetch profile" });
    }
  });

  app.post('/api/profile', authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const incoming = req.body;

      // Unify input formats (supporting both snake_case and camelCase inputs)
      const profileData: any = {
        userId: req.user!.id,
        phoneNumber: incoming.phone_number !== undefined ? incoming.phone_number : incoming.phoneNumber,
        gender: incoming.gender,
        maritalStatus: incoming.marital_status !== undefined ? incoming.marital_status : incoming.maritalStatus,
        address: incoming.address,
        city: incoming.city,
        state: incoming.state,
        pincode: incoming.pincode,
        occupation: incoming.occupation,
        companyName: incoming.company_name !== undefined ? incoming.company_name : incoming.companyName,
        creditScore: incoming.credit_score !== undefined ? incoming.credit_score : (incoming.creditScore !== undefined ? incoming.creditScore : 720),
        panNumber: incoming.pan_number !== undefined ? incoming.pan_number : incoming.panNumber,
        aadharNumber: incoming.aadhar_number !== undefined ? incoming.aadhar_number : incoming.aadharNumber,
        bankName: incoming.bank_name !== undefined ? incoming.bank_name : incoming.bankName,
        accountNumber: incoming.account_number !== undefined ? incoming.account_number : incoming.accountNumber,
        ifscCode: incoming.ifsc_code !== undefined ? incoming.ifsc_code : incoming.ifscCode,
        accountHolderName: incoming.account_holder_name !== undefined ? incoming.account_holder_name : incoming.accountHolderName,
        accountType: incoming.account_type !== undefined ? incoming.account_type : incoming.accountType,
      };

      // Safely parse dateOfBirth/date_of_birth
      const rawDOB = incoming.date_of_birth !== undefined ? incoming.date_of_birth : incoming.dateOfBirth;
      if (rawDOB) {
        const parsedDate = new Date(rawDOB);
        if (!isNaN(parsedDate.getTime())) {
          profileData.dateOfBirth = parsedDate;
        } else {
          profileData.dateOfBirth = null;
        }
      } else {
        profileData.dateOfBirth = null;
      }

      // Safely parse monthlyIncome/monthly_income
      const rawIncome = incoming.monthly_income !== undefined ? incoming.monthly_income : incoming.monthlyIncome;
      if (rawIncome !== undefined && rawIncome !== null && rawIncome !== "") {
        profileData.monthlyIncome = String(rawIncome);
      } else {
        profileData.monthlyIncome = null;
      }

      let profile = await storage.getUserProfile(req.user!.id);
      if (profile) {
        profile = await storage.updateUserProfile(req.user!.id, profileData);
      } else {
        profile = await storage.createUserProfile(profileData);
      }

      // Return both snake_case and camelCase keys for maximum compatibility
      const responseProfile = {
        ...profile,
        phone_number: profile.phoneNumber,
        date_of_birth: profile.dateOfBirth,
        marital_status: profile.maritalStatus,
        company_name: profile.companyName,
        monthly_income: profile.monthlyIncome,
        credit_score: profile.creditScore,
        pan_number: profile.panNumber,
        aadhar_number: profile.aadharNumber,
        bank_name: profile.bankName,
        account_number: profile.accountNumber,
        ifsc_code: profile.ifscCode,
        account_holder_name: profile.accountHolderName,
        account_type: profile.accountType,
      };

      return res.json({ success: true, profile: responseProfile });
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
      const status = req.body.status || "pending";
      const serviceData = {
        ...req.body,
        userId: req.user!.id,
        outstandingAmount: req.body.outstandingAmount || (status === "active" ? "0" : req.body.amount),
        status: status,
      };

      const service = await storage.createUserService(serviceData);

      await storage.createNotification({
        userId: req.user!.id,
        title: status === "active" ? "Fixed Deposit Opened" : "Loan Application Submitted",
        message: status === "active" 
          ? `Your Fixed Deposit of ₹${parseFloat(req.body.amount).toLocaleString("en-IN")} has been successfully opened.` 
          : `Your application has been submitted successfully.`,
        type: "success",
        isRead: false,
        actionUrl: "/dashboard",
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

  app.post('/api/payments', authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const { userServiceId, amount, paymentMethod } = req.body;

      if (!userServiceId || !amount || !paymentMethod) {
        return res.status(400).json({ success: false, error: "Missing required payment fields" });
      }

      // Check if user service exists and belongs to the user
      const service = await storage.getUserService(userServiceId);
      if (!service) {
        return res.status(404).json({ success: false, error: "Loan service not found" });
      }

      if (service.userId !== req.user!.id) {
        return res.status(403).json({ success: false, error: "Access Denied" });
      }

      const paymentVal = parseFloat(amount);
      if (isNaN(paymentVal) || paymentVal <= 0) {
        return res.status(400).json({ success: false, error: "Invalid payment amount" });
      }

      // Create a successful payment transaction
      const transactionId = `TXN${Date.now()}${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
      const bankReference = `BR${Date.now()}${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;

      const payment = await storage.createPayment({
        userServiceId,
        emiScheduleId: null,
        amount: amount.toString(),
        paymentMethod,
        paymentDate: new Date(),
        status: "success",
        transactionId,
        bankReference,
        remarks: `EMI repayment for loan application ${service.applicationNumber}`
      });

      // Calculate updated loan amounts
      const currentOutstanding = parseFloat(service.outstandingAmount || "0");
      const currentPaid = parseFloat(service.totalPaidAmount || "0");
      const newOutstanding = Math.max(0, currentOutstanding - paymentVal);
      const newPaid = currentPaid + paymentVal;
      const completed = newOutstanding <= 0;

      // Update the loan service record
      await storage.updateUserService(userServiceId, {
        outstandingAmount: newOutstanding.toString(),
        totalPaidAmount: newPaid.toString(),
        status: completed ? "completed" : service.status
      });

      // Create notification for the user
      await storage.createNotification({
        userId: req.user!.id,
        title: "Payment Received",
        message: `Your payment of ₹${paymentVal.toLocaleString("en-IN")} was received. Outstanding balance: ₹${newOutstanding.toLocaleString("en-IN")}.`,
        type: "success",
        isRead: false,
        actionUrl: "/dashboard"
      });

      return res.json({ success: true, payment });
    } catch (error) {
      console.error("Payment submission error:", error);
      return res.status(500).json({ success: false, error: "Failed to submit payment" });
    }
  });

  // -------------------------
  // NOTIFICATIONS
  // -------------------------
  app.get('/api/notifications', authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const list = await storage.getUserNotifications(req.user!.id);
      return res.json({ success: true, notifications: list });
    } catch (error) {
      console.error("Notifications fetch error:", error);
      return res.status(500).json({ success: false, error: "Failed to fetch notifications" });
    }
  });

  app.post('/api/notifications/:id/read', authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const { id } = req.params;
      const updated = await storage.markNotificationAsRead(id);
      return res.json({ success: true, notification: updated });
    } catch (error) {
      console.error("Notification read error:", error);
      return res.status(500).json({ success: false, error: "Failed to update notification status" });
    }
  });

  app.post('/api/notifications/read-all', authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const list = await storage.getUserNotifications(req.user!.id);
      const promises = list.map(n => {
        if (!n.isRead) {
          return storage.markNotificationAsRead(n.id);
        }
        return Promise.resolve();
      });
      await Promise.all(promises);
      return res.json({ success: true, message: "All notifications marked as read" });
    } catch (error) {
      console.error("Notifications clear-all error:", error);
      return res.status(500).json({ success: false, error: "Failed to mark all notifications as read" });
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

  // -------------------------
  // ADMIN LIVE ROUTES & EMI SCHEDULES
  // -------------------------
  app.get('/api/admin/stats', authenticateToken, requireRole("admin"), async (req: AuthenticatedRequest, res) => {
    try {
      const stats = await storage.getDashboardStats();
      return res.json({ success: true, stats });
    } catch (error) {
      console.error("Admin stats error:", error);
      return res.status(500).json({ success: false, error: "Failed to fetch admin stats" });
    }
  });

  app.get('/api/admin/user-services', authenticateToken, requireRole("admin"), async (req: AuthenticatedRequest, res) => {
    try {
      const services = await storage.getAllUserServices();
      return res.json({ success: true, services });
    } catch (error) {
      console.error("Admin user services error:", error);
      return res.status(500).json({ success: false, error: "Failed to fetch loan applications" });
    }
  });

  app.get('/api/admin/payments', authenticateToken, requireRole("admin"), async (req: AuthenticatedRequest, res) => {
    try {
      const payments = await storage.getAllPayments();
      return res.json({ success: true, payments });
    } catch (error) {
      console.error("Admin payments error:", error);
      return res.status(500).json({ success: false, error: "Failed to fetch payment ledger" });
    }
  });

  app.get('/api/admin/users', authenticateToken, requireRole("admin"), async (req: AuthenticatedRequest, res) => {
    try {
      const users = await storage.getAllUsers();
      return res.json({ success: true, users });
    } catch (error) {
      console.error("Admin users error:", error);
      return res.status(500).json({ success: false, error: "Failed to fetch user list" });
    }
  });

  app.post('/api/admin/users', authenticateToken, requireRole("admin"), async (req, res) => {
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
      });
    } catch (error) {
      console.error("Admin onboarding employee error:", error);
      return res.status(500).json({ success: false, error: "Failed to onboard employee" });
    }
  });

  app.post('/api/admin/users/:id/status', authenticateToken, requireRole("admin"), async (req, res) => {
    try {
      const { id } = req.params;
      const { isActive } = req.body;

      if (typeof isActive !== "boolean") {
        return res.status(400).json({ success: false, error: "isActive boolean is required" });
      }

      const user = await storage.updateUser(id, { isActive });
      if (!user) {
        return res.status(404).json({ success: false, error: "User not found" });
      }

      return res.json({ success: true, user });
    } catch (error) {
      console.error("Admin toggle status error:", error);
      return res.status(500).json({ success: false, error: "Failed to toggle user status" });
    }
  });

  app.post('/api/admin/users/:id/role', authenticateToken, requireRole("admin"), async (req, res) => {
    try {
      const { id } = req.params;
      const { role } = req.body;

      if (!role) {
        return res.status(400).json({ success: false, error: "role string is required" });
      }

      const user = await storage.updateUser(id, { role });
      if (!user) {
        return res.status(404).json({ success: false, error: "User not found" });
      }

      return res.json({ success: true, user });
    } catch (error) {
      console.error("Admin update role error:", error);
      return res.status(500).json({ success: false, error: "Failed to update user role" });
    }
  });

  app.post('/api/admin/user-services/:id/status', authenticateToken, requireRole("admin"), async (req: AuthenticatedRequest, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!status || !["active", "rejected", "approved", "completed", "closed"].includes(status)) {
        return res.status(400).json({ success: false, error: "Invalid status value" });
      }

      const service = await storage.getUserService(id);
      if (!service) {
        return res.status(404).json({ success: false, error: "Loan application not found" });
      }

      if (status === "active" && service.status !== "active") {
        const principal = parseFloat(service.amount);
        const rate = parseFloat(service.interestRate);
        const tenure = service.tenure;

        const emi = storage.calculateEMI(principal, rate, tenure);
        const schedule = storage.generateEmiSchedule(id, principal, rate, tenure, new Date());

        await storage.createEmiSchedule(schedule);

        const updated = await storage.updateUserService(id, {
          status: "active",
          emi: emi.toString(),
          outstandingAmount: service.amount,
          disbursalDate: new Date()
        });

        await storage.createNotification({
          userId: service.userId,
          title: "Loan Application Approved",
          message: `Congratulations! Your loan application ${service.applicationNumber} of ₹${principal.toLocaleString("en-IN")} has been approved. Monthly EMI is ₹${emi.toLocaleString("en-IN")}.`,
          type: "success",
          isRead: false,
          actionUrl: "/dashboard"
        });

        return res.json({ success: true, service: updated });
      }

      if (status === "rejected" && service.status !== "rejected") {
        const updated = await storage.updateUserService(id, { status: "rejected" });

        await storage.createNotification({
          userId: service.userId,
          title: "Loan Application Rejected",
          message: `Your loan application ${service.applicationNumber} of ₹${parseFloat(service.amount).toLocaleString("en-IN")} has been rejected.`,
          type: "destructive",
          isRead: false,
          actionUrl: "/dashboard"
        });

        return res.json({ success: true, service: updated });
      }

      const updated = await storage.updateUserService(id, { status });
      return res.json({ success: true, service: updated });
    } catch (error) {
      console.error("Error updating loan status:", error);
      return res.status(500).json({ success: false, error: "Failed to update loan status" });
    }
  });

  app.get('/api/user-services/:id/emi-schedule', authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const { id } = req.params;
      const service = await storage.getUserService(id);

      if (!service) {
        return res.status(404).json({ success: false, error: "Loan service not found" });
      }

      if (service.userId !== req.user!.id && req.user!.role !== "admin") {
        return res.status(403).json({ success: false, error: "Access Denied" });
      }

      const schedule = await storage.getEmiSchedule(id);
      return res.json({ success: true, schedule });
    } catch (error) {
      console.error("Error fetching EMI schedule:", error);
      return res.status(500).json({ success: false, error: "Failed to fetch EMI schedule" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}