import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getDb } from "@/lib/db";
import { getCatalogItem } from "@/lib/catalog";
import { products } from "@/lib/products";

export const dynamic = "force-dynamic";

const MAX_BODY_BYTES = 10 * 1024; // 10 KB

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

    const rawItems = rows[0]?.items ?? [];
    // Ensure returned items are validated against catalog
    const validatedItems = Array.isArray(rawItems)
      ? rawItems.filter((i) => i && typeof i === "object" && getCatalogItem(i.id || i.productId))
      : [];

    return NextResponse.json({ items: validatedItems }, { status: 200 });
  } catch (error: any) {
    console.error("GET /api/cart error:", error);
    return NextResponse.json(
      { error: "Failed to fetch cart." },
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

    // 1. Enforce 10 KB body size cap
    const contentLength = req.headers.get("content-length");
    if (contentLength && parseInt(contentLength, 10) > MAX_BODY_BYTES) {
      return NextResponse.json(
        { error: "Payload too large. Maximum size is 10 KB." },
        { status: 413 }
      );
    }

    const rawBody = await req.text();
    if (Buffer.byteLength(rawBody, "utf8") > MAX_BODY_BYTES) {
      return NextResponse.json(
        { error: "Payload too large. Maximum size is 10 KB." },
        { status: 413 }
      );
    }

    let body: any;
    try {
      body = JSON.parse(rawBody);
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON format." },
        { status: 400 }
      );
    }

    const items = body?.items;
    if (!Array.isArray(items)) {
      return NextResponse.json(
        { error: "Cart items must be an array." },
        { status: 400 }
      );
    }

    if (items.length > 5) {
      return NextResponse.json(
        { error: "Cart may not contain more than 5 distinct items." },
        { status: 400 }
      );
    }

    // 2. Validate each item against the catalog (only productId + quantity accepted)
    const sanitizedCartItems = [];
    for (const item of items) {
      if (!item || typeof item !== "object") {
        return NextResponse.json(
          { error: "Invalid cart item structure." },
          { status: 400 }
        );
      }

      const productId = (item.productId || item.id || "").trim();
      const rawQty = item.quantity;

      if (!productId) {
        return NextResponse.json(
          { error: "Item productId is required." },
          { status: 400 }
        );
      }

      if (
        typeof rawQty !== "number" ||
        !Number.isInteger(rawQty) ||
        rawQty < 1 ||
        rawQty > 10
      ) {
        return NextResponse.json(
          { error: "Quantity must be an integer between 1 and 10." },
          { status: 400 }
        );
      }

      const catalogItem = getCatalogItem(productId);
      if (!catalogItem || !catalogItem.purchasable) {
        return NextResponse.json(
          { error: `Item '${productId}' is not available for purchase.` },
          { status: 400 }
        );
      }

      const fullProduct = products.find((p) => p.id === catalogItem.id);

      sanitizedCartItems.push({
        id: catalogItem.id,
        name: catalogItem.name,
        price: catalogItem.price,
        quantity: rawQty,
        image: fullProduct?.images[0] || "",
      });
    }

    const sql = getDb();
    await sql`
      INSERT INTO carts (user_id, items, updated_at)
      VALUES (${userId}, ${JSON.stringify(sanitizedCartItems)}, now())
      ON CONFLICT (user_id) DO UPDATE
      SET items = EXCLUDED.items, updated_at = now();
    `;

    return NextResponse.json({ success: true, items: sanitizedCartItems }, { status: 200 });
  } catch (error: any) {
    console.error("PUT /api/cart error:", error);
    return NextResponse.json(
      { error: "Failed to save cart." },
      { status: 500 }
    );
  }
}
