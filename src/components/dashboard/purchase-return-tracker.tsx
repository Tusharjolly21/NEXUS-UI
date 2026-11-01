"use client";

import * as React from "react";
import { PRICES } from "@/lib/pricing";
import { trackEvent } from "@/lib/track";

type Gtag = (...args: unknown[]) => void;

const GA_DONE_KEY = "nexus-ga-purchase";

/** Sends Google Analytics' standard `purchase` event for the plan named in the return address. False if Google's tag is not on the page. */
function sendGaPurchase(plan: "annual" | "lifetime"): boolean {
  const gtag = (window as unknown as { gtag?: Gtag }).gtag;
  if (typeof gtag !== "function") return false;
  const price = plan === "annual" ? PRICES.pro : PRICES.allAccess;
  gtag("event", "purchase", {
    transaction_id: `${plan}-${Date.now().toString(36)}`,
    value: price,
    currency: "USD",
    items: [{ item_id: plan, item_name: plan === "annual" ? "Nexus UI Pro (yearly)" : "Nexus UI All-Access (lifetime)", price, quantity: 1 }],
  });
  return true;
}

/**
 * Counts the return from the hosted checkout. Renders nothing.
 * - Vercel: purchase_return, once per browser tab.
 * - Google Analytics: its standard `purchase` event, once per tab and only when the plan is confirmed
 *   active ("unlocked"), so a payment that is still being activated is not counted early. It is sent only
 *   if Google's tag is on the page, which means only for visitors who accepted cookies. The value is the
 *   plan's list price.
 */
export function PurchaseReturnTracker({ state }: { state: "activating" | "unlocked" }) {
  React.useEffect(() => {
    try {
      if (window.sessionStorage.getItem("nexus-purchase-return") === "1") return;
      window.sessionStorage.setItem("nexus-purchase-return", "1");
    } catch {
      // Storage blocked: count it anyway.
    }
    trackEvent("purchase_return", { state });
  }, [state]);

  React.useEffect(() => {
    if (state !== "unlocked") return;
    const plan = new URLSearchParams(window.location.search).get("plan");
    if (plan !== "annual" && plan !== "lifetime") return;
    try {
      if (window.sessionStorage.getItem(GA_DONE_KEY) === "1") return;
    } catch {
      // Storage blocked: carry on.
    }
    // Google's tag loads a moment after the page, so look for it for up to ten seconds.
    let tries = 0;
    const timer = window.setInterval(() => {
      tries += 1;
      if (sendGaPurchase(plan)) {
        try {
          window.sessionStorage.setItem(GA_DONE_KEY, "1");
        } catch {
          // Storage blocked.
        }
        window.clearInterval(timer);
      } else if (tries >= 20) {
        window.clearInterval(timer);
      }
    }, 500);
    return () => window.clearInterval(timer);
  }, [state]);

  return null;
}
