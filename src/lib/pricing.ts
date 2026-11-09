/**
 * Display prices. Safe to import from client and server code.
 * The amount actually charged is set on each product in the payment
 * provider's dashboard; keep these in sync with it.
 */
export const PRICES = {
  /** Pro, yearly subscription. Unlocks everything. */
  pro: 49.99,
  /** All-Access, one-time lifetime payment. Unlocks the same everything, forever. */
  allAccess: 79.99,
} as const;

/** India prices in INR, charged through the separate *_IN Dodo products. */
export const INDIA_PRICES = {
  pro: 1999,
  allAccess: 3499,
} as const;

/**
 * Discount shown on the India badge, against the USD price. Rounded down to
 * the nearest 5 so the claim holds as the rate moves: at ₹95 to the dollar the
 * real discounts are 57.9% and 54%, and these stay true down to about ₹89.
 */
const INDIA_DISCOUNT = {
  pro: 55,
  allAccess: 50,
} as const;

export type PriceRegion = "global" | "india";

/** Formatted prices for one region, ready to render. */
export type DisplayPricing = {
  region: PriceRegion;
  free: string;
  pro: string;
  allAccess: string;
  /** Percent off shown on the badge, or null where no regional discount applies. */
  proDiscount: number | null;
  allAccessDiscount: number | null;
  /** The usual USD price, struck through beside a regional price. Null where the price is the usual one. */
  proOriginal: string | null;
  allAccessOriginal: string | null;
};

/** 49 → "$49", 49.99 → "$49.99" */
export function formatPrice(amount: number): string {
  return Number.isInteger(amount) ? `$${amount}` : `$${amount.toFixed(2)}`;
}

/** 1999 → "₹1,999" */
function formatInr(amount: number): string {
  return `₹${amount.toLocaleString("en-IN")}`;
}

export const GLOBAL_PRICING: DisplayPricing = {
  region: "global",
  free: "$0",
  pro: formatPrice(PRICES.pro),
  allAccess: formatPrice(PRICES.allAccess),
  proDiscount: null,
  allAccessDiscount: null,
  proOriginal: null,
  allAccessOriginal: null,
};

export const INDIA_PRICING: DisplayPricing = {
  region: "india",
  free: "₹0",
  pro: formatInr(INDIA_PRICES.pro),
  allAccess: formatInr(INDIA_PRICES.allAccess),
  proDiscount: INDIA_DISCOUNT.pro,
  allAccessDiscount: INDIA_DISCOUNT.allAccess,
  proOriginal: formatPrice(PRICES.pro),
  allAccessOriginal: formatPrice(PRICES.allAccess),
};
