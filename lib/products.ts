export type ProductStatus = "live" | "upcoming";

export type Product = {
  id: string;
  name: string;
  price: number;
  priceLabel: string;
  status: ProductStatus;
  images: string[];
  alt: string;
  description: string;
  specs: string[];
  teaser: string;
};

export const products: Product[] = [
  {
    id: "carbon-fiber-wallet",
    name: "Carbon Fiber RFID Wallet",
    price: 1400,
    priceLabel: "৳1,400",
    status: "live",
    // SWAP: replace these with additional studio shots when you have them
    images: ["/images/wallet-hero.jpg", "/images/wallet-lifestyle.jpg"],
    alt: "Elzinore carbon fiber RFID wallet",
    description:
      "A slim pop-up wallet we obsessed over for months — carbon fiber shell, RFID blocking, and a magnetic clasp that actually stays shut in a Dhaka auto. One product, done properly, before we chase the next thing.",
    specs: [
      "RFID-blocking card sleeve",
      "Carbon fiber hard shell",
      "Pop-up card mechanism",
      "Magnetic clasp",
      "Fits everyday cards + a few notes",
    ],
    teaser: "Now shipping. The only thing we sell — on purpose.",
  },
  {
    id: "leather-belts",
    name: "Leather Belts",
    price: 0,
    priceLabel: "TBA",
    status: "upcoming",
    images: [],
    alt: "Placeholder for upcoming Elzinore leather belts",
    description:
      "Full-grain belts with a buckle we can stand behind. Still sampling hides and hardware — we will not list a price until the first batch feels like Elzinore.",
    specs: ["Full-grain leather (sourcing)", "Quiet hardware", "Everyday width"],
    teaser: "In sampling. Not for sale yet.",
  },
  {
    id: "leather-imprinting",
    name: "Leather Imprinting Machine",
    price: 0,
    priceLabel: "TBA",
    status: "upcoming",
    images: [],
    alt: "Placeholder for upcoming Elzinore leather imprinting machine",
    description:
      "A small-batch imprinting setup so names, dates, and marks can live on leather — ours and, later, yours. Machine first, then the service around it.",
    specs: ["Custom marks", "Small-batch", "In development"],
    teaser: "The workshop tool that comes after the wallet.",
  },
  {
    id: "next-product",
    name: "Next Product?",
    price: 0,
    priceLabel: "TBA",
    status: "upcoming",
    images: [],
    alt: "Placeholder slot for Elzinore’s next accessory",
    description:
      "We are five people with one live SKU. The next slot stays empty until something earns it. If you have a strong opinion, tell us — we actually read the messages.",
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
