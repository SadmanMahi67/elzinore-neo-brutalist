"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { Minus, Plus, Trash2, Package } from "lucide-react";
import { SignInButton, useAuth } from "@clerk/nextjs";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useCart } from "@/components/providers/CartProvider";
import { formatTaka } from "@/lib/products";

interface OrderItem {
  name: string;
  qty: number;
  price: number;
}

interface OrderRecord {
  id: string;
  rawId: string;
  date: string;
  city: string;
  status: string;
  totalAmount: number;
  items: OrderItem[];
}

const statusColor: Record<string, string> = {
  Placed: "bg-yellow",
  Delivered: "bg-accent",
  Processing: "bg-violet",
  Shipped: "bg-violet",
};

export default function MyOrdersPage() {
  const { items, subtotal, setQuantity, removeItem } = useCart();
  const { isSignedIn, isLoaded } = useAuth();
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  useEffect(() => {
    if (!isLoaded || !isSignedIn) {
      setOrders([]);
      return;
    }

    let active = true;
    setLoadingOrders(true);

    fetch("/api/orders")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load orders");
        return res.json();
      })
      .then((data) => {
        if (active) {
          setOrders(data.orders || []);
          setLoadingOrders(false);
        }
      })
      .catch((err) => {
        console.error("Error fetching orders:", err);
        if (active) {
          setLoadingOrders(false);
        }
      });

    return () => {
      active = false;
    };
  }, [isLoaded, isSignedIn]);

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
            <p className="mx-auto mt-4 max-w-sm font-bold">
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

      {/* ── Past Orders ──────────────────────────────────── */}
      <section className="mt-16">
        <h2 className="font-grotesk text-3xl font-black uppercase tracking-tight md:text-5xl">
          Past Orders
        </h2>

        {!isLoaded ? (
          <div className="mt-6 border-4 border-border bg-panel p-10 text-center shadow-brutal-md">
            <p className="font-grotesk text-xl font-bold uppercase tracking-tight">
              Loading session...
            </p>
          </div>
        ) : !isSignedIn ? (
          <div className="mt-6 border-4 border-border bg-panel p-10 text-center shadow-brutal-md">
            <p className="hollow font-grotesk text-4xl font-black uppercase leading-none md:text-5xl">
              Sign In To View Orders
            </p>
            <p className="mx-auto mt-4 max-w-md font-bold">
              Sign in with your account to view your past purchases, track your order statuses, and access your order history.
            </p>
            <div className="mt-6">
              <SignInButton mode="modal">
                <Button variant="primary">Sign In</Button>
              </SignInButton>
            </div>
          </div>
        ) : loadingOrders ? (
          <div className="mt-6 border-4 border-border bg-panel p-10 text-center shadow-brutal-md animate-pulse">
            <p className="font-grotesk text-2xl font-black uppercase tracking-tight">
              Fetching your orders...
            </p>
          </div>
        ) : orders.length === 0 ? (
          <div className="mt-6 border-4 border-border bg-panel p-10 text-center shadow-brutal-md">
            <p className="hollow font-grotesk text-4xl font-black uppercase leading-none md:text-5xl">
              No orders yet
            </p>
            <p className="mx-auto mt-4 max-w-md font-bold">
              They&apos;ll show up here once you place one. Check out the Carbon Fiber RFID Wallet in our shop.
            </p>
            <div className="mt-6">
              <Button href="/shop" variant="primary">
                Browse Shop
              </Button>
            </div>
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            {orders.map((order) => (
              <div
                key={order.rawId}
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
                  {order.items.map((item, idx) => (
                    <div
                      key={`${item.name}-${idx}`}
                      className="flex items-center justify-between gap-4"
                    >
                      <p className="font-black uppercase">{item.name}</p>
                      <p className="shrink-0 font-bold">
                        ×{item.qty} — {formatTaka(item.price * item.qty)}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t-2 border-border/20 pt-3 text-sm font-bold">
                  <p>Delivery: {order.city}</p>
                  <p className="text-base font-black">
                    Total: {formatTaka(order.totalAmount)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
