// @ts-nocheck -- temporary during decompile cleanup
"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useReducedMotion, useInView } from "framer-motion";
import { getCurrency } from "./data";
import { Globe } from "./globe";
import { Frame, Icon, Panel, RollingNumber, SectionHeading } from "./ui";

export const LOCK_SPRING = {
  type: "spring",
  stiffness: 260,
  damping: 26,
};

export const LOCK_SECONDS = 24 * 3600;

export const DIAL_TICKS = 30;

export function RateLock() {
  const e = useRef(null),
    t = useInView(e, {
      once: !0,
      margin: "-15% 0px",
    }),
    n = useInView(e),
    [r, i] = useState(17 * 3600 + 42 * 60 + 9);
  useEffect(() => {
    if (!n) return;
    const u = window.setInterval(() => i((d) => (d > 1 ? d - 1 : LOCK_SECONDS)), 1e3);
    return () => window.clearInterval(u);
  }, [n]);
  const s = Math.ceil((r / LOCK_SECONDS) * DIAL_TICKS),
    o = String(Math.floor(r / 3600)).padStart(2, "0"),
    l = String(Math.floor((r % 3600) / 60)).padStart(2, "0"),
    c = String(r % 60).padStart(2, "0");
  return (
    <div
      ref={e}
      className="relative mx-auto mt-4 h-[180px] w-[180px]"
      role="img"
      aria-label={`Rate held for another ${o} hours ${l} minutes`}
    >
      <svg viewBox="0 0 180 180" className="absolute inset-0 h-full w-full">
        {Array.from(
          {
            length: DIAL_TICKS,
          },
          (u, d) => {
            const f = ((-225 + (d * 270) / (DIAL_TICKS - 1)) * Math.PI) / 180,
              h = d < s;
            return (
              <motion.line
                key={d}
                x1={(90 + Math.cos(f) * 56).toFixed(2)}
                y1={(90 + Math.sin(f) * 56).toFixed(2)}
                x2={(90 + Math.cos(f) * 76).toFixed(2)}
                y2={(90 + Math.sin(f) * 76).toFixed(2)}
                strokeWidth={6}
                strokeLinecap="round"
                stroke={h ? "rgb(var(--ferry-accent))" : "rgb(var(--ferry-line) / 0.1)"}
                initial={{
                  opacity: 0,
                }}
                animate={{
                  opacity: t ? (h ? 0.45 + 0.55 * (d / DIAL_TICKS) : 1) : 0,
                }}
                transition={{
                  delay: t ? d * 0.03 : 0,
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
            {o}:{l}:{c}
          </div>
          <div className="mt-0.5 text-[11px] text-[rgb(var(--ferry-faint))]">left on this rate</div>
        </div>
      </div>
    </div>
  );
}

export const SPEED_SAMPLES = [
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
  const e = useRef(null),
    t = useInView(e, {
      once: !0,
      margin: "-15% 0px",
    }),
    [n, r] = useState(null);
  return (
    <div
      ref={e}
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
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            aria-hidden="true"
            className="absolute inset-x-0 h-px bg-[rgb(var(--ferry-line)/.06)]"
            style={{
              top: `${(i / 4) * 100}%`,
            }}
          />
        ))}
        <ul className="relative m-0 flex h-full list-none items-end justify-around p-0">
          {SPEED_SAMPLES.map((i, s) => (
            <li
              key={i.where}
              className="relative flex h-full flex-col items-center justify-end"
              onPointerEnter={() => r(s)}
              onPointerLeave={() => r(null)}
            >
              <AnimatePresence>
                {n === s && (
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
                    {i.ferry}
                    {"% "}
                    <span className="text-[rgb(var(--ferry-faint))]">vs</span> {i.swift}%
                  </motion.span>
                )}
              </AnimatePresence>
              <div
                className="flex h-full items-end gap-1.5"
                aria-label={`${i.where}: ${i.ferry}% with Ferry, ${i.swift}% by SWIFT`}
                role="img"
              >
                <motion.span
                  className="block w-[22px] rounded-[7px] bg-[rgb(var(--ferry-accent))]"
                  initial={{
                    height: 0,
                  }}
                  animate={{
                    height: t ? `${i.ferry * 0.92}%` : 0,
                  }}
                  transition={{
                    ...LOCK_SPRING,
                    delay: s * 0.07,
                  }}
                  style={{
                    opacity: n === null || n === s ? 1 : 0.45,
                  }}
                />
                <motion.span
                  className="block w-[22px] rounded-[7px] bg-[rgb(var(--ferry-accent)/.25)]"
                  initial={{
                    height: 0,
                  }}
                  animate={{
                    height: t ? `${Math.max(4, i.swift * 0.92)}%` : 0,
                  }}
                  transition={{
                    ...LOCK_SPRING,
                    delay: 0.2 + s * 0.07,
                  }}
                />
              </div>
            </li>
          ))}
        </ul>
      </div>
      <ul className="m-0 mt-2 flex list-none justify-around p-0 text-[11px] text-[rgb(var(--ferry-mute))]">
        {SPEED_SAMPLES.map((i) => (
          <li key={i.where} className="w-[50px] text-center">
            {i.where}
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
  const e = useRef(null),
    t = useInView(e),
    [n, r] = useState(842930);
  return (
    useEffect(() => {
      if (!t) return;
      const i = window.setInterval(() => r((s) => s + Math.round(180 + Math.random() * 1900)), 2600);
      return () => window.clearInterval(i);
    }, [t]),
    (
      <div ref={e} className="mt-auto border-t border-solid border-[rgb(var(--ferry-line)/.08)] pt-4">
        <div className="text-[34px] font-medium leading-none tracking-[-0.03em] text-[rgb(var(--ferry-ink))]">
          $<RollingNumber text={n.toLocaleString("en-US")} />
        </div>
        <div className="mt-2 text-[12px] text-[rgb(var(--ferry-faint))]">reconciled today</div>
      </div>
    )
  );
}

export const CUTOFFS = [
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

export const timeLeft = (e, t) => {
  const n = t.getUTCHours() * 60 + t.getUTCMinutes(),
    r = (e - n + 1440) % 1440 || 1440;
  return r >= 60 ? `${Math.floor(r / 60)}h ${String(r % 60).padStart(2, "0")}m` : `${r}m`;
};

export const LOCK_PAIRS = [
  ["GBP", "INR"],
  ["EUR", "BRL"],
  ["SGD", "AUD"],
  ["USD", "MXN"],
  ["AED", "GBP"],
];

export function RailGlobe() {
  const e = useRef(null),
    t = useInView(e),
    n = useReducedMotion(),
    [r, i] = useState(0),
    [s, o] = useState(0);
  useEffect(() => {
    if (!t || n) return;
    const u = window.setTimeout(() => o((f) => f + 1), 1300),
      d = window.setTimeout(() => i((f) => (f + 1) % LOCK_PAIRS.length), 4800);
    return () => {
      (window.clearTimeout(u), window.clearTimeout(d));
    };
  }, [r, t, n]);
  const [l, c] = LOCK_PAIRS[r];
  return (
    <div ref={e} className="pointer-events-auto absolute -bottom-[170px] -right-[190px] h-[540px] w-[540px]">
      <Globe from={getCurrency(l)} to={getCurrency(c)} launch={s} tone="accent" frameX={-0.3} frameY={0.42} />
    </div>
  );
}

export function CutoffMap() {
  const [e, t] = useState(() => new Date());
  useEffect(() => {
    const r = window.setInterval(() => t(new Date()), 2e4);
    return () => window.clearInterval(r);
  }, []);
  const n = [
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
          {CUTOFFS.map((r) => (
            <tr
              key={r.where}
              className="border border-solid border-[rgb(var(--ferry-line)/.08)] bg-[rgb(var(--ferry-surface))]"
            >
              <th
                scope="row"
                className="whitespace-nowrap px-2 py-2.5 text-left font-medium text-[rgb(var(--ferry-ink))] sm:px-3"
              >
                {r.where}
              </th>
              <td className="ferry-tnum whitespace-nowrap border-l border-solid border-[rgb(var(--ferry-line)/.08)] px-2 py-2.5 text-[rgb(var(--ferry-mute))] sm:px-3">
                {r.local}
              </td>
              <td className="ferry-tnum whitespace-nowrap border-l border-solid border-[rgb(var(--ferry-line)/.08)] px-2 py-2.5 text-[rgb(var(--ferry-accent-ink))] sm:px-3">
                {"in "}
                {timeLeft(r.utc, e)}
              </td>
              <td className="ferry-tnum whitespace-nowrap border-l border-solid border-[rgb(var(--ferry-line)/.08)] px-2 py-2.5 text-right font-medium text-[rgb(var(--ferry-ink))] sm:px-3">
                {r.queued}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <ul className="relative m-0 mt-5 grid list-none gap-1 p-0">
        {n.map(([r, i]) => (
          <li
            key={i}
            className="flex items-center gap-3 rounded-[10px] px-1 py-1.5 text-[13px] text-[rgb(var(--ferry-ink))]"
          >
            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-[8px] border border-solid border-[rgb(var(--ferry-line)/.08)] bg-[rgb(var(--ferry-surface))] text-[rgb(var(--ferry-accent-ink))]">
              <Icon name={r} size={13} />
            </span>
            {i}
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
        {[
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
        ].map((e) => (
          <span
            key={e.label}
            className="absolute left-[10px] flex h-[34px] w-[118px] items-center gap-1.5 rounded-[9px] border border-solid border-[rgb(var(--ferry-line)/.1)] bg-[rgb(var(--ferry-surface))] px-2 text-[10px] text-[rgb(var(--ferry-ink))] shadow-[0_6px_14px_-8px_rgb(0_0_0/.3)]"
            style={{
              top: e.y,
            }}
          >
            <Icon name={e.icon} size={10} className="shrink-0 text-[rgb(var(--ferry-accent-ink))]" />
            <span className="font-mono">{e.label}</span>
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
          <Panel as="article" edge={!0} className="p-5 sm:p-6 lg:col-start-1 lg:row-start-1">
            <h3 className="m-0 text-[22px] font-medium leading-[1.1] tracking-[-0.02em] text-[rgb(var(--ferry-ink))]">
              Lock a rate for 24 hours.
            </h3>
            <RateLock />
            <p className="m-0 mt-1 text-center text-[12px] text-[rgb(var(--ferry-mute))]">
              1 USD = 0.9233 EUR, held
            </p>
          </Panel>
          <Panel as="article" edge={!0} className="flex flex-col p-5 sm:p-6 lg:col-start-1 lg:row-start-2">
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
            edge={!0}
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
            edge={!0}
            glow={!0}
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
            edge={!0}
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
                {["Signed payloads", "Replay any event for 30 days"].map((e) => (
                  <li
                    key={e}
                    className="flex items-center gap-2 rounded-[8px] border border-solid border-[rgb(var(--ferry-line)/.1)] bg-[rgb(var(--ferry-surface))] px-3 py-2 text-[13px] text-[rgb(var(--ferry-ink))]"
                  >
                    <Icon name="checkmark" size={11} className="text-[rgb(var(--ferry-accent-ink))]" />
                    {e}
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
