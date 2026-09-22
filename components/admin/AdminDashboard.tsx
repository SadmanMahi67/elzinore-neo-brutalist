"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Search,
  RefreshCw,
  Package,
  Clock,
  Phone,
  Mail,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Truck,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { formatTaka } from "@/lib/products";

export interface AdminOrder {
  id: string;
  shortId: string;
  createdAt: string;
  date: string;
  customerName: string;
  phone: string;
  email: string;
  address: string;
  paymentMethod: string;
  status: "placed" | "confirmed" | "delivered" | "cancelled";
  totalAmount: number;
  itemSummary: string;
  items: { name: string; qty: number; price: number }[];
}

const STATUS_CONFIG: Record<
  string,
  { label: string; badgeColor: string; icon: any }
> = {
  placed: { label: "Placed", badgeColor: "bg-yellow text-black", icon: Clock },
  confirmed: { label: "Confirmed", badgeColor: "bg-blue-500 text-white", icon: Package },
  delivered: { label: "Delivered", badgeColor: "bg-emerald-500 text-white", icon: CheckCircle2 },
  cancelled: { label: "Cancelled", badgeColor: "bg-red-500 text-white", icon: XCircle },
};

const STATUS_TABS = [
  { id: "all", label: "All" },
  { id: "placed", label: "Placed" },
  { id: "confirmed", label: "Confirmed" },
  { id: "delivered", label: "Delivered" },
  { id: "cancelled", label: "Cancelled" },
];

export function AdminDashboard({ adminEmail }: { adminEmail?: string }) {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [searchInput, setSearchInput] = useState<string>("");
  const [debouncedQuery, setDebouncedQuery] = useState<string>("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Debounce search input by 350ms
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const handleSearchChange = (val: string) => {
    setSearchInput(val);
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    searchTimeoutRef.current = setTimeout(() => {
      setDebouncedQuery(val.trim());
    }, 350);
  };

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const params = new URLSearchParams();
      if (activeTab !== "all") params.set("status", activeTab);
      if (debouncedQuery) params.set("q", debouncedQuery);

      const res = await fetch(`/api/admin/orders?${params.toString()}`);
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to load orders");
      }
      const data = await res.json();
      setOrders(data.orders || []);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to fetch orders.");
    } finally {
      setLoading(false);
    }
  }, [activeTab, debouncedQuery]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Handle status update with optimistic UI & rollback on error
  const handleStatusChange = async (orderId: string, nextStatus: AdminOrder["status"]) => {
    const prevOrder = orders.find((o) => o.id === orderId);
    if (!prevOrder || prevOrder.status === nextStatus) return;

    const originalStatus = prevOrder.status;

    // Optimistically update
    setOrders((current) =>
      current.map((o) => (o.id === orderId ? { ...o, status: nextStatus } : o))
    );
    setUpdatingId(orderId);
    setErrorMessage(null);

    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Status update failed");
      }

      setSuccessMessage(`Order ${prevOrder.shortId} status changed to ${nextStatus.toUpperCase()}`);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      // Rollback
      setOrders((current) =>
        current.map((o) => (o.id === orderId ? { ...o, status: originalStatus } : o))
      );
      setErrorMessage(`Failed to update ${prevOrder.shortId}: ${err.message}`);
    } finally {
      setUpdatingId(null);
    }
  };

  const totalRevenue = orders.reduce((sum, o) => sum + (o.status !== "cancelled" ? o.totalAmount : 0), 0);

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Top Admin Header */}
      <header className="border-b-4 border-border bg-panel">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4 md:px-6">
          <div className="flex items-center gap-3">
            <span className="border-4 border-border bg-accent px-3 py-1 font-grotesk text-2xl font-black uppercase tracking-tighter text-black shadow-brutal">
              Elzinore Admin
            </span>
            <span className="hidden text-xs font-black uppercase text-foreground/70 md:inline">
              Control Portal
            </span>
          </div>

          <div className="flex items-center gap-3">
            {adminEmail && (
              <span className="border-2 border-border bg-yellow px-2 py-1 text-xs font-black uppercase text-black shadow-brutal">
                {adminEmail}
              </span>
            )}
            <button
              type="button"
              onClick={fetchOrders}
              className="flex h-10 items-center gap-2 border-2 border-border bg-panel px-3 text-xs font-black uppercase shadow-brutal transition-all hover:bg-yellow hover:text-black active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
              title="Refresh order list"
            >
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 pt-8 md:px-6">
        {/* Notification alerts */}
        {errorMessage && (
          <div className="mb-6 flex items-center justify-between border-4 border-border bg-accent p-4 font-grotesk text-sm font-black uppercase text-black shadow-brutal">
            <div className="flex items-center gap-2">
              <AlertTriangle size={18} />
              <span>{errorMessage}</span>
            </div>
            <button
              type="button"
              onClick={() => setErrorMessage(null)}
              className="border-2 border-black bg-panel px-2 py-0.5 text-xs uppercase text-black"
            >
              Dismiss
            </button>
          </div>
        )}

        {successMessage && (
          <div className="mb-6 flex items-center gap-2 border-4 border-border bg-yellow p-4 font-grotesk text-sm font-black uppercase text-black shadow-brutal">
            <CheckCircle2 size={18} />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Stats Row */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="border-4 border-border bg-panel p-4 shadow-brutal">
            <p className="text-xs font-black uppercase text-foreground/70">Total Orders Displayed</p>
            <p className="mt-1 font-grotesk text-3xl font-black">{orders.length}</p>
          </div>
          <div className="border-4 border-border bg-panel p-4 shadow-brutal">
            <p className="text-xs font-black uppercase text-foreground/70">Total Value (Excl. Cancelled)</p>
            <p className="mt-1 font-grotesk text-3xl font-black text-accent">{formatTaka(totalRevenue)}</p>
          </div>
          <div className="border-4 border-border bg-panel p-4 shadow-brutal">
            <p className="text-xs font-black uppercase text-foreground/70">Active Filter</p>
            <p className="mt-1 font-grotesk text-2xl font-black uppercase">{activeTab}</p>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
          {/* Status Tabs */}
          <div className="flex flex-wrap gap-2">
            {STATUS_TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`border-4 px-4 py-2 font-grotesk text-sm font-black uppercase tracking-tight transition-all duration-100 ${
                    isActive
                      ? "border-border bg-yellow text-black shadow-brutal"
                      : "border-border bg-panel text-foreground shadow-brutal hover:bg-violet hover:text-black"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Search Box */}
          <div className="relative min-w-[280px] flex-1 sm:max-w-md">
            <Search
              size={18}
              strokeWidth={3}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/60"
            />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search by customer name or phone..."
              className="w-full border-4 border-border bg-panel py-2.5 pl-10 pr-4 font-grotesk text-sm font-bold text-foreground shadow-brutal placeholder:text-foreground/40 focus:outline-none"
            />
          </div>
        </div>

        {/* Orders Table / List */}
        <section className="mt-8">
          {loading ? (
            <div className="border-4 border-border bg-panel p-12 text-center shadow-brutal-md animate-pulse">
              <p className="font-grotesk text-2xl font-black uppercase">Loading order records...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="border-4 border-border bg-panel p-12 text-center shadow-brutal-md">
              <p className="hollow font-grotesk text-4xl font-black uppercase md:text-5xl">
                No orders match
              </p>
              <p className="mx-auto mt-3 max-w-sm font-bold">
                Try clearing search terms or switching the status filter tab.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Desktop Table */}
              <div className="hidden overflow-x-auto border-4 border-border bg-panel shadow-brutal-md lg:block">
                <table className="w-full text-left text-sm">
                  <thead className="border-b-4 border-border bg-yellow font-grotesk font-black uppercase text-black">
                    <tr>
                      <th className="p-4">Order ID & Date</th>
                      <th className="p-4">Customer Info</th>
                      <th className="p-4">Delivery Address</th>
                      <th className="p-4">Items</th>
                      <th className="p-4">Total</th>
                      <th className="p-4">Status & Control</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y-4 divide-border font-bold">
                    {orders.map((order) => {
                      const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.placed;
                      return (
                        <tr key={order.id} className="hover:bg-foreground/5">
                          <td className="p-4 align-top">
                            <p className="font-grotesk text-base font-black tracking-tight">{order.shortId}</p>
                            <p className="mt-1 text-xs text-foreground/70">{order.date}</p>
                            <span className="mt-2 inline-block border-2 border-border bg-panel px-1.5 py-0.5 text-[10px] uppercase">
                              {order.paymentMethod.toUpperCase()}
                            </span>
                          </td>
                          <td className="p-4 align-top">
                            <p className="font-black">{order.customerName}</p>
                            <a
                              href={`tel:${order.phone}`}
                              className="mt-1 flex items-center gap-1.5 text-xs underline hover:text-accent"
                            >
                              <Phone size={12} />
                              <span>{order.phone}</span>
                            </a>
                            {order.email && order.email !== "N/A" && (
                              <p className="mt-1 flex items-center gap-1.5 text-xs text-foreground/70">
                                <Mail size={12} />
                                <span className="truncate max-w-[150px]">{order.email}</span>
                              </p>
                            )}
                          </td>
                          <td className="p-4 align-top">
                            <div className="flex items-start gap-1.5 text-xs">
                              <MapPin size={14} className="shrink-0 mt-0.5" />
                              <span className="max-w-xs">{order.address}</span>
                            </div>
                          </td>
                          <td className="p-4 align-top">
                            <p className="font-black text-xs uppercase">{order.itemSummary}</p>
                          </td>
                          <td className="p-4 align-top">
                            <p className="font-grotesk text-lg font-black text-accent">
                              {formatTaka(order.totalAmount)}
                            </p>
                          </td>
                          <td className="p-4 align-top">
                            <div className="space-y-2">
                              <Badge
                                rotate={0}
                                className={`${cfg.badgeColor} text-black text-xs font-black`}
                              >
                                {cfg.label}
                              </Badge>

                              <select
                                value={order.status}
                                disabled={updatingId === order.id}
                                onChange={(e) =>
                                  handleStatusChange(order.id, e.target.value as AdminOrder["status"])
                                }
                                className="w-full border-2 border-border bg-panel px-2 py-1 font-grotesk text-xs font-black uppercase shadow-brutal focus:outline-none disabled:opacity-50"
                              >
                                <option value="placed">Placed</option>
                                <option value="confirmed">Confirmed</option>
                                <option value="delivered">Delivered</option>
                                <option value="cancelled">Cancelled</option>
                              </select>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile / Tablet Cards */}
              <div className="space-y-4 lg:hidden">
                {orders.map((order) => {
                  const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.placed;
                  return (
                    <div
                      key={order.id}
                      className="border-4 border-border bg-panel p-5 shadow-brutal-md"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-2 border-b-2 border-border pb-3">
                        <div>
                          <p className="font-grotesk text-xl font-black">{order.shortId}</p>
                          <p className="text-xs text-foreground/70">{order.date}</p>
                        </div>
                        <Badge rotate={0} className={`${cfg.badgeColor} text-black font-black`}>
                          {cfg.label}
                        </Badge>
                      </div>

                      <div className="mt-3 space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="font-bold text-foreground/70">Customer:</span>
                          <span className="font-black">{order.customerName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-bold text-foreground/70">Phone:</span>
                          <a href={`tel:${order.phone}`} className="font-black underline hover:text-accent">
                            {order.phone}
                          </a>
                        </div>
                        <div>
                          <span className="font-bold text-foreground/70">Address: </span>
                          <span className="font-bold">{order.address}</span>
                        </div>
                        <div className="border-t-2 border-border/20 pt-2">
                          <span className="font-bold text-foreground/70">Items: </span>
                          <span className="font-black uppercase">{order.itemSummary}</span>
                        </div>
                        <div className="flex justify-between items-center border-t-2 border-border/20 pt-2">
                          <span className="font-bold text-foreground/70">Total:</span>
                          <span className="font-grotesk text-xl font-black text-accent">
                            {formatTaka(order.totalAmount)}
                          </span>
                        </div>
                      </div>

                      <div className="mt-4 border-t-4 border-border pt-4">
                        <label className="block text-xs font-black uppercase text-foreground/70 mb-1">
                          Update Order Status
                        </label>
                        <select
                          value={order.status}
                          disabled={updatingId === order.id}
                          onChange={(e) =>
                            handleStatusChange(order.id, e.target.value as AdminOrder["status"])
                          }
                          className="w-full border-4 border-border bg-panel p-2 font-grotesk text-sm font-black uppercase shadow-brutal focus:outline-none"
                        >
                          <option value="placed">Placed</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
