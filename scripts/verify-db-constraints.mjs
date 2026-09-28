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

if (!databaseUrl) {
  console.error("DATABASE_URL not found");
  process.exit(1);
}

const sql = neon(databaseUrl);

async function testDatabaseConstraints() {
  console.log("\n--- Testing Database CHECK Constraints ---");

  // 1. Test quantity > 10 rejected by DB
  let caughtQty = false;
  try {
    const tempOrder = await sql`
      INSERT INTO orders (customer_name, phone, address, total_amount)
      VALUES ('Test Constraint', '01711111111', 'Banani, Road 11, Dhaka', 1449)
      RETURNING id;
    `;
    const orderId = tempOrder[0].id;
    try {
      await sql`
        INSERT INTO order_items (order_id, product_name, unit_price, quantity, line_total)
        VALUES (${orderId}, 'Wallet', 1449, 999999, 1449000000);
      `;
    } catch (e) {
      caughtQty = true;
      console.log("✔ DB correctly rejected quantity 999999 via 'qty_range' constraint.");
    } finally {
      await sql`DELETE FROM orders WHERE id = ${orderId};`;
    }
  } catch (err) {
    console.error("Unexpected error in DB test:", err);
  }
  if (!caughtQty) throw new Error("Database failed to reject quantity 999999!");

  // 2. Test price <= 0 rejected by DB
  let caughtPrice = false;
  try {
    const tempOrder = await sql`
      INSERT INTO orders (customer_name, phone, address, total_amount)
      VALUES ('Test Constraint', '01711111111', 'Banani, Road 11, Dhaka', 1449)
      RETURNING id;
    `;
    const orderId = tempOrder[0].id;
    try {
      await sql`
        INSERT INTO order_items (order_id, product_name, unit_price, quantity, line_total)
        VALUES (${orderId}, 'Wallet', 0, 1, 0);
      `;
    } catch (e) {
      caughtPrice = true;
      console.log("✔ DB correctly rejected unit_price <= 0 via 'price_positive' constraint.");
    } finally {
      await sql`DELETE FROM orders WHERE id = ${orderId};`;
    }
  } catch (err) {
    console.error("Unexpected error in DB test:", err);
  }
  if (!caughtPrice) throw new Error("Database failed to reject unit_price <= 0!");

  // 3. Test total_amount > 50000 rejected by DB
  let caughtTotal = false;
  try {
    await sql`
      INSERT INTO orders (customer_name, phone, address, total_amount)
      VALUES ('Test Constraint', '01711111111', 'Banani, Road 11, Dhaka', 99999999);
    `;
  } catch (e) {
    caughtTotal = true;
    console.log("✔ DB correctly rejected total_amount > 50000 via 'total_sane' constraint.");
  }
  if (!caughtTotal) throw new Error("Database failed to reject total_amount > 50000!");
}

async function run() {
  await testDatabaseConstraints();
  console.log("\nAll direct database constraint verifications passed successfully!");
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
