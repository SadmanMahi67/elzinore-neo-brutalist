import type { Metadata } from "next";
import { Testimonials } from "@/components/sections/Testimonials";

export const metadata: Metadata = {
  title: "Customer Reviews — Carbon Fiber Wallet",
  description:
    "Read honest reviews from customers across Bangladesh carrying Elzinore's slim RFID-blocking carbon fiber wallet.",
  alternates: {
    canonical: "/reviews",
  },
  openGraph: {
    title: "Customer Reviews — Carbon Fiber Wallet — Elzinore",
    description:
      "Read honest reviews from customers across Bangladesh carrying Elzinore's slim RFID-blocking carbon fiber wallet.",
    url: "/reviews",
    images: [
      {
        url: "/images/wallet-hero.jpg",
        width: 1200,
        height: 630,
        alt: "Elzinore Reviews",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Customer Reviews — Carbon Fiber Wallet — Elzinore",
    description:
      "Read honest reviews from customers across Bangladesh carrying Elzinore's slim RFID-blocking carbon fiber wallet.",
    images: ["/images/wallet-hero.jpg"],
  },
};

export default function ReviewsPage() {
  return (
    <main>
      <Testimonials />
    </main>
  );
}
