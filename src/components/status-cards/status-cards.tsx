"use client";

import {
  AnimatePresence,
  motion,
  useInView,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion";
import { useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";

export type StatusLevel = "operational" | "degraded" | "outage" | "maintenance";

export type StatusCardItem = {
  id?: string;
  name: string;
  /** One line under the name. */
  note?: string;
  status: StatusLevel;
  /** Uptime over the last 30 days, in percent, while the service is operational. */
  uptime?: number;
  /** Typical response time in milliseconds. */
  latency?: number;
};

export type StatusCardsProps = {
  items?: StatusCardItem[];
  /** Colours for a light or a dark page. */
  tone?: "light" | "dark";
  /** Runs a scripted incident through the cards, and a live latency feed, until the visitor touches a status. Never runs under reduced motion. */
  autoplay?: boolean;
  /** Called when someone presses a status to move it to the next one. */
  onStatusChange?: (item: StatusCardItem, next: StatusLevel) => void;
  className?: string;
};

const LEVELS: StatusLevel[] = ["operational", "degraded", "outage", "maintenance"];

const LABEL: Record<StatusLevel, string> = {
  operational: "Operational",
  degraded: "Degraded",
  outage: "Outage",
  maintenance: "Maintenance",
};

const LIVE: Record<StatusLevel, string> = {
  operational: "#30d158",
  degraded: "#ff9f0a",
  outage: "#ff3b30",
  maintenance: "#0a84ff",
};

const PILL = {
  light: {
    operational: { bg: "#e6f7ec", fg: "#14682d" },
    degraded: { bg: "#fff1d9", fg: "#8a4f00" },
    outage: { bg: "#ffe5e2", fg: "#b3261e" },
    maintenance: { bg: "#e4efff", fg: "#0a58b5" },
  },
  dark: {
    operational: { bg: "rgba(48,209,88,.16)", fg: "#5fe083" },
    degraded: { bg: "rgba(255,159,10,.16)", fg: "#ffb340" },
    outage: { bg: "rgba(255,59,48,.18)", fg: "#ff6961" },
    maintenance: { bg: "rgba(10,132,255,.2)", fg: "#6cb4ff" },
  },
} as const;

const SKIN = {
  light: {
    card: "bg-white text-[#1d1d1f] shadow-[0_0_0_1px_rgba(0,0,0,.05),0_20px_40px_-26px_rgba(0,0,0,.35)]",
    muted: "#6e6e73",
    track: "rgba(0,0,0,.06)",
    spot: "rgba(0,113,227,.09)",
    banner: "bg-white text-[#1d1d1f] shadow-[0_0_0_1px_rgba(0,0,0,.05)]",
    focus: "focus-visible:ring-[#0a84ff]",
  },
  dark: {
    card: "bg-[#121214] text-[#f5f5f7] shadow-[0_0_0_1px_rgba(255,255,255,.08)]",
    muted: "#a1a1a6",
    track: "rgba(255,255,255,.08)",
    spot: "rgba(255,255,255,.07)",
    banner: "bg-[#121214] text-[#f5f5f7] shadow-[0_0_0_1px_rgba(255,255,255,.08)]",
    focus: "focus-visible:ring-[#0a84ff]",
  },
} as const;

const DEMO_ITEMS: StatusCardItem[] = [
  { id: "api", name: "API", note: "REST API", status: "operational", uptime: 99.98, latency: 118 },
  { id: "dashboard", name: "Dashboard", note: "Web app", status: "operational", uptime: 99.95, latency: 164 },
  { id: "webhooks", name: "Webhooks", note: "Delivery queue", status: "operational", uptime: 99.91, latency: 92 },
  { id: "cdn", name: "CDN", note: "Static assets", status: "operational", uptime: 99.99, latency: 38 },
];

/** The scripted incident for `autoplay`: [card index, next status]. */
const SCRIPT: Array<[number, StatusLevel]> = [
  [1, "degraded"],
  [1, "operational"],
  [3, "maintenance"],
  [3, "operational"],
  [0, "outage"],
  [0, "degraded"],
  [0, "operational"],
];

const POINTS = 24;
const W = 240;
const H = 56;
const DAYS = 30;

function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hash(text: string) {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) h = Math.imul(h ^ text.charCodeAt(i), 16777619);
  return h >>> 0;
}

const FACTOR: Record<StatusLevel, number> = { operational: 1, degraded: 2.4, outage: 4.2, maintenance: 0.55 };
const PENALTY: Record<StatusLevel, number> = { operational: 0, degraded: 0.55, outage: 2.3, maintenance: 0.08 };

function sample(base: number, status: StatusLevel, r: () => number) {
  return base * FACTOR[status] * (0.82 + r() * 0.36);
}

function seedSeries(base: number, status: StatusLevel, seed: number) {
  const r = rng(seed);
  return Array.from({ length: POINTS }, (_, i) => sample(base, i > POINTS - 7 ? status : "operational", r));
}

/** A smooth line through the points. Every series has the same number of segments, so one path morphs into the next. */
function linePath(values: number[], base: number) {
  const top = base * 5;
  const pts = values.map((v, i) => [(i / (values.length - 1)) * W, H - 4 - Math.min(1, v / top) * (H - 10)] as const);
  let d = `M${pts[0][0].toFixed(2)},${pts[0][1].toFixed(2)}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] ?? p2;
    const c1x = p1[0] + (p2[0] - p0[0]) / 6;
    const c1y = p1[1] + (p2[1] - p0[1]) / 6;
    const c2x = p2[0] - (p3[0] - p1[0]) / 6;
    const c2y = p2[1] - (p3[1] - p1[1]) / 6;
    d += `C${c1x.toFixed(2)},${c1y.toFixed(2)} ${c2x.toFixed(2)},${c2y.toFixed(2)} ${p2[0].toFixed(2)},${p2[1].toFixed(2)}`;
  }
  return { line: d, last: pts[pts.length - 1] };
}

function dayHistory(seed: number, today: StatusLevel): StatusLevel[] {
  const r = rng(seed ^ 0x9e3779b9);
  const out: StatusLevel[] = [];
  for (let i = 0; i < DAYS - 1; i++) {
    const v = r();
    out.push(v > 0.993 ? "outage" : v > 0.965 ? "degraded" : v > 0.95 ? "maintenance" : "operational");
  }
  out.push(today);
  return out;
}

function dayName(index: number) {
  const ago = DAYS - 1 - index;
  return ago === 0 ? "Today" : ago === 1 ? "Yesterday" : `${ago} days ago`;
}

function Figure({ value, decimals, suffix, className }: { value: number; decimals: number; suffix?: string; className?: string }) {
  const reduced = !!useReducedMotion();
  const spring = useSpring(value, { stiffness: 120, damping: 22 });
  const text = useTransform(spring, (v) => v.toFixed(decimals));
  useEffect(() => {
    if (reduced) spring.jump(value);
    else spring.set(value);
  }, [value, reduced, spring]);
  return (
    <span className={`tabular-nums ${className ?? ""}`}>
      <motion.span>{text}</motion.span>
      {suffix}
    </span>
  );
}

function StatusCard({
  item,
  status,
  tone,
  live,
  pulse,
  onCycle,
  seed,
}: {
  item: StatusCardItem;
  status: StatusLevel;
  tone: "light" | "dark";
  live: boolean;
  pulse: boolean;
  onCycle: () => void;
  seed: number;
}) {
  const reduced = !!useReducedMotion();
  const skin = SKIN[tone];
  const base = item.latency ?? 120;
  const gradId = useMemo(() => `sc-${seed}`, [seed]);
  const [series, setSeries] = useState(() => seedSeries(base, status, seed));
  const rand = useRef(rng(seed + 7));
  const days = useMemo(() => dayHistory(seed, "operational"), [seed]);
  const [hover, setHover] = useState<number | null>(null);

  // The last few points follow the status, so an incident shows up on the line at once.
  useEffect(() => {
    setSeries((s) => s.map((v, i) => (i >= POINTS - 6 ? sample(base, status, rand.current) : v)));
  }, [status, base]);

  useEffect(() => {
    if (!live) return;
    const id = window.setInterval(() => {
      setSeries((s) => [...s.slice(1), sample(base, status, rand.current)]);
    }, 1500);
    return () => window.clearInterval(id);
  }, [live, base, status]);

  const { line, last } = useMemo(() => linePath(series, base), [series, base]);
  const area = `${line}L${W},${H}L0,${H}Z`;
  const color = LIVE[status];
  const pill = PILL[tone][status];
  const uptime = Math.max(90, (item.uptime ?? 99.95) - PENALTY[status]);
  const latency = Math.round(series[series.length - 1]);

  const mx = useMotionValue(-300);
  const my = useMotionValue(-300);
  const spot = useMotionTemplate`radial-gradient(260px circle at ${mx}px ${my}px, ${skin.spot}, transparent 70%)`;
  const onMove = (e: ReactPointerEvent<HTMLElement>) => {
    const box = e.currentTarget.getBoundingClientRect();
    mx.set(e.clientX - box.left);
    my.set(e.clientY - box.top);
  };

  const statusByDay = days.map((d, i) => (i === DAYS - 1 ? status : d));
  const bad = statusByDay.filter((d) => d !== "operational").length;
  const tipIndex = hover ?? DAYS - 1;
  const tip = `${dayName(tipIndex)}, ${LABEL[statusByDay[tipIndex]].toLowerCase()}`;

  return (
    <motion.article
      layout="position"
      aria-label={`${item.name}, ${LABEL[status].toLowerCase()}, ${uptime.toFixed(2)} percent uptime over 30 days`}
      onPointerMove={onMove}
      onPointerLeave={() => {
        mx.set(-300);
        my.set(-300);
      }}
      className={`relative overflow-hidden rounded-[22px] p-5 ${skin.card}`}
    >
      <motion.span aria-hidden="true" className="pointer-events-none absolute inset-0" style={{ background: spot }} />

      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="m-0 truncate text-[15px] font-semibold leading-5 tracking-[-0.01em]">{item.name}</h3>
          {item.note && (
            <p className="m-0 mt-0.5 truncate text-[12px] leading-4" style={{ color: skin.muted }}>
              {item.note}
            </p>
          )}
        </div>
        <motion.button
          type="button"
          onClick={onCycle}
          aria-label={`${item.name}: ${LABEL[status]}. Press to simulate the next status.`}
          whileTap={reduced ? undefined : { scale: 0.94 }}
          animate={{ backgroundColor: pill.bg, color: pill.fg }}
          transition={{ duration: reduced ? 0 : 0.5 }}
          className={`relative inline-flex shrink-0 items-center gap-1.5 overflow-hidden rounded-full px-2.5 py-1 text-[12px] font-medium leading-4 outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${skin.focus}`}
        >
          <motion.span aria-hidden="true" className="h-1.5 w-1.5 rounded-full" animate={{ backgroundColor: color }} transition={{ duration: reduced ? 0 : 0.5 }} />
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={status}
              initial={reduced ? false : { y: 8, opacity: 0, filter: "blur(3px)" }}
              animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
              exit={reduced ? { opacity: 0 } : { y: -8, opacity: 0, filter: "blur(3px)" }}
              transition={{ duration: reduced ? 0 : 0.28 }}
            >
              {LABEL[status]}
            </motion.span>
          </AnimatePresence>
        </motion.button>
      </div>

      <div className="relative mt-4 flex items-end justify-between gap-4">
        <div>
          <Figure value={uptime} decimals={2} suffix="%" className="text-[34px] font-semibold leading-none tracking-[-0.035em]" />
          <p className="m-0 mt-1.5 text-[12px] leading-4" style={{ color: skin.muted }}>
            Uptime, 30 days
          </p>
        </div>
        <div className="text-right">
          <Figure value={latency} decimals={0} suffix=" ms" className="text-[17px] font-semibold leading-none tracking-[-0.02em]" />
          <p className="m-0 mt-1.5 text-[12px] leading-4" style={{ color: skin.muted }}>
            Response time
          </p>
        </div>
      </div>

      <div className="relative mt-3 h-14" aria-hidden="true">
        <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="absolute inset-0 h-full w-full overflow-visible">
          <defs>
            <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor={color} stopOpacity="0.28" />
              <stop offset="1" stopColor={color} stopOpacity="0" />
            </linearGradient>
          </defs>
          <motion.path
            d={area}
            fill={`url(#${gradId})`}
            initial={{ d: area }}
            animate={{ d: area }}
            transition={{ d: { duration: reduced ? 0 : 1.1, ease: "easeOut" } }}
          />
          <motion.path
            d={line}
            fill="none"
            strokeWidth={2}
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
            initial={{ pathLength: reduced ? 1 : 0, d: line, stroke: color }}
            animate={{ d: line, pathLength: 1, stroke: color }}
            transition={{ d: { duration: reduced ? 0 : 1.1, ease: "easeOut" }, pathLength: { duration: reduced ? 0 : 1.2, ease: "easeOut" }, stroke: { duration: reduced ? 0 : 0.5 } }}
          />
        </svg>
        <motion.span
          className="absolute -ml-[5px] -mt-[5px] h-2.5 w-2.5 rounded-full"
          style={{ boxShadow: `0 0 0 2px ${tone === "dark" ? "#121214" : "#ffffff"}` }}
          animate={{ left: `${(last[0] / W) * 100}%`, top: `${(last[1] / H) * 100}%`, backgroundColor: color }}
          transition={{ duration: reduced ? 0 : 1.1, ease: "easeOut" }}
        >
          {pulse && !reduced && (
            <motion.span
              className="absolute inset-0 rounded-full"
              style={{ background: color }}
              initial={{ scale: 1, opacity: 0.5 }}
              animate={{ scale: 3.2, opacity: 0 }}
              transition={{ duration: 1.6, repeat: Infinity, ease: "easeOut" }}
            />
          )}
        </motion.span>
      </div>

      <div className="relative mt-3">
        <div
          role="img"
          aria-label={`Last 30 days: ${DAYS - bad} days operational, ${bad} with an incident or maintenance`}
          className="flex h-5 items-stretch gap-[3px]"
          onPointerLeave={() => setHover(null)}
        >
          {statusByDay.map((d, i) => (
            <motion.span
              key={i}
              className="flex-1 rounded-[3px]"
              onPointerEnter={() => setHover(i)}
              animate={{ backgroundColor: d === "operational" ? LIVE.operational : LIVE[d], opacity: hover === null || hover === i ? 1 : 0.4, scaleY: hover === i ? 1.12 : 1 }}
              transition={{ duration: reduced ? 0 : 0.18 }}
              style={{ originY: 1 }}
            />
          ))}
        </div>
        <div className="mt-2 flex items-center justify-between text-[12px] leading-4" style={{ color: skin.muted }}>
          <span aria-hidden="true">{tip}</span>
          <span aria-hidden="true">{DAYS} days</span>
        </div>
      </div>
    </motion.article>
  );
}

function summary(statuses: StatusLevel[]) {
  const count = (s: StatusLevel) => statuses.filter((x) => x === s).length;
  const plural = (n: number) => (n === 1 ? "service" : "services");
  if (count("outage")) return { level: "outage" as const, text: `Outage affecting ${count("outage")} ${plural(count("outage"))}` };
  if (count("degraded")) return { level: "degraded" as const, text: `Degraded performance on ${count("degraded")} ${plural(count("degraded"))}` };
  if (count("maintenance")) return { level: "maintenance" as const, text: `Scheduled maintenance on ${count("maintenance")} ${plural(count("maintenance"))}` };
  return { level: "operational" as const, text: "All systems operational" };
}

/**
 * Service status cards in the style of a status page. Each card shows its state, uptime, a live response-time line and a 30-day strip
 * you can scrub. A banner above sums up the worst state. Press a status to simulate an incident and watch the line, the colours and
 * the numbers answer. With `autoplay` a scripted incident runs by itself.
 */
export default function StatusCards({ items = DEMO_ITEMS, tone = "light", autoplay = false, onStatusChange, className = "" }: StatusCardsProps) {
  const reduced = !!useReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const inView = useInView(rootRef, { margin: "80px" });
  const touched = useRef(false);
  const skin = SKIN[tone];
  const ids = items.map((it, i) => it.id ?? `${it.name}-${i}`);
  const key = ids.join("|") + items.map((it) => it.status).join("|");
  const [statuses, setStatuses] = useState<StatusLevel[]>(() => items.map((i) => i.status));
  const step = useRef(0);

  // Start over when the incoming items change.
  const [seenKey, setSeenKey] = useState(key);
  if (seenKey !== key) {
    setSeenKey(key);
    setStatuses(items.map((i) => i.status));
  }

  useEffect(() => {
    if (!autoplay || reduced || !inView) return;
    const id = window.setInterval(() => {
      if (touched.current) return;
      const [idx, next] = SCRIPT[step.current % SCRIPT.length];
      step.current++;
      setStatuses((s) => s.map((v, i) => (i === idx ? next : v)));
    }, 3600);
    return () => window.clearInterval(id);
  }, [autoplay, reduced, inView]);

  const cycle = (i: number) => {
    touched.current = true;
    const next = LEVELS[(LEVELS.indexOf(statuses[i]) + 1) % LEVELS.length];
    setStatuses((s) => s.map((v, j) => (j === i ? next : v)));
    onStatusChange?.(items[i], next);
  };

  const { level, text } = summary(statuses);
  const live = !reduced && inView;

  return (
    <div ref={rootRef} className={`w-full ${className}`}>
      <div className={`mb-3 flex items-center gap-3 rounded-[18px] px-4 py-3 ${skin.banner}`} role="status" aria-live="polite">
        <span className="relative grid h-3 w-3 place-items-center" aria-hidden="true">
          <motion.span className="h-2.5 w-2.5 rounded-full" animate={{ backgroundColor: LIVE[level] }} transition={{ duration: reduced ? 0 : 0.5 }} />
          {live && (
            <motion.span
              key={level}
              className="absolute inset-0 rounded-full"
              style={{ background: LIVE[level] }}
              initial={{ scale: 0.8, opacity: 0.5 }}
              animate={{ scale: 2.4, opacity: 0 }}
              transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut" }}
            />
          )}
        </span>
        <AnimatePresence mode="wait" initial={false}>
          <motion.p
            key={text}
            className="m-0 text-[14px] font-medium leading-5 tracking-[-0.01em]"
            initial={reduced ? false : { opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, y: -5 }}
            transition={{ duration: reduced ? 0 : 0.2 }}
          >
            {text}
          </motion.p>
        </AnimatePresence>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {items.map((item, i) => (
          <StatusCard
            key={ids[i]}
            item={item}
            status={statuses[i] ?? item.status}
            tone={tone}
            live={live}
            pulse={live}
            seed={hash(ids[i])}
            onCycle={() => cycle(i)}
          />
        ))}
      </div>
    </div>
  );
}
