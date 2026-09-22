"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { CheckCircle2, Clock, Sparkles, Truck, X } from "lucide-react";
import { useEffect, useRef } from "react";
import confetti from "canvas-confetti";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { formatTaka } from "@/lib/products";
import { modalSnap } from "@/lib/motion";

interface ThankYouModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  totalAmount?: number;
}

export function ThankYouModal({
  isOpen,
  onClose,
  orderId,
  totalAmount,
}: ThankYouModalProps) {
  const reduce = useReducedMotion();
  const dialogRef = useRef<HTMLDivElement>(null);

  // Trigger firecracker confetti burst on open, cleanup on close/unmount
  useEffect(() => {
    if (!isOpen) return;

    if (!reduce) {
      // Corner blast 1: Bottom-Left angled upward
      confetti({
        particleCount: 65,
        angle: 60,
        spread: 55,
        origin: { x: 0.12, y: 0.85 },
        colors: ["#ff6b6b", "#ffd93d", "#c4b5fd", "#22c55e", "#3b82f6"],
        zIndex: 9999,
      });

      // Corner blast 2: Bottom-Right angled upward
      confetti({
        particleCount: 65,
        angle: 120,
        spread: 55,
        origin: { x: 0.88, y: 0.85 },
        colors: ["#ff6b6b", "#ffd93d", "#c4b5fd", "#22c55e", "#3b82f6"],
        zIndex: 9999,
      });

      // Center finale starburst delayed slightly for firecracker realism
      const timer = setTimeout(() => {
        confetti({
          particleCount: 80,
          spread: 85,
          origin: { x: 0.5, y: 0.45 },
          colors: ["#ff6b6b", "#ffd93d", "#c4b5fd", "#22c55e", "#3b82f6"],
          zIndex: 9999,
        });
      }, 220);

      return () => {
        clearTimeout(timer);
        confetti.reset();
      };
    }

    return () => {
      confetti.reset();
    };
  }, [isOpen, reduce]);

  // Escape key & scroll lock
  useEffect(() => {
    if (!isOpen) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };

    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen, onClose]);

  // Ensure ELZ- format for display
  const displayId = orderId.startsWith("ELZ-")
    ? orderId
    : orderId.length >= 8
    ? `ELZ-${orderId.slice(0, 8).toUpperCase()}`
    : orderId || "N/A";

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduce ? 0 : 0.15 }}
        >
          {/* Backdrop */}
          <button
            type="button"
            aria-label="Close modal backdrop"
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal Container */}
          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="thank-you-title"
            className="relative z-10 max-h-[92vh] w-full max-w-xl overflow-y-auto border-8 border-border bg-panel p-6 shadow-brutal-xl md:p-10"
            initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.95 }}
            transition={modalSnap(reduce)}
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="absolute right-4 top-4 z-20 flex h-12 w-12 items-center justify-center border-4 border-border bg-accent text-black shadow-brutal transition-all duration-100 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
              aria-label="Close"
            >
              <X strokeWidth={3} className="h-6 w-6" />
            </button>

            {/* Icon & Celebratory Header */}
            <div className="flex flex-col items-center text-center">
              <div className="relative flex h-20 w-20 items-center justify-center border-4 border-border bg-yellow text-black shadow-brutal-md">
                <CheckCircle2 strokeWidth={3} className="h-10 w-10" />
                <Sparkles
                  strokeWidth={3}
                  className="absolute -right-3 -top-3 h-7 w-7 text-accent"
                />
              </div>

              <div className="mt-4">
                <Badge rotate={-2} className="bg-accent text-black text-xs font-black">
                  Order Successfully Placed!
                </Badge>
              </div>

              <h1
                id="thank-you-title"
                className="mt-4 font-grotesk text-3xl font-black uppercase leading-tight tracking-tight md:text-4xl"
              >
                Thank You for Your Order!
              </h1>

              <p className="mt-2 text-sm font-bold text-muted-foreground md:text-base">
                We received your order and are preparing it for dispatch.
              </p>
            </div>

            {/* Order Reference ID */}
            <div className="mt-6 border-4 border-border bg-background p-4 text-center shadow-brutal">
              <p className="font-grotesk text-xs font-black uppercase tracking-wider text-foreground/70">
                Order Reference ID
              </p>
              <p className="mt-1 font-mono text-xl font-black tracking-wider text-accent md:text-2xl">
                {displayId}
              </p>
              {totalAmount !== undefined && (
                <p className="mt-2 font-grotesk text-sm font-bold text-foreground/80">
                  Payable upon Delivery:{" "}
                  <span className="font-black text-foreground underline">
                    {formatTaka(totalAmount)}
                  </span>
                </p>
              )}
            </div>

            {/* Delivery Estimation Box */}
            <div className="mt-6 space-y-3 border-4 border-border bg-yellow/20 p-5 shadow-brutal">
              <div className="flex items-center gap-2 font-grotesk text-sm font-black uppercase">
                <Truck strokeWidth={3} className="h-5 w-5 text-accent" />
                <span>Estimated Delivery Time</span>
              </div>
              <div className="space-y-1.5 text-xs font-bold text-foreground/90 md:text-sm">
                <p className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-border" />
                  <span>
                    <strong>Inside Dhaka:</strong> 2–3 Business Days
                  </span>
                </p>
                <p className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-border" />
                  <span>
                    <strong>Outside Dhaka / Nationwide:</strong> 3–5 Business Days
                  </span>
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2 pt-2 border-t-2 border-border/20 text-xs font-black">
                <span className="border-2 border-border bg-accent px-2 py-0.5 text-black">
                  FREE DELIVERY
                </span>
                <span className="border-2 border-border bg-panel px-2 py-0.5 text-foreground">
                  Cash on Delivery (COD)
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button href="/my-orders" variant="primary" size="lg" className="flex-1 justify-center">
                View My Orders
              </Button>
              <Button
                href="/shop"
                variant="ghost"
                size="lg"
                onClick={onClose}
                className="flex-1 justify-center"
              >
                Continue Shopping
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
