import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./shared/schema";

async function seedPayments() {
  const db = drizzle(process.env.DATABASE_URL!, { schema });

  console.log("💰 Adding payment data...");

  // Get existing users
  const users = await db.select().from(schema.users);
  
  if (users.length < 6) {
    console.log("Not enough users. Run seed-data.ts first.");
    return;
  }

  // Add user payments
  const userPayments = await db
    .insert(schema.userPayments)
    .values([
      {
        userId: users[1].id,
        amount: 150000,
        status: "pending",
        bankName: "BCA",
        bankAccount: "1111111111",
        requestedAt: new Date(),
      },
      {
        userId: users[2].id,
        amount: 200000,
        status: "approved",
        bankName: "Mandiri",
        bankAccount: "2222222222",
        requestedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        approvedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        adminNotes: "Disetujui",
      },
      {
        userId: users[3].id,
        amount: 100000,
        status: "completed",
        bankName: "BRI",
        bankAccount: "3333333333",
        requestedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        approvedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
        adminNotes: "Sudah ditransfer",
      },
    ])
    .returning();

  // Add driver payments
  const driverPayments = await db
    .insert(schema.driverPayments)
    .values([
      {
        driverId: users[4].id,
        amount: 320000,
        status: "pending",
        bankName: "BCA",
        bankAccount: "4444444444",
        requestedAt: new Date(),
      },
      {
        driverId: users[5].id,
        amount: 480000,
        status: "approved",
        bankName: "Mandiri",
        bankAccount: "5555555555",
        requestedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        approvedAt: new Date(),
        adminNotes: "Disetujui untuk transfer",
      },
    ])
    .returning();

  console.log("✅ Created user payments:", userPayments.length);
  console.log("✅ Created driver payments:", driverPayments.length);
  console.log("\n💰 Payment data synced!");
}

seedPayments().catch(console.error);
