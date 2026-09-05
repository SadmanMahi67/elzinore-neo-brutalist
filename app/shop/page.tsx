import { ShopGrid } from "@/components/shop/ShopGrid";

export const metadata = {
  title: "Shop",
  description:
    "Carbon fiber RFID wallet now shipping. Belts and leather imprinting coming soon.",
};

export default function ShopPage() {
  return (
    <main className="grid-paper mx-auto max-w-6xl px-4 py-12 md:px-6 md:py-16">
      <h1 className="font-grotesk text-6xl font-black uppercase leading-none tracking-tighter md:text-8xl">
        Shop
      </h1>
      <ShopGrid />
    </main>
  );
}
