"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Icon } from "./icons";
import { Badge, Reveal, Section } from "./ui";

interface TraceSpan {
  svc: string;
  op: string;
  /** Offset from the start of the trace, in ms. */
  start: number;
  /** Duration, in ms. */
  dur: number;
  /** Marks a span that held up the request. */
  hot?: boolean;
}

interface Trace {
  traceId: string;
  route: string;
  /** Total duration of the trace, in ms. */
  total: number;
  spans: readonly TraceSpan[];
}

interface Customer extends Trace {
  stat: string;
  unit: string;
  line: string;
  story: string;
  who: string;
}

const CUSTOMERS: readonly Customer[] = [
  {
    stat: "6",
    unit: "minutes",
    line: "median time to resolve at Northwind, down from 41",
    story:
      "Northwind moved on-call to Skein in March. Engineers now open the failing request first and the dashboard second.",
    who: "Northwind, platform team",
    traceId: "7f3a…c21",
    route: "POST /checkout",
    total: 1840,
    spans: [
      { svc: "api-gateway", op: "POST /checkout", start: 0, dur: 1840 },
      { svc: "checkout-svc", op: "createOrder", start: 20, dur: 1790 },
      { svc: "inventory-svc", op: "reserveStock", start: 60, dur: 220 },
      { svc: "payments-api", op: "charge", start: 300, dur: 1480, hot: true },
      {
        svc: "postgres",
        op: "SELECT orders",
        start: 330,
        dur: 1380,
        hot: true,
      },
      { svc: "notify-svc", op: "sendReceipt", start: 1790, dur: 40 },
    ],
  },
  {
    stat: "62",
    unit: "% fewer pages",
    line: "for Halcyon's on-call in the first month",
    story:
      "Halcyon replaced 214 threshold alerts with eleven watches. The pages that remain are the ones someone needs to act on.",
    who: "Halcyon, site reliability",
    traceId: "a91e…07b",
    route: "GET /search",
    total: 960,
    spans: [
      { svc: "edge", op: "GET /search", start: 0, dur: 960 },
      { svc: "search-api", op: "query", start: 30, dur: 900 },
      { svc: "auth-svc", op: "verifyToken", start: 40, dur: 60 },
      { svc: "elastic", op: "_search", start: 120, dur: 760, hot: true },
      { svc: "ranker", op: "score", start: 880, dur: 50 },
    ],
  },
  {
    stat: "9",
    unit: "x faster",
    line: "to the root cause at Corvid",
    story:
      "Corvid's support team now asks Skein why a customer's upload failed, and gets the trace back before the engineer joins the call.",
    who: "Corvid, support engineering",
    traceId: "3c0d…e94",
    route: "PUT /uploads",
    total: 2600,
    spans: [
      { svc: "api-gateway", op: "PUT /uploads", start: 0, dur: 2600 },
      { svc: "upload-svc", op: "receive", start: 40, dur: 2520 },
      { svc: "virus-scan", op: "scan", start: 200, dur: 380 },
      { svc: "s3", op: "PutObject", start: 620, dur: 1900, hot: true },
      { svc: "queue", op: "publish", start: 2530, dur: 30 },
    ],
  },
];

/** Time axis stops, as fractions of the trace's total duration. */
const AXIS_STOPS = [0, 0.25, 0.5, 0.75, 1] as const;

/** Formats a duration in ms as "820 ms", or as seconds from 1000 ms up ("1.84 s", "2 s"). */
function formatDuration(ms: number): string {
  return ms >= 1e3 ? `${(ms / 1e3).toFixed(ms % 1e3 ? 2 : 0)} s` : `${ms} ms`;
}

/** Trace waterfall: one bar per span on a shared time axis, the slow ("hot") spans in red. */
function TraceWaterfall({ trace }: { trace: Trace }) {
  return (
    <div
      className="rounded-[14px] border border-solid border-[rgb(var(--skein-line)/.1)] bg-[rgb(var(--skein-panel)/.7)] p-4"
      role="img"
      aria-label={`Trace of ${trace.route} taking ${formatDuration(trace.total)}; the slowest spans are ${trace.spans
        .filter((span) => span.hot)
        .map((span) => span.svc)
        .join(" and ")}`}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="font-mono text-[12px] text-[rgb(var(--skein-ink))]">
          {trace.route} <span className="text-[rgb(var(--skein-faint))]">trace {trace.traceId}</span>
        </span>
        <Badge tone="crit">{formatDuration(trace.total)}</Badge>
      </div>
      <div className="relative mt-4">
        {AXIS_STOPS.map((stop) => (
          <span
            key={stop}
            aria-hidden="true"
            className="absolute bottom-0 top-0 w-px bg-[rgb(var(--skein-line)/.06)]"
            // 112px is the label column (104px) plus its gap.
            style={{ left: `calc(112px + (100% - 112px) * ${stop})` }}
          />
        ))}
        <ul className="relative m-0 grid list-none gap-1.5 p-0">
          {trace.spans.map((span, index) => (
            <li key={span.svc + index} className="grid grid-cols-[104px_minmax(0,1fr)] items-center gap-2">
              <span
                className="truncate font-mono text-[11px] text-[rgb(var(--skein-mute))]"
                style={{ paddingLeft: Math.min(3, index) * 6 }}
              >
                {span.svc}
              </span>
              <span className="relative h-6">
                <motion.span
                  className={`absolute inset-y-0 flex items-center overflow-hidden rounded-[5px] px-1.5 ${span.hot ? "bg-[rgb(var(--skein-crit)/.25)] text-[rgb(var(--skein-crit))]" : "bg-[rgb(var(--skein-line)/.1)] text-[rgb(var(--skein-mute))]"}`}
                  style={{
                    left: `${(span.start / trace.total) * 100}%`,
                    width: `${Math.max(1.5, (span.dur / trace.total) * 100)}%`,
                    originX: 0,
                  }}
                  initial={{ scaleX: 0, opacity: 0 }}
                  animate={{ scaleX: 1, opacity: 1 }}
                  transition={{
                    delay: 0.1 + index * 0.07,
                    type: "spring",
                    stiffness: 160,
                    damping: 22,
                  }}
                >
                  <span className="truncate whitespace-nowrap font-mono text-[10px]">
                    {span.dur / trace.total > 0.18 ? `${span.op} ${formatDuration(span.dur)}` : ""}
                  </span>
                </motion.span>
              </span>
            </li>
          ))}
        </ul>
        <div className="mt-2 grid grid-cols-[104px_minmax(0,1fr)] gap-2">
          <span />
          <span className="skein-tnum relative h-4 font-mono text-[10px] text-[rgb(var(--skein-faint))]">
            {AXIS_STOPS.map((stop) => (
              <span
                key={stop}
                className={`absolute whitespace-nowrap ${stop === 0.25 || stop === 0.75 ? "hidden sm:inline" : ""}`}
                style={{
                  left: `${stop * 100}%`,
                  transform: `translateX(${stop === 1 ? "-100%" : stop ? "-50%" : "0"})`,
                }}
              >
                {formatDuration(Math.round(trace.total * stop))}
              </span>
            ))}
          </span>
        </div>
      </div>
    </div>
  );
}

/** Customer stories carousel: a headline result on the left, the trace that found it on the right. */
export function Customers() {
  const [index, setIndex] = useState(0);
  // 1 when moving forward, -1 when moving back; picks which side the story slides in from.
  const [direction, setDirection] = useState(1);
  const customer = CUSTOMERS[index] ?? CUSTOMERS[0];

  const go = (step: 1 | -1) => {
    setDirection(step);
    setIndex((current) => (current + step + CUSTOMERS.length) % CUSTOMERS.length);
  };

  return (
    <Section id="customers">
      <div
        className="grid grid-cols-1 gap-12 py-20 sm:py-28 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-16"
        aria-live="polite"
      >
        <div className="flex flex-col">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={index}
              initial={{ opacity: 0, x: direction * 24, filter: "blur(6px)" }}
              animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, x: direction * -24, filter: "blur(6px)" }}
              transition={{ duration: 0.35 }}
            >
              <div className="flex items-baseline gap-3">
                <Reveal
                  as="span"
                  className="skein-tnum skein-display text-[clamp(64px,8vw,104px)] font-bold leading-[0.9] tracking-[-0.04em] text-[rgb(var(--skein-ink))]"
                >
                  {customer.stat}
                </Reveal>
                <span className="skein-display text-[clamp(22px,2.4vw,30px)] font-semibold tracking-[-0.02em] text-[rgb(var(--skein-ink))]">
                  {customer.unit}
                </span>
              </div>
              <p className="m-0 mt-3 text-[17px] text-[rgb(var(--skein-mute))]">{customer.line}</p>
              <div className="mt-10 border-t border-solid border-[rgb(var(--skein-line)/.09)] pt-8">
                <p className="m-0 max-w-[30em] text-[17px] leading-[1.55] text-[rgb(var(--skein-ink))]">{customer.story}</p>
                <p className="m-0 mt-4 text-[13px] text-[rgb(var(--skein-faint))]">{customer.who}</p>
              </div>
            </motion.div>
          </AnimatePresence>
          <div className="mt-10 flex items-center gap-2">
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label="Previous customer"
              className="grid h-8 w-8 place-items-center rounded-full border border-solid border-[rgb(var(--skein-line)/.12)] text-[rgb(var(--skein-ink)/.8)] transition-colors hover:bg-[rgb(var(--skein-raised))] hover:text-[rgb(var(--skein-ink))]"
            >
              <Icon name="chevron_left" size={10} />
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              aria-label="Next customer"
              className="grid h-8 w-8 place-items-center rounded-full border border-solid border-[rgb(var(--skein-line)/.12)] text-[rgb(var(--skein-ink)/.8)] transition-colors hover:bg-[rgb(var(--skein-raised))] hover:text-[rgb(var(--skein-ink))]"
            >
              <Icon name="chevron_right" size={10} />
            </button>
            <span className="skein-tnum ml-2 font-mono text-[11px] text-[rgb(var(--skein-faint))]">
              0{index + 1} / 0{CUSTOMERS.length}
            </span>
          </div>
        </div>
        <div className="self-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
            >
              <TraceWaterfall trace={customer} />
              <p className="m-0 mt-3 text-[12px] text-[rgb(var(--skein-faint))]">
                The trace that found it: the highlighted spans held up the request.
              </p>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </Section>
  );
}
