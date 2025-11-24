import { User, Pickup, Route, InsertUser, InsertPickup, InsertRoute, WasteCatalogItem, InsertWasteCatalogItem } from "@shared/schema";

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
}

export class MemStorage implements IStorage {
  private users: Map<number, User> = new Map();
  private wasteCatalog: Map<number, WasteCatalogItem> = new Map();
  private pickups: Map<number, Pickup> = new Map();
  private routes: Map<number, Route> = new Map();
  private userCounter = 1;
  private catalogCounter = 1;
  private pickupCounter = 1;
  private routeCounter = 1;

  // Users
  async getUser(id: number) {
    return this.users.get(id);
  }

  async getUserByEmail(email: string) {
    return Array.from(this.users.values()).find((u) => u.email === email);
  }

  async createUser(user: InsertUser) {
    const id = this.userCounter++;
    const newUser: User = {
      id,
      email: user.email,
      name: user.name,
      role: user.role,
      password: user.password || null,
      phone: user.phone || null,
      createdAt: new Date(),
    };
    this.users.set(id, newUser);
    return newUser;
  }

  async listUsers() {
    return Array.from(this.users.values());
  }

  async updateUser(id: number, user: Partial<InsertUser>) {
    const existing = this.users.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...user };
    this.users.set(id, updated);
    return updated;
  }

  async deleteUser(id: number) {
    return this.users.delete(id);
  }

  // Waste Catalog
  async getWasteCatalogItem(id: number) {
    return this.wasteCatalog.get(id);
  }

  async createWasteCatalogItem(item: InsertWasteCatalogItem) {
    const id = this.catalogCounter++;
    const newItem: WasteCatalogItem = {
      id,
      userId: item.userId,
      wasteType: item.wasteType,
      description: item.description || null,
      createdAt: new Date(),
    };
    this.wasteCatalog.set(id, newItem);
    return newItem;
  }

  async listWasteCatalog(userId: number) {
    return Array.from(this.wasteCatalog.values()).filter((item) => item.userId === userId);
  }

  async deleteWasteCatalogItem(id: number) {
    return this.wasteCatalog.delete(id);
  }

  // Pickups
  async getPickup(id: number) {
    return this.pickups.get(id);
  }

  async createPickup(pickup: InsertPickup) {
    const id = this.pickupCounter++;
    const newPickup: Pickup = {
      id,
      address: pickup.address,
      wasteType: pickup.wasteType,
      status: pickup.status || "pending",
      requestedById: pickup.requestedById,
      assignedDriverId: pickup.assignedDriverId || null,
      scheduledDate: pickup.scheduledDate || null,
      notes: pickup.notes || null,
      createdAt: new Date(),
      completedAt: null,
      cancelledAt: null,
      cancellationReason: null,
    };
    this.pickups.set(id, newPickup);
    return newPickup;
  }

  async listPickups(filters?: { status?: string; requestedById?: number; assignedDriverId?: number }) {
    let result = Array.from(this.pickups.values());
    if (filters?.status) {
      result = result.filter((p) => p.status === filters.status);
    }
    if (filters?.requestedById) {
      result = result.filter((p) => p.requestedById === filters.requestedById);
    }
    if (filters?.assignedDriverId) {
      result = result.filter((p) => p.assignedDriverId === filters.assignedDriverId);
    }
    return result;
  }

  async updatePickup(id: number, pickup: Partial<InsertPickup>) {
    const existing = this.pickups.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...pickup };
    this.pickups.set(id, updated);
    return updated;
  }

  async deletePickup(id: number) {
    return this.pickups.delete(id);
  }

  // Routes
  async getRoute(id: number) {
    return this.routes.get(id);
  }

  async createRoute(route: InsertRoute) {
    const id = this.routeCounter++;
    const newRoute: Route = {
      id,
      driverId: route.driverId,
      name: route.name,
      status: route.status || "pending",
      pickupIds: route.pickupIds || null,
      createdAt: new Date(),
      startedAt: null,
      completedAt: null,
    };
    this.routes.set(id, newRoute);
    return newRoute;
  }

  async listRoutes(driverId?: number) {
    let result = Array.from(this.routes.values());
    if (driverId) {
      result = result.filter((r) => r.driverId === driverId);
    }
    return result;
  }

  async updateRoute(id: number, route: Partial<InsertRoute>) {
    const existing = this.routes.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...route };
    this.routes.set(id, updated);
    return updated;
  }

  async deleteRoute(id: number) {
    return this.routes.delete(id);
  }
}

export const storage = new MemStorage();
