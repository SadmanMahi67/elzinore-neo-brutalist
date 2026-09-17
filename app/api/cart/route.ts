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
    const rows = await sql`
      SELECT items FROM carts WHERE user_id = ${userId};
    `;

    const items = rows[0]?.items ?? [];
    return NextResponse.json({ items }, { status: 200 });
  } catch (error: any) {
    console.error("GET /api/cart error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch cart." },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
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

    const body = await req.json();
    const items = Array.isArray(body?.items) ? body.items : [];

    const sql = getDb();
    await sql`
      INSERT INTO carts (user_id, items, updated_at)
      VALUES (${userId}, ${JSON.stringify(items)}, now())
      ON CONFLICT (user_id) DO UPDATE
      SET items = EXCLUDED.items, updated_at = now();
    `;

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error("PUT /api/cart error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to save cart." },
      { status: 500 }
    );
  }
}
