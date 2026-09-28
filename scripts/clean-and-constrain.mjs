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

async function run() {
  console.log("Checking for violating junk rows in Neon Postgres...");

  // 1. Find invalid order_items
  const violatingItems = await sql`
    SELECT id, order_id, product_name, unit_price, quantity
    FROM order_items
    WHERE quantity < 1 OR quantity > 10 OR unit_price <= 0;
  `;
  console.log(`Found ${violatingItems.length} violating order_items rows.`);

  // 2. Find invalid orders
  const violatingOrders = await sql`
    SELECT id, customer_name, phone, total_amount
    FROM orders
    WHERE total_amount <= 0 OR total_amount > 50000;
  `;
  console.log(`Found ${violatingOrders.length} violating orders rows.`);

  // Delete violating parent orders (which cascades to order_items) or deleting violating items
  const orderIdsToDelete = new Set([
    ...violatingOrders.map((o) => o.id),
    ...violatingItems.map((i) => i.order_id),
  ]);

  if (orderIdsToDelete.size > 0) {
    console.log(`Deleting ${orderIdsToDelete.size} junk parent orders and cascading items...`);
    const ids = Array.from(orderIdsToDelete);
    await sql`
      DELETE FROM orders WHERE id = ANY(${ids});
    `;
    console.log("Junk rows successfully purged!");
  } else {
    console.log("No violating rows found.");
  }

  // 3. Add database constraints if they don't already exist
  console.log("Applying database constraints...");

  // Check if constraints already exist in pg_constraint
  const existingConstraints = await sql`
    SELECT conname FROM pg_constraint
    WHERE conname IN ('qty_range', 'price_positive', 'total_sane');
  `;
  const existingNames = new Set(existingConstraints.map((c) => c.conname));

  if (!existingNames.has("qty_range")) {
    console.log("Adding constraint 'qty_range' on order_items...");
    await sql`ALTER TABLE order_items ADD CONSTRAINT qty_range CHECK (quantity BETWEEN 1 AND 10);`;
  } else {
    console.log("Constraint 'qty_range' already exists.");
  }

  if (!existingNames.has("price_positive")) {
    console.log("Adding constraint 'price_positive' on order_items...");
    await sql`ALTER TABLE order_items ADD CONSTRAINT price_positive CHECK (unit_price > 0);`;
  } else {
    console.log("Constraint 'price_positive' already exists.");
  }

  if (!existingNames.has("total_sane")) {
    console.log("Adding constraint 'total_sane' on orders...");
    await sql`ALTER TABLE orders ADD CONSTRAINT total_sane CHECK (total_amount > 0 AND total_amount <= 50000);`;
  } else {
    console.log("Constraint 'total_sane' already exists.");
  }

  console.log("Database constraints applied successfully!");
}

run().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
