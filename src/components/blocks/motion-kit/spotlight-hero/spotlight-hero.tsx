"use client";

import { useEffect, useId, useRef, useState, type CSSProperties, type MouseEvent as ReactMouseEvent } from "react";
import {
  AnimatePresence,
  animate,
  motion,
  useInView,
  useMotionTemplate,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import { cn } from "@/lib/utils";

export interface SpotlightHeroProps {
  accent?: string;
  /** Accent used in dark mode. Defaults to Apple dark blue when `accent` is left at its default. */
  accentDark?: string;
  /** Fixed first line of the headline. */
  lead?: string;
  /** Endings that rotate on the second line. */
  words?: string[];
  sub?: string;
  /** Rotates the last word of the headline. */
  autoplay?: boolean;
  /** Called with the label of the button that was pressed. Buttons never navigate. */
  onAction?: (label: "announcement" | "primary" | "secondary") => void;
  className?: string;
}

const DEFAULT_ACCENT = "#0071e3";
const ease = [0.16, 1, 0.3, 1] as const;
const fmt = (n: number, decimals: number) =>
  n.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
const focusRing =
  "outline-none focus-visible:ring-2 focus-visible:ring-[var(--mk-accent)] focus-visible:ring-offset-2 dark:focus-visible:ring-[var(--mk-accent-dark)] dark:focus-visible:ring-offset-black";

function Count({ to, prefix = "", suffix = "", decimals = 0 }: { to: number; prefix?: string; suffix?: string; decimals?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const seen = useInView(ref, { once: true });
  const v = useMotionValue(0);
  const [t, setT] = useState(() => fmt(0, decimals));
  useMotionValueEvent(v, "change", (n) => setT(fmt(n, decimals)));
  useEffect(() => {
    if (!seen) return;
    const controls = animate(v, to, { duration: 1.8, ease, delay: 0.6 });
    return () => controls.stop();
  }, [seen, to, v]);
  return (
    <span ref={ref} className="tabular-nums">
      {prefix}
      {t}
      {suffix}
    </span>
  );
}

/** A small dashboard drawn in plain elements, used as the product shot. */
function Dashboard() {
  const fillId = `mk-hs-fill-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const line = "M0 120 C 40 110, 60 70, 100 78 S 160 40, 200 52 S 260 96, 300 64 S 360 20, 420 30 S 480 46, 520 14";
  const tile = "rounded-xl bg-white shadow-[0_0_0_1px_rgba(0,0,0,.05)] dark:bg-[#2c2c2e] dark:shadow-[0_0_0_1px_#3a3a3c]";
  return (
    <div className="flex h-full w-full bg-[#fbfbfd] text-left dark:bg-[#1c1c1e]">
      <aside className="hidden w-[180px] flex-none flex-col gap-1 border-r border-black/[.05] p-4 dark:border-[#3a3a3c] @xl:flex">
        {["Overview", "Customers", "Revenue", "Reports", "Settings"].map((s, i) => (
          <span
            key={s}
            className={cn(
              "rounded-lg px-3 py-2 text-[12px] font-medium",
              i === 0
                ? "bg-[color-mix(in_srgb,var(--mk-accent)_8%,transparent)] text-[var(--mk-accent)] dark:bg-[color-mix(in_srgb,var(--mk-accent-dark)_18%,transparent)] dark:text-[var(--mk-accent-dark)]"
                : "text-[#6e6e73] dark:text-[#a1a1a6]",
            )}
          >
            {s}
          </span>
        ))}
      </aside>
      <div className="flex min-w-0 flex-1 flex-col gap-3 p-3 @md:gap-4 @md:p-5">
        <div className="grid grid-cols-3 gap-2 @md:gap-3">
          {[
            { l: "Revenue", v: <Count to={48210} prefix="$" /> },
            { l: "Active users", v: <Count to={12.4} suffix="k" decimals={1} /> },
            { l: "Churn", v: <Count to={1.8} suffix="%" decimals={1} /> },
          ].map((k) => (
            <div key={k.l} className={cn(tile, "min-w-0 p-2.5 @md:p-3")}>
              <div className="truncate text-[11px] text-[#86868b] dark:text-[#a1a1a6]">{k.l}</div>
              <div className="text-[clamp(15px,4.2cqi,22px)] font-semibold tracking-[-0.02em] text-[#1d1d1f] dark:text-[#f5f5f7]">{k.v}</div>
            </div>
          ))}
        </div>
        <div className={cn(tile, "relative flex-1 p-3")}>
          <div className="mb-2 flex items-center justify-between gap-2 text-[11px] text-[#86868b] dark:text-[#a1a1a6]">
            <span className="truncate">Revenue, last 30 days</span>
            <span className="flex-none text-[#248a3d] dark:text-[#30d158]">+18.2%</span>
          </div>
          <svg viewBox="0 0 520 140" className="h-[calc(100%-24px)] w-full text-[var(--mk-accent)] dark:text-[var(--mk-accent-dark)]" preserveAspectRatio="none" aria-hidden="true">
            <defs>
              <linearGradient id={fillId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="currentColor" stopOpacity=".22" />
                <stop offset="1" stopColor="currentColor" stopOpacity="0" />
              </linearGradient>
            </defs>
            <motion.path d={`${line} L520 140 L0 140Z`} fill={`url(#${fillId})`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.6, duration: 0.8 }} />
            <motion.path
              d={line}
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.8, ease, delay: 0.6 }}
            />
          </svg>
        </div>
      </div>
    </div>
  );
}

/**
 * Centred hero. A dot grid lights up under the pointer (or where you tap), the
 * announcement pill has a passing shine, the last word of the headline rotates,
 * and the product window tips upright as it scrolls into view.
 */
export function SpotlightHero({
  accent = DEFAULT_ACCENT,
  accentDark,
  lead = "The dashboard",
  words = ["for teams.", "for founders.", "for finance.", "for you."],
  sub = "Lumen pulls every number your company runs on into one live view. No spreadsheets, no exports, no waiting for Monday.",
  autoplay = true,
  onAction,
  className,
}: SpotlightHeroProps) {
  const reduce = useReducedMotion();
  const [i, setI] = useState(0);
  const count = Math.max(1, words.length);
  useEffect(() => {
    if (!autoplay || words.length < 2) return;
    const t = window.setInterval(() => setI((n) => (n + 1) % count), 2400);
    return () => window.clearInterval(t);
  }, [autoplay, count, words.length]);
  const word = words[i % count] ?? "";

  const mx = useMotionValue(-999);
  const my = useMotionValue(-999);
  const mask = useMotionTemplate`radial-gradient(260px circle at ${mx}px ${my}px, #000, transparent 70%)`;
  const frame = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: frame, offset: ["start end", "center center"] });
  const rxRaw = useSpring(useTransform(scrollYProgress, [0, 1], [24, 0]), { stiffness: 120, damping: 22 });
  const scRaw = useSpring(useTransform(scrollYProgress, [0, 1], [0.9, 1]), { stiffness: 120, damping: 22 });

  const dark = accentDark ?? (accent === DEFAULT_ACCENT ? "#0a84ff" : accent);
  const vars = { "--mk-accent": accent, "--mk-accent-dark": dark } as CSSProperties;
  const press = (label: "announcement" | "primary" | "secondary") => (e: ReactMouseEvent) => {
    e.preventDefault();
    onAction?.(label);
  };
  const setSpot = (e: { clientX: number; clientY: number; currentTarget: HTMLElement }) => {
    const r = e.currentTarget.getBoundingClientRect();
    mx.set(e.clientX - r.left);
    my.set(e.clientY - r.top);
  };

  return (
    <section
      style={vars}
      className={cn("@container relative w-full overflow-hidden bg-white px-5 pb-16 pt-16 dark:bg-black @2xl:pb-20 @2xl:pt-20", className)}
      onPointerMove={setSpot}
      onPointerDown={setSpot}
      onPointerLeave={(e) => {
        if (e.pointerType !== "mouse") return;
        mx.set(-999);
        my.set(-999);
      }}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-50 [--mk-dot:#d2d2d7] dark:[--mk-dot:#3a3a3c]"
        aria-hidden="true"
        style={{
          backgroundImage: "radial-gradient(var(--mk-dot) 1px, transparent 1px)",
          backgroundSize: "22px 22px",
          maskImage: "linear-gradient(#000, transparent 75%)",
          WebkitMaskImage: "linear-gradient(#000, transparent 75%)",
        }}
      />
      <motion.div
        className="pointer-events-none absolute inset-0 [--mk-dot-on:var(--mk-accent)] dark:[--mk-dot-on:var(--mk-accent-dark)]"
        aria-hidden="true"
        style={{ backgroundImage: "radial-gradient(var(--mk-dot-on) 1.4px, transparent 1.4px)", backgroundSize: "22px 22px", maskImage: mask, WebkitMaskImage: mask }}
      />
      <div
        className="pointer-events-none absolute left-1/2 top-0 h-[420px] w-[820px] max-w-[200%] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,color-mix(in_srgb,var(--mk-accent)_13%,transparent),transparent)] blur-3xl dark:bg-[radial-gradient(closest-side,color-mix(in_srgb,var(--mk-accent-dark)_22%,transparent),transparent)]"
        aria-hidden="true"
      />

      <div className="relative mx-auto flex max-w-[980px] flex-col items-center gap-6 text-center @2xl:gap-7">
        <motion.a
          href="#"
          onClick={press("announcement")}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease }}
          className={cn(
            "relative inline-flex min-h-10 max-w-full items-center gap-2 overflow-hidden rounded-full bg-white px-1.5 pr-4 text-[13px] font-medium text-[#1d1d1f] shadow-[0_0_0_1px_rgba(0,0,0,.08)] dark:bg-[#1c1c1e] dark:text-[#f5f5f7] dark:shadow-[0_0_0_1px_#3a3a3c]",
            focusRing,
          )}
        >
          <span className="flex-none rounded-full bg-[var(--mk-accent)] px-2.5 py-1 text-[11px] font-semibold text-white dark:bg-[var(--mk-accent-dark)]">New</span>
          <span className="truncate">Live dashboards are here</span>
          <span aria-hidden="true" className="text-[var(--mk-accent)] dark:text-[var(--mk-accent-dark)]">→</span>
          {!reduce && (
            <motion.span
              aria-hidden="true"
              className="absolute inset-y-0 w-14 -skew-x-12 bg-gradient-to-r from-transparent via-white to-transparent dark:via-white/15"
              initial={{ x: -100 }}
              animate={{ x: 380 }}
              transition={{ duration: 2.2, repeat: Infinity, repeatDelay: 2.6, ease: "easeInOut" }}
            />
          )}
        </motion.a>

        <h1 className="m-0 text-[clamp(38px,8.6cqi,96px)] font-semibold leading-[1] tracking-[-0.055em] text-[#1d1d1f] dark:text-[#f5f5f7]">
          <span className="block">
            {lead.split(" ").map((w, k) => (
              <motion.span
                key={k}
                className="mr-[0.22em] inline-block last:mr-0"
                initial={{ opacity: 0, y: 40, filter: "blur(12px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ duration: 1, ease, delay: 0.1 + k * 0.08 }}
              >
                {w}
              </motion.span>
            ))}
          </span>
          <span className="sr-only">{words.join(" / ")}</span>
          <span className="relative inline-flex h-[1.08em] max-w-full justify-center overflow-hidden align-bottom" aria-hidden="true">
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span
                key={word}
                className="inline-block whitespace-nowrap pb-[0.06em] text-[var(--mk-accent)] dark:text-[var(--mk-accent-dark)]"
                initial={reduce ? { opacity: 0 } : { y: "100%", opacity: 0, filter: "blur(8px)" }}
                animate={reduce ? { opacity: 1 } : { y: "0%", opacity: 1, filter: "blur(0px)" }}
                exit={reduce ? { opacity: 0 } : { y: "-100%", opacity: 0, filter: "blur(8px)" }}
                transition={reduce ? { duration: 0.3 } : { filter: { duration: 0.35 }, type: "spring", stiffness: 160, damping: 22 }}
              >
                {word}
              </motion.span>
            </AnimatePresence>
          </span>
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease, delay: 0.35 }}
          className="m-0 max-w-[600px] text-[clamp(16px,2.2cqi,21px)] leading-[1.45] tracking-[-0.015em] text-[#6e6e73] dark:text-[#a1a1a6]"
        >
          {sub}
        </motion.p>

        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease, delay: 0.5 }} className="flex flex-wrap justify-center gap-3">
          <motion.a
            href="#"
            onClick={press("primary")}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.96 }}
            className={cn(
              "flex h-12 items-center rounded-full bg-[var(--mk-accent)] px-6 text-[15px] font-medium text-white shadow-[0_12px_30px_-12px_var(--mk-accent)] dark:bg-[var(--mk-accent-dark)] dark:shadow-[0_12px_30px_-12px_var(--mk-accent-dark)]",
              focusRing,
            )}
          >
            Start free trial
          </motion.a>
          <motion.a
            href="#"
            onClick={press("secondary")}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.96 }}
            className={cn(
              "flex h-12 items-center gap-2 rounded-full bg-white px-6 text-[15px] font-medium text-[#1d1d1f] shadow-[0_0_0_1px_rgba(0,0,0,.1)] dark:bg-[#1c1c1e] dark:text-[#f5f5f7] dark:shadow-[0_0_0_1px_#3a3a3c]",
              focusRing,
            )}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true">
              <path fill="currentColor" d="M8 5l11 7-11 7z" />
            </svg>
            Watch the tour
          </motion.a>
        </motion.div>
      </div>

      <div className="relative mx-auto mt-12 max-w-[1040px] @2xl:mt-16" style={{ perspective: 1400 }}>
        <motion.div
          ref={frame}
          style={reduce ? undefined : { rotateX: rxRaw, scale: scRaw, transformOrigin: "50% 0%" }}
          className="@container overflow-hidden rounded-[18px] bg-white shadow-[0_0_0_1px_rgba(0,0,0,.07),0_50px_100px_-40px_rgba(0,0,0,.4)] dark:bg-[#1c1c1e] dark:shadow-[0_0_0_1px_#3a3a3c,0_50px_100px_-40px_rgba(0,0,0,.9)] @2xl:rounded-[22px]"
          aria-hidden="true"
        >
          <div className="flex items-center gap-2 border-b border-black/[.06] px-4 py-3 dark:border-[#3a3a3c]">
            {["#ff5f57", "#febc2e", "#28c840"].map((c) => (
              <span key={c} className="h-3 w-3 flex-none rounded-full" style={{ background: c }} />
            ))}
            <span className="mx-auto truncate rounded-md bg-black/[.04] px-6 py-1 text-[11px] text-[#86868b] dark:bg-white/[.06] dark:text-[#a1a1a6] @md:px-12">app.lumen.io</span>
          </div>
          <div className="h-[280px] @lg:h-[340px] @3xl:h-[420px]">
            <Dashboard />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
