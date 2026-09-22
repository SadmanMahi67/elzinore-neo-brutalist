"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Bell, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { modalSnap } from "@/lib/motion";

interface NotificationItem {
  orderId: string;
  shortId: string;
  status: string;
  message: string;
  updatedAt: string;
  isUnread: boolean;
}

const statusColor: Record<string, string> = {
  confirmed: "bg-violet text-black",
  delivered: "bg-accent text-black",
  cancelled: "bg-panel text-foreground",
};

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);

  // Check for unread on mount and every 60s
  const checkUnread = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const data = await res.json();
        setHasUnread(data.hasUnread);
      }
    } catch {
      // silently fail
    }
  }, []);

  useEffect(() => {
    checkUnread();
    const interval = setInterval(checkUnread, 60000);
    return () => clearInterval(interval);
  }, [checkUnread]);

  const openModal = async () => {
    setOpen(true);
    setLoading(true);
    setHasUnread(false); // optimistic clear

    try {
      const [notifRes] = await Promise.all([
        fetch("/api/notifications"),
        fetch("/api/notifications/seen", { method: "POST" }),
      ]);
      if (notifRes.ok) {
        const data = await notifRes.json();
        setItems(data.items || []);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  };

  // Escape key and scroll lock
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        setOpen(false);
      }
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        className="relative flex h-12 w-12 items-center justify-center border-4 border-border bg-panel shadow-brutal transition-all duration-100 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
        aria-label="Notifications"
        onClick={openModal}
      >
        <Bell strokeWidth={3} className="h-5 w-5" />
        {hasUnread && (
          <motion.span
            className="absolute -right-1 -top-1 flex h-3 w-3 items-center justify-center rounded-full border-2 border-border bg-accent"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 500, damping: 15 }}
          />
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-50 flex items-start justify-center p-3 pt-20 md:p-8 md:pt-24"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <button
              type="button"
              aria-label="Close notifications"
              className="absolute inset-0 bg-black/60"
              onClick={() => setOpen(false)}
            />
            <motion.div
              ref={dialogRef}
              role="dialog"
              aria-modal="true"
              aria-label="Notifications"
              className="relative z-10 max-h-[70vh] w-full max-w-md overflow-y-auto border-8 border-border bg-panel p-5 shadow-brutal-xl md:p-6"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={modalSnap(false)}
            >
              <div className="flex items-center justify-between border-b-4 border-border pb-4">
                <h2 className="font-grotesk text-xl font-black uppercase tracking-tight">
                  Notifications
                </h2>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="flex h-10 w-10 items-center justify-center border-4 border-border bg-accent text-black shadow-brutal transition-all duration-100 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
                  aria-label="Close"
                >
                  <X strokeWidth={3} className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-4 space-y-3">
                {loading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="h-20 animate-pulse border-4 border-border bg-background"
                      />
                    ))}
                  </div>
                ) : items.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="flex h-16 w-16 items-center justify-center border-4 border-border bg-background shadow-brutal">
                      <Bell strokeWidth={2} className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <p className="mt-4 font-grotesk text-lg font-black uppercase text-muted-foreground">
                      No notifications yet
                    </p>
                    <p className="mt-1 text-sm font-bold text-muted-foreground">
                      We&apos;ll notify you when your order status changes.
                    </p>
                  </div>
                ) : (
                  items.map((item) => (
                    <div
                      key={item.orderId}
                      className={`border-4 border-border bg-background p-4 shadow-brutal ${
                        item.isUnread ? "border-l-8 border-l-accent" : ""
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-mono text-xs font-black">
                              {item.shortId}
                            </span>
                            <span
                              className={`border-2 border-border px-2 py-0.5 text-xs font-black uppercase ${
                                statusColor[item.status] || "bg-yellow text-black"
                              }`}
                            >
                              {item.status}
                            </span>
                          </div>
                          <p className="mt-1 text-sm font-bold">{item.message}</p>
                          <p className="mt-1 text-xs font-bold text-muted-foreground">
                            {item.updatedAt}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
