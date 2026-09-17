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
    const updatedRows = await sql`
      UPDATE orders
      SET status = ${rawStatus}
      WHERE id = ${id}
      RETURNING id, status;
    `;

    if (updatedRows.length === 0) {
      return NextResponse.json(
        { error: `Order not found with ID: ${id}` },
        { status: 404 }
      );
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
      { error: error.message || "Failed to update order status." },
      { status: 500 }
    );
  }
}
