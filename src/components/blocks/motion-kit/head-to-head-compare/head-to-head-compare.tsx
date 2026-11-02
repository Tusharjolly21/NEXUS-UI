"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from "react";
import { AnimatePresence, LayoutGroup, motion, useInView, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

/* Icons: Framework7 Icons (MIT) via Iconify, SF Symbols style. Inlined so the file has no icon dependency. */
const ICON_PATHS = {
  check:
    "m45.646 14.646l.708.708a2 2 0 0 1 0 2.828l-22.94 22.94a2 2 0 0 1-2.828 0l-9.94-9.94a2 2 0 0 1 0-2.828l.708-.708a2 2 0 0 1 2.828 0l6.404 6.404a2 2 0 0 0 2.828 0l19.404-19.404a2 2 0 0 1 2.828 0",
  minus:
    "M10.762 30.098h34.476c1.125 0 2.11-.961 2.11-2.11c0-1.148-.985-2.086-2.11-2.086H10.762c-1.125 0-2.11.938-2.11 2.086c0 1.149.985 2.11 2.11 2.11",
} as const;

function Mark({ name, size = 10 }: { name: keyof typeof ICON_PATHS; size?: number }) {
  return (
    <svg viewBox="0 0 56 56" width={size} height={size} fill="currentColor" aria-hidden="true">
      <path d={ICON_PATHS[name]} />
    </svg>
  );
}

export interface HeadToHeadMetric {
  /** Name of the measure. */
  label: string;
  /** What is being measured, in a few words. "lower is better" or "higher is better" is added for you. */
  note: string;
  /** Which direction wins. */
  better: "lower" | "higher";
  /** One value per column, ours first. */
  values: number[];
  /** How a value reads: "4 min", "98%", "$49.99". Digits roll when the number changes. */
  format: (value: number) => string;
  /** The verdict when we lead, for example "6.3x faster". Defaults to the plain difference. */
  say?: (ours: number, theirs: number) => string;
}

export interface HeadToHeadFeature {
  label: string;
  /** Whether each column has it, in the same order as `columns`. */
  has: boolean[];
}

export interface HeadToHeadCompareProps {
  /** Column names. The first is you; the rest are the rivals the visitor can pick. */
  columns?: string[];
  metrics?: HeadToHeadMetric[];
  features?: HeadToHeadFeature[];
  title?: string;
  subtitle?: string;
  /** Small print under the card. An empty string hides it. */
  footnote?: string;
  /** Accent in light mode. */
  accent?: string;
  /** Accent in dark mode. */
  accentDark?: string;
  /** Steps through the rivals by itself until the first pointer, key or touch. Off under reduced motion. */
  autoplay?: boolean;
  className?: string;
}

const ratio = (a: number, b: number, word: string) => {
  const r = a / b;
  return b === 0 ? `${word} by far` : `${r >= 10 ? Math.round(r) : r.toFixed(1)}x ${word}`;
};

const COLUMNS = ["Plume", "Typical kit", "Build in-house", "Template market"];

const METRICS: HeadToHeadMetric[] = [
  { label: "Time to first screen", note: "Install to something on screen", better: "lower", values: [4, 25, 480, 60], format: (v) => (v < 60 ? `${v} min` : `${Math.round(v / 60)} h`), say: (u, t) => ratio(t, u, "faster") },
  { label: "Weight per component", note: "Gzipped, on average", better: "lower", values: [3.1, 9.4, 2.2, 14.8], format: (v) => `${v.toFixed(1)} KB`, say: (u, t) => ratio(t, u, "lighter") },
  { label: "Accessibility checks", note: "Automated checks passed", better: "higher", values: [98, 71, 42, 55], format: (v) => `${v}%`, say: (u, t) => `${u - t} pts ahead` },
  { label: "Smooth on a mid-range phone", note: "Animations holding 60 fps", better: "higher", values: [100, 62, 48, 40], format: (v) => `${v}%`, say: (u, t) => `${u - t} pts ahead` },
  { label: "Components ready to use", note: "Built, documented, tested", better: "higher", values: [180, 64, 0, 35], format: (v) => `${v}`, say: (u, t) => (t ? ratio(u, t, "more") : `${u} more`) },
  { label: "Releases last year", note: "Shipped to everyone", better: "higher", values: [52, 12, 0, 4], format: (v) => `${v}`, say: (u, t) => (t ? ratio(u, t, "more") : `${u} more`) },
  { label: "Price per year", note: "One developer", better: "lower", values: [49.99, 129, 0, 79], format: (v) => (v === 0 ? "$0" : `$${v % 1 ? v.toFixed(2) : v}`), say: (u, t) => `$${(t - u).toFixed(0)} less` },
];

const FEATURES: HeadToHeadFeature[] = [
  { label: "Spring physics", has: [true, false, false, false] },
  { label: "Reduced motion", has: [true, true, false, false] },
  { label: "Dark mode", has: [true, true, true, true] },
  { label: "TypeScript", has: [true, true, true, false] },
  { label: "Copy-paste source", has: [true, false, true, true] },
  { label: "Figma file", has: [false, true, false, true] },
  { label: "Keyboard support", has: [true, true, false, false] },
  { label: "Weekly releases", has: [true, false, false, false] },
];

type Outcome = "win" | "loss" | "tie";

function outcome(m: HeadToHeadMetric, them: number): Outcome {
  const us = m.values[0];
  const tv = m.values[them];
  if (us === tv) return "tie";
  const lead = m.better === "lower" ? us < tv : us > tv;
  return lead ? "win" : "loss";
}

/** Bar lengths as a share of the best value, so a longer bar always means better, whichever way the measure runs. */
function shares(m: HeadToHeadMetric, us: number, tv: number): [number, number] {
  if (m.better === "higher") {
    const max = Math.max(us, tv) || 1;
    return [us / max, tv / max];
  }
  const lo = Math.min(us, tv);
  if (lo === 0) return [us === 0 ? 1 : 0, tv === 0 ? 1 : 0];
  return [lo / us, lo / tv];
}

function verdict(m: HeadToHeadMetric, them: number): string {
  const us = m.values[0];
  const tv = m.values[them];
  const o = outcome(m, them);
  if (o === "tie") return "Level";
  if (o === "loss") return "They lead";
  return m.say ? m.say(us, tv) : `${m.format(Math.abs(us - tv))} ahead`;
}

/** A number that rolls to its new value digit by digit, like a split-flap counter. */
function Roll({ text, className }: { text: string; className?: string }) {
  const reduce = useReducedMotion();
  const chars = text.split("");
  return (
    <span className={cn("inline-flex items-center tabular-nums", className)} aria-hidden="true">
      {chars.map((c, i) => {
        const key = chars.length - i; // keyed from the right, so units stay put and digits line up
        if (!/\d/.test(c)) {
          return (
            <motion.span layout={!reduce} key={`s${key}${c}`} className="inline-block h-[1.15em] leading-[1.15em]">
              {c === " " ? " " : c}
            </motion.span>
          );
        }
        return (
          <motion.span layout={!reduce} key={`d${key}`} className="relative inline-block h-[1.15em] overflow-hidden leading-[1.15em]">
            <motion.span
              className="flex flex-col"
              initial={false}
              animate={{ y: `${-Number(c) * 1.15}em` }}
              transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 190, damping: 22, delay: (chars.length - i) * 0.025 }}
            >
              {"0123456789".split("").map((n) => (
                <span key={n} className="h-[1.15em]">
                  {n}
                </span>
              ))}
            </motion.span>
          </motion.span>
        );
      })}
    </span>
  );
}

const R = 56;

function arcPath(i: number, n: number) {
  const step = 360 / n;
  const gap = n > 1 ? 9 : 0;
  const a0 = ((-90 + step * i + gap / 2) * Math.PI) / 180;
  const a1 = ((-90 + step * (i + 1) - gap / 2) * Math.PI) / 180;
  const p = (a: number) => `${(70 + R * Math.cos(a)).toFixed(2)} ${(70 + R * Math.sin(a)).toFixed(2)}`;
  return `M${p(a0)} A${R} ${R} 0 ${step - gap > 180 ? 1 : 0} 1 ${p(a1)}`;
}

/** The score as a ring cut into one arc per measure: ours where we lead, grey where they do. */
function ScoreRing({
  rows,
  active,
  onActive,
  live,
  wins,
}: {
  rows: Outcome[];
  active: number | null;
  onActive: (i: number | null) => void;
  live: boolean;
  wins: number;
}) {
  const reduce = useReducedMotion();
  const n = rows.length;
  return (
    <div className="relative h-[148px] w-[148px] shrink-0">
      <svg viewBox="0 0 140 140" className="absolute inset-0 h-full w-full overflow-visible" aria-hidden="true">
        {rows.map((r, i) => {
          const d = arcPath(i, n);
          return (
            <g key={i}>
              <path d={d} fill="none" strokeWidth={9} strokeLinecap="round" className="stroke-black/[.07] dark:stroke-white/[.1]" />
              <motion.path
                d={d}
                fill="none"
                strokeLinecap="round"
                initial={false}
                animate={{ pathLength: live ? 1 : 0, strokeWidth: active === i ? 12 : 9, opacity: active === null || active === i ? 1 : 0.35 }}
                transition={
                  reduce
                    ? { duration: 0 }
                    : { pathLength: { type: "spring", stiffness: 90, damping: 20, delay: live ? 0.1 + i * 0.07 : 0 }, default: { duration: 0.2 } }
                }
                style={{ stroke: r === "win" ? "var(--c)" : r === "tie" ? "#aeaeb2" : "var(--c-loss)" }}
              />
              <path
                d={d}
                fill="none"
                stroke="transparent"
                strokeWidth={22}
                onPointerEnter={() => onActive(i)}
                onPointerLeave={() => onActive(null)}
              />
            </g>
          );
        })}
      </svg>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <span className="flex items-baseline text-[38px] font-semibold leading-none tracking-[-0.04em] text-[#1d1d1f] dark:text-[#f5f5f7]">
          <Roll text={String(live ? wins : 0)} />
          <span className="ml-0.5 text-[16px] font-medium tracking-normal text-[#86868b]">/{n}</span>
        </span>
        <span className="mt-1.5 text-[12px] leading-none text-[#6e6e73] dark:text-[#98989d]">measures led</span>
      </div>
    </div>
  );
}

/** One measure: ours and theirs grow out from a shared centre line, each scaled so the longer bar is the better one. */
function Race({
  m,
  them,
  columns,
  live,
  index,
  active,
  onActive,
}: {
  m: HeadToHeadMetric;
  them: number;
  columns: string[];
  live: boolean;
  index: number;
  active: boolean;
  onActive: (on: boolean) => void;
}) {
  const reduce = useReducedMotion();
  const us = m.values[0];
  const tv = m.values[them];
  const o = outcome(m, them);
  const [su, st] = shares(m, us, tv);
  const grow = (s: number) => (live ? `${Math.max(2.5, s * 100)}%` : "0%");
  const spring = reduce ? { duration: 0 } : { type: "spring" as const, stiffness: 120, damping: 20, delay: live ? index * 0.06 : 0 };
  const text = verdict(m, them);
  const usStrong = o !== "loss";
  const themStrong = o !== "win";

  return (
    <li
      data-active={active}
      onPointerEnter={() => onActive(true)}
      onPointerLeave={() => onActive(false)}
      className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-3 rounded-2xl px-3 py-4 transition-colors duration-200 data-[active=true]:bg-black/[.03] dark:data-[active=true]:bg-white/[.05] @2xl:grid-cols-[13.5rem_minmax(0,1fr)_6.5rem] @2xl:gap-x-6 @2xl:gap-y-0"
    >
      <span className="min-w-0">
        <span className="block text-[15px] font-medium leading-snug tracking-[-0.01em] text-[#1d1d1f] dark:text-[#f5f5f7]">{m.label}</span>
        <span className="mt-0.5 block text-[12.5px] leading-snug text-[#6e6e73] dark:text-[#98989d]">
          {m.note}, {m.better} is better
        </span>
      </span>

      <span className="sr-only">
        {columns[0]} {m.format(us)}, {columns[them]} {m.format(tv)}. {text}.
      </span>

      <span
        aria-hidden="true"
        className="col-span-2 row-start-2 grid grid-cols-[3.75rem_minmax(0,1fr)_3.75rem] items-center gap-x-3 @2xl:col-span-1 @2xl:col-start-2 @2xl:row-start-1"
      >
        <span className={cn("text-right text-[13px] tabular-nums", usStrong ? "font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]" : "font-medium text-[#6e6e73] dark:text-[#98989d]")}>
          <Roll text={m.format(us)} />
        </span>
        <span className="relative grid h-[10px] grid-cols-2 gap-[3px]">
          <span className="relative flex justify-end rounded-l-full rounded-r-[3px] bg-black/[.05] dark:bg-white/[.08]">
            <motion.span
              className="relative h-full overflow-hidden rounded-l-full rounded-r-[3px] bg-[linear-gradient(270deg,var(--c),color-mix(in_srgb,var(--c)_62%,transparent))]"
              initial={false}
              animate={{ width: grow(su) }}
              transition={spring}
            >
              {o === "win" && !reduce && (
                <motion.span
                  key={them}
                  className="absolute inset-y-0 w-1/2 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,.7),transparent)]"
                  initial={{ x: "260%" }}
                  animate={{ x: "-120%" }}
                  transition={{ duration: 1.1, ease: [0.4, 0, 0.2, 1], delay: 0.2 + index * 0.06 }}
                />
              )}
            </motion.span>
          </span>
          <span className="relative flex justify-start rounded-l-[3px] rounded-r-full bg-black/[.05] dark:bg-white/[.08]">
            <motion.span
              className="h-full rounded-l-[3px] rounded-r-full bg-[#aeaeb2] dark:bg-[#636366]"
              initial={false}
              animate={{ width: grow(st) }}
              transition={spring}
            />
          </span>
        </span>
        <span className={cn("text-left text-[13px] tabular-nums", themStrong ? "font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]" : "font-medium text-[#6e6e73] dark:text-[#98989d]")}>
          <Roll text={m.format(tv)} />
        </span>
      </span>

      <span aria-hidden="true" className="col-start-2 row-start-1 min-w-0 justify-self-end text-right @2xl:col-start-3">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={`${them}-${m.label}`}
            initial={reduce ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: -8 }}
            transition={{ type: "spring", stiffness: 320, damping: 28, opacity: { duration: 0.16 } }}
            className={cn(
              "block whitespace-nowrap text-[13.5px] font-semibold tracking-[-0.005em]",
              o === "win" ? "text-[var(--c)]" : "font-medium text-[#6e6e73] dark:text-[#98989d]",
            )}
          >
            {text}
          </motion.span>
        </AnimatePresence>
      </span>
    </li>
  );
}

type Group = "us" | "both" | "them";

/**
 * Comparison as a head-to-head. Pick who to measure against and every row races again: our bar and theirs spring out
 * from a shared centre line, the numbers roll digit by digit, and the verdict says by how much, including on the rows
 * they win. The ring is cut into one arc per measure, and hovering an arc or a row lights up its twin. The feature
 * ledger underneath re-sorts itself into what only you have, what you both have and what only they have.
 */
export function HeadToHeadCompare({
  columns = COLUMNS,
  metrics = METRICS,
  features = FEATURES,
  title = "Side by side.",
  subtitle = "Pick who to measure us against. Where they come out ahead, we say so.",
  footnote = "Sample figures for a fictional product.",
  accent = "#0071e3",
  accentDark = "#2997ff",
  autoplay = true,
  className,
}: HeadToHeadCompareProps) {
  const uid = useId().replace(/:/g, "");
  const reduce = useReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const radios = useRef<(HTMLButtonElement | null)[]>([]);
  const touched = useRef(false);
  const seen = useInView(rootRef, { once: true, amount: 0.2 });
  const onScreen = useInView(rootRef, { amount: 0.35 });
  const live = seen || !!reduce;
  const [them, setThem] = useState(1);
  const [active, setActive] = useState<number | null>(null);

  const rivals = Math.max(1, columns.length - 1);
  const rows = metrics.map((m) => outcome(m, them));
  const wins = rows.filter((r) => r === "win").length;
  const behind = metrics.filter((_, i) => rows[i] === "loss").map((m) => m.label.toLowerCase());

  const groupOf = (f: HeadToHeadFeature): Group | null => {
    const a = !!f.has[0];
    const b = !!f.has[them];
    if (a && !b) return "us";
    if (a && b) return "both";
    if (!a && b) return "them";
    return null;
  };
  const byGroup: Record<Group, HeadToHeadFeature[]> = { us: [], both: [], them: [] };
  for (const f of features) {
    const g = groupOf(f);
    if (g) byGroup[g].push(f);
  }

  // Steps through the rivals until the first touch, but only while the block is on screen.
  useEffect(() => {
    if (!autoplay || reduce || !onScreen) return;
    const id = window.setInterval(() => {
      if (touched.current) return;
      setThem((t) => (t % rivals) + 1);
    }, 4600);
    return () => window.clearInterval(id);
  }, [autoplay, reduce, onScreen, rivals]);

  const stop = () => {
    touched.current = true;
  };

  const pick = (i: number) => {
    touched.current = true;
    setThem(i);
  };

  const onKey = (e: ReactKeyboardEvent<HTMLButtonElement>, i: number) => {
    const last = columns.length - 1;
    let next = i;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") next = i === last ? 1 : i + 1;
    else if (e.key === "ArrowLeft" || e.key === "ArrowUp") next = i === 1 ? last : i - 1;
    else return;
    e.preventDefault();
    pick(next);
    radios.current[next]?.focus();
  };

  const rival = columns[them];
  const summary = behind.length ? (
    <>
      {rival} comes out ahead on <b className="font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">{behind.join(" and ")}</b>.
    </>
  ) : (
    <>No measure goes to {rival}.</>
  );

  return (
    <div
      ref={rootRef}
      onPointerDownCapture={stop}
      onKeyDownCapture={stop}
      onTouchStartCapture={stop}
      className={cn("@container w-full bg-[#f5f5f7] [--c:var(--mk-acc)] dark:bg-black dark:[--c:var(--mk-acc-d)]", "[--c-loss:#8e8e93] dark:[--c-loss:#8e8e93]", className)}
      style={{ ["--mk-acc" as string]: accent, ["--mk-acc-d" as string]: accentDark, fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', sans-serif" }}
    >
      <section aria-labelledby={`${uid}-title`} className="mx-auto w-full max-w-[1000px] px-4 py-12 @2xl:px-8 @2xl:py-16">
        <div className="mb-7 flex flex-col gap-5 @2xl:mb-9 @2xl:flex-row @2xl:items-end @2xl:justify-between @2xl:gap-8">
          <div className="max-w-[520px]">
            <h2 id={`${uid}-title`} className="m-0 text-[clamp(30px,6cqw,46px)] font-semibold leading-[1.05] tracking-[-0.035em] text-[#1d1d1f] dark:text-[#f5f5f7]">
              {title}
            </h2>
            {subtitle && <p className="m-0 mt-3 text-[16px] leading-[1.45] text-[#6e6e73] @2xl:text-[17px] dark:text-[#98989d]">{subtitle}</p>}
          </div>

          <LayoutGroup id={`${uid}-pick`}>
            <div
              role="radiogroup"
              aria-label={`Compare ${columns[0]} against`}
              className="grid w-full max-w-full grid-cols-3 gap-0.5 self-start rounded-[22px] bg-[#e8e8ed] p-[3px] text-[12.5px] font-medium dark:bg-[#1c1c1e] @2xl:flex @2xl:w-auto @2xl:rounded-full @2xl:text-[13px]"
            >
              {columns.slice(1).map((c, k) => {
                const i = k + 1;
                const on = them === i;
                return (
                  <button
                    key={c}
                    ref={(el) => {
                      radios.current[i] = el;
                    }}
                    type="button"
                    role="radio"
                    aria-checked={on}
                    tabIndex={on ? 0 : -1}
                    onClick={() => pick(i)}
                    onKeyDown={(e) => onKey(e, i)}
                    className={cn(
                      "relative min-h-9 shrink-0 rounded-[19px] px-2 py-1.5 text-center leading-tight outline-hidden transition-colors focus-visible:ring-2 focus-visible:ring-[var(--c)] @2xl:rounded-full @2xl:px-4 @2xl:py-0 @2xl:whitespace-nowrap",
                      on ? "text-[#1d1d1f] dark:text-[#f5f5f7]" : "text-[#6e6e73] hover:text-[#1d1d1f] dark:text-[#98989d] dark:hover:text-[#f5f5f7]",
                    )}
                  >
                    {on && (
                      <motion.span
                        layoutId={`${uid}-bubble`}
                        className="absolute inset-0 rounded-[19px] bg-white shadow-[0_1px_2px_rgba(0,0,0,.12),0_6px_14px_-6px_rgba(0,0,0,.18)] dark:bg-[#3a3a3c] dark:shadow-[0_1px_2px_rgba(0,0,0,.5)] @2xl:rounded-full"
                        transition={{ type: "spring", stiffness: 420, damping: 34 }}
                      />
                    )}
                    <span className="relative">{c}</span>
                  </button>
                );
              })}
            </div>
          </LayoutGroup>
        </div>

        <div className="overflow-hidden rounded-[28px] bg-white shadow-[0_0_0_1px_rgba(0,0,0,.05),0_30px_60px_-36px_rgba(0,0,0,.35)] dark:bg-[#1c1c1e] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08)]">
          {/* The score */}
          <div className="flex flex-col items-start gap-6 border-b border-solid border-black/[.06] p-5 @md:flex-row @md:items-center @md:gap-8 @2xl:p-8 dark:border-white/10">
            <ScoreRing rows={rows} active={active} onActive={setActive} live={live} wins={wins} />
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[14px] font-semibold">
                <span className="inline-flex items-center gap-1.5 text-[#1d1d1f] dark:text-[#f5f5f7]">
                  <span className="h-2.5 w-2.5 rounded-full bg-[var(--c)]" />
                  {columns[0]}
                </span>
                <span className="font-normal text-[#86868b]">vs</span>
                <span className="relative inline-flex min-w-0 items-center gap-1.5 overflow-hidden text-[#6e6e73] dark:text-[#98989d]">
                  <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-[#aeaeb2] dark:bg-[#636366]" />
                  <AnimatePresence mode="popLayout" initial={false}>
                    <motion.span
                      key={them}
                      className="truncate"
                      initial={reduce ? false : { y: 16, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={reduce ? { opacity: 0 } : { y: -16, opacity: 0 }}
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    >
                      {rival}
                    </motion.span>
                  </AnimatePresence>
                </span>
              </div>
              <p className="m-0 mt-2.5 text-[clamp(20px,4.4cqw,26px)] font-semibold leading-[1.15] tracking-[-0.025em] text-[#1d1d1f] dark:text-[#f5f5f7]" aria-live="polite">
                Ahead on {wins} of {metrics.length} measures.
              </p>
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.p
                  key={them}
                  className="m-0 mt-2 max-w-[44ch] text-[14.5px] leading-[1.5] text-[#6e6e73] dark:text-[#98989d]"
                  initial={reduce ? false : { opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduce ? { opacity: 0 } : { opacity: 0, y: -8 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                >
                  {summary}
                </motion.p>
              </AnimatePresence>
            </div>
          </div>

          {/* The races */}
          <ul className="m-0 list-none px-2 py-2 @2xl:px-5 " onPointerLeave={() => setActive(null)}>
            {metrics.map((m, i) => (
              <Race
                key={m.label}
                m={m}
                them={them}
                columns={columns}
                live={live}
                index={i}
                active={active === i}
                onActive={(on) => setActive(on ? i : null)}
              />
            ))}
          </ul>

          {/* The features, sorting themselves by who has them */}
          <div className="border-t border-solid border-black/[.06] bg-black/[.02] p-5 @2xl:p-8 dark:border-white/10 dark:bg-white/[.03]">
            <LayoutGroup id={`${uid}-feat`}>
              <div className="grid gap-6 @2xl:grid-cols-3 @2xl:gap-8">
                {(
                  [
                    { key: "us", title: `Only ${columns[0]}` },
                    { key: "both", title: "Both have" },
                    { key: "them", title: `Only ${rival}` },
                  ] as { key: Group; title: string }[]
                ).map((g) => (
                  <div key={g.key} className="min-w-0">
                    <h3 className="m-0 mb-2 flex items-baseline gap-2 text-[13px] font-semibold tracking-[-0.005em] text-[#1d1d1f] dark:text-[#f5f5f7]">
                      <span className={cn("truncate", g.key === "us" && "text-[var(--c)]")}>{g.title}</span>
                      <span className="text-[12px] font-medium text-[#86868b]">
                        <Roll text={String(byGroup[g.key].length)} />
                      </span>
                    </h3>
                    <ul className="m-0 flex list-none flex-col p-0">
                      <AnimatePresence initial={false} mode="popLayout">
                        {byGroup[g.key].map((f) => (
                          <motion.li
                            key={f.label}
                            layout={!reduce}
                            layoutId={reduce ? undefined : `${uid}-${f.label}`}
                            initial={reduce ? false : { opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            className="flex h-9 items-center gap-2.5 text-[14px] text-[#1d1d1f] dark:text-[#f5f5f7]"
                          >
                            <span
                              className={cn(
                                "grid h-[18px] w-[18px] shrink-0 place-items-center rounded-full",
                                g.key === "us" && "bg-[var(--c)] text-white",
                                g.key === "both" && "bg-black/[.08] text-[#1d1d1f] dark:bg-white/[.14] dark:text-[#f5f5f7]",
                                g.key === "them" && "text-[#86868b] shadow-[inset_0_0_0_1.5px_#c7c7cc] dark:shadow-[inset_0_0_0_1.5px_#48484a]",
                              )}
                            >
                              <Mark name={g.key === "them" ? "minus" : "check"} size={g.key === "them" ? 9 : 9} />
                            </span>
                            <span className={cn("truncate", g.key === "them" && "text-[#6e6e73] dark:text-[#98989d]")}>{f.label}</span>
                          </motion.li>
                        ))}
                      </AnimatePresence>
                      {byGroup[g.key].length === 0 && <li className="flex h-9 items-center text-[13.5px] text-[#86868b]">None</li>}
                    </ul>
                  </div>
                ))}
              </div>
            </LayoutGroup>
          </div>
        </div>

        {footnote && <p className="m-0 mt-4 px-1 text-[12px] leading-[1.4] text-[#6e6e73] dark:text-[#98989d]">{footnote}</p>}
      </section>
    </div>
  );
}
