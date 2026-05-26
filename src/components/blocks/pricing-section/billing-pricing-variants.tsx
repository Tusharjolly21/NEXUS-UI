"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

type BillingCycle = "monthly" | "yearly";

type GridPlan = {
  label: string;
  monthly: string;
  yearly: string;
  copy: string;
  features: string[];
  action: string;
  featured?: boolean;
};

const gridPlans: GridPlan[] = [
  {
    label: "Starter",
    monthly: "$4/mo",
    yearly: "$38/yr",
    copy: "Best for creators starting out",
    features: [
      "Manage up to 2 channels",
      "Basic video upload support",
      "Email support within 48 hours",
      "Access to community forum",
      "Monthly performance reports",
    ],
    action: "Browse Starter",
  },
  {
    label: "Medium",
    monthly: "$8/mo",
    yearly: "$76/yr",
    copy: "Perfect for creators between 10k - 100k",
    features: [
      "Everything in Starter, plus",
      "Manage up to 5 channels",
      "Priority video upload support",
      "Email support within 24 hours",
      "Access to exclusive webinars",
      "Advanced analytics reports",
    ],
    action: "Buy Now",
  },
  {
    label: "Influencer",
    monthly: "$12/mo",
    yearly: "$114/yr",
    copy: "Perfect for creators between 100k - 1m",
    features: [
      "Everything in Starter, plus",
      "Manage up to 10 channels",
      "Priority video upload support",
      "Email support within 12 hours",
      "Access to private creator community",
      "Monthly strategy sessions",
      "Advanced analytics and insights",
    ],
    action: "Buy Now",
    featured: true,
  },
  {
    label: "Celebrity",
    monthly: "Contact Us",
    yearly: "Contact Us",
    copy: "Perfect for creators beyond 1m",
    features: [
      "Everything in Influencer, plus",
      "Manage unlimited channels",
      "24/7 priority support",
      "Access to VIP creator community",
      "Weekly strategy sessions",
      "Custom branding and design services",
    ],
    action: "Contact Us",
  },
];

const comparisonPlans = [
  {
    label: "Hobby",
    monthly: "99",
    yearly: "950",
    features: [
      "Access to basic analytics reports",
      "Up to 10,000 data points per month",
      "Email support",
      "Community forum access",
      "Cancel anytime",
    ],
    inherited: [],
  },
  {
    label: "Starter",
    monthly: "299",
    yearly: "2,870",
    badge: "Featured",
    features: [
      "Advanced analytics dashboard",
      "Customizable reports and charts",
      "Real-time data tracking",
      "Integration with third-party tools",
    ],
    inherited: ["Everything in Hobby Plan"],
  },
  {
    label: "Pro",
    monthly: "1490",
    yearly: "14,300",
    features: [
      "Unlimited data storage",
      "Customizable dashboards",
      "Advanced data segmentation",
      "Real-time data processing",
      "AI-powered insights and recommendations",
    ],
    inherited: ["Everything in Hobby Plan", "Everything in Starter Plan"],
  },
];

const spotlightPlans = [
  {
    label: "Hobby",
    copy: "For indie makers trying out AI for the first time.",
    monthly: "$199",
    yearly: "$1,910",
    periodMonthly: "/ Month",
    periodYearly: "/ Year",
    action: "Start a free trial",
    features: ["120 projects per month", "Unlimited workspaces", "2 AI Model Choices", "History & Export", "Basic email support", "1 member seat"],
  },
  {
    label: "Pro",
    copy: "For teams that need more power and flexibility.",
    monthly: "$499",
    yearly: "$4,790",
    periodMonthly: "/ Month",
    periodYearly: "/ Year",
    action: "Get started",
    featured: true,
    features: ["Unlimited projects", "Unlimited workspaces", "All AI Models included", "History & Export", "Priority email support", "10 member seats"],
  },
  {
    label: "Enterprise",
    copy: "For large organizations with custom needs.",
    monthly: "$690",
    yearly: "$6,620",
    periodMonthly: "/ Month",
    periodYearly: "/ Year",
    action: "Contact sales",
    features: ["Everything in Pro", "Custom integrations", "Dedicated account manager", "SSO & SAML", "24/7 phone support", "Unlimited member seats"],
  },
];

function BillingToggle({
  cycle,
  onChange,
  inverse = false,
  id,
}: {
  cycle: BillingCycle;
  onChange: (cycle: BillingCycle) => void;
  inverse?: boolean;
  id: string;
}) {
  return (
    <div
      className={cn(
        "relative inline-flex items-center rounded-lg p-1 text-sm",
        inverse ? "bg-white/10 text-white/65" : "bg-zinc-100 text-zinc-500",
      )}
      aria-label="Billing frequency"
    >
      {(["monthly", "yearly"] as const).map((value) => (
        <button
          key={value}
          type="button"
          onClick={() => onChange(value)}
          className={cn(
            "relative min-w-[74px] rounded-md px-4 py-2 font-medium capitalize",
            cycle === value && (inverse ? "text-zinc-950" : "text-white"),
          )}
        >
          {cycle === value && (
            <motion.span
              layoutId={`billing-toggle-${id}`}
              className={cn("absolute inset-0 rounded-md", inverse ? "bg-white" : "bg-zinc-950")}
              transition={{ type: "spring", stiffness: 430, damping: 34 }}
            />
          )}
          <span className="relative z-10">{value}</span>
        </button>
      ))}
    </div>
  );
}

function SwitchingText({
  cycle,
  monthly,
  yearly,
  className,
}: {
  cycle: BillingCycle;
  monthly: string;
  yearly: string;
  className?: string;
}) {
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.span
        key={cycle}
        initial={{ opacity: 0, y: 10, filter: "blur(5px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        exit={{ opacity: 0, y: -10, filter: "blur(5px)" }}
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        className={className}
      >
        {cycle === "monthly" ? monthly : yearly}
      </motion.span>
    </AnimatePresence>
  );
}

function FeatureItem({ children, pale = false }: { children: React.ReactNode; pale?: boolean }) {
  return (
    <li className={cn("flex items-start gap-2.5 text-[12px] leading-5", pale ? "text-white/68" : "text-zinc-600")}>
      <span className={cn("mt-[3px] flex size-3.5 shrink-0 items-center justify-center rounded-full", pale ? "bg-white text-zinc-800" : "bg-zinc-600 text-white")}>
        <Check className="size-2.5 stroke-[3]" />
      </span>
      <span>{children}</span>
    </li>
  );
}

export function PricingPlanGrid() {
  const [cycle, setCycle] = React.useState<BillingCycle>("monthly");

  return (
    <section className="flex h-full w-full items-center justify-center overflow-hidden bg-[#f7f7f7] px-4 py-8 text-zinc-950 sm:px-8">
      <div className="w-full max-w-[1040px]">
        <header className="mx-auto mb-8 max-w-lg text-center">
          <h2 className="text-3xl font-semibold tracking-normal">Simple pricing for your ease</h2>
          <p className="mt-3 text-sm leading-6 text-zinc-500">
            Every AI offers a wide range of services. Choose the plan that suits your needs and get started instantly.
          </p>
          <div className="mt-6">
            <BillingToggle cycle={cycle} onChange={setCycle} id="plan-grid" />
          </div>
        </header>
        <div className="grid gap-3 md:grid-cols-4">
          {gridPlans.map((plan, index) => (
            <motion.article
              key={plan.label}
              initial={false}
              animate={{ y: plan.featured ? -2 : 0 }}
              transition={{ duration: 0.3, delay: index * 0.035 }}
              className={cn(
                "flex min-h-[390px] flex-col rounded-lg p-5",
                plan.featured ? "bg-[#182032] text-white shadow-xl" : "border border-zinc-100 bg-white",
              )}
            >
              <h3 className={cn("text-sm font-semibold", plan.featured ? "text-white/90" : "text-zinc-700")}>{plan.label}</h3>
              <div className="mt-4 flex min-h-10 items-center text-[30px] font-semibold tracking-normal">
                <SwitchingText cycle={cycle} monthly={plan.monthly} yearly={plan.yearly} />
              </div>
              <p className={cn("mt-4 min-h-10 text-[12px] leading-5", plan.featured ? "text-white/62" : "text-zinc-500")}>{plan.copy}</p>
              <motion.ul
                key={`${plan.label}-${cycle}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.035, duration: 0.3 }}
                className="mt-6 space-y-2"
              >
                {plan.features.map((feature) => (
                  <FeatureItem key={feature} pale={plan.featured}>{feature}</FeatureItem>
                ))}
              </motion.ul>
              <button
                type="button"
                className={cn(
                  "mt-auto rounded-full px-4 py-2.5 text-xs font-semibold",
                  plan.featured ? "bg-white text-zinc-900" : "bg-black text-white",
                )}
              >
                {plan.action}
              </button>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function AdvancedPricingColumns() {
  const [cycle, setCycle] = React.useState<BillingCycle>("monthly");

  return (
    <section className="flex h-full w-full items-center justify-center overflow-hidden bg-[#f8f8f8] px-4 py-7 text-zinc-900">
      <div className="w-full max-w-[940px]">
        <header className="mx-auto mb-7 flex max-w-xl flex-col items-center text-center">
          <h2 className="text-[30px] font-semibold">Simple pricing for advanced people</h2>
          <p className="mt-2 max-w-md text-sm leading-6 text-zinc-500">
            Flexible reporting and analytics plans built for teams that need more depth.
          </p>
          <div className="mt-5">
            <BillingToggle cycle={cycle} onChange={setCycle} id="advanced" />
          </div>
        </header>
        <div className="grid gap-4 md:grid-cols-3">
          {comparisonPlans.map((plan, index) => (
            <motion.article
              key={plan.label}
              layout
              initial={false}
              animate={{ y: plan.badge ? -4 : 0 }}
              transition={{ type: "spring", stiffness: 280, damping: 26, delay: index * 0.03 }}
              className="flex min-h-[405px] flex-col rounded-[18px] border border-zinc-100 bg-white p-3 shadow-[0_1px_1px_rgba(0,0,0,0.03)]"
            >
              <div className="rounded-[13px] border border-zinc-200 bg-white p-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold">{plan.label}</h3>
                  {plan.badge && <span className="rounded-full bg-zinc-900 px-3 py-1 text-[10px] font-medium text-white">{plan.badge}</span>}
                </div>
                <div className="mt-7 flex items-baseline gap-1">
                  <span className="text-lg text-zinc-500">$</span>
                  <SwitchingText
                    cycle={cycle}
                    monthly={plan.monthly}
                    yearly={plan.yearly}
                    className="text-[48px] font-semibold leading-none"
                  />
                  <span className="text-xs text-zinc-500">/{cycle === "monthly" ? "month" : "year"}</span>
                </div>
                <button type="button" className="mt-7 w-full rounded-md bg-[#2394de] py-2.5 text-xs font-medium text-white shadow-[inset_0_1px_0_rgba(255,255,255,.28)]">
                  Get {plan.label}
                </button>
              </div>
              <motion.ul
                key={`${plan.label}-${cycle}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.035 }}
                className="space-y-2 px-2 pt-7"
              >
                {plan.features.map((feature) => <FeatureItem key={feature}>{feature}</FeatureItem>)}
              </motion.ul>
              {plan.inherited.length > 0 && (
                <div className="mt-5 border-t border-zinc-200 px-2 pt-4">
                  <Plus className="mx-auto mb-4 size-3.5 text-zinc-700" />
                  <ul className="space-y-2">
                    {plan.inherited.map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-[12px] font-medium text-zinc-700">
                        <span className="flex size-3.5 items-center justify-center rounded-full bg-sky-500 text-white"><Check className="size-2.5 stroke-[3]" /></span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function SpotlightPricingCards() {
  const [cycle, setCycle] = React.useState<BillingCycle>("monthly");

  return (
    <section className="flex h-full w-full items-center justify-center overflow-hidden bg-[#f7f7f7] px-4 py-7 text-zinc-950">
      <div className="w-full max-w-[900px]">
        <header className="mx-auto mb-8 max-w-sm text-center">
          <h2 className="text-[40px] font-medium leading-[1.04] tracking-normal">Pick a pricing that<br />fits your needs</h2>
          <p className="mt-5 text-sm leading-6 text-zinc-500">Every plan includes a free tier. Choose the one that fits your needs.</p>
          <div className="mt-5">
            <BillingToggle cycle={cycle} onChange={setCycle} id="spotlight" />
          </div>
        </header>
        <div className="grid items-stretch gap-4 md:grid-cols-3">
          {spotlightPlans.map((plan, index) => (
            <motion.article
              key={plan.label}
              initial={false}
              animate={{ y: plan.featured ? -4 : 0, scale: plan.featured ? 1.01 : 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 27, delay: index * 0.035 }}
              className={cn(
                "flex min-h-[390px] flex-col rounded-[18px] border p-5",
                plan.featured ? "border-zinc-800 bg-[#191919] text-white shadow-xl" : "border-zinc-100 bg-white",
              )}
            >
              <div className={cn("rounded-[13px] border p-5", plan.featured ? "border-zinc-700 bg-[#262626]" : "border-zinc-100 bg-white shadow-sm")}>
                <h3 className="text-lg font-semibold">{plan.label}</h3>
                <p className={cn("mt-2 min-h-10 text-[12px] leading-5", plan.featured ? "text-white/56" : "text-zinc-500")}>{plan.copy}</p>
              </div>
              <div className="mt-7 flex items-baseline gap-2">
                <SwitchingText cycle={cycle} monthly={plan.monthly} yearly={plan.yearly} className="text-[40px] font-medium leading-none" />
                <span className={cn("text-xs", plan.featured ? "text-white/45" : "text-zinc-500")}>
                  {cycle === "monthly" ? plan.periodMonthly : plan.periodYearly}
                </span>
              </div>
              <button
                type="button"
                className={cn(
                  "mt-5 w-full rounded-full border py-3 text-xs font-medium",
                  plan.featured ? "border-transparent bg-[#5548ef] text-white" : "border-zinc-100 bg-white text-zinc-600 shadow-sm",
                )}
              >
                {plan.action}
              </button>
              <div className={cn("my-5 border-t border-dashed", plan.featured ? "border-white/15" : "border-zinc-200")} />
              <p className={cn("mb-3 text-[10px] font-medium uppercase", plan.featured ? "text-white/45" : "text-zinc-400")}>
                {plan.label} plan includes
              </p>
              <motion.ul
                key={`${plan.label}-${cycle}`}
                initial={{ opacity: 0, y: 7 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.035 }}
                className="space-y-2"
              >
                {plan.features.map((feature) => <FeatureItem key={feature} pale={plan.featured}>{feature}</FeatureItem>)}
              </motion.ul>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
