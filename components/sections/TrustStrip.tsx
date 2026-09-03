"use client";

import Marquee from "react-fast-marquee";
import { Magnet, Minimize2, Shield, Layers, Star } from "lucide-react";

const items = [
  { icon: Shield, label: "RFID Blocking" },
  { icon: Layers, label: "Carbon Fiber Build" },
  { icon: Minimize2, label: "Slim Profile" },
  { icon: Magnet, label: "Magnetic Clasp" },
  { icon: Star, label: "One SKU. No filler." },
];

export function TrustStrip() {
  return (
    <section className="border-b-4 border-border bg-yellow py-4 text-black">
      <Marquee pauseOnHover speed={40} gradient={false}>
        {items.concat(items).map(({ icon: Icon, label }, i) => (
          <span
            key={`${label}-${i}`}
            className="mx-8 inline-flex items-center gap-3 font-grotesk text-xl font-black uppercase tracking-tight"
          >
            <Icon strokeWidth={3} className="h-6 w-6" />
            {label}
            <span aria-hidden>★</span>
          </span>
        ))}
      </Marquee>
    </section>
  );
}
