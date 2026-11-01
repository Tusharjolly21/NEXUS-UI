import { track } from "@vercel/analytics";

/**
 * Funnel events for Vercel Web Analytics (cookie-free). Names and values are fixed labels such as a
 * plan name or a component slug: never an email, name, user id or anything typed by a visitor.
 * It does nothing in browsers where analytics is off (opted out), and it can never break the page.
 */
export type FunnelEvent =
  | "buy_click"
  | "login_needed"
  | "checkout_opened"
  | "checkout_error"
  | "purchase_return"
  | "pro_card_click";

export function trackEvent(name: FunnelEvent, props?: Record<string, string | number | boolean>) {
  try {
    track(name, props);
  } catch {
    // Analytics must never get in the way of the page.
  }
}
