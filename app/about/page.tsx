import { AboutTimeline } from "@/components/sections/AboutTimeline";
import { Testimonials } from "@/components/sections/Testimonials";
import { TrustStrip } from "@/components/sections/TrustStrip";

export const metadata = {
  title: "About Us",
  description:
    "Five people in Bangladesh, one wallet, and a rule: finish the first product before the second.",
};

export default function AboutPage() {
  return (
    <main>
      <article className="mx-auto max-w-3xl px-4 py-16 md:px-6">
        <h1 className="font-grotesk text-6xl font-black uppercase leading-none tracking-tighter md:text-8xl">
          About Elzinore
        </h1>
        <p className="mt-6 text-lg font-bold md:text-xl">
          Elzinore started because five of us were tired of fat leather bricks and even more tired of brands that launch twelve SKUs on day one. We put savings together in Bangladesh, opened too many Alibaba tabs, and argued about RFID sleeves until one carbon fiber sample felt like ours.
        </p>
        <p className="mt-4 text-lg font-bold md:text-xl">
          Sourcing from overseas as a small team means we move slower than a catalogue site. That is the point. We wanted a pop-up wallet that survives a Dhaka commute, blocks casual card skims, and looks like it belongs next to a decent watch.
        </p>
        <p className="mt-4 text-lg font-bold md:text-xl">
          Belts and a leather imprinting machine are in the plan. They are not in the cart because we have not earned them yet.
        </p>
        <AboutTimeline />
      </article>
      <TrustStrip />
      <Testimonials />
    </main>
  );
}
