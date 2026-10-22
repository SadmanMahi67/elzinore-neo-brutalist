import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getDb } from "@/lib/db";
import { getCatalogItem } from "@/lib/catalog";
import { rateLimitOrder, getClientIp } from "@/lib/rateLimit";

export const dynamic = "force-dynamic";

const MAX_BODY_BYTES = 10 * 1024; // 10 KB

export async function POST(req: Request) {
  try {
    // 1. Enforce payload size cap (10 KB)
    const contentLength = req.headers.get("content-length");
    if (contentLength && parseInt(contentLength, 10) > MAX_BODY_BYTES) {
      return NextResponse.json(
        { error: "Payload too large. Maximum size is 10 KB." },
        { status: 413 }
      );
    }

    const rawBody = await req.text();
    if (Buffer.byteLength(rawBody, "utf8") > MAX_BODY_BYTES) {
      return NextResponse.json(
        { error: "Payload too large. Maximum size is 10 KB." },
        { status: 413 }
      );
    }

    let body: any;
    try {
      body = JSON.parse(rawBody);
    } catch {
      return NextResponse.json(
        { error: "Invalid request payload format." },
        { status: 400 }
      );
    }

    // 2. IP Rate Limiting (5 attempts per 10 minutes)
    const clientIp = getClientIp(req);
    const ipRateResult = await rateLimitOrder(clientIp);
    if (!ipRateResult.success) {
      return NextResponse.json(
        { error: "Too many order attempts. Please try again in a few minutes." },
        {
          status: 429,
          headers: {
            "Retry-After": Math.ceil(
              Math.max(0, ipRateResult.reset - Date.now()) / 1000
            ).toString(),
          },
        }
      );
    }

    // 3. Honeypot check (reject bot submissions)
    if (body.website_url || body.hp_company || body.company_name) {
      return NextResponse.json(
        { error: "Bot activity detected." },
        { status: 400 }
      );
    }

    // 4. Validate customer name (2–80 characters, no control characters)
    const customerName = (body.customerName || body.name || "").trim();
    if (
      customerName.length < 2 ||
      customerName.length > 80 ||
      /[\u0000-\u001F\u007F]/.test(customerName)
    ) {
      return NextResponse.json(
        { error: "Please enter a valid full name (2 to 80 characters)." },
        { status: 400 }
      );
    }

    // 5. Validate delivery address (15–300 characters, no control characters)
    const address = (body.address || "").trim();
    if (
      address.length < 15 ||
      address.length > 300 ||
      /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/.test(address)
    ) {
      return NextResponse.json(
        { error: "Please enter a detailed delivery address (15 to 300 characters)." },
        { status: 400 }
      );
    }

    // 6. Validate & normalize phone number (Bangladeshi mobile: 013-019, 11 digits)
    const rawPhone = (body.phone || "").trim();
    const cleanPhone = rawPhone.replace(/[\s\-\(\)]/g, "");
    let normalizedPhone = cleanPhone;
    if (normalizedPhone.startsWith("+880")) {
      normalizedPhone = "0" + normalizedPhone.slice(4);
    } else if (normalizedPhone.startsWith("880")) {
      normalizedPhone = "0" + normalizedPhone.slice(3);
    }

    if (!/^01[3-9]\d{8}$/.test(normalizedPhone)) {
      return NextResponse.json(
        { error: "Please enter a valid Bangladeshi mobile number (e.g. 017XXXXXXXX)." },
        { status: 400 }
      );
    }

    // 7. Validate email (optional, max 254 characters, standard email pattern)
    let email: string | null = null;
    if (body.email && typeof body.email === "string" && body.email.trim().length > 0) {
      const trimmedEmail = body.email.trim();
      if (
        trimmedEmail.length > 254 ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)
      ) {
        return NextResponse.json(
          { error: "Please enter a valid email address." },
          { status: 400 }
        );
      }
      email = trimmedEmail;
    }

    // 8. Validate items array (1–5 distinct lines)
    const items = body.items;
    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Your bag is empty. Please add an item before placing an order." },
        { status: 400 }
      );
    }
    if (items.length > 5) {
      return NextResponse.json(
        { error: "Orders may contain a maximum of 5 items." },
        { status: 400 }
      );
    }

    // 9. Server-side Catalog Lookup and Price Enforcement
    // Ignore any name or price sent by client!
    let itemsSubtotal = 0;
    const validatedItems: {
      productId: string;
      name: string;
      unitPrice: number;
      quantity: number;
      lineTotal: number;
    }[] = [];

    for (const item of items) {
      const productId = (item.productId || item.id || "").trim();
      if (!productId) {
        return NextResponse.json(
          { error: "Item productId is required." },
          { status: 400 }
        );
      }

      // Check quantity: must be strict integer between 1 and 10
      const rawQty = item.quantity;
      if (
        typeof rawQty !== "number" ||
        !Number.isInteger(rawQty) ||
        rawQty < 1 ||
        rawQty > 10
      ) {
        return NextResponse.json(
          { error: `Invalid quantity for item '${productId}'. Quantity must be an integer between 1 and 10.` },
          { status: 400 }
        );
      }

      const catalogItem = getCatalogItem(productId);
      if (!catalogItem) {
        return NextResponse.json(
          { error: `Product '${productId}' not found in catalog.` },
          { status: 400 }
        );
      }

      if (!catalogItem.purchasable) {
        return NextResponse.json(
          { error: `Product '${catalogItem.name}' is coming soon and not currently available for purchase.` },
          { status: 400 }
        );
      }

      const unitPrice = catalogItem.price;
      const lineTotal = unitPrice * rawQty;
      itemsSubtotal += lineTotal;

      validatedItems.push({
        productId: catalogItem.id,
        name: catalogItem.name,
        unitPrice,
        quantity: rawQty,
        lineTotal,
      });
    }

    if (itemsSubtotal <= 0 || itemsSubtotal > 50000) {
      return NextResponse.json(
        { error: "Order items amount is outside allowable limits (৳1 - ৳50,000)." },
        { status: 400 }
      );
    }

    // Determine delivery charge based on delivery zone: Inside Dhaka = 70tk, Outside Dhaka = 130tk
    const rawZone = (body.delivery_zone || body.deliveryZone || "inside_dhaka").toString().trim().toLowerCase();
    const isOutsideDhaka = rawZone === "outside_dhaka" || rawZone === "outside";
    const deliveryZone = isOutsideDhaka ? "outside_dhaka" : "inside_dhaka";
    const deliveryZoneLabel = isOutsideDhaka ? "Outside Dhaka" : "Inside Dhaka";
    const deliveryCharge = isOutsideDhaka ? 130 : 70;
    const totalAmount = itemsSubtotal + deliveryCharge;

    const sql = getDb();

    // 10. Phone number throttling (Max 3 orders per 24 hours per phone number)
    const phoneCountRows = await sql`
      SELECT COUNT(*)::int AS count
      FROM orders
      WHERE phone = ${normalizedPhone}
        AND created_at > now() - INTERVAL '24 hours';
    `;
    const orderCount = phoneCountRows[0]?.count ?? 0;
    if (orderCount >= 3) {
      return NextResponse.json(
        { error: "Order limit reached for this phone number (max 3 orders per 24 hours)." },
        { status: 429 }
      );
    }

    // 11. Duplicate order detection (same phone + same items within 2 minutes)
    const recentOrders = await sql`
      SELECT o.id, json_agg(json_build_object('name', i.product_name, 'qty', i.quantity)) AS items
      FROM orders o
      JOIN order_items i ON o.id = i.order_id
      WHERE o.phone = ${normalizedPhone}
        AND o.created_at > now() - INTERVAL '2 minutes'
      GROUP BY o.id;
    `;

    const isDuplicate = recentOrders.some((ro: any) => {
      const existingItems: { name: string; qty: number }[] = ro.items || [];
      if (existingItems.length !== validatedItems.length) return false;
      return validatedItems.every((vi) =>
        existingItems.some((ei) => ei.name === vi.name && Number(ei.qty) === vi.quantity)
      );
    });

    if (isDuplicate) {
      return NextResponse.json(
        { error: "A matching order was placed within the last 2 minutes. Please wait before reordering." },
        { status: 429 }
      );
    }

    // Payment method validation
    const paymentMethod = (body.payment_method || body.paymentMethod || "cod").toString().trim().toLowerCase();
    if (paymentMethod !== "cod" && paymentMethod !== "bkash") {
      return NextResponse.json(
        { error: "Invalid payment method. Allowed options are 'cod' and 'bkash'." },
        { status: 400 }
      );
    }

    let bkashTrxId: string | null = null;
    if (paymentMethod === "bkash") {
      const rawTrx = (body.bkash_trx_id || body.bkashTrxId || body.trx_id || "").toString().trim();
      if (!rawTrx || rawTrx.length < 6 || rawTrx.length > 40) {
        return NextResponse.json(
          { error: "bKash Transaction ID (TrxID) is required for bKash orders (6 to 40 characters)." },
          { status: 400 }
        );
      }
      bkashTrxId = rawTrx;
    }

    // 12. Determine auth user
    let userId: string | null = null;
    try {
      const authResult = auth();
      userId = authResult?.userId ?? null;
    } catch {
      userId = null;
    }

    const finalAddress = `${address}\n[Delivery: ${deliveryZoneLabel} (৳${deliveryCharge})]`;

    // 13. Insert order record (user_id is populated if authenticated, null for guests)
    const orderRows = await sql`
      INSERT INTO orders (user_id, customer_name, phone, email, address, payment_method, bkash_trx_id, status, total_amount, delivery_charge, delivery_zone)
      VALUES (${userId}, ${customerName}, ${normalizedPhone}, ${email}, ${finalAddress}, ${paymentMethod}, ${bkashTrxId}, 'placed', ${totalAmount}, ${deliveryCharge}, ${deliveryZone})
      RETURNING id, total_amount;
    `;

    const orderId = orderRows[0]?.id;
    if (!orderId) {
      throw new Error("Failed to generate order record.");
    }

    // 14. Insert order items with rollback cleanup on failure
    try {
      for (const item of validatedItems) {
        await sql`
          INSERT INTO order_items (order_id, product_name, unit_price, quantity, line_total)
          VALUES (${orderId}, ${item.name}, ${item.unitPrice}, ${item.quantity}, ${item.lineTotal});
        `;
      }
    } catch (itemsError) {
      try {
        await sql`DELETE FROM orders WHERE id = ${orderId};`;
      } catch (rollbackError) {
        console.error("Order rollback error:", rollbackError);
      }
      throw itemsError;
    }

    return NextResponse.json(
      {
        orderId,
        shortId: `ELZ-${orderId.slice(0, 8).toUpperCase()}`,
        totalAmount,
        status: "placed",
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Order submission error:", error);
    // Sanitize error message: do not leak raw database errors or stack traces
    return NextResponse.json(
      { error: "An unexpected error occurred while placing the order." },
      { status: 500 }
    );
  }
}
