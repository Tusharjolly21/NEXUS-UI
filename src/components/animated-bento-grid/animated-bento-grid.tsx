"use client";
import { useEffect, useRef, useState, type ReactNode, type PointerEvent as RPointerEvent } from "react";
import { motion, useInView, useMotionTemplate, useMotionValue, useReducedMotion, useSpring } from "framer-motion";

export type BentoVariant = "default" | "glass" | "gradient-border" | "spotlight";

export interface BentoItem {
  /** Stable key. */
  id: string;
  /** Small caption above the number. */
  label: string;
  /** The figure. Digits roll like an odometer; anything else ("$", "%", "ms", ",") stays put. */
  value: string;
  /** Optional icon shown top left in a tinted square. */
  icon?: ReactNode;
  /** Tile accent (glow, icon tint, border light). Defaults to the system blue. */
  accent?: string;
  /** Columns x rows the tile covers. */
  span?: "1x1" | "2x1" | "1x2" | "2x2";
  /** Change chip. Positive reads green with an up arrow, negative red with a down arrow. */
  trend?: { value: number; label: string };
}

export interface AnimatedBentoGridProps {
  /** Tiles, in reading order. */
  items?: BentoItem[];
  /** Surface treatment for every tile. */
  variant?: BentoVariant;
  /** Columns at full width (the grid drops to 2 on narrow containers). */
  columns?: 2 | 3 | 4;
  /** Roll the numbers in when the grid scrolls into view. */
  animated?: boolean;
  /** Extra delay before the first tile, in seconds. */
  staggerDelay?: number;
  /** Spins each tile's digits in turn until someone touches the grid. */
  autoplay?: boolean;
  /** Extra classes for the grid. */
  className?: string;
  /** Extra classes for every tile wrapper. */
  itemClassName?: string;
}

export interface BentoGridPreset {
  id: string;
  label: string;
  icon: ReactNode;
  value: string;
  accent?: string;
  span?: "1x1" | "2x1" | "1x2" | "2x2";
  trend?: { value: number; label: string };
}

const glyph = (d: string) => (
  <svg viewBox="0 0 16 16" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d={d} />
  </svg>
);

export const DEFAULT_BENTO_ITEMS: BentoItem[] = [
  { id: "mrr", label: "Monthly revenue", value: "$84,210", span: "2x1", accent: "#0071e3", trend: { value: 12.4, label: "vs last month" }, icon: glyph("M2 12l4-4 3 3 5-6M10 5h4v4") },
  { id: "latency", label: "Latency", value: "42ms", accent: "#30d158", icon: glyph("M8 2.5v5.5l3 2M14 8A6 6 0 112 8a6 6 0 0112 0z") },
  { id: "users", label: "Active users", value: "32,184", accent: "#bf5af2", trend: { value: 8.1, label: "this week" }, icon: glyph("M6 7a2.5 2.5 0 100-5 2.5 2.5 0 000 5zM1.5 14c0-2.5 2-4 4.5-4s4.5 1.5 4.5 4M11 2.5a2.5 2.5 0 010 4.5M12.5 10c1.3.5 2 1.8 2 4") },
  { id: "uptime", label: "Uptime", value: "99.99%", accent: "#ff9f0a", icon: glyph("M8 1.5l5.5 2v4c0 3.5-2.4 6-5.5 7-3.1-1-5.5-3.5-5.5-7v-4zM5.5 8l2 2 3-3.5") },
  { id: "regions", label: "Edge regions", value: "18", accent: "#ff3b30", trend: { value: 20, label: "new this quarter" }, icon: glyph("M8 1.5a6.5 6.5 0 100 13 6.5 6.5 0 000-13zM1.5 8h13M8 1.5c2 2 2.6 4 2.6 6.5S10 12.5 8 14.5C6 12.5 5.4 10.5 5.4 8S6 3.5 8 1.5z") },
];

const SPAN: Record<NonNullable<BentoItem["span"]>, string> = {
  "1x1": "col-span-1 row-span-1",
  "2x1": "col-span-2 row-span-1",
  "1x2": "col-span-1 row-span-2",
  "2x2": "col-span-2 row-span-2",
};

const COLS: Record<2 | 3 | 4, string> = {
  2: "grid-cols-2",
  3: "grid-cols-2 @min-[520px]:grid-cols-3",
  4: "grid-cols-2 @min-[520px]:grid-cols-3 @min-[720px]:grid-cols-4",
};

const DIGITS = Array.from({ length: 20 }, (_, i) => i % 10);

/** One odometer wheel. `pos` counts tenths of a turn; +10 is a full extra spin. */
function Wheel({ digit, spun, shown, delay, still }: { digit: number; spun: boolean; shown: boolean; delay: number; still: boolean }) {
  const pos = shown ? digit + (spun ? 10 : 0) : 0;
  return (
    <span className="relative inline-block h-[1em] overflow-hidden" style={{ width: "0.62em" }}>
      <motion.span
        className="absolute inset-x-0 top-0 flex flex-col items-center"
        initial={false}
        animate={{ y: `${-pos}em` }}
        transition={still ? { duration: 0 } : { type: "spring", stiffness: 150, damping: 15, mass: 0.9, delay }}
      >
        {DIGITS.map((d, i) => (
          <span key={i} className="block h-[1em] leading-none">
            {d}
          </span>
        ))}
      </motion.span>
    </span>
  );
}

function Odometer({ value, spun, shown, delay, still }: { value: string; spun: boolean; shown: boolean; delay: number; still: boolean }) {
  let n = 0;
  return (
    <span aria-hidden="true" className="inline-flex items-start leading-none">
      {value.split("").map((ch, i) => {
        if (ch >= "0" && ch <= "9") {
          const k = n++;
          return <Wheel key={i} digit={Number(ch)} spun={spun} shown={shown} delay={delay + k * 0.055} still={still} />;
        }
        return (
          <span key={i} className="inline-block h-[1em] leading-none">
            {ch === " " ? " " : ch}
          </span>
        );
      })}
    </span>
  );
}

function Arrow({ up }: { up: boolean }) {
  return (
    <svg viewBox="0 0 10 10" className="size-2.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={up ? "M5 8.5v-7M2 4.5l3-3 3 3" : "M5 1.5v7M2 5.5l3 3 3-3"} />
    </svg>
  );
}

const SURFACE: Record<BentoVariant, string> = {
  default:
    "bg-white shadow-[0_0_0_1px_rgba(0,0,0,.05),0_20px_40px_-26px_rgba(0,0,0,.35)] dark:bg-[#1c1c1e] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08),0_20px_40px_-26px_rgba(0,0,0,.9)]",
  glass:
    "bg-white/60 backdrop-blur-xl shadow-[inset_0_1px_0_rgba(255,255,255,.9),0_0_0_1px_rgba(0,0,0,.05),0_20px_40px_-26px_rgba(0,0,0,.35)] dark:bg-[#1c1c1e]/60 dark:shadow-[inset_0_1px_0_rgba(255,255,255,.08),0_0_0_1px_rgba(255,255,255,.08),0_20px_40px_-26px_rgba(0,0,0,.9)]",
  "gradient-border": "bg-white dark:bg-[#1c1c1e] shadow-[0_20px_40px_-26px_rgba(0,0,0,.35)] dark:shadow-[0_20px_40px_-26px_rgba(0,0,0,.9)]",
  spotlight:
    "bg-white shadow-[0_0_0_1px_rgba(0,0,0,.05),0_20px_40px_-26px_rgba(0,0,0,.35)] dark:bg-[#1c1c1e] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08),0_20px_40px_-26px_rgba(0,0,0,.9)]",
};

function Tile({
  item,
  variant,
  digitDelay,
  shown,
  spun,
  lit,
  still,
  delay,
  onEnter,
  onLeave,
  className,
}: {
  item: BentoItem;
  variant: BentoVariant;
  digitDelay: number;
  shown: boolean;
  spun: boolean;
  lit: boolean;
  still: boolean;
  delay: number;
  onEnter: () => void;
  onLeave: () => void;
  className: string;
}) {
  const accent = item.accent ?? "#0071e3";
  const big = item.span === "2x2" || item.span === "1x2";
  const mx = useMotionValue(50);
  const my = useMotionValue(30);
  const sx = useSpring(mx, { stiffness: 260, damping: 28 });
  const sy = useSpring(my, { stiffness: 260, damping: 28 });
  const light = useMotionTemplate`radial-gradient(220px circle at ${sx}% ${sy}%, ${accent}2e, transparent 70%)`;
  const ring = useMotionTemplate`radial-gradient(160px circle at ${sx}% ${sy}%, ${accent}, transparent 75%)`;

  useEffect(() => {
    if (!lit) return;
    // When lit by autoplay or focus, park the light top-right.
    mx.set(78);
    my.set(18);
  }, [lit, mx, my]);

  const move = (e: RPointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    mx.set(((e.clientX - r.left) / r.width) * 100);
    my.set(((e.clientY - r.top) / r.height) * 100);
  };

  const up = (item.trend?.value ?? 0) >= 0;
  const spoken = `${item.label}: ${item.value}${item.trend ? `, ${up ? "up" : "down"} ${Math.abs(item.trend.value)}% ${item.trend.label}` : ""}`;

  return (
    <motion.div
      className={`${SPAN[item.span ?? "1x1"]} ${className}`}
      initial={still ? false : { opacity: 0, y: 18, scale: 0.96 }}
      animate={shown ? { opacity: 1, y: 0, scale: 1 } : undefined}
      transition={{ type: "spring", stiffness: 260, damping: 22, delay }}
    >
      <motion.div
        tabIndex={0}
        role="group"
        aria-label={spoken}
        onPointerEnter={onEnter}
        onPointerLeave={onLeave}
        onPointerMove={move}
        onFocus={onEnter}
        onBlur={onLeave}
        animate={{ y: lit && !still ? -4 : 0 }}
        transition={{ type: "spring", stiffness: 380, damping: 22 }}
        className={`relative flex h-full flex-col justify-between overflow-hidden rounded-[22px] p-4 outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0071e3] dark:focus-visible:outline-[#0a84ff] ${big ? "min-h-[276px]" : "min-h-[132px]"} ${SURFACE[variant]}`}
      >
        {variant === "gradient-border" ? (
          <>
            <span aria-hidden="true" className="pointer-events-none absolute inset-0 rounded-[22px] shadow-[inset_0_0_0_1px_rgba(0,0,0,.08)] dark:shadow-[inset_0_0_0_1px_rgba(255,255,255,.1)]" />
            <motion.span
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 rounded-[22px] p-[1.5px]"
              style={{
                background: ring,
                WebkitMask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
                WebkitMaskComposite: "xor",
                maskComposite: "exclude",
              }}
              animate={{ opacity: lit ? 1 : 0 }}
              transition={{ duration: 0.25 }}
            />
          </>
        ) : null}
        {variant === "spotlight" || variant === "glass" ? (
          <motion.span aria-hidden="true" className="pointer-events-none absolute inset-0" style={{ background: light }} animate={{ opacity: lit ? 1 : variant === "glass" ? 0.5 : 0 }} transition={{ duration: 0.3 }} />
        ) : (
          <span aria-hidden="true" className="pointer-events-none absolute -right-10 -top-12 size-36 rounded-full opacity-[.10] blur-2xl" style={{ background: accent }} />
        )}

        <div className="relative flex items-start justify-between gap-2">
          {item.icon ? (
            <span className="grid size-8 place-items-center rounded-[10px]" style={{ background: `${accent}1f`, color: accent }}>
              {item.icon}
            </span>
          ) : (
            <span />
          )}
          {item.trend ? (
            <span
              className={`inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[11px] font-semibold tabular-nums ${
                up ? "bg-[#30d158]/12 text-[#1a7f37] dark:text-[#30d158]" : "bg-[#ff3b30]/10 text-[#c9271d] dark:text-[#ff6961]"
              }`}
            >
              <Arrow up={up} />
              {Math.abs(item.trend.value)}%
            </span>
          ) : null}
        </div>
        <div className="relative mt-4">
          <p className="text-[12px] font-medium text-[#6e6e73] dark:text-[#a1a1a6]">{item.label}</p>
          <p
            className={`mt-1.5 font-semibold tabular-nums tracking-[-0.04em] text-[#1d1d1f] dark:text-[#f5f5f7] ${big ? "text-[52px]" : item.span === "2x1" ? "text-[36px]" : "text-[30px]"}`}
          >
            <Odometer value={item.value} spun={spun} shown={shown} delay={digitDelay} still={still} />
          </p>
          {item.trend && (item.span === "2x1" || big) ? <p className="mt-1 text-[12px] text-[#6e6e73] dark:text-[#a1a1a6]">{item.trend.label}</p> : null}
        </div>
      </motion.div>
    </motion.div>
  );
}

/**
 * A grid of stat tiles whose numbers roll in like odometers when the grid
 * scrolls into view. Hover or focus a tile and it lifts while its digits
 * spin a full turn and land with a little overshoot. Four surfaces: plain,
 * frosted glass, a border that lights where the pointer is, or a spotlight.
 */
export function AnimatedBentoGrid({
  items = DEFAULT_BENTO_ITEMS,
  variant = "default",
  columns = 3,
  animated = true,
  staggerDelay = 0,
  autoplay = false,
  className = "",
  itemClassName = "",
}: AnimatedBentoGridProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const reduce = useReducedMotion() === true;
  const still = reduce || !animated;
  const shown = still || inView;
  const [active, setActive] = useState<string | null>(null);
  const [spins, setSpins] = useState<Record<string, boolean>>({});
  const touched = useRef(false);
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    if (!inView) return;
    const t = window.setTimeout(() => setEntered(true), 1400);
    return () => window.clearTimeout(t);
  }, [inView]);

  const spin = (id: string) => setSpins((s) => ({ ...s, [id]: !s[id] }));

  const ids = items.map((i) => i.id).join("\u0000");
  useEffect(() => {
    if (!autoplay || still || !inView) return;
    const order = ids.split("\u0000");
    let k = 0;
    const t = window.setInterval(() => {
      if (touched.current) {
        window.clearInterval(t);
        setActive(null);
        return;
      }
      const id = order[k++ % order.length];
      setActive(id);
      setSpins((s) => ({ ...s, [id]: !s[id] }));
    }, 1900);
    return () => window.clearInterval(t);
  }, [autoplay, still, inView, ids]);

  return (
    <div
      onPointerDown={() => {
        touched.current = true;
      }}
      className={`@container relative w-full text-[#1d1d1f] dark:text-[#f5f5f7] ${className}`}
    >
      {variant === "glass" ? (
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden rounded-[28px]">
          <div className="absolute -left-10 top-0 size-56 rounded-full bg-[#0071e3]/25 blur-3xl dark:bg-[#0a84ff]/40" />
          <div className="absolute bottom-0 right-0 size-56 rounded-full bg-[#bf5af2]/25 blur-3xl dark:bg-[#bf5af2]/40" />
          <div className="absolute left-1/3 top-1/3 size-40 rounded-full bg-[#ff9f0a]/20 blur-3xl" />
        </div>
      ) : null}
      <div ref={ref} className={`relative grid grid-flow-dense auto-rows-fr gap-3 ${COLS[columns]}`}>
        {items.map((item, i) => (
          <Tile
            key={item.id}
            item={item}
            variant={variant}
            digitDelay={entered ? 0 : staggerDelay + i * 0.07 + 0.1}
            shown={shown}
            spun={!!spins[item.id]}
            lit={active === item.id}
            still={still}
            delay={staggerDelay + i * 0.07}
            className={itemClassName}
            onEnter={() => {
              touched.current = true;
              setActive(item.id);
              if (!still) spin(item.id);
            }}
            onLeave={() => setActive((a) => (a === item.id ? null : a))}
          />
        ))}
      </div>
    </div>
  );
}
