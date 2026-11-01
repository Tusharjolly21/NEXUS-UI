"use client";

import * as React from "react";
import { toast } from "sonner";
import { pillClassName, type PillVariant } from "@/components/site/pill-link";
import { trackEvent } from "@/lib/track";

/**
 * Starts a Dodo Payments checkout for a plan and sends the buyer to the hosted checkout page.
 * Signed-out visitors are sent to log in first.
 */
export function CheckoutButton({
  plan,
  returnPath,
  variant = "ink",
  className,
  children,
}: {
  plan: "annual" | "lifetime";
  /** Same-site path to come back to after signing in. Defaults to /pricing. */
  returnPath?: string;
  variant?: PillVariant;
  className?: string;
  children: React.ReactNode;
}) {
  const [loading, setLoading] = React.useState(false);

  async function checkout() {
    setLoading(true);
    trackEvent("buy_click", { plan, from: returnPath ?? "/pricing" });
    try {
      const res = await fetch("/api/dodo/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      if (res.status === 401) {
        trackEvent("login_needed", { plan });
        window.location.href = `/login?next=${encodeURIComponent(returnPath ?? "/pricing")}`;
        return;
      }
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) {
        trackEvent("checkout_error", { plan, status: res.status });
        toast.error(data.error ?? "Checkout didn't open. Try again in a moment.");
        return;
      }
      trackEvent("checkout_opened", { plan });
      window.location.href = data.url;
    } catch {
      trackEvent("checkout_error", { plan, status: 0 });
      toast.error("Couldn't reach checkout. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={checkout}
        disabled={loading}
        className={pillClassName(variant, "md", `w-full disabled:opacity-60 ${className ?? ""}`)}
      >
        {loading ? "Opening checkout…" : children}
      </button>
    </>
  );
}
