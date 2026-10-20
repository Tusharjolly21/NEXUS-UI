"use client";

import * as React from "react";
import { AnimatePresence, motion, useReducedMotion, type Transition, type Variants } from "framer-motion";
import { Check, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export type BillingCycle = "monthly" | "yearly";

/** One card in `PricingPlanGrid`. Prices are display strings, so "Let's talk" works too. */
export type PricingGridPlan = {
  label: string;
  monthly: string;
  yearly: string;
  copy: string;
  features: string[];
  action: string;
  featured?: boolean;
};

/** One column in `AdvancedPricingColumns`. Amounts are written without the currency symbol. */
export type AdvancedPricingPlan = {
  label: string;
  monthly: string;
  yearly: string;
  badge?: string;
  features: string[];
  inherited: string[];
};

/** One card in `SpotlightPricingCards`. `featured` makes it the dark, taller spotlight card. */
export type SpotlightPricingPlan = {
  label: string;
  copy: string;
  monthly: string;
  yearly: string;
  periodMonthly: string;
  periodYearly: string;
  action: string;
  featured?: boolean;
  features: string[];
  /** Hide the period after the price. Defaults to true when `monthly` is "Custom". */
  hidePeriod?: boolean;
};

/** Props shared by the three billing-toggle pricing sections. */
type BillingSectionProps = {
  /** Main heading. */
  title?: string;
  /** Paragraph under the heading. */
  description?: string;
  /** Small line under the billing toggle. Empty string hides it. */
  savingsNote?: string;
  /** Show the Monthly / Yearly toggle (and its note). Prices stay on `defaultCycle` when hidden. */
  showBillingToggle?: boolean;
  /** Billing period shown on mount. */
  defaultCycle?: BillingCycle;
  /** Accent for buttons, checks, focus rings and highlights. Unset keeps Apple blue (brighter in dark mode). */
  accentColor?: string;
  /** Extra classes on the outer section. */
  className?: string;
};

export type PricingPlanGridProps = BillingSectionProps & {
  /** Label on the featured card. */
  featuredBadge?: string;
  /** Up to 8 cards. */
  plans?: PricingGridPlan[];
};

export type AdvancedPricingColumnsProps = BillingSectionProps & {
  /** Symbol shown before every amount. */
  currency?: string;
  /** Button text before the plan name ("Get" + "Team"). */
  ctaPrefix?: string;
  /** Period shown after the amount when billed monthly. */
  monthlyPeriod?: string;
  /** Period shown after the amount when billed yearly. */
  yearlyPeriod?: string;
  /** Up to 6 columns. */
  plans?: AdvancedPricingPlan[];
};

export type SpotlightPricingCardsProps = BillingSectionProps & {
  /** Small heading above each feature list. */
  featuresHeading?: string;
  /** Up to 6 cards. */
  plans?: SpotlightPricingPlan[];
};

export const DEFAULT_PRICING_GRID_PLANS: PricingGridPlan[] = [
  {
    label: "Starter",
    monthly: "$4/mo",
    yearly: "$38/yr",
    copy: "For a first channel and a weekly upload rhythm.",
    features: [
      "Manage up to 2 channels",
      "Basic video upload support",
      "Email support within 48 hours",
      "Access to community forum",
      "Monthly performance reports",
    ],
    action: "Start free for 14 days",
  },
  {
    label: "Growth",
    monthly: "$8/mo",
    yearly: "$76/yr",
    copy: "For creators between 10k and 100k subscribers.",
    features: [
      "Everything in Starter, plus",
      "Manage up to 5 channels",
      "Priority video upload support",
      "Email support within 24 hours",
      "Access to exclusive webinars",
      "Advanced analytics reports",
    ],
    action: "Choose Growth",
  },
  {
    label: "Studio",
    monthly: "$12/mo",
    yearly: "$114/yr",
    copy: "For established creators with a small team.",
    features: [
      "Everything in Growth, plus",
      "Manage up to 10 channels",
      "Priority video upload support",
      "Email support within 12 hours",
      "Access to private creator community",
      "Monthly strategy sessions",
      "Advanced analytics and insights",
    ],
    action: "Choose Studio",
    featured: true,
  },
  {
    label: "Network",
    monthly: "Let's talk",
    yearly: "Let's talk",
    copy: "For networks and agencies running many channels.",
    features: [
      "Everything in Studio, plus",
      "Manage unlimited channels",
      "24/7 priority support",
      "Access to VIP creator community",
      "Weekly strategy sessions",
      "Custom branding and design services",
    ],
    action: "Talk to sales",
  },
];

export const DEFAULT_ADVANCED_PRICING_PLANS: AdvancedPricingPlan[] = [
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
    label: "Team",
    monthly: "299",
    yearly: "2,870",
    badge: "Most teams",
    features: [
      "Advanced analytics dashboard",
      "Customizable reports and charts",
      "Real-time data tracking",
      "Integration with third-party tools",
    ],
    inherited: ["Everything in Hobby"],
  },
  {
    label: "Scale",
    monthly: "1,490",
    yearly: "14,300",
    features: [
      "Unlimited data storage",
      "Customizable dashboards",
      "Advanced data segmentation",
      "Real-time data processing",
      "AI-powered insights and recommendations",
    ],
    inherited: ["Everything in Hobby and Team"],
  },
];

export const DEFAULT_SPOTLIGHT_PRICING_PLANS: SpotlightPricingPlan[] = [
  {
    label: "Hobby",
    copy: "For indie makers trying out AI for the first time.",
    monthly: "$199",
    yearly: "$1,910",
    periodMonthly: "/month",
    periodYearly: "/year",
    action: "Start a free trial",
    features: ["120 projects per month", "Unlimited workspaces", "Two model choices", "History and export", "Email support", "1 member seat"],
  },
  {
    label: "Pro",
    copy: "For teams that need more power and flexibility.",
    monthly: "$499",
    yearly: "$4,790",
    periodMonthly: "/month",
    periodYearly: "/year",
    action: "Get started",
    featured: true,
    features: ["Unlimited projects", "Unlimited workspaces", "Every model included", "History and export", "Priority support", "10 member seats"],
  },
  {
    label: "Enterprise",
    copy: "For large organizations with custom needs.",
    monthly: "Custom",
    yearly: "Custom",
    periodMonthly: "/month",
    periodYearly: "/year",
    action: "Contact sales",
    features: ["Everything in Pro", "Custom integrations", "A named account manager", "SSO and SAML", "24/7 phone support", "Unlimited member seats"],
  },
];

const UI_SPRING: Transition = { type: "spring", stiffness: 420, damping: 34 };
const focusRing = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0071e3]";
const primaryButton = cn(
  "inline-flex h-11 w-full items-center justify-center rounded-full bg-[#0071e3] px-5 text-[15px] font-medium text-white transition-colors hover:bg-[#0077ed]",
  focusRing,
);
const secondaryButton = cn(
  "inline-flex h-11 w-full items-center justify-center rounded-full bg-[#e8e8ed] px-5 text-[15px] font-medium text-[#1d1d1f] transition-colors hover:bg-[#dcdce1]",
  "dark:bg-[#2c2c2e] dark:text-[#f5f5f7] dark:hover:bg-[#3a3a3c]",
  focusRing,
);

// Overrides applied only when `accentColor` is set; otherwise the classes above render untouched.
const ACCENT_FOCUS = "focus-visible:outline-[color:var(--bp-accent)]";
const ACCENT_FILL = "bg-[color:var(--bp-accent)] hover:bg-[color:var(--bp-accent-hover)]";
const ACCENT_TEXT = "text-[color:var(--bp-accent)] dark:text-[color:var(--bp-accent)]";
const ACCENT_SOFT_FILL = "bg-[color:var(--bp-accent-soft)] dark:bg-[color:var(--bp-accent-soft)]";

const DEFAULT_SAVINGS_NOTE = "Save about 20% when you pay yearly.";

/** Accepts plain colour values only (hex, rgb(), hsl(), names), so a prop can't smuggle in other CSS. */
function resolveAccent(accent: string | undefined) {
  if (typeof accent !== "string") return undefined;
  const value = accent.trim();
  return value && /^[#\w\s(),.%+-]{1,64}$/.test(value) ? value : undefined;
}

function accentVars(accent: string | undefined): React.CSSProperties | undefined {
  if (!accent) return undefined;
  return {
    "--bp-accent": accent,
    "--bp-accent-hover": `color-mix(in srgb, ${accent} 88%, white)`,
    "--bp-accent-soft": `color-mix(in srgb, ${accent} 12%, transparent)`,
  } as React.CSSProperties;
}

function resolveCycle(cycle: BillingCycle | undefined): BillingCycle {
  return cycle === "yearly" ? "yearly" : "monthly";
}

function resolvePlans<T>(plans: T[] | undefined, fallback: T[], max: number) {
  return (Array.isArray(plans) ? plans : fallback).slice(0, max);
}

function primaryButtonClass(accented: boolean) {
  return accented ? cn(primaryButton, ACCENT_FILL, ACCENT_FOCUS) : primaryButton;
}

/** Staggered on-view entrance shared by the three sections. */
function useReveal() {
  const reduce = useReducedMotion();
  const container: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: reduce ? 0 : 0.07, delayChildren: 0.04 } },
  };
  const item: Variants = reduce
    ? { hidden: { opacity: 0 }, show: { opacity: 1, transition: { duration: 0.2 } } }
    : {
        hidden: { opacity: 0, y: 16, filter: "blur(6px)" },
        show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { type: "spring", stiffness: 260, damping: 30 } },
      };
  return { container, item, reduce };
}

/** Apple-style segmented control: a white pill slides between Monthly and Yearly. */
function BillingToggle({
  cycle,
  onChange,
  accented = false,
  className,
}: {
  cycle: BillingCycle;
  onChange: (cycle: BillingCycle) => void;
  accented?: boolean;
  className?: string;
}) {
  const id = React.useId();
  const reduce = useReducedMotion();

  return (
    <div
      role="radiogroup"
      aria-label="Billing frequency"
      className={cn("relative inline-flex rounded-[10px] bg-[#e8e8ed] p-[3px] text-[14px] dark:bg-[#3a3a3c]", className)}
    >
      {(["monthly", "yearly"] as const).map((value) => {
        const active = cycle === value;
        return (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(value)}
            className={cn(
              "relative h-8 min-w-[96px] rounded-[8px] px-4 font-medium transition-colors",
              active ? "text-[#1d1d1f] dark:text-[#f5f5f7]" : "text-[#6e6e73] hover:text-[#1d1d1f] dark:text-[#a1a1a6] dark:hover:text-[#f5f5f7]",
              focusRing,
              accented && ACCENT_FOCUS,
            )}
          >
            {active ? (
              <motion.span
                layoutId={`${id}-pill`}
                aria-hidden
                className="absolute inset-0 rounded-[8px] bg-white shadow-[0_2px_6px_rgba(0,0,0,.1),0_0_0_.5px_rgba(0,0,0,.04)] dark:bg-[#636366]"
                transition={reduce ? { duration: 0 } : UI_SPRING}
              />
            ) : null}
            <span className="relative z-10">{value === "monthly" ? "Monthly" : "Yearly"}</span>
          </button>
        );
      })}
    </div>
  );
}

/** Swaps between the monthly and yearly value: the old one lifts out blurred, the new one rises in. */
function SwitchingText({
  cycle,
  monthly,
  yearly,
  className,
  delay = 0,
}: {
  cycle: BillingCycle;
  monthly: string;
  yearly: string;
  className?: string;
  delay?: number;
}) {
  const reduce = useReducedMotion();
  const value = cycle === "monthly" ? monthly : yearly;

  return (
    <span className="relative inline-flex">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={value}
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: "100%", filter: "blur(6px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={reduce ? { opacity: 0 } : { opacity: 0, y: "-100%", filter: "blur(6px)" }}
          transition={reduce ? { duration: 0.15 } : { type: "spring", stiffness: 380, damping: 32, delay }}
          className={cn("inline-block whitespace-nowrap", className)}
        >
          {value}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

function FeatureItem({
  children,
  pale = false,
  accented = false,
}: {
  children: React.ReactNode;
  pale?: boolean;
  accented?: boolean;
}) {
  return (
    <li className={cn("flex items-start gap-2.5 text-[14px] leading-[1.45]", pale ? "text-white/80" : "text-[#1d1d1f] dark:text-[#f5f5f7]")}>
      <Check
        aria-hidden
        strokeWidth={2.25}
        className={cn(
          "mt-[2px] size-4 shrink-0",
          pale ? "text-[#2997ff]" : "text-[#0071e3] dark:text-[#2997ff]",
          accented && ACCENT_TEXT,
        )}
      />
      <span>{children}</span>
    </li>
  );
}

function SectionHeader({
  title,
  copy,
  cycle,
  onCycle,
  item,
  showToggle,
  note,
  accented,
}: {
  title: string;
  copy: string;
  cycle: BillingCycle;
  onCycle: (cycle: BillingCycle) => void;
  item: Variants;
  showToggle: boolean;
  note: string;
  accented: boolean;
}) {
  return (
    <header className="mx-auto mb-10 flex max-w-xl flex-col items-center text-center">
      <motion.h2
        variants={item}
        className="text-balance text-[32px] font-semibold leading-[1.08] tracking-[-0.03em] text-[#1d1d1f] sm:text-[40px] dark:text-[#f5f5f7]"
      >
        {title}
      </motion.h2>
      <motion.p variants={item} className="mt-3 text-pretty text-[17px] leading-[1.5] text-[#6e6e73] dark:text-[#a1a1a6]">
        {copy}
      </motion.p>
      {showToggle ? (
        <motion.div variants={item} className="mt-6 flex flex-col items-center gap-2">
          <BillingToggle cycle={cycle} onChange={onCycle} accented={accented} />
          {note ? <span className="text-[13px] text-[#86868b] dark:text-[#98989d]">{note}</span> : null}
        </motion.div>
      ) : null}
    </header>
  );
}

export function PricingPlanGrid({
  title = "Plans that grow with your audience",
  description = "Start on the plan that fits the channels you run today. Switch tiers whenever you like and we prorate the difference.",
  savingsNote = DEFAULT_SAVINGS_NOTE,
  showBillingToggle = true,
  defaultCycle = "monthly",
  accentColor,
  featuredBadge = "Most popular",
  plans,
  className,
}: PricingPlanGridProps = {}) {
  const [cycle, setCycle] = React.useState<BillingCycle>(() => resolveCycle(defaultCycle));
  const { container, item } = useReveal();
  const accent = resolveAccent(accentColor);
  const accented = Boolean(accent);
  const visiblePlans = resolvePlans(plans, DEFAULT_PRICING_GRID_PLANS, 8);
  const activeCycle = showBillingToggle ? cycle : resolveCycle(defaultCycle);

  return (
    <section
      style={accentVars(accent)}
      className={cn(
        "flex h-full w-full items-center justify-center overflow-hidden bg-[#f5f5f7] px-4 py-14 text-[#1d1d1f] sm:px-8 dark:bg-black dark:text-[#f5f5f7]",
        className,
      )}
    >
      <motion.div
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-80px" }}
        className="w-full max-w-[1120px]"
      >
        <SectionHeader
          title={title}
          copy={description}
          cycle={activeCycle}
          onCycle={setCycle}
          item={item}
          showToggle={showBillingToggle}
          note={savingsNote}
          accented={accented}
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {visiblePlans.map((plan, index) => (
            <motion.article
              key={`${index}-${plan.label}`}
              variants={item}
              style={
                plan.featured && accented
                  ? { boxShadow: "0 0 0 2px var(--bp-accent), 0 20px 40px -24px rgba(0,0,0,.25)" }
                  : undefined
              }
              className={cn(
                "relative flex min-h-[420px] flex-col rounded-[24px] bg-white p-6 dark:bg-[#1c1c1e]",
                plan.featured
                  ? "shadow-[0_0_0_2px_#0071e3,0_20px_40px_-24px_rgba(0,0,0,.25)]"
                  : "shadow-[0_0_0_1px_rgba(0,0,0,.05),0_20px_40px_-24px_rgba(0,0,0,.25)] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08)]",
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-[17px] font-semibold tracking-[-0.015em]">{plan.label}</h3>
                {plan.featured && featuredBadge ? (
                  <span className={cn("text-[12px] font-semibold text-[#0071e3] dark:text-[#2997ff]", accented && ACCENT_TEXT)}>
                    {featuredBadge}
                  </span>
                ) : null}
              </div>
              <div className="mt-4 flex min-h-10 items-center text-[32px] font-semibold tracking-[-0.03em] tabular-nums">
                <SwitchingText cycle={activeCycle} monthly={plan.monthly} yearly={plan.yearly} delay={index * 0.04} />
              </div>
              <p className="mt-2 min-h-[42px] text-[14px] leading-[1.5] text-[#6e6e73] dark:text-[#a1a1a6]">{plan.copy}</p>
              <ul className="mb-7 mt-6 space-y-2.5 border-t border-black/[0.08] pt-5 dark:border-white/[0.1]">
                {plan.features.slice(0, 12).map((feature, i) => (
                  <FeatureItem key={`${i}-${feature}`} accented={accented}>
                    {feature}
                  </FeatureItem>
                ))}
              </ul>
              <motion.button
                type="button"
                whileTap={{ scale: 0.97 }}
                className={cn(
                  "mt-auto",
                  plan.featured ? primaryButtonClass(accented) : cn(secondaryButton, accented && ACCENT_FOCUS),
                )}
              >
                {plan.action}
              </motion.button>
            </motion.article>
          ))}
        </div>
      </motion.div>
    </section>
  );
}

export function AdvancedPricingColumns({
  title = "Pay for the questions you ask",
  description = "Every plan reads from the same warehouse. Upgrade when you need more seats, history or real-time data.",
  savingsNote = DEFAULT_SAVINGS_NOTE,
  showBillingToggle = true,
  defaultCycle = "monthly",
  accentColor,
  currency = "$",
  ctaPrefix = "Get",
  monthlyPeriod = "/month",
  yearlyPeriod = "/year",
  plans,
  className,
}: AdvancedPricingColumnsProps = {}) {
  const [cycle, setCycle] = React.useState<BillingCycle>(() => resolveCycle(defaultCycle));
  const { container, item } = useReveal();
  const accent = resolveAccent(accentColor);
  const accented = Boolean(accent);
  const visiblePlans = resolvePlans(plans, DEFAULT_ADVANCED_PRICING_PLANS, 6);
  const activeCycle = showBillingToggle ? cycle : resolveCycle(defaultCycle);

  return (
    <section
      style={accentVars(accent)}
      className={cn(
        "flex h-full w-full items-center justify-center overflow-hidden bg-[#f5f5f7] px-4 py-14 text-[#1d1d1f] dark:bg-black dark:text-[#f5f5f7]",
        className,
      )}
    >
      <motion.div
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-80px" }}
        className="w-full max-w-[1000px]"
      >
        <SectionHeader
          title={title}
          copy={description}
          cycle={activeCycle}
          onCycle={setCycle}
          item={item}
          showToggle={showBillingToggle}
          note={savingsNote}
          accented={accented}
        />
        <div className="grid gap-4 md:grid-cols-3">
          {visiblePlans.map((plan, index) => (
            <motion.article
              key={`${index}-${plan.label}`}
              variants={item}
              className="flex min-h-[440px] flex-col rounded-[28px] bg-white p-2 shadow-[0_0_0_1px_rgba(0,0,0,.05),0_20px_40px_-24px_rgba(0,0,0,.25)] dark:bg-[#1c1c1e] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08)]"
            >
              <div className="rounded-[22px] bg-[#f5f5f7] p-5 dark:bg-[#2c2c2e]">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-[17px] font-semibold tracking-[-0.015em]">{plan.label}</h3>
                  {plan.badge ? (
                    <span
                      className={cn(
                        "rounded-full bg-[#0071e3]/10 px-2.5 py-0.5 text-[12px] font-semibold text-[#0066cc] dark:bg-[#2997ff]/15 dark:text-[#2997ff]",
                        accented && cn(ACCENT_SOFT_FILL, ACCENT_TEXT),
                      )}
                    >
                      {plan.badge}
                    </span>
                  ) : null}
                </div>
                <div className="mt-6 flex items-baseline gap-1">
                  {currency ? <span className="text-[20px] font-semibold text-[#6e6e73] dark:text-[#a1a1a6]">{currency}</span> : null}
                  <SwitchingText
                    cycle={activeCycle}
                    monthly={plan.monthly}
                    yearly={plan.yearly}
                    delay={index * 0.04}
                    className="text-[44px] font-semibold leading-none tracking-[-0.035em] tabular-nums"
                  />
                  <SwitchingText
                    cycle={activeCycle}
                    monthly={monthlyPeriod}
                    yearly={yearlyPeriod}
                    delay={index * 0.04 + 0.03}
                    className="text-[14px] text-[#6e6e73] dark:text-[#a1a1a6]"
                  />
                </div>
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.97 }}
                  className={cn(
                    "mt-6",
                    plan.badge
                      ? primaryButtonClass(accented)
                      : cn(secondaryButton, "bg-white dark:bg-[#3a3a3c] dark:hover:bg-[#48484a]", accented && ACCENT_FOCUS),
                  )}
                >
                  {ctaPrefix ? `${ctaPrefix} ` : ""}
                  {plan.label}
                </motion.button>
              </div>
              <ul className="space-y-2.5 px-4 pt-6">
                {plan.features.slice(0, 12).map((feature, i) => (
                  <FeatureItem key={`${i}-${feature}`} accented={accented}>
                    {feature}
                  </FeatureItem>
                ))}
              </ul>
              {plan.inherited.length > 0 && (
                <div className="mx-4 mt-6 border-t border-black/[0.08] pb-4 pt-4 dark:border-white/[0.1]">
                  <ul className="space-y-2">
                    {plan.inherited.slice(0, 6).map((feature, i) => (
                      <li
                        key={`${i}-${feature}`}
                        className="flex items-center gap-2.5 text-[14px] font-medium text-[#6e6e73] dark:text-[#a1a1a6]"
                      >
                        <span className="grid size-4 place-items-center rounded-full bg-[#e8e8ed] text-[#1d1d1f] dark:bg-[#3a3a3c] dark:text-[#f5f5f7]">
                          <Plus aria-hidden className="size-3" strokeWidth={2.5} />
                        </span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </motion.article>
          ))}
        </div>
      </motion.div>
    </section>
  );
}

export function SpotlightPricingCards({
  title = "One assistant, three ways to run it",
  description = "Start on Hobby for free for 14 days. Every plan keeps your history when you move up.",
  savingsNote = DEFAULT_SAVINGS_NOTE,
  showBillingToggle = true,
  defaultCycle = "monthly",
  accentColor,
  featuresHeading = "Includes",
  plans,
  className,
}: SpotlightPricingCardsProps = {}) {
  const [cycle, setCycle] = React.useState<BillingCycle>(() => resolveCycle(defaultCycle));
  const { container, item } = useReveal();
  const accent = resolveAccent(accentColor);
  const accented = Boolean(accent);
  const visiblePlans = resolvePlans(plans, DEFAULT_SPOTLIGHT_PRICING_PLANS, 6);
  const activeCycle = showBillingToggle ? cycle : resolveCycle(defaultCycle);

  return (
    <section
      style={accentVars(accent)}
      className={cn(
        "flex h-full w-full items-center justify-center overflow-hidden bg-white px-4 py-14 text-[#1d1d1f] dark:bg-black dark:text-[#f5f5f7]",
        className,
      )}
    >
      <motion.div
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-80px" }}
        className="w-full max-w-[1000px]"
      >
        <SectionHeader
          title={title}
          copy={description}
          cycle={activeCycle}
          onCycle={setCycle}
          item={item}
          showToggle={showBillingToggle}
          note={savingsNote}
          accented={accented}
        />
        <div className="grid items-stretch gap-4 md:grid-cols-3">
          {visiblePlans.map((plan, index) => (
            <motion.article
              key={`${index}-${plan.label}`}
              variants={item}
              className={cn(
                "flex min-h-[460px] flex-col rounded-[28px] p-7",
                plan.featured
                  ? "bg-[#1d1d1f] text-[#f5f5f7] shadow-[0_30px_60px_-30px_rgba(0,0,0,.5)] md:-my-3 md:py-10 dark:bg-[#2c2c2e] dark:shadow-[0_0_0_1px_rgba(255,255,255,.12)]"
                  : "bg-[#f5f5f7] dark:bg-[#1c1c1e] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08)]",
              )}
            >
              <h3 className="text-[21px] font-semibold tracking-[-0.02em]">{plan.label}</h3>
              <p className={cn("mt-2 min-h-[42px] text-[14px] leading-[1.5]", plan.featured ? "text-white/60" : "text-[#6e6e73] dark:text-[#a1a1a6]")}>
                {plan.copy}
              </p>
              <div className="mt-8 flex items-baseline gap-1.5">
                <SwitchingText
                  cycle={activeCycle}
                  monthly={plan.monthly}
                  yearly={plan.yearly}
                  delay={index * 0.04}
                  className="text-[44px] font-semibold leading-none tracking-[-0.035em] tabular-nums"
                />
                {!(plan.hidePeriod ?? plan.monthly === "Custom") ? (
                  <SwitchingText
                    cycle={activeCycle}
                    monthly={plan.periodMonthly}
                    yearly={plan.periodYearly}
                    delay={index * 0.04 + 0.03}
                    className={cn("text-[14px]", plan.featured ? "text-white/50" : "text-[#6e6e73] dark:text-[#a1a1a6]")}
                  />
                ) : null}
              </div>
              <motion.button
                type="button"
                whileTap={{ scale: 0.97 }}
                className={cn(
                  "mt-7",
                  plan.featured
                    ? primaryButtonClass(accented)
                    : cn(secondaryButton, "bg-white hover:bg-white/70 dark:bg-[#2c2c2e]", accented && ACCENT_FOCUS),
                )}
              >
                {plan.action}
              </motion.button>
              <div className={cn("my-7 border-t", plan.featured ? "border-white/[0.12]" : "border-black/[0.08] dark:border-white/[0.1]")} />
              {featuresHeading ? (
                <p className={cn("mb-3 text-[13px] font-semibold", plan.featured ? "text-white/60" : "text-[#6e6e73] dark:text-[#a1a1a6]")}>
                  {featuresHeading}
                </p>
              ) : null}
              <ul className="space-y-2.5">
                {plan.features.slice(0, 12).map((feature, i) => (
                  <FeatureItem key={`${i}-${feature}`} pale={plan.featured} accented={accented}>
                    {feature}
                  </FeatureItem>
                ))}
              </ul>
            </motion.article>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
