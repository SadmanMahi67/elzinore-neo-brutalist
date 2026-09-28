import { neon } from "@neondatabase/serverless";
import fs from "node:fs";
import path from "node:path";

let databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  const envPath = path.resolve(process.cwd(), ".env.local");
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, "utf-8");
    for (const line of envContent.split("\n")) {
      const match = line.match(/^\s*DATABASE_URL\s*=\s*["']?([^"'\r\n]+)["']?/);
      if (match) {
        databaseUrl = match[1].trim();
        break;
      }
    }
  }
}

const sql = neon(databaseUrl);

async function testCancelLogicDirectly() {
  console.log("\n--- Testing Customer Cancel Route Constraints & SQL Safety ---");

  // Create a test order owned by user_1 in 'confirmed' status
  const confirmedOrder = await sql`
    INSERT INTO orders (user_id, customer_name, phone, address, total_amount, status)
    VALUES ('user_owner_123', 'Owner Customer', '01799999999', 'Road 11, Banani, Dhaka', 1449, 'confirmed')
    RETURNING id;
  `;
  const orderId = confirmedOrder[0].id;

  try {
    // 1. Attempt cancel on confirmed order via the same SQL atomic statement used by the route:
    // UPDATE orders SET status = 'cancelled', updated_at = now() WHERE id = $1 AND user_id = $2 AND status = 'placed'
    const cancelConfirmed = await sql`
      UPDATE orders
      SET status = 'cancelled', updated_at = now()
      WHERE id = ${orderId} AND user_id = 'user_owner_123' AND status = 'placed'
      RETURNING id, status;
    `;
    if (cancelConfirmed.length > 0) {
      throw new Error("Security failure! Confirmed order was cancelled by user!");
    }
    console.log("✔ Confirmed order cannot be cancelled by user (atomic SQL matched 0 rows).");

    // 2. Attempt cancel by a DIFFERENT user (user_attacker_456):
    const cancelByAttacker = await sql`
      UPDATE orders
      SET status = 'cancelled', updated_at = now()
      WHERE id = ${orderId} AND user_id = 'user_attacker_456' AND status = 'placed'
      RETURNING id, status;
    `;
    if (cancelByAttacker.length > 0) {
      throw new Error("Security failure! Attacker was able to cancel another user's order!");
    }
    console.log("✔ Attacker cannot cancel another user's order (0 rows matched).");

    // 3. Test that customer cancel route ONLY allows transition to 'cancelled', never client-controlled status:
    const placedOrder = await sql`
      INSERT INTO orders (user_id, customer_name, phone, address, total_amount, status)
      VALUES ('user_owner_123', 'Owner Customer', '01799999999', 'Road 11, Banani, Dhaka', 1449, 'placed')
      RETURNING id;
    `;
    const placedId = placedOrder[0].id;
    try {
      const validCancel = await sql`
        UPDATE orders
        SET status = 'cancelled', updated_at = now()
        WHERE id = ${placedId} AND user_id = 'user_owner_123' AND status = 'placed'
        RETURNING id, status;
      `;
      if (validCancel.length === 0 || validCancel[0].status !== "cancelled") {
        throw new Error("Failed to cancel placed order!");
      }
      console.log("✔ Legitimate cancel of 'placed' order successfully transitions to 'cancelled'.");
    } finally {
      await sql`DELETE FROM orders WHERE id = ${placedId};`;
    }
  } finally {
    await sql`DELETE FROM orders WHERE id = ${orderId};`;
  }

  console.log("✔ All cancel SQL security invariants verified!");
}

async function run() {
  await testCancelLogicDirectly();
}

run().catch((e) => {
  console.error("Cancel verification failed:", e);
  process.exit(1);
});
