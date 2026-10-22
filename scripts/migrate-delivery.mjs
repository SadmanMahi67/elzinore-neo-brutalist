import { neon } from "@neondatabase/serverless";

async function main() {
  console.log("Connecting to Neon Postgres...");
  const sql = neon(process.env.DATABASE_URL);

  console.log("Adding 'delivery_charge' and 'delivery_zone' columns to 'orders'...");
  await sql`
    ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_charge NUMERIC DEFAULT 70;
  `;
  await sql`
    ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_zone TEXT DEFAULT 'inside_dhaka';
  `;
  console.log("Migration successful!");
}

main().catch(console.error);
