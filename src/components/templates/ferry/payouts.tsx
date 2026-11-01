"use client";

import { useState, useEffect, useRef } from "react";
import type { KeyboardEvent, ReactNode } from "react";
import { motion, AnimatePresence, useReducedMotion, useInView } from "framer-motion";
import { feeFor, formatAmount, formatRate, getCurrency, rateBetween } from "./data";
import type { Currency } from "./data";
import { Badge, CurrencyDot, Frame, Icon, Panel, PulseGrid, SectionHeading } from "./ui";

type PayoutSample = {
  from: string;
  to: string;
  amount: number;
  who: string;
  country: string;
  acct: string;
  id: string;
};

export const PAYOUT_SAMPLES: PayoutSample[] = [
  {
    from: "GBP",
    to: "INR",
    amount: 12400,
    who: "Rao Design Studio",
    country: "India",
    acct: "4417",
    id: "po_3NcV7qK2",
  },
  {
    from: "EUR",
    to: "BRL",
    amount: 8600,
    who: "Casa Verde Têxteis",
    country: "Brazil",
    acct: "0291",
    id: "po_8Lm2Qx41",
  },
  {
    from: "USD",
    to: "NGN",
    amount: 5200,
    who: "Ade Okafor",
    country: "Nigeria",
    acct: "7702",
    id: "po_5Tz9Wd03",
  },
  {
    from: "SGD",
    to: "AUD",
    amount: 21e3,
    who: "Harbour Freight",
    country: "Australia",
    acct: "3358",
    id: "po_2Hs6Rb77",
  },
  {
    from: "CAD",
    to: "MXN",
    amount: 9800,
    who: "Taller Norte",
    country: "Mexico",
    acct: "6120",
    id: "po_9Ka4Ve15",
  },
];

export const durationText = (minutes: number): string =>
  minutes <= 1 ? "under a minute" : minutes < 60 ? `${minutes} minutes` : `${Math.round(minutes / 60)} hours`;

type InlineChipProps = {
  children?: ReactNode;
};

export function InlineChip({ children }: InlineChipProps) {
  return (
    <span className="mx-0.5 rounded-[6px] border border-solid border-[rgb(var(--ferry-line)/.08)] bg-[rgb(var(--ferry-raised))] px-1.5 py-0.5 text-[0.92em] text-[rgb(var(--ferry-mute))]">
      {children}
    </span>
  );
}

type PayoutStep = {
  node: ReactNode;
  mono?: boolean;
  dim?: boolean;
};

export function Payouts() {
  const reduceMotion = useReducedMotion(),
    [sampleIndex, setSampleIndex] = useState(0),
    [replayCount, setReplayCount] = useState(0),
    [visibleCount, setVisibleCount] = useState(0),
    sectionRef = useRef<HTMLDivElement>(null),
    inView = useInView(sectionRef, {
      once: true,
      margin: "-20% 0px",
    }),
    sample = PAYOUT_SAMPLES[sampleIndex],
    fromCurrency = getCurrency(sample.from),
    toCurrency = getCurrency(sample.to),
    rate = rateBetween(fromCurrency, toCurrency),
    received = (sample.amount - feeFor(sample.amount)) * rate,
    symbolOf = (currency: Currency) => currency.symbol.trim(),
    steps: PayoutStep[] = [
      {
        node: <>Payment approved by Maya Chen and Daniel Ortiz.</>,
      },
      {
        node: (
          <>
            {"Converting "}
            <InlineChip>{`${symbolOf(fromCurrency)}${formatAmount(sample.amount, fromCurrency)}`}</InlineChip>
            {" to "}
            {toCurrency.code}
            {" at "}
            <InlineChip>{formatRate(rate)}</InlineChip>
            {", fee "}
            <InlineChip>{`${symbolOf(fromCurrency)}${formatAmount(feeFor(sample.amount), fromCurrency)}`}</InlineChip>.
          </>
        ),
      },
      {
        node: (
          <>
            {"Routing over "}
            <InlineChip>{toCurrency.rail}</InlineChip>
            {", the local instant network in "}
            {sample.country}.
          </>
        ),
      },
      {
        mono: true,
        node: (
          <>
            {"ferry payouts track "}
            {sample.id}
            {" --rail "}
            {toCurrency.rail.toLowerCase().replace(/\s+/g, "-")}
          </>
        ),
      },
      {
        mono: true,
        dim: true,
        node: (
          <>
            {"status in_transit, eta "}
            {toCurrency.minutes <= 1
              ? "<1m"
              : toCurrency.minutes < 60
                ? `${toCurrency.minutes}m`
                : `${Math.round(toCurrency.minutes / 60)}h`}
          </>
        ),
      },
    ],
    totalTicks = steps.length + 1,
    arrived = visibleCount >= totalTicks;
  useEffect(() => {
    if (!inView) return;
    if (reduceMotion) {
      setVisibleCount(totalTicks);
      return;
    }
    setVisibleCount(0);
    const timers = Array.from(
      {
        length: totalTicks,
      },
      (_, tick) =>
        window.setTimeout(
          () => setVisibleCount(tick + 1),
          420 + tick * 640 + (tick === totalTicks - 1 ? 500 : 0),
        ),
    );
    return () => timers.forEach(window.clearTimeout);
  }, [inView, sampleIndex, replayCount, reduceMotion, totalTicks]);
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const step =
      event.key === "ArrowDown" || event.key === "ArrowRight"
        ? 1
        : event.key === "ArrowUp" || event.key === "ArrowLeft"
          ? -1
          : 0;
    if (!step) return;
    event.preventDefault();
    const nextIndex = (sampleIndex + step + PAYOUT_SAMPLES.length) % PAYOUT_SAMPLES.length;
    setSampleIndex(nextIndex);
    event.currentTarget.querySelectorAll<HTMLElement>("[role=radio]")[nextIndex]?.focus();
  };
  return (
    <section id="payouts" className="scroll-mt-24 px-3 py-24 sm:px-6 sm:py-32">
      <SectionHeading
        label="Payouts"
        title="Send every payout over the right local rail."
        sub="Pick a corridor and watch Ferry route it. Each payout is converted at the real rate, sent on the country's own instant network and confirmed when it lands."
      />
      <div ref={sectionRef}>
        <Frame className="mx-auto mt-12 max-w-[1160px]">
          <Panel className="p-0">
            <div className="flex items-center justify-between gap-3 border-b border-solid border-[rgb(var(--ferry-line)/.08)] px-4 py-3.5 sm:px-6">
              <div className="flex min-w-0 items-center gap-3">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[rgb(var(--ferry-ink))] text-[rgb(var(--ferry-paper))]">
                  <Icon name="paperplane_fill" size={14} />
                </span>
                <span className="truncate text-[15px] font-medium text-[rgb(var(--ferry-ink))]">
                  {"Payout to "}
                  {sample.who}
                </span>
                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.span
                    key={arrived ? "done" : "run"}
                    initial={{
                      opacity: 0,
                      scale: 0.9,
                    }}
                    animate={{
                      opacity: 1,
                      scale: 1,
                    }}
                    exit={{
                      opacity: 0,
                      scale: 0.9,
                    }}
                    transition={{
                      duration: 0.18,
                    }}
                    className="hidden sm:inline-flex"
                  >
                    {arrived ? (
                      <Badge tone="gain" dot={true}>
                        Arrived
                      </Badge>
                    ) : (
                      <Badge tone="amber">
                        <PulseGrid />
                        Routing
                      </Badge>
                    )}
                  </motion.span>
                </AnimatePresence>
              </div>
              <button
                type="button"
                onClick={() => setReplayCount((count) => count + 1)}
                aria-label="Replay this payout"
                className="grid h-8 w-8 place-items-center rounded-[8px] text-[rgb(var(--ferry-mute))] transition-colors hover:bg-[rgb(var(--ferry-raised))] hover:text-[rgb(var(--ferry-ink))]"
              >
                <Icon name="arrow_clockwise" size={14} />
              </button>
            </div>
            <div className="relative grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_440px]">
              <span aria-hidden="true" className="ferry-glow !right-[-60px] !top-[-120px] hidden lg:block" />
              <div className="min-h-[400px] px-4 py-6 sm:px-6" aria-live="polite">
                <ul className="m-0 grid list-none gap-4 p-0">
                  <AnimatePresence initial={false}>
                    {steps.slice(0, Math.min(visibleCount, steps.length)).map((step, stepIndex) => (
                      <motion.li
                        key={`${sampleIndex}-${replayCount}-${stepIndex}`}
                        initial={
                          reduceMotion
                            ? false
                            : {
                                opacity: 0,
                                y: 6,
                                filter: "blur(4px)",
                              }
                        }
                        animate={{
                          opacity: 1,
                          y: 0,
                          filter: "blur(0px)",
                        }}
                        transition={{
                          duration: 0.35,
                        }}
                        className={
                          step.mono
                            ? `font-mono text-[13px] ${step.dim ? "text-[rgb(var(--ferry-faint))]" : "text-[rgb(var(--ferry-mute))]"}`
                            : "text-[15px] leading-[1.6] text-[rgb(var(--ferry-ink)/.9)]"
                        }
                      >
                        {step.mono && <span className="text-[rgb(var(--ferry-accent-ink))]">{"$ "}</span>}
                        {step.node}
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </ul>
                <AnimatePresence mode="wait">
                  {arrived ? (
                    <motion.div
                      key={`n-${sampleIndex}-${replayCount}`}
                      initial={
                        reduceMotion
                          ? false
                          : {
                              opacity: 0,
                              y: -10,
                              scale: 0.97,
                            }
                      }
                      animate={{
                        opacity: 1,
                        y: 0,
                        scale: 1,
                      }}
                      transition={{
                        type: "spring",
                        stiffness: 380,
                        damping: 26,
                      }}
                      className="mt-6 max-w-[420px]"
                      role="status"
                    >
                      <div className="flex gap-3 rounded-[16px] border border-solid border-[rgb(var(--ferry-line)/.08)] bg-[rgb(var(--ferry-raised))] p-3">
                        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[10px] bg-[rgb(var(--ferry-ink))] text-[rgb(var(--ferry-paper))]">
                          <Icon name="building_2_fill" size={16} />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="flex items-baseline justify-between gap-2">
                            <span className="text-[14px] font-medium text-[rgb(var(--ferry-ink))]">
                              Payment received
                            </span>
                            <span className="text-[11px] text-[rgb(var(--ferry-faint))]">now</span>
                          </span>
                          <span className="mt-0.5 block text-[13px] leading-[1.45] text-[rgb(var(--ferry-mute))]">
                            {symbolOf(toCurrency)}
                            {formatAmount(received, toCurrency)}
                            {" from Northwind Ltd landed in the account ending "}
                            {sample.acct}.
                          </span>
                        </span>
                      </div>
                      <p className="m-0 mt-3 flex items-center gap-2 text-[13px] text-[rgb(var(--ferry-gain))]">
                        <Icon name="checkmark_seal_fill" size={15} />
                        {"Arrived in "}
                        {durationText(toCurrency.minutes)}
                        {", seen by "}
                        {sample.who}
                        {" in "}
                        {toCurrency.city}.
                      </p>
                    </motion.div>
                  ) : (
                    visibleCount > 0 && (
                      <motion.p
                        key={"wait"}
                        initial={{
                          opacity: 0,
                        }}
                        animate={{
                          opacity: 1,
                        }}
                        exit={{
                          opacity: 0,
                        }}
                        className="m-0 mt-5 flex items-center gap-2 text-[14px] text-[rgb(var(--ferry-mute))]"
                      >
                        <PulseGrid className="text-[rgb(var(--ferry-faint))]" />
                        Routing
                      </motion.p>
                    )
                  )}
                </AnimatePresence>
              </div>
              <div className="relative border-t border-solid border-[rgb(var(--ferry-line)/.08)] p-4 sm:p-6 lg:border-l lg:border-t-0">
                <div className="relative rounded-[20px] border border-solid border-[rgb(var(--ferry-line)/.1)] bg-[rgb(var(--ferry-surface))] p-3 ferry-shadow-lift">
                  <p className="m-0 px-1 pt-1 text-[10px] font-medium uppercase tracking-[0.2em] text-[rgb(var(--ferry-faint))]">
                    Route payout via
                  </p>
                  <p className="m-0 mt-1 px-1 text-[14px] font-medium text-[rgb(var(--ferry-ink))]">
                    Choose a corridor
                  </p>
                  <div role="radiogroup" aria-label="Corridor" className="mt-3 grid gap-1" onKeyDown={handleKeyDown}>
                    {PAYOUT_SAMPLES.map((option, optionIndex) => {
                      const optionFrom = getCurrency(option.from),
                        optionTo = getCurrency(option.to),
                        isSelected = optionIndex === sampleIndex;
                      return (
                        <button
                          key={option.id}
                          type="button"
                          role="radio"
                          aria-checked={isSelected}
                          tabIndex={isSelected ? 0 : -1}
                          onClick={() => setSampleIndex(optionIndex)}
                          className="relative flex items-center gap-3 rounded-[12px] px-2.5 py-2 text-left transition-colors hover:bg-[rgb(var(--ferry-raised))]"
                        >
                          {isSelected && (
                            <motion.span
                              layoutId="route-sel"
                              className="absolute inset-0 rounded-[12px] border border-solid border-[rgb(var(--ferry-accent)/.6)] bg-[rgb(var(--ferry-accent)/.06)] shadow-[0_0_0_3px_rgb(var(--ferry-accent)/.1),0_0_24px_-6px_rgb(var(--ferry-accent)/.5)]"
                              transition={{
                                type: "spring",
                                stiffness: 500,
                                damping: 38,
                              }}
                            />
                          )}
                          <span className="relative">
                            <CurrencyDot c={optionTo} size={30} />
                          </span>
                          <span className="relative min-w-0">
                            <span className="block truncate text-[14px] font-medium text-[rgb(var(--ferry-ink))]">
                              {optionFrom.city}
                              {" to "}
                              {optionTo.city}
                            </span>
                            <span className="block text-[11px] text-[rgb(var(--ferry-faint))]">
                              {optionTo.rail}
                              {", about "}
                              {durationText(optionTo.minutes)}
                            </span>
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </Panel>
        </Frame>
      </div>
    </section>
  );
}
