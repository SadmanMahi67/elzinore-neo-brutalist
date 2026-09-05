"use client";

import Image from "next/image";
import { ArrowBurst, ShapeFloater, SpinStar } from "@/components/decor/Motifs";
import { Button } from "@/components/ui/Button";
import { useProductModal } from "@/components/providers/ModalProvider";
import { liveWallet } from "@/lib/products";

export function Hero() {
  const { openProduct } = useProductModal();

  return (
    <section className="grid-paper relative overflow-hidden border-b-4 border-border bg-background">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-20 md:grid-cols-2 md:px-6 md:py-32">
        <div>
          <h1 className="mt-6 font-grotesk text-6xl font-black uppercase leading-none tracking-tighter md:text-8xl lg:text-9xl">
            Slim by{" "}
            <span className="hollow">design.</span>
          </h1>
          <p className="mt-6 max-w-md text-lg font-bold md:text-xl">
            Carbon fiber. RFID-blocking. Built to carry less and lose nothing.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-8">
            <Button href="/shop" variant="primary" size="lg">
              Order the wallet
            </Button>
            <Button href="/shop" variant="ghost">
              What&apos;s coming
            </Button>
          </div>
          <ArrowBurst className="mt-8 hidden h-10 w-20 text-ink md:block" />
        </div>
        <div className="relative">
          <SpinStar className="absolute -left-4 -top-4 z-10 h-12 w-12" />
          <ShapeFloater className="absolute -bottom-4 -right-2 rotate-12" />
          <button
            type="button"
            className="relative aspect-[4/5] w-full overflow-hidden border-4 border-border bg-panel shadow-brutal-xl"
            onClick={(e) => openProduct(liveWallet, e.currentTarget)}
            aria-label="View wallet details"
          >
            {/* SWAP: public/images/wallet-hero.jpg */}
            <Image
              src={liveWallet.images[0]}
              alt="Front view of Elzinore's slim carbon fiber wallet standing on a marble pedestal"
              fill
              priority
              className="object-cover"
              sizes="(min-width: 768px) 40vw, 90vw"
            />
          </button>
        </div>
      </div>
    </section>
  );
}
