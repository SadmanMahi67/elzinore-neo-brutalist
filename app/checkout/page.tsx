"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { CheckCircle2, AlertTriangle, Truck, Package, ArrowRight } from "lucide-react";
import { useCart, CartLine } from "@/components/providers/CartProvider";
import { formatTaka } from "@/lib/products";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { OrderDetail } from "@/components/shop/OrderDetail";
import { formatBangladeshDateTime } from "@/lib/date";

interface CompletedOrder {
  orderId: string;
  totalAmount: number;
  customerName: string;
  phone: string;
  address: string;
  date?: string;
  items: CartLine[];
}

export default function CheckoutPage() {
  const { items, subtotal, clearCart } = useCart();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [completedOrder, setCompletedOrder] = useState<CompletedOrder | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Client-side validation
    const trimmedName = name.trim();
    const trimmedPhone = phone.trim();
    const trimmedAddress = address.trim();

    if (!trimmedName) {
      setError("Please enter your full name.");
      return;
    }
    if (!trimmedPhone) {
      setError("Please enter your phone number.");
      return;
    }

    const digitsOnly = trimmedPhone.replace(/[\s\-\(\)\+]/g, "");
    if (digitsOnly.length < 10 || digitsOnly.length > 15 || !/^\d+$/.test(digitsOnly)) {
      setError("Please enter a valid phone number (e.g., 017XXXXXXXX).");
      return;
    }

    if (!trimmedAddress) {
      setError("Please enter your full delivery address.");
      return;
    }

    if (items.length === 0) {
      setError("Your cart is empty.");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: trimmedName,
          phone: trimmedPhone,
          email: email.trim(),
          address: trimmedAddress,
          items: items.map((l) => ({
            name: l.name,
            price: l.price,
            quantity: l.quantity,
          })),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to place your order. Please try again.");
      }

      // Order success snapshot
      setCompletedOrder({
        orderId: data.orderId,
        totalAmount: data.totalAmount,
        customerName: trimmedName,
        phone: trimmedPhone,
        address: trimmedAddress,
        date: formatBangladeshDateTime(new Date()),
        items: [...items],
      });

      clearCart();
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 1. Order Confirmation View
  if (completedOrder) {
    return (
      <main className="grid-paper mx-auto max-w-4xl px-4 py-12 md:px-6 md:py-20">
        <OrderDetail order={completedOrder} mode="placed" />
      </main>
    );
  }

  // 2. Empty Bag View
  if (items.length === 0) {
    return (
      <main className="grid-paper mx-auto max-w-4xl px-4 py-16 md:px-6 md:py-24">
        <div className="border-4 border-border bg-panel p-10 text-center shadow-brutal-xl">
          <h1 className="hollow font-grotesk text-5xl font-black uppercase leading-none md:text-7xl">
            Bag is empty
          </h1>
          <p className="mx-auto mt-6 max-w-md text-lg font-bold">
            You cannot check out without anything in your bag. The Carbon Fiber RFID Wallet is ready in the shop.
          </p>
          <div className="mt-8">
            <Button href="/shop" variant="primary" size="lg">
              Browse Shop
            </Button>
          </div>
        </div>
      </main>
    );
  }

  // 3. Checkout Form View
  return (
    <main className="grid-paper mx-auto max-w-6xl px-4 py-12 md:px-6 md:py-16">
      <div className="mb-10">
        <h1 className="font-grotesk text-5xl font-black uppercase leading-none tracking-tighter md:text-7xl">
          Checkout
        </h1>
        <p className="mt-3 max-w-xl text-lg font-bold text-muted-foreground">
          Enter your delivery details. Cash on Delivery nationwide across Bangladesh.
        </p>
      </div>

      <div className="grid gap-10 md:grid-cols-12">
        {/* Left Column: Form */}
        <div className="md:col-span-7">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Customer Details */}
            <div className="border-4 border-border bg-panel p-6 shadow-brutal-md md:p-8">
              <h2 className="font-grotesk text-2xl font-black uppercase tracking-tight">
                1. Delivery Information
              </h2>

              <div className="mt-6 space-y-5">
                <div>
                  <label htmlFor="name" className="block font-grotesk text-sm font-black uppercase tracking-wide">
                    Full Name <span className="text-accent">*</span>
                  </label>
                  <input
                    id="name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Sadman Sakib"
                    className="mt-2 w-full border-4 border-border bg-background px-4 py-3 font-bold text-foreground shadow-brutal placeholder:text-muted-foreground focus:outline-none focus:ring-4 focus:ring-accent"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block font-grotesk text-sm font-black uppercase tracking-wide">
                    Phone Number <span className="text-accent">*</span>
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. 01712345678"
                    className="mt-2 w-full border-4 border-border bg-background px-4 py-3 font-bold text-foreground shadow-brutal placeholder:text-muted-foreground focus:outline-none focus:ring-4 focus:ring-accent"
                  />
                  <p className="mt-1 text-xs font-bold text-muted-foreground">
                    Required for courier delivery confirmation.
                  </p>
                </div>

                <div>
                  <label htmlFor="email" className="block font-grotesk text-sm font-black uppercase tracking-wide">
                    Email Address <span className="text-xs text-muted-foreground">(Optional)</span>
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. sadman@example.com"
                    className="mt-2 w-full border-4 border-border bg-background px-4 py-3 font-bold text-foreground shadow-brutal placeholder:text-muted-foreground focus:outline-none focus:ring-4 focus:ring-accent"
                  />
                </div>

                <div>
                  <label htmlFor="address" className="block font-grotesk text-sm font-black uppercase tracking-wide">
                    Full Delivery Address <span className="text-accent">*</span>
                  </label>
                  <textarea
                    id="address"
                    rows={3}
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="House/Apartment, Road, Area, City..."
                    className="mt-2 w-full border-4 border-border bg-background px-4 py-3 font-bold text-foreground shadow-brutal placeholder:text-muted-foreground focus:outline-none focus:ring-4 focus:ring-accent"
                  />
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="border-4 border-border bg-panel p-6 shadow-brutal-md md:p-8">
              <h2 className="font-grotesk text-2xl font-black uppercase tracking-tight">
                2. Payment Method
              </h2>

              <div className="mt-6 border-4 border-border bg-yellow/30 p-5 shadow-brutal">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full border-4 border-border bg-foreground">
                      <div className="h-2 w-2 rounded-full bg-background" />
                    </div>
                    <span className="font-grotesk text-lg font-black uppercase">
                      Cash on Delivery (COD)
                    </span>
                  </div>
                  <Badge rotate={0} className="bg-accent text-black text-xs">
                    Standard
                  </Badge>
                </div>
                <p className="mt-3 text-sm font-bold">
                  Pay with cash directly to the courier delivery agent when your order arrives. No online payment required.
                </p>
              </div>
            </div>

            {/* Error Banner */}
            {error && (
              <div className="flex items-center gap-3 border-4 border-border bg-accent p-4 font-bold text-black shadow-brutal">
                <AlertTriangle className="h-6 w-6 shrink-0" strokeWidth={3} />
                <p>{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <div>
              <Button
                type="submit"
                variant="primary"
                size="lg"
                disabled={isSubmitting}
                className="w-full text-xl"
              >
                {isSubmitting ? (
                  "Placing order..."
                ) : (
                  <span className="flex items-center justify-center gap-3">
                    Place Order • {formatTaka(subtotal)}
                    <ArrowRight strokeWidth={3} className="h-6 w-6" />
                  </span>
                )}
              </Button>
              <p className="mt-3 text-center text-xs font-bold text-muted-foreground">
                By placing your order, you confirm that your contact and delivery info are accurate.
              </p>
            </div>
          </form>
        </div>

        {/* Right Column: Order Summary */}
        <div className="md:col-span-5">
          <div className="sticky top-24 border-4 border-border bg-panel p-6 shadow-brutal-md md:p-8">
            <h2 className="font-grotesk text-2xl font-black uppercase tracking-tight">
              Order Summary
            </h2>

            <div className="mt-6 divide-y-4 divide-border">
              {items.map((line) => (
                <div key={line.id} className="flex gap-4 py-4 first:pt-0">
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden border-4 border-border">
                    {line.image ? (
                      <Image src={line.image} alt={line.name} fill className="object-cover" />
                    ) : null}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-grotesk font-black uppercase leading-tight">{line.name}</p>
                    <p className="mt-1 text-sm font-bold text-muted-foreground">
                      Qty: {line.quantity} × {formatTaka(line.price)}
                    </p>
                  </div>
                  <p className="font-grotesk text-lg font-black">
                    {formatTaka(line.price * line.quantity)}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-6 border-t-4 border-border pt-4 space-y-3 font-bold">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatTaka(subtotal)}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="flex items-center gap-2">
                  <Truck className="h-4 w-4" /> Shipping
                </span>
                <span className="font-black uppercase">Standard (COD)</span>
              </div>
              <div className="border-t-4 border-border pt-3 flex justify-between font-grotesk text-2xl font-black uppercase">
                <span>Total</span>
                <span className="text-accent">{formatTaka(subtotal)}</span>
              </div>
            </div>

            <div className="mt-6 border-2 border-dashed border-border p-3 text-xs font-bold text-muted-foreground text-center">
              Small batch imports. Hand-checked before dispatch in Dhaka.
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
