"use client";

import { ProductCard } from "@/components/shop/ProductCard";
import { products } from "@/lib/products";

export function ShopGrid() {
  const liveProducts = products.filter((p) => p.status === "live");
  const upcomingProducts = products.filter((p) => p.status === "upcoming");

  return (
    <div className="mt-10">
      {/* ── Available Now ──────────────────────────────── */}
      <h2 className="font-grotesk text-4xl font-black uppercase leading-none tracking-tighter md:text-6xl">
        Available Now
      </h2>
      <div className="mt-6 grid gap-8 md:grid-cols-2">
        {liveProducts.map((p, i) => (
          <ProductCard key={p.id} product={p} index={i} />
        ))}
      </div>

      {/* ── Divider ────────────────────────────────────── */}
      <div className="my-12 border-t-8 border-border" />

      {/* ── Coming Soon ────────────────────────────────── */}
      <h2 className="font-grotesk text-4xl font-black uppercase leading-none tracking-tighter md:text-6xl">
        Coming Soon
      </h2>
      <p className="mt-3 max-w-2xl text-lg font-bold md:text-xl">
        Still in development. These go live when they are ready.
      </p>
      <div className="mt-6 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {upcomingProducts.map((p, i) => (
          <ProductCard key={p.id} product={p} index={liveProducts.length + i} />
        ))}
      </div>
    </div>
  );
}
