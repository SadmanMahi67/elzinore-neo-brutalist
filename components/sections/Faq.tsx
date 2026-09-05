"use client";

import { Accordion } from "@/components/ui/Accordion";
import { Reveal } from "@/components/ui/Reveal";

const items = [
  {
    q: "How long does shipping take?",
    a: "Inside Dhaka we aim for a few days after you confirm on WhatsApp. Outside Dhaka, courier timing is usually 2–5 days. We import in small batches — honest windows beat fake next-day promises.",
  },
  {
    q: "What does RFID blocking actually do?",
    a: "The sleeve is lined so a contactless reader cannot skim your cards through the wallet. It does not stop a thief who has the wallet in their hand — it stops casual wireless reads on a bus or in a crowd.",
  },
  {
    q: "Can I return or exchange?",
    a: "Unused wallets in original condition can be exchanged within 7 days of delivery if we still have stock. Message us photos first.",
  },
  {
    q: "How do I pay?",
    a: "bKash, Nagad, or bank transfer after we confirm. This website does not take cards. The cart is only so you can tally quantity before you message.",
  },
  {
    q: "Is there a warranty?",
    a: "If the pop-up mechanism or clasp fails from normal use within 30 days, we repair or replace it. Carbon fiber will scuff — that is character, not a defect.",
  },
];

export function Faq() {
  return (
    <section id="faq" className="border-b-4 border-border bg-accent py-24 text-black md:py-32">
      <div className="mx-auto max-w-3xl px-4 md:px-6">
        <Reveal>
          <h2 className="mb-8 font-grotesk text-5xl font-black uppercase leading-none tracking-tighter md:text-7xl">
            FAQ
          </h2>
          <Accordion items={items} />
        </Reveal>
      </div>
    </section>
  );
}
