"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";
import type { Product } from "@/lib/products";

type ModalContextValue = {
  product: Product | null;
  openProduct: (product: Product, trigger?: HTMLElement | null) => void;
  closeProduct: () => void;
  restoreFocus: () => void;
};

const ModalContext = createContext<ModalContextValue | null>(null);

export function ModalProvider({ children }: { children: React.ReactNode }) {
  const [product, setProduct] = useState<Product | null>(null);
  const triggerRef = useRef<HTMLElement | null>(null);

  const openProduct = useCallback(
    (next: Product, trigger?: HTMLElement | null) => {
      triggerRef.current = trigger ?? (document.activeElement as HTMLElement);
      setProduct(next);
    },
    [],
  );

  const restoreFocus = useCallback(() => {
    triggerRef.current?.focus();
  }, []);

  const closeProduct = useCallback(() => {
    setProduct(null);
  }, []);

  const value = useMemo(
    () => ({ product, openProduct, closeProduct, restoreFocus }),
    [product, openProduct, closeProduct, restoreFocus],
  );

  return (
    <ModalContext.Provider value={value}>{children}</ModalContext.Provider>
  );
}

export function useProductModal() {
  const ctx = useContext(ModalContext);
  if (!ctx) throw new Error("useProductModal must be used within ModalProvider");
  return ctx;
}
