import { neon } from "@neondatabase/serverless";

const BASE_URL = "http://localhost:3005";

async function verifyBkashAndAbout() {
  console.log("=== BEGINNING BKASH & ABOUT PAGE VERIFICATION ===");
  const sql = neon(process.env.DATABASE_URL);

  // 1. Verify About Us Page Layout & Container Padding
  console.log("\n1. Testing About Us page HTML container padding...");
  const aboutRes = await fetch(`${BASE_URL}/about`);
  if (aboutRes.status !== 200) {
    throw new Error(`Failed to fetch /about, status: ${aboutRes.status}`);
  }
  const aboutHtml = await aboutRes.text();

  if (!aboutHtml.includes("grid-paper")) {
    throw new Error("About page missing 'grid-paper' container class!");
  }
  if (!aboutHtml.includes("max-w-6xl") || !aboutHtml.includes("px-4")) {
    throw new Error("About page missing responsive side padding (px-4 md:px-6 max-w-6xl)!");
  }
  console.log("  ✔ About page contains responsive grid container and side padding classes.");

  // 2. Test bKash Order API Validation
  console.log("\n2. Testing bKash Order API Validation...");
  
  // Test missing bkash_trx_id returns 400
  const missingTrxRes = await fetch(`${BASE_URL}/api/order`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Test User",
      phone: "01712345678",
      address: "123 Test Street, Dhaka City North",
      payment_method: "bkash",
      items: [{ productId: "carbon-fiber-wallet", quantity: 1 }],
    }),
  });
  console.log(`  bKash order without TrxID status: ${missingTrxRes.status}`);
  if (missingTrxRes.status !== 400) {
    throw new Error(`Expected 400 for bKash order missing TrxID, got ${missingTrxRes.status}`);
  }
  console.log("  ✔ Missing TrxID correctly rejected with 400 Bad Request.");

  // 3. Test Successful bKash Order Placement
  console.log("\n3. Testing Successful bKash Order Placement...");
  const validBkashRes = await fetch(`${BASE_URL}/api/order`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Sadman Sakib",
      phone: "01812345678",
      address: "House 45, Road 12, Block B, Dhanmondi, Dhaka",
      payment_method: "bkash",
      bkash_trx_id: "BLM7X9K2P0",
      items: [{ productId: "carbon-fiber-wallet", quantity: 1 }],
    }),
  });
  console.log(`  bKash valid order status: ${validBkashRes.status}`);
  if (validBkashRes.status !== 200) {
    const errText = await validBkashRes.text();
    throw new Error(`Failed to place valid bKash order: ${errText}`);
  }
  const bkashData = await validBkashRes.json();
  console.log("  bKash Order Placed Response:", bkashData);

  // Verify in Neon DB
  const [dbOrder] = await sql`
    SELECT payment_method, bkash_trx_id FROM orders WHERE id = ${bkashData.orderId};
  `;
  if (dbOrder.payment_method !== "bkash" || dbOrder.bkash_trx_id !== "BLM7X9K2P0") {
    throw new Error(`DB order values mismatched: ${JSON.stringify(dbOrder)}`);
  }
  console.log("  ✔ bKash order correctly persisted in DB with payment_method='bkash' and bkash_trx_id='BLM7X9K2P0'.");

  // Clean up test order
  await sql`DELETE FROM orders WHERE id = ${bkashData.orderId};`;
  console.log("  ✔ Cleaned up test order.");

  console.log("\nALL BKASH & ABOUT PAGE TESTS PASSED SUCCESSFULLY! 🚀");
}

verifyBkashAndAbout().catch((err) => {
  console.error("Verification failed:", err);
  process.exit(1);
});
