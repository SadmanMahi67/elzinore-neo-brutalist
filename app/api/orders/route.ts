import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    let userId: string | null = null;
    try {
      const authResult = auth();
      userId = authResult?.userId ?? null;
    } catch {
      userId = null;
    }

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const sql = getDb();

    // Query user's orders
    const orders = await sql`
      SELECT id, created_at, address, status, total_amount
      FROM orders
      WHERE user_id = ${userId}
      ORDER BY created_at DESC;
    `;

    if (orders.length === 0) {
      return NextResponse.json({ orders: [] }, { status: 200 });
    }

    const orderIds = orders.map((o) => o.id);

    // Query order items for these orders
    const items = await sql`
      SELECT order_id, product_name, unit_price, quantity, line_total
      FROM order_items
      WHERE order_id = ANY(${orderIds});
    `;

    // Group items by order_id
    const itemsByOrder: Record<string, { name: string; qty: number; price: number }[]> = {};
    for (const item of items) {
      const oid = item.order_id;
      if (!itemsByOrder[oid]) {
        itemsByOrder[oid] = [];
      }
      itemsByOrder[oid].push({
        name: item.product_name,
        qty: Number(item.quantity),
        price: Number(item.unit_price),
      });
    }

    // Format list for My Orders UI
    const formattedOrders = orders.map((order) => {
      const dateObj = new Date(order.created_at);
      const formattedDate = dateObj.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });

      // Capitalize status
      const rawStatus = order.status || "placed";
      const status = rawStatus.charAt(0).toUpperCase() + rawStatus.slice(1);

      return {
        id: `ELZ-${order.id.slice(0, 8).toUpperCase()}`,
        rawId: order.id,
        date: formattedDate,
        city: order.address,
        status,
        totalAmount: Number(order.total_amount),
        items: itemsByOrder[order.id] || [],
      };
    });

    return NextResponse.json({ orders: formattedOrders }, { status: 200 });
  } catch (error: any) {
    console.error("Fetch orders error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch orders." },
      { status: 500 }
    );
  }
}
