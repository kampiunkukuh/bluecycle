import { pgTable, text, timestamp, serial, integer, varchar, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  role: varchar("role", { length: 50 }).notNull(), // "admin", "user", "driver"
  password: varchar("password", { length: 255 }),
  phone: varchar("phone", { length: 20 }),
  bankName: varchar("bank_name", { length: 100 }), // For drivers - payment method
  bankAccount: varchar("bank_account", { length: 255 }), // For drivers - account number
  createdAt: timestamp("created_at").defaultNow(),
});

// Waste Catalog table
export const wasteCatalog = pgTable("waste_catalog", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  wasteType: varchar("waste_type", { length: 100 }).notNull(),
  description: text("description"),
  price: integer("price").notNull().default(0), // in cents (Rp)
  imageUrl: varchar("image_url", { length: 500 }), // URL/path to image
  createdAt: timestamp("created_at").defaultNow(),
});

// Pickup requests table
export const pickups = pgTable("pickups", {
  id: serial("id").primaryKey(),
  address: text("address").notNull(),
  wasteType: varchar("waste_type", { length: 100 }).notNull(),
  quantity: varchar("quantity", { length: 50 }), // e.g., "5 kg", "10 dus"
  deliveryMethod: varchar("delivery_method", { length: 20 }).notNull().default("pickup"), // "pickup" or "dropoff"
  status: varchar("status", { length: 50 }).notNull().default("pending"), // "pending", "accepted", "in-progress", "completed", "cancelled"
  requestedById: integer("requested_by_id").notNull(),
  assignedDriverId: integer("assigned_driver_id"),
  scheduledDate: timestamp("scheduled_date"),
  notes: text("notes"),
  price: integer("price").notNull().default(0), // in cents, from catalog
  catalogItemId: integer("catalog_item_id"), // reference to waste catalog for pricing
  driverEarnings: integer("driver_earnings"), // 80% of price
  adminCommission: integer("admin_commission"), // 20% of price
  createdAt: timestamp("created_at").defaultNow(),
  completedAt: timestamp("completed_at"),
  cancelledAt: timestamp("cancelled_at"),
  cancellationReason: text("cancellation_reason"),
});

// Routes table for drivers
export const routes = pgTable("routes", {
  id: serial("id").primaryKey(),
  driverId: integer("driver_id").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  status: varchar("status", { length: 50 }).notNull().default("pending"), // "pending", "in-progress", "completed"
  pickupIds: text("pickup_ids"), // JSON array as string
  createdAt: timestamp("created_at").defaultNow(),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
});

// Driver Earnings table
export const driverEarnings = pgTable("driver_earnings", {
  id: serial("id").primaryKey(),
  driverId: integer("driver_id").notNull(),
  amount: integer("amount").notNull(), // in cents
  date: timestamp("date").defaultNow(),
  pickupId: integer("pickup_id"),
  description: varchar("description", { length: 255 }),
});

// User Rewards table
export const userRewards = pgTable("user_rewards", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  amount: integer("amount").notNull(), // in cents
  date: timestamp("date").defaultNow(),
  pickupId: integer("pickup_id"),
  description: varchar("description", { length: 255 }),
});

// Withdrawal Requests table
export const withdrawalRequests = pgTable("withdrawal_requests", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  userRole: varchar("user_role", { length: 20 }).notNull(), // "driver" or "user"
  amount: integer("amount").notNull(), // in cents
  status: varchar("status", { length: 50 }).notNull().default("pending"), // "pending", "approved", "rejected", "completed"
  bankAccount: varchar("bank_account", { length: 255 }),
  bankName: varchar("bank_name", { length: 100 }),
  requestedAt: timestamp("requested_at").defaultNow(),
  approvedAt: timestamp("approved_at"),
  completedAt: timestamp("completed_at"),
  reason: text("reason"),
});

// Admin Commission table
export const adminCommissions = pgTable("admin_commissions", {
  id: serial("id").primaryKey(),
  pickupId: integer("pickup_id").notNull(),
  amount: integer("amount").notNull(), // in cents (20% of order)
  date: timestamp("date").defaultNow(),
  description: varchar("description", { length: 255 }),
});

// Collection Points table (for DLH)
export const collectionPoints = pgTable("collection_points", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  address: text("address").notNull(),
  latitude: varchar("latitude", { length: 50 }),
  longitude: varchar("longitude", { length: 50 }),
  capacity: integer("capacity"), // in kg
  currentKg: integer("current_kg").default(0), // kg sampah sekarang
  status: varchar("status", { length: 50 }).default("available"), // "available", "full", "maintenance"
  operatingHours: varchar("operating_hours", { length: 100 }), // e.g., "08:00-17:00"
  contactPerson: varchar("contact_person", { length: 255 }),
  phone: varchar("phone", { length: 20 }),
  createdAt: timestamp("created_at").defaultNow(),
});

// Waste Disposal Tracking table
export const wasteDisposals = pgTable("waste_disposals", {
  id: serial("id").primaryKey(),
  pickupId: integer("pickup_id").notNull(),
  collectionPointId: integer("collection_point_id"),
  disposalType: varchar("disposal_type", { length: 100 }), // "recycling", "landfill", "composting"
  disposalFacility: varchar("disposal_facility", { length: 255 }),
  disposalDate: timestamp("disposal_date"),
  quantity: integer("quantity"), // kg
  certificateUrl: varchar("certificate_url", { length: 500 }), // proof document
  createdAt: timestamp("created_at").defaultNow(),
});

// Environmental Metrics table
export const environmentalMetrics = pgTable("environmental_metrics", {
  id: serial("id").primaryKey(),
  pickupId: integer("pickup_id").notNull(),
  wasteType: varchar("waste_type", { length: 100 }).notNull(),
  quantityKg: integer("quantity_kg").notNull(),
  co2Saved: integer("co2_saved"), // grams
  treesEquivalent: integer("trees_equivalent"), // equivalent trees planted
  energySaved: integer("energy_saved"), // kWh
  createdAt: timestamp("created_at").defaultNow(),
});

// QR Code Tracking table
export const qrTracking = pgTable("qr_tracking", {
  id: serial("id").primaryKey(),
  pickupId: integer("pickup_id").notNull(),
  qrCode: varchar("qr_code", { length: 255 }).unique(),
  pickupPhotoUrl: varchar("pickup_photo_url", { length: 500 }),
  deliveryPhotoUrl: varchar("delivery_photo_url", { length: 500 }),
  pickupVerifiedAt: timestamp("pickup_verified_at"),
  deliveryVerifiedAt: timestamp("delivery_verified_at"),
  certificateUrl: varchar("certificate_url", { length: 500 }),
  createdAt: timestamp("created_at").defaultNow(),
});

// Compliance Reports table
export const complianceReports = pgTable("compliance_reports", {
  id: serial("id").primaryKey(),
  reportMonth: varchar("report_month", { length: 20 }), // "2025-01"
  reportType: varchar("report_type", { length: 50 }), // "monthly", "yearly"
  totalOrders: integer("total_orders"),
  totalKgCollected: integer("total_kg_collected"),
  totalRevenue: integer("total_revenue"),
  recyclablePercentage: integer("recyclable_percentage"),
  reportUrl: varchar("report_url", { length: 500 }),
  createdAt: timestamp("created_at").defaultNow(),
});

// Audit Log table
export const auditLogs = pgTable("audit_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id"),
  action: varchar("action", { length: 255 }).notNull(),
  entity: varchar("entity", { length: 100 }),
  entityId: integer("entity_id"),
  changes: text("changes"), // JSON
  timestamp: timestamp("timestamp").defaultNow(),
});

// User Payments table (for user withdrawal requests and approval)
export const userPayments = pgTable("user_payments", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  amount: integer("amount").notNull(), // in cents
  status: varchar("status", { length: 50 }).notNull().default("pending"), // "pending", "approved", "rejected", "completed"
  bankName: varchar("bank_name", { length: 100 }).notNull(),
  bankAccount: varchar("bank_account", { length: 255 }).notNull(),
  requestedAt: timestamp("requested_at").defaultNow(),
  approvedAt: timestamp("approved_at"),
  completedAt: timestamp("completed_at"),
  rejectionReason: text("rejection_reason"),
  adminNotes: text("admin_notes"),
});

// Driver Payments table (for driver withdrawal requests and approval)
export const driverPayments = pgTable("driver_payments", {
  id: serial("id").primaryKey(),
  driverId: integer("driver_id").notNull(),
  amount: integer("amount").notNull(), // in cents
  status: varchar("status", { length: 50 }).notNull().default("pending"), // "pending", "approved", "rejected", "completed"
  bankName: varchar("bank_name", { length: 100 }).notNull(),
  bankAccount: varchar("bank_account", { length: 255 }).notNull(),
  requestedAt: timestamp("requested_at").defaultNow(),
  approvedAt: timestamp("approved_at"),
  completedAt: timestamp("completed_at"),
  rejectionReason: text("rejection_reason"),
  adminNotes: text("admin_notes"),
});

// TPA Waste Stock table (Tempat Pemrosesan Akhir - final waste disposal site)
export const tpaWasteStock = pgTable("tpa_waste_stock", {
  id: serial("id").primaryKey(),
  tpaName: varchar("tpa_name", { length: 255 }).notNull(),
  address: text("address").notNull(),
  wasteType: varchar("waste_type", { length: 100 }).notNull(), // "Plastik", "Kertas", "Logam", "Organik"
  totalKg: integer("total_kg").notNull().default(0), // total kg in TPA
  capacity: integer("capacity").notNull(), // max capacity in kg
  lastUpdated: timestamp("last_updated").defaultNow(),
});

// Vendor/Supplier table (Pengepul Sampah)
export const vendors = pgTable("vendors", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  address: text("address").notNull(),
  phone: varchar("phone", { length: 20 }).notNull(),
  wasteTypes: text("waste_types"), // JSON array: ["Plastik", "Kertas", "Logam"]
  totalCapacity: integer("total_capacity").notNull(), // kg
  currentStock: integer("current_stock").notNull().default(0), // kg
  status: varchar("status", { length: 50 }).default("active"), // "active", "inactive", "full"
  contactPerson: varchar("contact_person", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export const insertWasteCatalogSchema = createInsertSchema(wasteCatalog).omit({ id: true, createdAt: true });
export const insertPickupSchema = createInsertSchema(pickups).omit({ id: true, createdAt: true, completedAt: true, cancelledAt: true, cancellationReason: true, driverEarnings: true, adminCommission: true });
export const insertRouteSchema = createInsertSchema(routes).omit({ id: true, createdAt: true, startedAt: true, completedAt: true });
export const insertDriverEarningsSchema = createInsertSchema(driverEarnings).omit({ id: true, date: true });
export const insertUserRewardsSchema = createInsertSchema(userRewards).omit({ id: true, date: true });
export const insertWithdrawalRequestSchema = createInsertSchema(withdrawalRequests).omit({ id: true, requestedAt: true, approvedAt: true, completedAt: true });
export const insertAdminCommissionSchema = createInsertSchema(adminCommissions).omit({ id: true, date: true });
export const insertCollectionPointSchema = createInsertSchema(collectionPoints).omit({ id: true, createdAt: true });
export const insertWasteDisposalSchema = createInsertSchema(wasteDisposals).omit({ id: true, createdAt: true });
export const insertEnvironmentalMetricSchema = createInsertSchema(environmentalMetrics).omit({ id: true, createdAt: true });
export const insertQrTrackingSchema = createInsertSchema(qrTracking).omit({ id: true, createdAt: true });
export const insertComplianceReportSchema = createInsertSchema(complianceReports).omit({ id: true, createdAt: true });
export const insertAuditLogSchema = createInsertSchema(auditLogs).omit({ id: true, timestamp: true });
export const insertUserPaymentSchema = createInsertSchema(userPayments).omit({ id: true, requestedAt: true, approvedAt: true, completedAt: true });
export const insertDriverPaymentSchema = createInsertSchema(driverPayments).omit({ id: true, requestedAt: true, approvedAt: true, completedAt: true });
export const insertTpaWasteStockSchema = createInsertSchema(tpaWasteStock).omit({ id: true, lastUpdated: true });
export const insertVendorSchema = createInsertSchema(vendors).omit({ id: true, createdAt: true, updatedAt: true });

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type WasteCatalogItem = typeof wasteCatalog.$inferSelect;
export type InsertWasteCatalogItem = z.infer<typeof insertWasteCatalogSchema>;

export type Pickup = typeof pickups.$inferSelect;
export type InsertPickup = z.infer<typeof insertPickupSchema>;

export type Route = typeof routes.$inferSelect;
export type InsertRoute = z.infer<typeof insertRouteSchema>;

export type DriverEarning = typeof driverEarnings.$inferSelect;
export type InsertDriverEarning = z.infer<typeof insertDriverEarningsSchema>;

export type UserReward = typeof userRewards.$inferSelect;
export type InsertUserReward = z.infer<typeof insertUserRewardsSchema>;

export type WithdrawalRequest = typeof withdrawalRequests.$inferSelect;
export type InsertWithdrawalRequest = z.infer<typeof insertWithdrawalRequestSchema>;

export type AdminCommission = typeof adminCommissions.$inferSelect;
export type InsertAdminCommission = z.infer<typeof insertAdminCommissionSchema>;

export type CollectionPoint = typeof collectionPoints.$inferSelect;
export type InsertCollectionPoint = z.infer<typeof insertCollectionPointSchema>;

export type WasteDisposal = typeof wasteDisposals.$inferSelect;
export type InsertWasteDisposal = z.infer<typeof insertWasteDisposalSchema>;

export type EnvironmentalMetric = typeof environmentalMetrics.$inferSelect;
export type InsertEnvironmentalMetric = z.infer<typeof insertEnvironmentalMetricSchema>;

export type QrTracking = typeof qrTracking.$inferSelect;
export type InsertQrTracking = z.infer<typeof insertQrTrackingSchema>;

export type ComplianceReport = typeof complianceReports.$inferSelect;
export type InsertComplianceReport = z.infer<typeof insertComplianceReportSchema>;

export type AuditLog = typeof auditLogs.$inferSelect;
export type InsertAuditLog = z.infer<typeof insertAuditLogSchema>;

export type UserPayment = typeof userPayments.$inferSelect;
export type InsertUserPayment = z.infer<typeof insertUserPaymentSchema>;

export type DriverPayment = typeof driverPayments.$inferSelect;
export type InsertDriverPayment = z.infer<typeof insertDriverPaymentSchema>;

export type TpaWasteStock = typeof tpaWasteStock.$inferSelect;
export type InsertTpaWasteStock = z.infer<typeof insertTpaWasteStockSchema>;

export type Vendor = typeof vendors.$inferSelect;
export type InsertVendor = z.infer<typeof insertVendorSchema>;
