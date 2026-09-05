import { Faq } from "@/components/sections/Faq";

export const metadata = {
  title: "FAQ",
  description:
    "Frequently asked questions about Elzinore's carbon fiber RFID wallet — shipping, payments, returns, and warranty.",
};

export default function FaqPage() {
  return (
    <main>
      <Faq />
    </main>
  );
}
