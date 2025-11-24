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
  createdAt: timestamp("created_at").defaultNow(),
});

// Waste Catalog table
export const wasteCatalog = pgTable("waste_catalog", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  wasteType: varchar("waste_type", { length: 100 }).notNull(),
  description: text("description"),
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

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export const insertWasteCatalogSchema = createInsertSchema(wasteCatalog).omit({ id: true, createdAt: true });
export const insertPickupSchema = createInsertSchema(pickups).omit({ id: true, createdAt: true, completedAt: true, cancelledAt: true, cancellationReason: true });
export const insertRouteSchema = createInsertSchema(routes).omit({ id: true, createdAt: true, startedAt: true, completedAt: true });

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type WasteCatalogItem = typeof wasteCatalog.$inferSelect;
export type InsertWasteCatalogItem = z.infer<typeof insertWasteCatalogSchema>;

export type Pickup = typeof pickups.$inferSelect;
export type InsertPickup = z.infer<typeof insertPickupSchema>;

export type Route = typeof routes.$inferSelect;
export type InsertRoute = z.infer<typeof insertRouteSchema>;
