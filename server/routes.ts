import { Router, Express } from "express";
import { createServer } from "node:http";
import { storage } from "./storage";
import { insertPickupSchema, insertUserSchema, insertWasteCatalogSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express) {
  const api = Router();

// Pickups endpoints
api.get("/api/pickups", async (req, res) => {
  const { status, requestedById } = req.query;
  const pickups = await storage.listPickups({
    status: status as string,
    requestedById: requestedById ? parseInt(requestedById as string) : undefined,
  });
  res.json(pickups);
});

api.get("/api/pickups/:id", async (req, res) => {
  const pickup = await storage.getPickup(parseInt(req.params.id));
  if (!pickup) {
    res.status(404).json({ error: "Pickup not found" });
    return;
  }
  res.json(pickup);
});

api.post("/api/pickups", async (req, res) => {
  try {
    const data = insertPickupSchema.parse(req.body);
    const pickup = await storage.createPickup(data);
    res.status(201).json(pickup);
  } catch (error) {
    res.status(400).json({ error: "Invalid pickup data" });
  }
});

api.patch("/api/pickups/:id", async (req, res) => {
  try {
    const partial = insertPickupSchema.partial().parse(req.body);
    const pickup = await storage.updatePickup(parseInt(req.params.id), partial);
    if (!pickup) {
      res.status(404).json({ error: "Pickup not found" });
      return;
    }
    res.json(pickup);
  } catch (error) {
    res.status(400).json({ error: "Invalid pickup data" });
  }
});

api.delete("/api/pickups/:id", async (req, res) => {
  const success = await storage.deletePickup(parseInt(req.params.id));
  if (!success) {
    res.status(404).json({ error: "Pickup not found" });
    return;
  }
  res.json({ success: true });
});

// Users endpoints
api.get("/api/users", async (req, res) => {
  const users = await storage.listUsers();
  res.json(users);
});

api.get("/api/users/:id", async (req, res) => {
  const user = await storage.getUser(parseInt(req.params.id));
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  res.json(user);
});

api.post("/api/users", async (req, res) => {
  try {
    const data = insertUserSchema.parse(req.body);
    const user = await storage.createUser(data);
    res.status(201).json(user);
  } catch (error) {
    res.status(400).json({ error: "Invalid user data" });
  }
});

api.patch("/api/users/:id", async (req, res) => {
  try {
    const partial = insertUserSchema.partial().parse(req.body);
    const user = await storage.updateUser(parseInt(req.params.id), partial);
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    res.json(user);
  } catch (error) {
    res.status(400).json({ error: "Invalid user data" });
  }
});

// Routes endpoints
api.get("/api/routes", async (req, res) => {
  const { driverId } = req.query;
  const routes = await storage.listRoutes(driverId ? parseInt(driverId as string) : undefined);
  res.json(routes);
});

api.post("/api/routes", async (req, res) => {
  try {
    const data = {
      driverId: parseInt(req.body.driverId),
      name: req.body.name,
      status: "pending",
      pickupIds: req.body.pickupIds || "[]",
    };
    const route = await storage.createRoute(data);
    res.status(201).json(route);
  } catch (error) {
    res.status(400).json({ error: "Invalid route data" });
  }
});

api.patch("/api/routes/:id", async (req, res) => {
  try {
    const { name, status, pickupIds } = req.body;
    const route = await storage.updateRoute(parseInt(req.params.id), {
      name,
      status,
      pickupIds,
    });
    if (!route) {
      res.status(404).json({ error: "Route not found" });
      return;
    }
    res.json(route);
  } catch (error) {
    res.status(400).json({ error: "Invalid route data" });
  }
});

// Waste Catalog endpoints
api.get("/api/waste-catalog/:userId", async (req, res) => {
  const catalog = await storage.listWasteCatalog(parseInt(req.params.userId));
  res.json(catalog);
});

api.post("/api/waste-catalog", async (req, res) => {
  try {
    const data = insertWasteCatalogSchema.parse(req.body);
    const item = await storage.createWasteCatalogItem(data);
    res.status(201).json(item);
  } catch (error) {
    res.status(400).json({ error: "Invalid waste catalog data" });
  }
});

api.delete("/api/waste-catalog/:id", async (req, res) => {
  const success = await storage.deleteWasteCatalogItem(parseInt(req.params.id));
  if (!success) {
    res.status(404).json({ error: "Catalog item not found" });
    return;
  }
  res.json({ success: true });
});

// Health check
api.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

  app.use(api);
  return createServer(app);
}
