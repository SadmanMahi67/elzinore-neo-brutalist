import { Reveal } from "@/components/ui/Reveal";

const steps = [
  { n: "01", title: "Message us", body: "WhatsApp or Facebook with the wallet, quantity, and your city." },
  { n: "02", title: "We confirm", body: "We check stock, lock the price, and send delivery details." },
  { n: "03", title: "To your door", body: "Packed in Dhaka. Sent across Bangladesh. No mystery checkout." },
];

export function HowToOrder() {
  return (
    <section id="order" className="border-b-4 border-border bg-yellow py-16 text-black">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <Reveal>
          <h2 className="font-grotesk text-5xl font-black uppercase leading-none tracking-tighter md:text-7xl">
            How to order
          </h2>
          <p className="mt-4 max-w-2xl text-lg font-bold md:text-xl">
            No card machine. Bag it so we know the quantity — then you message us.
          </p>
        </Reveal>
        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {steps.map((s, i) => (
            <Reveal key={s.n} delay={i * 0.05} className="border-4 border-border bg-panel p-6 text-foreground shadow-brutal-md">
              <span className="hollow font-grotesk text-6xl font-black">{s.n}</span>
              <h3 className="mt-4 font-grotesk text-2xl font-black uppercase">{s.title}</h3>
              <p className="mt-2 font-bold">{s.body}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
