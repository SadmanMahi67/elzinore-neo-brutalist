export interface CatalogItem {
  id: string;
  name: string;
  price: number;
  purchasable: boolean;
  status: "live" | "upcoming";
}

/**
 * Authoritative Server-Side Catalog.
 * Single source of truth for products, pricing, and availability.
 * Any client-supplied name or price MUST be ignored in favor of these values.
 */
export const CATALOG: Record<string, CatalogItem> = {
  "carbon-fiber-wallet": {
    id: "carbon-fiber-wallet",
    name: "Carbon Fiber RFID Wallet",
    price: 1449,
    purchasable: true,
    status: "live",
  },
  "leather-belts": {
    id: "leather-belts",
    name: "Leather Belts",
    price: 0,
    purchasable: false,
    status: "upcoming",
  },
  "leather-imprinting": {
    id: "leather-imprinting",
    name: "Leather Imprinting Machine",
    price: 0,
    purchasable: false,
    status: "upcoming",
  },
  "next-product": {
    id: "next-product",
    name: "Next Product?",
    price: 0,
    purchasable: false,
    status: "upcoming",
  },
};

export function getCatalogItem(id: string): CatalogItem | undefined {
  if (!id || typeof id !== "string") return undefined;
  return CATALOG[id.trim().toLowerCase()];
}

export function isPurchasable(id: string): boolean {
  const item = getCatalogItem(id);
  return Boolean(item && item.purchasable);
}
