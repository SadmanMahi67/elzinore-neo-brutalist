import Link from "next/link";
import { ArrowUpRight, MessageCircle } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t-4 border-black bg-black py-12 text-[var(--cream)]">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 md:grid-cols-4 md:px-6">
        <div>
          <p className="border-4 border-white bg-accent px-3 py-1 inline-block font-black uppercase tracking-tighter text-black">
            Elzinore
          </p>
          <p className="mt-4 font-bold uppercase">Carry less. Carry louder.</p>
        </div>
        <div>
          <p className="font-black uppercase">Shop</p>
          <Link href="/shop" className="mt-2 block hover:underline">
            All products
          </Link>
        </div>
        <div>
          <p className="font-black uppercase">Company</p>
          <Link href="/about" className="mt-2 block hover:underline">
            About us
          </Link>
          <Link href="/#faq" className="mt-2 block hover:underline">
            FAQ
          </Link>
        </div>
        <div>
          <p className="font-black uppercase">Contact</p>
          <Link href="/my-orders" className="mt-2 block hover:underline">
            My Orders
          </Link>
          <a href="mailto:hello@elzinore.shop" className="mt-2 block hover:underline">
            Email stub
          </a>
        </div>
      </div>
      <div className="mx-auto mt-10 flex max-w-6xl items-center justify-between px-4 md:px-6">
        <p className="font-bold uppercase">Made with care in Bangladesh.</p>
        <div className="flex gap-3">
          <a
            href="https://facebook.com"
            aria-label="Facebook (placeholder)"
            className="flex h-12 w-12 items-center justify-center border-4 border-white bg-yellow text-black shadow-[4px_4px_0_0_#fff]"
          >
            <MessageCircle strokeWidth={3} />
          </a>
          <a
            href="https://instagram.com"
            aria-label="Instagram (placeholder)"
            className="flex h-12 w-12 items-center justify-center border-4 border-white bg-violet text-black shadow-[4px_4px_0_0_#fff]"
          >
            <ArrowUpRight strokeWidth={3} />
          </a>
        </div>
      </div>
    </footer>
  );
}
