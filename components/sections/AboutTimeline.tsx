import { Reveal } from "@/components/ui/Reveal";

const milestones = [
  { n: "01", title: "Pooled the funds", body: "Five of us put savings on the table and agreed this was not a side hustle we would abandon in a month." },
  { n: "02", title: "Sourced the wallet", body: "We compared shells, RFID liners, and clasps until one sample survived a week in real pockets." },
  { n: "03", title: "Launched Elzinore", body: "One live SKU, a WhatsApp thread, and a site that does not pretend we are a department store." },
  { n: "04", title: "What’s next", body: "Leather belts and a small imprinting setup — after the wallet has a life of its own." },
];

export function AboutTimeline() {
  return (
    <div className="mt-12 grid gap-6 md:grid-cols-4">
      {milestones.map((m, i) => (
        <Reveal key={m.n} delay={i * 0.05}>
          <div className="border-4 border-border bg-yellow p-5 text-black shadow-brutal-md">
            <p className="hollow font-grotesk text-5xl font-black">{m.n}</p>
            <h3 className="mt-3 font-grotesk text-xl font-black uppercase">{m.title}</h3>
            <p className="mt-2 font-bold">{m.body}</p>
          </div>
        </Reveal>
      ))}
    </div>
  );
}
