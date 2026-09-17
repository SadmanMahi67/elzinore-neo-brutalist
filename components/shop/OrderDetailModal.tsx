"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { X, AlertTriangle } from "lucide-react";
import { modalSnap } from "@/lib/motion";
import { OrderDetail, OrderDetailData } from "./OrderDetail";
import { Button } from "@/components/ui/Button";

interface OrderDetailModalProps {
  orderId: string | null;
  onClose: () => void;
}

export function OrderDetailModal({ orderId, onClose }: OrderDetailModalProps) {
  const reduce = useReducedMotion();
  const dialogRef = useRef<HTMLDivElement>(null);
  const [order, setOrder] = useState<OrderDetailData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId) {
      setOrder(null);
      setError(null);
      setLoading(false);
      return;
    }

    let active = true;
    setLoading(true);
    setError(null);

    fetch(`/api/orders/${orderId}`)
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || "Order not found or unavailable.");
        }
        return res.json();
      })
      .then((data) => {
        if (active) {
          setOrder(data.order || null);
          setLoading(false);
        }
      })
      .catch((err: any) => {
        if (active) {
          setError(err.message || "Failed to load order details.");
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [orderId]);

  // Escape key & body scroll lock
  useEffect(() => {
    if (!orderId) return;

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
  }, [orderId, onClose]);

  return (
    <AnimatePresence>
      {orderId && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-8"
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
            aria-labelledby="order-modal-title"
            className="relative z-10 max-h-[92vh] w-full max-w-3xl overflow-y-auto"
            initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.96 }}
            transition={modalSnap(reduce)}
          >
            {/* Floating Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="absolute right-4 top-4 z-20 flex h-12 w-12 items-center justify-center border-4 border-border bg-accent text-black shadow-brutal transition-all duration-100 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
              aria-label="Close modal"
            >
              <X strokeWidth={3} className="h-6 w-6" />
            </button>

            {loading ? (
              <div className="border-4 border-border bg-panel p-10 text-center shadow-brutal-xl animate-pulse">
                <p className="font-grotesk text-2xl font-black uppercase tracking-tight">
                  Fetching order details...
                </p>
                <div className="mt-6 space-y-3 max-w-md mx-auto">
                  <div className="h-10 border-2 border-border bg-foreground/10" />
                  <div className="h-20 border-2 border-border bg-foreground/10" />
                  <div className="h-12 border-2 border-border bg-foreground/10" />
                </div>
              </div>
            ) : error ? (
              <div className="border-4 border-border bg-panel p-10 text-center shadow-brutal-xl">
                <div className="mx-auto flex h-12 w-12 items-center justify-center border-4 border-border bg-accent text-black shadow-brutal">
                  <AlertTriangle strokeWidth={3} className="h-6 w-6" />
                </div>
                <h3 className="mt-4 font-grotesk text-2xl font-black uppercase">
                  Unable to Load Order
                </h3>
                <p className="mx-auto mt-2 max-w-sm text-sm font-bold text-foreground/80">
                  {error}
                </p>
                <div className="mt-6">
                  <Button onClick={onClose} variant="primary">
                    Close
                  </Button>
                </div>
              </div>
            ) : order ? (
              <OrderDetail order={order} mode="details" onClose={onClose} />
            ) : null}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
