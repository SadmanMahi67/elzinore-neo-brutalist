"use client";

import { Menu, ShoppingBag, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useCart } from "@/components/providers/CartProvider";
import { ThemeToggle } from "@/components/shop/ThemeToggle";
import { Button } from "@/components/ui/Button";

const links = [
  { href: "/shop", label: "Shop" },
  { href: "/about", label: "About Us" },
  { href: "/my-orders", label: "My Orders" },
  { href: "/#faq", label: "FAQ" },
];

function NavLink({
  href,
  label,
  onClick,
}: {
  href: string;
  label: string;
  onClick?: () => void;
}) {
  const pathname = usePathname();
  const active =
    (href === "/shop" && pathname === "/shop") ||
    (href === "/about" && pathname === "/about") ||
    (href === "/my-orders" && pathname === "/my-orders");

  return (
    <Link
      href={href}
      onClick={onClick}
      className={`border-4 px-3 py-2 font-grotesk text-sm font-black uppercase tracking-tight transition-all duration-100 md:text-base ${
        active
          ? "border-border bg-yellow text-black shadow-brutal"
          : "border-transparent hover:border-border hover:bg-violet hover:text-black hover:shadow-brutal"
      }`}
    >
      {label}
    </Link>
  );
}

export function Nav() {
  const [open, setOpen] = useState(false);
  const { itemCount, setDrawerOpen, justAdded } = useCart();
  const reduce = useReducedMotion();

  return (
    <header className="sticky top-0 z-40 border-b-4 border-border bg-background">
      <nav className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 md:px-6">
        <Link
          href="/"
          className="border-4 border-border bg-accent px-3 py-1 font-grotesk text-2xl font-black uppercase tracking-tighter text-black shadow-brutal"
        >
          Elzinore
        </Link>
        <div className="hidden items-center gap-2 md:flex">
          {links.map((l) => (
            <NavLink key={l.href} {...l} />
          ))}
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <button
            type="button"
            className="relative flex h-12 w-12 items-center justify-center border-4 border-border bg-panel shadow-brutal transition-all duration-100 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
            aria-label="Open cart"
            onClick={() => setDrawerOpen(true)}
          >
            <ShoppingBag strokeWidth={3} className="h-5 w-5" />
            {itemCount > 0 && (
              <motion.span
                className="absolute -right-2 -top-2 flex h-6 min-w-6 items-center justify-center rounded-full border-4 border-border bg-accent px-1 text-xs font-black text-black"
                animate={justAdded && !reduce ? { scale: [1, 1.2, 1] } : { scale: 1 }}
                transition={{ duration: 0.2 }}
              >
                {itemCount}
              </motion.span>
            )}
          </button>
          <span className="hidden md:inline">
            <Button href="/shop" size="sm">
              Order Now
            </Button>
          </span>
          <button
            type="button"
            className="flex h-12 w-12 items-center justify-center border-4 border-border bg-yellow text-black shadow-brutal md:hidden"
            aria-label="Open menu"
            onClick={() => setOpen(true)}
          >
            <Menu strokeWidth={3} />
          </button>
        </div>
      </nav>
      {open && (
        <div className="fixed inset-0 z-50 flex flex-col gap-4 bg-background p-6 md:hidden">
          <div className="mb-6 flex items-center justify-between">
            <span className="border-4 border-border bg-accent px-3 py-1 font-black uppercase text-black">
              Elzinore
            </span>
            <button
              type="button"
              aria-label="Close menu"
              className="flex h-12 w-12 items-center justify-center border-4 border-border bg-panel shadow-brutal"
              onClick={() => setOpen(false)}
            >
              <X strokeWidth={3} />
            </button>
          </div>
          {links.map((l) => (
            <NavLink key={l.href} {...l} onClick={() => setOpen(false)} />
          ))}
          <div className="mt-8 flex items-center gap-8">
            <ThemeToggle />
            <Button href="/shop" onClick={() => setOpen(false)}>
              Order Now
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
