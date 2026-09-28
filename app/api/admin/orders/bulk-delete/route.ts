import { NextResponse } from "next/server";
import { checkIsAdmin } from "@/lib/isAdmin";
import { getDb } from "@/lib/db";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const adminCheck = await checkIsAdmin();
    if (!adminCheck.authorized) {
      const statusCode = adminCheck.reason === "unauthenticated" ? 401 : 403;
      return NextResponse.json(
        { error: adminCheck.reason === "unauthenticated" ? "Authentication required." : "Not authorized." },
        { status: statusCode }
      );
    }

    let body: any;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON body." },
        { status: 400 }
      );
    }

    const ids = body?.ids;
    if (!Array.isArray(ids) || ids.length === 0 || ids.length > 100) {
      return NextResponse.json(
        { error: "ids must be an array of 1 to 100 UUIDs." },
        { status: 400 }
      );
    }

    for (const id of ids) {
      if (typeof id !== "string" || !UUID_REGEX.test(id)) {
        return NextResponse.json(
          { error: `Invalid order ID format: ${id}. Expected a valid UUID.` },
          { status: 400 }
        );
      }
    }

    const sql = getDb();
    const deletedRows = await sql`
      DELETE FROM orders
      WHERE id = ANY(${ids}::uuid[])
      RETURNING id;
    `;

    const deletedIds = deletedRows.map((r: any) => r.id);

    const adminEmail = adminCheck.email || "admin";
    console.log(`[ADMIN DELETE] Admin: ${adminEmail}, Orders: ${deletedIds.join(",")}, Timestamp: ${new Date().toISOString()}`);

    return NextResponse.json(
      { deletedIds },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("POST /api/admin/orders/bulk-delete error:", error);
    return NextResponse.json(
      { error: "Failed to bulk delete orders." },
      { status: 500 }
    );
  }
}
