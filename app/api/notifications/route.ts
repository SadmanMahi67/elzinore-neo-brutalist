import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getDb } from "@/lib/db";
import { formatBangladeshDateTime } from "@/lib/date";

export const dynamic = "force-dynamic";

const STATUS_MESSAGES: Record<string, string> = {
  confirmed: "has been confirmed and is being prepared",
  delivered: "has been delivered successfully",
  cancelled: "has been cancelled",
};

export async function GET() {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }

    const sql = getDb();

    // Get user's last_seen_at (or beginning of time if no row)
    const seenRows = await sql`
      SELECT last_seen_at FROM user_notification_state WHERE user_id = ${userId};
    `;
    const lastSeenAt = seenRows.length > 0 ? new Date(seenRows[0].last_seen_at) : new Date(0);

    // Get orders that have moved past 'placed' status
    const orders = await sql`
      SELECT id, status, updated_at, created_at
      FROM orders
      WHERE user_id = ${userId}
        AND status != 'placed'
      ORDER BY updated_at DESC;
    `;

    let hasUnread = false;
    const items = orders.map((order: any) => {
      const updatedAt = new Date(order.updated_at);
      if (updatedAt > lastSeenAt) hasUnread = true;

      const shortId = `ELZ-${order.id.slice(0, 8).toUpperCase()}`;
      const status = order.status;
      const message = STATUS_MESSAGES[status] || `status changed to ${status}`;

      return {
        orderId: order.id,
        shortId,
        status,
        message: `Order ${shortId} ${message}`,
        updatedAt: formatBangladeshDateTime(order.updated_at),
        isUnread: updatedAt > lastSeenAt,
      };
    });

    return NextResponse.json({ hasUnread, items });
  } catch (error: any) {
    console.error("GET /api/notifications error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch notifications." },
      { status: 500 }
    );
  }
}
