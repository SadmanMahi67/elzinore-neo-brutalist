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

const sql = neon(databaseUrl);
const BASE_URL = "http://localhost:3005";

async function run() {
  console.log("=== BEGINNING ORDER API & SECURITY VERIFICATION ===");
  const createdOrderIds = [];

  try {
    // 1. Unknown productId rejection (400)
    console.log("\n1. Testing unknown productId rejection...");
    const resUnknown = await fetch(`${BASE_URL}/api/order`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-forwarded-for": "10.0.0.1" },
      body: JSON.stringify({
        name: "Test Customer",
        phone: "01712345678",
        address: "Road 10, Dhanmondi, Dhaka 1205",
        items: [{ productId: "fake-product-not-in-catalog", quantity: 1 }],
      }),
    });
    const dataUnknown = await resUnknown.json();
    console.log(`Status: ${resUnknown.status}, Error: ${dataUnknown.error}`);
    if (resUnknown.status !== 400 || !dataUnknown.error?.includes("not found")) {
      throw new Error("Failed to reject unknown product ID with 400!");
    }
    console.log("✔ Unknown product ID rejected with 400.");

    // 2. Coming-soon product rejection (400)
    console.log("\n2. Testing coming-soon product rejection...");
    const resComingSoon = await fetch(`${BASE_URL}/api/order`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-forwarded-for": "10.0.0.2" },
      body: JSON.stringify({
        name: "Test Customer",
        phone: "01712345678",
        address: "Road 10, Dhanmondi, Dhaka 1205",
        items: [{ productId: "leather-belts", quantity: 1 }],
      }),
    });
    const dataComingSoon = await resComingSoon.json();
    console.log(`Status: ${resComingSoon.status}, Error: ${dataComingSoon.error}`);
    if (resComingSoon.status !== 400 || !dataComingSoon.error?.includes("coming soon")) {
      throw new Error("Failed to reject coming-soon product with 400!");
    }
    console.log("✔ Coming soon product rejected with 400.");

    // 3. Invalid quantity tests (400)
    console.log("\n3. Testing invalid quantities (999999, -1, non-integer)...");
    for (const invalidQty of [999999, -1, 0, 1.5, "five"]) {
      const resQty = await fetch(`${BASE_URL}/api/order`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-forwarded-for": "10.0.0.3" },
        body: JSON.stringify({
          name: "Test Customer",
          phone: "01712345678",
          address: "Road 10, Dhanmondi, Dhaka 1205",
          items: [{ productId: "carbon-fiber-wallet", quantity: invalidQty }],
        }),
      });
      if (resQty.status !== 400) {
        throw new Error(`Failed to reject invalid quantity ${invalidQty}, got ${resQty.status}!`);
      }
    }
    console.log("✔ Invalid quantities strictly rejected with 400.");

    // 4. Invalid name and address tests ("c", "x", "QA") (400)
    console.log("\n4. Testing junk name and junk address rejection...");
    const resName = await fetch(`${BASE_URL}/api/order`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-forwarded-for": "10.0.0.4" },
      body: JSON.stringify({
        name: "c",
        phone: "01712345678",
        address: "Road 10, Dhanmondi, Dhaka 1205",
        items: [{ productId: "carbon-fiber-wallet", quantity: 1 }],
      }),
    });
    if (resName.status !== 400) throw new Error("Failed to reject 1-character name!");

    const resAddr = await fetch(`${BASE_URL}/api/order`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-forwarded-for": "10.0.0.5" },
      body: JSON.stringify({
        name: "Valid Customer",
        phone: "01712345678",
        address: "x",
        items: [{ productId: "carbon-fiber-wallet", quantity: 1 }],
      }),
    });
    if (resAddr.status !== 400) throw new Error("Failed to reject short address 'x'!");

    const resAddrQA = await fetch(`${BASE_URL}/api/order`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-forwarded-for": "10.0.0.6" },
      body: JSON.stringify({
        name: "Valid Customer",
        phone: "01712345678",
        address: "QA",
        items: [{ productId: "carbon-fiber-wallet", quantity: 1 }],
      }),
    });
    if (resAddrQA.status !== 400) throw new Error("Failed to reject short address 'QA'!");
    console.log("✔ Junk names and addresses rejected with 400.");

    // 5. Invalid phone tests ("123", "+1234567890") (400)
    console.log("\n5. Testing invalid phone numbers...");
    const resPhoneShort = await fetch(`${BASE_URL}/api/order`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-forwarded-for": "10.0.0.7" },
      body: JSON.stringify({
        name: "Valid Customer",
        phone: "123",
        address: "Road 10, Dhanmondi, Dhaka 1205",
        items: [{ productId: "carbon-fiber-wallet", quantity: 1 }],
      }),
    });
    if (resPhoneShort.status !== 400) throw new Error("Failed to reject phone '123'!");

    const resPhoneIntl = await fetch(`${BASE_URL}/api/order`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-forwarded-for": "10.0.0.8" },
      body: JSON.stringify({
        name: "Valid Customer",
        phone: "+12025550143",
        address: "Road 10, Dhanmondi, Dhaka 1205",
        items: [{ productId: "carbon-fiber-wallet", quantity: 1 }],
      }),
    });
    if (resPhoneIntl.status !== 400) throw new Error("Failed to reject non-BD phone number!");
    console.log("✔ Invalid phone numbers rejected with 400.");

    // 6. Honeypot check (400)
    console.log("\n6. Testing honeypot trigger...");
    const resHoneypot = await fetch(`${BASE_URL}/api/order`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-forwarded-for": "10.0.0.9" },
      body: JSON.stringify({
        name: "Bot Spammer",
        phone: "01712345678",
        address: "Road 10, Dhanmondi, Dhaka 1205",
        website_url: "https://spam-bot-link.com",
        items: [{ productId: "carbon-fiber-wallet", quantity: 1 }],
      }),
    });
    if (resHoneypot.status !== 400) throw new Error("Failed to reject honeypot filled order!");
    console.log("✔ Honeypot bot submission rejected with 400.");

    // 7. Price Tampering Prevention & Normal UI Order
    console.log("\n7. Testing client price tampering prevention (send price: 1 for wallet)...");
    const testPhone = `017${Math.floor(10000000 + Math.random() * 90000000)}`;
    const resTamper = await fetch(`${BASE_URL}/api/order`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-forwarded-for": "10.0.0.10" },
      body: JSON.stringify({
        name: "Security Tester",
        phone: testPhone,
        address: "House 45, Road 27, Dhanmondi, Dhaka 1209",
        items: [
          {
            productId: "carbon-fiber-wallet",
            name: "HACKED NAME",
            price: 1, // Tampered client price!
            quantity: 1,
          },
        ],
      }),
    });

    const dataTamper = await resTamper.json();
    if (resTamper.status !== 200) {
      throw new Error(`Order placement failed: ${dataTamper.error}`);
    }

    createdOrderIds.push(dataTamper.orderId);
    console.log(`Order placed successfully with ID: ${dataTamper.orderId}, total: ${dataTamper.totalAmount}`);

    if (dataTamper.totalAmount !== 1449) {
      throw new Error(`Price tampering succeeded! Expected total 1449, but got ${dataTamper.totalAmount}`);
    }

    // Verify in Neon Postgres directly
    const dbOrder = await sql`SELECT total_amount FROM orders WHERE id = ${dataTamper.orderId};`;
    const dbItems = await sql`SELECT product_name, unit_price, line_total FROM order_items WHERE order_id = ${dataTamper.orderId};`;

    if (Number(dbOrder[0].total_amount) !== 1449) {
      throw new Error(`Database total_amount tampered! Expected 1449, got ${dbOrder[0].total_amount}`);
    }
    if (Number(dbItems[0].unit_price) !== 1449) {
      throw new Error(`Database unit_price tampered! Expected 1449, got ${dbItems[0].unit_price}`);
    }
    if (dbItems[0].product_name !== "Carbon Fiber RFID Wallet") {
      throw new Error(`Database product_name tampered! Expected 'Carbon Fiber RFID Wallet', got ${dbItems[0].product_name}`);
    }
    console.log("✔ Price tampering completely prevented! Database stores authoritative ৳1,449.");

    // 8. Rate Limiting Check (5 per 10m from single IP)
    console.log("\n8. Testing IP Rate Limiting (burst 6 requests from 10.0.0.99)...");
    let caught429 = false;
    for (let i = 0; i < 7; i++) {
      const testUniquePhone = `018${Math.floor(10000000 + Math.random() * 90000000)}`;
      const resBurst = await fetch(`${BASE_URL}/api/order`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-forwarded-for": "10.0.0.99" },
        body: JSON.stringify({
          name: "Rate Test Customer",
          phone: testUniquePhone,
          address: "House 12, Road 4, Sector 3, Uttara, Dhaka",
          items: [{ productId: "carbon-fiber-wallet", quantity: 1 }],
        }),
      });
      if (resBurst.status === 200) {
        const d = await resBurst.json();
        createdOrderIds.push(d.orderId);
      } else if (resBurst.status === 429) {
        caught429 = true;
        console.log(`✔ Request #${i + 1} was rate limited with HTTP 429!`);
        break;
      }
    }
    if (!caught429) {
      throw new Error("Rate limiting did not trigger 429 after limit exceeded!");
    }

    // 9. Admin routes protection
    console.log("\n9. Testing Admin routes without session...");
    const resAdminGet = await fetch(`${BASE_URL}/api/admin/orders`);
    if (resAdminGet.status !== 401) {
      throw new Error(`Expected 401 on GET /api/admin/orders, got ${resAdminGet.status}`);
    }
    console.log("✔ GET /api/admin/orders rejected with 401.");

    const resAdminPatch = await fetch(`${BASE_URL}/api/admin/orders/de6b71bd-6da7-407e-b636-c928c4a1b9b5`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "confirmed" }),
    });
    if (resAdminPatch.status !== 401) {
      throw new Error(`Expected 401 on PATCH /api/admin/orders/[id], got ${resAdminPatch.status}`);
    }
    console.log("✔ PATCH /api/admin/orders/[id] rejected with 401.");

    // 10. Customer routes protection (401 when signed out)
    console.log("\n10. Testing Customer routes without session...");
    for (const url of ["/api/orders", "/api/cart", "/api/notifications"]) {
      const resAuth = await fetch(`${BASE_URL}${url}`);
      if (resAuth.status !== 401) {
        throw new Error(`Expected 401 on GET ${url}, got ${resAuth.status}`);
      }
    }
    console.log("✔ Customer GET routes correctly return 401 when signed out.");

    const resCancelAnon = await fetch(`${BASE_URL}/api/orders/de6b71bd-6da7-407e-b636-c928c4a1b9b5`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "cancel" }),
    });
    if (resCancelAnon.status !== 401) {
      throw new Error(`Expected 401 on customer cancel without session, got ${resCancelAnon.status}`);
    }
    console.log("✔ Customer PATCH /api/orders/[id] cancel correctly returns 401 when signed out.");

    console.log("\nALL VERIFICATION TESTS PASSED SUCCESSFULLY! 🚀");
  } finally {
    if (createdOrderIds.length > 0) {
      console.log(`\nCleaning up ${createdOrderIds.length} test order(s)...`);
      await sql`DELETE FROM orders WHERE id = ANY(${createdOrderIds});`;
      console.log("Cleaned up test orders.");
    }
  }
}

run().catch((e) => {
  console.error("Verification failed:", e);
  process.exit(1);
});
