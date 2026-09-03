"use client";

import { ProductCard } from "@/components/shop/ProductCard";
import { products } from "@/lib/products";

export function ShopGrid() {
  return (
    <div className="mt-10 grid gap-8 md:grid-cols-2">
      {products.map((p, i) => (
        <ProductCard key={p.id} product={p} index={i} />
      ))}
    </div>
  );
}
