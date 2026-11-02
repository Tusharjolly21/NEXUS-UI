/**
 * Early-price slots. Each plan has a number of early slots; when they are gone, the price goes up. The numbers
 * shown to visitors are never typed in by hand: how many are taken is counted from the orders and subscriptions
 * tables (see /api/slots), and the cap is the number below. Change a cap here and the popup follows.
 *
 * Only turn this on when the price really will rise once a plan's slots are gone. When a plan's slots are
 * full (or its count can't be read) the popup leaves that plan out, and with both full it doesn't appear at all.
 */
export const SLOTS_ENABLED = true;

export const SLOT_CAPS = {
  /** All-Access, one payment. */
  lifetime: 50,
  /** Pro, yearly. */
  yearly: 50,
} as const;

/**
 * Only purchases made on or after this moment take a slot. Anything earlier was test data from setting up
 * payments. (UTC; the first real purchase was on 2026-10-26.)
 */
export const SLOTS_COUNT_FROM = "2026-10-26T00:00:00Z";

/**
 * Accounts that never count toward a slot, such as your own test purchases. Empty: every paying customer, annual or
 * lifetime, takes a slot. These are opaque user ids (from the orders and subscriptions tables), not emails; add an id
 * here and its purchases stop taking a slot.
 */
export const SLOTS_IGNORE_USER_IDS: readonly string[] = [];

export type SlotPlan = keyof typeof SLOT_CAPS;

export type SlotsResponse = {
  enabled: boolean;
  plans: Partial<Record<SlotPlan, { taken: number; cap: number }>>;
};

/** The popup's dismiss cookie: closing it hides it for a week. */
export const SLOTS_COOKIE = "nx-slots";

/** Early slots still open: per plan (a full plan is left out) and in all. Null when the numbers aren't available. */
export function slotsLeft(data: SlotsResponse | null) {
  if (!data?.enabled) return null;
  const open = (Object.keys(data.plans) as SlotPlan[])
    .map((plan) => ({ plan, taken: data.plans[plan]!.taken, cap: data.plans[plan]!.cap, left: data.plans[plan]!.cap - data.plans[plan]!.taken }))
    .filter((r) => r.left > 0);
  const total = open.reduce((n, r) => n + r.left, 0);
  return total > 0 ? { total, open } : null;
}
