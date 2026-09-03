"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Minus, Plus, Trash2, X } from "lucide-react";
import Image from "next/image";
import { useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { useCart } from "@/components/providers/CartProvider";
import { ORDER_HREF } from "@/lib/constants";
import { formatTaka } from "@/lib/products";

export function CartDrawer() {
  const { drawerOpen, setDrawerOpen, items, subtotal, setQuantity, removeItem } =
    useCart();
  const reduce = useReducedMotion();

  useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setDrawerOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [drawerOpen, setDrawerOpen]);

  return (
    <AnimatePresence>
      {drawerOpen && (
        <motion.div
          className="fixed inset-0 z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduce ? 0 : 0.12 }}
        >
          <button
            type="button"
            className="absolute inset-0 bg-black"
            aria-label="Close cart"
            onClick={() => setDrawerOpen(false)}
          />
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-labelledby="cart-title"
            className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col border-l-8 border-border bg-panel p-6"
            initial={reduce ? { x: 0 } : { x: "100%" }}
            animate={{ x: 0 }}
            exit={reduce ? { opacity: 0 } : { x: "100%" }}
            transition={{ duration: reduce ? 0.05 : 0.18, ease: "easeOut" }}
          >
            <div className="mb-6 flex items-center justify-between">
              <h2 id="cart-title" className="font-grotesk text-3xl font-black uppercase">
                Your bag
              </h2>
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                aria-label="Close cart"
                className="flex h-12 w-12 items-center justify-center border-4 border-border bg-accent text-black shadow-brutal"
              >
                <X strokeWidth={3} />
              </button>
            </div>
            {items.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center text-center">
                <p className="hollow font-grotesk text-5xl font-black uppercase leading-none">
                  Cart&apos;s empty
                </p>
                <p className="mt-4 max-w-xs font-bold">
                  The carbon fiber wallet is waiting on the shop page.
                </p>
              </div>
            ) : (
              <>
                <ul className="flex-1 space-y-4 overflow-y-auto">
                  {items.map((line) => (
                    <li key={line.id} className="flex gap-3 border-4 border-border p-3">
                      <div className="relative h-16 w-16 shrink-0 overflow-hidden border-4 border-border">
                        {line.image ? (
                          <Image src={line.image} alt="" fill className="object-cover" />
                        ) : null}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-black uppercase leading-tight">{line.name}</p>
                        <p>{formatTaka(line.price)}</p>
                        <div className="mt-2 flex items-center gap-2">
                          <button
                            type="button"
                            className="h-10 w-10 border-4 border-border"
                            aria-label={`Decrease ${line.name}`}
                            onClick={() => setQuantity(line.id, line.quantity - 1)}
                          >
                            <Minus className="mx-auto" strokeWidth={3} size={16} />
                          </button>
                          <span className="font-black">{line.quantity}</span>
                          <button
                            type="button"
                            className="h-10 w-10 border-4 border-border"
                            aria-label={`Increase ${line.name}`}
                            onClick={() => setQuantity(line.id, line.quantity + 1)}
                          >
                            <Plus className="mx-auto" strokeWidth={3} size={16} />
                          </button>
                          <button
                            type="button"
                            className="ml-auto"
                            aria-label={`Remove ${line.name}`}
                            onClick={() => removeItem(line.id)}
                          >
                            <Trash2 strokeWidth={3} size={18} />
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
                <div className="mt-6 border-t-4 border-border pt-4">
                  <p className="flex justify-between font-grotesk text-2xl font-black uppercase">
                    <span>Subtotal</span>
                    <span>{formatTaka(subtotal)}</span>
                  </p>
                  <p className="mt-2 font-bold">No card checkout — we confirm over WhatsApp.</p>
                  <div className="mt-4">
                    <Button href={ORDER_HREF} variant="primary" size="lg" className="w-full">
                      Order via WhatsApp
                    </Button>
                  </div>
                </div>
              </>
            )}
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
