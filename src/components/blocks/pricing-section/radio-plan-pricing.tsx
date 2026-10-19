"use client";

import * as React from "react";
import {
  AnimatePresence,
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
  type Transition,
  type Variants,
} from "framer-motion";
import { Check, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

export type PricingTheme = "ivory" | "slate" | "midnight" | "ember" | "custom";
export type PricingLayout = "responsive" | "desktop" | "mobile";
export type PricingTransitionSpeed = "slow" | "medium" | "fast";

export type PricingPlan = {
  id: string;
  label: string;
  subtitle?: string;
  price: number;
  period?: string;
  badge?: string;
  ctaLabel?: string;
  ctaHref?: string;
  includedFeatureCount: number;
};

export type RadioPlanPricingProps = {
  plans?: PricingPlan[];
  features?: string[];
  featuresTitle?: string;
  featuresSubtitle?: string;
  plansTitle?: string;
  plansSubtitle?: string;
  currency?: string;
  defaultSelectedPlan?: string;
  layout?: PricingLayout;
  /**
   * `ivory` (default) follows the page: light, or dark under a `.dark` ancestor.
   * `slate` is always light, `midnight` always dark, `ember` dark with an orange accent,
   * and `custom` starts from `ivory` and takes the colour props below.
   */
  theme?: PricingTheme;
  backgroundColor?: string;
  cardBackgroundColor?: string;
  primaryTextColor?: string;
  secondaryTextColor?: string;
  accentColor?: string;
  ctaTextColor?: string;
  outerRadius?: number;
  optionRadius?: number;
  padding?: number;
  shadowIntensity?: number;
  showBorder?: boolean;
  transitionSpeed?: PricingTransitionSpeed;
  priceAnimationDuration?: number;
  headingFontFamily?: string;
  priceFontFamily?: string;
  bodyFontFamily?: string;
  showCTA?: boolean;
  showPlanBadges?: boolean;
  className?: string;
};

type Palette = {
  page: string;
  background: string;
  card: string;
  selected: string;
  primary: string;
  secondary: string;
  accent: string;
  ctaText: string;
  border: string;
};

/** Fixed palettes. `ivory` is not here: it is the adaptive light/dark palette set with classes below. */
const FIXED_PALETTES: Record<"slate" | "midnight" | "ember", Palette> = {
  slate: {
    page: "#f5f5f7",
    background: "#ffffff",
    card: "#f5f5f7",
    selected: "#ffffff",
    primary: "#1d1d1f",
    secondary: "#6e6e73",
    accent: "#0071e3",
    ctaText: "#ffffff",
    border: "rgba(0,0,0,0.08)",
  },
  midnight: {
    page: "#000000",
    background: "#1c1c1e",
    card: "#2c2c2e",
    selected: "#2c2c2e",
    primary: "#f5f5f7",
    secondary: "#a1a1a6",
    accent: "#0071e3",
    ctaText: "#ffffff",
    border: "rgba(255,255,255,0.1)",
  },
  ember: {
    page: "#000000",
    background: "#1c1c1e",
    card: "#2c2c2e",
    selected: "#2c2c2e",
    primary: "#f5f5f7",
    secondary: "#a1a1a6",
    accent: "#ff9500",
    ctaText: "#1d1d1f",
    border: "rgba(255,255,255,0.1)",
  },
};

/** Adaptive palette: Apple light by default, Apple dark under `.dark`. */
const ADAPTIVE_VARS = cn(
  "[--rp-page:#f5f5f7] [--rp-bg:#ffffff] [--rp-card:#f5f5f7] [--rp-sel:#ffffff] [--rp-ink:#1d1d1f] [--rp-sub:#6e6e73]",
  "[--rp-accent:#0071e3] [--rp-cta:#ffffff] [--rp-line:rgba(0,0,0,0.08)]",
  "dark:[--rp-page:#000000] dark:[--rp-bg:#1c1c1e] dark:[--rp-card:#2c2c2e] dark:[--rp-sel:#2c2c2e]",
  "dark:[--rp-ink:#f5f5f7] dark:[--rp-sub:#a1a1a6] dark:[--rp-line:rgba(255,255,255,0.1)]",
);

const VAR_NAMES: Record<keyof Palette, string> = {
  page: "--rp-page",
  background: "--rp-bg",
  card: "--rp-card",
  selected: "--rp-sel",
  primary: "--rp-ink",
  secondary: "--rp-sub",
  accent: "--rp-accent",
  ctaText: "--rp-cta",
  border: "--rp-line",
};

function paletteVars(palette: Partial<Palette>) {
  const vars: Record<string, string> = {};
  (Object.keys(VAR_NAMES) as (keyof Palette)[]).forEach((key) => {
    const value = palette[key];
    if (value) vars[VAR_NAMES[key]] = value;
  });
  return vars as React.CSSProperties;
}

export const DEFAULT_PRICING_FEATURES = [
  "A finance advisor on call",
  "Unlimited auto tracking",
  "Next-day transaction clearing",
  "Priority customer support",
  "Two-person approval on payouts",
  "24/7 technical support",
  "Unlimited team accounts",
  "Custom API access",
];

export const DEFAULT_PRICING_PLANS: PricingPlan[] = [
  {
    id: "monthly",
    label: "Monthly",
    subtitle: "Flexible billing",
    price: 10.59,
    period: "/mo",
    includedFeatureCount: 5,
    ctaLabel: "Start monthly",
    ctaHref: "#",
  },
  {
    id: "yearly",
    label: "Yearly",
    subtitle: "Best value",
    price: 8.59,
    period: "/mo",
    badge: "Save 19%",
    includedFeatureCount: 7,
    ctaLabel: "Start yearly",
    ctaHref: "#",
  },
  {
    id: "lifetime",
    label: "Lifetime",
    subtitle: "Pay once, keep it",
    price: 90.59,
    period: "one-time",
    includedFeatureCount: 8,
    ctaLabel: "Get lifetime access",
    ctaHref: "#",
  },
];

const SPRINGS: Record<PricingTransitionSpeed, Transition> = {
  slow: { type: "spring", stiffness: 220, damping: 30 },
  medium: { type: "spring", stiffness: 380, damping: 32 },
  fast: { type: "spring", stiffness: 500, damping: 36 },
};

const focusRing = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0071e3]";

/** The selected plan's price, counting from the previous price to the new one on a spring. */
function RollingPrice({
  value,
  currency,
  duration,
  fontFamily,
}: {
  value: number;
  currency: string;
  duration: number;
  fontFamily?: string;
}) {
  const reduce = useReducedMotion();
  const counter = useMotionValue(value);
  const whole = useTransform(counter, (v) => Math.max(0, v).toFixed(2).split(".")[0]);
  const decimals = useTransform(counter, (v) => Math.max(0, v).toFixed(2).split(".")[1]);

  React.useEffect(() => {
    if (reduce || duration <= 0) {
      counter.set(value);
      return;
    }
    const controls = animate(counter, value, { type: "spring", duration, bounce: 0 });
    return () => controls.stop();
  }, [counter, duration, reduce, value]);

  return (
    <span className="inline-flex items-baseline tabular-nums" style={{ fontFamily }}>
      <span className="sr-only">
        {currency}
        {value.toFixed(2)}
      </span>
      <span aria-hidden className="inline-flex items-baseline">
        <span className="mr-0.5 text-[22px] font-semibold text-[var(--rp-sub)]">{currency}</span>
        <motion.span className="text-[44px] font-semibold leading-none tracking-[-0.035em]">{whole}</motion.span>
        <motion.span className="text-[22px] font-semibold tracking-[-0.02em]">
          <span>.</span>
          <motion.span>{decimals}</motion.span>
        </motion.span>
      </span>
    </span>
  );
}

function formatPrice(price: number, currency: string) {
  return `${currency}${price.toFixed(2)}`;
}

export function RadioPlanPricing({
  plans = DEFAULT_PRICING_PLANS,
  features = DEFAULT_PRICING_FEATURES,
  featuresTitle = "What's included",
  featuresSubtitle = "Pick a plan to see what it unlocks.",
  plansTitle = "How you pay",
  plansSubtitle = "Same product on every plan. Yearly saves you 19%.",
  currency = "$",
  defaultSelectedPlan = "monthly",
  layout = "responsive",
  theme = "ivory",
  backgroundColor,
  cardBackgroundColor,
  primaryTextColor,
  secondaryTextColor,
  accentColor,
  ctaTextColor,
  outerRadius = 28,
  optionRadius = 18,
  padding = 36,
  shadowIntensity = 0.14,
  showBorder = true,
  transitionSpeed = "medium",
  priceAnimationDuration = 0.7,
  headingFontFamily,
  priceFontFamily,
  bodyFontFamily,
  showCTA = true,
  showPlanBadges = true,
  className,
}: RadioPlanPricingProps) {
  const reduce = useReducedMotion();
  const uid = React.useId();
  const visiblePlans = plans.slice(0, 6);
  const visibleFeatures = features.slice(0, 12);
  const firstPlanId = visiblePlans[0]?.id ?? "";
  const initialPlanId = visiblePlans.some((plan) => plan.id === defaultSelectedPlan)
    ? defaultSelectedPlan
    : firstPlanId;
  const [selectedId, setSelectedId] = React.useState(initialPlanId);
  const selectedPlan = visiblePlans.find((plan) => plan.id === selectedId) ?? visiblePlans[0];
  const spring = SPRINGS[transitionSpeed];
  const includedCount = Math.min(selectedPlan?.includedFeatureCount ?? 0, visibleFeatures.length);

  const themeVars =
    theme === "custom"
      ? paletteVars({
          background: backgroundColor,
          card: cardBackgroundColor,
          selected: cardBackgroundColor,
          primary: primaryTextColor,
          secondary: secondaryTextColor,
          accent: accentColor,
          ctaText: ctaTextColor,
        })
      : theme === "ivory"
        ? {}
        : paletteVars(FIXED_PALETTES[theme]);

  const shadowAlpha = Math.max(0, Math.min(0.6, shadowIntensity * 2));
  const panelShadow = [
    showBorder ? "0 0 0 1px var(--rp-line)" : null,
    `0 1px 2px rgba(0,0,0,${(shadowAlpha * 0.15).toFixed(3)})`,
    `0 30px 60px -30px rgba(0,0,0,${shadowAlpha.toFixed(3)})`,
  ]
    .filter(Boolean)
    .join(", ");

  const container: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: reduce ? 0 : 0.06, delayChildren: 0.05 } },
  };
  const item: Variants = reduce
    ? { hidden: { opacity: 0 }, show: { opacity: 1, transition: { duration: 0.2 } } }
    : {
        hidden: { opacity: 0, y: 16, filter: "blur(6px)" },
        show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { type: "spring", stiffness: 260, damping: 30 } },
      };

  if (!selectedPlan) return null;

  const padStyle = { padding: `clamp(20px, 3vw, ${padding}px)` };

  return (
    <section
      className={cn(
        ADAPTIVE_VARS,
        "flex h-full min-h-[550px] w-full items-center justify-center overflow-hidden bg-[var(--rp-page)] p-3 text-[var(--rp-ink)] sm:p-6",
        className,
      )}
      style={{ ...themeVars, fontFamily: bodyFontFamily }}
    >
      <motion.div
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-80px" }}
        className={cn(
          "grid w-full max-w-[1320px] overflow-hidden bg-[var(--rp-bg)]",
          layout === "desktop" && "grid-cols-[0.92fr_1.08fr]",
          layout === "mobile" && "grid-cols-1",
          layout === "responsive" && "grid-cols-1 lg:grid-cols-[0.92fr_1.08fr]",
        )}
        style={{ borderRadius: outerRadius, boxShadow: panelShadow }}
      >
        {/* Features */}
        <div
          className={cn(
            "flex min-w-0 flex-col border-[var(--rp-line)]",
            layout === "mobile" && "order-2 border-t",
            layout === "desktop" && "border-r",
            layout === "responsive" && "order-2 border-t lg:order-1 lg:border-r lg:border-t-0",
          )}
          style={padStyle}
        >
          <motion.div variants={item}>
            <PanelHeader title={featuresTitle} subtitle={featuresSubtitle} fontFamily={headingFontFamily} />
          </motion.div>

          <motion.ul variants={item} className="mt-6 grid flex-1 content-start gap-1 sm:mt-7">
            {visibleFeatures.map((feature, index) => {
              const included = index < includedCount;
              const cascade = reduce ? { duration: 0.15 } : { ...spring, delay: index * 0.025 };

              return (
                <li key={feature} className="flex min-w-0 items-center gap-3 py-[7px]">
                  <span className="relative grid size-[22px] shrink-0 place-items-center">
                    <AnimatePresence mode="popLayout" initial={false}>
                      <motion.span
                        key={included ? "on" : "off"}
                        initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.5 }}
                        transition={cascade}
                        className={cn(
                          "grid size-[22px] place-items-center rounded-full",
                          included ? "bg-[var(--rp-accent)] text-[var(--rp-cta)]" : "bg-[var(--rp-card)] text-[var(--rp-sub)]",
                        )}
                      >
                        {included ? (
                          <Check className="size-3.5" strokeWidth={2.5} aria-hidden />
                        ) : (
                          <Minus className="size-3.5" strokeWidth={2.25} aria-hidden />
                        )}
                      </motion.span>
                    </AnimatePresence>
                  </span>
                  <motion.span
                    animate={{ opacity: included ? 1 : 0.5 }}
                    transition={cascade}
                    className="min-w-0 truncate text-[15px] leading-[1.45] sm:text-[16px]"
                  >
                    {feature}
                    <span className="sr-only">{included ? " (included)" : " (not included)"}</span>
                  </motion.span>
                </li>
              );
            })}
          </motion.ul>

          <motion.div variants={item} className="mt-6">
            <div className="flex items-baseline justify-between text-[13px] text-[var(--rp-sub)]">
              <span>
                <span className="relative inline-flex overflow-hidden align-bottom font-semibold text-[var(--rp-ink)] tabular-nums">
                  <AnimatePresence mode="popLayout" initial={false}>
                    <motion.span
                      key={includedCount}
                      initial={reduce ? { opacity: 0 } : { opacity: 0, y: "100%", filter: "blur(4px)" }}
                      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                      exit={reduce ? { opacity: 0 } : { opacity: 0, y: "-100%", filter: "blur(4px)" }}
                      transition={spring}
                      className="inline-block"
                    >
                      {includedCount}
                    </motion.span>
                  </AnimatePresence>
                </span>{" "}
                of {visibleFeatures.length} features included
              </span>
            </div>
            <div className="mt-2.5 h-1 overflow-hidden rounded-full bg-[var(--rp-card)]">
              <motion.div
                className="h-full rounded-full bg-[var(--rp-accent)]"
                initial={false}
                animate={{ width: `${visibleFeatures.length ? (includedCount / visibleFeatures.length) * 100 : 0}%` }}
                transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 200, damping: 30 }}
              />
            </div>
          </motion.div>
        </div>

        {/* Plans */}
        <div
          className={cn(
            "flex min-w-0 flex-col",
            layout === "mobile" && "order-1",
            layout === "responsive" && "order-1 lg:order-2",
          )}
          style={padStyle}
        >
          <motion.div variants={item}>
            <PanelHeader title={plansTitle} subtitle={plansSubtitle} fontFamily={headingFontFamily} />
          </motion.div>

          <motion.fieldset variants={item} className="mt-6 grid flex-1 content-start gap-3 sm:mt-7">
            <legend className="sr-only">Select your pricing plan</legend>
            {visiblePlans.map((plan) => {
              const selected = plan.id === selectedPlan.id;

              return (
                <motion.label
                  key={plan.id}
                  whileTap={reduce ? undefined : { scale: 0.985 }}
                  transition={spring}
                  className={cn(
                    "relative flex cursor-pointer items-center gap-4 px-4 py-4 transition-colors duration-200 sm:px-5 sm:py-[18px]",
                    "has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-[#0071e3]",
                    selected ? "bg-[var(--rp-sel)]" : "bg-[var(--rp-card)] hover:brightness-[0.98] dark:hover:brightness-110",
                  )}
                  style={{
                    borderRadius: optionRadius,
                    boxShadow: selected
                      ? "0 2px 6px rgba(0,0,0,0.06), 0 12px 24px -12px rgba(0,0,0,0.18)"
                      : "inset 0 0 0 1px var(--rp-line)",
                  }}
                >
                  {selected ? (
                    <motion.span
                      layoutId={`${uid}-ring`}
                      aria-hidden
                      className="pointer-events-none absolute inset-0"
                      style={{ borderRadius: optionRadius, boxShadow: "inset 0 0 0 2px var(--rp-accent)" }}
                      transition={reduce ? { duration: 0 } : spring}
                    />
                  ) : null}
                  <input
                    type="radio"
                    name={`${uid}-plan`}
                    value={plan.id}
                    checked={selected}
                    onChange={() => setSelectedId(plan.id)}
                    className="sr-only"
                  />
                  <span
                    aria-hidden
                    className={cn(
                      "relative grid size-[22px] shrink-0 place-items-center rounded-full transition-[background-color,box-shadow] duration-200",
                      selected ? "bg-[var(--rp-accent)]" : "bg-[var(--rp-bg)] shadow-[inset_0_0_0_1.5px_var(--rp-line)]",
                    )}
                  >
                    <motion.span
                      className="size-2 rounded-full bg-[var(--rp-cta)]"
                      initial={false}
                      animate={{ scale: selected ? 1 : 0, opacity: selected ? 1 : 0 }}
                      transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 500, damping: 30 }}
                    />
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      <span className="text-[17px] font-semibold tracking-[-0.015em]">{plan.label}</span>
                      {showPlanBadges && plan.badge ? (
                        <span className="rounded-full bg-[color-mix(in_srgb,var(--rp-accent)_12%,transparent)] px-2 py-0.5 text-[12px] font-semibold text-[var(--rp-accent)]">
                          {plan.badge}
                        </span>
                      ) : null}
                    </span>
                    {plan.subtitle ? (
                      <span className="mt-0.5 block truncate text-[14px] text-[var(--rp-sub)]">{plan.subtitle}</span>
                    ) : null}
                  </span>

                  <span className="shrink-0 text-right">
                    <span
                      className="block text-[17px] font-semibold tracking-[-0.015em] tabular-nums"
                      style={{ fontFamily: priceFontFamily }}
                    >
                      {formatPrice(plan.price, currency)}
                    </span>
                    {plan.period ? (
                      <span className="block text-[13px] text-[var(--rp-sub)]">
                        {plan.period}
                      </span>
                    ) : null}
                  </span>
                </motion.label>
              );
            })}
          </motion.fieldset>

          <motion.div
            variants={item}
            className="mt-6 flex flex-col gap-4 border-t border-[var(--rp-line)] pt-6 sm:flex-row sm:items-end sm:justify-between"
          >
            <div className="min-w-0">
              <p className="text-[13px] text-[var(--rp-sub)]">
                {selectedPlan.label}
                {selectedPlan.period ? ` · ${selectedPlan.period}` : ""}
              </p>
              <div className="mt-1" aria-live="polite">
                <RollingPrice
                  value={selectedPlan.price}
                  currency={currency}
                  duration={priceAnimationDuration}
                  fontFamily={priceFontFamily}
                />
              </div>
            </div>

            {showCTA ? (
              <motion.a
                href={selectedPlan.ctaHref ?? "#"}
                whileTap={reduce ? undefined : { scale: 0.97 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                className={cn(
                  "relative inline-flex h-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[var(--rp-accent)] px-6 text-[17px] font-medium text-[var(--rp-cta)] transition-[filter] hover:brightness-110",
                  focusRing,
                )}
              >
                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.span
                    key={selectedPlan.id}
                    initial={reduce ? { opacity: 0 } : { opacity: 0, y: "100%", filter: "blur(6px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    exit={reduce ? { opacity: 0 } : { opacity: 0, y: "-100%", filter: "blur(6px)" }}
                    transition={spring}
                    className="inline-block whitespace-nowrap"
                  >
                    {selectedPlan.ctaLabel ?? "Get started"}
                  </motion.span>
                </AnimatePresence>
              </motion.a>
            ) : null}
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}

function PanelHeader({
  title,
  subtitle,
  fontFamily,
}: {
  title: string;
  subtitle: string;
  fontFamily?: string;
}) {
  return (
    <header>
      <h2
        className="text-[clamp(1.5rem,2.3vw,2rem)] font-semibold leading-[1.1] tracking-[-0.03em]"
        style={{ fontFamily }}
      >
        {title}
      </h2>
      <p className="mt-2 text-[15px] leading-[1.5] text-[var(--rp-sub)] sm:text-[17px]">{subtitle}</p>
    </header>
  );
}

export function RadioPlanPricingPreview() {
  // drawn at its real size; the gallery frames the `data-tile-focus` box into each tile
  return (
    <div className="relative flex h-[320px] w-full items-center justify-center overflow-hidden bg-[#f5f5f7] dark:bg-black">
      <div data-tile-focus className="w-[1080px] shrink-0">
        <RadioPlanPricing layout="desktop" padding={32} outerRadius={28} optionRadius={18} />
      </div>
    </div>
  );
}
