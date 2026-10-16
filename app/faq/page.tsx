import type { Metadata } from "next";
import { Faq } from "@/components/sections/Faq";

export const metadata: Metadata = {
  title: "FAQ — Shipping, Warranty & RFID",
  description:
    "Frequently asked questions about Elzinore's carbon fiber pop-up wallet: Cash on Delivery across Bangladesh, delivery times, and 12-month warranty.",
  alternates: {
    canonical: "/faq",
  },
  openGraph: {
    title: "FAQ — Shipping, Warranty & RFID — Elzinore",
    description:
      "Frequently asked questions about Elzinore's carbon fiber pop-up wallet: Cash on Delivery across Bangladesh, delivery times, and 12-month warranty.",
    url: "/faq",
    images: [
      {
        url: "/images/wallet-hero.jpg",
        width: 1200,
        height: 630,
        alt: "Elzinore FAQ",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "FAQ — Shipping, Warranty & RFID — Elzinore",
    description:
      "Frequently asked questions about Elzinore's carbon fiber pop-up wallet: Cash on Delivery across Bangladesh, delivery times, and 12-month warranty.",
    images: ["/images/wallet-hero.jpg"],
  },
};

export default function FaqPage() {
  return (
    <main>
      <Faq />
    </main>
  );
}
