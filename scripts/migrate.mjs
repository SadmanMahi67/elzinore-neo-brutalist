import { neon } from "@neondatabase/serverless";
import fs from "node:fs";
import path from "node:path";

// Load .env.local if DATABASE_URL is not in process.env
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
  console.error("Error: DATABASE_URL not found in environment or .env.local");
  process.exit(1);
}

const sql = neon(databaseUrl);

async function runMigration() {
  console.log("Connecting to Neon Postgres...");

  console.log("Creating 'orders' table if it does not exist...");
  await sql`
    CREATE TABLE IF NOT EXISTS orders (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      customer_name TEXT NOT NULL,
      phone TEXT NOT NULL,
      email TEXT,
      address TEXT NOT NULL,
      payment_method TEXT NOT NULL DEFAULT 'cod',
      status TEXT NOT NULL DEFAULT 'placed',
      total_amount NUMERIC NOT NULL
    );
  `;

  console.log("Creating 'order_items' table if it does not exist...");
  await sql`
    CREATE TABLE IF NOT EXISTS order_items (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
      product_name TEXT NOT NULL,
      unit_price NUMERIC NOT NULL,
      quantity INTEGER NOT NULL,
      line_total NUMERIC NOT NULL
    );
  `;

  console.log("Adding 'user_id' column to 'orders' if it does not exist...");
  await sql`
    ALTER TABLE orders ADD COLUMN IF NOT EXISTS user_id TEXT;
  `;

  console.log("Creating 'carts' table if it does not exist...");
  await sql`
    CREATE TABLE IF NOT EXISTS carts (
      user_id TEXT PRIMARY KEY,
      items JSONB NOT NULL DEFAULT '[]',
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `;

  console.log("Adding 'updated_at' column to 'orders' if it does not exist...");
  await sql`
    ALTER TABLE orders ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();
  `;

  console.log("Creating 'user_notification_state' table if it does not exist...");
  await sql`
    CREATE TABLE IF NOT EXISTS user_notification_state (
      user_id TEXT PRIMARY KEY,
      last_seen_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `;

  console.log("Migration executed successfully!");
}

runMigration().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
