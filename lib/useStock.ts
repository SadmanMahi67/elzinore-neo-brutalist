"use client";

import { useEffect, useState } from "react";

export function useStock(fallbackStock: number = 25) {
  const [stock, setStock] = useState<number>(fallbackStock);
  const [initialStock, setInitialStock] = useState<number>(fallbackStock);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    fetch("/api/stock")
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled && typeof data.stock === "number") {
          setStock(data.stock);
          if (typeof data.initialStock === "number") {
            setInitialStock(data.initialStock);
          }
        }
      })
      .catch((err) => {
        console.error("Failed to fetch stock:", err);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return {
    stock,
    initialStock,
    inStock: stock > 0,
    lowStock: stock > 0 && stock <= 5,
    loading,
  };
}
