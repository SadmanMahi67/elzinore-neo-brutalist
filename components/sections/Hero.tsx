"use client";

import Image from "next/image";
import { ArrowBurst, ShapeFloater, SpinStar } from "@/components/decor/Motifs";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { liveWallet } from "@/lib/products";

export function Hero() {
  return (
    <section className="grid-paper relative overflow-hidden border-b-4 border-border bg-background">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-12 md:grid-cols-2 md:px-6 md:py-16">
        <div>
          <Badge>Now Shipping BD</Badge>
          <h1 className="mt-6 font-grotesk text-6xl font-black uppercase leading-none tracking-tighter md:text-8xl lg:text-9xl">
            Carry less.{" "}
            <span className="hollow">Carry</span> more.
          </h1>
          <p className="mt-6 max-w-md text-lg font-bold md:text-xl">
            One carbon fiber RFID wallet. Five people in Dhaka. Belts later. Hype never.
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
          <div className="relative aspect-[4/5] overflow-hidden border-4 border-border bg-panel shadow-brutal-xl">
            {/* SWAP: public/images/wallet-hero.jpg */}
            <Image
              src={liveWallet.images[0]}
              alt="Front view of Elzinore's slim carbon fiber wallet standing on a marble pedestal"
              fill
              priority
              className="object-cover"
              sizes="(min-width: 768px) 40vw, 90vw"
            />
          </div>
          <div className="absolute -right-2 top-6 rotate-6 border-4 border-border bg-yellow px-4 py-2 font-black text-black shadow-brutal-md">
            {liveWallet.priceLabel}
          </div>
        </div>
      </div>
    </section>
  );
}
