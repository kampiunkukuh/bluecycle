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

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export const insertWasteCatalogSchema = createInsertSchema(wasteCatalog).omit({ id: true, createdAt: true });
export const insertPickupSchema = createInsertSchema(pickups).omit({ id: true, createdAt: true, completedAt: true, cancelledAt: true, cancellationReason: true, driverEarnings: true, adminCommission: true });
export const insertRouteSchema = createInsertSchema(routes).omit({ id: true, createdAt: true, startedAt: true, completedAt: true });
export const insertDriverEarningsSchema = createInsertSchema(driverEarnings).omit({ id: true, date: true });
export const insertUserRewardsSchema = createInsertSchema(userRewards).omit({ id: true, date: true });
export const insertWithdrawalRequestSchema = createInsertSchema(withdrawalRequests).omit({ id: true, requestedAt: true, approvedAt: true, completedAt: true });
export const insertAdminCommissionSchema = createInsertSchema(adminCommissions).omit({ id: true, date: true });

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
