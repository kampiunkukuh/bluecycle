import { eq, and, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "@shared/schema";
import { User, Pickup, Route, InsertUser, InsertPickup, InsertRoute, WasteCatalogItem, InsertWasteCatalogItem, DriverEarning, InsertDriverEarning, UserReward, InsertUserReward, WithdrawalRequest, InsertWithdrawalRequest, UserPayment, InsertUserPayment, DriverPayment, InsertDriverPayment, CollectionPoint, InsertCollectionPoint, WasteDisposal, InsertWasteDisposal, ComplianceReport, InsertComplianceReport } from "@shared/schema";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  listUsers(): Promise<User[]>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined>;
  deleteUser(id: number): Promise<boolean>;

  // Waste Catalog
  getWasteCatalogItem(id: number): Promise<WasteCatalogItem | undefined>;
  createWasteCatalogItem(item: InsertWasteCatalogItem): Promise<WasteCatalogItem>;
  listWasteCatalog(userId: number): Promise<WasteCatalogItem[]>;
  deleteWasteCatalogItem(id: number): Promise<boolean>;

  // Pickups
  getPickup(id: number): Promise<Pickup | undefined>;
  createPickup(pickup: InsertPickup): Promise<Pickup>;
  listPickups(filters?: { status?: string; requestedById?: number; assignedDriverId?: number }): Promise<Pickup[]>;
  updatePickup(id: number, pickup: Partial<InsertPickup>): Promise<Pickup | undefined>;
  deletePickup(id: number): Promise<boolean>;

  // Routes
  getRoute(id: number): Promise<Route | undefined>;
  createRoute(route: InsertRoute): Promise<Route>;
  listRoutes(driverId?: number): Promise<Route[]>;
  updateRoute(id: number, route: Partial<InsertRoute>): Promise<Route | undefined>;
  deleteRoute(id: number): Promise<boolean>;

  // Driver Earnings
  createDriverEarning(earning: InsertDriverEarning): Promise<DriverEarning>;
  listDriverEarnings(driverId: number, days?: number): Promise<DriverEarning[]>;
  getDriverTotalEarnings(driverId: number): Promise<number>;

  // User Rewards
  createUserReward(reward: InsertUserReward): Promise<UserReward>;
  listUserRewards(userId: number, days?: number): Promise<UserReward[]>;
  getUserTotalRewards(userId: number): Promise<number>;

  // Withdrawal Requests
  createWithdrawalRequest(request: InsertWithdrawalRequest): Promise<WithdrawalRequest>;
  listWithdrawalRequests(userId: number): Promise<WithdrawalRequest[]>;
  updateWithdrawalRequest(id: number, request: Partial<InsertWithdrawalRequest>): Promise<WithdrawalRequest | undefined>;

  // User Payments
  createUserPayment(payment: InsertUserPayment): Promise<UserPayment>;
  listUserPayments(userId: number): Promise<UserPayment[]>;
  listAllUserPayments(): Promise<UserPayment[]>;
  updateUserPayment(id: number, payment: Partial<InsertUserPayment>): Promise<UserPayment | undefined>;

  // Driver Payments
  createDriverPayment(payment: InsertDriverPayment): Promise<DriverPayment>;
  listDriverPayments(driverId: number): Promise<DriverPayment[]>;
  listAllDriverPayments(): Promise<DriverPayment[]>;
  updateDriverPayment(id: number, payment: Partial<InsertDriverPayment>): Promise<DriverPayment | undefined>;

  // Collection Points
  getCollectionPoint(id: number): Promise<CollectionPoint | undefined>;
  createCollectionPoint(point: InsertCollectionPoint): Promise<CollectionPoint>;
  listCollectionPoints(): Promise<CollectionPoint[]>;
  updateCollectionPoint(id: number, point: Partial<InsertCollectionPoint>): Promise<CollectionPoint | undefined>;
  deleteCollectionPoint(id: number): Promise<boolean>;

  // Waste Disposals
  createWasteDisposal(disposal: InsertWasteDisposal): Promise<WasteDisposal>;
  listWasteDisposals(filters?: { collectionPointId?: number; wasteType?: string }): Promise<WasteDisposal[]>;
  updateWasteDisposal(id: number, disposal: Partial<InsertWasteDisposal>): Promise<WasteDisposal | undefined>;

  // Compliance Reports
  createComplianceReport(report: InsertComplianceReport): Promise<ComplianceReport>;
  listComplianceReports(filters?: { reportMonth?: string; reportType?: string }): Promise<ComplianceReport[]>;
  updateComplianceReport(id: number, report: Partial<InsertComplianceReport>): Promise<ComplianceReport | undefined>;
}

function getDatabaseUrl(): string {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL environment variable is not set");
  }
  return url;
}

export class DrizzleStorage implements IStorage {
  private db: ReturnType<typeof drizzle>;

  constructor() {
    this.db = drizzle(getDatabaseUrl(), { schema });
  }

  // Users
  async getUser(id: number) {
    const result = await this.db.select().from(schema.users).where(eq(schema.users.id, id)).limit(1);
    return result[0];
  }

  async getUserByEmail(email: string) {
    const result = await this.db.select().from(schema.users).where(eq(schema.users.email, email)).limit(1);
    return result[0];
  }

  async createUser(user: InsertUser) {
    const result = await this.db.insert(schema.users).values(user).returning();
    return result[0];
  }

  async listUsers() {
    return await this.db.select().from(schema.users);
  }

  async updateUser(id: number, user: Partial<InsertUser>) {
    const result = await this.db.update(schema.users).set(user).where(eq(schema.users.id, id)).returning();
    return result[0];
  }

  async deleteUser(id: number) {
    const result = await this.db.delete(schema.users).where(eq(schema.users.id, id));
    return result.rowCount > 0;
  }

  // Waste Catalog
  async getWasteCatalogItem(id: number) {
    const result = await this.db.select().from(schema.wasteCatalog).where(eq(schema.wasteCatalog.id, id)).limit(1);
    return result[0];
  }

  async createWasteCatalogItem(item: InsertWasteCatalogItem) {
    const result = await this.db.insert(schema.wasteCatalog).values(item).returning();
    return result[0];
  }

  async listWasteCatalog(userId: number) {
    return await this.db.select().from(schema.wasteCatalog).where(eq(schema.wasteCatalog.userId, userId));
  }

  async deleteWasteCatalogItem(id: number) {
    const result = await this.db.delete(schema.wasteCatalog).where(eq(schema.wasteCatalog.id, id));
    return result.rowCount > 0;
  }

  // Pickups
  async getPickup(id: number) {
    const result = await this.db.select().from(schema.pickups).where(eq(schema.pickups.id, id)).limit(1);
    return result[0];
  }

  async createPickup(pickup: InsertPickup) {
    const price = pickup.price || 0;
    const driverEarnings = Math.floor(price * 0.8);
    const adminCommission = Math.floor(price * 0.2);
    
    const result = await this.db
      .insert(schema.pickups)
      .values({
        ...pickup,
        driverEarnings,
        adminCommission,
      })
      .returning();
    return result[0];
  }

  async listPickups(filters?: { status?: string; requestedById?: number; assignedDriverId?: number }) {
    let query = this.db.select().from(schema.pickups);
    
    const conditions = [];
    if (filters?.status) {
      conditions.push(eq(schema.pickups.status, filters.status));
    }
    if (filters?.requestedById) {
      conditions.push(eq(schema.pickups.requestedById, filters.requestedById));
    }
    if (filters?.assignedDriverId) {
      conditions.push(eq(schema.pickups.assignedDriverId, filters.assignedDriverId));
    }
    
    if (conditions.length > 0) {
      return await query.where(and(...conditions));
    }
    return await query;
  }

  async updatePickup(id: number, pickup: Partial<InsertPickup>) {
    const result = await this.db.update(schema.pickups).set(pickup).where(eq(schema.pickups.id, id)).returning();
    return result[0];
  }

  async deletePickup(id: number) {
    const result = await this.db.delete(schema.pickups).where(eq(schema.pickups.id, id));
    return result.rowCount > 0;
  }

  // Routes
  async getRoute(id: number) {
    const result = await this.db.select().from(schema.routes).where(eq(schema.routes.id, id)).limit(1);
    return result[0];
  }

  async createRoute(route: InsertRoute) {
    const result = await this.db.insert(schema.routes).values(route).returning();
    return result[0];
  }

  async listRoutes(driverId?: number) {
    let query = this.db.select().from(schema.routes);
    if (driverId) {
      return await query.where(eq(schema.routes.driverId, driverId));
    }
    return await query;
  }

  async updateRoute(id: number, route: Partial<InsertRoute>) {
    const result = await this.db.update(schema.routes).set(route).where(eq(schema.routes.id, id)).returning();
    return result[0];
  }

  async deleteRoute(id: number) {
    const result = await this.db.delete(schema.routes).where(eq(schema.routes.id, id));
    return result.rowCount > 0;
  }

  // Driver Earnings
  async createDriverEarning(earning: InsertDriverEarning) {
    const result = await this.db.insert(schema.driverEarnings).values(earning).returning();
    return result[0];
  }

  async listDriverEarnings(driverId: number, days = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    return await this.db
      .select()
      .from(schema.driverEarnings)
      .where(
        and(
          eq(schema.driverEarnings.driverId, driverId),
          sql`${schema.driverEarnings.date} >= ${cutoffDate}`
        )
      );
  }

  async getDriverTotalEarnings(driverId: number) {
    const result = await this.db
      .select({ total: sql<number>`CAST(COALESCE(SUM(${schema.driverEarnings.amount}), 0) AS INTEGER)` })
      .from(schema.driverEarnings)
      .where(eq(schema.driverEarnings.driverId, driverId));
    return result[0]?.total || 0;
  }

  // User Rewards
  async createUserReward(reward: InsertUserReward) {
    const result = await this.db.insert(schema.userRewards).values(reward).returning();
    return result[0];
  }

  async listUserRewards(userId: number, days = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    return await this.db
      .select()
      .from(schema.userRewards)
      .where(
        and(
          eq(schema.userRewards.userId, userId),
          sql`${schema.userRewards.date} >= ${cutoffDate}`
        )
      );
  }

  async getUserTotalRewards(userId: number) {
    const result = await this.db
      .select({ total: sql<number>`CAST(COALESCE(SUM(${schema.userRewards.amount}), 0) AS INTEGER)` })
      .from(schema.userRewards)
      .where(eq(schema.userRewards.userId, userId));
    return result[0]?.total || 0;
  }

  // Withdrawal Requests
  async createWithdrawalRequest(request: InsertWithdrawalRequest) {
    const result = await this.db.insert(schema.withdrawalRequests).values(request).returning();
    return result[0];
  }

  async listWithdrawalRequests(userId: number) {
    return await this.db
      .select()
      .from(schema.withdrawalRequests)
      .where(eq(schema.withdrawalRequests.userId, userId));
  }

  async updateWithdrawalRequest(id: number, request: Partial<InsertWithdrawalRequest>) {
    const result = await this.db
      .update(schema.withdrawalRequests)
      .set(request)
      .where(eq(schema.withdrawalRequests.id, id))
      .returning();
    return result[0];
  }

  // User Payments
  async createUserPayment(payment: InsertUserPayment) {
    const result = await this.db.insert(schema.userPayments).values(payment).returning();
    return result[0];
  }

  async listUserPayments(userId: number) {
    return await this.db
      .select()
      .from(schema.userPayments)
      .where(eq(schema.userPayments.userId, userId));
  }

  async listAllUserPayments() {
    return await this.db.select().from(schema.userPayments);
  }

  async updateUserPayment(id: number, payment: Partial<InsertUserPayment>) {
    const result = await this.db
      .update(schema.userPayments)
      .set(payment)
      .where(eq(schema.userPayments.id, id))
      .returning();
    return result[0];
  }

  // Driver Payments
  async createDriverPayment(payment: InsertDriverPayment) {
    const result = await this.db.insert(schema.driverPayments).values(payment).returning();
    return result[0];
  }

  async listDriverPayments(driverId: number) {
    return await this.db
      .select()
      .from(schema.driverPayments)
      .where(eq(schema.driverPayments.driverId, driverId));
  }

  async listAllDriverPayments() {
    return await this.db.select().from(schema.driverPayments);
  }

  async updateDriverPayment(id: number, payment: Partial<InsertDriverPayment>) {
    const result = await this.db
      .update(schema.driverPayments)
      .set(payment)
      .where(eq(schema.driverPayments.id, id))
      .returning();
    return result[0];
  }

  // Collection Points
  async getCollectionPoint(id: number) {
    const result = await this.db
      .select()
      .from(schema.collectionPoints)
      .where(eq(schema.collectionPoints.id, id))
      .limit(1);
    return result[0];
  }

  async createCollectionPoint(point: InsertCollectionPoint) {
    const result = await this.db.insert(schema.collectionPoints).values(point).returning();
    return result[0];
  }

  async listCollectionPoints() {
    return await this.db.select().from(schema.collectionPoints);
  }

  async updateCollectionPoint(id: number, point: Partial<InsertCollectionPoint>) {
    const result = await this.db
      .update(schema.collectionPoints)
      .set(point)
      .where(eq(schema.collectionPoints.id, id))
      .returning();
    return result[0];
  }

  async deleteCollectionPoint(id: number) {
    const result = await this.db
      .delete(schema.collectionPoints)
      .where(eq(schema.collectionPoints.id, id));
    return result.rowCount > 0;
  }

  // Waste Disposals
  async createWasteDisposal(disposal: InsertWasteDisposal) {
    const result = await this.db.insert(schema.wasteDisposals).values(disposal).returning();
    return result[0];
  }

  async listWasteDisposals(filters?: { collectionPointId?: number; wasteType?: string }) {
    if (filters?.collectionPointId) {
      return await this.db
        .select()
        .from(schema.wasteDisposals)
        .where(eq(schema.wasteDisposals.collectionPointId, filters.collectionPointId));
    }
    return await this.db.select().from(schema.wasteDisposals);
  }

  async updateWasteDisposal(id: number, disposal: Partial<InsertWasteDisposal>) {
    const result = await this.db
      .update(schema.wasteDisposals)
      .set(disposal)
      .where(eq(schema.wasteDisposals.id, id))
      .returning();
    return result[0];
  }

  // Compliance Reports
  async createComplianceReport(report: InsertComplianceReport) {
    const result = await this.db.insert(schema.complianceReports).values(report).returning();
    return result[0];
  }

  async listComplianceReports(filters?: { reportMonth?: string; reportType?: string }) {
    let query = this.db.select().from(schema.complianceReports);
    if (filters?.reportMonth) {
      query = query.where(eq(schema.complianceReports.reportMonth, filters.reportMonth));
    }
    if (filters?.reportType) {
      query = query.where(eq(schema.complianceReports.reportType, filters.reportType));
    }
    return await query;
  }

  async updateComplianceReport(id: number, report: Partial<InsertComplianceReport>) {
    const result = await this.db
      .update(schema.complianceReports)
      .set(report)
      .where(eq(schema.complianceReports.id, id))
      .returning();
    return result[0];
  }
}

export const storage = new DrizzleStorage();
