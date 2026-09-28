import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }

    const sql = getDb();
    await sql`
      INSERT INTO user_notification_state (user_id, last_seen_at)
      VALUES (${userId}, now())
      ON CONFLICT (user_id)
      DO UPDATE SET last_seen_at = now();
    `;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("POST /api/notifications/seen error:", error);
    return NextResponse.json(
      { error: "Failed to mark notifications as seen." },
      { status: 500 }
    );
  }
}
