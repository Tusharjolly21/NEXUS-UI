"use client";

import { useEffect, useId, useMemo, useRef, useState, type RefObject } from "react";
import { LayoutGroup, motion, useInView, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useSound } from "@/lib/ui-sounds";

export interface OdometerStat {
  /** Small label above the number. Also the key, so keep it unique. */
  label: string;
  /** Text before the number, for example "$". */
  prefix?: string;
  /** Text after the number, for example "k" or "%". */
  suffix?: string;
  /** The number for each period, keyed by the period label. Whole numbers get thousands separators; others show two decimals. */
  values: Record<string, number>;
  /** The percentage change for each period. 0 or missing shows "Steady". */
  deltas: Record<string, number>;
  /** Ten or so points for the sparkline, drawn left to right. */
  spark: number[];
}

export interface StatsOdometerProps {
  /** Section heading. */
  heading?: string;
  /** The period tabs, in order. Each stat needs a value for every one. */
  periods?: string[];
  /** The stat cards. Use a stable array. */
  stats?: OdometerStat[];
  /** Period selected first. Defaults to the first one. */
  defaultPeriod?: string;
  /**
   * Steps through the periods every 3.6 s once the numbers have rolled in, until the visitor picks one.
   * Pauses off screen and in a hidden tab. Never runs under reduced motion.
   */
  autoplay?: boolean;
  /** Taps when the period switches. Follows the site-wide sound switch. */
  enableSound?: boolean;
  /** Called when the visitor picks a period. */
  onPeriodChange?: (period: string) => void;
  className?: string;
}

export const DEFAULT_ODOMETER_PERIODS = ["30 days", "Quarter", "Year"];
export const DEFAULT_ODOMETER_STATS: OdometerStat[] = [
  {
    label: "Active teams",
    values: { "30 days": 2148, Quarter: 5930, Year: 18402 },
    deltas: { "30 days": 12, Quarter: 31, Year: 140 },
    spark: [3, 4, 4, 5, 7, 6, 8, 9, 11, 12],
  },
  {
    label: "Components shipped",
    values: { "30 days": 96, Quarter: 268, Year: 914 },
    deltas: { "30 days": 8, Quarter: 22, Year: 64 },
    spark: [2, 3, 5, 4, 6, 7, 6, 8, 9, 10],
  },
  {
    label: "Revenue",
    prefix: "$",
    suffix: "k",
    values: { "30 days": 84, Quarter: 241, Year: 902 },
    deltas: { "30 days": 18, Quarter: 26, Year: 210 },
    spark: [4, 4, 5, 6, 5, 7, 8, 8, 10, 12],
  },
  {
    label: "Uptime",
    suffix: "%",
    values: { "30 days": 99.98, Quarter: 99.97, Year: 99.95 },
    deltas: { "30 days": 0, Quarter: 0, Year: 0 },
    spark: [9, 9, 9, 8, 9, 9, 9, 9, 9, 9],
  },
];

const FOCUS =
  "outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0071e3] dark:focus-visible:outline-[#0a84ff]";

const fmt = (n: number) => (n % 1 ? n.toFixed(2) : n.toLocaleString("en-US"));

/** True while the element is on screen and the tab is visible, so timers can stand down otherwise. */
function useOnScreen(ref: RefObject<HTMLElement | null>) {
  const [inView, setInView] = useState(true);
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0.1 });
    io.observe(el);
    const onVisibility = () => setVisible(!document.hidden);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [ref]);
  return inView && visible;
}

/** One column of digits that rolls to `d`; the longer it travels the later it settles. */
function Digit({ d, i, show, instant }: { d: number; i: number; show: boolean; instant: boolean }) {
  return (
    <span className="relative inline-block h-[1em] w-[0.62em] overflow-hidden" aria-hidden="true">
      <motion.span
        className="absolute left-0 top-0 flex flex-col items-center"
        initial={false}
        animate={{ y: show ? `${-d}em` : "0em" }}
        transition={instant ? { duration: 0 } : { type: "spring", stiffness: 70, damping: 15, mass: 0.8 + i * 0.12 }}
      >
        {Array.from({ length: 10 }, (_, k) => (
          <span key={k} className="block h-[1em] leading-[1em]">
            {k}
          </span>
        ))}
      </motion.span>
    </span>
  );
}

function Odometer({ value, show, instant, prefix = "", suffix = "" }: { value: string; show: boolean; instant: boolean; prefix?: string; suffix?: string }) {
  let di = 0;
  // Everything sits in one flex row of 1em boxes so the reels and the symbols share a baseline.
  return (
    <span className="inline-flex h-[1em] items-end leading-[1em]" role="img" aria-label={prefix + value + suffix}>
      {prefix && (
        <span className="inline-block leading-[1em]" aria-hidden="true">
          {prefix}
        </span>
      )}
      {[...value].map((c, k) =>
        /\d/.test(c) ? (
          <Digit key={k + "-" + value.length} d={+c} i={di++} show={show} instant={instant} />
        ) : (
          <span key={k} className="inline-block leading-[1em]" aria-hidden="true">
            {c}
          </span>
        ),
      )}
      {suffix && (
        <span className="inline-block leading-[1em]" aria-hidden="true">
          {suffix}
        </span>
      )}
    </span>
  );
}

/**
 * Stats that count up like an odometer when they scroll into view: each digit is a reel, and the ones that
 * travel further settle a beat later. Switch the period and every reel rolls straight to the new number;
 * the sparklines redraw and the change pills update. Under reduced motion the numbers are simply there.
 */
export function StatsOdometer({
  heading = "Built in public. Here’s how it’s going.",
  periods = DEFAULT_ODOMETER_PERIODS,
  stats = DEFAULT_ODOMETER_STATS,
  defaultPeriod,
  autoplay = false,
  enableSound = true,
  onPeriodChange,
  className,
}: StatsOdometerProps) {
  const reduce = useReducedMotion();
  const play = useSound(enableSound);
  const uid = useId().replace(/:/g, "");
  const ref = useRef<HTMLElement>(null);
  const onScreen = useOnScreen(ref);
  const inView = useInView(ref, { once: true, amount: 0.4 });
  const [picked, setPicked] = useState(defaultPeriod ?? periods[0]);
  const [touched, setTouched] = useState(false);

  const p = periods.includes(picked) ? picked : periods[0];
  const seen = inView || !!reduce;
  const running = autoplay && !reduce && !touched && onScreen && seen && periods.length > 1;

  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => {
      setPicked((cur) => periods[(Math.max(0, periods.indexOf(cur)) + 1) % periods.length]);
      play.auto("tap", 0.4);
    }, 3600);
    return () => window.clearInterval(id);
  }, [running, periods, play]);

  const pick = (x: string) => {
    setTouched(true);
    setPicked(x);
    if (x !== p) play("tap", 0.5);
    onPeriodChange?.(x);
  };

  const sparks = useMemo(
    () =>
      stats.map((s) => {
        const max = Math.max(1, ...s.spark);
        return s.spark.map((v, i) => `${(i / Math.max(1, s.spark.length - 1)) * 100},${28 - (v / max) * 24}`).join(" ");
      }),
    [stats],
  );

  return (
    <section ref={ref} aria-label="Statistics" className={cn("w-full bg-[#f5f5f7] px-4 py-12 dark:bg-black", className)}>
      <div className="mx-auto w-full max-w-[1080px] rounded-[28px] bg-white px-5 py-8 shadow-[0_0_0_1px_rgba(0,0,0,.05),0_20px_40px_-26px_rgba(0,0,0,.3)] sm:px-8 dark:bg-[#1c1c1e] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08),0_20px_40px_-26px_rgba(0,0,0,.9)]">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 className="m-0 max-w-[420px] text-[clamp(26px,4vw,36px)] font-semibold leading-[1.1] tracking-[-0.03em] text-[#1d1d1f] dark:text-[#f5f5f7]">{heading}</h2>
          <LayoutGroup id={`${uid}-period`}>
            <div className="flex max-w-full gap-1 overflow-x-auto rounded-full bg-[#f5f5f7] p-1 dark:bg-[#2c2c2e]" role="group" aria-label="Period">
              {periods.map((x) => (
                <button key={x} type="button" aria-pressed={p === x} onClick={() => pick(x)} className={cn("relative h-8 flex-none rounded-full px-3.5 text-[13px] font-medium", FOCUS)}>
                  {p === x && (
                    <motion.span
                      layoutId={`${uid}-thumb`}
                      className="absolute inset-0 rounded-full bg-white shadow-[0_1px_2px_rgba(0,0,0,.08),0_0_0_1px_rgba(0,0,0,.04)] dark:bg-[#48484a] dark:shadow-none"
                      transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 420, damping: 34 }}
                    />
                  )}
                  <span className={cn("relative", p === x ? "text-[#1d1d1f] dark:text-[#f5f5f7]" : "text-[#6e6e73] dark:text-[#a1a1a6]")}>{x}</span>
                </button>
              ))}
            </div>
          </LayoutGroup>
        </div>
        <p className="sr-only" aria-live="polite">{`Showing figures for ${p}`}</p>

        <div className="mt-7 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((s, si) => {
            const delta = s.deltas[p] ?? 0;
            return (
              <div key={s.label} className="rounded-[20px] bg-[#f5f5f7] p-5 dark:bg-[#2c2c2e]">
                <div className="text-[13px] text-[#6e6e73] dark:text-[#a1a1a6]">{s.label}</div>
                <div className="mt-2 text-[34px] font-semibold tabular-nums tracking-[-0.03em] text-[#1d1d1f] dark:text-[#f5f5f7]">
                  <Odometer value={fmt(s.values[p] ?? 0)} show={seen} instant={!!reduce} prefix={s.prefix} suffix={s.suffix} />
                </div>
                <div className="mt-3 flex items-end justify-between gap-3">
                  <motion.span
                    key={p + s.label}
                    className={cn(
                      "rounded-full px-2 py-0.5 text-[11.5px] font-semibold",
                      delta ? "bg-[#e9f9ee] text-[#1a7f37] dark:bg-[#30d158]/15 dark:text-[#30d158]" : "bg-white text-[#6e6e73] dark:bg-[#1c1c1e] dark:text-[#a1a1a6]",
                    )}
                    initial={reduce ? false : { opacity: 0, y: 4 }}
                    animate={{ opacity: seen ? 1 : 0, y: 0 }}
                    transition={reduce ? { duration: 0 } : { delay: 0.5 + si * 0.08 }}
                  >
                    {delta ? `+${delta}%` : "Steady"}
                  </motion.span>
                  <svg viewBox="0 0 100 30" className="h-8 w-24" preserveAspectRatio="none" aria-hidden="true">
                    <motion.polyline
                      key={p}
                      points={sparks[si]}
                      fill="none"
                      className="stroke-[#0071e3] dark:stroke-[#0a84ff]"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      initial={{ pathLength: reduce ? 1 : 0 }}
                      animate={{ pathLength: seen ? 1 : 0 }}
                      transition={reduce ? { duration: 0 } : { duration: 0.9, delay: 0.3 + si * 0.08 }}
                    />
                  </svg>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
