import { useState, useRef, useEffect, useMemo, type PointerEvent as RPointerEvent, type ReactNode } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Logo } from "./ui";

/** Days on the chart. */
export const DAYS = 30;

type Release = { day: number; v: string; title: string; author: string; initials: string; hue: number; prs: number };
type Metric = {
  key: string;
  label: string;
  base: number;
  /** Change each release adds to the base, in the order of RELEASES. */
  deltas: number[];
  noise: number;
  /** Confidence, in percent, that each release moved the metric. */
  conf: number[];
  lowerIsBetter?: boolean;
  fmt: (value: number) => string;
  fmtDelta: (value: number) => string;
  ticks: number[];
};

const RELEASES: Release[] = [
  { day: 6, v: "2.14", title: "Faster search", author: "Arjun Mehta", initials: "AM", hue: 268, prs: 3 },
  { day: 12, v: "2.15", title: "New onboarding", author: "Lena Fischer", initials: "LF", hue: 192, prs: 7 },
  { day: 19, v: "2.16", title: "Checkout redesign", author: "Maya Chen", initials: "MC", hue: 24, prs: 12 },
  {
    day: 25,
    v: "2.17",
    title: "Pricing page copy",
    author: "Noah Bennett",
    initials: "NB",
    hue: 150,
    prs: 2,
  },
];

const METRICS: Metric[] = [
  {
    key: "conv",
    label: "Checkout conversion",
    base: 4.02,
    deltas: [0.06, 0.18, 0.61, -0.14],
    noise: 0.09,
    conf: [58, 86, 96, 82],
    fmt: (value) => `${value.toFixed(2)}%`,
    fmtDelta: (value) => `${value >= 0 ? "+" : "−"}${Math.abs(value).toFixed(2)} pts`,
    ticks: [3.8, 4.2, 4.6, 5],
  },
  {
    key: "signups",
    label: "Daily signups",
    base: 1010,
    deltas: [8, 96, 22, -31],
    noise: 34,
    conf: [41, 93, 64, 79],
    fmt: (value) => Math.round(value).toLocaleString("en-US"),
    fmtDelta: (value) => `${value >= 0 ? "+" : "−"}${Math.abs(Math.round(value))} a day`,
    ticks: [900, 1e3, 1100, 1200],
  },
  {
    key: "p95",
    label: "p95 page load",
    base: 482,
    deltas: [-46, 6, -12, 24],
    noise: 9,
    conf: [97, 35, 71, 88],
    lowerIsBetter: true,
    fmt: (value) => `${Math.round(value)} ms`,
    fmtDelta: (value) => `${value >= 0 ? "+" : "−"}${Math.abs(Math.round(value))} ms`,
    ticks: [400, 440, 480, 520],
  },
];

/** A repeatable pseudo-random series: the metric's base, plus each release's change from its day on. */
function makeSeries(metric: Metric, seed: number, flat = false) {
  let state = seed;
  const rand = () => (state = (state * 16807) % 2147483647) / 2147483647 - 0.5;
  return Array.from({ length: DAYS }, (_, day) => {
    let value = metric.base;
    if (!flat) RELEASES.forEach((release, i) => day >= release.day && (value += metric.deltas[i]));
    // weekends dip a little
    const weekend = (day + 3) % 7 >= 5 ? -metric.noise * 0.6 : 0;
    return value + rand() * metric.noise * 1.6 + weekend;
  });
}

const DAY_LABELS = Array.from({ length: DAYS }, (_, day) => `Oct ${day + 1}`);

const DEPLOY_TIMES = ["Oct 7, 14:12", "Oct 13, 10:40", "Oct 20, 16:05", "Oct 26, 11:31"];

const Icon = ({ d, size = 14, className = "" }: { d: string; size?: number; className?: string }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    className={className}
  >
    <path d={d} />
  </svg>
);

const Initials = ({ text, hue, size = 20 }: { text: string; hue: number; size?: number }) => (
  <span
    className="flex flex-none items-center justify-center rounded-full font-semibold text-white"
    style={{ width: size, height: size, fontSize: size * 0.42, background: `hsl(${hue} 45% 38%)` }}
    aria-hidden="true"
  >
    {text}
  </span>
);

function ImpactBadge({ confidence, good }: { confidence: number; good: boolean }) {
  const label =
    confidence < 70
      ? { t: "Unclear", c: "text-[#a39c94] bg-white/[.05]" }
      : good
        ? { t: "Improved", c: "text-[#7ee2b0] bg-[#5ee6a3]/[.1]" }
        : { t: "Regressed", c: "text-[#ff9b9b] bg-[#ff6b6b]/[.1]" };
  return (
    <span
      className={`inline-flex h-[22px] items-center rounded-[6px] px-2 text-[11.5px] font-medium ${label.c}`}
    >
      {label.t}
    </span>
  );
}

function Sparkline({ points, from }: { points: number[]; from: number }) {
  const window = points.slice(Math.max(0, from - 4), Math.min(DAYS, from + 5));
  const min = Math.min(...window);
  const max = Math.max(...window);
  const path = window
    .map(
      (value, i) =>
        `${i ? "L" : "M"}${((i / (window.length - 1)) * 56).toFixed(1)},${(16 - ((value - min) / (max - min || 1)) * 14).toFixed(1)}`,
    )
    .join(" ");
  return (
    <svg width="56" height="18" viewBox="0 0 56 18" aria-hidden="true" className="flex-none">
      <line x1="28" x2="28" y1="0" y2="18" stroke="rgba(255,255,255,.14)" strokeDasharray="2 2" />
      <path d={path} fill="none" stroke="#cfc8bf" strokeWidth="1.3" strokeLinejoin="round" />
    </svg>
  );
}

function TabCorner({ side }: { side: "l" | "r" }) {
  return (
    <span
      aria-hidden="true"
      className={`absolute bottom-0 h-2 w-2 ${side === "l" ? "-left-2" : "-right-2"}`}
      style={{
        background: `radial-gradient(circle at ${side === "l" ? "0 0" : "100% 0"}, transparent 7.5px, #2b2b2e 8px)`,
      }}
    />
  );
}

function BrowserWindow({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-hidden rounded-[12px] bg-[#1c1c1e] text-left shadow-[0_0_0_1px_rgba(255,255,255,.12),0_50px_120px_-30px_rgba(255,122,47,.32),0_30px_60px_-30px_rgba(0,0,0,.9)]">
      <div className="flex h-[42px] items-end gap-1 pl-4 pr-2">
        <div className="flex h-full items-center gap-2 pr-4" aria-hidden="true">
          <span className="h-3 w-3 rounded-full bg-[#ff5f57] shadow-[inset_0_0_0_.5px_rgba(0,0,0,.25)]" />
          <span className="h-3 w-3 rounded-full bg-[#febc2e] shadow-[inset_0_0_0_.5px_rgba(0,0,0,.25)]" />
          <span className="h-3 w-3 rounded-full bg-[#28c840] shadow-[inset_0_0_0_.5px_rgba(0,0,0,.25)]" />
        </div>
        <div className="relative ml-1 flex h-[34px] w-[230px] min-w-0 items-center gap-2 rounded-t-[9px] bg-[#2b2b2e] px-3 text-[12px] text-[#ececec]">
          <TabCorner side="l" />
          <TabCorner side="r" />
          <Logo size={14} />
          <span className="min-w-0 flex-1 truncate">Releases, tern-web</span>
          <Icon d="M7 7l10 10M17 7L7 17" size={11} className="text-[#9a9a9e]" />
        </div>
        <div className="hidden h-[34px] w-[200px] min-w-0 items-center gap-2 px-3 text-[12px] text-[#a1a1a6] sm:flex">
          <span className="h-3.5 w-3.5 flex-none rounded-[4px] bg-[#3a3a3e]" aria-hidden="true" />
          <span className="min-w-0 flex-1 truncate">New checkout layout #413</span>
        </div>
        <span className="mb-[7px] hidden h-5 w-px bg-white/[.1] sm:block" aria-hidden="true" />
        <span
          className="mb-[6px] flex h-6 w-6 items-center justify-center rounded-full text-[#a1a1a6]"
          aria-hidden="true"
        >
          <Icon d="M12 5v14M5 12h14" size={13} />
        </span>
      </div>
      <div
        className="flex h-[40px] items-center gap-1.5 bg-[#2b2b2e] px-2.5 text-[#c4c4c8] shadow-[inset_0_-1px_0_rgba(0,0,0,.6)]"
        aria-hidden="true"
      >
        <Icon d="M15 18l-6-6 6-6" size={15} className="mx-1" />
        <Icon d="M9 18l6-6-6-6" size={15} className="mx-1 text-[#6e6e73]" />
        <Icon d="M20 11a8 8 0 1 0-2.3 5.7M20 4v7h-7" size={14} className="mx-1" />
        <div className="mx-1.5 flex h-[28px] min-w-0 flex-1 items-center gap-2 rounded-full bg-[#1c1c1e] px-3 text-[12.5px]">
          <Icon
            d="M4 8h10M4 16h6M14 16h6M18 8h2M16 6v4M10 14v4"
            size={13}
            className="flex-none text-[#9a9a9e]"
          />
          <span className="min-w-0 truncate">
            <span className="text-[#ececec]">app.afterglow.dev</span>
            <span className="text-[#8e8e93]">/tern/web/releases?metric=checkout</span>
          </span>
          <Icon
            d="M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1 5.8L12 16.8l-5.2 2.8 1-5.8-4.3-4.1 5.9-.8z"
            size={13}
            className="ml-auto flex-none text-[#9a9a9e]"
          />
        </div>
        <span className="hidden sm:block">
          <Icon
            d="M9 4h6v3a2 2 0 1 0 4 0V4h1v16h-5v-3a2 2 0 1 0-4 0v3H5v-5h3a2 2 0 1 0 0-4H5V4z"
            size={14}
            className="mx-1"
          />
        </span>
        <span className="mx-1 flex h-[22px] w-[22px] items-center justify-center rounded-full bg-[#4a3a6b] text-[10px] font-semibold text-white">
          MC
        </span>
        <Icon d="M12 5h.01M12 12h.01M12 19h.01" size={16} className="mx-0.5" />
      </div>
      {children}
    </div>
  );
}

const SIDEBAR_ITEMS = [
  { label: "Overview", d: "M4 13h6V4H4zm10 7h6v-9h-6zM4 20h6v-4H4zm10-10h6V4h-6z" },
  {
    label: "Releases",
    d: "M6 3v12M18 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM6 21a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM18 9a9 9 0 0 1-9 9",
  },
  { label: "Metrics", d: "M4 19V5M4 19h16M8 15l4-4 3 3 5-6" },
  { label: "Funnels", d: "M4 5h16l-6 7v6l-4 2v-8z" },
  { label: "Replays", d: "M5 4h14v12H5zM9 20h6M10 8l4 2-4 2z" },
  { label: "Alerts", d: "M12 4a5 5 0 0 0-5 5v4l-2 3h14l-2-3V9a5 5 0 0 0-5-5zm-2 15a2 2 0 0 0 4 0", count: 2 },
];

export function ReleaseDashboard({ ready = true }) {
  const reduced = useReducedMotion();
  const [metricIndex, setMetricIndex] = useState(0);
  const [releaseIndex, setReleaseIndex] = useState(2);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const touched = useRef(false);
  const chartRef = useRef<HTMLDivElement>(null);
  // this period and the one before it, for every metric
  const series = useMemo(
    () => METRICS.map((metric, i) => ({ cur: makeSeries(metric, 11 + i * 7), prev: makeSeries(metric, 101 + i * 13, true) })),
    [],
  );
  const metric = METRICS[metricIndex];
  const { cur: current, prev: previous } = series[metricIndex];
  // until the first touch, step through the releases by themselves
  useEffect(() => {
    if (reduced || !ready) return;
    const timer = window.setInterval(() => {
      if (!touched.current) setReleaseIndex((i) => (i + 1) % RELEASES.length);
    }, 3200);
    return () => window.clearInterval(timer);
  }, [reduced, ready]);
  const markTouched = () => {
    touched.current = true;
  };
  const yMin = metric.ticks[0];
  const yMax = metric.ticks[metric.ticks.length - 1];
  const CHART_W = 1000;
  const CHART_H = 240;
  const xAt = (day: number) => (day / (DAYS - 1)) * CHART_W;
  const yAt = (value: number) => CHART_H - ((value - yMin) / (yMax - yMin)) * CHART_H;
  const toPath = (values: number[]) => values.map((value, day) => `${day ? "L" : "M"}${xAt(day).toFixed(1)},${yAt(value).toFixed(1)}`).join(" ");
  const xPct = (day: number) => `${(day / (DAYS - 1)) * 100}%`;
  const yPct = (value: number) => `${((yMax - value) / (yMax - yMin)) * 100}%`;
  const release = RELEASES[releaseIndex];
  const endDay = releaseIndex < RELEASES.length - 1 ? RELEASES[releaseIndex + 1].day : DAYS - 1;
  const delta = metric.deltas[releaseIndex];
  const improved = metric.lowerIsBetter ? delta < 0 : delta > 0;
  const confidence = metric.conf[releaseIndex];
  const onChartMove = (event: RPointerEvent<HTMLDivElement>) => {
    const box = chartRef.current?.getBoundingClientRect();
    if (!box) return;
    const day = Math.round(((event.clientX - box.left) / box.width) * (DAYS - 1));
    setHoverIndex(Math.max(0, Math.min(DAYS - 1, day)));
  };
  const periodDelta = metric.fmtDelta(current[DAYS - 1] - previous[DAYS - 1]);
  const periodImproved = metric.lowerIsBetter ? current[DAYS - 1] < previous[DAYS - 1] : current[DAYS - 1] > previous[DAYS - 1];
  return (
    <BrowserWindow>
      <div className="flex bg-[#0a0a0a] text-[13px] text-[#ececec]" onPointerDown={markTouched}>
        <aside
          className="hidden w-[208px] flex-none flex-col gap-4 px-3 py-3 shadow-[inset_-1px_0_0_rgba(255,255,255,.06)] lg:flex"
          aria-label="App navigation (preview)"
        >
          <div className="flex items-center gap-2 rounded-[8px] px-1.5 py-1">
            <span className="flex h-[22px] w-[22px] items-center justify-center rounded-[6px] bg-[#ff7a2f] text-[11px] font-bold text-black">
              T
            </span>
            <span className="flex-1 font-medium">Tern</span>
            <Icon d="M8 9l4-4 4 4M8 15l4 4 4-4" size={13} className="text-[#7c7c80]" />
          </div>
          <div className="flex h-8 items-center gap-2 rounded-[8px] bg-white/[.04] px-2.5 text-[#8e8e93] shadow-[inset_0_0_0_1px_rgba(255,255,255,.06)]">
            <Icon d="M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14zM20 20l-3.5-3.5" size={13} />
            <span className="flex-1">Search</span>
            <span className="rounded-[4px] bg-white/[.06] px-1 text-[10.5px] text-[#a1a1a6]">⌘K</span>
          </div>
          <nav className="flex flex-col gap-0.5">
            {SIDEBAR_ITEMS.map((item) => {
              const current = item.label === "Releases";
              return (
                <span
                  key={item.label}
                  className={`flex h-8 items-center gap-2.5 rounded-[7px] px-2.5 ${current ? "bg-white/[.07] text-[#f5f5f5]" : "text-[#a1a1a6]"}`}
                >
                  <Icon d={item.d} size={14} />
                  <span className="flex-1">{item.label}</span>
                  {item.count && (
                    <span className="flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#ff7a2f] px-1 text-[10.5px] font-semibold text-black">
                      {item.count}
                    </span>
                  )}
                </span>
              );
            })}
          </nav>
          <div className="flex flex-col gap-0.5">
            <span className="px-2.5 pb-1 text-[11.5px] text-[#6e6e73]">Projects</span>
            {[
              { name: "tern-web", color: "#ff7a2f", on: true },
              { name: "tern-ios", color: "#7aa2ff", on: false },
              { name: "tern-api", color: "#5ee6a3", on: false },
            ].map((project) => (
              <span
                key={project.name}
                className={`flex h-8 items-center gap-2.5 rounded-[7px] px-2.5 ${project.on ? "text-[#f5f5f5]" : "text-[#a1a1a6]"}`}
              >
                <span className="h-2 w-2 rounded-[3px]" style={{ background: project.color }} />
                {project.name}
              </span>
            ))}
          </div>
          <div className="mt-auto flex items-center gap-2 rounded-[8px] px-1.5 py-1.5">
            <Initials text="MC" hue={262} size={24} />
            <span className="flex min-w-0 flex-col leading-tight">
              <span className="truncate">Maya Chen</span>
              <span className="text-[11.5px] text-[#7c7c80]">Trial ends in 12 days</span>
            </span>
          </div>
        </aside>
        <div className="min-w-0 flex-1">
          <div className="flex h-12 items-center justify-between gap-3 px-4 shadow-[inset_0_-1px_0_rgba(255,255,255,.06)] sm:px-5">
            <div className="flex min-w-0 items-center gap-1.5 text-[13px]">
              <span className="text-[#8e8e93]">tern-web</span>
              <span className="text-[#48484a]">/</span>
              <span className="font-medium">Releases</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="hidden h-[28px] items-center gap-1.5 rounded-[7px] px-2.5 text-[12.5px] text-[#d1d1d6] shadow-[inset_0_0_0_1px_rgba(255,255,255,.1)] sm:flex">
                <Icon d="M7 3v3M17 3v3M4 8h16M5 5h14v15H5z" size={13} />
                Oct 1 to Oct 30
              </span>
              <span className="hidden h-[28px] items-center gap-1.5 rounded-[7px] px-2.5 text-[12.5px] text-[#d1d1d6] shadow-[inset_0_0_0_1px_rgba(255,255,255,.1)] md:flex">
                <span className="h-0 w-3 border-t border-dashed border-[#8e8e93]" />
                vs previous 30 days
              </span>
              <span className="flex h-[28px] items-center rounded-[7px] bg-[#f3efe9] px-3 text-[12.5px] font-medium text-black">
                Share
              </span>
            </div>
          </div>
          <div
            className="flex overflow-x-auto px-2 shadow-[inset_0_-1px_0_rgba(255,255,255,.06)] [scrollbar-width:none] sm:px-3"
            role="tablist"
            aria-label="Metric"
          >
            {METRICS.map((item, i) => {
              const selected = i === metricIndex;
              const latest = series[i].cur[DAYS - 1];
              return (
                <button
                  key={item.key}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  onClick={() => {
                    markTouched();
                    setMetricIndex(i);
                  }}
                  className={`relative flex min-w-[150px] flex-col items-start gap-0.5 px-3 pb-3 pt-3 text-left outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#ffc58a] ${selected ? "" : "opacity-60 hover:opacity-90"}`}
                >
                  <span className="text-[12px] text-[#a1a1a6]">{item.label}</span>
                  <span className="text-[20px] font-semibold tabular-nums tracking-[-0.02em]">
                    {item.fmt(latest)}
                  </span>
                  {selected && (
                    <motion.span
                      layoutId="ag-mtab"
                      className="absolute inset-x-3 bottom-0 h-[2px] rounded-full bg-[#ff7a2f]"
                      transition={{ type: "spring", stiffness: 420, damping: 34 }}
                    />
                  )}
                </button>
              );
            })}
            <span
              className={`ml-auto hidden items-center self-center whitespace-nowrap pr-3 text-[12px] tabular-nums md:flex ${periodImproved ? "text-[#7ee2b0]" : "text-[#ff9b9b]"}`}
            >
              {periodDelta} vs previous period
            </span>
          </div>
          <div className="px-4 pt-5 sm:px-5">
            <div className="flex gap-3">
              <div
                className="relative h-[200px] w-10 flex-none text-right text-[11px] tabular-nums text-[#6e6e73] sm:h-[220px]"
                aria-hidden="true"
              >
                {metric.ticks.map((tick) => (
                  <span key={tick} className="absolute right-0 -translate-y-1/2" style={{ top: yPct(tick) }}>
                    {metric.fmt(tick)}
                  </span>
                ))}
              </div>
              <div className="min-w-0 flex-1">
                <div
                  ref={chartRef}
                  className="relative h-[200px] cursor-crosshair touch-pan-y sm:h-[220px]"
                  onPointerMove={(event) => {
                    markTouched();
                    onChartMove(event);
                  }}
                  onPointerLeave={() => setHoverIndex(null)}
                  role="img"
                  aria-label={`${metric.label} over 30 days with four releases. ${release.v} ${release.title}: ${metric.fmtDelta(delta)}.`}
                >
                  <motion.div
                    className="pointer-events-none absolute inset-y-0 bg-[linear-gradient(180deg,rgba(255,122,47,.11),rgba(255,122,47,.02))] shadow-[inset_1px_0_0_rgba(255,122,47,.7)]"
                    animate={{
                      left: xPct(release.day),
                      width: `${((endDay - release.day) / (DAYS - 1)) * 100}%`,
                    }}
                    transition={{ type: "spring", stiffness: 220, damping: 30 }}
                  />
                  <svg
                    viewBox={`0 0 ${CHART_W} ${CHART_H}`}
                    preserveAspectRatio="none"
                    className="absolute inset-0 h-full w-full overflow-visible"
                    aria-hidden="true"
                  >
                    {metric.ticks.map((tick) => (
                      <line
                        key={tick}
                        x1="0"
                        x2={CHART_W}
                        y1={yAt(tick)}
                        y2={yAt(tick)}
                        stroke="rgba(255,255,255,.06)"
                        vectorEffect="non-scaling-stroke"
                      />
                    ))}
                    {RELEASES.map(
                      (item, i) =>
                        i !== releaseIndex && (
                          <line
                            key={item.v}
                            x1={xAt(item.day)}
                            x2={xAt(item.day)}
                            y1="0"
                            y2={CHART_H}
                            stroke="rgba(255,255,255,.13)"
                            strokeDasharray="2 3"
                            vectorEffect="non-scaling-stroke"
                          />
                        ),
                    )}
                    <path
                      d={toPath(previous)}
                      fill="none"
                      stroke="#5c5752"
                      strokeWidth="1.3"
                      strokeDasharray="4 4"
                      vectorEffect="non-scaling-stroke"
                    />
                    <motion.path
                      key={metric.key}
                      d={toPath(current)}
                      fill="none"
                      stroke="#efe9e1"
                      strokeWidth="1.8"
                      strokeLinejoin="round"
                      vectorEffect="non-scaling-stroke"
                      initial={{ pathLength: reduced ? 1 : 0 }}
                      animate={{ pathLength: ready ? 1 : 0 }}
                      transition={{ duration: 1.3, ease: [0.3, 0.6, 0.2, 1], delay: 0.15 }}
                    />
                  </svg>
                  {hoverIndex !== null && (
                    <>
                      <div
                        className="pointer-events-none absolute inset-y-0 w-px bg-white/25"
                        style={{ left: xPct(hoverIndex) }}
                      />
                      <div
                        className="pointer-events-none absolute h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#efe9e1] shadow-[0_0_0_3px_#0a0a0a]"
                        style={{ left: xPct(hoverIndex), top: yPct(current[hoverIndex]) }}
                      />
                      <div
                        className="pointer-events-none absolute top-2 w-[168px] rounded-[9px] bg-[#1c1c1e] p-2.5 text-[12px] shadow-[0_0_0_1px_rgba(255,255,255,.1),0_12px_24px_-8px_rgba(0,0,0,.8)]"
                        style={{
                          left:
                            hoverIndex > DAYS * 0.6
                              ? `calc(${xPct(hoverIndex)} - 180px)`
                              : `calc(${xPct(hoverIndex)} + 12px)`,
                        }}
                      >
                        <div className="mb-1.5 text-[11.5px] text-[#8e8e93]">
                          {DAY_LABELS[hoverIndex]}, 2026
                        </div>
                        <div className="flex justify-between gap-2">
                          <span className="flex items-center gap-1.5 text-[#c7c7cc]">
                            <span className="h-[2px] w-3 rounded-full bg-[#efe9e1]" />
                            This period
                          </span>
                          <span className="tabular-nums">{metric.fmt(current[hoverIndex])}</span>
                        </div>
                        <div className="mt-1 flex justify-between gap-2">
                          <span className="flex items-center gap-1.5 text-[#8e8e93]">
                            <span className="w-3 border-t border-dashed border-[#8e8e93]" />
                            Previous
                          </span>
                          <span className="tabular-nums text-[#8e8e93]">
                            {metric.fmt(previous[hoverIndex])}
                          </span>
                        </div>
                      </div>
                    </>
                  )}
                </div>
                <div className="relative mt-2 h-[38px]">
                  {[0, 7, 14, 21, 28].map((day) => (
                    <span
                      key={day}
                      className="absolute bottom-0 whitespace-nowrap text-[11px] tabular-nums text-[#6e6e73]"
                      style={{
                        left: xPct(day),
                        transform: `translateX(${day === 0 ? "0" : day === 28 ? "-85%" : "-50%"})`,
                      }}
                      aria-hidden="true"
                    >
                      {DAY_LABELS[day]}
                    </span>
                  ))}
                  {RELEASES.map((item, i) => (
                    <button
                      key={item.v}
                      type="button"
                      onClick={() => {
                        markTouched();
                        setReleaseIndex(i);
                      }}
                      aria-pressed={i === releaseIndex}
                      aria-label={`Release ${item.v}, ${item.title}`}
                      className={`absolute top-0 flex h-[18px] -translate-x-1/2 items-center rounded-[5px] px-1.5 font-mono text-[10.5px] tabular-nums outline-none transition-colors focus-visible:ring-2 focus-visible:ring-[#ffc58a] ${i === releaseIndex ? "bg-[#ff7a2f] text-black" : "bg-[#1c1c1e] text-[#a1a1a6] shadow-[inset_0_0_0_1px_rgba(255,255,255,.1)] hover:text-[#f5f5f5]"}`}
                      style={{ left: xPct(item.day) }}
                    >
                      {item.v}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div
            className="mx-4 mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 rounded-[10px] bg-white/[.03] px-3.5 py-3 shadow-[inset_0_0_0_1px_rgba(255,255,255,.06)] sm:mx-5"
            aria-live="polite"
          >
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span
                key={`${metric.key}-${release.v}`}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ type: "spring", stiffness: 420, damping: 32 }}
                className="flex flex-wrap items-center gap-x-5 gap-y-2"
              >
                <span className="flex items-center gap-2">
                  <span className="font-mono text-[12px] text-[#ffc58a]">v{release.v}</span>
                  <span className="font-medium">{release.title}</span>
                </span>
                <span
                  className={`tabular-nums ${confidence < 70 ? "text-[#a1a1a6]" : improved ? "text-[#7ee2b0]" : "text-[#ff9b9b]"}`}
                >
                  {metric.fmtDelta(delta)} after release
                </span>
                <span className="tabular-nums text-[#a1a1a6]">{confidence}% confidence</span>
                <span className="hidden tabular-nums text-[#a1a1a6] sm:inline">
                  {release.prs} pull requests
                </span>
              </motion.span>
            </AnimatePresence>
            <span className="ml-auto flex h-[26px] items-center rounded-[7px] px-2.5 text-[12px] text-[#ececec] shadow-[inset_0_0_0_1px_rgba(255,255,255,.12)]">
              Open diff
            </span>
          </div>
          <div className="mt-4 px-2 pb-3 sm:px-3" role="table" aria-label="Releases (preview)">
            <div
              role="row"
              className="grid grid-cols-[52px_1fr_88px] items-center gap-3 px-2.5 pb-2 sm:grid-cols-[64px_1fr_120px_96px] text-[11.5px] text-[#6e6e73] md:grid-cols-[72px_1.4fr_1fr_120px_130px_100px]"
            >
              <span role="columnheader">Version</span>
              <span role="columnheader">Change</span>
              <span role="columnheader" className="hidden md:block">
                Author
              </span>
              <span role="columnheader" className="hidden md:block">
                Deployed
              </span>
              <span role="columnheader">Impact</span>
              <span role="columnheader" className="hidden justify-self-end sm:block">
                Status
              </span>
            </div>
            {[...RELEASES].reverse().map((item) => {
              const i = RELEASES.indexOf(item);
              const rowDelta = metric.deltas[i];
              const good = metric.lowerIsBetter ? rowDelta < 0 : rowDelta > 0;
              const selected = i === releaseIndex;
              return (
                <div
                  key={item.v}
                  role="row"
                  tabIndex={0}
                  onClick={() => {
                    markTouched();
                    setReleaseIndex(i);
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      markTouched();
                      setReleaseIndex(i);
                    }
                  }}
                  aria-selected={selected}
                  className={`grid cursor-pointer grid-cols-[52px_1fr_88px] items-center sm:grid-cols-[64px_1fr_120px_96px] gap-3 rounded-[8px] px-2.5 py-2 outline-none transition-colors focus-visible:ring-2 focus-visible:ring-[#ffc58a] md:grid-cols-[72px_1.4fr_1fr_120px_130px_100px] ${selected ? "bg-white/[.06]" : "hover:bg-white/[.03]"}`}
                >
                  <span role="cell" className="font-mono text-[12px] text-[#ffc58a]">
                    v{item.v}
                  </span>
                  <span role="cell" className="truncate">
                    {item.title}
                  </span>
                  <span role="cell" className="hidden items-center gap-2 text-[#c7c7cc] md:flex">
                    <Initials text={item.initials} hue={item.hue} />
                    <span className="truncate">{item.author}</span>
                  </span>
                  <span role="cell" className="hidden tabular-nums text-[#8e8e93] md:block">
                    {DEPLOY_TIMES[i]}
                  </span>
                  <span role="cell" className="flex items-center gap-2">
                    <span className="hidden sm:block">
                      <Sparkline points={series[metricIndex].cur} from={item.day} />
                    </span>
                    <span
                      className={`whitespace-nowrap text-[12px] tabular-nums ${metric.conf[i] < 70 ? "text-[#a1a1a6]" : good ? "text-[#7ee2b0]" : "text-[#ff9b9b]"}`}
                    >
                      {metric.fmtDelta(rowDelta)}
                    </span>
                  </span>
                  <span role="cell" className="hidden justify-self-end sm:block">
                    <ImpactBadge confidence={metric.conf[i]} good={good} />
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </BrowserWindow>
  );
}
