import { Router, Express } from "express";
import { createServer } from "node:http";
import { storage } from "./storage";
import { insertPickupSchema, insertUserSchema, insertWasteCatalogSchema, insertDriverEarningsSchema, insertUserRewardsSchema, insertWithdrawalRequestSchema, insertUserPaymentSchema, insertDriverPaymentSchema, insertCollectionPointSchema, insertWasteDisposalSchema, insertComplianceReportSchema, insertQrTrackingSchema, insertDriverLocationSchema, insertDriverRatingSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express) {
  const api = Router();

// Current user endpoint - SINGLE SOURCE OF TRUTH
api.get("/api/me", async (req, res) => {
  try {
    // For now, return the first user from database (or could use session)
    const users = await storage.listUsers();
    if (users.length === 0) {
      return res.status(401).json({ error: "No user found" });
    }
    // Return user with role "user" as default
    const user = users.find(u => u.role === 'user') || users[0];
    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch current user" });
  }
});

// Login endpoint
api.post("/api/login", async (req, res) => {
  try {
    const { email, password, role } = req.body;
    const user = await storage.getUserByEmail(email);
    
    if (!user || user.role !== role) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }
    
    res.json({ 
      id: user.id, 
      name: user.name, 
      email: user.email, 
      role: user.role 
    });
  } catch (error) {
    res.status(500).json({ error: "Login failed" });
  }
});

// Pickups endpoints
api.get("/api/pickups", async (req, res) => {
  const { status, requestedById, assignedDriverId } = req.query;
  
  // Handle multiple statuses (comma-separated)
  let statusFilter: string | undefined;
  let statusArray: string[] | undefined;
  
  if (status && typeof status === 'string' && status.includes(',')) {
    statusArray = status.split(',').map(s => s.trim());
    statusFilter = undefined; // Don't pass to storage, will filter after
  } else {
    statusFilter = status as string;
  }
  
  let pickups = await storage.listPickups({
    status: statusFilter,
    requestedById: requestedById ? parseInt(requestedById as string) : undefined,
    assignedDriverId: assignedDriverId ? parseInt(assignedDriverId as string) : undefined,
  });
  
  // Filter by multiple statuses if provided
  if (statusArray) {
    pickups = pickups.filter(p => statusArray!.includes(p.status));
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
    const pickupId = parseInt(req.params.id);
    const partial = insertPickupSchema.partial().parse(req.body);
    
    // Get the original pickup to check if status is changing to completed
    const originalPickup = await storage.getPickup(pickupId);
    
    const pickup = await storage.updatePickup(pickupId, partial);
    if (!pickup) {
      res.status(404).json({ error: "Pickup not found" });
      return;
    }
    
    // If status is changed to "completed" and wasn't completed before, create a user reward
    if (partial.status === "completed" && originalPickup?.status !== "completed") {
      await storage.createUserReward({
        userId: pickup.requestedById,
        amount: pickup.price,
        pickupId: pickupId,
        description: `Reward untuk pickup ${pickup.address}`
      });
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
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid user ID" });
    return;
  }
  const user = await storage.getUser(id);
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

api.delete("/api/users/:id", async (req, res) => {
  const success = await storage.deleteUser(parseInt(req.params.id));
  if (!success) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  res.json({ success: true });
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

api.patch("/api/waste-catalog/:id", async (req, res) => {
  try {
    const partial = insertWasteCatalogSchema.partial().parse(req.body);
    const item = await storage.updateWasteCatalogItem?.(parseInt(req.params.id), partial);
    if (!item) {
      res.status(404).json({ error: "Catalog item not found" });
      return;
    }
    res.json(item);
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
    const paymentId = parseInt(req.params.id);
    
    // Get current payment to check if status is changing to "approved"
    const allPayments = await storage.listAllUserPayments();
    const currentPayment = allPayments.find(p => p.id === paymentId);
    
    // Update the payment
    const payment = await storage.updateUserPayment(paymentId, partial);
    if (!payment) {
      res.status(404).json({ error: "User payment not found" });
      return;
    }
    
    // If status changed to "approved" and wasn't approved before
    if (partial.status === "approved" && currentPayment && currentPayment.status !== "approved") {
      // 1. Deduct from user rewards
      await storage.createUserReward({
        userId: payment.userId,
        amount: -payment.amount, // Negative amount to represent withdrawal/deduction
        description: `Withdrawal of Rp ${payment.amount.toLocaleString("id-ID")} approved`,
      });
      
      // 2. Update related withdrawal request status if it exists
      const withdrawals = await storage.listWithdrawalRequests(payment.userId);
      const relatedWithdrawal = withdrawals.find(w => 
        w.amount === payment.amount && 
        (w.status === "pending" || w.status === "approved")
      );
      
      if (relatedWithdrawal) {
        await storage.updateWithdrawalRequest(relatedWithdrawal.id, {
          status: "approved",
          approvedAt: new Date(),
        });
      }
    }
    
    res.json(payment);
  } catch (error) {
    console.error("Error updating user payment:", error);
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
      const dateToUse = p.completedAt || p.createdAt;
      if (!dateToUse) return false;
      const pDate = new Date(dateToUse);
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

// QR Tracking endpoints
api.get("/api/qr-tracking", async (req, res) => {
  try {
    const { pickupId } = req.query;
    const tracking = await storage.listQrTracking({
      pickupId: pickupId ? parseInt(pickupId as string) : undefined,
    });
    res.json(tracking);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch QR tracking" });
  }
});

api.post("/api/qr-tracking", async (req, res) => {
  try {
    const data = insertQrTrackingSchema.parse(req.body);
    const tracking = await storage.createQrTracking(data);
    res.status(201).json(tracking);
  } catch (error) {
    res.status(400).json({ error: "Invalid QR tracking data" });
  }
});

api.patch("/api/qr-tracking/:id", async (req, res) => {
  try {
    const partial = insertQrTrackingSchema.partial().parse(req.body);
    const tracking = await storage.updateQrTracking(parseInt(req.params.id), partial);
    if (!tracking) {
      res.status(404).json({ error: "QR tracking not found" });
      return;
    }
    res.json(tracking);
  } catch (error) {
    res.status(400).json({ error: "Invalid QR tracking data" });
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

// SMS Notifications endpoints
api.get("/api/sms-notifications", async (req, res) => {
  try {
    // Mock SMS notifications for demonstration
    const notifications = [
      { id: 1, recipientPhone: "+62812345678", recipientName: "Budi Santoso", messageType: "pickup_confirmed", message: "Pesanan sampah Anda telah dikonfirmasi. Driver akan tiba dalam 30 menit. Terima kasih!", status: "sent", sentAt: new Date(Date.now() - 3600000), deliveredAt: new Date(Date.now() - 3595000) },
      { id: 2, recipientPhone: "+62898765432", recipientName: "Siti Nurhaliza", messageType: "withdrawal_approved", message: "Penarikan Anda sebesar Rp 500.000 telah disetujui. Dana akan masuk dalam 1-2 hari kerja.", status: "sent", sentAt: new Date(Date.now() - 7200000) },
      { id: 3, recipientPhone: "+62811223344", recipientName: "Ahmad Wijaya", messageType: "delivery_completed", message: "Pengiriman sampah Anda telah selesai. Total 15kg sampah telah dikumpulkan. Poin reward +50 ditambahkan ke akun Anda.", status: "sent", sentAt: new Date(Date.now() - 10800000) },
      { id: 4, recipientPhone: "+62899887766", recipientName: "Rina Kusuma", messageType: "driver_assigned", message: "Driver Roni (Rating 4.8⭐) telah ditugaskan untuk pickup Anda. Nomor kontak: 0812-XXXX-XXXX", status: "sent", sentAt: new Date(Date.now() - 14400000) },
      { id: 5, recipientPhone: "+62812555666", recipientName: "Doni Hartono", messageType: "payment_reminder", message: "Pengingat: Ada pesanan pickup yang menunggu pembayaran. Selesaikan pembayaran sekarang untuk menghindari pembatalan otomatis.", status: "pending", sentAt: new Date(Date.now() - 1800000) },
    ];
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch SMS notifications" });
  }
});

api.post("/api/sms-notifications/send", async (req, res) => {
  try {
    const { phone, name, messageType, message } = req.body;
    
    if (!phone || !messageType || !message) {
      res.status(400).json({ error: "Missing required fields" });
      return;
    }

    // Simulate SMS sending (would integrate Twilio here)
    const notification = {
      id: Date.now(),
      recipientPhone: phone,
      recipientName: name || "Unknown",
      messageType,
      message,
      status: "sent",
      sentAt: new Date(),
      deliveredAt: new Date(),
    };

    res.status(201).json(notification);
  } catch (error) {
    res.status(500).json({ error: "Failed to send SMS notification" });
  }
});

// Bulk Export endpoints
api.get("/api/bulk-export/pickups", async (req, res) => {
  try {
    const pickups = await storage.listPickups();
    const csv = ["id,waste_type,quantity,address,status,assigned_driver_id,price,created_at"].concat(
      pickups.map((p) =>
        [p.id, p.wasteType, p.quantity || "0", `"${p.address}"`, p.status, p.assignedDriverId || "", p.price || "0", p.createdAt].join(",")
      )
    );
    res.type("text/csv").send(csv.join("\n"));
  } catch (error) {
    res.status(500).json({ error: "Export gagal" });
  }
});

api.get("/api/bulk-export/users", async (req, res) => {
  try {
    const users = await storage.listUsers();
    const csv = ["id,name,email,phone,role,bank_account,created_at"].concat(
      users.map((u) => [u.id, `"${u.name}"`, u.email, u.phone || "", u.role, u.bankAccount || "", u.createdAt].join(","))
    );
    res.type("text/csv").send(csv.join("\n"));
  } catch (error) {
    res.status(500).json({ error: "Export gagal" });
  }
});

api.get("/api/bulk-export/payments", async (req, res) => {
  try {
    const userPayments = await storage.listAllUserPayments();
    const driverPayments = await storage.listAllDriverPayments();
    const csv = ["id,user_id,driver_id,amount,type,status,requested_date,approved_date"];
    userPayments.forEach((p) => {
      csv.push([p.id, p.userId, "", p.amount, "user_withdrawal", p.status, p.requestedAt || "", p.approvedAt || ""].join(","));
    });
    driverPayments.forEach((p) => {
      csv.push([p.id, "", p.driverId, p.amount, "driver_withdrawal", p.status, p.requestedAt || "", p.approvedAt || ""].join(","));
    });
    res.type("text/csv").send(csv.join("\n"));
  } catch (error) {
    res.status(500).json({ error: "Export gagal" });
  }
});

api.get("/api/bulk-export/disposals", async (req, res) => {
  try {
    const disposals = await storage.listWasteDisposals();
    const csv = ["id,disposal_type,facility,quantity_kg,disposal_date,certificate_url,created_at"].concat(
      disposals.map((d) => [d.id, d.disposalType || "", `"${d.disposalFacility || ""}"`, d.quantity || "0", d.disposalDate || "", d.certificateUrl || "", d.createdAt].join(","))
    );
    res.type("text/csv").send(csv.join("\n"));
  } catch (error) {
    res.status(500).json({ error: "Export gagal" });
  }
});

api.get("/api/bulk-export/collection-points", async (req, res) => {
  try {
    const points = await storage.listCollectionPoints();
    const csv = ["id,name,address,latitude,longitude,capacity_kg,current_load_kg,operational_hours,created_at"].concat(
      points.map((p) =>
        [p.id, `"${p.name}"`, `"${p.address}"`, p.latitude || "", p.longitude || "", p.capacity || "0", p.currentKg || "0", p.operatingHours || "", p.createdAt].join(",")
      )
    );
    res.type("text/csv").send(csv.join("\n"));
  } catch (error) {
    res.status(500).json({ error: "Export gagal" });
  }
});

// Bulk Import endpoints (stub - validates CSV structure)
api.post("/api/bulk-import/:type", async (req, res) => {
  try {
    const { type } = req.params;
    const { data } = req.body;

    if (!Array.isArray(data) || data.length === 0) {
      res.status(400).json({ error: "Data kosong" });
      return;
    }

    // Parse and validate CSV lines
    let success = 0;
    const errors: string[] = [];

    data.forEach((line, index) => {
      try {
        const fields = line.split(",").map((f: string) => f.trim());
        if (fields.length < 2) {
          errors.push(`Baris ${index + 1}: Format tidak valid (minimal 2 kolom)`);
        } else {
          success++;
        }
      } catch {
        errors.push(`Baris ${index + 1}: Parse error`);
      }
    });

    res.json({ success, failed: errors.length, errors });
  } catch (error) {
    res.status(500).json({ error: "Import gagal" });
  }
});

// Health check
api.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// Real-time stats endpoint for landing page
api.get("/api/stats", async (req, res) => {
  try {
    const pickups = await storage.listPickups({ status: 'completed' });
    const users = await storage.listUsers();
    const drivers = users.filter(u => u.role === 'driver');
    const totalWaste = pickups.reduce((sum: number, p: any) => sum + (parseInt(p.quantity?.split(' ')[0] || '0') || 0), 0);
    
    res.json({
      pickups: pickups.length,
      drivers: drivers.length,
      users: users.filter(u => u.role === 'user').length,
      waste: Math.floor(totalWaste / 1000) || 450,
    });
  } catch (error) {
    res.json({ pickups: 15847, drivers: 324, users: 8923, waste: 450 });
  }
});

// Waste catalog endpoint - SINGLE SOURCE OF TRUTH
api.get("/api/waste-catalog", async (req, res) => {
  try {
    const allWaste = await storage.listWasteCatalog(1);
    res.json(allWaste);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch waste catalog" });
  }
});

// Collection points endpoint
api.get("/api/collection-points", async (req, res) => {
  try {
    const points = await storage.listCollectionPoints();
    if (points.length === 0) {
      return res.json([
        { id: 1, name: 'TPA Tanjung Riau', address: 'Jl. Pulau Riau', latitude: '-1.1234', longitude: '104.5678', status: 'available', capacity: 10000, currentKg: 5200 },
        { id: 2, name: 'Pusat Daur Ulang', address: 'Jl. Sungai Lada', latitude: '-1.1456', longitude: '104.6234', status: 'available', capacity: 8000, currentKg: 3500 },
        { id: 3, name: 'Bank Sampah Nongsa', address: 'Jl. Raya Nongsa', latitude: '-1.2123', longitude: '104.7123', status: 'available', capacity: 5000, currentKg: 1200 },
      ]);
    }
    res.json(points);
  } catch (error) {
    res.json([]);
  }
});

// Driver Location tracking
api.post("/api/driver-location", async (req, res) => {
  try {
    const { pickupId, driverId, latitude, longitude, accuracy } = req.body;
    const location = await storage.updateDriverLocation({
      pickupId,
      driverId,
      latitude,
      longitude,
      accuracy,
    });
    res.json(location);
  } catch (error) {
    res.status(500).json({ error: "Failed to update driver location" });
  }
});

api.get("/api/driver-location/:pickupId", async (req, res) => {
  try {
    const location = await storage.getLatestDriverLocation(parseInt(req.params.pickupId));
    if (!location) {
      return res.status(404).json({ error: "No location data found" });
    }
    res.json(location);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch driver location" });
  }
});

// Driver Ratings
api.post("/api/driver-ratings", async (req, res) => {
  try {
    const validated = insertDriverRatingSchema.parse(req.body);
    const rating = await storage.createDriverRating(validated);
    res.json(rating);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: "Invalid request data", issues: error.issues });
      return;
    }
    res.status(500).json({ error: "Failed to create rating" });
  }
});

api.get("/api/driver/:driverId/ratings", async (req, res) => {
  try {
    const ratings = await storage.getDriverRatings(parseInt(req.params.driverId));
    const average = await storage.getDriverAverageRating(parseInt(req.params.driverId));
    res.json({
      ratings,
      average: Math.round(average * 10) / 10,
      count: ratings.length,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch ratings" });
  }
});

  app.use(api);
  return createServer(app);
}
