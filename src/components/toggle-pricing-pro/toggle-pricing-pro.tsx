"use client";
import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { AnimatePresence, motion, useReducedMotion, useSpring, useTransform, useVelocity } from "framer-motion";

export type Billing = "monthly" | "annual";

export type PricingPlan = {
  id: string;
  name: string;
  /** Price per month when billed monthly. */
  monthly: number;
  /** Price per month when billed yearly. */
  annual: number;
  description?: string;
  /** Up to four short lines; extras are ignored on narrow layouts. */
  features?: string[];
  /** Button text. Defaults to "Choose {name}". */
  cta?: string;
  /** Highlights the plan with a ring, a badge and a filled button. */
  featured?: boolean;
};

export type PricingToggleProps = {
  plans?: PricingPlan[];
  defaultBilling?: Billing;
  /** Called when the user flips between monthly and yearly. */
  onBillingChange?: (billing: Billing) => void;
  /** Called when a plan's button is pressed. */
  onSelect?: (planId: string, billing: Billing) => void;
  /** Currency symbol before the price. */
  currency?: string;
  /** Badge next to "Yearly". Defaults to the best saving across plans, e.g. "Save 25%". */
  savingsLabel?: string;
  /** Flips the billing period every 2.6s until someone touches the component. */
  autoplay?: boolean;
  className?: string;
};

export const DEFAULT_PRICING_PLANS: PricingPlan[] = [
  { id: "starter", name: "Starter", monthly: 9, annual: 7, description: "For side projects.", features: ["3 projects", "Community support", "Basic analytics"] },
  { id: "pro", name: "Pro", monthly: 39, annual: 29, description: "For growing teams.", features: ["Unlimited projects", "Priority support", "Advanced analytics"], featured: true },
  { id: "scale", name: "Scale", monthly: 119, annual: 89, description: "For companies at scale.", features: ["SSO and audit logs", "Dedicated manager", "99.99% SLA"] },
];

/** Wheel slots: 0-9, then 10 = blank for a leading digit that isn't there. */
const SLOTS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

function Price({ value, width, still }: { value: number; width: number; still: boolean }) {
  const digits = String(Math.max(0, Math.round(value))).padStart(width, " ").split("");
  return (
    <span className="inline-flex" aria-hidden="true">
      {digits.map((ch, i) => {
        const pos = ch === " " ? 10 : Number(ch);
        return (
          <span key={i} className="relative inline-block h-[1em] overflow-hidden" style={{ width: ch === " " ? undefined : "0.6em" }}>
            {ch === " " ? null : (
              <motion.span
                className="absolute inset-x-0 top-0 flex flex-col items-center"
                initial={false}
                animate={{ y: `${-pos}em` }}
                transition={still ? { duration: 0 } : { type: "spring", stiffness: 170, damping: 14, mass: 0.8, delay: (digits.length - 1 - i) * 0.05 }}
              >
                {SLOTS.map((d) => (
                  <span key={d} className="block h-[1em] leading-none">
                    {d === 10 ? " " : d}
                  </span>
                ))}
              </motion.span>
            )}
          </span>
        );
      })}
    </span>
  );
}

function Check() {
  return (
    <svg viewBox="0 0 12 12" className="mt-[3px] size-3 shrink-0 text-[#30d158]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M2.5 6.3l2.3 2.2 4.7-5" />
    </svg>
  );
}

/**
 * Pricing cards with a monthly/yearly switch. The knob squashes and
 * stretches with its own speed as it slides, the saving badge pops in, and
 * every price rolls digit by digit to its new figure with a small overshoot.
 */
export function PricingToggle({
  plans = DEFAULT_PRICING_PLANS,
  defaultBilling = "annual",
  onBillingChange,
  onSelect,
  currency = "$",
  savingsLabel,
  autoplay = false,
  className = "",
}: PricingToggleProps) {
  const reduce = useReducedMotion() === true;
  const [billing, setBilling] = useState<Billing>(defaultBilling);
  const annual = billing === "annual";
  const touched = useRef(false);
  const opts = useRef<(HTMLButtonElement | null)[]>([]);

  // Knob: a spring on x, squashed and stretched by its own velocity.
  const x = useSpring(annual ? 1 : 0, { stiffness: 420, damping: 26 });
  const vx = useVelocity(x);
  const left = useTransform(x, (v) => `calc(${v * 50}% + 4px)`);
  const stretch = useTransform(vx, (v) => (reduce ? 1 : 1 + Math.min(0.35, Math.abs(v) * 0.05)));
  const squash = useTransform(stretch, (s) => 1 / Math.sqrt(s));

  useEffect(() => {
    if (reduce) x.jump(annual ? 1 : 0);
    else x.set(annual ? 1 : 0);
  }, [annual, reduce, x]);

  useEffect(() => {
    if (!autoplay) return;
    const t = window.setInterval(() => {
      if (touched.current) {
        window.clearInterval(t);
        return;
      }
      setBilling((b) => (b === "annual" ? "monthly" : "annual"));
    }, 2600);
    return () => window.clearInterval(t);
  }, [autoplay]);

  const choose = (b: Billing) => {
    touched.current = true;
    if (b === billing) return;
    setBilling(b);
    onBillingChange?.(b);
  };

  const key = (e: KeyboardEvent) => {
    if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.key)) return;
    e.preventDefault();
    const next = annual ? "monthly" : "annual";
    choose(next);
    opts.current[next === "annual" ? 1 : 0]?.focus();
  };

  const best = plans.reduce((m, p) => (p.monthly > 0 ? Math.max(m, 1 - p.annual / p.monthly) : m), 0);
  const badge = savingsLabel ?? (best > 0 ? `Save ${Math.round(best * 100)}%` : "");
  const width = Math.max(1, ...plans.map((p) => String(Math.round(Math.max(p.monthly, p.annual))).length));

  return (
    <div
      onPointerDown={() => {
        touched.current = true;
      }}
      className={`@container w-full text-[#1d1d1f] dark:text-[#f5f5f7] ${className}`}
    >
      <div className="flex justify-center">
        <div role="radiogroup" aria-label="Billing period" onKeyDown={key} className="relative grid h-10 w-[248px] grid-cols-2 rounded-full bg-[#e8e8ed] p-1 dark:bg-[#2c2c2e]">
          <motion.span
            aria-hidden="true"
            className="absolute top-1 h-8 w-[calc(50%-4px)] rounded-full bg-white shadow-[0_1px_3px_rgba(0,0,0,.14),0_4px_10px_-4px_rgba(0,0,0,.2)] dark:bg-[#636366]"
            style={{ left, scaleX: stretch, scaleY: squash }}
          />
          {(["monthly", "annual"] as const).map((b, i) => {
            const on = billing === b;
            return (
              <button
                key={b}
                ref={(el) => {
                  opts.current[i] = el;
                }}
                type="button"
                role="radio"
                aria-checked={on}
                tabIndex={on ? 0 : -1}
                onClick={() => choose(b)}
                className={`relative z-10 flex items-center justify-center gap-1.5 rounded-full text-[13px] font-semibold outline-none transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#0071e3] dark:focus-visible:outline-[#0a84ff] ${
                  on ? "" : "text-[#6e6e73] hover:text-[#1d1d1f] dark:text-[#a1a1a6] dark:hover:text-[#f5f5f7]"
                }`}
              >
                {b === "monthly" ? "Monthly" : "Yearly"}
                {b === "annual" && badge ? (
                  <motion.span
                    className="rounded-full bg-[#30d158] px-1.5 py-px text-[10px] font-bold text-[#06281b]"
                    initial={false}
                    animate={annual ? { scale: 1, opacity: 1 } : { scale: 0.86, opacity: 0.45 }}
                    transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 500, damping: 12 }}
                  >
                    {badge}
                  </motion.span>
                ) : null}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-2.5 @min-[540px]:grid-cols-3 @min-[540px]:gap-3">
        {plans.map((p) => {
          const price = annual ? p.annual : p.monthly;
          const yearly = p.annual * 12;
          return (
            <motion.div
              key={p.id}
              whileHover={reduce ? undefined : { y: -3 }}
              transition={{ type: "spring", stiffness: 400, damping: 24 }}
              className={`relative flex items-center gap-3 rounded-[22px] bg-white p-4 @min-[540px]:flex-col @min-[540px]:items-stretch @min-[540px]:p-5 dark:bg-[#1c1c1e] ${
                p.featured
                  ? "shadow-[0_0_0_2px_#0071e3,0_24px_44px_-24px_rgba(0,113,227,.55)] dark:shadow-[0_0_0_2px_#0a84ff,0_24px_44px_-24px_rgba(0,0,0,.9)]"
                  : "shadow-[0_0_0_1px_rgba(0,0,0,.05),0_20px_40px_-26px_rgba(0,0,0,.35)] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08),0_20px_40px_-26px_rgba(0,0,0,.9)]"
              }`}
            >
              <div className="min-w-0 flex-1 @min-[540px]:flex-none">
                <div className="flex items-center gap-2">
                  <h3 className="text-[15px] font-semibold tracking-[-0.01em]">{p.name}</h3>
                  {p.featured ? <span className="rounded-full bg-[#0071e3] px-2 py-0.5 text-[10px] font-semibold text-white dark:bg-[#0a84ff]">Popular</span> : null}
                </div>
                {p.description ? <p className="mt-0.5 text-[12px] text-[#6e6e73] dark:text-[#a1a1a6]">{p.description}</p> : null}
              </div>
              <div className="text-right @min-[540px]:mt-4 @min-[540px]:text-left">
                <p className="flex items-start justify-end font-semibold tracking-[-0.04em] tabular-nums @min-[540px]:justify-start">
                  <span className="sr-only">
                    {currency}
                    {price} per month, {annual ? `billed yearly at ${currency}${yearly}` : "billed monthly"}
                  </span>
                  <span aria-hidden="true" className="mr-0.5 mt-1 text-[16px] text-[#6e6e73] dark:text-[#a1a1a6]">
                    {currency}
                  </span>
                  <span className="text-[34px] leading-none @min-[540px]:text-[40px]">
                    <Price value={price} width={width} still={reduce} />
                  </span>
                  <span aria-hidden="true" className="ml-1 self-end pb-1 text-[12px] font-medium tracking-normal text-[#6e6e73] dark:text-[#a1a1a6]">
                    /mo
                  </span>
                </p>
                <span className="relative mt-1 block h-4 overflow-hidden text-[11px] text-[#6e6e73] dark:text-[#a1a1a6]" aria-hidden="true">
                  <AnimatePresence mode="popLayout" initial={false}>
                    <motion.span
                      key={billing}
                      className="block"
                      initial={reduce ? false : { y: annual ? 14 : -14, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={reduce ? undefined : { y: annual ? -14 : 14, opacity: 0 }}
                      transition={{ type: "spring", stiffness: 420, damping: 30 }}
                    >
                      {annual ? `${currency}${yearly.toLocaleString("en-US")} billed yearly` : "Billed monthly"}
                    </motion.span>
                  </AnimatePresence>
                </span>
              </div>
              {p.features?.length ? (
                <ul className="mb-5 mt-4 hidden flex-col gap-1.5 text-[12px] @min-[540px]:flex">
                  {p.features.slice(0, 4).map((f) => (
                    <li key={f} className="flex gap-1.5">
                      <Check />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              ) : null}
              <button
                type="button"
                aria-label={p.cta ?? `Choose ${p.name}`}
                onClick={() => {
                  touched.current = true;
                  onSelect?.(p.id, billing);
                }}
                className={`grid size-9 shrink-0 place-items-center rounded-full text-[13px] font-semibold outline-none transition-[transform,background-color] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0071e3] active:scale-[.97] @min-[540px]:mt-auto @min-[540px]:flex @min-[540px]:h-9 @min-[540px]:w-full @min-[540px]:items-center @min-[540px]:justify-center dark:focus-visible:outline-[#0a84ff] ${
                  p.featured ? "bg-[#0071e3] text-white hover:bg-[#0077ed] dark:bg-[#0a84ff]" : "bg-[#f0f0f3] text-[#1d1d1f] hover:bg-[#e8e8ed] dark:bg-[#2c2c2e] dark:text-[#f5f5f7] dark:hover:bg-[#3a3a3c]"
                }`}
              >
                <span aria-hidden="true" className="hidden @min-[540px]:inline">
                  {p.cta ?? `Choose ${p.name}`}
                </span>
                <svg viewBox="0 0 12 12" className="size-3 @min-[540px]:hidden" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M4.5 2.5L8 6l-3.5 3.5" />
                </svg>
              </button>
            </motion.div>
          );
        })}
      </div>
      <p className="mt-3 text-center text-[12px] text-[#86868b] dark:text-[#a1a1a6]">Flip the switch; every price rolls to its new figure.</p>
    </div>
  );
}
