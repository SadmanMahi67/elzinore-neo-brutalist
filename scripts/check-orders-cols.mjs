import { neon } from "@neondatabase/serverless";

async function main() {
  const sql = neon(process.env.DATABASE_URL);
  const cols = await sql`
    SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'orders';
  `;
  console.log('orders columns:', cols);
}

main().catch(console.error);
