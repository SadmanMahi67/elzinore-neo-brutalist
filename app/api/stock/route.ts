import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { checkIsAdmin } from "@/lib/isAdmin";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const sql = getDb();
    
    // Ensure table exists and default row is present
    const rows = await sql`
      SELECT stock, initial_stock 
      FROM inventory 
      WHERE product_id = 'carbon-fiber-wallet'
      LIMIT 1;
    `;

    if (rows.length === 0) {
      // Auto-initialize if missing
      await sql`
        CREATE TABLE IF NOT EXISTS inventory (
          product_id TEXT PRIMARY KEY,
          stock INTEGER NOT NULL DEFAULT 25,
          initial_stock INTEGER NOT NULL DEFAULT 25,
          updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
        );
      `;
      await sql`
        INSERT INTO inventory (product_id, stock, initial_stock)
        VALUES ('carbon-fiber-wallet', 25, 25)
        ON CONFLICT (product_id) DO NOTHING;
      `;
      return NextResponse.json(
        {
          productId: "carbon-fiber-wallet",
          stock: 25,
          initialStock: 25,
          inStock: true,
          lowStock: false,
        },
        {
          headers: {
            "Cache-Control": "no-store, max-age=0",
          },
        }
      );
    }

    const stock = Number(rows[0].stock ?? 25);
    const initialStock = Number(rows[0].initial_stock ?? 25);

    return NextResponse.json(
      {
        productId: "carbon-fiber-wallet",
        stock,
        initialStock,
        inStock: stock > 0,
        lowStock: stock > 0 && stock <= 5,
      },
      {
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      }
    );
  } catch (error: any) {
    console.error("GET /api/stock error:", error);
    // Graceful fallback to default 25
    return NextResponse.json(
      {
        productId: "carbon-fiber-wallet",
        stock: 25,
        initialStock: 25,
        inStock: true,
        lowStock: false,
      },
      { status: 200 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const adminCheck = await checkIsAdmin();
    if (!adminCheck.authorized) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: adminCheck.reason === "unauthenticated" ? 401 : 403 }
      );
    }

    const body = await req.json();
    const newStock = Number(body?.stock);

    if (isNaN(newStock) || newStock < 0 || !Number.isInteger(newStock)) {
      return NextResponse.json(
        { error: "stock must be a non-negative integer." },
        { status: 400 }
      );
    }

    const sql = getDb();
    const rows = await sql`
      INSERT INTO inventory (product_id, stock, initial_stock, updated_at)
      VALUES ('carbon-fiber-wallet', ${newStock}, ${newStock}, now())
      ON CONFLICT (product_id) DO UPDATE
      SET stock = ${newStock}, updated_at = now()
      RETURNING stock, initial_stock;
    `;

    return NextResponse.json({
      success: true,
      stock: Number(rows[0]?.stock ?? newStock),
      initialStock: Number(rows[0]?.initial_stock ?? newStock),
    });
  } catch (error: any) {
    console.error("PATCH /api/stock error:", error);
    return NextResponse.json(
      { error: "Failed to update stock." },
      { status: 500 }
    );
  }
}
