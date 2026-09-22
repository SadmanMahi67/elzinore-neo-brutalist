import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getDb } from "@/lib/db";

interface OrderItemInput {
  name: string;
  price: number;
  quantity: number;
}

interface OrderRequestBody {
  name?: string;
  customerName?: string;
  phone?: string;
  email?: string;
  address?: string;
  items?: OrderItemInput[];
}

export async function POST(req: Request) {
  try {
    const body: OrderRequestBody = await req.json();
    const customerName = (body.customerName || body.name || "").trim();
    const phone = (body.phone || "").trim();
    const address = (body.address || "").trim();
    const email = body.email && body.email.trim().length > 0 ? body.email.trim() : null;
    const items = body.items || [];

    // Server-side validation
    if (!customerName) {
      return NextResponse.json(
        { error: "Customer name is required." },
        { status: 400 }
      );
    }
    if (!address) {
      return NextResponse.json(
        { error: "Full delivery address is required." },
        { status: 400 }
      );
    }
    if (!phone) {
      return NextResponse.json(
        { error: "Phone number is required." },
        { status: 400 }
      );
    }

    // Validate phone number format (digits, reasonable length 10-15)
    const digitsOnly = phone.replace(/[\s\-\(\)\+]/g, "");
    if (digitsOnly.length < 10 || digitsOnly.length > 15 || !/^\d+$/.test(digitsOnly)) {
      return NextResponse.json(
        { error: "Please enter a valid phone number (e.g. 017XXXXXXXX)." },
        { status: 400 }
      );
    }

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Your bag is empty. Please add an item before placing an order." },
        { status: 400 }
      );
    }

    // Recompute total amount server-side from unit_price * quantity
    let totalAmount = 0;
    const validatedItems: {
      name: string;
      unitPrice: number;
      quantity: number;
      lineTotal: number;
    }[] = [];

    for (const item of items) {
      const productName = (item.name || "").trim();
      const unitPrice = Number(item.price);
      const quantity = parseInt(String(item.quantity), 10);

      if (!productName || isNaN(unitPrice) || unitPrice <= 0 || isNaN(quantity) || quantity <= 0) {
        return NextResponse.json(
          { error: "Invalid item data provided in order." },
          { status: 400 }
        );
      }

      const lineTotal = unitPrice * quantity;
      totalAmount += lineTotal;
      validatedItems.push({
        name: productName,
        unitPrice,
        quantity,
        lineTotal,
      });
    }

    const sql = getDb();

    let userId: string | null = null;
    try {
      const authResult = auth();
      userId = authResult?.userId ?? null;
    } catch {
      userId = null;
    }

    // 1. Insert order record (user_id is populated if authenticated, null for guests)
    const orderRows = await sql`
      INSERT INTO orders (user_id, customer_name, phone, email, address, payment_method, status, total_amount)
      VALUES (${userId}, ${customerName}, ${phone}, ${email}, ${address}, 'cod', 'placed', ${totalAmount})
      RETURNING id, total_amount;
    `;

    const orderId = orderRows[0]?.id;
    if (!orderId) {
      throw new Error("Failed to generate order record.");
    }

    // 2. Insert order items with rollback cleanup on failure
    try {
      for (const item of validatedItems) {
        await sql`
          INSERT INTO order_items (order_id, product_name, unit_price, quantity, line_total)
          VALUES (${orderId}, ${item.name}, ${item.unitPrice}, ${item.quantity}, ${item.lineTotal});
        `;
      }
    } catch (itemsError) {
      // If order_items insertion fails, delete the parent order to prevent half-written data
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
    return NextResponse.json(
      { error: error.message || "An unexpected error occurred while placing the order." },
      { status: 500 }
    );
  }
}
