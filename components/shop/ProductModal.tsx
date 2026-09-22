"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { X } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { ImagePlaceholder } from "@/components/decor/ImagePlaceholder";
import { useCart } from "@/components/providers/CartProvider";
import { useProductModal } from "@/components/providers/ModalProvider";
import { Button } from "@/components/ui/Button";
import { modalSnap } from "@/lib/motion";

export function ProductModal() {
  const { product, closeProduct, restoreFocus } = useProductModal();
  const { addItem } = useCart();
  const reduce = useReducedMotion();
  const dialogRef = useRef<HTMLDivElement>(null);
  const [qty, setQty] = useState(1);
  const [active, setActive] = useState(0);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    setQty(1);
    setActive(0);
    setAdded(false);
  }, [product?.id]);

  useEffect(() => {
    if (!product) return;
    const node = dialogRef.current;
    const focusables = () =>
      Array.from(
        node?.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        ) ?? [],
      ).filter((el) => !el.hasAttribute("disabled"));

    requestAnimationFrame(() => focusables()[0]?.focus());

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        closeProduct();
      }
      if (e.key === "Tab" && node) {
        const list = focusables();
        if (list.length === 0) return;
        const first = list[0];
        const last = list[list.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [product, closeProduct]);

  const live = product?.status === "live";
  const images = product?.images ?? [];

  return (
    <AnimatePresence onExitComplete={restoreFocus}>
      {product && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduce ? 0 : 0.15 }}
        >
          <button
            type="button"
            aria-label="Close product details"
            className="absolute inset-0 bg-black"
            onClick={closeProduct}
          />
          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="product-modal-title"
            className="relative z-10 max-h-[92vh] w-full max-w-3xl overflow-y-auto border-8 border-border bg-panel p-5 shadow-brutal-xl md:p-8"
            initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.96 }}
            transition={modalSnap(reduce)}
          >
            <button
              type="button"
              onClick={closeProduct}
              className="absolute right-4 top-4 z-10 flex h-12 w-12 items-center justify-center border-4 border-border bg-accent text-black shadow-brutal transition-all duration-100 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
              aria-label="Close"
            >
              <X strokeWidth={3} />
            </button>
            <div className="grid gap-8 md:grid-cols-2">
              <div>
                <div className="relative aspect-square overflow-hidden border-4 border-border">
                  {live && images[active] ? (
                    <Image src={images[active]} alt={product.alt} fill className="object-cover" />
                  ) : (
                    <ImagePlaceholder label={product.name} />
                  )}
                </div>
                {images.length > 1 && (
                  <div className="mt-3 flex flex-wrap gap-3">
                    {images.map((src, i) => (
                      <button
                        key={src}
                        type="button"
                        onClick={() => setActive(i)}
                        className={`relative h-16 w-16 overflow-hidden border-4 border-border ${i === active ? "shadow-brutal" : ""}`}
                      >
                        <Image src={src} alt="" fill className="object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <h2
                  id="product-modal-title"
                  className="pr-14 font-grotesk text-3xl font-black uppercase leading-none tracking-tighter md:text-4xl"
                >
                  {product.name}
                </h2>
                <div className="mt-3">
                  <p className="text-3xl font-black">
                    {live ? product.priceLabel : "Coming soon"}
                  </p>
                  {live && product.originalPriceLabel && (
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <span className="text-lg font-bold text-muted-foreground line-through">
                        {product.originalPriceLabel}
                      </span>
                      <span className="border-2 border-border bg-accent px-2 py-0.5 text-xs font-black uppercase text-black">
                        Limited offer
                      </span>
                      <span className="border-2 border-border bg-panel px-2 py-0.5 text-xs font-black uppercase text-foreground">
                        Free Delivery
                      </span>
                    </div>
                  )}
                </div>
                <p className="mt-4 text-lg font-bold">{product.description}</p>
                <ul className="mt-4 space-y-1 text-sm font-black uppercase">
                  {product.specs.map((s) => (
                    <li key={s} className="border-l-4 border-border pl-3">
                      {s}
                    </li>
                  ))}
                </ul>
                {live ? (
                  <div className="mt-8 flex flex-wrap items-center gap-8">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        className="h-12 w-12 border-4 border-border font-black shadow-brutal active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
                        onClick={() => setQty((q) => Math.max(1, q - 1))}
                        aria-label="Decrease quantity"
                      >
                        −
                      </button>
                      <span className="min-w-8 text-center text-2xl font-black">{qty}</span>
                      <button
                        type="button"
                        className="h-12 w-12 border-4 border-border font-black shadow-brutal active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
                        onClick={() => setQty((q) => q + 1)}
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>
                    <Button
                      variant="primary"
                      onClick={() => {
                        addItem(product.id, qty);
                        setAdded(true);
                      }}
                    >
                      {added ? "Added" : "Add to Cart"}
                    </Button>
                  </div>
                ) : (
                  <div className="mt-8">
                    <Button disabled>Notify Me</Button>
                    <p className="mt-3 font-bold">
                      We will shout when this one is real. Until then, the wallet is the whole shop.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
