import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getDb } from "@/lib/db";
import { formatBangladeshDateTime } from "@/lib/date";
import { rateLimitCancel, getClientIp } from "@/lib/rateLimit";

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
      { error: "Failed to fetch order details." },
      { status: 500 }
    );
  }
}

export async function PATCH(
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

    if (!id || !UUID_REGEX.test(id)) {
      return NextResponse.json({ error: "Order not found." }, { status: 404 });
    }

    // Rate limit cancellation attempts (5 attempts per 10 minutes)
    const clientIp = getClientIp(req);
    const cancelRateResult = await rateLimitCancel(`${userId}:${clientIp}`);
    if (!cancelRateResult.success) {
      return NextResponse.json(
        { error: "Too many cancel attempts. Please try again in a few minutes." },
        { status: 429 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const action = body?.action;

    // Strictly enforce that the only permitted action is "cancel"
    // Client cannot supply any custom status or alter other fields
    if (action !== "cancel") {
      return NextResponse.json({ error: "Invalid action." }, { status: 400 });
    }

    const sql = getDb();

    // Ownership & current status check
    const orders = await sql`
      SELECT id, status, user_id
      FROM orders
      WHERE id = ${id} AND user_id = ${userId}
      LIMIT 1;
    `;

    if (orders.length === 0) {
      return NextResponse.json({ error: "Order not found." }, { status: 404 });
    }

    const currentStatus = (orders[0].status || "").toLowerCase();

    // Strictly enforce: users can ONLY cancel while status is 'placed'
    if (currentStatus !== "placed") {
      return NextResponse.json(
        {
          error:
            currentStatus === "cancelled"
              ? "This order has already been cancelled."
              : "Orders cannot be cancelled once they have been confirmed or processed.",
        },
        { status: 400 }
      );
    }

    // Atomic SQL enforcement: only update if status is 'placed' and owned by user
    const updatedRows = await sql`
      UPDATE orders
      SET status = 'cancelled', updated_at = now()
      WHERE id = ${id} AND user_id = ${userId} AND status = 'placed'
      RETURNING id, status;
    `;

    if (updatedRows.length === 0) {
      return NextResponse.json(
        { error: "Order could not be cancelled. It may have already been updated." },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Order has been cancelled successfully.",
        order: {
          id: updatedRows[0].id,
          status: "Cancelled",
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("PATCH /api/orders/[id] cancel error:", error);
    return NextResponse.json(
      { error: "Failed to cancel order." },
      { status: 500 }
    );
  }
}
