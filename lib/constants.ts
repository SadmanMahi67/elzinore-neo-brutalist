/**
 * Canonical site URL — single source of truth.
 * Used in robots.ts, sitemap.ts, and any metadata that needs an absolute URL.
 * Falls back to the env var so Vercel preview deploys get their own URL.
 */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://elzinore.com";

// Swap this for a real WhatsApp link later, e.g. https://wa.me/8801XXXXXXXXX
export const ORDER_HREF = "/#order";

export const THEME_STORAGE_KEY = "elzinore-neo-theme";
export const CART_STORAGE_KEY = "elzinore-neo-cart";
