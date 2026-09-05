import { Faq } from "@/components/sections/Faq";
import { Hero } from "@/components/sections/Hero";
import { ComingSoonTeaser } from "@/components/sections/ComingSoonTeaser";
import { ProductTeaser } from "@/components/sections/ProductTeaser";
import { Testimonials } from "@/components/sections/Testimonials";
import { TrustStrip } from "@/components/sections/TrustStrip";

export default function Home() {
  return (
    <main>
      <Hero />
      <TrustStrip />
      <ProductTeaser />
      <ComingSoonTeaser />
      <Testimonials />
      <Faq />
    </main>
  );
}
