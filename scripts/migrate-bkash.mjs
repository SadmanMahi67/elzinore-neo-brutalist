import { neon } from "@neondatabase/serverless";

async function migrate() {
  console.log("Running DB migration for bkash_trx_id...");
  const sql = neon(process.env.DATABASE_URL);
  
  await sql`
    ALTER TABLE orders ADD COLUMN IF NOT EXISTS bkash_trx_id TEXT;
  `;
  
  console.log("✔ Migration completed: Column 'bkash_trx_id' added to table 'orders'.");
}

migrate().catch((err) => {
  console.error("Migration error:", err);
  process.exit(1);
});
