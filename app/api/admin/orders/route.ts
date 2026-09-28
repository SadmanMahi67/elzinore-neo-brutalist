import { NextResponse } from "next/server";
import { checkIsAdmin } from "@/lib/isAdmin";
import { getDb } from "@/lib/db";
import { formatBangladeshDateTime } from "@/lib/date";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const adminCheck = await checkIsAdmin();
    if (!adminCheck.authorized) {
      const statusCode = adminCheck.reason === "unauthenticated" ? 401 : 403;
      return NextResponse.json(
        { error: adminCheck.reason === "unauthenticated" ? "Authentication required." : "Not authorized." },
        { status: statusCode }
      );
    }

    const { searchParams } = new URL(req.url);
    const statusParam = searchParams.get("status")?.trim().toLowerCase();
    const queryParam = searchParams.get("q")?.trim();

    const sql = getDb();

    // Query orders with optional filtering
    let orders: any[] = [];

    if (statusParam && statusParam !== "all" && queryParam) {
      const searchPattern = `%${queryParam}%`;
      orders = await sql`
        SELECT id, created_at, customer_name, phone, email, address, payment_method, status, total_amount
        FROM orders
        WHERE LOWER(status) = ${statusParam}
          AND (customer_name ILIKE ${searchPattern} OR phone ILIKE ${searchPattern})
        ORDER BY created_at DESC;
      `;
    } else if (statusParam && statusParam !== "all") {
      orders = await sql`
        SELECT id, created_at, customer_name, phone, email, address, payment_method, status, total_amount
        FROM orders
        WHERE LOWER(status) = ${statusParam}
        ORDER BY created_at DESC;
      `;
    } else if (queryParam) {
      const searchPattern = `%${queryParam}%`;
      orders = await sql`
        SELECT id, created_at, customer_name, phone, email, address, payment_method, status, total_amount
        FROM orders
        WHERE customer_name ILIKE ${searchPattern} OR phone ILIKE ${searchPattern}
        ORDER BY created_at DESC;
      `;
    } else {
      orders = await sql`
        SELECT id, created_at, customer_name, phone, email, address, payment_method, status, total_amount
        FROM orders
        ORDER BY created_at DESC;
      `;
    }

    if (orders.length === 0) {
      return NextResponse.json({ orders: [] }, { status: 200 });
    }

    const orderIds = orders.map((o) => o.id);

    // Query line items
    const items = await sql`
      SELECT order_id, product_name, unit_price, quantity, line_total
      FROM order_items
      WHERE order_id = ANY(${orderIds});
    `;

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

    const formattedOrders = orders.map((order) => {
      const orderItems = itemsByOrder[order.id] || [];
      const itemSummary =
        orderItems.length > 0
          ? orderItems.map((i) => `${i.name} ×${i.qty}`).join(", ")
          : "No items";

      const formattedDate = formatBangladeshDateTime(order.created_at);

      return {
        id: order.id,
        shortId: `ELZ-${order.id.slice(0, 8).toUpperCase()}`,
        createdAt: order.created_at,
        date: formattedDate,
        customerName: order.customer_name,
        phone: order.phone,
        email: order.email || "N/A",
        address: order.address,
        paymentMethod: order.payment_method,
        status: (order.status || "placed").toLowerCase(),
        totalAmount: Number(order.total_amount),
        itemSummary,
        items: orderItems,
      };
    });

    return NextResponse.json({ orders: formattedOrders }, { status: 200 });
  } catch (error: any) {
    console.error("Admin GET /api/admin/orders error:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders." },
      { status: 500 }
    );
  }
}
