"use client";

import { BeamPricing, DEFAULT_BEAM_PRICING_PLANS } from "@/components/blocks/motion-kit/beam-pricing";
import { DEFAULT_SEAT_RULER_TIERS, SeatRulerPricing } from "@/components/blocks/motion-kit/seat-ruler-pricing";
import {
  AdvancedPricingColumns,
  DEFAULT_PRICING_FEATURES,
  DEFAULT_PRICING_PLANS,
  PricingPlanGrid,
  RadioPlanPricing,
  SpotlightPricingCards,
} from "@/components/blocks/pricing-section";
import type { PropDoc } from "@/components/library/prop-controls";
import type { BlockPlaygrounds } from "./types";

// Shared by the three billing-toggle sections (PricingPlanGrid, AdvancedPricingColumns, SpotlightPricingCards)
const ACCENT_COLOR: PropDoc = {
  name: "accentColor",
  type: "string",
  description: "Buttons, checks, focus rings and highlights. Empty = Apple blue that brightens in dark mode.",
  defaultValue: '"#0071e3"',
};
const DEFAULT_CYCLE: PropDoc = {
  name: "defaultCycle",
  type: '"monthly" | "yearly"',
  description: "Billing period shown on mount.",
  defaultValue: '"monthly"',
};
const SAVINGS_NOTE: PropDoc = {
  name: "savingsNote",
  type: "string",
  description: "Small line under the billing toggle. Empty hides it.",
  defaultValue: '"Save about 20% when you pay yearly."',
};
const SHOW_BILLING_TOGGLE: PropDoc = {
  name: "showBillingToggle",
  type: "boolean",
  description: "Show the Monthly / Yearly toggle. When off, prices stay on defaultCycle.",
  defaultValue: "true",
};
const CLASS_NAME: PropDoc = { name: "className", type: "string", description: "Extra classes on the outer section." };

const PRICING_IMPORT = 'import { RadioPlanPricing } from "@/components/blocks/pricing-section";';

const playgrounds: BlockPlaygrounds = {
  "pricing-radio-plan": {
    Component: RadioPlanPricing,
    props: [
      { name: "plansTitle", type: "string", description: "Heading above the plan options.", defaultValue: '"How you pay"' },
      { name: "featuresTitle", type: "string", description: "Heading above the feature checklist.", defaultValue: '"What\'s included"' },
      {
        name: "theme",
        type: '"ivory" | "slate" | "midnight" | "ember" | "custom"',
        description: "Colour palette. Ivory follows light/dark mode; custom uses the colour props.",
        defaultValue: '"ivory"',
      },
      {
        name: "accentColor",
        type: "string",
        description: 'Radio, check, progress and button colour. Applies when theme is "custom".',
        defaultValue: '"#0071e3"',
      },
      {
        name: "layout",
        type: '"responsive" | "desktop" | "mobile"',
        description: "Two columns from lg up (responsive), always two (desktop) or always stacked (mobile).",
        defaultValue: '"responsive"',
      },
      {
        name: "transitionSpeed",
        type: '"slow" | "medium" | "fast"',
        description: "Spring used for the selection ring, checks and text swaps.",
        defaultValue: '"medium"',
      },
      { name: "outerRadius", type: "number", description: "Corner radius of the outer panel in px.", defaultValue: "28", min: 0, max: 48, step: 2 },
      { name: "showCTA", type: "boolean", description: "Show the call-to-action button under the plans.", defaultValue: "true" },
      { name: "showPlanBadges", type: "boolean", description: "Show each plan's badge (e.g. Save 19%).", defaultValue: "true" },
      { name: "plansSubtitle", type: "string", description: "Line under the plans heading.", defaultValue: '"Same product on every plan. Yearly saves you 19%."' },
      { name: "featuresSubtitle", type: "string", description: "Line under the features heading.", defaultValue: '"Pick a plan to see what it unlocks."' },
      { name: "currency", type: "string", description: "Symbol shown before every price.", defaultValue: '"$"' },
      { name: "defaultSelectedPlan", type: "string", description: "Id of the plan selected on mount.", defaultValue: '"monthly"' },
      { name: "optionRadius", type: "number", description: "Corner radius of each plan option in px.", defaultValue: "18", min: 0, max: 28, step: 1 },
      { name: "padding", type: "number", description: "Max inner padding of each column in px (shrinks on small screens).", defaultValue: "36", min: 16, max: 64, step: 2 },
      { name: "shadowIntensity", type: "number", description: "Strength of the panel's drop shadow.", defaultValue: "0.14", min: 0, max: 0.3, step: 0.02 },
      { name: "showBorder", type: "boolean", description: "Draw a 1px hairline around the panel.", defaultValue: "true" },
      { name: "priceAnimationDuration", type: "number", description: "Seconds the big price takes to count to the new value (0 = instant).", defaultValue: "0.7", min: 0, max: 2, step: 0.1 },
      { name: "backgroundColor", type: "string", description: 'Panel background (theme "custom").' },
      { name: "cardBackgroundColor", type: "string", description: 'Plan option and empty check background (theme "custom").' },
      { name: "primaryTextColor", type: "string", description: 'Main text colour (theme "custom").' },
      { name: "secondaryTextColor", type: "string", description: 'Muted text colour (theme "custom").' },
      { name: "ctaTextColor", type: "string", description: 'Text on accent fills (theme "custom").' },
      { name: "headingFontFamily", type: "string", description: "CSS font-family for both column headings." },
      { name: "priceFontFamily", type: "string", description: "CSS font-family for prices." },
      { name: "bodyFontFamily", type: "string", description: "CSS font-family for the whole section." },
      { name: "plans", type: "PricingPlan[]", description: "Up to 6 plans: id, label, subtitle, price, period, badge, ctaLabel, ctaHref, includedFeatureCount.", defaultValue: "DEFAULT_PRICING_PLANS" },
      { name: "features", type: "string[]", description: "Up to 12 feature names; a plan includes the first includedFeatureCount.", defaultValue: "DEFAULT_PRICING_FEATURES" },
      { name: "className", type: "string", description: "Extra classes on the outer section." },
    ],
    baseProps: { plans: DEFAULT_PRICING_PLANS, features: DEFAULT_PRICING_FEATURES },
    jsxName: "RadioPlanPricing",
    importLine: PRICING_IMPORT,
  },
  "pricing-four-tier": {
    Component: PricingPlanGrid,
    props: [
      { name: "title", type: "string", description: "Main heading.", defaultValue: '"Plans that grow with your audience"' },
      {
        name: "description",
        type: "string",
        description: "Paragraph under the heading.",
        defaultValue:
          '"Start on the plan that fits the channels you run today. Switch tiers whenever you like and we prorate the difference."',
      },
      ACCENT_COLOR,
      DEFAULT_CYCLE,
      { name: "featuredBadge", type: "string", description: "Label on the featured card. Empty hides it.", defaultValue: '"Most popular"' },
      SAVINGS_NOTE,
      SHOW_BILLING_TOGGLE,
      {
        name: "plans",
        type: "PricingGridPlan[]",
        description: "Up to 8 cards: label, monthly, yearly (display strings), copy, features, action, featured.",
        defaultValue: "DEFAULT_PRICING_GRID_PLANS",
      },
      CLASS_NAME,
    ],
    jsxName: "PricingPlanGrid",
    importLine: 'import { PricingPlanGrid } from "@/components/blocks/pricing-section";',
  },
  "pricing-advanced-columns": {
    Component: AdvancedPricingColumns,
    props: [
      { name: "title", type: "string", description: "Main heading.", defaultValue: '"Pay for the questions you ask"' },
      {
        name: "description",
        type: "string",
        description: "Paragraph under the heading.",
        defaultValue: '"Every plan reads from the same warehouse. Upgrade when you need more seats, history or real-time data."',
      },
      ACCENT_COLOR,
      DEFAULT_CYCLE,
      { name: "currency", type: "string", description: "Symbol before every amount. Empty hides it.", defaultValue: '"$"' },
      { name: "ctaPrefix", type: "string", description: 'Button text before the plan name ("Get Team").', defaultValue: '"Get"' },
      SAVINGS_NOTE,
      SHOW_BILLING_TOGGLE,
      { name: "monthlyPeriod", type: "string", description: "Period after the amount when billed monthly.", defaultValue: '"/month"' },
      { name: "yearlyPeriod", type: "string", description: "Period after the amount when billed yearly.", defaultValue: '"/year"' },
      {
        name: "plans",
        type: "AdvancedPricingPlan[]",
        description: "Up to 6 columns: label, monthly, yearly (no currency), badge (also makes the button primary), features, inherited.",
        defaultValue: "DEFAULT_ADVANCED_PRICING_PLANS",
      },
      CLASS_NAME,
    ],
    jsxName: "AdvancedPricingColumns",
    importLine: 'import { AdvancedPricingColumns } from "@/components/blocks/pricing-section";',
  },
  "pricing-spotlight-cards": {
    Component: SpotlightPricingCards,
    props: [
      { name: "title", type: "string", description: "Main heading.", defaultValue: '"One assistant, three ways to run it"' },
      {
        name: "description",
        type: "string",
        description: "Paragraph under the heading.",
        defaultValue: '"Start on Hobby for free for 14 days. Every plan keeps your history when you move up."',
      },
      ACCENT_COLOR,
      DEFAULT_CYCLE,
      { name: "featuresHeading", type: "string", description: "Small heading above each feature list. Empty hides it.", defaultValue: '"Includes"' },
      SAVINGS_NOTE,
      SHOW_BILLING_TOGGLE,
      {
        name: "plans",
        type: "SpotlightPricingPlan[]",
        description:
          'Up to 6 cards: label, copy, monthly, yearly, periodMonthly, periodYearly, action, features, featured (dark card), hidePeriod (default: monthly is "Custom").',
        defaultValue: "DEFAULT_SPOTLIGHT_PRICING_PLANS",
      },
      CLASS_NAME,
    ],
    jsxName: "SpotlightPricingCards",
    importLine: 'import { SpotlightPricingCards } from "@/components/blocks/pricing-section";',
  },
  "mk-seat-ruler-pricing": {
    Component: SeatRulerPricing,
    props: [
      { name: "title", type: "string", description: "Main heading.", defaultValue: '"Pay for the team you have."' },
      { name: "eyebrow", type: "string", description: "Small accent label above the heading.", defaultValue: '"Pricing"' },
      {
        name: "description",
        type: "string",
        description: "Paragraph under the heading.",
        defaultValue: '"The more people you bring, the less each seat costs. Drag to see your price."',
      },
      {
        name: "accent",
        type: "string",
        description: "Filled ticks, active plan ring, eyebrow and button. Empty = Apple blue that brightens in dark mode.",
        defaultValue: '"#0071e3"',
      },
      {
        name: "autoplay",
        type: "boolean",
        description: "Sweeps the ruler through a few team sizes until touched (off unless set).",
        defaultValue: "true",
      },
      { name: "maxSeats", type: "number", description: "Largest team size on the ruler.", defaultValue: "200", min: 10, max: 1000, step: 10 },
      { name: "defaultBilling", type: '"monthly" | "yearly"', description: "Billing period selected on mount.", defaultValue: '"yearly"' },
      { name: "defaultSeats", type: "number", description: "Team size on mount.", defaultValue: "24", min: 1, max: 200, step: 1 },
      { name: "tiers", type: "SeatRulerTier[]", description: "Plans by team size: name, upTo, monthly, yearly (per seat), note.", defaultValue: "DEFAULT_SEAT_RULER_TIERS" },
      { name: "onStart", type: "(selection: SeatRulerSelection) => void", description: "Called with seats, plan, billing and total when the button is pressed." },
      { name: "className", type: "string", description: "Extra classes on the outer section." },
    ],
    baseProps: { tiers: DEFAULT_SEAT_RULER_TIERS, autoplay: true },
    jsxName: "SeatRulerPricing",
    importLine: 'import { SeatRulerPricing } from "@/components/blocks/motion-kit/seat-ruler-pricing";',
    frameClassName: "bg-white dark:bg-black",
  },
  "mk-beam-pricing": {
    Component: BeamPricing,
    props: [
      { name: "title", type: "string", description: "Main heading.", defaultValue: '"Simple plans. Cancel any time."' },
      { name: "eyebrow", type: "string", description: "Small accent label above the heading.", defaultValue: '"Pricing"' },
      {
        name: "accent",
        type: "string",
        description: "Beam, featured badge, glow and checks. Empty = Apple blue that brightens in dark mode.",
        defaultValue: '"#0071e3"',
      },
      {
        name: "autoplay",
        type: "boolean",
        description: "Flips monthly/yearly every 3.2s until a billing option is clicked (off unless set).",
        defaultValue: "true",
      },
      { name: "featuredBadge", type: "string", description: "Badge on the featured plan.", defaultValue: '"Most popular"' },
      { name: "yearlyBadge", type: "string", description: "Green badge on the Yearly option.", defaultValue: '"−20%"' },
      { name: "defaultBilling", type: '"monthly" | "yearly"', description: "Billing period selected on mount.", defaultValue: '"yearly"' },
      { name: "plans", type: "BeamPricingPlan[]", description: "Plans: name, blurb, monthly, yearly (null = Custom), features, cta, featured.", defaultValue: "DEFAULT_BEAM_PRICING_PLANS" },
      { name: "onSelectPlan", type: "(plan: BeamPricingPlan, billing: BeamPricingBilling) => void", description: "Called when a plan's button is pressed." },
      { name: "className", type: "string", description: "Extra classes on the outer section." },
    ],
    baseProps: { plans: DEFAULT_BEAM_PRICING_PLANS, autoplay: true },
    jsxName: "BeamPricing",
    importLine: 'import { BeamPricing } from "@/components/blocks/motion-kit/beam-pricing";',
    frameClassName: "bg-white dark:bg-black",
  },
};

export default playgrounds;
