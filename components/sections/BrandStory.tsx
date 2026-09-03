import Link from "next/link";
import { Reveal } from "@/components/ui/Reveal";

export function BrandStory() {
  return (
    <section className="border-b-4 border-border bg-black py-16 text-[var(--cream)]">
      <Reveal className="mx-auto max-w-3xl px-4 text-center md:px-6">
        <h2 className="font-grotesk text-5xl font-black uppercase leading-none tracking-tighter md:text-7xl">
          Five people. One rule.
        </h2>
        <p className="mt-6 text-lg font-bold md:text-xl">
          We pooled savings in Bangladesh, burned nights on Alibaba, and agreed: ship one product we would gift a friend before we pretend to be a catalogue.
        </p>
        <blockquote className="mx-auto mt-10 border-4 border-white bg-yellow p-6 text-left text-black shadow-brutal-lg">
          <p className="font-grotesk text-2xl font-black uppercase leading-tight">
            If we cannot stand behind the first SKU, we do not get to launch the second.
          </p>
          <footer className="mt-3 font-bold">— One of the five, still arguing about buckles</footer>
        </blockquote>
        <p className="mt-10">
          <Link
            href="/about"
            className="border-4 border-white bg-accent px-4 py-2 font-black uppercase text-black shadow-[6px_6px_0_0_#fff]"
          >
            Read the longer story
          </Link>
        </p>
      </Reveal>
    </section>
  );
}
