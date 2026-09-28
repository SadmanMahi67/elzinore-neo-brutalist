import { neon } from "@neondatabase/serverless";

async function main() {
  const sql = neon(process.env.DATABASE_URL);
  
  const fkConstraints = await sql`
    SELECT
        tc.table_name, 
        kcu.column_name, 
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name,
        rc.delete_rule
    FROM 
        information_schema.table_constraints AS tc 
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
          AND tc.table_schema = kcu.table_schema
        JOIN information_schema.referential_constraints AS rc
          ON tc.constraint_name = rc.constraint_name
        JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = rc.constraint_name
          AND ccu.table_schema = tc.table_schema
    WHERE tc.constraint_type = 'FOREIGN KEY';
  `;
  console.log('FK Constraints:\n', JSON.stringify(fkConstraints, null, 2));

  const tables = await sql`
    SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
  `;
  console.log('\nTables:', tables.map(t => t.table_name));
}

main().catch(console.error);
