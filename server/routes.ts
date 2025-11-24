import { Router, Express } from "express";
import { createServer } from "node:http";
import { storage } from "./storage";
import { insertPickupSchema, insertUserSchema, insertWasteCatalogSchema, insertDriverEarningsSchema, insertUserRewardsSchema, insertWithdrawalRequestSchema, insertUserPaymentSchema, insertDriverPaymentSchema, insertCollectionPointSchema, insertWasteDisposalSchema, insertComplianceReportSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express) {
  const api = Router();

// Pickups endpoints
api.get("/api/pickups", async (req, res) => {
  const { status, requestedById, assignedDriverId } = req.query;
  let pickups = await storage.listPickups({
    status: status as string,
    requestedById: requestedById ? parseInt(requestedById as string) : undefined,
    assignedDriverId: assignedDriverId ? parseInt(assignedDriverId as string) : undefined,
  });
  // Handle multiple statuses (comma-separated)
  if (status && typeof status === 'string' && status.includes(',')) {
    const statuses = status.split(',').map(s => s.trim());
    pickups = pickups.filter(p => statuses.includes(p.status));
  }
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

// Driver Earnings endpoints
api.get("/api/driver-earnings/:driverId", async (req, res) => {
  const earnings = await storage.listDriverEarnings(parseInt(req.params.driverId));
  res.json(earnings);
});

api.post("/api/driver-earnings", async (req, res) => {
  try {
    const data = insertDriverEarningsSchema.parse(req.body);
    const earning = await storage.createDriverEarning(data);
    res.status(201).json(earning);
  } catch (error) {
    res.status(400).json({ error: "Invalid earnings data" });
  }
});

// User Rewards endpoints
api.get("/api/user-rewards/:userId", async (req, res) => {
  const rewards = await storage.listUserRewards(parseInt(req.params.userId));
  res.json(rewards);
});

api.post("/api/user-rewards", async (req, res) => {
  try {
    const data = insertUserRewardsSchema.parse(req.body);
    const reward = await storage.createUserReward(data);
    res.status(201).json(reward);
  } catch (error) {
    res.status(400).json({ error: "Invalid rewards data" });
  }
});

// Withdrawal Requests endpoints
api.get("/api/withdrawals/:userId", async (req, res) => {
  const withdrawals = await storage.listWithdrawalRequests(parseInt(req.params.userId));
  res.json(withdrawals);
});

api.post("/api/withdrawals", async (req, res) => {
  try {
    const data = insertWithdrawalRequestSchema.parse(req.body);
    const withdrawal = await storage.createWithdrawalRequest(data);
    res.status(201).json(withdrawal);
  } catch (error) {
    res.status(400).json({ error: "Invalid withdrawal data" });
  }
});

api.patch("/api/withdrawals/:id", async (req, res) => {
  try {
    const partial = insertWithdrawalRequestSchema.partial().parse(req.body);
    const withdrawal = await storage.updateWithdrawalRequest(parseInt(req.params.id), partial);
    if (!withdrawal) {
      res.status(404).json({ error: "Withdrawal not found" });
      return;
    }
    res.json(withdrawal);
  } catch (error) {
    res.status(400).json({ error: "Invalid withdrawal data" });
  }
});

// User Payments endpoints
api.get("/api/user-payments", async (req, res) => {
  try {
    const payments = await storage.listAllUserPayments();
    res.json(payments);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch user payments" });
  }
});

api.get("/api/user-payments/:userId", async (req, res) => {
  const payments = await storage.listUserPayments(parseInt(req.params.userId));
  res.json(payments);
});

api.post("/api/user-payments", async (req, res) => {
  try {
    const data = insertUserPaymentSchema.parse(req.body);
    const payment = await storage.createUserPayment(data);
    res.status(201).json(payment);
  } catch (error) {
    res.status(400).json({ error: "Invalid user payment data" });
  }
});

api.patch("/api/user-payments/:id", async (req, res) => {
  try {
    const partial = insertUserPaymentSchema.partial().parse(req.body);
    const payment = await storage.updateUserPayment(parseInt(req.params.id), partial);
    if (!payment) {
      res.status(404).json({ error: "User payment not found" });
      return;
    }
    res.json(payment);
  } catch (error) {
    res.status(400).json({ error: "Invalid user payment data" });
  }
});

// Driver Payments endpoints
api.get("/api/driver-payments", async (req, res) => {
  try {
    const payments = await storage.listAllDriverPayments();
    res.json(payments);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch driver payments" });
  }
});

api.get("/api/driver-payments/:driverId", async (req, res) => {
  const payments = await storage.listDriverPayments(parseInt(req.params.driverId));
  res.json(payments);
});

api.post("/api/driver-payments", async (req, res) => {
  try {
    const data = insertDriverPaymentSchema.parse(req.body);
    const payment = await storage.createDriverPayment(data);
    res.status(201).json(payment);
  } catch (error) {
    res.status(400).json({ error: "Invalid driver payment data" });
  }
});

api.patch("/api/driver-payments/:id", async (req, res) => {
  try {
    const partial = insertDriverPaymentSchema.partial().parse(req.body);
    const payment = await storage.updateDriverPayment(parseInt(req.params.id), partial);
    if (!payment) {
      res.status(404).json({ error: "Driver payment not found" });
      return;
    }
    res.json(payment);
  } catch (error) {
    res.status(400).json({ error: "Invalid driver payment data" });
  }
});

// Collection Points endpoints
api.get("/api/collection-points", async (req, res) => {
  const points = await storage.listCollectionPoints();
  res.json(points);
});

api.get("/api/collection-points/:id", async (req, res) => {
  const point = await storage.getCollectionPoint(parseInt(req.params.id));
  if (!point) {
    res.status(404).json({ error: "Collection point not found" });
    return;
  }
  res.json(point);
});

api.post("/api/collection-points", async (req, res) => {
  try {
    const data = insertCollectionPointSchema.parse(req.body);
    const point = await storage.createCollectionPoint(data);
    res.status(201).json(point);
  } catch (error) {
    res.status(400).json({ error: "Invalid collection point data" });
  }
});

api.patch("/api/collection-points/:id", async (req, res) => {
  try {
    const partial = insertCollectionPointSchema.partial().parse(req.body);
    const point = await storage.updateCollectionPoint(parseInt(req.params.id), partial);
    if (!point) {
      res.status(404).json({ error: "Collection point not found" });
      return;
    }
    res.json(point);
  } catch (error) {
    res.status(400).json({ error: "Invalid collection point data" });
  }
});

api.delete("/api/collection-points/:id", async (req, res) => {
  const success = await storage.deleteCollectionPoint(parseInt(req.params.id));
  if (!success) {
    res.status(404).json({ error: "Collection point not found" });
    return;
  }
  res.json({ success: true });
});

// Waste Disposals endpoints
api.get("/api/waste-disposals", async (req, res) => {
  const { collectionPointId } = req.query;
  const disposals = await storage.listWasteDisposals({
    collectionPointId: collectionPointId ? parseInt(collectionPointId as string) : undefined,
  });
  res.json(disposals);
});

api.post("/api/waste-disposals", async (req, res) => {
  try {
    const data = insertWasteDisposalSchema.parse(req.body);
    const disposal = await storage.createWasteDisposal(data);
    res.status(201).json(disposal);
  } catch (error) {
    res.status(400).json({ error: "Invalid waste disposal data" });
  }
});

api.patch("/api/waste-disposals/:id", async (req, res) => {
  try {
    const partial = insertWasteDisposalSchema.partial().parse(req.body);
    const disposal = await storage.updateWasteDisposal(parseInt(req.params.id), partial);
    if (!disposal) {
      res.status(404).json({ error: "Waste disposal not found" });
      return;
    }
    res.json(disposal);
  } catch (error) {
    res.status(400).json({ error: "Invalid waste disposal data" });
  }
});

// TPA Waste Stock endpoints
api.get("/api/tpa-waste", async (req, res) => {
  try {
    const data = [
      { id: 1, tpaName: "TPA Batam Utara", address: "Jl. Batang Hari, Batam", wasteType: "Plastik", totalKg: 5000, capacity: 10000 },
      { id: 2, tpaName: "TPA Batam Utara", address: "Jl. Batang Hari, Batam", wasteType: "Kertas", totalKg: 3000, capacity: 8000 },
      { id: 3, tpaName: "TPA Batam Utara", address: "Jl. Batang Hari, Batam", wasteType: "Logam", totalKg: 2000, capacity: 5000 },
      { id: 4, tpaName: "TPA Batam Utara", address: "Jl. Batang Hari, Batam", wasteType: "Organik", totalKg: 4000, capacity: 12000 },
      { id: 5, tpaName: "TPA Batam Timur", address: "Jl. Gajah Mada, Batam", wasteType: "Plastik", totalKg: 6000, capacity: 10000 },
      { id: 6, tpaName: "TPA Batam Timur", address: "Jl. Gajah Mada, Batam", wasteType: "Daur Ulang", totalKg: 7000, capacity: 15000 },
    ];
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch TPA data" });
  }
});

// Compliance Reports endpoints
api.get("/api/compliance-reports", async (req, res) => {
  try {
    const { reportMonth, reportType } = req.query;
    const reports = await storage.listComplianceReports({
      reportMonth: reportMonth as string | undefined,
      reportType: reportType as string | undefined,
    });
    res.json(reports);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch compliance reports" });
  }
});

api.post("/api/compliance-reports", async (req, res) => {
  try {
    const data = insertComplianceReportSchema.parse(req.body);
    const report = await storage.createComplianceReport(data);
    res.status(201).json(report);
  } catch (error) {
    res.status(400).json({ error: "Invalid compliance report data" });
  }
});

api.patch("/api/compliance-reports/:id", async (req, res) => {
  try {
    const partial = insertComplianceReportSchema.partial().parse(req.body);
    const report = await storage.updateComplianceReport(parseInt(req.params.id), partial);
    if (!report) {
      res.status(404).json({ error: "Report not found" });
      return;
    }
    res.json(report);
  } catch (error) {
    res.status(400).json({ error: "Invalid report data" });
  }
});

api.post("/api/compliance-reports/generate/:month/:year", async (req, res) => {
  try {
    const { month, year } = req.params;
    const monthStr = `${year}-${String(month).padStart(2, "0")}`;
    
    const pickups = await storage.listPickups({ status: "completed" });
    const disposals = await storage.listWasteDisposals();
    
    const monthPickups = pickups.filter(p => {
      const pDate = new Date(p.completedAt || p.createdAt);
      return pDate.getMonth() + 1 === parseInt(month) && pDate.getFullYear() === parseInt(year);
    });
    
    const totalOrders = monthPickups.length;
    const totalRevenue = monthPickups.reduce((sum, p) => sum + (p.price || 0), 0);
    const adminCommission = Math.round(totalRevenue * 0.2);
    const driverEarnings = Math.round(totalRevenue * 0.8);
    const totalKgCollected = monthPickups.reduce((sum, p) => {
      const qty = parseInt(p.quantity || "0") || 0;
      return sum + qty;
    }, 0);
    
    const recycledDisposals = disposals.filter(d => d.disposalType === "recycling");
    const landfillDisposals = disposals.filter(d => d.disposalType === "landfill");
    const totalWasteRecycled = recycledDisposals.reduce((sum, d) => sum + (d.quantity || 0), 0);
    const wasteLandfilled = landfillDisposals.reduce((sum, d) => sum + (d.quantity || 0), 0);
    const recyclablePercentage = totalKgCollected > 0 ? Math.round((totalWasteRecycled / totalKgCollected) * 100) : 0;
    
    const users = await storage.listUsers();
    const activeUsers = users.filter(u => u.role === "user").length;
    const activeDrivers = users.filter(u => u.role === "driver").length;
    
    const report = await storage.createComplianceReport({
      reportMonth: monthStr,
      reportType: "monthly",
      totalOrders,
      totalKgCollected,
      totalRevenue,
      recyclablePercentage,
    });
    
    res.status(201).json(report);
  } catch (error) {
    console.error("Error generating report:", error);
    res.status(500).json({ error: "Failed to generate report" });
  }
});

// Vendors/Suppliers endpoints
api.get("/api/vendors", async (req, res) => {
  try {
    const data = [
      { id: 1, name: "Pengepul Plastik Batam", address: "Jl. Sudirman No. 123, Batam", phone: "08xx-xxxx-xxxx", wasteTypes: ["Plastik"], totalCapacity: 5000, currentStock: 2500 },
      { id: 2, name: "Koperasi Daur Ulang", address: "Jl. Gatot Subroto No. 456, Batam", phone: "08xx-xxxx-xxxx", wasteTypes: ["Kertas", "Logam"], totalCapacity: 8000, currentStock: 5000 },
    ];
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch vendors" });
  }
});

// Health check
api.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

  app.use(api);
  return createServer(app);
}
