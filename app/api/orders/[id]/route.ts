import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getDb } from "@/lib/db";
import { formatBangladeshDateTime } from "@/lib/date";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const dynamic = "force-dynamic";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
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

    const { id } = params;

    // If ID format is not a valid UUID, return 404 immediately
    // so clients cannot distinguish between non-existent IDs and invalid IDs
    if (!id || !UUID_REGEX.test(id)) {
      return NextResponse.json({ error: "Order not found." }, { status: 404 });
    }

    const sql = getDb();

    // Ownership check: must match both id and user_id.
    // If not found or not owned by user, return 404 (not 403) to prevent ID enumeration.
    const orders = await sql`
      SELECT id, created_at, customer_name, phone, email, address, payment_method, status, total_amount
      FROM orders
      WHERE id = ${id} AND user_id = ${userId}
      LIMIT 1;
    `;

    if (orders.length === 0) {
      return NextResponse.json({ error: "Order not found." }, { status: 404 });
    }

    const order = orders[0];

    // Fetch line items
    const items = await sql`
      SELECT id, product_name, unit_price, quantity, line_total
      FROM order_items
      WHERE order_id = ${id};
    `;

    const formattedDate = formatBangladeshDateTime(order.created_at);

    const rawStatus = (order.status || "placed").toLowerCase();
    const capitalizedStatus = rawStatus.charAt(0).toUpperCase() + rawStatus.slice(1);

    const formattedOrder = {
      id: order.id,
      shortId: `ELZ-${order.id.slice(0, 8).toUpperCase()}`,
      date: formattedDate,
      customerName: order.customer_name,
      phone: order.phone,
      email: order.email || "N/A",
      address: order.address,
      paymentMethod: order.payment_method || "cod",
      status: capitalizedStatus,
      rawStatus,
      totalAmount: Number(order.total_amount),
      items: items.map((item) => ({
        id: item.id,
        name: item.product_name,
        price: Number(item.unit_price),
        quantity: Number(item.quantity),
        lineTotal: Number(item.line_total),
        // Fallback or wallet image for recognized product
        image: item.product_name.toLowerCase().includes("wallet")
          ? "/images/wallet-hero.jpg"
          : "",
      })),
    };

    return NextResponse.json({ order: formattedOrder }, { status: 200 });
  } catch (error: any) {
    console.error("GET /api/orders/[id] error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch order details." },
      { status: 500 }
    );
  }
}
