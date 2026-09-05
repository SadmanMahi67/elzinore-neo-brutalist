"use client";

import Image from "next/image";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { useProductModal } from "@/components/providers/ModalProvider";
import { liveWallet } from "@/lib/products";

export function ProductTeaser() {
  const { openProduct } = useProductModal();

  return (
    <section id="product" className="halftone border-b-4 border-border bg-violet py-24 text-black md:py-32">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <Reveal>
          <div className="relative grid gap-8 border-4 border-border bg-panel p-6 text-foreground shadow-brutal-xl md:grid-cols-2 md:p-10">
            <Badge className="absolute -left-3 -top-4 z-10" rotate={-8}>
              Signature piece
            </Badge>
            <button
              type="button"
              className="relative aspect-[4/3] overflow-hidden border-4 border-border"
              onClick={(e) => openProduct(liveWallet, e.currentTarget)}
            >
              {/* SWAP: lifestyle product photo */}
              <Image
                src={liveWallet.images[1] ?? liveWallet.images[0]}
                alt={liveWallet.alt}
                fill
                className="object-cover"
                sizes="(min-width: 768px) 40vw, 90vw"
              />
            </button>
            <div>
              <h2 className="font-grotesk text-4xl font-black uppercase leading-none tracking-tighter md:text-6xl">
                {liveWallet.name}
              </h2>
              <p className="mt-3 text-3xl font-black">{liveWallet.priceLabel}</p>
              <p className="mt-4 text-lg font-bold md:text-xl">
                Currently our only product — by design. Everything else stays in development until it&apos;s ready to stand next to it.
              </p>
              <div className="mt-8 flex flex-wrap gap-8">
                <Button
                  variant="primary"
                  onClick={() =>
                    openProduct(liveWallet, document.activeElement as HTMLElement)
                  }
                >
                  View details
                </Button>
                <Button href="/shop" variant="ghost">
                  Browse shop
                </Button>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
