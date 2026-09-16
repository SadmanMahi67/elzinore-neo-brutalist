"use client";

import Image from "next/image";
import { Minus, Plus, Trash2, Package } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useCart } from "@/components/providers/CartProvider";
import { formatTaka } from "@/lib/products";

/*
 * ──────────────────────────────────────────────────────────────
 * PLACEHOLDER DATA — replace with real order history from a
 * backend once auth and order tracking are implemented.
 * These mock orders exist solely so the layout can be
 * reviewed and approved before the backend is ready.
 *
 * NOTE (Clerk Auth Integration Hook):
 * In the next pass, connect real order queries filtered by
 * user ID:
 *   const { userId } = useAuth(); // or auth() in a server component
 *   const userOrders = await getOrdersByUserId(userId);
 * ──────────────────────────────────────────────────────────────
 */
const MOCK_PAST_ORDERS = [
  {
    id: "ELZ-0042",
    date: "2025-08-28",
    items: [{ name: "Carbon Fiber RFID Wallet", qty: 2, price: 1400 }],
    city: "Dhaka",
    status: "Delivered" as const,
  },
  {
    id: "ELZ-0039",
    date: "2025-08-15",
    items: [{ name: "Carbon Fiber RFID Wallet", qty: 1, price: 1400 }],
    city: "Chattogram",
    status: "Delivered" as const,
  },
  {
    id: "ELZ-0051",
    date: "2025-09-03",
    items: [{ name: "Carbon Fiber RFID Wallet", qty: 3, price: 1400 }],
    city: "Sylhet",
    status: "Placed" as const,
  },
];

const statusColor: Record<string, string> = {
  Placed: "bg-yellow",
  Delivered: "bg-accent",
};

export default function MyOrdersPage() {
  const { items, subtotal, setQuantity, removeItem } = useCart();

  return (
    <main className="grid-paper mx-auto max-w-6xl px-4 py-12 md:px-6 md:py-16">
      <h1 className="font-grotesk text-6xl font-black uppercase leading-none tracking-tighter md:text-8xl">
        My Orders
      </h1>

      {/* ── Current Cart ─────────────────────────────────── */}
      <section className="mt-12">
        <h2 className="font-grotesk text-3xl font-black uppercase tracking-tight md:text-5xl">
          Current Cart
        </h2>

        {items.length === 0 ? (
          <div className="mt-6 border-4 border-border bg-panel p-10 text-center shadow-brutal-md">
            <p className="hollow font-grotesk text-5xl font-black uppercase leading-none">
              Cart&apos;s empty
            </p>
            <p className="mt-4 max-w-sm mx-auto font-bold">
              The carbon fiber wallet is waiting on the shop page.
            </p>
            <div className="mt-6">
              <Button href="/shop" variant="primary">
                Browse Shop
              </Button>
            </div>
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            {items.map((line) => (
              <div
                key={line.id}
                className="flex gap-4 border-4 border-border bg-panel p-4 shadow-brutal-md"
              >
                <div className="relative h-20 w-20 shrink-0 overflow-hidden border-4 border-border">
                  {line.image ? (
                    <Image
                      src={line.image}
                      alt=""
                      fill
                      className="object-cover"
                    />
                  ) : null}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-black uppercase leading-tight">
                    {line.name}
                  </p>
                  <p className="mt-1 font-bold">{formatTaka(line.price)}</p>
                  <div className="mt-3 flex items-center gap-2">
                    <button
                      type="button"
                      className="h-10 w-10 border-4 border-border shadow-brutal active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
                      aria-label={`Decrease ${line.name}`}
                      onClick={() => setQuantity(line.id, line.quantity - 1)}
                    >
                      <Minus className="mx-auto" strokeWidth={3} size={16} />
                    </button>
                    <span className="min-w-8 text-center font-black">
                      {line.quantity}
                    </span>
                    <button
                      type="button"
                      className="h-10 w-10 border-4 border-border shadow-brutal active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
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
                <p className="shrink-0 self-start text-xl font-black">
                  {formatTaka(line.price * line.quantity)}
                </p>
              </div>
            ))}

            <div className="border-t-4 border-border pt-4">
              <p className="flex justify-between font-grotesk text-2xl font-black uppercase">
                <span>Subtotal</span>
                <span>{formatTaka(subtotal)}</span>
              </p>
            </div>
          </div>
        )}
      </section>

      {/* ── Past Orders (placeholder) ────────────────────── */}
      <section className="mt-16">
        <h2 className="font-grotesk text-3xl font-black uppercase tracking-tight md:text-5xl">
          Past Orders
        </h2>
        <p className="mt-2 font-bold">
          Placeholder data — real order history will appear here once the
          backend is live.
        </p>

        <div className="mt-6 space-y-4">
          {MOCK_PAST_ORDERS.map((order) => (
            <div
              key={order.id}
              className="border-4 border-border bg-panel p-5 shadow-brutal-md"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Package strokeWidth={3} className="h-6 w-6 shrink-0" />
                  <div>
                    <p className="font-grotesk text-xl font-black uppercase tracking-tight">
                      {order.id}
                    </p>
                    <p className="text-sm font-bold">{order.date}</p>
                  </div>
                </div>
                <Badge
                  rotate={0}
                  className={`${statusColor[order.status] ?? "bg-violet"} text-black`}
                >
                  {order.status}
                </Badge>
              </div>

              <div className="mt-4 border-t-4 border-border pt-4">
                {order.items.map((item) => (
                  <div
                    key={item.name}
                    className="flex items-center justify-between gap-4"
                  >
                    <p className="font-black uppercase">{item.name}</p>
                    <p className="shrink-0 font-bold">
                      ×{item.qty} — {formatTaka(item.price * item.qty)}
                    </p>
                  </div>
                ))}
              </div>

              <p className="mt-3 text-sm font-bold">
                Delivery: {order.city}
              </p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
