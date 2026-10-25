import { neon } from "@neondatabase/serverless";

async function main() {
  console.log("Connecting to Neon Postgres...");
  const sql = neon(process.env.DATABASE_URL);

  console.log("Creating 'inventory' table if it does not exist...");
  await sql`
    CREATE TABLE IF NOT EXISTS inventory (
      product_id TEXT PRIMARY KEY,
      stock INTEGER NOT NULL DEFAULT 25,
      initial_stock INTEGER NOT NULL DEFAULT 25,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `;

  console.log("Seeding 'carbon-fiber-wallet' with 25 stock if not present...");
  await sql`
    INSERT INTO inventory (product_id, stock, initial_stock)
    VALUES ('carbon-fiber-wallet', 25, 25)
    ON CONFLICT (product_id) DO UPDATE
    SET stock = 25, initial_stock = 25, updated_at = now();
  `;

  const rows = await sql`SELECT * FROM inventory WHERE product_id = 'carbon-fiber-wallet';`;
  console.log("Inventory row:", rows);
  console.log("Migration successful!");
}

main().catch(console.error);
