import type { Database } from "@/lib/supabase/database.types";

type Order = Database["public"]["Tables"]["orders"]["Row"];
type Subscription = Database["public"]["Tables"]["subscriptions"]["Row"];

export type PlanKind = "free" | "yearly" | "lifetime";

/** What a person sees about their plan, derived from their subscription and orders. */
export type PlanSummary = {
  kind: PlanKind;
  /** Short name for badges: Free, Pro or All-Access. */
  label: string;
  /** Whether the plan currently unlocks Pro items. */
  hasAccess: boolean;
  /** One line under the plan name. */
  detail: string;
  /** Anything that needs the person's attention, shown as a notice. */
  notice: { tone: "warn" | "info"; text: string } | null;
  /** Date the plan renews or ends, when there is one. */
  date: string | null;
  /** Small status chip next to the plan name. */
  badge: { label: string; tone: "good" | "warn" | "neutral" };
};

function fmt(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" });
}

export function summarisePlan(subscription: Subscription | null, orders: Order[]): PlanSummary {
  if (orders.some((o) => o.product_type === "lifetime" && o.status === "paid")) {
    return {
      kind: "lifetime",
      label: "All-Access",
      hasAccess: true,
      detail: "Every current and future release, paid once. No renewal, no expiry.",
      notice: null,
      date: null,
      badge: { label: "Active", tone: "good" },
    };
  }

  const sub = subscription;
  const now = Date.now();
  if (sub) {
    const endsInFuture = !!sub.ends_at && new Date(sub.ends_at).getTime() > now;

    if (sub.status === "active" && sub.cancel_at_period_end) {
      const when = sub.renews_at ? fmt(sub.renews_at) : null;
      return {
        kind: "yearly",
        label: "Pro",
        hasAccess: true,
        detail: when ? `Pro stays active until ${when}, then ends.` : "Pro is set to end after the current year.",
        notice: { tone: "info", text: "Your subscription is set to cancel and won't renew." },
        date: sub.renews_at,
      badge: { label: "Ending", tone: "warn" },
      };
    }
    if (sub.status === "active") {
      return {
        kind: "yearly",
        label: "Pro",
        hasAccess: true,
        detail: sub.renews_at ? `Renews on ${fmt(sub.renews_at)}.` : "Renews yearly until you cancel.",
        notice: null,
        date: sub.renews_at,
      badge: { label: "Active", tone: "good" },
      };
    }
    if (sub.status === "past_due") {
      return {
        kind: "yearly",
        label: "Pro",
        hasAccess: true,
        detail: "Your last payment didn't go through.",
        notice: { tone: "warn", text: "Update your payment method so Pro doesn't lapse." },
        date: sub.renews_at,
      badge: { label: "Payment due", tone: "warn" },
      };
    }
    if (sub.status === "cancelled" && endsInFuture) {
      return {
        kind: "yearly",
        label: "Pro",
        hasAccess: true,
        detail: `Cancelled. You keep Pro until ${fmt(sub.ends_at as string)}.`,
        notice: { tone: "info", text: "You won't be charged again." },
        date: sub.ends_at,
      badge: { label: "Ending", tone: "warn" },
      };
    }
    if (sub.status === "on_hold" || sub.status === "failed" || sub.status === "paused") {
      return {
        kind: "free",
        label: "Free",
        hasAccess: false,
        detail: "Your Pro subscription is on hold.",
        notice: { tone: "warn", text: "Update your payment method to bring Pro back." },
        date: null,
      badge: { label: "On hold", tone: "warn" },
      };
    }
    if (sub.status === "cancelled" || sub.status === "expired") {
      return {
        kind: "free",
        label: "Free",
        hasAccess: false,
        detail: "Your Pro subscription has ended.",
        notice: null,
        date: sub.ends_at,
      badge: { label: "Ended", tone: "neutral" },
      };
    }
  }

  return {
    kind: "free",
    label: "Free",
    hasAccess: false,
    detail: "Free components, free to use anywhere. Upgrade any time for the rest.",
    notice: null,
    date: null,
      badge: { label: "Free plan", tone: "neutral" },
  };
}
