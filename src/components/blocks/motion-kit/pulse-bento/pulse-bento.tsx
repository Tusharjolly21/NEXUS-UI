"use client";

import { useEffect, useId, useRef, useState, type CSSProperties, type ReactNode } from "react";
import {
  AnimatePresence,
  animate,
  LayoutGroup,
  motion,
  useInView,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
} from "framer-motion";
import { cn } from "@/lib/utils";

export interface PulseBentoProps {
  /** Small line above the heading. */
  eyebrow?: string;
  title?: string;
  /** Any CSS colour. Leave empty to use Apple blue, which brightens in dark mode. */
  accent?: string;
  /** Keeps the heart-rate tile beating and its trace scrolling while it is on screen. */
  autoplay?: boolean;
  className?: string;
}

const ease = [0.16, 1, 0.3, 1] as const;

const shell =
  "relative flex flex-col overflow-hidden rounded-[28px] bg-white shadow-[0_0_0_1px_rgba(0,0,0,.05),0_24px_48px_-32px_rgba(0,0,0,.35)] dark:bg-[#1c1c1e] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08)]";
const ink = "text-[#1d1d1f] dark:text-[#f5f5f7]";
const sub = "text-[#86868b] dark:text-[#a1a1a6]";
const ring = "outline-none focus-visible:ring-2 focus-visible:ring-[var(--pb-accent)]";

function Tile({ children, className, title, body }: { children: ReactNode; className?: string; title: string; body: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.8, ease }}
      className={cn(shell, className)}
    >
      <div className="flex flex-1 items-center justify-center p-5 sm:p-6">{children}</div>
      <div className="px-5 pb-6 sm:px-7 sm:pb-7">
        <h3 className={cn("m-0 text-[19px] font-semibold tracking-[-0.02em]", ink)}>{title}</h3>
        <p className="m-0 mt-1 text-[15px] leading-[1.5] text-[#6e6e73] dark:text-[#a1a1a6]">{body}</p>
      </div>
    </motion.div>
  );
}

/** Segmented control. The visible pill is compact; each option's hit area is stretched to 40px tall. */
function Seg<T extends string>({ value, options, onChange, label }: { value: T; options: T[]; onChange: (v: T) => void; label: string }) {
  return (
    <div className="inline-flex shrink-0 rounded-full bg-[#f0f0f3] p-0.5 dark:bg-[#2c2c2e]" role="radiogroup" aria-label={label}>
      {options.map((o) => {
        const on = value === o;
        return (
          <button
            key={o}
            type="button"
            role="radio"
            aria-checked={on}
            onClick={() => onChange(o)}
            className={cn(
              "relative h-7 rounded-full px-3 text-[12px] font-medium after:absolute after:-inset-y-1.5 after:inset-x-0 after:content-['']",
              ring,
              on ? ink : "text-[#6e6e73] dark:text-[#a1a1a6]",
            )}
          >
            {on && (
              <motion.span
                layoutId="seg-thumb"
                className="absolute inset-0 rounded-full bg-white shadow-[0_1px_4px_rgba(0,0,0,.12)] dark:bg-[#636366] dark:shadow-none"
                transition={{ type: "spring", stiffness: 500, damping: 34 }}
              />
            )}
            <span className="relative">{o}</span>
          </button>
        );
      })}
    </div>
  );
}

function useCount(target: number, decimals = 0) {
  const mv = useMotionValue(target);
  const [t, setT] = useState(target);
  useMotionValueEvent(mv, "change", (v) => setT(v));
  useEffect(() => {
    const c = animate(mv, target, { duration: 0.9, ease });
    return () => c.stop();
  }, [target, mv]);
  return t.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

/* ---------- Traffic: stacked bars that re-stack between ranges ---------- */
const SRC = ["#0a84ff", "#bf5af2", "#ffd60a", "#ff375f"];
const SRC_NAMES = ["Search", "Social", "Email", "Referral"];

/** Seeded, so the bars are identical on the server and the client. */
function trafficSeries(seed: number, length: number) {
  let s = seed;
  const r = () => (s = (s * 9301 + 49297) % 233280) / 233280;
  return Array.from({ length }, (_, i) =>
    SRC.map((_, k) => (0.4 + r()) * (k === 0 ? 1.3 : k === 3 ? 0.4 : 0.8) * (0.7 + Math.sin(i / 3) * 0.3)),
  );
}
const TRAFFIC = { Day: trafficSeries(7, 24), Week: trafficSeries(3, 12) };

function Traffic() {
  const [range, setRange] = useState<"Day" | "Week">("Day");
  const data = TRAFFIC[range];
  const max = Math.max(...data.map((c) => c.reduce((a, b) => a + b, 0)));
  const total = useCount(range === "Day" ? 24182 : 151904);
  return (
    <div className="w-full max-w-[420px]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className={cn("text-[13px] font-semibold", ink)}>Traffic</div>
          <div className={cn("text-[12px]", sub)}>
            Last {data.length} {range === "Day" ? "days" : "weeks"}
          </div>
        </div>
        <Seg label="Range" value={range} options={["Day", "Week"]} onChange={setRange} />
      </div>
      <div className={cn("mt-2 text-[30px] font-semibold tabular-nums tracking-[-0.03em]", ink)}>
        {total} <span className={cn("text-[13px] font-normal tracking-normal", sub)}>visits</span>
      </div>
      <div className="mt-3 flex h-[120px] items-end gap-[2px] sm:gap-[3px]" aria-hidden="true">
        {data.map((c, i) => (
          <div key={`${range}-${i}`} className="flex h-full min-w-0 flex-1 flex-col-reverse gap-[2px]">
            {c.map((v, k) => (
              <motion.span
                key={k}
                className="w-full rounded-[3px]"
                style={{ background: SRC[k] }}
                initial={{ height: 0 }}
                animate={{ height: `${(v / max) * 100}%` }}
                transition={{ type: "spring", stiffness: 220, damping: 22, delay: i * 0.018 + k * 0.03 }}
              />
            ))}
          </div>
        ))}
      </div>
      <div className={cn("mt-3 flex flex-wrap gap-x-3 gap-y-1 text-[11px]", sub)}>
        {SRC_NAMES.map((n, k) => (
          <span key={n} className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full" style={{ background: SRC[k] }} />
            {n}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ---------- Revenue: a line that morphs between timeframes ---------- */
const SHAPES: Record<string, number[]> = {
  "1H": [40, 42, 39, 45, 44, 50, 48, 53, 52, 58, 56, 60],
  "4H": [30, 36, 33, 41, 38, 35, 44, 49, 46, 54, 58, 63],
  "1D": [20, 26, 24, 31, 37, 34, 42, 47, 45, 56, 61, 68],
};

function Revenue({ reduce }: { reduce: boolean }) {
  const [tf, setTf] = useState<"1H" | "4H" | "1D">("1D");
  const pts = SHAPES[tf];
  const d = pts.map((v, i) => `${i ? "L" : "M"}${(i / (pts.length - 1)) * 300} ${90 - v}`).join(" ");
  const value = useCount(tf === "1H" ? 58212.4 : tf === "4H" ? 58560.1 : 58834.75, 2);
  const change = tf === "1H" ? "+212.40 · 0.4%" : tf === "4H" ? "+560.10 · 1.0%" : "+1,204.60 · 2.1%";
  const last = pts[pts.length - 1];
  const spring = { type: "spring", stiffness: 120, damping: 18 } as const;
  return (
    <div className="w-full max-w-[320px]">
      <div className={cn("text-[30px] font-semibold tabular-nums tracking-[-0.03em]", ink)}>${value}</div>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.div
          key={tf}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          className="text-[12px] font-medium text-[#248a3d] dark:text-[#30d158]"
        >
          {change} today
        </motion.div>
      </AnimatePresence>
      <svg viewBox="0 0 300 92" className="mt-3 w-full overflow-visible" aria-hidden="true">
        <motion.path
          initial={false}
          animate={{ d }}
          transition={spring}
          fill="none"
          stroke="#30d158"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <motion.circle
          r="5"
          className="fill-white dark:fill-[#1c1c1e]"
          stroke="#30d158"
          strokeWidth="2.5"
          initial={false}
          animate={{ cx: 300, cy: 90 - last }}
          transition={spring}
        />
        {!reduce && (
          <motion.circle
            r="5"
            fill="#30d158"
            initial={false}
            animate={{ cx: 300, cy: 90 - last, scale: [1, 2.6], opacity: [0.5, 0] }}
            transition={{
              scale: { duration: 1.4, repeat: Infinity },
              opacity: { duration: 1.4, repeat: Infinity },
              default: spring,
            }}
          />
        )}
      </svg>
      <div className="mt-3">
        <Seg label="Timeframe" value={tf} options={["1H", "4H", "1D"]} onChange={setTf} />
      </div>
    </div>
  );
}

/* ---------- Team update with reactions ---------- */
const REACT = [
  { id: "ship", label: "Shipped", d: "M12 2c3 2 5 6 4 11l-2 3h-4l-2-3C7 8 9 4 12 2zM9 16l-3 3 1-4M15 16l3 3-1-4", c: "#5e5ce6" },
  { id: "fire", label: "Fire", d: "M12 22c4 0 7-3 7-7 0-4-3-6-4-10-1 2-2 3-3 3 0-2-1-4-3-6 0 4-4 7-4 13 0 4 3 7 7 7z", c: "#ff9f0a" },
  { id: "heart", label: "Love", d: "M12 21s-8-5-8-11a4.5 4.5 0 0 1 8-3 4.5 4.5 0 0 1 8 3c0 6-8 11-8 11z", c: "#ff375f" },
];

function Update({ reduce }: { reduce: boolean }) {
  const [state, setState] = useState<Record<string, { n: number; mine: boolean }>>({
    ship: { n: 3, mine: false },
    fire: { n: 2, mine: false },
    heart: { n: 0, mine: false },
  });
  const [burst, setBurst] = useState<{ id: string; n: number } | null>(null);
  const tap = (id: string) => {
    setState((s) => ({ ...s, [id]: { n: s[id].n + (s[id].mine ? -1 : 1), mine: !s[id].mine } }));
    setBurst((b) => ({ id, n: (b?.n ?? 0) + 1 }));
  };
  return (
    <div className="flex w-full max-w-[300px] flex-col items-start gap-2">
      <div className="flex items-center gap-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#ff9f0a] text-[11px] font-semibold text-white">MC</span>
        <span className={cn("text-[13px] font-semibold", ink)}>Maya</span>
        <span className={cn("text-[12px]", sub)}>2m</span>
      </div>
      <div className={cn("rounded-[18px] rounded-tl-md bg-[#f0f0f3] px-4 py-2.5 text-[15px] dark:bg-[#2c2c2e]", ink)}>
        Shipped the new onboarding flow
      </div>
      <motion.div layout={!reduce} className="flex flex-wrap gap-1.5">
        {REACT.filter((r) => state[r.id].n > 0 || r.id === "heart").map((r) => {
          const mine = state[r.id].mine;
          const bursting = burst?.id === r.id;
          return (
            <motion.button
              layout={!reduce}
              key={r.id}
              type="button"
              aria-pressed={mine}
              aria-label={`${r.label}, ${state[r.id].n}`}
              onClick={() => tap(r.id)}
              whileTap={{ scale: 0.88 }}
              className={cn(
                "relative flex h-9 items-center gap-1.5 rounded-full px-3 text-[13px] font-semibold transition-colors after:absolute after:-inset-y-0.5 after:inset-x-0 after:content-['']",
                ring,
                ink,
                mine
                  ? "bg-[#e8f1fd] shadow-[inset_0_0_0_1.5px_var(--pb-accent)] dark:bg-[#0a84ff]/20"
                  : "bg-white shadow-[0_0_0_1px_rgba(0,0,0,.08)] dark:bg-[#2c2c2e] dark:shadow-[0_0_0_1px_rgba(255,255,255,.1)]",
              )}
            >
              <motion.span
                key={bursting ? `${r.id}-${burst.n}` : r.id}
                className="relative flex"
                animate={reduce ? undefined : { scale: [1, 1.45, 1] }}
                transition={{ duration: 0.35 }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={r.c} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d={r.d} />
                </svg>
                {bursting &&
                  mine &&
                  !reduce &&
                  Array.from({ length: 6 }, (_, k) => (
                    <motion.span
                      key={k}
                      className="absolute left-1/2 top-1/2 h-1 w-1 rounded-full"
                      style={{ background: r.c }}
                      initial={{ x: 0, y: 0, opacity: 1 }}
                      animate={{ x: Math.cos(k) * 15, y: Math.sin(k) * 15, opacity: 0 }}
                      transition={{ duration: 0.5 }}
                    />
                  ))}
              </motion.span>
              <span className="relative inline-flex h-5 overflow-hidden tabular-nums">
                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.span key={state[r.id].n} initial={{ y: 14 }} animate={{ y: 0 }} exit={{ y: -14 }}>
                    {state[r.id].n}
                  </motion.span>
                </AnimatePresence>
              </span>
            </motion.button>
          );
        })}
      </motion.div>
    </div>
  );
}

/* ---------- Live heart rate: a beating number and an ECG trace ---------- */
const BEAT = "M0 30 H22 L28 22 L34 30 H44 L50 4 L57 52 L63 30 H76 L84 24 L92 30 H120";

function HeartRate({ live }: { live: boolean }) {
  const [bpm, setBpm] = useState(69);
  const ref = useRef<HTMLDivElement>(null);
  const seen = useInView(ref);
  const offset = useMotionValue(0);
  useEffect(() => {
    if (!seen || !live) return;
    // Seeded walk, so every visitor sees the same believable wobble.
    let s = 11;
    const rand = () => (s = (s * 9301 + 49297) % 233280) / 233280;
    const t = setInterval(() => setBpm((b) => Math.max(58, Math.min(97, b + Math.round((rand() - 0.5) * 6)))), 1400);
    const c = animate(offset, [0, -120], { duration: 1.6, repeat: Infinity, ease: "linear" });
    return () => {
      clearInterval(t);
      c.stop();
    };
  }, [seen, live, offset]);
  return (
    <div ref={ref} className="w-full max-w-[260px]">
      <div className="flex items-start justify-between">
        <span className={cn("text-[44px] font-semibold leading-none tracking-[-0.04em] tabular-nums", ink)}>
          {bpm}
          <span className={cn("ml-1 text-[14px] font-medium tracking-normal", sub)}>BPM</span>
        </span>
        <motion.svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          animate={live ? { scale: [1, 1.25, 1, 1.12, 1] } : { scale: 1 }}
          transition={live ? { duration: 60 / bpm, repeat: Infinity } : { duration: 0 }}
          aria-hidden="true"
        >
          <path fill="#ff375f" d="M12 21s-8-5-8-11a4.5 4.5 0 0 1 8-3 4.5 4.5 0 0 1 8 3c0 6-8 11-8 11z" />
        </motion.svg>
      </div>
      <div className={cn("mt-1 flex gap-4 text-[12px]", sub)}>
        <span>Peak 97</span>
        <span>Low 51</span>
      </div>
      <div
        className="mt-4 overflow-hidden"
        style={{
          maskImage: "linear-gradient(90deg,transparent,#000 15%,#000 85%,transparent)",
          WebkitMaskImage: "linear-gradient(90deg,transparent,#000 15%,#000 85%,transparent)",
        }}
      >
        <motion.svg width="480" height="56" viewBox="0 0 480 56" className="max-w-none" style={{ x: offset }} aria-hidden="true">
          {[0, 120, 240, 360].map((x) => (
            <path key={x} d={BEAT} transform={`translate(${x} 0)`} fill="none" stroke="#ff375f" strokeWidth="2" strokeLinejoin="round" />
          ))}
        </motion.svg>
      </div>
    </div>
  );
}

/**
 * Analytics bento in the spirit of a product dashboard: stacked traffic that re-stacks between
 * ranges, a revenue line that morphs between timeframes, a team update you can react to, and a
 * live heart-rate style pulse.
 */
export function PulseBento({
  eyebrow = "Live everywhere",
  title = "Your product's pulse, at a glance.",
  accent,
  autoplay = true,
  className,
}: PulseBentoProps) {
  const reduce = useReducedMotion() ?? false;
  const uid = useId();
  return (
    <section
      className={cn(
        "w-full bg-[#f5f5f7] px-5 py-16 sm:py-20 dark:bg-black",
        !accent && "[--pb-accent:#0071e3] dark:[--pb-accent:#2997ff]",
        className,
      )}
      style={accent ? ({ "--pb-accent": accent } as CSSProperties) : undefined}
    >
      <LayoutGroup id={uid}>
        <div className="mx-auto w-full max-w-[1120px]">
          <div className="mb-10 flex flex-col gap-3 sm:mb-12">
            <span className="text-[14px] font-semibold text-[var(--pb-accent)]">{eyebrow}</span>
            <h2 className={cn("m-0 max-w-[720px] text-balance text-[clamp(32px,5vw,56px)] font-semibold leading-[1.04] tracking-[-0.04em]", ink)}>
              {title}
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-5">
            <Tile className="md:col-span-3" title="Traffic by source" body="Switch the range and every bar re-stacks itself.">
              <LayoutGroup id="range">
                <Traffic />
              </LayoutGroup>
            </Tile>
            <Tile className="md:col-span-2" title="Revenue, live" body="Timeframes morph instead of redrawing.">
              <LayoutGroup id="tf">
                <Revenue reduce={reduce} />
              </LayoutGroup>
            </Tile>
            <Tile className="md:col-span-2" title="Updates people react to" body="Wins get noticed. Tap a reaction to add yours.">
              <Update reduce={reduce} />
            </Tile>
            <Tile className="md:col-span-3" title="Always on" body="Health checks every second, so you hear about problems before customers do.">
              <HeartRate live={autoplay && !reduce} />
            </Tile>
          </div>
        </div>
      </LayoutGroup>
    </section>
  );
}
