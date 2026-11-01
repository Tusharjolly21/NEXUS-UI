"use client";

import { useState, useMemo } from "react";
import type { KeyboardEvent, PointerEvent } from "react";
import {
  motion,
  AnimatePresence,
  useReducedMotion,
  useInView,
} from "framer-motion";
import {
  Badge,
  Frame,
  Icon,
  Panel,
  seededRandom,
  smoothPath,
  useElementWidth,
} from "./ui";
import type { BadgeProps } from "./ui";

type TreasuryStat = {
  label: string;
  value: string;
  delta: string;
  hint: string;
};

type RailSuccess = {
  rail: string;
  where: string;
  rate: number;
};

type SpendRow = readonly [merchant: string, when: string, amount: string];

type CardRow = {
  name: string;
  kind: string;
  last4: string;
  holder: string;
  exp: string;
  spend: readonly SpendRow[];
};

type RegionBalance = {
  where: string;
  amount: string;
  state: string;
  tone: NonNullable<BadgeProps["tone"]>;
};

export const TREASURY_STATS: TreasuryStat[] = [
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

export const RAIL_SUCCESS: RailSuccess[] = [
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

export const CARDS: CardRow[] = [
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

export const REGION_BALANCES: RegionBalance[] = [
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

export const daysAgo = (days: number): Date => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
};

export const formatDay = (date: Date): string =>
  date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

export function buildBalanceSeries(): number[] {
  const random = seededRandom("balance"),
    walk = [0];
  for (let day = 1; day <= HISTORY_DAYS; day++)
    walk.push(
      walk[day - 1] + 0.6 + (random() - 0.42) * 2.4 + Math.sin(day / 3.2) * 0.9,
    );
  const low = Math.min(...walk),
    high = Math.max(...walk);
  return walk.map(
    (value) =>
      742e3 +
      ((value - low) / (high - low)) *
        217032 *
        (value === walk[HISTORY_DAYS] ? 1 : 0.985),
  );
}

export function BalanceChart() {
  const reducedMotion = useReducedMotion(),
    series = useMemo(() => buildBalanceSeries(), []),
    [containerRef, width] = useElementWidth(520),
    [hoverIndex, setHoverIndex] = useState<number | null>(null),
    inView = useInView(containerRef, {
      once: true,
      margin: "-10% 0px",
    }),
    minValue = Math.min(...series),
    maxValue = Math.max(...series),
    xAt = (day: number) => 6 + (day / HISTORY_DAYS) * (width - 12),
    yAt = (value: number) =>
      14 +
      (1 - (value - minValue) / (maxValue - minValue)) * (CHART_HEIGHT - 44),
    linePath = smoothPath(
      series.map((value, day) => [xAt(day), yAt(value)] as const),
    ),
    handlePointer = (event: PointerEvent<HTMLDivElement>) => {
      const rect = event.currentTarget.getBoundingClientRect();
      setHoverIndex(
        Math.max(
          0,
          Math.min(
            HISTORY_DAYS,
            Math.round(
              ((event.clientX - rect.left - 6) / (rect.width - 12)) *
                HISTORY_DAYS,
            ),
          ),
        ),
      );
    },
    handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
      if (event.key === "ArrowLeft")
        setHoverIndex((current) => Math.max(0, (current ?? HISTORY_DAYS) - 1));
      else if (event.key === "ArrowRight")
        setHoverIndex((current) =>
          Math.min(HISTORY_DAYS, (current ?? HISTORY_DAYS) + 1),
        );
      else if (event.key === "Escape") setHoverIndex(null);
      else return;
      event.preventDefault();
    },
    tickDays = [0, 7, 15, 23, 30],
    tooltipLeft =
      hoverIndex === null
        ? 0
        : Math.max(70, Math.min(width - 70, xAt(hoverIndex))),
    dayDelta =
      hoverIndex === null
        ? 0
        : series[hoverIndex] - series[Math.max(0, hoverIndex - 1)];
  return (
    <div
      ref={containerRef}
      tabIndex={0}
      role="img"
      aria-label={`Total balance over the last 30 days, from $${Math.round(series[0]).toLocaleString("en-US")} to $${Math.round(series[HISTORY_DAYS]).toLocaleString("en-US")}. Use the arrow keys to read a day.`}
      onPointerMove={handlePointer}
      onPointerDown={handlePointer}
      onPointerLeave={() => setHoverIndex(null)}
      onBlur={() => setHoverIndex(null)}
      onKeyDown={handleKeyDown}
      className="relative mt-4 touch-pan-y select-none rounded-[10px] outline-offset-4"
      style={{
        height: CHART_HEIGHT,
      }}
    >
      <svg
        width={width}
        height={CHART_HEIGHT}
        className="absolute inset-0 overflow-visible"
      >
        <defs>
          <linearGradient id="bal-stroke" x1="0" x2="1" y1="0" y2="0">
            <stop
              offset="0"
              stopColor="rgb(var(--ferry-accent))"
              stopOpacity="0.25"
            />
            <stop
              offset="0.45"
              stopColor="rgb(var(--ferry-accent))"
              stopOpacity="0.9"
            />
            <stop offset="1" stopColor="rgb(var(--ferry-accent))" />
          </linearGradient>
        </defs>
        <line
          x1={0}
          x2={width}
          y1={CHART_HEIGHT - 26}
          y2={CHART_HEIGHT - 26}
          stroke="rgb(var(--ferry-line))"
          strokeOpacity={0.08}
        />
        <motion.path
          d={linePath}
          fill="none"
          stroke="url(#bal-stroke)"
          strokeWidth={2.25}
          strokeLinecap="round"
          initial={
            reducedMotion
              ? false
              : {
                  pathLength: 0,
                }
          }
          animate={{
            pathLength: inView || reducedMotion ? 1 : 0,
          }}
          transition={{
            duration: 1.4,
            ease: [0.3, 0, 0.2, 1],
          }}
        />
        {hoverIndex !== null && (
          <>
            <line
              x1={xAt(hoverIndex)}
              x2={xAt(hoverIndex)}
              y1={yAt(series[hoverIndex])}
              y2={CHART_HEIGHT - 26}
              stroke="rgb(var(--ferry-accent))"
              strokeOpacity={0.35}
            />
            <circle
              cx={xAt(hoverIndex)}
              cy={yAt(series[hoverIndex])}
              r={4.5}
              fill="rgb(var(--ferry-surface))"
              stroke="rgb(var(--ferry-accent))"
              strokeWidth={2}
            />
          </>
        )}
        {tickDays.map((day) => (
          <text
            key={day}
            x={xAt(day)}
            y={CHART_HEIGHT - 6}
            textAnchor={
              day === 0 ? "start" : day === HISTORY_DAYS ? "end" : "middle"
            }
            className="fill-[rgb(var(--ferry-faint))] text-[11px]"
            opacity={hoverIndex === null ? 1 : 0.35}
          >
            {formatDay(daysAgo(HISTORY_DAYS - day))}
          </text>
        ))}
      </svg>
      <AnimatePresence>
        {hoverIndex !== null && (
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
              left: tooltipLeft,
              top: Math.max(0, yAt(series[hoverIndex]) - 78),
              x: "-50%",
            }}
          >
            <div className="text-[10px] font-medium uppercase tracking-[0.14em] text-[rgb(var(--ferry-faint))]">
              {formatDay(daysAgo(HISTORY_DAYS - hoverIndex))}
            </div>
            <div className="ferry-tnum mt-0.5 text-[15px] font-medium text-[rgb(var(--ferry-ink))]">
              ${Math.round(series[hoverIndex]).toLocaleString("en-US")}
            </div>
            <div className="ferry-tnum text-[11px] text-[rgb(var(--ferry-mute))]">
              {dayDelta >= 0 ? "Net in" : "Net out"}
              {" $"}
              {Math.abs(Math.round(dayDelta)).toLocaleString("en-US")}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {hoverIndex !== null && (
        <span
          className="ferry-tnum pointer-events-none absolute bottom-0 rounded-md border border-solid border-[rgb(var(--ferry-line)/.1)] bg-[rgb(var(--ferry-surface))] px-1.5 py-0.5 text-[11px] font-medium text-[rgb(var(--ferry-ink))]"
          style={{
            left: Math.max(24, Math.min(width - 24, xAt(hoverIndex))),
            transform: "translateX(-50%)",
          }}
        >
          {formatDay(daysAgo(HISTORY_DAYS - hoverIndex))}
        </span>
      )}
    </div>
  );
}

type CardFaceProps = {
  c: CardRow;
  front: boolean;
};

export function CardFace({ c: card, front }: CardFaceProps) {
  return (
    <div
      className="relative h-full w-full overflow-hidden rounded-[16px] border border-solid border-white/10 p-4 text-white"
      style={{
        background:
          "linear-gradient(135deg,#07080c 0%,#101a3a 52%,#07080c 100%)",
      }}
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -right-10 -top-16 h-44 w-44 rounded-full"
        style={{
          background:
            "radial-gradient(closest-side, rgba(39,103,255,.55), transparent)",
        }}
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(115deg, transparent 30%, rgba(255,255,255,.07) 45%, transparent 60%)",
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
          <span className="block text-[9px] font-medium tracking-[0.18em] text-[#8db0ff]">
            ISSUED
          </span>
          <span className="block text-[11px] text-white/85">{card.name}</span>
        </span>
      </div>
      <div
        className={`relative mt-4 flex items-center gap-3 transition-opacity ${front ? "opacity-100" : "opacity-60"}`}
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
        {card.kind.toUpperCase()}
      </div>
      <div className="ferry-tnum relative mt-0.5 text-[15px] font-medium tracking-[0.16em]">
        {"•••• "}
        {card.last4}
      </div>
      <div className="relative mt-3 flex items-end justify-between">
        <span>
          <span className="block text-[9px] font-medium tracking-[0.18em] text-white/45">
            CARDHOLDER
          </span>
          <span className="block text-[12px]">{card.holder}</span>
        </span>
        <span className="text-right">
          <span className="block text-[9px] font-medium tracking-[0.18em] text-white/45">
            EXPIRES
          </span>
          <span className="ferry-tnum block text-[12px]">{card.exp}</span>
        </span>
      </div>
    </div>
  );
}

type CardStackProps = {
  onFront: (index: number) => void;
};

export function CardStack({ onFront }: CardStackProps) {
  const reducedMotion = useReducedMotion(),
    [order, setOrder] = useState([0, 1, 2]),
    [flyingIndex, setFlyingIndex] = useState<number | null>(null),
    showNext = () => {
      setFlyingIndex(order[0]);
      setOrder((current) => [...current.slice(1), current[0]]);
      onFront(order[1]);
    },
    frontCard = CARDS[order[0]];
  return (
    <div>
      <button
        type="button"
        onClick={showNext}
        aria-label={`${frontCard.name} card ending ${frontCard.last4}. Show the next card.`}
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
        {CARDS.map((card, cardIndex) => {
          const depth = order.indexOf(cardIndex);
          return (
            <motion.span
              key={card.last4}
              className="absolute inset-x-0 top-0 block"
              style={{
                aspectRatio: "1.586",
                zIndex: 3 - depth,
                transformPerspective: 900,
                originY: 0,
              }}
              initial={false}
              animate={{
                y: 44 - depth * 22,
                scale: 1 - depth * 0.06,
                rotateX: depth * 14,
                x: flyingIndex === cardIndex && !reducedMotion ? [0, 34, 0] : 0,
                filter:
                  depth === 0
                    ? "brightness(1)"
                    : `brightness(${1 - depth * 0.18})`,
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
                depth === 0
                  ? {
                      y: 38,
                    }
                  : undefined
              }
              onAnimationComplete={() =>
                flyingIndex === cardIndex && setFlyingIndex(null)
              }
            >
              <CardFace c={card} front={depth === 0} />
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
  const [activeIndex, setActiveIndex] = useState(0),
    activeCard = CARDS[activeIndex];
  return (
    <section id="accounts" className="scroll-mt-24 px-3 pt-16 sm:px-6 sm:pt-20">
      <Frame className="mx-auto max-w-[1160px]">
        <div className="grid grid-cols-1 gap-2 lg:grid-cols-[minmax(0,1fr)_340px]">
          <Panel glow={true} className="p-4 sm:p-6">
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
              {TREASURY_STATS.map((stat) => (
                <li
                  key={stat.label}
                  className="rounded-[16px] border border-solid border-[rgb(var(--ferry-line)/.08)] bg-[rgb(var(--ferry-surface))] p-4"
                >
                  <div className="text-[12px] text-[rgb(var(--ferry-mute))]">
                    {stat.label}
                  </div>
                  <div className="mt-3 flex items-end justify-between gap-2">
                    <span className="ferry-tnum text-[28px] font-medium leading-none tracking-[-0.025em] text-[rgb(var(--ferry-ink))]">
                      {stat.value}
                    </span>
                    <Badge tone="gain">{stat.delta}</Badge>
                  </div>
                  <div className="mt-2 text-[11px] text-[rgb(var(--ferry-faint))]">
                    {stat.hint}
                  </div>
                </li>
              ))}
            </ul>
            <div className="relative mt-3 grid grid-cols-1 gap-3 md:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
              <div className="rounded-[16px] border border-solid border-[rgb(var(--ferry-line)/.08)] bg-[rgb(var(--ferry-surface))] p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-[14px] font-medium text-[rgb(var(--ferry-ink))]">
                      Total balance
                    </div>
                    <div className="mt-0.5 text-[12px] text-[rgb(var(--ferry-mute))]">
                      Last 30 days, all currencies in US dollars
                    </div>
                  </div>
                  <Badge tone="amber">USD</Badge>
                </div>
                <BalanceChart />
              </div>
              <div className="flex flex-col rounded-[16px] border border-solid border-[rgb(var(--ferry-line)/.08)] bg-[rgb(var(--ferry-surface))] p-4">
                <div className="text-[14px] font-medium text-[rgb(var(--ferry-ink))]">
                  Arrival by rail
                </div>
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
                    {RAIL_SUCCESS.map((rail) => (
                      <li
                        key={rail.rail}
                        className="flex items-center justify-between gap-3 border-b border-solid border-[rgb(var(--ferry-line)/.06)] px-3 py-2 text-[12px] last:border-0"
                      >
                        <span className="text-[rgb(var(--ferry-ink))]">
                          {rail.rail}{" "}
                          <span className="text-[rgb(var(--ferry-faint))]">
                            {rail.where}
                          </span>
                        </span>
                        <span className="ferry-tnum font-medium text-[rgb(var(--ferry-ink))]">
                          {rail.rate}%
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </Panel>
          <Panel className="flex flex-col p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <span className="text-[14px] font-medium text-[rgb(var(--ferry-ink))]">
                Company cards
              </span>
              <Badge tone="accent">3 active</Badge>
            </div>
            <div className="mt-5">
              <CardStack onFront={setActiveIndex} />
            </div>
            <div className="mb-5 mt-5">
              <div className="flex items-center justify-between text-[12px]">
                <span className="text-[rgb(var(--ferry-mute))]">
                  {"Recent on •••• "}
                  {activeCard.last4}
                </span>
                <span className="text-[rgb(var(--ferry-faint))]">
                  {activeCard.holder}
                </span>
              </div>
              <ul className="m-0 mt-2 list-none p-0">
                <AnimatePresence mode="popLayout" initial={false}>
                  {activeCard.spend.map(
                    ([merchant, when, amount], rowIndex) => (
                      <motion.li
                        key={activeCard.last4 + merchant}
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
                          delay: rowIndex * 0.04,
                        }}
                        className="flex items-center gap-3 border-b border-solid border-[rgb(var(--ferry-line)/.06)] py-2 text-[13px] last:border-0"
                      >
                        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-solid border-[rgb(var(--ferry-line)/.08)] bg-[rgb(var(--ferry-raised))] text-[11px] font-medium text-[rgb(var(--ferry-mute))]">
                          {merchant[0]}
                        </span>
                        <span className="min-w-0 flex-1 truncate text-[rgb(var(--ferry-ink))]">
                          {merchant}
                        </span>
                        <span className="text-[11px] text-[rgb(var(--ferry-faint))]">
                          {when}
                        </span>
                        <span className="ferry-tnum w-[76px] text-right text-[rgb(var(--ferry-ink))]">
                          −{amount}
                        </span>
                      </motion.li>
                    ),
                  )}
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
                    once: true,
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
          {REGION_BALANCES.map((region) => (
            <li
              key={region.where}
              className="rounded-[18px] border border-solid border-[rgb(var(--ferry-line)/.08)] bg-[rgb(var(--ferry-surface)/.82)] px-4 pb-7 pt-4"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium tracking-[0.14em] text-[rgb(var(--ferry-faint))]">
                  {region.where}
                </span>
                <Badge tone={region.tone}>{region.state}</Badge>
              </div>
              <div className="ferry-tnum mt-3 text-[22px] font-medium tracking-[-0.02em] text-[rgb(var(--ferry-ink))]">
                {region.amount}
              </div>
            </li>
          ))}
        </ul>
      </Frame>
    </section>
  );
}
