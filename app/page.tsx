import { Hero } from "@/components/sections/Hero";
import { ProductTeaser } from "@/components/sections/ProductTeaser";
import { TrustStrip } from "@/components/sections/TrustStrip";

export default function Home() {
  return (
    <main>
      <Hero />
      <TrustStrip />
      <ProductTeaser />
    </main>
  );
}
