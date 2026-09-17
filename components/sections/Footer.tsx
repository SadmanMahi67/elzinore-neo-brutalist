import Link from "next/link";
import { Instagram, Facebook, MessageCircle } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t-4 border-black bg-black py-16 text-[var(--cream)] md:py-24">
      <div className="mx-auto grid max-w-6xl gap-12 px-4 md:grid-cols-4 md:px-6">
        <div>
          <p className="border-4 border-white bg-accent px-4 py-2 inline-block font-grotesk text-2xl font-black uppercase tracking-tighter text-black">
            Elzinore
          </p>
          <p className="mt-4 text-lg font-bold uppercase">Carry less. Carry louder.</p>
        </div>
        <div>
          <p className="font-black uppercase">Shop</p>
          <Link href="/shop" className="mt-2 block hover:underline">
            All products
          </Link>
          <Link href="/reviews" className="mt-2 block hover:underline">
            Reviews
          </Link>
        </div>
        <div>
          <p className="font-black uppercase">Company</p>
          <Link href="/about" className="mt-2 block hover:underline">
            About us
          </Link>
          <Link href="/faq" className="mt-2 block hover:underline">
            FAQ
          </Link>
        </div>
        <div>
          <p className="font-black uppercase">Contact</p>
          <Link href="/my-orders" className="mt-2 block hover:underline">
            My Orders
          </Link>
          <a href="mailto:elzinorelifestyle@gmail.com" className="mt-2 block hover:underline">
            elzinorelifestyle@gmail.com
          </a>
        </div>
      </div>

      <div className="mx-auto mt-14 flex max-w-6xl flex-col items-center justify-between gap-6 px-4 md:flex-row md:px-6">
        <p className="text-lg font-bold uppercase">Made with care in Bangladesh.</p>
        <div className="flex gap-4">
          <a
            href="https://www.instagram.com/elzinore.shop/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
            className="flex h-14 w-14 items-center justify-center border-4 border-white bg-violet text-black shadow-[4px_4px_0_0_#fff] transition-all duration-100 hover:-translate-y-0.5 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
          >
            <Instagram strokeWidth={3} />
          </a>
          <a
            href="https://www.facebook.com/profile.php?id=61593891004191"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Facebook"
            className="flex h-14 w-14 items-center justify-center border-4 border-white bg-yellow text-black shadow-[4px_4px_0_0_#fff] transition-all duration-100 hover:-translate-y-0.5 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
          >
            <Facebook strokeWidth={3} />
          </a>
          <a
            href="https://m.me/61593891004191"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Facebook Messenger"
            className="flex h-14 w-14 items-center justify-center border-4 border-white bg-accent text-black shadow-[4px_4px_0_0_#fff] transition-all duration-100 hover:-translate-y-0.5 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
          >
            <MessageCircle strokeWidth={3} />
          </a>
        </div>
      </div>
    </footer>
  );
}
