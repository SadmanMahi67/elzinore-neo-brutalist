import { NextResponse } from "next/server";
import { checkIsAdmin } from "@/lib/isAdmin";
import { getDb } from "@/lib/db";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const ALLOWED_STATUSES = ["placed", "confirmed", "delivered", "cancelled"] as const;

export const dynamic = "force-dynamic";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const adminCheck = await checkIsAdmin();
    if (!adminCheck.authorized) {
      const statusCode = adminCheck.reason === "unauthenticated" ? 401 : 403;
      return NextResponse.json(
        { error: adminCheck.reason === "unauthenticated" ? "Authentication required." : "Not authorized." },
        { status: statusCode }
      );
    }

    const { id } = params;

    // Validate UUID param format before querying to avoid Postgres syntax error
    if (!id || !UUID_REGEX.test(id)) {
      return NextResponse.json(
        { error: "Invalid order ID format. Expected a valid UUID." },
        { status: 400 }
      );
    }

    const body = await req.json();
    const rawStatus = (body?.status || "").trim().toLowerCase();

    // Validate status is strictly one of the allowed statuses
    if (!ALLOWED_STATUSES.includes(rawStatus as any)) {
      return NextResponse.json(
        {
          error: `Invalid status '${rawStatus}'. Allowed statuses are: ${ALLOWED_STATUSES.join(
            ", "
          )}.`,
        },
        { status: 400 }
      );
    }

    const sql = getDb();

    // Check previous status before updating to manage inventory
    const existingOrders = await sql`
      SELECT status FROM orders WHERE id = ${id};
    `;
    if (existingOrders.length === 0) {
      return NextResponse.json(
        { error: `Order not found with ID: ${id}` },
        { status: 404 }
      );
    }
    const prevStatus = (existingOrders[0].status || "").toLowerCase();

    const updatedRows = await sql`
      UPDATE orders
      SET status = ${rawStatus}, updated_at = now()
      WHERE id = ${id}
      RETURNING id, status;
    `;

    // Stock update logic:
    // When order is confirmed, deduct wallet stock. When cancelled, restore stock.
    const isNowConfirmed = rawStatus === "confirmed" || rawStatus === "delivered";
    const wasConfirmed = prevStatus === "confirmed" || prevStatus === "delivered";

    if (!wasConfirmed && isNowConfirmed) {
      const items = await sql`
        SELECT quantity FROM order_items WHERE order_id = ${id} AND product_name ILIKE '%wallet%';
      `;
      const qty = items.reduce((acc: number, item: any) => acc + Number(item.quantity || 1), 0);
      if (qty > 0) {
        await sql`
          UPDATE inventory
          SET stock = GREATEST(0, stock - ${qty}), updated_at = now()
          WHERE product_id = 'carbon-fiber-wallet';
        `;
      }
    } else if (wasConfirmed && rawStatus === "cancelled") {
      const items = await sql`
        SELECT quantity FROM order_items WHERE order_id = ${id} AND product_name ILIKE '%wallet%';
      `;
      const qty = items.reduce((acc: number, item: any) => acc + Number(item.quantity || 1), 0);
      if (qty > 0) {
        await sql`
          UPDATE inventory
          SET stock = stock + ${qty}, updated_at = now()
          WHERE product_id = 'carbon-fiber-wallet';
        `;
      }
    }

    return NextResponse.json(
      {
        success: true,
        order: {
          id: updatedRows[0].id,
          status: updatedRows[0].status,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("PATCH /api/admin/orders/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to update order status." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const adminCheck = await checkIsAdmin();
    if (!adminCheck.authorized) {
      const statusCode = adminCheck.reason === "unauthenticated" ? 401 : 403;
      return NextResponse.json(
        { error: adminCheck.reason === "unauthenticated" ? "Authentication required." : "Not authorized." },
        { status: statusCode }
      );
    }

    const { id } = params;

    if (!id || !UUID_REGEX.test(id)) {
      return NextResponse.json(
        { error: "Invalid order ID format. Expected a valid UUID." },
        { status: 400 }
      );
    }

    const sql = getDb();

    // Check if the order was confirmed before deletion
    const existingOrders = await sql`
      SELECT status FROM orders WHERE id = ${id};
    `;
    const wasConfirmed = existingOrders[0]?.status === "confirmed" || existingOrders[0]?.status === "delivered";

    let walletQty = 0;
    if (wasConfirmed) {
      const items = await sql`
        SELECT quantity FROM order_items WHERE order_id = ${id} AND product_name ILIKE '%wallet%';
      `;
      walletQty = items.reduce((acc: number, item: any) => acc + Number(item.quantity || 1), 0);
    }

    const deletedRows = await sql`
      DELETE FROM orders
      WHERE id = ${id}
      RETURNING id;
    `;

    if (deletedRows.length === 0) {
      return NextResponse.json(
        { error: `Order not found with ID: ${id}` },
        { status: 404 }
      );
    }

    if (wasConfirmed && walletQty > 0) {
      await sql`
        UPDATE inventory
        SET stock = stock + ${walletQty}, updated_at = now()
        WHERE product_id = 'carbon-fiber-wallet';
      `;
    }

    const adminEmail = adminCheck.email || "admin";
    console.log(`[ADMIN DELETE] Admin: ${adminEmail}, Orders: ${id}, Timestamp: ${new Date().toISOString()}`);

    return NextResponse.json(
      { deletedId: deletedRows[0].id },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("DELETE /api/admin/orders/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to delete order." },
      { status: 500 }
    );
  }
}
