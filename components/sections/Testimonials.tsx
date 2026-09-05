"use client";

import { Camera } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";

const quotes = [
  {
    text: "Placeholder — swap this for a real customer line once the first wallets land.",
    name: "Placeholder Customer",
    image: null as string | null,
  },
  {
    text: "Another slot for a review. Keep it short and in someone's actual voice.",
    name: "Placeholder Customer",
    image: null as string | null,
  },
  {
    text: "Be the first to leave a review. Ordered? Message us a line. No fake stars.",
    name: "You, maybe",
    image: null as string | null,
  },
];

export function Testimonials() {
  return (
    <section className="halftone border-b-4 border-border bg-background py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <Reveal>
          <h2 className="font-grotesk text-5xl font-black uppercase leading-none tracking-tighter md:text-7xl">
            Reviews
          </h2>
          <p className="mt-4 max-w-2xl text-lg font-bold md:text-xl">
            Real feedback from real pockets. Photo slots are ready for when customers send theirs in.
          </p>
        </Reveal>

        <div className="mt-10 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {quotes.map((q, i) => (
            <Reveal key={q.text} delay={i * 0.05}>
              <div className="border-4 border-border bg-panel p-5 shadow-brutal-md">
                {/* Image slot — swap null for a real image path when available */}
                <div className="relative flex aspect-video items-center justify-center border-4 border-border bg-violet">
                  {q.image ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={q.image}
                      alt={`Photo from ${q.name}`}
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-black">
                      <Camera strokeWidth={3} className="h-8 w-8" />
                      <span className="font-grotesk text-xs font-black uppercase">
                        Photo coming
                      </span>
                    </div>
                  )}
                </div>

                <blockquote className="mt-4 text-lg font-bold">
                  &ldquo;{q.text}&rdquo;
                </blockquote>
                <p className="mt-3 font-black uppercase">— {q.name}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
