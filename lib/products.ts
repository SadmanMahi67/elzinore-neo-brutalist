import { CATALOG } from "./catalog";

export type ProductStatus = "live" | "upcoming";

export type Product = {
  id: string;
  name: string;
  price: number;
  priceLabel: string;
  originalPrice?: number;
  originalPriceLabel?: string;
  discountLabel?: string;
  stock?: number;
  status: ProductStatus;
  purchasable: boolean;
  images: string[];
  alt: string;
  description: string;
  specs: string[];
  teaser: string;
};

export const products: Product[] = [
  {
    id: CATALOG["carbon-fiber-wallet"].id,
    name: CATALOG["carbon-fiber-wallet"].name,
    price: CATALOG["carbon-fiber-wallet"].price,
    priceLabel: `৳${CATALOG["carbon-fiber-wallet"].price.toLocaleString("en-BD")}`,
    originalPrice: 2049,
    originalPriceLabel: "৳2,049",
    discountLabel: "32% OFF",
    stock: 25,
    status: CATALOG["carbon-fiber-wallet"].status,
    purchasable: CATALOG["carbon-fiber-wallet"].purchasable,
    images: [
      "/images/wallet-hero.jpg",
      "/images/wallet-lifestyle.jpg",
      "/images/wallet-closed-flat.jpg",
      "/images/wallet-side-profile.jpg",
      "/images/wallet-open-back.jpg",
    ],
    alt: "Elzinore carbon fiber RFID wallet",
    description:
      "A slim pop-up wallet we obsessed over for months — carbon fiber shell, RFID blocking, and a magnetic clasp that actually stays shut in a Dhaka auto. Backed by a 12-month warranty. One product, done properly, before we chase the next thing.",
    specs: [
      "RFID-blocking card sleeve",
      "Carbon fiber hard shell",
      "Pop-up card mechanism",
      "Magnetic clasp",
      "Fits everyday cards + a few notes",
      "12-month warranty",
    ],
    teaser: "Now shipping. The only thing we sell — on purpose.",
  },
  {
    id: CATALOG["leather-belts"].id,
    name: CATALOG["leather-belts"].name,
    price: CATALOG["leather-belts"].price,
    priceLabel: "TBA",
    status: CATALOG["leather-belts"].status,
    purchasable: CATALOG["leather-belts"].purchasable,
    images: [],
    alt: "Placeholder for upcoming Elzinore leather belts",
    description:
      "Full-grain belts with a buckle we can stand behind. Still sampling hides and hardware — we will not list a price until the first batch feels like Elzinore.",
    specs: ["Full-grain leather (sourcing)", "Quiet hardware", "Everyday width"],
    teaser: "In sampling. Not for sale yet.",
  },
  {
    id: CATALOG["leather-imprinting"].id,
    name: CATALOG["leather-imprinting"].name,
    price: CATALOG["leather-imprinting"].price,
    priceLabel: "TBA",
    status: CATALOG["leather-imprinting"].status,
    purchasable: CATALOG["leather-imprinting"].purchasable,
    images: [],
    alt: "Placeholder for upcoming Elzinore leather imprinting machine",
    description:
      "A small-batch imprinting setup so names, dates, and marks can live on leather — ours and, later, yours. Machine first, then the service around it.",
    specs: ["Custom marks", "Small-batch", "In development"],
    teaser: "The workshop tool that comes after the wallet.",
  },
  {
    id: CATALOG["next-product"].id,
    name: CATALOG["next-product"].name,
    price: CATALOG["next-product"].price,
    priceLabel: "TBA",
    status: CATALOG["next-product"].status,
    purchasable: CATALOG["next-product"].purchasable,
    images: [],
    alt: "Placeholder slot for Elzinore’s next accessory",
    description:
      "We are four people with one live SKU. The next slot stays empty until something earns it. If you have a strong opinion, tell us — we actually read the messages.",
    specs: ["Undecided", "Community-informed", "No rush"],
    teaser: "Reserved for whatever we cannot stop thinking about.",
  },
];

export const liveWallet = products[0];

export function getProduct(id: string) {
  return products.find((p) => p.id === id);
}

export function formatTaka(amount: number) {
  return `৳${amount.toLocaleString("en-BD")}`;
}
