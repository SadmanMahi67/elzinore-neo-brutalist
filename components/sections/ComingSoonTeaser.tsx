import Link from "next/link";
import { ImagePlaceholder } from "@/components/decor/ImagePlaceholder";
import { Reveal } from "@/components/ui/Reveal";
import { products } from "@/lib/products";

export function ComingSoonTeaser() {
  const upcoming = products.filter((p) => p.status === "upcoming").slice(0, 2);

  return (
    <section id="coming-soon" className="grid-paper border-b-4 border-border bg-background py-16">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <Reveal>
          <h2 className="font-grotesk text-5xl font-black uppercase leading-none tracking-tighter md:text-7xl">
            More on the way
          </h2>
          <p className="mt-4 max-w-2xl text-lg font-bold md:text-xl">
            Belts and imprinting are in the notebook — not in the cart.
          </p>
        </Reveal>
        <div className="mt-10 grid gap-8 md:grid-cols-2">
          {upcoming.map((p, i) => (
            <Reveal key={p.id} delay={i * 0.05}>
              <div className="relative border-4 border-border bg-violet p-4 text-black shadow-brutal-md">
                <span className="absolute right-4 top-4 z-10 rotate-6 border-4 border-border bg-accent px-3 py-1 font-black uppercase text-black shadow-brutal">
                  Coming soon
                </span>
                <div className="border-4 border-border">
                  <ImagePlaceholder label={p.name} />
                </div>
                <h3 className="mt-4 font-grotesk text-2xl font-black uppercase">{p.name}</h3>
                <p className="mt-1 font-bold">{p.teaser}</p>
              </div>
            </Reveal>
          ))}
        </div>
        <p className="mt-8">
          <Link href="/shop" className="font-black uppercase underline decoration-4 underline-offset-4">
            See everything in the shop
          </Link>
        </p>
      </div>
    </section>
  );
}
