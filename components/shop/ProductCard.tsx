"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { ImagePlaceholder } from "@/components/decor/ImagePlaceholder";
import { useProductModal } from "@/components/providers/ModalProvider";
import { Card } from "@/components/ui/Card";
import { reveal } from "@/lib/motion";
import type { Product } from "@/lib/products";

export function ProductCard({
  product,
  index = 0,
}: {
  product: Product;
  index?: number;
}) {
  const { openProduct } = useProductModal();
  const reduce = useReducedMotion();
  const live = product.status === "live";

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ ...reveal(reduce), delay: index * 0.05 }}
      style={{ rotate: index % 2 === 0 ? "-1deg" : "1deg" }}
    >
      <Card quiet={!live} className="relative p-4">
        {!live && (
          <span className="absolute right-4 top-4 z-10 rotate-6 border-4 border-border bg-accent px-3 py-1 font-black uppercase text-black shadow-brutal">
            Coming soon
          </span>
        )}
        {live && (
          <span className="absolute left-4 top-4 z-10 -rotate-6 rounded-full border-4 border-border bg-yellow px-3 py-1 font-black uppercase text-black shadow-brutal">
            ★ Signature piece
          </span>
        )}
        <button
          type="button"
          className="flex w-full flex-col gap-4 text-left"
          onClick={(e) => openProduct(product, e.currentTarget)}
        >
          <div className="relative aspect-[4/3] overflow-hidden border-4 border-border">
            {live && product.images[0] ? (
              <Image
                src={product.images[0]}
                alt={product.alt}
                fill
                className="object-cover"
                sizes="(min-width: 768px) 50vw, 100vw"
              />
            ) : (
              <ImagePlaceholder label={product.name} />
            )}
          </div>
          <div className={live ? "" : "text-black"}>
            <h3 className="font-grotesk text-2xl font-black uppercase leading-none">
              {product.name}
            </h3>
            <p className="mt-2 font-bold">{product.teaser}</p>
            <p className="mt-2 font-black">
              {live ? product.priceLabel : "Not for sale yet"}
            </p>
            {live && product.originalPriceLabel && (
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <span className="text-sm font-bold text-muted-foreground line-through">
                  {product.originalPriceLabel}
                </span>
                <span className="border-2 border-border bg-accent px-2 py-0.5 text-xs font-black uppercase text-black">
                  Limited offer
                </span>
                <span className="border-2 border-border bg-panel px-2 py-0.5 text-xs font-black uppercase text-foreground">
                  Free Delivery
                </span>
              </div>
            )}
            <span className="mt-3 inline-block border-4 border-border bg-panel px-3 py-1 font-black uppercase text-foreground">
              {live ? "Order now" : "Peek inside"}
            </span>
          </div>
        </button>
      </Card>
    </motion.div>
  );
}
