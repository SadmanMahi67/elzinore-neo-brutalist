import { Faq } from "@/components/sections/Faq";
import { Hero } from "@/components/sections/Hero";
import { HowToOrder } from "@/components/sections/HowToOrder";
import { BrandStory } from "@/components/sections/BrandStory";
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
      <BrandStory />
      <ComingSoonTeaser />
      <HowToOrder />
      <Testimonials />
      <Faq />
    </main>
  );
}
