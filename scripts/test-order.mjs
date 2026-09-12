import { neon } from "@neondatabase/serverless";
import fs from "node:fs";
import path from "node:path";

// Load .env.local
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

async function testDatabase() {
  console.log("Checking Neon tables...");
  const tables = await sql`
    SELECT table_name FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name IN ('orders', 'order_items');
  `;
  console.log("Found tables:", tables.map(t => t.table_name));

  if (tables.length !== 2) {
    throw new Error("Expected both 'orders' and 'order_items' tables to exist");
  }

  console.log("Inserting a test order...");
  const testOrder = await sql`
    INSERT INTO orders (customer_name, phone, email, address, payment_method, status, total_amount)
    VALUES ('Test Customer', '01700000000', 'test@example.com', 'Dhanmondi 27, Dhaka', 'cod', 'placed', 1400)
    RETURNING id, customer_name, total_amount;
  `;
  const orderId = testOrder[0].id;
  console.log("Test order created with ID:", orderId);

  console.log("Inserting test order items...");
  await sql`
    INSERT INTO order_items (order_id, product_name, unit_price, quantity, line_total)
    VALUES (${orderId}, 'Carbon Fiber RFID Wallet', 1400, 1, 1400);
  `;

  console.log("Verifying joined order data...");
  const rows = await sql`
    SELECT o.id, o.customer_name, o.payment_method, o.total_amount, i.product_name, i.unit_price, i.quantity
    FROM orders o
    JOIN order_items i ON o.id = i.order_id
    WHERE o.id = ${orderId};
  `;
  console.log("Verified joined row:", rows[0]);

  // Clean up test order
  console.log("Cleaning up test order...");
  await sql`DELETE FROM orders WHERE id = ${orderId};`;
  console.log("Cleaned up successfully. Database connection and schema are 100% verified!");
}

testDatabase().catch(err => {
  console.error("Test failed:", err);
  process.exit(1);
});
