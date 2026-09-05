import { Testimonials } from "@/components/sections/Testimonials";

export const metadata = {
  title: "Reviews",
  description:
    "Customer reviews and feedback on Elzinore's carbon fiber RFID wallet.",
};

export default function ReviewsPage() {
  return (
    <main>
      <Testimonials />
    </main>
  );
}
