// @ts-nocheck -- temporary during decompile cleanup
"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence, useReducedMotion, useInView } from "framer-motion";
import { Badge, Frame, Icon, Panel, seededRandom, smoothPath, useElementWidth } from "./ui";

export const TREASURY_STATS = [
  {
    label: "Total balance",
    value: "$959,032",
    delta: "+3.2%",
    hint: "across 5 currencies",
  },
  {
    label: "Converted this month",
    value: "$1.84M",
    delta: "+12.4%",
    hint: "at the mid-market rate",
  },
  {
    label: "Average arrival",
    value: "4m 12s",
    delta: "38s faster",
    hint: "for payouts this week",
  },
];

export const RAIL_SUCCESS = [
  {
    rail: "Faster Payments",
    where: "UK",
    rate: 99.2,
  },
  {
    rail: "SEPA Instant",
    where: "EU",
    rate: 98.1,
  },
  {
    rail: "Pix",
    where: "Brazil",
    rate: 97.4,
  },
  {
    rail: "FAST",
    where: "Singapore",
    rate: 96.8,
  },
  {
    rail: "IMPS",
    where: "India",
    rate: 94.6,
  },
  {
    rail: "NIP",
    where: "Nigeria",
    rate: 93.9,
  },
];

export const CARDS = [
  {
    name: "Settlement",
    kind: "Virtual card",
    last4: "7721",
    holder: "Northwind Ltd",
    exp: "11/28",
    spend: [
      ["Northwind Cloud", "Today", "$3,212.40"],
      ["Payroll fees", "Yesterday", "$412.00"],
      ["Stripe", "Oct 29", "$88.20"],
    ],
  },
  {
    name: "Travel",
    kind: "Physical card",
    last4: "4410",
    holder: "Maya Chen",
    exp: "04/29",
    spend: [
      ["Lufthansa", "Today", "€1,180.00"],
      ["Hotel Adlon", "Oct 30", "€642.50"],
      ["Uber", "Oct 30", "€24.90"],
    ],
  },
  {
    name: "Software",
    kind: "Virtual card",
    last4: "0932",
    holder: "Engineering",
    exp: "08/27",
    spend: [
      ["GitHub", "Today", "$840.00"],
      ["Figma", "Oct 28", "$540.00"],
      ["Linear", "Oct 27", "$192.00"],
    ],
  },
];

export const REGION_BALANCES = [
  {
    where: "US",
    amount: "$128.4K",
    state: "Settled",
    tone: "gain",
  },
  {
    where: "EU",
    amount: "€84.1K",
    state: "Clearing",
    tone: "amber",
  },
  {
    where: "UK",
    amount: "£36.8K",
    state: "Settled",
    tone: "gain",
  },
];

export const HISTORY_DAYS = 30;

export const CHART_HEIGHT = 236;

export const daysAgo = (e) => {
  const t = new Date();
  return (t.setDate(t.getDate() - e), t);
};

export const formatDay = (e) =>
  e.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

export function buildBalanceSeries() {
  const e = seededRandom("balance"),
    t = [0];
  for (let i = 1; i <= HISTORY_DAYS; i++)
    t.push(t[i - 1] + 0.6 + (e() - 0.42) * 2.4 + Math.sin(i / 3.2) * 0.9);
  const n = Math.min(...t),
    r = Math.max(...t);
  return t.map((i) => 742e3 + ((i - n) / (r - n)) * 217032 * (i === t[HISTORY_DAYS] ? 1 : 0.985));
}

export function BalanceChart() {
  const e = useReducedMotion(),
    t = useMemo(buildBalanceSeries, []),
    [n, r] = useElementWidth(520),
    [i, s] = useState(null),
    o = useInView(n, {
      once: !0,
      margin: "-10% 0px",
    }),
    l = Math.min(...t),
    c = Math.max(...t),
    u = (p) => 6 + (p / HISTORY_DAYS) * (r - 12),
    d = (p) => 14 + (1 - (p - l) / (c - l)) * (CHART_HEIGHT - 44),
    f = smoothPath(t.map((p, m) => [u(m), d(p)])),
    h = (p) => {
      const m = p.currentTarget.getBoundingClientRect();
      s(
        Math.max(
          0,
          Math.min(HISTORY_DAYS, Math.round(((p.clientX - m.left - 6) / (m.width - 12)) * HISTORY_DAYS)),
        ),
      );
    },
    x = (p) => {
      if (p.key === "ArrowLeft") s((m) => Math.max(0, (m ?? HISTORY_DAYS) - 1));
      else if (p.key === "ArrowRight") s((m) => Math.min(HISTORY_DAYS, (m ?? HISTORY_DAYS) + 1));
      else if (p.key === "Escape") s(null);
      else return;
      p.preventDefault();
    },
    w = [0, 7, 15, 23, 30],
    y = i === null ? 0 : Math.max(70, Math.min(r - 70, u(i))),
    v = i === null ? 0 : t[i] - t[Math.max(0, i - 1)];
  return (
    <div
      ref={n}
      tabIndex={0}
      role="img"
      aria-label={`Total balance over the last 30 days, from $${Math.round(t[0]).toLocaleString("en-US")} to $${Math.round(t[HISTORY_DAYS]).toLocaleString("en-US")}. Use the arrow keys to read a day.`}
      onPointerMove={h}
      onPointerDown={h}
      onPointerLeave={() => s(null)}
      onBlur={() => s(null)}
      onKeyDown={x}
      className="relative mt-4 touch-pan-y select-none rounded-[10px] outline-offset-4"
      style={{
        height: CHART_HEIGHT,
      }}
    >
      <svg width={r} height={CHART_HEIGHT} className="absolute inset-0 overflow-visible">
        <defs>
          <linearGradient id="bal-stroke" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0" stopColor="rgb(var(--ferry-accent))" stopOpacity="0.25" />
            <stop offset="0.45" stopColor="rgb(var(--ferry-accent))" stopOpacity="0.9" />
            <stop offset="1" stopColor="rgb(var(--ferry-accent))" />
          </linearGradient>
        </defs>
        <line
          x1={0}
          x2={r}
          y1={CHART_HEIGHT - 26}
          y2={CHART_HEIGHT - 26}
          stroke="rgb(var(--ferry-line))"
          strokeOpacity={0.08}
        />
        <motion.path
          d={f}
          fill="none"
          stroke="url(#bal-stroke)"
          strokeWidth={2.25}
          strokeLinecap="round"
          initial={
            e
              ? !1
              : {
                  pathLength: 0,
                }
          }
          animate={{
            pathLength: o || e ? 1 : 0,
          }}
          transition={{
            duration: 1.4,
            ease: [0.3, 0, 0.2, 1],
          }}
        />
        {i !== null && (
          <>
            <line
              x1={u(i)}
              x2={u(i)}
              y1={d(t[i])}
              y2={CHART_HEIGHT - 26}
              stroke="rgb(var(--ferry-accent))"
              strokeOpacity={0.35}
            />
            <circle
              cx={u(i)}
              cy={d(t[i])}
              r={4.5}
              fill="rgb(var(--ferry-surface))"
              stroke="rgb(var(--ferry-accent))"
              strokeWidth={2}
            />
          </>
        )}
        {w.map((p) => (
          <text
            key={p}
            x={u(p)}
            y={CHART_HEIGHT - 6}
            textAnchor={p === 0 ? "start" : p === HISTORY_DAYS ? "end" : "middle"}
            className="fill-[rgb(var(--ferry-faint))] text-[11px]"
            opacity={i === null ? 1 : 0.35}
          >
            {formatDay(daysAgo(HISTORY_DAYS - p))}
          </text>
        ))}
      </svg>
      <AnimatePresence>
        {i !== null && (
          <motion.div
            initial={{
              opacity: 0,
              y: 4,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            exit={{
              opacity: 0,
            }}
            transition={{
              duration: 0.15,
            }}
            className="pointer-events-none absolute rounded-[10px] border border-solid border-[rgb(var(--ferry-line)/.1)] bg-[rgb(var(--ferry-surface))] px-2.5 py-2 ferry-shadow-lift"
            style={{
              left: y,
              top: Math.max(0, d(t[i]) - 78),
              x: "-50%",
            }}
          >
            <div className="text-[10px] font-medium uppercase tracking-[0.14em] text-[rgb(var(--ferry-faint))]">
              {formatDay(daysAgo(HISTORY_DAYS - i))}
            </div>
            <div className="ferry-tnum mt-0.5 text-[15px] font-medium text-[rgb(var(--ferry-ink))]">
              ${Math.round(t[i]).toLocaleString("en-US")}
            </div>
            <div className="ferry-tnum text-[11px] text-[rgb(var(--ferry-mute))]">
              {v >= 0 ? "Net in" : "Net out"}
              {" $"}
              {Math.abs(Math.round(v)).toLocaleString("en-US")}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {i !== null && (
        <span
          className="ferry-tnum pointer-events-none absolute bottom-0 rounded-md border border-solid border-[rgb(var(--ferry-line)/.1)] bg-[rgb(var(--ferry-surface))] px-1.5 py-0.5 text-[11px] font-medium text-[rgb(var(--ferry-ink))]"
          style={{
            left: Math.max(24, Math.min(r - 24, u(i))),
            transform: "translateX(-50%)",
          }}
        >
          {formatDay(daysAgo(HISTORY_DAYS - i))}
        </span>
      )}
    </div>
  );
}

export function CardFace({ c: e, front: t }) {
  return (
    <div
      className="relative h-full w-full overflow-hidden rounded-[16px] border border-solid border-white/10 p-4 text-white"
      style={{
        background: "linear-gradient(135deg,#07080c 0%,#101a3a 52%,#07080c 100%)",
      }}
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -right-10 -top-16 h-44 w-44 rounded-full"
        style={{
          background: "radial-gradient(closest-side, rgba(39,103,255,.55), transparent)",
        }}
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background: "linear-gradient(115deg, transparent 30%, rgba(255,255,255,.07) 45%, transparent 60%)",
        }}
      />
      <div className="relative flex items-start justify-between">
        <span className="flex items-center gap-2 text-[11px] font-medium tracking-[0.24em] text-white/80">
          <span className="grid h-5 w-5 place-items-center rounded-full bg-white text-[#0a0a0a]">
            <Icon name="globe" size={12} />
          </span>
          FERRY
        </span>
        <span className="text-right">
          <span className="block text-[9px] font-medium tracking-[0.18em] text-[#8db0ff]">ISSUED</span>
          <span className="block text-[11px] text-white/85">{e.name}</span>
        </span>
      </div>
      <div
        className={`relative mt-4 flex items-center gap-3 transition-opacity ${t ? "opacity-100" : "opacity-60"}`}
      >
        <span
          aria-hidden="true"
          className="relative h-[22px] w-[30px] overflow-hidden rounded-[5px]"
          style={{
            background: "linear-gradient(135deg,#f6dc8a,#c79a35 60%,#e9c86b)",
          }}
        >
          <span className="absolute inset-x-0 top-1/2 h-px bg-black/25" />
          <span className="absolute inset-y-0 left-1/3 w-px bg-black/25" />
          <span className="absolute inset-y-0 right-1/3 w-px bg-black/25" />
        </span>
        <Icon name="dot_radiowaves_right" size={14} className="text-white/60" />
      </div>
      <div className="relative mt-3 text-[9px] font-medium tracking-[0.18em] text-white/45">
        {e.kind.toUpperCase()}
      </div>
      <div className="ferry-tnum relative mt-0.5 text-[15px] font-medium tracking-[0.16em]">
        {"•••• "}
        {e.last4}
      </div>
      <div className="relative mt-3 flex items-end justify-between">
        <span>
          <span className="block text-[9px] font-medium tracking-[0.18em] text-white/45">CARDHOLDER</span>
          <span className="block text-[12px]">{e.holder}</span>
        </span>
        <span className="text-right">
          <span className="block text-[9px] font-medium tracking-[0.18em] text-white/45">EXPIRES</span>
          <span className="ferry-tnum block text-[12px]">{e.exp}</span>
        </span>
      </div>
    </div>
  );
}

export function CardStack({ onFront: e }) {
  const t = useReducedMotion(),
    [n, r] = useState([0, 1, 2]),
    [i, s] = useState(null),
    o = () => {
      (s(n[0]), r((c) => [...c.slice(1), c[0]]), e(n[1]));
    },
    l = CARDS[n[0]];
  return (
    <div>
      <button
        type="button"
        onClick={o}
        aria-label={`${l.name} card ending ${l.last4}. Show the next card.`}
        className="group relative block w-full rounded-[18px] border-0 bg-transparent p-0 text-left"
      >
        <span
          aria-hidden="true"
          className="block"
          style={{
            aspectRatio: "1.586",
            marginBottom: 44,
          }}
        />
        {CARDS.map((c, u) => {
          const d = n.indexOf(u);
          return (
            <motion.span
              key={c.last4}
              className="absolute inset-x-0 top-0 block"
              style={{
                aspectRatio: "1.586",
                zIndex: 3 - d,
                transformPerspective: 900,
                originY: 0,
              }}
              initial={!1}
              animate={{
                y: 44 - d * 22,
                scale: 1 - d * 0.06,
                rotateX: d * 14,
                x: i === u && !t ? [0, 34, 0] : 0,
                filter: d === 0 ? "brightness(1)" : `brightness(${1 - d * 0.18})`,
              }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 30,
                x: {
                  duration: 0.55,
                  ease: [0.3, 0, 0.2, 1],
                },
              }}
              whileHover={
                d === 0
                  ? {
                      y: 38,
                    }
                  : void 0
              }
              onAnimationComplete={() => i === u && s(null)}
            >
              <CardFace c={c} front={d === 0} />
            </motion.span>
          );
        })}
      </button>
      <p className="m-0 mt-3 text-center text-[12px] text-[rgb(var(--ferry-faint))]">
        Tap the card to see the next one.
      </p>
    </div>
  );
}

export function Treasury() {
  const [e, t] = useState(0),
    n = CARDS[e];
  return (
    <section id="accounts" className="scroll-mt-24 px-3 pt-16 sm:px-6 sm:pt-20">
      <Frame className="mx-auto max-w-[1160px]">
        <div className="grid grid-cols-1 gap-2 lg:grid-cols-[minmax(0,1fr)_340px]">
          <Panel glow={!0} className="p-4 sm:p-6">
            <div className="relative flex flex-wrap items-center justify-between gap-3">
              <p className="m-0 text-[11px] font-medium uppercase tracking-[0.2em] text-[rgb(var(--ferry-faint))]">
                Live treasury
              </p>
              <span className="inline-flex items-center gap-2 rounded-full border border-solid border-[rgb(var(--ferry-line)/.1)] bg-[rgb(var(--ferry-surface))] px-2.5 py-1 text-[12px] text-[rgb(var(--ferry-mute))]">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inset-0 animate-ping rounded-full bg-[rgb(var(--ferry-gain)/.6)] motion-reduce:animate-none" />
                  <span className="relative h-1.5 w-1.5 rounded-full bg-[rgb(var(--ferry-gain))]" />
                </span>
                All rails settling
              </span>
            </div>
            <h2 className="relative m-0 mt-3 max-w-[15em] text-balance text-[clamp(28px,3.2vw,42px)] font-medium leading-[1] tracking-[-0.025em] text-[rgb(var(--ferry-ink))]">
              Balances, rates and payouts in one treasury view.
            </h2>
            <ul className="relative m-0 mt-6 grid list-none grid-cols-1 gap-3 p-0 sm:grid-cols-3">
              {TREASURY_STATS.map((r) => (
                <li
                  key={r.label}
                  className="rounded-[16px] border border-solid border-[rgb(var(--ferry-line)/.08)] bg-[rgb(var(--ferry-surface))] p-4"
                >
                  <div className="text-[12px] text-[rgb(var(--ferry-mute))]">{r.label}</div>
                  <div className="mt-3 flex items-end justify-between gap-2">
                    <span className="ferry-tnum text-[28px] font-medium leading-none tracking-[-0.025em] text-[rgb(var(--ferry-ink))]">
                      {r.value}
                    </span>
                    <Badge tone="gain">{r.delta}</Badge>
                  </div>
                  <div className="mt-2 text-[11px] text-[rgb(var(--ferry-faint))]">{r.hint}</div>
                </li>
              ))}
            </ul>
            <div className="relative mt-3 grid grid-cols-1 gap-3 md:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
              <div className="rounded-[16px] border border-solid border-[rgb(var(--ferry-line)/.08)] bg-[rgb(var(--ferry-surface))] p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-[14px] font-medium text-[rgb(var(--ferry-ink))]">Total balance</div>
                    <div className="mt-0.5 text-[12px] text-[rgb(var(--ferry-mute))]">
                      Last 30 days, all currencies in US dollars
                    </div>
                  </div>
                  <Badge tone="amber">USD</Badge>
                </div>
                <BalanceChart />
              </div>
              <div className="flex flex-col rounded-[16px] border border-solid border-[rgb(var(--ferry-line)/.08)] bg-[rgb(var(--ferry-surface))] p-4">
                <div className="text-[14px] font-medium text-[rgb(var(--ferry-ink))]">Arrival by rail</div>
                <div className="mt-0.5 text-[12px] text-[rgb(var(--ferry-mute))]">
                  Payouts landing within 5 minutes
                </div>
                <div className="mt-3 flex min-h-0 flex-1 flex-col rounded-[12px] border border-solid border-[rgb(var(--ferry-line)/.08)]">
                  <div className="border-b border-solid border-[rgb(var(--ferry-line)/.08)] px-3 py-3 text-center">
                    <div className="ferry-tnum text-[32px] font-medium leading-none tracking-[-0.03em] text-[rgb(var(--ferry-ink))]">
                      96.4%
                    </div>
                    <div className="mt-1 text-[11px] text-[rgb(var(--ferry-faint))]">
                      across every rail this week
                    </div>
                  </div>
                  <ul
                    className="ferry-no-scrollbar m-0 max-h-[196px] list-none overflow-y-auto p-0 [mask-image:linear-gradient(to_bottom,black_75%,transparent)]"
                    tabIndex={0}
                    aria-label="Arrival rate by rail"
                  >
                    {RAIL_SUCCESS.map((r) => (
                      <li
                        key={r.rail}
                        className="flex items-center justify-between gap-3 border-b border-solid border-[rgb(var(--ferry-line)/.06)] px-3 py-2 text-[12px] last:border-0"
                      >
                        <span className="text-[rgb(var(--ferry-ink))]">
                          {r.rail} <span className="text-[rgb(var(--ferry-faint))]">{r.where}</span>
                        </span>
                        <span className="ferry-tnum font-medium text-[rgb(var(--ferry-ink))]">{r.rate}%</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </Panel>
          <Panel className="flex flex-col p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <span className="text-[14px] font-medium text-[rgb(var(--ferry-ink))]">Company cards</span>
              <Badge tone="accent">3 active</Badge>
            </div>
            <div className="mt-5">
              <CardStack onFront={t} />
            </div>
            <div className="mb-5 mt-5">
              <div className="flex items-center justify-between text-[12px]">
                <span className="text-[rgb(var(--ferry-mute))]">
                  {"Recent on •••• "}
                  {n.last4}
                </span>
                <span className="text-[rgb(var(--ferry-faint))]">{n.holder}</span>
              </div>
              <ul className="m-0 mt-2 list-none p-0">
                <AnimatePresence mode="popLayout" initial={!1}>
                  {n.spend.map(([r, i, s], o) => (
                    <motion.li
                      key={n.last4 + r}
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
                        y: -6,
                      }}
                      transition={{
                        duration: 0.22,
                        delay: o * 0.04,
                      }}
                      className="flex items-center gap-3 border-b border-solid border-[rgb(var(--ferry-line)/.06)] py-2 text-[13px] last:border-0"
                    >
                      <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-solid border-[rgb(var(--ferry-line)/.08)] bg-[rgb(var(--ferry-raised))] text-[11px] font-medium text-[rgb(var(--ferry-mute))]">
                        {r[0]}
                      </span>
                      <span className="min-w-0 flex-1 truncate text-[rgb(var(--ferry-ink))]">{r}</span>
                      <span className="text-[11px] text-[rgb(var(--ferry-faint))]">{i}</span>
                      <span className="ferry-tnum w-[76px] text-right text-[rgb(var(--ferry-ink))]">
                        −{s}
                      </span>
                    </motion.li>
                  ))}
                </AnimatePresence>
              </ul>
            </div>
            <div className="mt-auto border-t border-solid border-[rgb(var(--ferry-line)/.08)] pt-4">
              <div className="flex items-end justify-between text-[12px] text-[rgb(var(--ferry-faint))]">
                <span>Available</span>
                <span>Monthly limit</span>
              </div>
              <div className="ferry-tnum mt-1 flex items-end justify-between text-[18px] font-medium tracking-[-0.02em] text-[rgb(var(--ferry-ink))]">
                <span>$482,310</span>
                <span>$1.2M</span>
              </div>
              <div
                className="mt-3 h-1.5 overflow-hidden rounded-full bg-[rgb(var(--ferry-line)/.08)]"
                role="img"
                aria-label="27% of the monthly card limit spent"
              >
                <motion.div
                  className="h-full rounded-full bg-[rgb(var(--ferry-accent))]"
                  initial={{
                    width: 0,
                  }}
                  whileInView={{
                    width: "27%",
                  }}
                  viewport={{
                    once: !0,
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 80,
                    damping: 20,
                  }}
                />
              </div>
              <div className="ferry-tnum mt-1.5 text-[11px] text-[rgb(var(--ferry-faint))]">
                $318,400 spent this month
              </div>
            </div>
          </Panel>
        </div>
        <ul className="m-0 mt-2 grid list-none grid-cols-1 gap-2 p-0 sm:grid-cols-3 [mask-image:linear-gradient(to_bottom,black_40%,transparent)]">
          {REGION_BALANCES.map((r) => (
            <li
              key={r.where}
              className="rounded-[18px] border border-solid border-[rgb(var(--ferry-line)/.08)] bg-[rgb(var(--ferry-surface)/.82)] px-4 pb-7 pt-4"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium tracking-[0.14em] text-[rgb(var(--ferry-faint))]">
                  {r.where}
                </span>
                <Badge tone={r.tone}>{r.state}</Badge>
              </div>
              <div className="ferry-tnum mt-3 text-[22px] font-medium tracking-[-0.02em] text-[rgb(var(--ferry-ink))]">
                {r.amount}
              </div>
            </li>
          ))}
        </ul>
      </Frame>
    </section>
  );
}
