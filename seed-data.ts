import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./shared/schema";

async function seedData() {
  const db = drizzle(process.env.DATABASE_URL!, { schema });

  console.log("🌱 Seeding data...");

  // Clear existing data
  await db.delete(schema.pickups);
  await db.delete(schema.users);
  await db.delete(schema.collectionPoints);
  await db.delete(schema.wasteDisposals);

  // Create users
  const users = await db
    .insert(schema.users)
    .values([
      {
        email: "admin@bluecycle.com",
        name: "Admin Batam",
        role: "admin",
        password: "hashed_password",
        phone: "0812-xxxx-xxxx",
      },
      {
        email: "budi@example.com",
        name: "Budi Santoso",
        role: "user",
        password: "hashed_password",
        phone: "0812-1111-1111",
      },
      {
        email: "rina@example.com",
        name: "Rina Wijaya",
        role: "user",
        password: "hashed_password",
        phone: "0812-2222-2222",
      },
      {
        email: "hendra@example.com",
        name: "Hendra Kusuma",
        role: "user",
        password: "hashed_password",
        phone: "0812-3333-3333",
      },
      {
        email: "driver1@bluecycle.com",
        name: "Supir Ahmad",
        role: "driver",
        password: "hashed_password",
        phone: "0812-4444-4444",
        bankName: "BCA",
        bankAccount: "1234567890",
      },
      {
        email: "driver2@bluecycle.com",
        name: "Supir Budi",
        role: "driver",
        password: "hashed_password",
        phone: "0812-5555-5555",
        bankName: "Mandiri",
        bankAccount: "0987654321",
      },
    ])
    .returning();

  console.log("✅ Created users:", users.length);

  // Create collection points
  const points = await db
    .insert(schema.collectionPoints)
    .values([
      {
        name: "Titik Kumpul Jl. Sudirman",
        address: "Jl. Sudirman No. 123, Batam",
        latitude: "-1.1450",
        longitude: "104.7618",
        capacity: 5000,
        currentKg: 2500,
        status: "available",
        operatingHours: "08:00-17:00",
        contactPerson: "Pak Nur",
        phone: "0812-6666-6666",
      },
      {
        name: "Titik Kumpul Jl. Gatot Subroto",
        address: "Jl. Gatot Subroto No. 456, Batam",
        latitude: "-1.1520",
        longitude: "104.7700",
        capacity: 3000,
        currentKg: 1200,
        status: "available",
        operatingHours: "08:00-18:00",
        contactPerson: "Ibu Siti",
        phone: "0812-7777-7777",
      },
      {
        name: "Titik Kumpul Jl. Thamrin",
        address: "Jl. Thamrin No. 789, Batam",
        latitude: "-1.1480",
        longitude: "104.7550",
        capacity: 4000,
        currentKg: 3800,
        status: "full",
        operatingHours: "07:00-19:00",
        contactPerson: "Pak Roni",
        phone: "0812-8888-8888",
      },
    ])
    .returning();

  console.log("✅ Created collection points:", points.length);

  // Create pickups with today's date
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const pickups = await db
    .insert(schema.pickups)
    .values([
      {
        address: "Jl. Sudirman No. 123, Batam",
        wasteType: "Organik",
        quantity: "5 kg",
        deliveryMethod: "pickup",
        status: "pending",
        requestedById: users[1].id,
        assignedDriverId: users[4].id,
        scheduledDate: new Date(today.getTime() + 2 * 60 * 60 * 1000), // 2 hours from now
        notes: "Sampah dapur",
        price: 50000,
        driverEarnings: 40000,
        adminCommission: 10000,
      },
      {
        address: "Jl. Gatot Subroto No. 456, Batam",
        wasteType: "Daur Ulang",
        quantity: "10 kg",
        deliveryMethod: "pickup",
        status: "in-progress",
        requestedById: users[2].id,
        assignedDriverId: users[5].id,
        scheduledDate: new Date(today.getTime() + 1.5 * 60 * 60 * 1000), // 1.5 hours from now
        notes: "Botol plastik dan kertas",
        price: 75000,
        driverEarnings: 60000,
        adminCommission: 15000,
      },
      {
        address: "Jl. Thamrin No. 789, Batam",
        wasteType: "Umum",
        quantity: "8 kg",
        deliveryMethod: "dropoff",
        status: "pending",
        requestedById: users[3].id,
        scheduledDate: new Date(today.getTime() + 4 * 60 * 60 * 1000), // 4 hours from now
        notes: "Sampah rumah tangga",
        price: 60000,
        driverEarnings: 48000,
        adminCommission: 12000,
      },
      {
        address: "Jl. Sudirman No. 123, Batam",
        wasteType: "Plastik",
        quantity: "3 kg",
        deliveryMethod: "pickup",
        status: "completed",
        requestedById: users[1].id,
        assignedDriverId: users[4].id,
        scheduledDate: new Date(today.getTime() - 2 * 60 * 60 * 1000), // 2 hours ago
        notes: "Selesai",
        price: 40000,
        driverEarnings: 32000,
        adminCommission: 8000,
        completedAt: new Date(today.getTime() - 1 * 60 * 60 * 1000),
      },
    ])
    .returning();

  console.log("✅ Created pickups:", pickups.length);

  // Create waste disposals
  const disposals = await db
    .insert(schema.wasteDisposals)
    .values([
      {
        pickupId: pickups[0].id,
        collectionPointId: points[0].id,
        disposalType: "composting",
        disposalFacility: "Fasilitas Kompos Batam",
        disposalDate: new Date(),
        quantity: 5,
      },
      {
        pickupId: pickups[1].id,
        collectionPointId: points[1].id,
        disposalType: "recycling",
        disposalFacility: "Pusat Daur Ulang Batam",
        disposalDate: new Date(),
        quantity: 10,
      },
    ])
    .returning();

  console.log("✅ Created waste disposals:", disposals.length);

  console.log("\n✨ Seed data berhasil ditambahkan!");
}

seedData().catch(console.error);
