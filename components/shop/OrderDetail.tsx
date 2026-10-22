"use client";

import Image from "next/image";
import { CheckCircle2, Package, Truck, X } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatTaka } from "@/lib/products";

export interface OrderDetailItem {
  id?: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

export interface OrderDetailData {
  id?: string;
  orderId?: string;
  shortId?: string;
  date?: string;
  createdAt?: string;
  customerName: string;
  phone: string;
  email?: string;
  address: string;
  paymentMethod?: string;
  bkashTrxId?: string;
  status?: string;
  totalAmount: number;
  items: OrderDetailItem[];
}

const statusColor: Record<string, string> = {
  placed: "bg-yellow text-black",
  confirmed: "bg-blue-500 text-white",
  delivered: "bg-emerald-500 text-white",
  cancelled: "bg-red-500 text-white",
};

interface OrderDetailProps {
  order: OrderDetailData;
  mode?: "placed" | "details";
  onClose?: () => void;
  onCancel?: () => void | Promise<void>;
  isCancelling?: boolean;
  className?: string;
}

export function OrderDetail({
  order,
  mode = "placed",
  onClose,
  onCancel,
  isCancelling = false,
  className = "",
}: OrderDetailProps) {
  const rawId = order.shortId || order.orderId || order.id || "";
  const displayId = rawId.startsWith("ELZ-")
    ? rawId
    : rawId.length >= 8
    ? `ELZ-${rawId.slice(0, 8).toUpperCase()}`
    : rawId || "N/A";
  const rawStatus = (order.status || "placed").toLowerCase();
  const badgeClass = statusColor[rawStatus] || "bg-yellow text-black";
  const displayStatus = rawStatus.charAt(0).toUpperCase() + rawStatus.slice(1);
  const isBkash = order.paymentMethod?.toLowerCase() === "bkash";

  return (
    <div className={`border-4 border-border bg-panel p-6 shadow-brutal-xl md:p-10 ${className}`}>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b-4 border-border pb-6">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center border-4 border-border bg-accent text-black shadow-brutal">
            {mode === "placed" ? (
              <CheckCircle2 strokeWidth={3} className="h-7 w-7" />
            ) : (
              <Package strokeWidth={3} className="h-7 w-7" />
            )}
          </div>
          <div>
            <h1 className="font-grotesk text-3xl font-black uppercase tracking-tight md:text-5xl">
              {mode === "placed" ? "Order Placed" : "Order Details"}
            </h1>
            <p className="text-sm font-bold">
              {mode === "placed"
                ? "We received your order and are packing it."
                : "Order summary and delivery details."}
            </p>
          </div>
        </div>
        <Badge rotate={0} className={`${badgeClass} text-sm font-black`}>
          Status: {displayStatus}
        </Badge>
      </div>

      {/* Payment Information */}
      <div className="mt-6 border-4 border-border bg-yellow/20 p-4 font-bold text-foreground">
        <p className="font-grotesk text-lg font-black uppercase">
          Payment Method: {isBkash ? "bKash Send Money" : "Cash on Delivery (COD)"}
        </p>
        <p className="mt-1 text-sm">
          {isBkash ? (
            <span>
              bKash Send Money payment submitted. {order.bkashTrxId ? `Transaction ID: ${order.bkashTrxId}.` : ""} Payment verification in progress.
            </span>
          ) : rawStatus === "delivered" ? (
            <span>Completed — Paid in full upon courier delivery.</span>
          ) : rawStatus === "cancelled" ? (
            <span>Order has been cancelled. No payment is required.</span>
          ) : (
            <span>
              Please have{" "}
              <span className="font-black underline">
                {formatTaka(order.totalAmount)}
              </span>{" "}
              ready in cash when the courier delivers to your door.
            </span>
          )}
        </p>
      </div>

      {/* Order Reference ID & Date */}
      <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-2">
          <p className="font-grotesk text-xs font-black uppercase tracking-wider text-foreground/70">
            Order Reference ID
          </p>
          <div className="inline-block border-4 border-border bg-background px-4 py-2 font-mono text-sm font-black shadow-brutal">
            {displayId}
          </div>
        </div>

        {order.date && (
          <div className="space-y-2 text-left sm:text-right">
            <p className="font-grotesk text-xs font-black uppercase tracking-wider text-foreground/70">
              Order Date (BD Time)
            </p>
            <div className="inline-block border-4 border-border bg-background px-4 py-2 font-grotesk text-sm font-bold shadow-brutal">
              {order.date}
            </div>
          </div>
        )}
      </div>

      {/* Purchased Items */}
      <div className="mt-8">
        <h2 className="font-grotesk text-xl font-black uppercase tracking-tight">
          Purchased Items
        </h2>
        <div className="mt-4 space-y-3">
          {order.items.map((line, idx) => {
            const itemImage =
              line.image && line.image.startsWith("/") && !line.image.includes("front-closed")
                ? line.image
                : line.name.toLowerCase().includes("wallet")
                ? "/images/wallet-hero.jpg"
                : "";

            return (
              <div
                key={line.id || `${line.name}-${idx}`}
                className="flex items-center justify-between border-4 border-border bg-background p-4 shadow-brutal"
              >
                <div className="flex items-center gap-4">
                  {itemImage ? (
                    <div className="relative h-14 w-14 shrink-0 overflow-hidden border-2 border-border bg-panel">
                      <Image
                        src={itemImage}
                        alt={line.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center border-2 border-border bg-panel">
                      <Package className="h-7 w-7 text-foreground/80" />
                    </div>
                  )}
                  <div>
                    <p className="font-grotesk text-base font-black uppercase">
                      {line.name}
                    </p>
                    <p className="text-sm font-bold text-foreground/70">
                      Quantity: {line.quantity} × {formatTaka(line.price)}
                    </p>
                  </div>
                </div>
                <p className="font-grotesk text-lg font-black">
                  {formatTaka(line.price * line.quantity)}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Delivery Address */}
      <div className="mt-8 border-t-4 border-border pt-6">
        <h2 className="font-grotesk text-xl font-black uppercase tracking-tight">
          Delivery Address
        </h2>
        <div className="mt-3 border-4 border-border bg-background p-4 shadow-brutal">
          <p className="font-black">{order.customerName}</p>
          <p className="font-bold">{order.phone}</p>
          {order.email && order.email !== "N/A" && (
            <p className="text-xs font-bold text-foreground/70">{order.email}</p>
          )}
          <p className="mt-1 font-bold whitespace-pre-line">{order.address}</p>
        </div>
      </div>

      {/* Total Amount */}
      <div className="mt-8 flex items-center justify-between border-t-4 border-border pt-6">
        <span className="font-grotesk text-2xl font-black uppercase">
          Total Payable
        </span>
        <span className="font-grotesk text-3xl font-black text-accent">
          {formatTaka(order.totalAmount)}
        </span>
      </div>

      {/* Next Actions */}
      <div className="mt-10 flex flex-wrap gap-4">
        {mode === "placed" ? (
          <>
            <Button href="/shop" variant="primary" size="lg">
              Return to Shop
            </Button>
            <Button href="/my-orders" variant="ghost" size="lg">
              View Order History
            </Button>
          </>
        ) : (
          <>
            {onCancel && rawStatus === "placed" && (
              <button
                type="button"
                disabled={isCancelling}
                onClick={onCancel}
                className="border-4 border-border bg-red-500 px-6 py-3 font-grotesk text-base font-black uppercase text-white shadow-brutal transition-all duration-100 ease-out hover:-translate-y-0.5 hover:shadow-brutal-md active:translate-x-[2px] active:translate-y-[2px] active:shadow-none disabled:opacity-50"
              >
                {isCancelling ? "Cancelling..." : "Cancel Order"}
              </button>
            )}
            {onClose && (
              <Button onClick={onClose} variant="primary" size="lg">
                Close Details
              </Button>
            )}
            <Button href="/shop" variant="ghost" size="lg" onClick={onClose}>
              Browse Shop
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
