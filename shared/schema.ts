
import { pgTable, text, timestamp, uuid, boolean, numeric, integer, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  role: text("role").notNull().default("user"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const serviceTypes = pgTable("service_types", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull().unique(),
  displayName: text("display_name").notNull(),
  description: text("description"),
  baseInterestRate: numeric("base_interest_rate", { precision: 5, scale: 2 }),
  minAmount: numeric("min_amount", { precision: 12, scale: 2 }),
  maxAmount: numeric("max_amount", { precision: 12, scale: 2 }),
  minTenure: integer("min_tenure"), // in months
  maxTenure: integer("max_tenure"), // in months
  processingFee: numeric("processing_fee", { precision: 5, scale: 2 }),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const userProfiles = pgTable("user_profiles", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id),
  phoneNumber: text("phone_number"),
  dateOfBirth: timestamp("date_of_birth"),
  gender: text("gender"),
  maritalStatus: text("marital_status"),
  address: text("address"),
  city: text("city"),
  state: text("state"),
  pincode: text("pincode"),
  occupation: text("occupation"),
  companyName: text("company_name"),
  monthlyIncome: numeric("monthly_income", { precision: 12, scale: 2 }),
  creditScore: integer("credit_score"),
  panNumber: text("pan_number"),
  aadharNumber: text("aadhar_number"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const userServices = pgTable("user_services", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id),
  serviceTypeId: uuid("service_type_id").notNull().references(() => serviceTypes.id),
  applicationNumber: text("application_number").notNull().unique(),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  tenure: integer("tenure").notNull(), // in months
  interestRate: numeric("interest_rate", { precision: 5, scale: 2 }).notNull(),
  emi: numeric("emi", { precision: 12, scale: 2 }),
  processingFee: numeric("processing_fee", { precision: 12, scale: 2 }),
  status: text("status").notNull().default("pending"), // pending, approved, active, rejected, completed, closed
  purpose: text("purpose"),
  collateral: text("collateral"),
  guarantor: text("guarantor"),
  applicationDate: timestamp("application_date").notNull().defaultNow(),
  approvalDate: timestamp("approval_date"),
  disbursalDate: timestamp("disbursal_date"),
  maturityDate: timestamp("maturity_date"),
  lastPaymentDate: timestamp("last_payment_date"),
  outstandingAmount: numeric("outstanding_amount", { precision: 12, scale: 2 }),
  totalPaidAmount: numeric("total_paid_amount", { precision: 12, scale: 2 }).default("0"),
  notes: text("notes"),
  documents: jsonb("documents"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const emiSchedule = pgTable("emi_schedule", {
  id: uuid("id").primaryKey().defaultRandom(),
  userServiceId: uuid("user_service_id").notNull().references(() => userServices.id),
  emiNumber: integer("emi_number").notNull(),
  dueDate: timestamp("due_date").notNull(),
  emiAmount: numeric("emi_amount", { precision: 12, scale: 2 }).notNull(),
  principalAmount: numeric("principal_amount", { precision: 12, scale: 2 }).notNull(),
  interestAmount: numeric("interest_amount", { precision: 12, scale: 2 }).notNull(),
  outstandingBalance: numeric("outstanding_balance", { precision: 12, scale: 2 }).notNull(),
  status: text("status").notNull().default("pending"), // pending, paid, overdue
  paidDate: timestamp("paid_date"),
  paidAmount: numeric("paid_amount", { precision: 12, scale: 2 }),
  lateFee: numeric("late_fee", { precision: 12, scale: 2 }).default("0"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const payments = pgTable("payments", {
  id: uuid("id").primaryKey().defaultRandom(),
  userServiceId: uuid("user_service_id").notNull().references(() => userServices.id),
  emiScheduleId: uuid("emi_schedule_id").references(() => emiSchedule.id),
  paymentReference: text("payment_reference").notNull().unique(),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  paymentMethod: text("payment_method").notNull(), // online, cheque, cash, neft, upi
  paymentDate: timestamp("payment_date").notNull(),
  status: text("status").notNull().default("pending"), // pending, success, failed, refunded
  transactionId: text("transaction_id"),
  bankReference: text("bank_reference"),
  remarks: text("remarks"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const documents = pgTable("documents", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id),
  userServiceId: uuid("user_service_id").references(() => userServices.id),
  documentType: text("document_type").notNull(), // identity_proof, address_proof, income_proof, bank_statement
  fileName: text("file_name").notNull(),
  fileUrl: text("file_url").notNull(),
  fileSize: integer("file_size"),
  mimeType: text("mime_type"),
  verificationStatus: text("verification_status").default("pending"), // pending, verified, rejected
  verifiedBy: uuid("verified_by").references(() => users.id),
  verificationDate: timestamp("verification_date"),
  verificationNotes: text("verification_notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const goldRates = pgTable("gold_rates", {
  id: uuid("id").primaryKey().defaultRandom(),
  date: timestamp("date").notNull(),
  goldPurity: text("gold_purity").notNull(), // 22k, 24k
  ratePerGram: numeric("rate_per_gram", { precision: 8, scale: 2 }).notNull(),
  city: text("city"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const interestRates = pgTable("interest_rates", {
  id: uuid("id").primaryKey().defaultRandom(),
  serviceTypeId: uuid("service_type_id").notNull().references(() => serviceTypes.id),
  minAmount: numeric("min_amount", { precision: 12, scale: 2 }),
  maxAmount: numeric("max_amount", { precision: 12, scale: 2 }),
  minTenure: integer("min_tenure"),
  maxTenure: integer("max_tenure"),
  interestRate: numeric("interest_rate", { precision: 5, scale: 2 }).notNull(),
  effectiveDate: timestamp("effective_date").notNull(),
  expiryDate: timestamp("expiry_date"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const notifications = pgTable("notifications", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  message: text("message").notNull(),
  type: text("type").notNull(), // info, warning, success, error
  isRead: boolean("is_read").notNull().default(false),
  actionUrl: text("action_url"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Schema exports
export const insertUserSchema = createInsertSchema(users);
export const selectUserSchema = createSelectSchema(users);
export const insertServiceTypeSchema = createInsertSchema(serviceTypes);
export const selectServiceTypeSchema = createSelectSchema(serviceTypes);
export const insertUserProfileSchema = createInsertSchema(userProfiles);
export const selectUserProfileSchema = createSelectSchema(userProfiles);
export const insertUserServiceSchema = createInsertSchema(userServices);
export const selectUserServiceSchema = createSelectSchema(userServices);
export const insertEmiScheduleSchema = createInsertSchema(emiSchedule);
export const selectEmiScheduleSchema = createSelectSchema(emiSchedule);
export const insertPaymentSchema = createInsertSchema(payments);
export const selectPaymentSchema = createSelectSchema(payments);
export const insertDocumentSchema = createInsertSchema(documents);
export const selectDocumentSchema = createSelectSchema(documents);
export const insertGoldRateSchema = createInsertSchema(goldRates);
export const selectGoldRateSchema = createSelectSchema(goldRates);
export const insertInterestRateSchema = createInsertSchema(interestRates);
export const selectInterestRateSchema = createSelectSchema(interestRates);
export const insertNotificationSchema = createInsertSchema(notifications);
export const selectNotificationSchema = createSelectSchema(notifications);

// Type exports
export type User = z.infer<typeof selectUserSchema>;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type ServiceType = z.infer<typeof selectServiceTypeSchema>;
export type InsertServiceType = z.infer<typeof insertServiceTypeSchema>;
export type UserProfile = z.infer<typeof selectUserProfileSchema>;
export type InsertUserProfile = z.infer<typeof insertUserProfileSchema>;
export type UserService = z.infer<typeof selectUserServiceSchema>;
export type InsertUserService = z.infer<typeof insertUserServiceSchema>;
export type EmiSchedule = z.infer<typeof selectEmiScheduleSchema>;
export type InsertEmiSchedule = z.infer<typeof insertEmiScheduleSchema>;
export type Payment = z.infer<typeof selectPaymentSchema>;
export type InsertPayment = z.infer<typeof insertPaymentSchema>;
export type Document = z.infer<typeof selectDocumentSchema>;
export type InsertDocument = z.infer<typeof insertDocumentSchema>;
export type GoldRate = z.infer<typeof selectGoldRateSchema>;
export type InsertGoldRate = z.infer<typeof insertGoldRateSchema>;
export type InterestRate = z.infer<typeof selectInterestRateSchema>;
export type InsertInterestRate = z.infer<typeof insertInterestRateSchema>;
export type Notification = z.infer<typeof selectNotificationSchema>;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
