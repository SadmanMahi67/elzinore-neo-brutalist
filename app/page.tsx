import type { Metadata } from "next";
import { Hero } from "@/components/sections/Hero";
import { ProductTeaser } from "@/components/sections/ProductTeaser";
import { TrustStrip } from "@/components/sections/TrustStrip";

export const metadata: Metadata = {
  title: {
    absolute: "Elzinore — Carbon Fiber RFID Wallet | Bangladesh",
  },
  description:
    "Slim, minimalist pop-up carbon fiber RFID-blocking wallets designed for everyday carry in Bangladesh. Nationwide Cash on Delivery.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Elzinore — Carbon Fiber RFID Wallet | Bangladesh",
    description:
      "Slim, minimalist pop-up carbon fiber RFID-blocking wallets designed for everyday carry in Bangladesh. Nationwide Cash on Delivery.",
    url: "/",
    images: [
      {
        url: "/images/wallet-hero.jpg",
        width: 1200,
        height: 630,
        alt: "Elzinore Carbon Fiber RFID Wallet",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Elzinore — Carbon Fiber RFID Wallet | Bangladesh",
    description:
      "Slim, minimalist pop-up carbon fiber RFID-blocking wallets designed for everyday carry in Bangladesh. Nationwide Cash on Delivery.",
    images: ["/images/wallet-hero.jpg"],
  },
};

export default function Home() {
  return (
    <main>
      <Hero />
      <TrustStrip />
      <ProductTeaser />
    </main>
  );
}
