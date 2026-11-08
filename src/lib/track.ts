import { track } from "@vercel/analytics";

/**
 * Funnel events for Vercel Web Analytics (cookie-free). Names and values are fixed labels such as a
 * plan name or a component slug: never an email, name, user id or anything typed by a visitor.
 * It does nothing in browsers where analytics is off (opted out), and it can never break the page.
 */
export type FunnelEvent =
  | "src_landing"
  | "buy_click"
  | "login_needed"
  | "checkout_opened"
  | "checkout_error"
  | "purchase_return"
  | "pro_card_click"
  | "after_copy_shown"
  | "pro_row_click"
  | "pro_wall_hit"
  | "plans_click"
  | "login_completed";

/**
 * Where a visit came from, when the link said so: nexus-ui.com/components/venom-button?src=ig.
 * It is kept for the tab's session only (sessionStorage: no cookie, nothing that outlives the tab) and added
 * to every funnel event, so an Instagram or ad visitor can be followed from the landing page to the purchase.
 */
const SRC_KEY = "nx_src";
const SRC_LABEL = /^[a-z0-9_-]{1,24}$/;

export function readSource(): string | undefined {
  try {
    return window.sessionStorage.getItem(SRC_KEY) ?? undefined;
  } catch {
    return undefined;
  }
}

/** Keeps a ?src label for this session. Returns true when it is new, so the landing is counted once. */
export function rememberSource(raw: string): boolean {
  const label = raw.trim().toLowerCase();
  if (!SRC_LABEL.test(label) || readSource() === label) return false;
  try {
    window.sessionStorage.setItem(SRC_KEY, label);
    return true;
  } catch {
    return false;
  }
}

export function trackEvent(name: FunnelEvent, props?: Record<string, string | number | boolean>) {
  const src = readSource();
  const withSrc = src && !(props && "src" in props) ? { ...props, src } : props;
  const send = () => {
    try {
      track(name, withSrc);
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
