import { neon } from "@neondatabase/serverless";

const BASE_URL = "http://localhost:3005";

async function verifyAdminDelete() {
  console.log("=== BEGINNING ADMIN ORDER DELETE VERIFICATION ===");
  const sql = neon(process.env.DATABASE_URL);

  // 1. Check Unauthenticated API access (no Clerk session)
  console.log("\n1. Testing Unauthenticated requests (should return 401)...");
  
  const unauthSingle = await fetch(`${BASE_URL}/api/admin/orders/00000000-0000-0000-0000-000000000000`, {
    method: "DELETE",
  });
  console.log(`  DELETE /api/admin/orders/[id] status: ${unauthSingle.status}`);
  if (unauthSingle.status !== 401) {
    throw new Error(`Expected 401 for unauthenticated DELETE, got ${unauthSingle.status}`);
  }

  const unauthBulk = await fetch(`${BASE_URL}/api/admin/orders/bulk-delete`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ids: ["00000000-0000-0000-0000-000000000000"] }),
  });
  console.log(`  POST /api/admin/orders/bulk-delete status: ${unauthBulk.status}`);
  if (unauthBulk.status !== 401) {
    throw new Error(`Expected 401 for unauthenticated POST bulk-delete, got ${unauthBulk.status}`);
  }
  console.log("  ✔ Unauthenticated security checks passed (401 returned).");

  // 2. Direct DB verification & Cascade test
  console.log("\n2. Testing Database Invariants & Cascade Deletion...");

  // Create temporary test order in Neon DB
  const [testOrder] = await sql`
    INSERT INTO orders (customer_name, phone, address, payment_method, status, total_amount)
    VALUES ('TEST JUNK DELETE', '01711111111', '123 Test Street, Dhaka', 'cod', 'placed', 1449)
    RETURNING id;
  `;
  const testOrderId = testOrder.id;

  // Insert item into order_items
  await sql`
    INSERT INTO order_items (order_id, product_name, unit_price, quantity, line_total)
    VALUES (${testOrderId}, 'Carbon Fiber RFID Wallet', 1449, 1, 1449);
  `;
  console.log(`  Created test order in DB: ${testOrderId}`);

  // Perform SQL deletion directly mimicking the API route
  const deletedRows = await sql`
    DELETE FROM orders WHERE id = ${testOrderId} RETURNING id;
  `;
  if (deletedRows.length === 0) {
    throw new Error("Failed to delete test order from DB");
  }

  // Check orphaned items count
  const orphanCheck = await sql`
    SELECT count(*)::int as count FROM order_items WHERE order_id NOT IN (SELECT id FROM orders);
  `;
  const orphanCount = orphanCheck[0].count;
  console.log(`  Orphaned order_items count: ${orphanCount}`);
  if (orphanCount !== 0) {
    throw new Error(`Orphaned order items detected! Count: ${orphanCount}`);
  }
  console.log("  ✔ ON DELETE CASCADE is fully active and leaving 0 orphan rows.");

  // 3. Testing Bulk Deletion SQL Invariant
  console.log("\n3. Testing Bulk Deletion SQL query...");
  const [b1] = await sql`
    INSERT INTO orders (customer_name, phone, address, payment_method, status, total_amount)
    VALUES ('JUNK BULK 1', '01811111111', 'Address 1, Chittagong', 'cod', 'placed', 1449)
    RETURNING id;
  `;
  const [b2] = await sql`
    INSERT INTO orders (customer_name, phone, address, payment_method, status, total_amount)
    VALUES ('JUNK BULK 2', '01911111111', 'Address 2, Sylhet', 'cod', 'placed', 1449)
    RETURNING id;
  `;
  await sql`
    INSERT INTO order_items (order_id, product_name, unit_price, quantity, line_total)
    VALUES (${b1.id}, 'Carbon Fiber RFID Wallet', 1449, 1, 1449);
  `;
  await sql`
    INSERT INTO order_items (order_id, product_name, unit_price, quantity, line_total)
    VALUES (${b2.id}, 'Carbon Fiber RFID Wallet', 1449, 1, 1449);
  `;

  const bulkDeleted = await sql`
    DELETE FROM orders WHERE id = ANY(${[b1.id, b2.id]}::uuid[]) RETURNING id;
  `;
  console.log(`  Bulk deleted ${bulkDeleted.length} rows.`);
  if (bulkDeleted.length !== 2) {
    throw new Error(`Expected 2 bulk deleted rows, got ${bulkDeleted.length}`);
  }

  const postBulkOrphanCheck = await sql`
    SELECT count(*)::int as count FROM order_items WHERE order_id NOT IN (SELECT id FROM orders);
  `;
  if (postBulkOrphanCheck[0].count !== 0) {
    throw new Error("Bulk deletion left orphan records!");
  }
  console.log("  ✔ Bulk deletion SQL executed cleanly with 0 orphan rows.");

  console.log("\nALL ADMIN DELETE INVARIANT TESTS PASSED SUCCESSFULLY! 🚀");
}

verifyAdminDelete().catch((err) => {
  console.error("Verification failed:", err);
  process.exit(1);
});
