"use client";

import { useState } from "react";
import type { CSSProperties } from "react";
import { motion } from "framer-motion";
import { formatAmount, getCurrency } from "./data";
import { Icon, RollingNumber, SectionHeading, buttonClass } from "./ui";

type Plan = {
  name: string;
  base: number;
  rate: number;
  blurb: string;
  cta: string;
  has: string[];
};

export const PLANS: Plan[] = [
  {
    name: "Starter",
    base: 0,
    rate: 0.006,
    blurb: "For your first payments abroad.",
    cta: "Start free",
    has: ["Accounts in 34 currencies", "Payouts to 160 countries", "Company cards", "Two people on the team"],
  },
  {
    name: "Growth",
    base: 49,
    rate: 0.004,
    blurb: "For companies paying a team abroad.",
    cta: "Choose Growth",
    has: [
      "Everything in Starter",
      "Approval rules",
      "Rate locks for 24 hours",
      "Accounting sync",
      "Up to 15 people",
    ],
  },
  {
    name: "Scale",
    base: 299,
    rate: 0.0025,
    blurb: "For high volume and several entities.",
    cta: "Talk to sales",
    has: [
      "Everything in Growth",
      "Several legal entities",
      "Higher API limits",
      "Unlimited people",
      "A named account manager",
    ],
  },
];

export const BANK_MARKUP = 0.025;

export const MIN_VOLUME = 1e4;

export const MAX_VOLUME = 1e7;

export const volumeFromSlider = (position: number): number => {
  const raw = MIN_VOLUME * Math.pow(MAX_VOLUME / MIN_VOLUME, position),
    step = Math.pow(10, Math.floor(Math.log10(raw)) - 1);
  return Math.round(raw / step) * step;
};

export const sliderFromVolume = (volume: number): number => Math.log(volume / MIN_VOLUME) / Math.log(MAX_VOLUME / MIN_VOLUME);

export const USD = getCurrency("USD");

export const formatPercent = (fraction: number): string => `${+(fraction * 100).toFixed(2)}%`;

export function Pricing() {
  const [sliderPosition, setSliderPosition] = useState(sliderFromVolume(12e4)),
    volume = volumeFromSlider(sliderPosition),
    costs = PLANS.map((plan) => plan.base + volume * plan.rate),
    bestIndex = costs.indexOf(Math.min(...costs)),
    bankCost = volume * BANK_MARKUP;
  return (
    <section id="pricing" className="scroll-mt-24 px-3 py-24 sm:px-6 sm:py-32">
      <div className="mx-auto grid max-w-[1160px] grid-cols-1 items-end gap-6 px-2 lg:grid-cols-2">
        <SectionHeading
          align="left"
          label="Pricing"
          title={
            <>
              {"Pricing that scales "}
              <span className="text-[rgb(var(--ferry-faint))]">with your volume.</span>
            </>
          }
        />
        <p className="m-0 max-w-[440px] text-[16px] leading-[1.6] text-[rgb(var(--ferry-mute))] lg:justify-self-end">
          One monthly price and one flat conversion fee. No setup fee, no minimum, and payouts in the same
          currency are free on every plan.
        </p>
      </div>
      <ul className="mx-auto mt-14 grid max-w-[1160px] list-none grid-cols-1 gap-4 p-0 md:grid-cols-3">
        {PLANS.map((plan, index) => {
          const isBest = index === bestIndex;
          return (
            <li key={plan.name} className="relative">
              {isBest && (
                <motion.span
                  layoutId="best-tag"
                  className="absolute -top-3 left-1/2 z-10 whitespace-nowrap rounded-[8px] border border-solid border-[rgb(var(--ferry-accent)/.4)] bg-[rgb(var(--ferry-surface))] px-3 py-1 text-[12px] font-medium text-[rgb(var(--ferry-ink))] shadow-[0_0_0_3px_rgb(var(--ferry-accent)/.08),0_8px_20px_-10px_rgb(var(--ferry-accent)/.6)]"
                  style={{
                    x: "-50%",
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 420,
                    damping: 34,
                  }}
                >
                  Best for your volume
                </motion.span>
              )}
              <div className="h-full rounded-[28px] border border-solid border-[rgb(var(--ferry-line)/.08)] bg-[rgb(var(--ferry-frame))] p-2">
                <div
                  className={`relative flex h-full flex-col overflow-hidden rounded-[22px] border border-solid bg-[rgb(var(--ferry-surface)/.82)] p-6 ferry-shadow-panel transition-colors duration-300 ${isBest ? "border-[rgb(var(--ferry-accent)/.35)]" : "border-[rgb(var(--ferry-line)/.08)]"}`}
                >
                  <span aria-hidden="true" className="ferry-glow" />
                  <div className="relative">
                    <h3 className="m-0 text-[22px] font-medium tracking-[-0.02em] text-[rgb(var(--ferry-ink))]">
                      {plan.name}
                    </h3>
                    <p className="m-0 mt-1.5 text-[13px] text-[rgb(var(--ferry-mute))]">{plan.blurb}</p>
                    <div className="mt-6 flex items-baseline gap-1.5">
                      <span className="ferry-tnum text-[48px] font-medium leading-none tracking-[-0.035em] text-[rgb(var(--ferry-ink))]">
                        ${plan.base}
                      </span>
                      <span className="text-[14px] text-[rgb(var(--ferry-mute))]">a month</span>
                    </div>
                    <div className="mt-2 text-[12px] text-[rgb(var(--ferry-faint))]">
                      {"plus "}
                      {formatPercent(plan.rate)}
                      {" on conversions"}
                    </div>
                    <div className="mt-6">
                      <a href="#open" className={`${buttonClass(isBest ? "primary" : "ghost")} no-underline`}>
                        {plan.cta}
                        {isBest && <Icon name="arrow_up_right" size={11} />}
                      </a>
                    </div>
                  </div>
                  <div className="relative mt-6 rounded-[14px] border border-solid border-[rgb(var(--ferry-line)/.08)] bg-[rgb(var(--ferry-raised)/.7)] px-4 py-3">
                    <div className="text-[11px] text-[rgb(var(--ferry-faint))]">
                      At ${formatAmount(volume, USD, 0)}
                      {" a month"}
                    </div>
                    <div
                      className={`mt-0.5 text-[20px] font-medium tracking-[-0.02em] ${isBest ? "text-[rgb(var(--ferry-accent-ink))]" : "text-[rgb(var(--ferry-ink))]"}`}
                    >
                      $<RollingNumber text={formatAmount(costs[index], USD, 0)} />
                    </div>
                  </div>
                  <ul className="relative m-0 mt-6 grid list-none gap-2.5 border-t border-solid border-[rgb(var(--ferry-line)/.08)] p-0 pt-6 text-[13px] text-[rgb(var(--ferry-ink))]">
                    {plan.has.map((feature) => (
                      <li key={feature} className="flex items-center gap-2.5">
                        <Icon
                          name="checkmark"
                          size={11}
                          className="shrink-0 text-[rgb(var(--ferry-accent-ink))]"
                        />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
      <div className="mx-auto mt-4 max-w-[1160px] rounded-[20px] border border-solid border-[rgb(var(--ferry-line)/.08)] bg-[rgb(var(--ferry-frame))] p-2">
        <div className="grid grid-cols-1 items-center gap-5 rounded-[14px] border border-solid border-[rgb(var(--ferry-line)/.06)] bg-[rgb(var(--ferry-surface)/.82)] px-5 py-4 md:grid-cols-[auto_minmax(0,1fr)_auto] md:gap-8">
          <div>
            <label htmlFor="volume" className="block text-[12px] text-[rgb(var(--ferry-mute))]">
              You convert each month
            </label>
            <div className="mt-0.5 text-[22px] font-medium tracking-[-0.02em] text-[rgb(var(--ferry-ink))]">
              $<RollingNumber text={formatAmount(volume, USD, 0)} />
            </div>
          </div>
          <div>
            <input
              id="volume"
              type="range"
              min={0}
              max={1}
              step={0.001}
              value={sliderPosition}
              onChange={(event) => setSliderPosition(+event.target.value)}
              aria-valuetext={`$${formatAmount(volume, USD, 0)} a month`}
              className="ferry-range w-full"
              style={
                {
                  "--fill": `${sliderPosition * 100}%`,
                } as CSSProperties
              }
            />
            <div className="mt-0.5 flex justify-between text-[11px] text-[rgb(var(--ferry-faint))]">
              <span>$10k</span>
              <span>$10M</span>
            </div>
          </div>
          <p className="m-0 max-w-[300px] text-[13px] leading-[1.5] text-[rgb(var(--ferry-mute))]">
            {"A typical bank's "}
            {formatPercent(BANK_MARKUP)}
            {" markup would cost "}
            <span className="ferry-tnum text-[rgb(var(--ferry-ink))]">${formatAmount(bankCost, USD, 0)}</span>
            {". On "}
            {PLANS[bestIndex].name}
            {" you keep"}{" "}
            <span className="ferry-tnum font-medium text-[rgb(var(--ferry-gain))]">
              ${formatAmount(Math.max(0, bankCost - costs[bestIndex]), USD, 0)}
            </span>
            .
          </p>
        </div>
      </div>
    </section>
  );
}
