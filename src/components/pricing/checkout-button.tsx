"use client";

import * as React from "react";
import Script from "next/script";
import { toast } from "sonner";
import { pillClassName, type PillVariant } from "@/components/site/pill-link";

declare global {
  interface Window {
    createLemonSqueezy?: () => void;
    LemonSqueezy?: { Url: { Open: (url: string) => void } };
  }
}

/**
 * Starts a Lemon Squeezy checkout for a plan and opens it in the overlay (falls back to a full
 * redirect if lemon.js hasn't loaded). Signed-out visitors are sent to log in first.
 */
export function CheckoutButton({
  plan,
  variant = "ink",
  className,
  children,
}: {
  plan: "annual" | "lifetime";
  variant?: PillVariant;
  className?: string;
  children: React.ReactNode;
}) {
  const [loading, setLoading] = React.useState(false);

  async function checkout() {
    setLoading(true);
    try {
      const res = await fetch("/api/lemonsqueezy/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      if (res.status === 401) {
        window.location.href = "/login?next=/pricing";
        return;
      }
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) {
        toast.error(data.error ?? "Checkout didn't open. Try again in a moment.");
        return;
      }
      if (window.LemonSqueezy) {
        window.createLemonSqueezy?.();
        window.LemonSqueezy.Url.Open(data.url);
      } else {
        window.location.href = data.url;
      }
    } catch {
      toast.error("Couldn't reach checkout. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Script src="https://app.lemonsqueezy.com/js/lemon.js" strategy="lazyOnload" />
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
