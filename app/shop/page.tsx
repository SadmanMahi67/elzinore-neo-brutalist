import type { Metadata } from "next";
import { ShopGrid } from "@/components/shop/ShopGrid";
import { CATALOG } from "@/lib/catalog";
import { SITE_URL } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Shop Minimalist Carbon Fiber Wallets",
  description:
    "Buy the Elzinore Carbon Fiber RFID Wallet in Bangladesh. Slim pop-up design, RFID blocking, ৳1,449 with nationwide COD. More accessories coming soon.",
  alternates: {
    canonical: "/shop",
  },
  openGraph: {
    title: "Shop Minimalist Carbon Fiber Wallets — Elzinore",
    description:
      "Buy the Elzinore Carbon Fiber RFID Wallet in Bangladesh. Slim pop-up design, RFID blocking, ৳1,449 with nationwide COD.",
    url: "/shop",
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
    title: "Shop Minimalist Carbon Fiber Wallets — Elzinore",
    description:
      "Buy the Elzinore Carbon Fiber RFID Wallet in Bangladesh. Slim pop-up design, RFID blocking, ৳1,449 with nationwide COD.",
    images: ["/images/wallet-hero.jpg"],
  },
};

export default function ShopPage() {
  const liveWallet = CATALOG["carbon-fiber-wallet"];

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: liveWallet.name,
    image: `${SITE_URL}/images/wallet-hero.jpg`,
    description:
      "A slim pop-up wallet with carbon fiber hard shell, RFID-blocking card sleeve, and magnetic clasp for everyday carry in Bangladesh.",
    brand: {
      "@type": "Brand",
      name: "Elzinore",
    },
    offers: {
      "@type": "Offer",
      url: `${SITE_URL}/shop`,
      priceCurrency: "BDT",
      price: liveWallet.price.toString(),
      availability: "https://schema.org/InStock",
      itemCondition: "https://schema.org/NewCondition",
    },
  };

  return (
    <main className="grid-paper mx-auto max-w-6xl px-4 py-12 md:px-6 md:py-16">
      {/* Product Schema.org structured data (live SKU only) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <h1 className="font-grotesk text-6xl font-black uppercase leading-none tracking-tighter md:text-8xl">
        Shop
      </h1>
      <ShopGrid />
    </main>
  );
}
