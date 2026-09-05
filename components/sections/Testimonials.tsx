"use client";

import Marquee from "react-fast-marquee";
import { Reveal } from "@/components/ui/Reveal";

const quotes = [
  { text: "Placeholder — swap this for a real customer line once the first wallets land.", name: "Placeholder Customer" },
  { text: "Another slot for a review. Keep it short and in someone’s actual voice.", name: "Placeholder Customer" },
  { text: "Be the first to leave a review. Ordered? Message us a line. No fake stars.", name: "You, maybe" },
];

export function Testimonials() {
  return (
    <section className="halftone border-b-4 border-border bg-background py-16">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <Reveal>
          <h2 className="font-grotesk text-5xl font-black uppercase leading-none tracking-tighter md:text-7xl">
            Reviews
          </h2>
        </Reveal>
      </div>
      <div className="mt-10">
        <Marquee pauseOnHover speed={35} gradient={false}>
          {quotes.map((q) => (
            <figure
              key={q.text}
              className="mx-4 w-[320px] border-4 border-border bg-panel p-6 shadow-brutal-md"
            >
              <blockquote className="text-lg font-bold">“{q.text}”</blockquote>
              <figcaption className="mt-4 font-black uppercase">— {q.name}</figcaption>
            </figure>
          ))}
        </Marquee>
      </div>
    </section>
  );
}
