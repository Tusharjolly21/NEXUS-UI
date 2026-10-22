"use client";

import * as React from "react";
import Link from "next/link";
import { Check } from "lucide-react";
import { PillLink } from "@/components/site";
import type { PillVariant } from "@/components/site/pill-link";
import { CheckoutButton } from "@/components/pricing/checkout-button";
import { useProAccess } from "@/components/pro/pro-access";
import { cn } from "@/lib/utils";

type Tier = "pro" | "all-access";

/** Does this visitor's plan already cover the tier? All-Access covers both; Pro covers Pro. */
function useOwns(tier: Tier) {
  const { plan } = useProAccess();
  return { plan, owned: plan === "lifetime" || (plan === "yearly" && tier === "pro") };
}

const GREEN_TEXT = "text-[#1d6b30] dark:text-[#7ee2a8]";

/**
 * The button area of a plan card. Visitors see the buy button; members see what they already have
 * (so nobody pays twice), with the next sensible step under it.
 */
export function PlanAction({ tier, variant, children }: { tier: Tier; variant?: PillVariant; children: React.ReactNode }) {
  const { plan, owned } = useOwns(tier);

  if (!owned) {
    return (
      <>
        <CheckoutButton plan={tier === "pro" ? "annual" : "lifetime"} variant={variant}>
          {children}
        </CheckoutButton>
        {tier === "all-access" && plan === "yearly" ? (
          <p className="mt-3 text-center text-[13px] text-muted-foreground">
            You&apos;re on Pro. Buy All-Access, then cancel Pro from Billing so it doesn&apos;t renew.
          </p>
        ) : (
          <p className="mt-3 text-center text-[13px] text-muted-foreground">Plus tax where it applies, shown at checkout.</p>
        )}
      </>
    );
  }

  const label = tier === "pro" && plan === "lifetime" ? "Included in All-Access" : "Your plan";
  const next = plan === "yearly" ? { href: "/dashboard/billing", text: "Manage billing" } : { href: "/dashboard", text: "Open your dashboard" };
  return (
    <>
      <p className={cn("inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#34c759]/14 text-[15px] font-semibold", GREEN_TEXT)}>
        <Check className="size-4" strokeWidth={3} aria-hidden />
        {label}
      </p>
      <p className="mt-3 text-center text-[13px]">
        <Link href={next.href} className="font-medium text-link hover:underline hover:underline-offset-4">
          {next.text}
        </Link>
      </p>
    </>
  );
}

/** The small tag in a plan card's corner: "Your plan" for members, "Recommended" for everyone else. */
export function PlanTag({ tier, featured }: { tier: Tier; featured: boolean }) {
  const { plan, owned } = useOwns(tier);
  if (owned) {
    return (
      <span className={cn("absolute right-6 top-6 inline-flex items-center gap-1 rounded-full bg-[#34c759]/14 px-3 py-1 text-[12px] font-semibold", GREEN_TEXT)}>
        <Check className="size-3" strokeWidth={3} aria-hidden />
        {tier === "pro" && plan === "lifetime" ? "Included" : "Your plan"}
      </span>
    );
  }
  if (!featured || plan === "lifetime") return null;
  return <span className="absolute right-6 top-6 rounded-full bg-action/10 px-3 py-1 text-[12px] font-semibold text-link">Recommended</span>;
}

/** One line under the pricing hero telling members they're already covered. */
export function PlanNotice() {
  const { plan } = useProAccess();
  if (plan === "free") return null;
  return (
    <p
      role="status"
      className={cn("mx-auto mt-6 max-w-[580px] rounded-2xl bg-[#34c759]/14 px-4 py-3 text-[15px] leading-relaxed", GREEN_TEXT)}
    >
      You&apos;re on {plan === "lifetime" ? "All-Access" : "Pro"}, so everything here is already unlocked.{" "}
      <Link href="/dashboard" className="font-semibold underline underline-offset-2">
        Open your dashboard
      </Link>
    </p>
  );
}

/** A plan link on the home page: members see their plan instead of a buy link. */
export function PlanLink({
  tier,
  href,
  variant,
  className,
  children,
}: {
  tier: Tier;
  href: string;
  variant: PillVariant;
  className?: string;
  children: React.ReactNode;
}) {
  const { plan, owned } = useOwns(tier);
  if (!owned) {
    return (
      <PillLink href={href} variant={variant} className={className}>
        {children}
      </PillLink>
    );
  }
  return (
    <PillLink href={plan === "yearly" ? "/dashboard/billing" : "/dashboard"} variant="white" className={className}>
      <Check className="size-4 text-[#248a3d] dark:text-[#30d158]" strokeWidth={3} aria-hidden />
      {tier === "pro" && plan === "lifetime" ? "Included" : "Your plan"}
    </PillLink>
  );
}
