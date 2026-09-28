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
  Trash2,
  X,
  AlertOctagon,
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

  // Selection & Deletion State
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{
    type: "single" | "bulk";
    orders: AdminOrder[];
  } | null>(null);
  const [deleteInputText, setDeleteInputText] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

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
      // Clear selection when order list refetches/changes
      setSelectedIds([]);
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

  // Selection handlers
  const handleToggleSelectAll = () => {
    if (selectedIds.length === orders.length && orders.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(orders.map((o) => o.id));
    }
  };

  const handleToggleSelectRow = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Open Delete Modal for Single Order
  const openSingleDelete = (order: AdminOrder) => {
    setDeleteTarget({ type: "single", orders: [order] });
    setDeleteInputText("");
    setModalError(null);
    setDeleteModalOpen(true);
  };

  // Open Delete Modal for Bulk Selection
  const openBulkDelete = () => {
    const selectedOrders = orders.filter((o) => selectedIds.includes(o.id));
    if (selectedOrders.length === 0) return;

    setDeleteTarget({ type: "bulk", orders: selectedOrders });
    setDeleteInputText("");
    setModalError(null);
    setDeleteModalOpen(true);
  };

  // Check if target contains any real sales orders (confirmed or delivered)
  const hasRealSales = deleteTarget?.orders.some(
    (o) => o.status === "confirmed" || o.status === "delivered"
  );

  // Execute Deletion
  const confirmDeletion = async () => {
    if (!deleteTarget) return;

    setDeleting(true);
    setModalError(null);

    try {
      if (deleteTarget.type === "single") {
        const orderId = deleteTarget.orders[0].id;
        const res = await fetch(`/api/admin/orders/${orderId}`, {
          method: "DELETE",
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || "Failed to delete order");
        }
        setSuccessMessage(`Order ${deleteTarget.orders[0].shortId} permanently deleted.`);
      } else {
        const ids = deleteTarget.orders.map((o) => o.id);
        const res = await fetch(`/api/admin/orders/bulk-delete`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ids }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || "Failed to delete orders");
        }
        const data = await res.json();
        const count = data.deletedIds?.length || ids.length;
        setSuccessMessage(`${count} order(s) permanently deleted.`);
      }

      setTimeout(() => setSuccessMessage(null), 4000);
      setDeleteModalOpen(false);
      setDeleteTarget(null);
      fetchOrders();
    } catch (err: any) {
      setModalError(err.message || "Deletion failed.");
    } finally {
      setDeleting(false);
    }
  };

  const totalRevenue = orders.reduce((sum, o) => sum + (o.status !== "cancelled" ? o.totalAmount : 0), 0);
  const isAllSelected = orders.length > 0 && selectedIds.length === orders.length;

  return (
    <div className="min-h-screen bg-background pb-28">
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
                      <th className="p-4 w-12 text-center">
                        <input
                          type="checkbox"
                          checked={isAllSelected}
                          onChange={handleToggleSelectAll}
                          className="h-4 w-4 cursor-pointer accent-black border-2 border-black"
                          title="Select all displayed orders"
                        />
                      </th>
                      <th className="p-4">Order ID & Date</th>
                      <th className="p-4">Customer Info</th>
                      <th className="p-4">Delivery Address</th>
                      <th className="p-4">Items</th>
                      <th className="p-4">Total</th>
                      <th className="p-4">Status & Control</th>
                      <th className="p-4 text-center">Delete</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y-4 divide-border font-bold">
                    {orders.map((order) => {
                      const statusKey = (order.status || "placed").toLowerCase();
                      const cfg = STATUS_CONFIG[statusKey] || STATUS_CONFIG.placed;
                      const isSelected = selectedIds.includes(order.id);

                      return (
                        <tr
                          key={order.id}
                          className={`transition-colors ${
                            isSelected ? "bg-yellow/20" : "hover:bg-foreground/5"
                          }`}
                        >
                          <td className="p-4 align-top text-center">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleToggleSelectRow(order.id)}
                              className="h-4 w-4 cursor-pointer accent-black border-2 border-black mt-1"
                            />
                          </td>
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
                                className={`${cfg.badgeColor} text-xs font-black`}
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
                          <td className="p-4 align-top text-center">
                            <button
                              type="button"
                              onClick={() => openSingleDelete(order)}
                              className="inline-flex items-center justify-center border-2 border-border bg-accent p-2 text-black shadow-brutal transition-all hover:bg-red-600 hover:text-white active:translate-x-[1px] active:translate-y-[1px] active:shadow-none"
                              title="Delete this order"
                            >
                              <Trash2 size={16} />
                            </button>
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
                  const statusKey = (order.status || "placed").toLowerCase();
                  const cfg = STATUS_CONFIG[statusKey] || STATUS_CONFIG.placed;
                  const isSelected = selectedIds.includes(order.id);

                  return (
                    <div
                      key={order.id}
                      className={`border-4 border-border bg-panel p-5 shadow-brutal-md transition-colors ${
                        isSelected ? "bg-yellow/10" : ""
                      }`}
                    >
                      <div className="flex flex-wrap items-start justify-between gap-2 border-b-2 border-border pb-3">
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleToggleSelectRow(order.id)}
                            className="h-5 w-5 cursor-pointer accent-black border-2 border-black"
                          />
                          <div>
                            <p className="font-grotesk text-xl font-black">{order.shortId}</p>
                            <p className="text-xs text-foreground/70">{order.date}</p>
                          </div>
                        </div>
                        <Badge rotate={0} className={`${cfg.badgeColor} font-black`}>
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

                      <div className="mt-4 flex items-center justify-between gap-3 border-t-4 border-border pt-4">
                        <div className="flex-1">
                          <label className="block text-[10px] font-black uppercase text-foreground/70 mb-1">
                            Update Order Status
                          </label>
                          <select
                            value={order.status}
                            disabled={updatingId === order.id}
                            onChange={(e) =>
                              handleStatusChange(order.id, e.target.value as AdminOrder["status"])
                            }
                            className="w-full border-2 border-border bg-panel p-2 font-grotesk text-xs font-black uppercase shadow-brutal focus:outline-none"
                          >
                            <option value="placed">Placed</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </div>
                        <button
                          type="button"
                          onClick={() => openSingleDelete(order)}
                          className="flex h-10 items-center justify-center gap-1.5 border-2 border-border bg-accent px-3 py-2 font-grotesk text-xs font-black uppercase text-black shadow-brutal hover:bg-red-600 hover:text-white"
                        >
                          <Trash2 size={14} />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </section>
      </main>

      {/* Sticky Bulk Action Bar */}
      {selectedIds.length > 0 && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 flex w-[92%] max-w-2xl items-center justify-between border-4 border-border bg-yellow px-5 py-3.5 font-grotesk text-black shadow-brutal-md">
          <div className="flex items-center gap-3">
            <span className="border-2 border-black bg-panel px-2.5 py-1 text-sm font-black">
              {selectedIds.length} SELECTED
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSelectedIds([])}
              className="border-2 border-black bg-panel px-3 py-1.5 text-xs font-black uppercase hover:bg-black hover:text-white"
            >
              Clear Selection
            </button>
            <button
              type="button"
              onClick={openBulkDelete}
              className="flex items-center gap-2 border-2 border-black bg-accent px-4 py-1.5 text-xs font-black uppercase text-black shadow-brutal hover:bg-red-600 hover:text-white"
            >
              <Trash2 size={14} />
              <span>Delete Selected</span>
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg border-4 border-border bg-panel p-6 shadow-brutal-md font-grotesk animate-in fade-in zoom-in-95">
            <div className="flex items-start justify-between border-b-4 border-border pb-4">
              <div className="flex items-center gap-3 text-accent">
                <AlertOctagon size={28} />
                <h2 className="text-2xl font-black uppercase tracking-tight text-foreground">
                  Confirm Permanent Delete
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setDeleteModalOpen(false)}
                disabled={deleting}
                className="border-2 border-border bg-panel p-1 text-foreground hover:bg-yellow hover:text-black"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-4 space-y-4">
              {modalError && (
                <div className="border-2 border-border bg-accent p-3 text-xs font-black text-black">
                  {modalError}
                </div>
              )}

              {/* Modal Target Preview */}
              {deleteTarget.type === "single" ? (
                <div className="border-2 border-border bg-foreground/5 p-3 text-sm">
                  <p className="font-black text-base">
                    Order {deleteTarget.orders[0].shortId}
                  </p>
                  <p className="mt-1 font-bold text-foreground/80">
                    Customer: <span className="font-black text-foreground">{deleteTarget.orders[0].customerName}</span> ({deleteTarget.orders[0].phone})
                  </p>
                  <p className="mt-1 font-bold text-foreground/80">
                    Status: <span className="font-black uppercase">{deleteTarget.orders[0].status}</span>
                  </p>
                </div>
              ) : (
                <div className="border-2 border-border bg-foreground/5 p-3 text-sm">
                  <p className="font-black text-base">
                    Deleting {deleteTarget.orders.length} Selected Orders
                  </p>
                  <p className="mt-1 font-bold text-xs text-foreground/80">
                    {deleteTarget.orders.slice(0, 3).map((o) => o.shortId).join(", ")}
                    {deleteTarget.orders.length > 3 && ` and ${deleteTarget.orders.length - 3} more`}
                  </p>
                </div>
              )}

              <p className="font-bold text-sm text-foreground/90">
                This permanently deletes the order and its items from the database. This action cannot be undone.
              </p>

              {/* Extra Friction Warning for Confirmed or Delivered Orders */}
              {hasRealSales && (
                <div className="border-4 border-border bg-accent p-4 text-black shadow-brutal space-y-2">
                  <p className="font-black text-sm uppercase flex items-center gap-2">
                    <AlertTriangle size={18} />
                    <span>Warning: Contains Real Sales Records</span>
                  </p>
                  <p className="text-xs font-bold">
                    One or more selected orders have status <span className="font-black uppercase">Confirmed</span> or <span className="font-black uppercase">Delivered</span>. Deleting real orders alters sales history.
                  </p>
                  <p className="text-xs font-black pt-1">
                    To confirm deletion, type <span className="underline font-mono bg-black text-white px-1">DELETE</span> below:
                  </p>
                  <input
                    type="text"
                    value={deleteInputText}
                    onChange={(e) => setDeleteInputText(e.target.value)}
                    placeholder="Type DELETE to enable button"
                    className="w-full border-2 border-black bg-panel p-2 text-xs font-mono font-bold uppercase text-foreground focus:outline-none"
                  />
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="mt-6 flex items-center justify-end gap-3 border-t-4 border-border pt-4">
              <button
                type="button"
                onClick={() => setDeleteModalOpen(false)}
                disabled={deleting}
                className="border-2 border-border bg-panel px-4 py-2 text-xs font-black uppercase text-foreground shadow-brutal hover:bg-yellow hover:text-black active:translate-x-[1px] active:translate-y-[1px] active:shadow-none disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeletion}
                disabled={deleting || (hasRealSales && deleteInputText.trim() !== "DELETE")}
                className="flex items-center gap-2 border-2 border-border bg-accent px-5 py-2 text-xs font-black uppercase text-black shadow-brutal hover:bg-red-600 hover:text-white active:translate-x-[1px] active:translate-y-[1px] active:shadow-none disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {deleting && <RefreshCw size={14} className="animate-spin" />}
                <span>{deleting ? "Deleting..." : "Permanently Delete"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
