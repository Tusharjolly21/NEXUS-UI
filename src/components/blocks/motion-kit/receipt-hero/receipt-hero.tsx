"use client";

import { Fragment, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { AnimatePresence, motion, useInView, useMotionValue, useReducedMotion, useSpring, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";

export interface ReceiptHeroLink {
  label: string;
  href: string;
}

export interface ReceiptHeroStat {
  /** The figure, for example `"48"` or `"06:00"`. */
  value: string;
  /** What the figure counts, shown small under it. */
  label: string;
}

export interface ReceiptHeroProps {
  /** Name printed at the top of every receipt and in the masthead. */
  brand?: string;
  /** Small line in the middle of the masthead. Hidden in narrow containers. */
  kicker?: string;
  /** First part of the headline, set in the sans face. Words rise in one after another. */
  headline?: string;
  /** The single italic serif word or phrase inside the headline. */
  emphasis?: string;
  /** Last part of the headline, set in the sans face. */
  headlineEnd?: string;
  /** Paragraph under the headline. */
  description?: string;
  /** Main call to action. */
  primaryCta?: ReceiptHeroLink;
  /** Quiet text link next to the main call to action. Pass `null` to hide it. */
  secondaryCta?: ReceiptHeroLink | null;
  /** Up to three figures shown under the buttons. Pass an empty array to hide the row. */
  stats?: ReceiptHeroStat[];
  /** Week number of the first receipt. Every figure on a receipt is derived from its week number, so the same week always prints the same numbers. */
  startWeek?: number;
  /** Button colour in light mode. White text sits on it, so pick a dark colour. */
  accent?: string;
  /** Button colour in dark mode. Near-black text sits on it, so pick a light colour. */
  accentDark?: string;
  /** Prints, holds, tears off and prints the next week by itself until the first pointer, key or touch. Off under reduced motion, paused when less than 30% is in view. */
  autoplay?: boolean;
  className?: string;
}

type Line =
  | { k: "title"; a: string }
  | { k: "meta"; a: string; b: string }
  | { k: "rule" }
  | { k: "row"; a: string; b: string; tone?: "up" | "down" }
  | { k: "spark"; pts: number[] }
  | { k: "note"; a: string }
  | { k: "code"; seed: number };

const CHANNELS = ["Search", "Email", "Referral", "Direct"];
const NOTES = [
  "Worth a look: refunds tripled on Tuesday, all from one plan.",
  "Worth a look: trial signups doubled after Thursday's email.",
  "Worth a look: one region drove a third of the new revenue.",
  "Worth a look: support replies got faster for the fourth week running.",
];
const TREND = [3, 4, 5, 4, 6, 6, 7, 6, 8, 9, 8, 10];

/**
 * The numbers on a receipt. Pure arithmetic on the week number: no random
 * values and no clock, so the server and the browser print the same paper.
 */
function buildReport(week: number, brand: string): Line[] {
  const seed = week * 7;
  const wobble = (n: number, s: number) => Math.round(n * (1 + (((seed * s) % 17) - 8) / 100));
  const revenue = wobble(48210, 3);
  const users = (wobble(124, 5) / 10).toFixed(1);
  const churn = (1.4 + (seed % 5) / 10).toFixed(1);
  return [
    { k: "title", a: `${brand.toUpperCase()} WEEKLY` },
    { k: "meta", a: `WEEK ${week}`, b: "MON 06:00" },
    { k: "rule" },
    { k: "row", a: "Revenue", b: `$${revenue.toLocaleString("en-US")}`, tone: "up" },
    { k: "row", a: "Active users", b: `${users}k`, tone: "up" },
    { k: "row", a: "Churn", b: `${churn}%`, tone: "down" },
    { k: "row", a: "Top channel", b: CHANNELS[week % CHANNELS.length] },
    { k: "spark", pts: TREND.map((v, i) => v + ((seed * (i + 2)) % 3) - 1) },
    { k: "rule" },
    { k: "note", a: NOTES[week % NOTES.length] },
    { k: "rule" },
    { k: "code", seed },
  ];
}

/** Plain-text version of a receipt for screen readers. */
function describe(lines: Line[]): string[] {
  const out: string[] = [];
  for (const l of lines) {
    if (l.k === "title") out.push(l.a);
    else if (l.k === "meta") out.push(`${l.a}, ${l.b}`);
    else if (l.k === "row") out.push(`${l.a}: ${l.b}${l.tone ? (l.tone === "up" ? ", up" : ", down") : ""}`);
    else if (l.k === "note") out.push(l.a);
  }
  return out;
}

const PAPER = "#fffdf8";
const INK = "#1d1d1f";

function Tone({ tone }: { tone: "up" | "down" }) {
  return (
    <svg width="8" height="8" viewBox="0 0 8 8" className="shrink-0" fill={tone === "up" ? "#248a3d" : "#d70015"} aria-hidden="true">
      <path d={tone === "up" ? "M4 1l3.2 5.5H.8z" : "M4 7L.8 1.5h6.4z"} />
    </svg>
  );
}

function Spark({ pts }: { pts: number[] }) {
  const w = 180;
  const h = 22;
  const max = Math.max(...pts);
  const min = Math.min(...pts);
  const d = pts
    .map((v, i) => `${i === 0 ? "M" : "L"}${((i / (pts.length - 1)) * w).toFixed(1)},${(h - 2 - ((v - min) / (max - min || 1)) * (h - 4)).toFixed(1)}`)
    .join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width={w} height={h} className="mx-auto block" fill="none" aria-hidden="true">
      <path d={d} stroke={INK} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Row({ l }: { l: Line }) {
  switch (l.k) {
    case "title":
      return <div className="pt-1 text-center font-mono text-[15px] font-bold tracking-[0.18em]">{l.a}</div>;
    case "meta":
      return (
        <div className="flex justify-between font-mono text-[11px] text-[#6e6e73]">
          <span>{l.a}</span>
          <span>{l.b}</span>
        </div>
      );
    case "rule":
      return <div className="border-t border-dashed border-[#1d1d1f]/30" />;
    case "row":
      return (
        <div className="flex items-baseline gap-2 font-mono text-[13px]">
          <span>{l.a}</span>
          <span className="min-w-2 flex-1 -translate-y-1 border-b border-dotted border-[#1d1d1f]/35" />
          <span className="font-semibold tabular-nums">{l.b}</span>
          <span className="flex w-2.5 justify-center self-center">{l.tone && <Tone tone={l.tone} />}</span>
        </div>
      );
    case "spark":
      return <Spark pts={l.pts} />;
    case "note":
      return <p className="m-0 font-mono text-[12px] leading-[1.45]">{l.a}</p>;
    case "code":
      return (
        <div className="flex h-9 items-stretch justify-center gap-[2px] pb-1" aria-hidden="true">
          {Array.from({ length: 38 }, (_, i) => (
            <span key={i} className="bg-[#1d1d1f]" style={{ width: (i * 7 + l.seed) % 3 === 0 ? 3 : 1 }} />
          ))}
        </div>
      );
  }
}

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * Editorial hero whose demo is a receipt. A slot prints this week's numbers one
 * line at a time, the paper holds so you can read it, then tears away and falls
 * before the next week prints. The paper leans toward the pointer, and "Tear off"
 * does it on demand. Every figure is derived from the week number, so the paper
 * is identical on the server and in the browser.
 */
export function ReceiptHero({
  brand = "Ledgerline",
  kicker = "Weekly numbers, printed live",
  headline = "Stop waiting for",
  emphasis = "Monday's",
  headlineEnd = "numbers.",
  description = "Ledgerline reads the tools you already use and keeps one honest page of numbers up to date, all week. The receipt is the same report, printed for the people who still like paper.",
  primaryCta = { label: "Get this week's report", href: "#" },
  secondaryCta = { label: "See a sample", href: "#" },
  stats = [
    { value: "48", label: "integrations" },
    { value: "2 min", label: "to set up" },
    { value: "06:00", label: "every Monday" },
  ],
  startWeek = 42,
  accent = INK,
  accentDark = "#f5f5f7",
  autoplay = true,
  className,
}: ReceiptHeroProps) {
  const reduce = !!useReducedMotion();
  const root = useRef<HTMLElement>(null);
  const inView = useInView(root, { amount: 0.3 });
  const touchedRef = useRef(false);
  const [touched, setTouched] = useState(false);
  const [week, setWeek] = useState(startWeek);
  const lines = useMemo(() => buildReport(week, brand), [week, brand]);
  const n = lines.length;
  // With autoplay the first receipt prints itself on arrival; without it the paper is already printed.
  const [printed, setPrinted] = useState(autoplay ? 0 : n);
  const [tearing, setTearing] = useState(false);
  const shown = reduce ? n : printed;
  const printing = !reduce && !tearing && printed < n;
  const demo = autoplay && !reduce && !touched;

  const mx = useMotionValue(0);
  const lean = useSpring(useTransform(mx, [-1, 1], [-4, 4]), { stiffness: 120, damping: 14 });

  // One timer at a time, chosen from the current state: print the next line, hold, tear, start the next week.
  useEffect(() => {
    if (reduce || !inView) return;
    let id = 0;
    if (tearing) {
      id = window.setTimeout(() => {
        setWeek((w) => w + 1);
        setPrinted(0);
        setTearing(false);
      }, 1000);
    } else if (printed < n) {
      id = window.setTimeout(() => setPrinted((p) => p + 1), printed === 0 ? 700 : 260);
    } else if (demo) {
      id = window.setTimeout(() => setTearing(true), 4200);
    }
    return () => window.clearTimeout(id);
  }, [reduce, inView, tearing, printed, n, demo]);

  const interact = () => {
    if (touchedRef.current) return;
    touchedRef.current = true;
    setTouched(true);
  };

  const tear = () => {
    interact();
    if (reduce) setWeek((w) => w + 1);
    else setTearing(true);
  };

  const words = headline.split(" ").filter(Boolean);
  const vars = { "--rh-a": accent, "--rh-ad": accentDark } as CSSProperties;

  return (
    <section
      ref={root}
      className={cn("@container w-full", className)}
      onPointerDown={interact}
      onKeyDown={interact}
      onPointerMove={(e) => {
        interact();
        const r = e.currentTarget.getBoundingClientRect();
        mx.set(((e.clientX - r.left) / r.width - 0.5) * 2);
      }}
      onPointerLeave={() => mx.set(0)}
    >
      <div
        style={vars}
        className="relative w-full overflow-hidden bg-[#f4f3ef] px-5 py-10 text-[#1d1d1f] dark:bg-[#0c0c0b] dark:text-[#f5f5f7] @2xl:px-10 @2xl:py-14"
      >
        <div className="mx-auto max-w-[1120px]">
          <div className="flex items-center justify-between gap-4 border-b border-[#1d1d1f]/15 pb-3 font-mono text-[11px] uppercase tracking-[0.14em] text-[#6e6e73] dark:border-white/15 dark:text-[#98989d]">
            <span className="font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">{brand}</span>
            <span className="@max-md:hidden">{kicker}</span>
            <span className="tabular-nums">Vol. {week}</span>
          </div>

          <div className="grid grid-cols-1 gap-12 pt-12 @4xl:grid-cols-[1.25fr_1fr] @4xl:gap-10 @4xl:pt-14">
            <div className="flex flex-col justify-between gap-10 @4xl:gap-12">
              <h1 className="m-0 text-[clamp(42px,7.6cqi,104px)] font-semibold leading-[0.94] tracking-[-0.05em] text-balance">
                {words.map((w, i) => (
                  <Fragment key={`${w}-${i}`}>
                    <motion.span
                      className="inline-block"
                      initial={reduce ? false : { opacity: 0, y: 40 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 1, ease: EASE, delay: i * 0.07 }}
                    >
                      {w}
                    </motion.span>{" "}
                  </Fragment>
                ))}
                {emphasis && (
                  <>
                    <motion.span
                      className="inline-block pr-[0.04em] font-serif font-normal italic tracking-[-0.03em]"
                      initial={reduce ? false : { opacity: 0, y: 40, rotate: -4 }}
                      animate={{ opacity: 1, y: 0, rotate: 0 }}
                      transition={{ duration: 1.1, ease: EASE, delay: words.length * 0.07 }}
                    >
                      {emphasis}
                    </motion.span>{" "}
                  </>
                )}
                {headlineEnd && (
                  <motion.span
                    className="inline-block"
                    initial={reduce ? false : { opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, ease: EASE, delay: (words.length + 1) * 0.07 }}
                  >
                    {headlineEnd}
                  </motion.span>
                )}
              </h1>

              <div className="flex flex-col gap-8">
                <motion.p
                  initial={reduce ? false : { opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 1, delay: 0.5 }}
                  className="m-0 max-w-[440px] text-[17px] leading-[1.5] text-[#424245] dark:text-[#c7c7cc] @2xl:text-[18px]"
                >
                  {description}
                </motion.p>
                <motion.div
                  initial={reduce ? false : { opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.6, ease: EASE }}
                  className="flex flex-wrap items-center gap-x-6 gap-y-2"
                >
                  <motion.a
                    href={primaryCta.href}
                    whileTap={reduce ? undefined : { scale: 0.97 }}
                    className="group flex h-12 items-center gap-3 rounded-full bg-(--rh-a) pl-6 pr-2 text-[15px] font-medium text-white no-underline outline-hidden focus-visible:ring-2 focus-visible:ring-[#0071e3] focus-visible:ring-offset-2 focus-visible:ring-offset-[#f4f3ef] dark:bg-(--rh-ad) dark:text-[#1d1d1f] dark:focus-visible:ring-[#2997ff] dark:focus-visible:ring-offset-[#0c0c0b]"
                  >
                    {primaryCta.label}
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15 transition-transform group-hover:translate-x-0.5 dark:bg-black/10">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M5 12h14M13 6l6 6-6 6" />
                      </svg>
                    </span>
                  </motion.a>
                  {secondaryCta && (
                    <a
                      href={secondaryCta.href}
                      className="group relative inline-flex min-h-11 items-center rounded-xs text-[15px] font-medium text-[#1d1d1f] no-underline outline-hidden focus-visible:ring-2 focus-visible:ring-[#0071e3] dark:text-[#f5f5f7] dark:focus-visible:ring-[#2997ff]"
                    >
                      {secondaryCta.label}
                      <span className="absolute bottom-2.5 left-0 h-px w-full origin-left bg-current transition-transform duration-300 group-hover:scale-x-0" />
                    </a>
                  )}
                </motion.div>
                {stats.length > 0 && (
                  <dl className="m-0 grid max-w-[480px] grid-cols-3 gap-3 border-t border-[#1d1d1f]/15 pt-4 dark:border-white/15">
                    {stats.slice(0, 3).map((s) => (
                      <div key={s.label} className="flex flex-col gap-0.5">
                        <dt className="order-2 text-[12px] text-[#6e6e73] dark:text-[#98989d]">{s.label}</dt>
                        <dd className="m-0 text-[20px] font-semibold tracking-[-0.02em]">{s.value}</dd>
                      </div>
                    ))}
                  </dl>
                )}
              </div>
            </div>

            <div className="flex justify-center @4xl:justify-end @4xl:pr-4">
              <div className="w-full max-w-[300px]">
                <div className="relative z-20 h-11 rounded-[14px] bg-[#1d1d1f] shadow-[0_18px_30px_-16px_rgba(0,0,0,.6)] ring-1 ring-black/10 dark:bg-[#2c2c2e] dark:ring-white/10">
                  <div className="absolute left-4 top-1/2 flex -translate-y-1/2 items-center gap-2">
                    <motion.span
                      className="size-1.5 rounded-full bg-[#30d158]"
                      animate={printing && inView ? { opacity: [1, 0.3, 1] } : { opacity: 1 }}
                      transition={printing && inView ? { duration: 0.6, repeat: Infinity } : { duration: 0 }}
                    />
                    <span className="font-mono text-[10px] uppercase leading-none tracking-[0.14em] text-white/70">{printing ? "Printing" : "Ready"}</span>
                  </div>
                  <div className="absolute inset-x-4 bottom-2 h-1 rounded-full bg-black" />
                </div>

                <div className="relative z-10 -mt-3 h-[352px] px-6 [clip-path:inset(0_-56px)]">
                  <AnimatePresence>
                    {!tearing && (
                      <motion.div
                        key={week}
                        className="origin-top"
                        style={{ rotate: reduce ? 0 : lean }}
                        exit={
                          reduce
                            ? { opacity: 0, transition: { duration: 0.01 } }
                            : { y: [0, -6, 620], rotate: [0, -1.5, 16], opacity: [1, 1, 0], transition: { duration: 0.95, times: [0, 0.12, 1], ease: "easeIn" } }
                        }
                      >
                        <motion.div
                          className="relative px-5 pt-9 shadow-[0_24px_40px_-24px_rgba(0,0,0,.4)]"
                          style={{ background: PAPER, color: INK }}
                          initial={reduce ? false : { y: -36 }}
                          animate={{ y: 0 }}
                          transition={{ type: "spring", stiffness: 160, damping: 20 }}
                          aria-hidden="true"
                        >
                          <div className="pointer-events-none absolute inset-x-0 top-0 h-6 bg-linear-to-b from-black/10 to-transparent" />
                          <div className="flex flex-col gap-3 pb-4">
                            {lines.slice(0, shown).map((l, i) => (
                              <motion.div
                                key={i}
                                initial={reduce ? false : { opacity: 0, y: -5, clipPath: "inset(0 100% 0 0)" }}
                                animate={{ opacity: 1, y: 0, clipPath: "inset(0 0% 0 0)" }}
                                transition={{ duration: 0.22, ease: "linear" }}
                              >
                                <Row l={l} />
                              </motion.div>
                            ))}
                          </div>
                          <svg className="absolute -bottom-[7px] left-0 h-2 w-full" viewBox="0 0 252 8" preserveAspectRatio="none" aria-hidden="true">
                            <path d={`M0 0 ${Array.from({ length: 21 }, (_, i) => `L${i * 12 + 6} 8 L${i * 12 + 12} 0`).join(" ")} Z`} fill={PAPER} />
                          </svg>
                        </motion.div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="mt-1 flex justify-end">
                  <button
                    type="button"
                    onClick={tear}
                    disabled={tearing}
                    className="inline-flex min-h-11 items-center gap-2 rounded-full px-4 font-mono text-[12px] uppercase tracking-[0.1em] text-[#424245] outline-hidden hover:bg-black/5 focus-visible:ring-2 focus-visible:ring-[#0071e3] disabled:opacity-50 dark:text-[#c7c7cc] dark:hover:bg-white/10 dark:focus-visible:ring-[#2997ff]"
                  >
                    Tear off
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M12 4v16M6 14l6 6 6-6" />
                    </svg>
                  </button>
                </div>

                <div role="group" aria-label={`${brand} weekly report, week ${week}`} className="sr-only">
                  <ul>
                    {describe(lines).map((t, i) => (
                      <li key={i}>{t}</li>
                    ))}
                  </ul>
                </div>
                <p className="sr-only" aria-live="polite">
                  {touched && !printing && !tearing ? `Week ${week} report printed.` : ""}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
