"use client";

import * as React from "react";
import { AnimatePresence, animate, motion, useMotionValue, useReducedMotion } from "framer-motion";
import { ArrowRight, Check, Minus } from "lucide-react";
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
  background: string;
  card: string;
  primary: string;
  secondary: string;
  accent: string;
  ctaText: string;
  selected: string;
  inactive: string;
  border: string;
};

const THEME_PALETTES: Record<Exclude<PricingTheme, "custom">, Palette> = {
  ivory: {
    background: "#f5f4f0",
    card: "#ffffff",
    primary: "#18191c",
    secondary: "#777a84",
    accent: "#1d1e22",
    ctaText: "#ffffff",
    selected: "#f1f1ee",
    inactive: "#ffffff",
    border: "#d9d8d3",
  },
  slate: {
    background: "#dfe4ea",
    card: "#f6f7f9",
    primary: "#121a25",
    secondary: "#647184",
    accent: "#35516e",
    ctaText: "#ffffff",
    selected: "#e6ebf1",
    inactive: "#f6f7f9",
    border: "#bfccd8",
  },
  midnight: {
    background: "#10131a",
    card: "#191d27",
    primary: "#f5f7ff",
    secondary: "#9198aa",
    accent: "#718bff",
    ctaText: "#ffffff",
    selected: "#202736",
    inactive: "#181c25",
    border: "#303746",
  },
  ember: {
    background: "#211511",
    card: "#2b1c17",
    primary: "#fff3ec",
    secondary: "#bf9482",
    accent: "#f06d42",
    ctaText: "#fff8f4",
    selected: "#35221a",
    inactive: "#2a1b16",
    border: "#543428",
  },
};

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

const SPEEDS: Record<PricingTransitionSpeed, number> = {
  slow: 0.55,
  medium: 0.38,
  fast: 0.22,
};

function AnimatedPrice({
  value,
  active,
  duration,
  fontFamily,
}: {
  value: number;
  active: boolean;
  duration: number;
  fontFamily?: string;
}) {
  const reduceMotion = useReducedMotion();
  const counter = useMotionValue(active ? 0 : value);
  const [current, setCurrent] = React.useState(active ? 0 : value);

  React.useEffect(() => {
    if (!active) {
      counter.set(value);
      return;
    }

    if (reduceMotion) {
      counter.set(value);
      return;
    }

    counter.set(0);
    const unsubscribe = counter.on("change", setCurrent);
    const controls = animate(counter, value, {
      duration,
      ease: [0.22, 1, 0.36, 1],
    });

    return () => {
      controls.stop();
      unsubscribe();
    };
  }, [active, counter, duration, reduceMotion, value]);

  const displayedValue = active && !reduceMotion ? current : value;
  const [whole, decimals] = displayedValue.toFixed(2).split(".");

  return (
    <span className="inline-flex items-baseline tabular-nums" style={{ fontFamily }}>
      <span className="text-[clamp(2rem,3.1vw,3.15rem)] font-medium leading-none">{whole}</span>
      <span className="text-[clamp(1.25rem,1.7vw,1.85rem)] font-medium leading-none">.{decimals}</span>
    </span>
  );
}

function resolvePalette({
  theme,
  backgroundColor,
  cardBackgroundColor,
  primaryTextColor,
  secondaryTextColor,
  accentColor,
  ctaTextColor,
}: Pick<
  RadioPlanPricingProps,
  | "theme"
  | "backgroundColor"
  | "cardBackgroundColor"
  | "primaryTextColor"
  | "secondaryTextColor"
  | "accentColor"
  | "ctaTextColor"
>) {
  const base = theme === "custom" ? THEME_PALETTES.ivory : THEME_PALETTES[theme ?? "ivory"];

  if (theme !== "custom") return base;

  return {
    ...base,
    background: backgroundColor ?? base.background,
    card: cardBackgroundColor ?? base.card,
    primary: primaryTextColor ?? base.primary,
    secondary: secondaryTextColor ?? base.secondary,
    accent: accentColor ?? base.accent,
    ctaText: ctaTextColor ?? base.ctaText,
  };
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
  outerRadius = 34,
  optionRadius = 18,
  padding = 34,
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
  const visiblePlans = plans.slice(0, 6);
  const visibleFeatures = features.slice(0, 12);
  const firstPlanId = visiblePlans[0]?.id ?? "";
  const initialPlanId = visiblePlans.some((plan) => plan.id === defaultSelectedPlan)
    ? defaultSelectedPlan
    : firstPlanId;
  const [selectedId, setSelectedId] = React.useState(initialPlanId);
  const selectedPlan = visiblePlans.find((plan) => plan.id === selectedId) ?? visiblePlans[0];
  const palette = resolvePalette({
    theme,
    backgroundColor,
    cardBackgroundColor,
    primaryTextColor,
    secondaryTextColor,
    accentColor,
    ctaTextColor,
  });
  const duration = SPEEDS[transitionSpeed];
  const includedCount = Math.min(selectedPlan?.includedFeatureCount ?? 0, visibleFeatures.length);
  const borderStyle = showBorder ? `1px solid ${palette.border}` : "none";
  const panelShadow = `0 ${Math.round(18 + shadowIntensity * 42)}px ${Math.round(
    38 + shadowIntensity * 74,
  )}px rgba(0, 0, 0, ${Math.min(0.34, shadowIntensity + 0.08)})`;

  if (!selectedPlan) return null;

  return (
    <section
      className={cn(
        "flex h-full min-h-[550px] w-full items-center justify-center overflow-hidden bg-[#111112] p-3 sm:p-6",
        className,
      )}
      style={{ fontFamily: bodyFontFamily }}
    >
      <div
        className={cn(
          "grid w-full max-w-[1320px] overflow-hidden",
          layout === "desktop" && "grid-cols-[0.96fr_1.04fr]",
          layout === "mobile" && "grid-cols-1",
          layout === "responsive" && "grid-cols-1 lg:grid-cols-[0.96fr_1.04fr]",
        )}
        style={{
          backgroundColor: palette.background,
          border: borderStyle,
          borderRadius: outerRadius,
          boxShadow: panelShadow,
          color: palette.primary,
        }}
      >
        <div
          className={cn(
            "flex min-w-0 flex-col",
            layout === "mobile" && "order-2 border-t",
            layout === "desktop" && "border-r",
            layout === "responsive" && "order-2 border-t lg:order-1 lg:border-r lg:border-t-0",
          )}
          style={{
            borderColor: palette.border,
            padding: `clamp(24px, 3vw, ${padding}px)`,
          }}
        >
          <PanelHeader title={featuresTitle} subtitle={featuresSubtitle} palette={palette} fontFamily={headingFontFamily} />
          <ul className="mt-6 grid flex-1 content-start gap-3.5 sm:mt-7 sm:gap-4">
            {visibleFeatures.map((feature, index) => {
              const included = index < includedCount;

              return (
                <motion.li
                  key={feature}
                  animate={{ opacity: included ? 1 : 0.45 }}
                  transition={{ duration }}
                  className="flex min-w-0 items-center gap-4 text-[15px] font-medium sm:text-[16px]"
                  style={{ color: included ? palette.primary : palette.secondary }}
                >
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.span
                      key={included ? "check" : "minus"}
                      initial={{ scale: 0.72, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.72, opacity: 0 }}
                      transition={{ duration }}
                      className="flex size-7 shrink-0 items-center justify-center rounded-full"
                      style={{
                        border: `2px solid ${included ? palette.accent : palette.secondary}`,
                        color: included ? palette.accent : palette.secondary,
                      }}
                    >
                      {included ? <Check className="size-4 stroke-[2.5]" /> : <Minus className="size-4 stroke-[2.5]" />}
                    </motion.span>
                  </AnimatePresence>
                  <span className="truncate">{feature}</span>
                </motion.li>
              );
            })}
          </ul>
          <div className="mt-6 flex items-center gap-3 text-sm" style={{ color: palette.secondary }}>
            <motion.span
              key={includedCount}
              initial={{ scale: 0.72, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration }}
              className="flex size-7 items-center justify-center rounded-full text-xs font-semibold"
              style={{ backgroundColor: `${palette.accent}14`, border: `1px solid ${palette.border}`, color: palette.accent }}
            >
              {includedCount}
            </motion.span>
            <span>of {visibleFeatures.length} features included</span>
          </div>
        </div>

        <div
          className={cn(
            "flex min-w-0 flex-col",
            layout === "mobile" && "order-1",
            layout === "responsive" && "order-1 lg:order-2",
          )}
          style={{ padding: `clamp(24px, 3vw, ${padding}px)` }}
        >
          <PanelHeader title={plansTitle} subtitle={plansSubtitle} palette={palette} fontFamily={headingFontFamily} />
          <fieldset className="mt-6 grid flex-1 gap-3 sm:mt-7 sm:gap-4">
            <legend className="sr-only">Select your pricing plan</legend>
            {visiblePlans.map((plan) => {
              const selected = plan.id === selectedPlan.id;

              return (
                <motion.label
                  key={plan.id}
                  layout
                  animate={{ scale: selected ? 1 : 0.99 }}
                  transition={{ duration }}
                  className="relative flex cursor-pointer overflow-hidden p-4 sm:px-6 sm:py-5"
                  style={{
                    backgroundColor: selected ? palette.selected : palette.card,
                    border: selected ? `2px solid ${palette.accent}` : borderStyle,
                    borderRadius: optionRadius,
                    boxShadow: selected
                      ? `0 12px 28px ${palette.accent}18`
                      : "0 8px 16px rgba(0, 0, 0, 0.04)",
                  }}
                >
                  {selected && (
                    <motion.span
                      layoutId="pricing-accent-edge"
                      className="absolute bottom-5 left-0 top-5 w-[4px] rounded-r-full"
                      style={{ backgroundColor: palette.accent }}
                      transition={{ duration }}
                    />
                  )}
                  <input
                    type="radio"
                    name="pricing-plan"
                    value={plan.id}
                    checked={selected}
                    onChange={() => setSelectedId(plan.id)}
                    className="sr-only"
                  />
                  <span
                    className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full border-2"
                    style={{
                      borderColor: selected ? palette.accent : palette.border,
                      boxShadow: selected ? `0 0 0 7px ${palette.accent}14` : undefined,
                    }}
                  >
                    {selected && (
                      <motion.span
                        layoutId="pricing-radio-dot"
                        className="size-3.5 rounded-full"
                        style={{ backgroundColor: palette.accent }}
                      />
                    )}
                  </span>
                  <span className="ml-4 min-w-0 flex-1">
                    <span className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
                      <span className="flex min-w-0 flex-wrap items-baseline gap-x-3 gap-y-1">
                        <span className="text-[16px] font-semibold sm:text-lg">{plan.label}</span>
                        {plan.subtitle && <span className="text-sm sm:text-base" style={{ color: palette.secondary }}>— {plan.subtitle}</span>}
                      </span>
                      {showPlanBadges && plan.badge && (
                        <span
                          className="rounded-full border px-2.5 py-0.5 text-[11.5px] font-semibold"
                          style={{
                            backgroundColor: `${palette.card}b8`,
                            borderColor: palette.border,
                            color: palette.primary,
                            backdropFilter: "blur(10px)",
                          }}
                        >
                          {plan.badge}
                        </span>
                      )}
                    </span>
                    <span className="mt-3 flex items-baseline gap-2">
                      <span className="text-lg" style={{ color: palette.secondary }}>{currency}</span>
                      <AnimatedPrice
                        value={plan.price}
                        active={selected}
                        duration={priceAnimationDuration}
                        fontFamily={priceFontFamily}
                      />
                      {plan.period && (
                        <span
                          className={cn("text-sm sm:text-base", plan.period === "one-time" && "rounded-md px-2 py-1 text-xs")}
                          style={{
                            color: palette.secondary,
                            backgroundColor: plan.period === "one-time" ? `${palette.secondary}12` : undefined,
                          }}
                        >
                          {plan.period}
                        </span>
                      )}
                    </span>
                  </span>
                </motion.label>
              );
            })}
          </fieldset>
          {showCTA && (
            <motion.a
              key={selectedPlan.id}
              href={selectedPlan.ctaHref ?? "#"}
              initial={{ opacity: 0.84 }}
              animate={{ opacity: 1 }}
              transition={{ duration }}
              className="group relative mt-6 flex min-h-14 items-center justify-center gap-3 overflow-hidden rounded-[16px] px-6 text-base font-semibold sm:mt-8"
              style={{ backgroundColor: palette.accent, color: palette.ctaText }}
            >
              <motion.span
                className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/3 -skew-x-12 bg-white/20"
                animate={{ left: ["-50%", "125%"] }}
                transition={{ duration: 1.25, ease: "easeInOut", repeat: Infinity, repeatDelay: 2 }}
              />
              <span className="relative">{selectedPlan.ctaLabel ?? "Get Started"}</span>
              <ArrowRight className="relative size-5 transition-transform duration-300 group-hover:translate-x-1" />
            </motion.a>
          )}
        </div>
      </div>
    </section>
  );
}

function PanelHeader({
  title,
  subtitle,
  palette,
  fontFamily,
}: {
  title: string;
  subtitle: string;
  palette: Palette;
  fontFamily?: string;
}) {
  return (
    <header>
      <h2 className="flex items-center gap-4 text-[clamp(1.4rem,2.2vw,2rem)] font-medium leading-tight" style={{ fontFamily }}>
        <span className="size-2.5 rounded-full" style={{ backgroundColor: palette.secondary }} />
        {title}
      </h2>
      <p className="ml-[26px] mt-3 text-sm leading-6 sm:text-[15px]" style={{ color: palette.secondary }}>
        {subtitle}
      </p>
    </header>
  );
}

export function RadioPlanPricingPreview() {
  // drawn at its real size; the gallery frames the `data-tile-focus` box into each tile
  return (
    <div className="relative flex h-[320px] w-full items-center justify-center overflow-hidden bg-[#111112]">
      <div data-tile-focus className="w-[1080px] shrink-0">
        <RadioPlanPricing layout="desktop" padding={32} outerRadius={30} optionRadius={17} />
      </div>
    </div>
  );
}
