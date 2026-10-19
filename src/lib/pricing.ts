/**
 * Display prices in USD. Safe to import from client and server code.
 * The amount actually charged is set on each product in the payment
 * provider's dashboard; keep these in sync with it.
 */
export const PRICES = {
  /** Pro, yearly subscription. Unlocks everything. */
  pro: 49.99,
  /** All-Access, one-time lifetime payment. Unlocks the same everything, forever. */
  allAccess: 79.99,
} as const;

/** 49 → "$49", 49.99 → "$49.99" */
export function formatPrice(amount: number): string {
  return Number.isInteger(amount) ? `$${amount}` : `$${amount.toFixed(2)}`;
}
