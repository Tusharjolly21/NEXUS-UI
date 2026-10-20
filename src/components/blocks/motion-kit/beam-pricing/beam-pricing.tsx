"use client";

import { useEffect, useId, useState, type CSSProperties } from "react";
import { AnimatePresence, LayoutGroup, motion, MotionConfig, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface BeamPricingPlan {
  name: string;
  blurb: string;
  /** Price per user per month on monthly billing. `null` shows "Custom". */
  monthly: number | null;
  /** Price per user per month on yearly billing. `null` shows "Custom". */
  yearly: number | null;
  features: string[];
  cta: string;
  /** Gets the dark card, the badge and the light beam. */
  featured?: boolean;
}

export type BeamPricingBilling = "monthly" | "yearly";

export interface BeamPricingProps {
  plans?: BeamPricingPlan[];
  eyebrow?: string;
  title?: string;
  /** Badge on the yearly option. */
  yearlyBadge?: string;
  featuredBadge?: string;
  defaultBilling?: BeamPricingBilling;
  /** Called when a plan's button is pressed. Nothing is sent anywhere. */
  onSelectPlan?: (plan: BeamPricingPlan, billing: BeamPricingBilling) => void;
  /** Any CSS colour. Leave empty to use Apple blue, which brightens in dark mode. */
  accent?: string;
  /** Flips between monthly and yearly every few seconds until the viewer picks one. */
  autoplay?: boolean;
  className?: string;
}

export const DEFAULT_BEAM_PRICING_PLANS: BeamPricingPlan[] = [
  { name: "Starter", blurb: "For individuals getting organised.", monthly: 0, yearly: 0, features: ["3 dashboards", "7 days of history", "Email support"], cta: "Start free" },
  {
    name: "Team",
    blurb: "For teams that run on numbers.",
    monthly: 24,
    yearly: 19,
    features: ["Unlimited dashboards", "Full history", "Live sync, every app", "Priority support"],
    cta: "Start 14-day trial",
    featured: true,
  },
  {
    name: "Enterprise",
    blurb: "For orgs with more to manage.",
    monthly: null,
    yearly: null,
    features: ["SSO and SCIM", "Audit logs", "Custom contracts", "Dedicated success manager"],
    cta: "Talk to sales",
  },
];

function Price({ value, featured }: { value: number | null; featured: boolean }) {
  const ink = featured ? "text-white" : "text-[#1d1d1f] dark:text-[#f5f5f7]";
  if (value === null) {
    return <span className={cn("text-[clamp(38px,4vw,44px)] font-semibold tracking-[-0.045em]", ink)}>Custom</span>;
  }
  const digits = String(value).split("");
  return (
    <span className={cn("inline-flex items-baseline text-[clamp(44px,4.6vw,52px)] font-semibold leading-none tracking-[-0.05em]", ink)}>
      <span className="mr-0.5 text-[0.54em]">$</span>
      <span className="sr-only">{value}</span>
      <span aria-hidden="true" className="relative inline-flex overflow-hidden">
        <AnimatePresence mode="popLayout" initial={false}>
          {digits.map((d, i) => (
            <motion.span
              key={`${digits.length}-${i}-${d}`}
              className="inline-block tabular-nums"
              initial={{ y: "-110%", opacity: 0, filter: "blur(4px)" }}
              animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
              exit={{ y: "110%", opacity: 0, filter: "blur(4px)" }}
              transition={{ filter: { duration: 0.35 }, type: "spring", stiffness: 380, damping: 28, delay: i * 0.05 }}
            >
              {d}
            </motion.span>
          ))}
        </AnimatePresence>
      </span>
    </span>
  );
}

/**
 * Pricing with a billing toggle. Prices roll digit by digit when you switch, the saving badge pops
 * for yearly, and the featured plan has a beam of light running around its border.
 */
export function BeamPricing({
  plans = DEFAULT_BEAM_PRICING_PLANS,
  eyebrow = "Pricing",
  title = "Simple plans. Cancel any time.",
  yearlyBadge = "−20%",
  featuredBadge = "Most popular",
  defaultBilling = "yearly",
  onSelectPlan,
  accent,
  autoplay = false,
  className,
}: BeamPricingProps) {
  const groupId = useId();
  const reduce = useReducedMotion() ?? false;
  const [yearly, setYearly] = useState(defaultBilling === "yearly");
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (!autoplay || reduce || touched) return;
    const id = window.setInterval(() => setYearly((y) => !y), 3200);
    return () => window.clearInterval(id);
  }, [autoplay, reduce, touched]);

  const billing: BeamPricingBilling = yearly ? "yearly" : "monthly";
  const accentStyle = accent ? ({ "--mk-accent": accent, "--mk-accent-text": accent } as CSSProperties) : undefined;

  return (
    <MotionConfig reducedMotion="user">
      <LayoutGroup id={groupId}>
        <section
          style={accentStyle}
          className={cn(
            "@container w-full bg-white px-4 py-16 sm:px-5 sm:py-20 dark:bg-black",
            "[--mk-accent:#0071e3] [--mk-accent-text:#0071e3] dark:[--mk-accent:#0a84ff] dark:[--mk-accent-text:#2997ff]",
            className,
          )}
        >
          <div className="mx-auto max-w-[1120px]">
            <div className="flex flex-col items-center gap-4 text-center">
              <span className="text-[14px] font-semibold text-[var(--mk-accent-text)]">{eyebrow}</span>
              <h2 className="m-0 max-w-[700px] text-balance text-[clamp(32px,5vw,54px)] font-semibold leading-[1.04] tracking-[-0.04em] text-[#1d1d1f] dark:text-[#f5f5f7]">
                {title}
              </h2>
              <div
                className="mt-4 flex items-center rounded-full bg-[#f0f0f3] p-1 dark:bg-[#1c1c1e]"
                role="radiogroup"
                aria-label="Billing period"
              >
                {[false, true].map((v) => (
                  <button
                    key={String(v)}
                    type="button"
                    role="radio"
                    aria-checked={yearly === v}
                    onClick={() => {
                      setTouched(true);
                      setYearly(v);
                    }}
                    className={cn(
                      "relative flex h-10 items-center gap-2 rounded-full px-4 text-[14px] font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-[var(--mk-accent)] sm:px-5",
                      yearly === v ? "text-[#1d1d1f] dark:text-[#f5f5f7]" : "text-[#6e6e73] dark:text-[#a1a1a6]",
                    )}
                  >
                    {yearly === v && (
                      <motion.span
                        layoutId="pb-period"
                        className="absolute inset-0 rounded-full bg-white shadow-[0_2px_8px_rgba(0,0,0,.12)] dark:bg-[#3a3a3c] dark:shadow-none"
                        transition={{ type: "spring", stiffness: 500, damping: 34 }}
                      />
                    )}
                    <span className="relative">{v ? "Yearly" : "Monthly"}</span>
                    {v && (
                      <motion.span
                        className="relative rounded-full bg-[#248a3d] px-2 py-0.5 text-[11px] font-semibold text-white"
                        animate={{ scale: yearly ? [1, 1.2, 1] : 1 }}
                        transition={{ duration: 0.4 }}
                      >
                        {yearlyBadge}
                      </motion.span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="mx-auto mt-12 grid max-w-[460px] grid-cols-1 items-stretch gap-5 sm:mt-14 @3xl:max-w-none @3xl:grid-cols-3">
              {plans.map((p, i) => {
                const value = yearly ? p.yearly : p.monthly;
                const featured = Boolean(p.featured);
                const inner = (
                  <div
                    className={cn(
                      "flex h-full flex-col gap-6 rounded-[26.5px] p-6 sm:p-7",
                      featured ? "bg-[#1d1d1f] text-white dark:bg-[#2c2c2e]" : "bg-white text-[#1d1d1f] dark:bg-[#1c1c1e] dark:text-[#f5f5f7]",
                    )}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <h3 className={cn("m-0 text-[20px] font-semibold tracking-[-0.02em]", featured ? "text-white" : "text-[#1d1d1f] dark:text-[#f5f5f7]")}>
                        {p.name}
                      </h3>
                      {featured && (
                        <span className="rounded-full bg-[var(--mk-accent)] px-2.5 py-1 text-[11px] font-semibold text-white">{featuredBadge}</span>
                      )}
                    </div>
                    <span className={cn("text-[15px]", featured ? "text-[#a1a1a6]" : "text-[#6e6e73] dark:text-[#a1a1a6]")}>{p.blurb}</span>
                    <div className="flex flex-wrap items-baseline gap-1.5">
                      <Price value={value} featured={featured} />
                      {value !== null && <span className="text-[15px] text-[#86868b] dark:text-[#a1a1a6]">/ user / mo</span>}
                    </div>
                    <ul className="m-0 flex list-none flex-col gap-3 p-0">
                      {p.features.map((f, k) => (
                        <motion.li
                          key={f}
                          initial={{ opacity: 0, x: -8 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: 0.2 + k * 0.06 }}
                          className="flex items-center gap-2.5 text-[15px]"
                        >
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke={featured ? "#5ac8fa" : "var(--mk-accent)"}
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                            className="flex-none"
                          >
                            <path d="M5 12.5l4.5 4.5L19 7.5" />
                          </svg>
                          {f}
                        </motion.li>
                      ))}
                    </ul>
                    <motion.button
                      type="button"
                      onClick={() => onSelectPlan?.(p, billing)}
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.97 }}
                      className={cn(
                        "mt-auto flex h-12 items-center justify-center rounded-full text-[15px] font-medium outline-none focus-visible:ring-2 focus-visible:ring-[var(--mk-accent)] focus-visible:ring-offset-2",
                        featured
                          ? "bg-white text-[#1d1d1f] focus-visible:ring-offset-[#1d1d1f] dark:bg-[#f5f5f7] dark:focus-visible:ring-offset-[#2c2c2e]"
                          : "bg-[#f0f0f3] text-[#1d1d1f] hover:bg-[#e8e8ed] dark:bg-[#2c2c2e] dark:text-[#f5f5f7] dark:hover:bg-[#3a3a3c] dark:focus-visible:ring-offset-[#1c1c1e]",
                      )}
                    >
                      {p.cta}
                    </motion.button>
                  </div>
                );
                return (
                  <motion.div
                    key={p.name}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ type: "spring", stiffness: 140, damping: 20, delay: i * 0.08 }}
                    whileHover={{ y: -6 }}
                    className="relative"
                  >
                    {featured ? (
                      <div
                        className="relative h-full overflow-hidden rounded-[28px] p-[1.5px]"
                        style={{ boxShadow: "0 40px 80px -40px var(--mk-accent)" }}
                      >
                        <motion.div
                          aria-hidden="true"
                          className="absolute left-1/2 top-1/2 h-[200%] w-[200%] -translate-x-1/2 -translate-y-1/2"
                          style={{
                            background:
                              "conic-gradient(from 0deg, transparent 0 70%, var(--mk-accent) 80%, #5ac8fa 88%, transparent 96%)",
                          }}
                          animate={reduce ? undefined : { rotate: 360 }}
                          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                        />
                        <div className="relative h-full">{inner}</div>
                      </div>
                    ) : (
                      <div className="h-full rounded-[28px] p-[1.5px] shadow-[0_0_0_1px_rgba(0,0,0,.08)] dark:shadow-[0_0_0_1px_rgba(255,255,255,.1)]">
                        {inner}
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>
      </LayoutGroup>
    </MotionConfig>
  );
}
