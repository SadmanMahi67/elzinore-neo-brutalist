"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useAuth } from "@clerk/nextjs";
import { CART_STORAGE_KEY } from "@/lib/constants";
import { getProduct } from "@/lib/products";

export type CartLine = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
};

type CartContextValue = {
  items: CartLine[];
  itemCount: number;
  subtotal: number;
  drawerOpen: boolean;
  justAdded: boolean;
  cartLoading: boolean;
  setDrawerOpen: (open: boolean) => void;
  addItem: (productId: string, quantity?: number) => void;
  setQuantity: (id: string, quantity: number) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
};

function mergeCarts(guestCart: CartLine[], serverCart: CartLine[]): CartLine[] {
  const map = new Map<string, CartLine>();
  for (const item of serverCart) {
    map.set(item.id, { ...item });
  }
  for (const item of guestCart) {
    if (map.has(item.id)) {
      const existing = map.get(item.id)!;
      map.set(item.id, {
        ...existing,
        quantity: existing.quantity + item.quantity,
      });
    } else {
      map.set(item.id, { ...item });
    }
  }
  return Array.from(map.values());
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { isSignedIn, isLoaded } = useAuth();
  const [items, setItems] = useState<CartLine[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [syncLoading, setSyncLoading] = useState(false);

  // Keep a ref of latest items to avoid stale closures in listeners
  const itemsRef = useRef<CartLine[]>(items);
  itemsRef.current = items;

  // Track auth transition state
  const prevSignedInRef = useRef<boolean | null>(null);
  const hadGuestItemsRef = useRef<boolean>(false);
  const pendingSyncRef = useRef<CartLine[] | null>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 1. Initial LocalStorage hydration (instant client boot)
  useEffect(() => {
    try {
      const raw = localStorage.getItem(CART_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as CartLine[];
        setItems(parsed);
        if (parsed.length > 0) {
          hadGuestItemsRef.current = true;
        }
      }
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  // Flush pending server sync immediately (keepalive for unload/nav)
  const flushPendingSync = useCallback(() => {
    if (!pendingSyncRef.current || !isSignedIn) return;
    const toSync = pendingSyncRef.current;
    pendingSyncRef.current = null;
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
    fetch("/api/cart", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: toSync }),
      keepalive: true,
    }).catch((err) => {
      console.error("Cart sync flush error:", err);
    });
  }, [isSignedIn]);

  // Flush on tab hide / unload / unmount
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        flushPendingSync();
      }
    };
    const handleBeforeUnload = () => {
      flushPendingSync();
    };

    window.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      flushPendingSync();
      window.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [flushPendingSync]);

  // 2. Auth state handling: transition merge vs. direct server cart fetch
  useEffect(() => {
    if (!hydrated || !isLoaded) return;

    // First auth resolution on mount
    if (prevSignedInRef.current === null) {
      prevSignedInRef.current = Boolean(isSignedIn);

      if (isSignedIn) {
        // User opened page already signed in:
        // Use server cart as source of truth (overwrite local, do NOT merge to prevent doubling)
        setSyncLoading(true);
        fetch("/api/cart")
          .then((res) => (res.ok ? res.json() : null))
          .then((data) => {
            if (data && Array.isArray(data.items)) {
              setItems(data.items);
              try {
                localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(data.items));
              } catch {}
            }
          })
          .catch((err) => console.error("Initial cart fetch error:", err))
          .finally(() => setSyncLoading(false));
      } else {
        // User is currently guest
        hadGuestItemsRef.current = itemsRef.current.length > 0;
      }
      return;
    }

    // Subsequent auth change: Signed-Out -> Signed-In transition
    if (!prevSignedInRef.current && isSignedIn) {
      prevSignedInRef.current = true;
      setSyncLoading(true);
      const guestItems = itemsRef.current;

      fetch("/api/cart")
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          const serverItems: CartLine[] = Array.isArray(data?.items) ? data.items : [];
          if (guestItems.length > 0) {
            // Merge guest cart into server cart once
            const merged = mergeCarts(guestItems, serverItems);
            setItems(merged);
            try {
              localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(merged));
            } catch {}
            // Sync merged state immediately to server
            fetch("/api/cart", {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ items: merged }),
              keepalive: true,
            }).catch((err) => console.error("Merged cart sync error:", err));
          } else {
            // Guest had nothing, adopt server cart
            setItems(serverItems);
            try {
              localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(serverItems));
            } catch {}
          }
        })
        .catch((err) => console.error("Cart transition fetch error:", err))
        .finally(() => {
          setSyncLoading(false);
          hadGuestItemsRef.current = false;
        });
      return;
    }

    // Subsequent auth change: Signed-In -> Signed-Out transition
    if (prevSignedInRef.current && !isSignedIn) {
      prevSignedInRef.current = false;
      hadGuestItemsRef.current = itemsRef.current.length > 0;
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }
      pendingSyncRef.current = null;
      // Revert to local-only behavior; leave whatever is currently in localStorage
    }
  }, [hydrated, isLoaded, isSignedIn]);

  // 3. Persist to localStorage and debounce server sync on cart changes
  useEffect(() => {
    if (!hydrated) return;

    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch {
      /* ignore */
    }

    // While signed in and not performing initial load/merge, debounce push to server
    if (isLoaded && isSignedIn && !syncLoading) {
      pendingSyncRef.current = items;
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      debounceTimerRef.current = setTimeout(() => {
        flushPendingSync();
      }, 1000);
    }
  }, [items, hydrated, isLoaded, isSignedIn, syncLoading, flushPendingSync]);

  const addItem = useCallback((productId: string, quantity = 1) => {
    const product = getProduct(productId);
    if (!product || product.status !== "live") return;
    setItems((prev) => {
      const existing = prev.find((l) => l.id === productId);
      if (existing) {
        return prev.map((l) =>
          l.id === productId ? { ...l, quantity: l.quantity + quantity } : l,
        );
      }
      return [
        ...prev,
        {
          id: product.id,
          name: product.name,
          price: product.price,
          quantity,
          image: product.images[0] ?? "",
        },
      ];
    });
    setJustAdded(true);
    window.setTimeout(() => setJustAdded(false), 500);
  }, []);

  const setQuantity = useCallback((id: string, quantity: number) => {
    setItems((prev) =>
      quantity < 1
        ? prev.filter((l) => l.id !== id)
        : prev.map((l) => (l.id === id ? { ...l, quantity } : l)),
    );
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((l) => l.id !== id));
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const itemCount = items.reduce((n, l) => n + l.quantity, 0);
  const subtotal = items.reduce((n, l) => n + l.price * l.quantity, 0);

  const value = useMemo(
    () => ({
      items,
      itemCount,
      subtotal,
      drawerOpen,
      justAdded,
      cartLoading: syncLoading,
      setDrawerOpen,
      addItem,
      setQuantity,
      removeItem,
      clearCart,
    }),
    [
      items,
      itemCount,
      subtotal,
      drawerOpen,
      justAdded,
      syncLoading,
      setDrawerOpen,
      addItem,
      setQuantity,
      removeItem,
      clearCart,
    ],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
