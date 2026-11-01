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
  | "pro_card_click"
  | "pro_wall_hit"
  | "plans_click"
  | "login_completed";

export function trackEvent(name: FunnelEvent, props?: Record<string, string | number | boolean>) {
  const send = () => {
    try {
      track(name, props);
    } catch {
      // Analytics must never get in the way of the page.
    }
  };
  // Vercel's queue only exists once its own component has mounted, and an event sent before that is dropped.
  // A page that loads straight into a tracked moment (the return from checkout) can get there first, so wait a beat.
  if (typeof window !== "undefined" && typeof (window as unknown as { va?: unknown }).va !== "function") {
    window.setTimeout(send, 400);
    return;
  }
  send();
}
