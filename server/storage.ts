
import { eq, and, desc, asc, sql } from "drizzle-orm";
import { db } from "./database";
import { 
  users, 
  serviceTypes, 
  userProfiles, 
  userServices, 
  emiSchedule, 
  payments, 
  documents, 
  goldRates, 
  interestRates, 
  notifications,
  type User,
  type ServiceType,
  type UserProfile,
  type UserService,
  type EmiSchedule,
  type Payment,
  type Document,
  type GoldRate,
  type InterestRate,
  type Notification
} from "@shared/schema";

export class Storage {
  // User methods
  async createUser(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>) {
    const [user] = await db.insert(users).values({
      ...userData,
      createdAt: new Date(),
      updatedAt: new Date()
    }).returning();
    return user;
  }

  async getUserById(id: string) {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string) {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async updateUser(id: string, updates: Partial<User>) {
    const [user] = await db.update(users)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  // Service Types methods
  async getServiceTypes() {
    return await db.select().from(serviceTypes).where(eq(serviceTypes.isActive, true));
  }

  async getServiceTypeById(id: string) {
    const [serviceType] = await db.select().from(serviceTypes).where(eq(serviceTypes.id, id));
    return serviceType;
  }

  async createServiceType(serviceTypeData: Omit<ServiceType, 'id' | 'createdAt' | 'updatedAt'>) {
    const [serviceType] = await db.insert(serviceTypes).values({
      ...serviceTypeData,
      createdAt: new Date(),
      updatedAt: new Date()
    }).returning();
    return serviceType;
  }

  // User Profile methods
  async getUserProfile(userId: string) {
    const [profile] = await db.select().from(userProfiles).where(eq(userProfiles.userId, userId));
    return profile;
  }

  async createUserProfile(profileData: Omit<UserProfile, 'id' | 'createdAt' | 'updatedAt'>) {
    const [profile] = await db.insert(userProfiles).values({
      ...profileData,
      createdAt: new Date(),
      updatedAt: new Date()
    }).returning();
    return profile;
  }

  async updateUserProfile(userId: string, updates: Partial<UserProfile>) {
    const [profile] = await db.update(userProfiles)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(userProfiles.userId, userId))
      .returning();
    return profile;
  }

  // User Services methods
  async getUserServices(userId: string) {
    return await db.select({
      userService: userServices,
      serviceType: serviceTypes
    })
    .from(userServices)
    .innerJoin(serviceTypes, eq(userServices.serviceTypeId, serviceTypes.id))
    .where(eq(userServices.userId, userId))
    .orderBy(desc(userServices.createdAt));
  }

  async createUserService(serviceData: Omit<UserService, 'id' | 'createdAt' | 'updatedAt'>) {
    const applicationNumber = `BF${Date.now()}${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
    
    const [service] = await db.insert(userServices).values({
      ...serviceData,
      applicationNumber,
      createdAt: new Date(),
      updatedAt: new Date()
    }).returning();
    return service;
  }

  async updateUserService(id: string, updates: Partial<UserService>) {
    const [service] = await db.update(userServices)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(userServices.id, id))
      .returning();
    return service;
  }

  async getAllUserServices() {
    return await db.select({
      userService: userServices,
      serviceType: serviceTypes,
      user: users
    })
    .from(userServices)
    .innerJoin(serviceTypes, eq(userServices.serviceTypeId, serviceTypes.id))
    .innerJoin(users, eq(userServices.userId, users.id))
    .orderBy(desc(userServices.createdAt));
  }

  // EMI Schedule methods
  async getEmiSchedule(userServiceId: string) {
    return await db.select().from(emiSchedule)
      .where(eq(emiSchedule.userServiceId, userServiceId))
      .orderBy(asc(emiSchedule.emiNumber));
  }

  async createEmiSchedule(scheduleData: Omit<EmiSchedule, 'id' | 'createdAt' | 'updatedAt'>[]) {
    return await db.insert(emiSchedule).values(
      scheduleData.map(item => ({
        ...item,
        createdAt: new Date(),
        updatedAt: new Date()
      }))
    ).returning();
  }

  async updateEmiScheduleItem(id: string, updates: Partial<EmiSchedule>) {
    const [item] = await db.update(emiSchedule)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(emiSchedule.id, id))
      .returning();
    return item;
  }

  // Payments methods
  async getUserPayments(userId: string) {
    return await db.select({
      payment: payments,
      userService: userServices,
      serviceType: serviceTypes
    })
    .from(payments)
    .innerJoin(userServices, eq(payments.userServiceId, userServices.id))
    .innerJoin(serviceTypes, eq(userServices.serviceTypeId, serviceTypes.id))
    .where(eq(userServices.userId, userId))
    .orderBy(desc(payments.createdAt));
  }

  async createPayment(paymentData: Omit<Payment, 'id' | 'createdAt' | 'updatedAt'>) {
    const paymentReference = `PAY${Date.now()}${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
    
    const [payment] = await db.insert(payments).values({
      ...paymentData,
      paymentReference,
      createdAt: new Date(),
      updatedAt: new Date()
    }).returning();
    return payment;
  }

  // Documents methods
  async getUserDocuments(userId: string) {
    return await db.select().from(documents)
      .where(eq(documents.userId, userId))
      .orderBy(desc(documents.createdAt));
  }

  async createDocument(documentData: Omit<Document, 'id' | 'createdAt' | 'updatedAt'>) {
    const [document] = await db.insert(documents).values({
      ...documentData,
      createdAt: new Date(),
      updatedAt: new Date()
    }).returning();
    return document;
  }

  // Gold Rates methods
  async getCurrentGoldRates() {
    return await db.select().from(goldRates)
      .where(sql`DATE(${goldRates.date}) = CURRENT_DATE`)
      .orderBy(desc(goldRates.createdAt));
  }

  async createGoldRate(rateData: Omit<GoldRate, 'id' | 'createdAt'>) {
    const [rate] = await db.insert(goldRates).values({
      ...rateData,
      createdAt: new Date()
    }).returning();
    return rate;
  }

  // Interest Rates methods
  async getInterestRates(serviceTypeId?: string) {
    const query = db.select({
      interestRate: interestRates,
      serviceType: serviceTypes
    })
    .from(interestRates)
    .innerJoin(serviceTypes, eq(interestRates.serviceTypeId, serviceTypes.id))
    .where(eq(interestRates.isActive, true));

    if (serviceTypeId) {
      query.where(and(eq(interestRates.isActive, true), eq(interestRates.serviceTypeId, serviceTypeId)));
    }

    return await query.orderBy(desc(interestRates.effectiveDate));
  }

  // Notifications methods
  async getUserNotifications(userId: string) {
    return await db.select().from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt));
  }

  async createNotification(notificationData: Omit<Notification, 'id' | 'createdAt'>) {
    const [notification] = await db.insert(notifications).values({
      ...notificationData,
      createdAt: new Date()
    }).returning();
    return notification;
  }

  async markNotificationAsRead(id: string) {
    const [notification] = await db.update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.id, id))
      .returning();
    return notification;
  }

  // Analytics methods
  async getDashboardStats() {
    const totalUsers = await db.select({ count: sql<number>`count(*)` }).from(users);
    const activeLoans = await db.select({ count: sql<number>`count(*)` })
      .from(userServices)
      .where(eq(userServices.status, 'active'));
    const totalRevenue = await db.select({ total: sql<number>`sum(${payments.amount})` })
      .from(payments)
      .where(eq(payments.status, 'success'));

    return {
      totalUsers: totalUsers[0]?.count || 0,
      activeLoans: activeLoans[0]?.count || 0,
      totalRevenue: totalRevenue[0]?.total || 0
    };
  }

  // EMI Calculator helper
  calculateEMI(principal: number, rate: number, tenure: number) {
    const monthlyRate = rate / (12 * 100);
    const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, tenure)) / 
                 (Math.pow(1 + monthlyRate, tenure) - 1);
    return Math.round(emi);
  }

  // Generate EMI Schedule
  generateEmiSchedule(userServiceId: string, principal: number, rate: number, tenure: number, startDate: Date) {
    const monthlyRate = rate / (12 * 100);
    const emi = this.calculateEMI(principal, rate, tenure);
    let outstandingBalance = principal;
    const schedule = [];

    for (let i = 1; i <= tenure; i++) {
      const interestAmount = Math.round(outstandingBalance * monthlyRate);
      const principalAmount = emi - interestAmount;
      outstandingBalance = Math.round(outstandingBalance - principalAmount);

      const dueDate = new Date(startDate);
      dueDate.setMonth(dueDate.getMonth() + i);

      schedule.push({
        userServiceId,
        emiNumber: i,
        dueDate,
        emiAmount: emi,
        principalAmount,
        interestAmount,
        outstandingBalance: Math.max(0, outstandingBalance)
      });
    }

    return schedule;
  }
}

export const storage = new Storage();
