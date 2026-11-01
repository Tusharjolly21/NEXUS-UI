"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useReducedMotion, useInView } from "framer-motion";
import { getCurrency } from "./data";
import { Globe } from "./globe";
import type { IconName } from "./icons";
import { Frame, Icon, Panel, RollingNumber, SectionHeading } from "./ui";

export const LOCK_SPRING = {
  type: "spring",
  stiffness: 260,
  damping: 26,
} as const;

export const LOCK_SECONDS = 24 * 3600;

export const DIAL_TICKS = 30;

export function RateLock() {
  const rootRef = useRef<HTMLDivElement>(null),
    hasEntered = useInView(rootRef, {
      once: true,
      margin: "-15% 0px",
    }),
    isInView = useInView(rootRef),
    [secondsLeft, setSecondsLeft] = useState(17 * 3600 + 42 * 60 + 9);
  useEffect(() => {
    if (!isInView) return;
    const intervalId = window.setInterval(
      () => setSecondsLeft((seconds) => (seconds > 1 ? seconds - 1 : LOCK_SECONDS)),
      1e3,
    );
    return () => window.clearInterval(intervalId);
  }, [isInView]);
  const litTicks = Math.ceil((secondsLeft / LOCK_SECONDS) * DIAL_TICKS),
    hours = String(Math.floor(secondsLeft / 3600)).padStart(2, "0"),
    minutes = String(Math.floor((secondsLeft % 3600) / 60)).padStart(2, "0"),
    seconds = String(secondsLeft % 60).padStart(2, "0");
  return (
    <div
      ref={rootRef}
      className="relative mx-auto mt-4 h-[180px] w-[180px]"
      role="img"
      aria-label={`Rate held for another ${hours} hours ${minutes} minutes`}
    >
      <svg viewBox="0 0 180 180" className="absolute inset-0 h-full w-full">
        {Array.from(
          {
            length: DIAL_TICKS,
          },
          (_, tickIndex) => {
            const angle = ((-225 + (tickIndex * 270) / (DIAL_TICKS - 1)) * Math.PI) / 180,
              isLit = tickIndex < litTicks;
            return (
              <motion.line
                key={tickIndex}
                x1={(90 + Math.cos(angle) * 56).toFixed(2)}
                y1={(90 + Math.sin(angle) * 56).toFixed(2)}
                x2={(90 + Math.cos(angle) * 76).toFixed(2)}
                y2={(90 + Math.sin(angle) * 76).toFixed(2)}
                strokeWidth={6}
                strokeLinecap="round"
                stroke={isLit ? "rgb(var(--ferry-accent))" : "rgb(var(--ferry-line) / 0.1)"}
                initial={{
                  opacity: 0,
                }}
                animate={{
                  opacity: hasEntered ? (isLit ? 0.45 + 0.55 * (tickIndex / DIAL_TICKS) : 1) : 0,
                }}
                transition={{
                  delay: hasEntered ? tickIndex * 0.03 : 0,
                  duration: 0.3,
                }}
              />
            );
          },
        )}
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">
        <div>
          <div className="ferry-tnum text-[20px] font-medium tracking-[-0.02em] text-[rgb(var(--ferry-ink))]">
            {hours}:{minutes}:{seconds}
          </div>
          <div className="mt-0.5 text-[11px] text-[rgb(var(--ferry-faint))]">left on this rate</div>
        </div>
      </div>
    </div>
  );
}

type SpeedSample = {
  where: string;
  ferry: number;
  swift: number;
};

export const SPEED_SAMPLES: SpeedSample[] = [
  {
    where: "US",
    ferry: 98,
    swift: 7,
  },
  {
    where: "EU",
    ferry: 97,
    swift: 9,
  },
  {
    where: "UK",
    ferry: 99,
    swift: 11,
  },
  {
    where: "India",
    ferry: 92,
    swift: 4,
  },
  {
    where: "Brazil",
    ferry: 96,
    swift: 3,
  },
];

export function SpeedCompare() {
  const rootRef = useRef<HTMLDivElement>(null),
    hasEntered = useInView(rootRef, {
      once: true,
      margin: "-15% 0px",
    }),
    [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  return (
    <div
      ref={rootRef}
      className="relative mt-4 flex flex-1 flex-col rounded-[16px] border border-solid border-[rgb(var(--ferry-line)/.08)] bg-[rgb(var(--ferry-surface))] p-4"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-[13px] font-medium text-[rgb(var(--ferry-ink))]">Paid within 5 minutes</div>
          <div className="mt-0.5 text-[11px] text-[rgb(var(--ferry-mute))]">
            {"Ferry's local rails compared with SWIFT wires"}
          </div>
        </div>
        <div className="text-right">
          <div className="ferry-tnum whitespace-nowrap text-[22px] font-medium leading-none tracking-[-0.02em] text-[rgb(var(--ferry-ink))]">
            +88 pts
          </div>
          <div className="mt-1 text-[11px] text-[rgb(var(--ferry-faint))]">on average</div>
        </div>
      </div>
      <div className="relative mt-4 min-h-[150px] flex-1">
        {[0, 1, 2, 3].map((line) => (
          <span
            key={line}
            aria-hidden="true"
            className="absolute inset-x-0 h-px bg-[rgb(var(--ferry-line)/.06)]"
            style={{
              top: `${(line / 4) * 100}%`,
            }}
          />
        ))}
        <ul className="relative m-0 flex h-full list-none items-end justify-around p-0">
          {SPEED_SAMPLES.map((sample, index) => (
            <li
              key={sample.where}
              className="relative flex h-full flex-col items-center justify-end"
              onPointerEnter={() => setHoveredIndex(index)}
              onPointerLeave={() => setHoveredIndex(null)}
            >
              <AnimatePresence>
                {hoveredIndex === index && (
                  <motion.span
                    initial={{
                      opacity: 0,
                      y: 6,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    exit={{
                      opacity: 0,
                      y: 4,
                    }}
                    transition={{
                      duration: 0.15,
                    }}
                    className="ferry-tnum pointer-events-none absolute -top-2 z-10 whitespace-nowrap rounded-[8px] border border-solid border-[rgb(var(--ferry-line)/.1)] bg-[rgb(var(--ferry-surface))] px-2 py-1 text-[11px] text-[rgb(var(--ferry-ink))] ferry-shadow-lift"
                    style={{
                      x: "-50%",
                      left: "50%",
                    }}
                  >
                    {sample.ferry}
                    {"% "}
                    <span className="text-[rgb(var(--ferry-faint))]">vs</span> {sample.swift}%
                  </motion.span>
                )}
              </AnimatePresence>
              <div
                className="flex h-full items-end gap-1.5"
                aria-label={`${sample.where}: ${sample.ferry}% with Ferry, ${sample.swift}% by SWIFT`}
                role="img"
              >
                <motion.span
                  className="block w-[22px] rounded-[7px] bg-[rgb(var(--ferry-accent))]"
                  initial={{
                    height: 0,
                  }}
                  animate={{
                    height: hasEntered ? `${sample.ferry * 0.92}%` : 0,
                  }}
                  transition={{
                    ...LOCK_SPRING,
                    delay: index * 0.07,
                  }}
                  style={{
                    opacity: hoveredIndex === null || hoveredIndex === index ? 1 : 0.45,
                  }}
                />
                <motion.span
                  className="block w-[22px] rounded-[7px] bg-[rgb(var(--ferry-accent)/.25)]"
                  initial={{
                    height: 0,
                  }}
                  animate={{
                    height: hasEntered ? `${Math.max(4, sample.swift * 0.92)}%` : 0,
                  }}
                  transition={{
                    ...LOCK_SPRING,
                    delay: 0.2 + index * 0.07,
                  }}
                />
              </div>
            </li>
          ))}
        </ul>
      </div>
      <ul className="m-0 mt-2 flex list-none justify-around p-0 text-[11px] text-[rgb(var(--ferry-mute))]">
        {SPEED_SAMPLES.map((sample) => (
          <li key={sample.where} className="w-[50px] text-center">
            {sample.where}
          </li>
        ))}
      </ul>
      <div className="mt-3 flex items-center gap-4 text-[11px] text-[rgb(var(--ferry-faint))]">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-[3px] bg-[rgb(var(--ferry-accent))]" />
          Ferry
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-[3px] bg-[rgb(var(--ferry-accent)/.25)]" />
          SWIFT wire
        </span>
      </div>
    </div>
  );
}

export function ReconciledTile() {
  const rootRef = useRef<HTMLDivElement>(null),
    isInView = useInView(rootRef),
    [total, setTotal] = useState(842930);
  useEffect(() => {
    if (!isInView) return;
    const intervalId = window.setInterval(
      () => setTotal((current) => current + Math.round(180 + Math.random() * 1900)),
      2600,
    );
    return () => window.clearInterval(intervalId);
  }, [isInView]);
  return (
    <div ref={rootRef} className="mt-auto border-t border-solid border-[rgb(var(--ferry-line)/.08)] pt-4">
      <div className="text-[34px] font-medium leading-none tracking-[-0.03em] text-[rgb(var(--ferry-ink))]">
        $<RollingNumber text={total.toLocaleString("en-US")} />
      </div>
      <div className="mt-2 text-[12px] text-[rgb(var(--ferry-faint))]">reconciled today</div>
    </div>
  );
}

type Cutoff = {
  where: string;
  local: string;
  utc: number;
  queued: string;
};

export const CUTOFFS: Cutoff[] = [
  {
    where: "US",
    local: "14:00 ET",
    utc: 19 * 60,
    queued: "$128K",
  },
  {
    where: "EU",
    local: "16:30 CET",
    utc: 15 * 60 + 30,
    queued: "€84K",
  },
  {
    where: "APAC",
    local: "09:15 SGT",
    utc: 75,
    queued: "S$41K",
  },
  {
    where: "UK",
    local: "12:00 GMT",
    utc: 12 * 60,
    queued: "£36K",
  },
];

export const timeLeft = (cutoffUtcMinutes: number, now: Date): string => {
  const nowUtcMinutes = now.getUTCHours() * 60 + now.getUTCMinutes(),
    minutesLeft = (cutoffUtcMinutes - nowUtcMinutes + 1440) % 1440 || 1440;
  return minutesLeft >= 60
    ? `${Math.floor(minutesLeft / 60)}h ${String(minutesLeft % 60).padStart(2, "0")}m`
    : `${minutesLeft}m`;
};

export const LOCK_PAIRS: readonly (readonly [string, string])[] = [
  ["GBP", "INR"],
  ["EUR", "BRL"],
  ["SGD", "AUD"],
  ["USD", "MXN"],
  ["AED", "GBP"],
];

export function RailGlobe() {
  const rootRef = useRef<HTMLDivElement>(null),
    isInView = useInView(rootRef),
    reducedMotion = useReducedMotion(),
    [pairIndex, setPairIndex] = useState(0),
    [launch, setLaunch] = useState(0);
  useEffect(() => {
    if (!isInView || reducedMotion) return;
    const launchTimer = window.setTimeout(() => setLaunch((count) => count + 1), 1300),
      nextPairTimer = window.setTimeout(() => setPairIndex((index) => (index + 1) % LOCK_PAIRS.length), 4800);
    return () => {
      window.clearTimeout(launchTimer);
      window.clearTimeout(nextPairTimer);
    };
  }, [pairIndex, isInView, reducedMotion]);
  const [fromCode, toCode] = LOCK_PAIRS[pairIndex];
  return (
    <div ref={rootRef} className="pointer-events-auto absolute -bottom-[170px] -right-[190px] h-[540px] w-[540px]">
      <Globe from={getCurrency(fromCode)} to={getCurrency(toCode)} launch={launch} tone="accent" frameX={-0.3} frameY={0.42} />
    </div>
  );
}

export function CutoffMap() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const intervalId = window.setInterval(() => setNow(new Date()), 2e4);
    return () => window.clearInterval(intervalId);
  }, []);
  const highlights: readonly (readonly [IconName, string])[] = [
    ["checkmark_seal_fill", "Same-day review of large payouts"],
    ["map_fill", "Cut-off map for every region"],
    ["tray_full_fill", "A release queue finance can see"],
    ["doc_on_doc", "An approval log for auditors"],
  ];
  return (
    <>
      <table className="relative mt-5 w-full border-collapse overflow-hidden rounded-[12px] text-[11px] sm:text-[12px]">
        <caption className="sr-only">Same-day cut-off by region, time left and amount queued</caption>
        <tbody>
          {CUTOFFS.map((cutoff) => (
            <tr
              key={cutoff.where}
              className="border border-solid border-[rgb(var(--ferry-line)/.08)] bg-[rgb(var(--ferry-surface))]"
            >
              <th
                scope="row"
                className="whitespace-nowrap px-2 py-2.5 text-left font-medium text-[rgb(var(--ferry-ink))] sm:px-3"
              >
                {cutoff.where}
              </th>
              <td className="ferry-tnum whitespace-nowrap border-l border-solid border-[rgb(var(--ferry-line)/.08)] px-2 py-2.5 text-[rgb(var(--ferry-mute))] sm:px-3">
                {cutoff.local}
              </td>
              <td className="ferry-tnum whitespace-nowrap border-l border-solid border-[rgb(var(--ferry-line)/.08)] px-2 py-2.5 text-[rgb(var(--ferry-accent-ink))] sm:px-3">
                {"in "}
                {timeLeft(cutoff.utc, now)}
              </td>
              <td className="ferry-tnum whitespace-nowrap border-l border-solid border-[rgb(var(--ferry-line)/.08)] px-2 py-2.5 text-right font-medium text-[rgb(var(--ferry-ink))] sm:px-3">
                {cutoff.queued}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <ul className="relative m-0 mt-5 grid list-none gap-1 p-0">
        {highlights.map(([iconName, text]) => (
          <li
            key={text}
            className="flex items-center gap-3 rounded-[10px] px-1 py-1.5 text-[13px] text-[rgb(var(--ferry-ink))]"
          >
            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-[8px] border border-solid border-[rgb(var(--ferry-line)/.08)] bg-[rgb(var(--ferry-surface))] text-[rgb(var(--ferry-accent-ink))]">
              <Icon name={iconName} size={13} />
            </span>
            {text}
          </li>
        ))}
      </ul>
    </>
  );
}

export const FLOW_PATH_A = "M128,31 C160,31 160,75 192,75";

export const FLOW_PATH_B = "M128,119 C160,119 160,75 192,75";

export function WebhookFlow() {
  return (
    <div className="relative h-[150px] w-[300px] max-w-full shrink-0 overflow-hidden rounded-[18px] border border-solid border-[rgb(var(--ferry-line)/.08)] bg-[rgb(var(--ferry-raised))]">
      <div
        className="absolute left-1/2 top-1/2 h-[150px] w-[300px]"
        style={{
          transform: "translate(-50%,-50%)",
        }}
      >
        <svg width="300" height="150" className="absolute inset-0">
          <path
            d={FLOW_PATH_A}
            fill="none"
            stroke="rgb(var(--ferry-accent))"
            strokeOpacity={0.5}
            strokeWidth={1.5}
          />
          <path
            d={FLOW_PATH_B}
            fill="none"
            stroke="rgb(var(--ferry-line))"
            strokeOpacity={0.2}
            strokeWidth={1.5}
            strokeDasharray="3 4"
          />
        </svg>
        <span
          aria-hidden="true"
          className="ferry-travel absolute left-0 top-0 h-2 w-2 rounded-full bg-[rgb(var(--ferry-accent))] shadow-[0_0_10px_rgb(var(--ferry-accent))]"
          style={{
            offsetPath: `path('${FLOW_PATH_A}')`,
          }}
        />
        <span
          aria-hidden="true"
          className="ferry-travel absolute left-0 top-0 h-2 w-2 rounded-full bg-[rgb(var(--ferry-accent))] shadow-[0_0_10px_rgb(var(--ferry-accent))]"
          style={{
            offsetPath: `path('${FLOW_PATH_B}')`,
            animationDelay: "1.3s",
          }}
        />
        {(
          [
            {
              y: 14,
              label: "payout.created",
              icon: "bolt_fill",
            },
            {
              y: 102,
              label: "payout.arrived",
              icon: "checkmark",
            },
          ] as const
        ).map((event) => (
          <span
            key={event.label}
            className="absolute left-[10px] flex h-[34px] w-[118px] items-center gap-1.5 rounded-[9px] border border-solid border-[rgb(var(--ferry-line)/.1)] bg-[rgb(var(--ferry-surface))] px-2 text-[10px] text-[rgb(var(--ferry-ink))] shadow-[0_6px_14px_-8px_rgb(0_0_0/.3)]"
            style={{
              top: event.y,
            }}
          >
            <Icon name={event.icon} size={10} className="shrink-0 text-[rgb(var(--ferry-accent-ink))]" />
            <span className="font-mono">{event.label}</span>
          </span>
        ))}
        <span className="absolute left-[192px] top-[56px] flex h-[38px] w-[98px] items-center gap-1.5 rounded-[9px] border border-solid border-[rgb(var(--ferry-accent)/.4)] bg-[rgb(var(--ferry-surface))] px-2 text-[11px] font-medium text-[rgb(var(--ferry-ink))] shadow-[0_6px_14px_-8px_rgb(0_0_0/.3)]">
          <span className="h-1.5 w-1.5 rounded-full bg-[rgb(var(--ferry-gain))]" />
          Your server
        </span>
      </div>
    </div>
  );
}

export function Product() {
  return (
    <section id="product" className="scroll-mt-24 px-3 py-24 sm:px-6 sm:py-32">
      <SectionHeading
        label="Product"
        title="Every payment path built for speed and control."
        sub="Ferry gives finance teams one place for accounts, exchange, payouts and approvals, with every number visible before money moves."
      />
      <Frame className="mx-auto mt-12 max-w-[1160px]">
        <div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-[280px_minmax(0,1fr)_minmax(380px,1.08fr)] lg:grid-rows-[360px_360px_290px]">
          <Panel as="article" edge={true} className="p-5 sm:p-6 lg:col-start-1 lg:row-start-1">
            <h3 className="m-0 text-[22px] font-medium leading-[1.1] tracking-[-0.02em] text-[rgb(var(--ferry-ink))]">
              Lock a rate for 24 hours.
            </h3>
            <RateLock />
            <p className="m-0 mt-1 text-center text-[12px] text-[rgb(var(--ferry-mute))]">
              1 USD = 0.9233 EUR, held
            </p>
          </Panel>
          <Panel as="article" edge={true} className="flex flex-col p-5 sm:p-6 lg:col-start-1 lg:row-start-2">
            <h3 className="m-0 text-[22px] font-medium leading-[1.1] tracking-[-0.02em] text-[rgb(var(--ferry-ink))]">
              Every transaction reconciled as it lands.
            </h3>
            <p className="m-0 mt-3 text-[14px] leading-[1.55] text-[rgb(var(--ferry-mute))]">
              Payouts, conversions and fees match your ledger on their own, with the rate and fee on separate
              lines.
            </p>
            <ReconciledTile />
          </Panel>
          <Panel
            as="article"
            edge={true}
            className="flex flex-col p-5 sm:p-6 lg:col-start-2 lg:row-span-2 lg:row-start-1"
          >
            <h3 className="m-0 max-w-[13em] text-[26px] font-medium leading-[1.08] tracking-[-0.02em] text-[rgb(var(--ferry-ink))]">
              Pay out over the fastest local rail.
            </h3>
            <p className="m-0 mt-3 max-w-[30em] text-[14px] leading-[1.55] text-[rgb(var(--ferry-mute))]">
              {
                "Each payout goes over the destination country's own instant network, so it lands in minutes instead of days through correspondent banks."
              }
            </p>
            <SpeedCompare />
            <div className="mt-4 border-t border-solid border-[rgb(var(--ferry-line)/.08)] pt-4">
              <div className="ferry-tnum text-[34px] font-medium leading-none tracking-[-0.03em] text-[rgb(var(--ferry-ink))]">
                97.8%
              </div>
              <div className="mt-2 text-[12px] text-[rgb(var(--ferry-faint))]">
                of payouts land on the first try
              </div>
            </div>
          </Panel>
          <Panel
            as="article"
            edge={true}
            glow={true}
            className="relative p-5 pb-[330px] sm:p-6 sm:pb-[340px] md:col-span-2 lg:col-span-1 lg:col-start-3 lg:row-span-3 lg:row-start-1 lg:pb-6"
          >
            <h3 className="relative m-0 max-w-[13em] text-[26px] font-medium leading-[1.08] tracking-[-0.02em] text-[rgb(var(--ferry-ink))]">
              Cut-offs planned before money moves.
            </h3>
            <p className="relative m-0 mt-3 max-w-[30em] text-[14px] leading-[1.55] text-[rgb(var(--ferry-mute))]">
              {
                "Finance and operations share one schedule for approvals, releases and each region's last call for same-day payouts."
              }
            </p>
            <CutoffMap />
            <RailGlobe />
            <div className="pointer-events-none absolute bottom-5 left-5 sm:bottom-6 sm:left-6">
              <div className="ferry-tnum text-[34px] font-medium leading-none tracking-[-0.03em] text-[rgb(var(--ferry-ink))]">
                160
              </div>
              <div className="mt-2 text-[12px] text-[rgb(var(--ferry-faint))]">countries you can pay</div>
            </div>
          </Panel>
          <Panel
            as="article"
            edge={true}
            className="flex flex-col gap-6 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6 md:col-span-2 lg:col-span-2 lg:col-start-1 lg:row-start-3"
          >
            <div className="min-w-0">
              <h3 className="m-0 max-w-[14em] text-[26px] font-medium leading-[1.08] tracking-[-0.02em] text-[rgb(var(--ferry-ink))]">
                Developers get webhooks, not support tickets.
              </h3>
              <p className="m-0 mt-2 text-[14px] text-[rgb(var(--ferry-mute))]">
                A signed event for every status change.
              </p>
              <ul className="m-0 mt-5 grid max-w-[260px] list-none gap-2 p-0">
                {["Signed payloads", "Replay any event for 30 days"].map((feature) => (
                  <li
                    key={feature}
                    className="flex items-center gap-2 rounded-[8px] border border-solid border-[rgb(var(--ferry-line)/.1)] bg-[rgb(var(--ferry-surface))] px-3 py-2 text-[13px] text-[rgb(var(--ferry-ink))]"
                  >
                    <Icon name="checkmark" size={11} className="text-[rgb(var(--ferry-accent-ink))]" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
            <WebhookFlow />
          </Panel>
        </div>
      </Frame>
    </section>
  );
}
