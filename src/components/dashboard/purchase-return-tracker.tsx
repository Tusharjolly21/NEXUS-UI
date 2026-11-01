"use client";

import * as React from "react";
import { trackEvent } from "@/lib/track";

/** Counts the visit back from the hosted checkout once per browser tab. Renders nothing. */
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
  return null;
}
