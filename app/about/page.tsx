import type { Metadata } from "next";
import { AboutTimeline } from "@/components/sections/AboutTimeline";
import { Testimonials } from "@/components/sections/Testimonials";
import { TrustStrip } from "@/components/sections/TrustStrip";

export const metadata: Metadata = {
  title: "Our Story — Crafted in Bangladesh",
  description:
    "Four people in Bangladesh tired of bulky leather bricks. Obsessing over one carbon fiber pop-up wallet before chasing the next SKU.",
  alternates: {
    canonical: "/about",
  },
  openGraph: {
    title: "Our Story — Crafted in Bangladesh — Elzinore",
    description:
      "Four people in Bangladesh tired of bulky leather bricks. Obsessing over one carbon fiber pop-up wallet before chasing the next SKU.",
    url: "/about",
    images: [
      {
        url: "/images/wallet-hero.jpg",
        width: 1200,
        height: 630,
        alt: "Elzinore Story",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Our Story — Crafted in Bangladesh — Elzinore",
    description:
      "Four people in Bangladesh tired of bulky leather bricks. Obsessing over one carbon fiber pop-up wallet before chasing the next SKU.",
    images: ["/images/wallet-hero.jpg"],
  },
};

export default function AboutPage() {
  return (
    <main className="grid-paper">
      <article className="mx-auto max-w-4xl px-4 py-12 md:px-6 md:py-16">
        <h1 className="font-grotesk text-6xl font-black uppercase leading-none tracking-tighter md:text-8xl">
          About Elzinore
        </h1>
        <p className="mt-6 text-lg font-bold md:text-xl">
          Elzinore started because four of us were tired of fat leather bricks and even more tired of brands that launch twelve SKUs on day one. We put savings together in Bangladesh, opened too many Alibaba tabs, and argued about RFID sleeves until one carbon fiber sample felt like ours.
        </p>

        <p className="mt-4 font-bold text-foreground/80 md:text-lg">
          We test every clasp on Dhaka roads. If a wallet pops open in a CNG or slips out of a lungi pocket, we do not ship it. No investor pressure to do six product lines this quarter — just the one piece, built to last, priced fairly in taka.
        </p>
      </article>

      <div className="mx-auto max-w-6xl px-4 pb-20 md:px-6">
        <AboutTimeline />
      </div>

      <TrustStrip />
      <Testimonials />
    </main>
  );
}
