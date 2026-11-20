"use client";

import { motion, useMotionTemplate, useMotionValue, useReducedMotion, type MotionValue } from "framer-motion";
import { useEffect, useRef, type PointerEvent as ReactPointerEvent, type ReactNode } from "react";

export type BentoItem = {
  id?: string;
  title: string;
  description: string;
  /** A small picture, chart or control shown in the tile. Any React node. */
  visual?: ReactNode;
  /** How many columns and rows the tile covers. Default 1 x 1. */
  cols?: 1 | 2 | 3;
  rows?: 1 | 2;
  /** Makes the whole tile a link. */
  href?: string;
};

export type BentoGridProps = {
  items?: BentoItem[];
  tone?: "light" | "dark";
  /** A ghost light drifts across the tiles by itself until the visitor touches the grid. Never runs under reduced motion. */
  autoplay?: boolean;
  className?: string;
};

const SPAN_COLS = { 1: "md:col-span-1", 2: "md:col-span-2", 3: "md:col-span-3" } as const;
const SPAN_ROWS = { 1: "md:row-span-1", 2: "md:row-span-2" } as const;

const TONES = {
  light: {
    tile: "bg-white text-[#1d1d1f] shadow-[0_0_0_1px_rgba(0,0,0,.05),0_20px_40px_-26px_rgba(0,0,0,.35)]",
    body: "text-[#6e6e73]",
    glow: "rgba(0,113,227,0.14)",
    ring: "focus-visible:ring-[#0071e3]",
  },
  dark: {
    tile: "bg-[#1c1c1e] text-[#f5f5f7] shadow-[0_0_0_1px_rgba(255,255,255,.08),0_20px_40px_-26px_rgba(0,0,0,.8)]",
    body: "text-[#a1a1a6]",
    glow: "rgba(10,132,255,0.22)",
    ring: "focus-visible:ring-[#0a84ff]",
  },
} as const;

function MiniBars({ tone }: { tone: "light" | "dark" }) {
  const bars = [38, 62, 46, 78, 55, 92, 70];
  return (
    <div className="flex h-full items-end gap-1.5" aria-hidden="true">
      {bars.map((h, i) => (
        <motion.span
          key={i}
          className={`w-full rounded-t-md ${tone === "dark" ? "bg-[#0a84ff]" : "bg-[#0071e3]"}`}
          style={{ height: `${h}%`, opacity: 0.35 + (i / bars.length) * 0.65, originY: 1 }}
          initial={{ scaleY: 0 }}
          whileInView={{ scaleY: 1 }}
          viewport={{ once: true }}
          transition={{ type: "spring", stiffness: 220, damping: 22, delay: 0.1 + i * 0.05 }}
        />
      ))}
    </div>
  );
}

function MiniToggle({ tone }: { tone: "light" | "dark" }) {
  return (
    <div className="flex flex-col gap-2.5" aria-hidden="true">
      {["Notifications", "Sync", "Dark mode"].map((label, i) => (
        <div key={label} className="flex items-center justify-between text-xs">
          <span className={tone === "dark" ? "text-[#d2d2d7]" : "text-[#424245]"}>{label}</span>
          <span className={`relative h-5 w-9 rounded-full ${i === 1 ? "bg-[#30d158]" : tone === "dark" ? "bg-[#3a3a3c]" : "bg-[#e5e5ea]"}`}>
            <span className={`absolute top-0.5 size-4 rounded-full bg-white shadow ${i === 1 ? "left-[18px]" : "left-0.5"}`} />
          </span>
        </div>
      ))}
    </div>
  );
}

function MiniRing({ tone }: { tone: "light" | "dark" }) {
  return (
    <svg viewBox="0 0 80 80" className="size-24" aria-hidden="true">
      <circle cx="40" cy="40" r="30" fill="none" stroke={tone === "dark" ? "#3a3a3c" : "#e5e5ea"} strokeWidth="8" />
      <motion.circle
        cx="40"
        cy="40"
        r="30"
        fill="none"
        stroke="#30d158"
        strokeWidth="8"
        strokeLinecap="round"
        transform="rotate(-90 40 40)"
        initial={{ pathLength: 0 }}
        whileInView={{ pathLength: 0.72 }}
        viewport={{ once: true }}
        transition={{ type: "spring", stiffness: 60, damping: 18, delay: 0.2 }}
      />
      <text x="40" y="45" textAnchor="middle" fontSize="15" fontWeight="600" fill={tone === "dark" ? "#f5f5f7" : "#1d1d1f"}>
        72%
      </text>
    </svg>
  );
}

function demoItems(tone: "light" | "dark"): BentoItem[] {
  return [
    { title: "Weekly activity", description: "Bars rise on a spring the first time they scroll into view.", visual: <MiniBars tone={tone} />, cols: 2, rows: 2 },
    { title: "Goal progress", description: "Rings draw themselves in.", visual: <MiniRing tone={tone} /> },
    { title: "Settings", description: "Small controls make a tile feel real.", visual: <MiniToggle tone={tone} /> },
    { title: "Anything in a tile", description: "Pass any React node as the visual: a chart, a form, an image, a video.", cols: 2 },
    { title: "Keyboard friendly", description: "Tiles with an href are real links you can tab to." },
  ];
}

function Tile({ item, glow, mx, my, tone, ring, index, reduced }: {
  item: BentoItem;
  glow: string;
  mx: MotionValue<number>;
  my: MotionValue<number>;
  tone: "light" | "dark";
  ring: string;
  index: number;
  reduced: boolean | null;
}) {
  const t = TONES[tone];
  const el = useRef<HTMLDivElement>(null);
  const x = useMotionValue(-999);
  const y = useMotionValue(-999);
  const spot = useMotionTemplate`radial-gradient(260px circle at ${x}px ${y}px, ${glow}, transparent 70%)`;

  // The grid shares one pointer; each tile turns it into its own coordinates.
  useEffect(() => {
    const update = () => {
      const node = el.current;
      if (!node) return;
      const r = node.getBoundingClientRect();
      x.set(mx.get() - r.left);
      y.set(my.get() - r.top);
    };
    const offX = mx.on("change", update);
    const offY = my.on("change", update);
    return () => {
      offX();
      offY();
    };
  }, [mx, my, x, y]);

  const inner = (
    <>
      <motion.span aria-hidden="true" className="pointer-events-none absolute inset-0 rounded-[inherit]" style={{ background: spot }} />
      <div className="relative flex h-full flex-col gap-4">
        {item.visual && <div className="min-h-24 flex-1">{item.visual}</div>}
        <div>
          <h3 className="m-0 text-[15px] font-medium leading-snug tracking-[-0.01em]">{item.title}</h3>
          <p className={`mt-1 text-sm leading-relaxed ${t.body}`}>{item.description}</p>
        </div>
      </div>
    </>
  );

  const cls = `group relative block overflow-hidden rounded-[24px] p-5 outline-none transition-shadow duration-300 focus-visible:ring-2 ${ring} ${t.tile} ${SPAN_COLS[item.cols ?? 1]} ${SPAN_ROWS[item.rows ?? 1]}`;

  return (
    <motion.div
      ref={el}
      className={cls}
      initial={reduced ? false : { opacity: 0, y: 18, scale: 0.97 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-8% 0px" }}
      transition={{ type: "spring", stiffness: 260, damping: 26, delay: index * 0.07 }}
      whileHover={reduced ? undefined : { y: -3 }}
    >
      {item.href ? (
        <a href={item.href} className={`absolute inset-0 z-10 rounded-[inherit] outline-none focus-visible:ring-2 ${ring}`} aria-label={item.title} />
      ) : null}
      {inner}
    </motion.div>
  );
}

/**
 * A grid of tiles of different sizes where one soft light follows the pointer across all of them, so the grid
 * reads as a single surface. Tiles rise in one after another the first time they scroll into view, and lift
 * a little on hover. Each tile takes any React node as its visual.
 */
export default function BentoGrid({ items, tone = "light", autoplay = false, className = "" }: BentoGridProps) {
  const reduced = useReducedMotion();
  const t = TONES[tone];
  const list = items ?? demoItems(tone);
  const wrap = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(-999);
  const my = useMotionValue(-999);
  const touched = useRef(false);

  useEffect(() => {
    if (!autoplay || reduced) return;
    let raf = 0;
    const start = performance.now();
    const step = (now: number) => {
      raf = requestAnimationFrame(step);
      if (touched.current || !wrap.current) return;
      const r = wrap.current.getBoundingClientRect();
      const s = (now - start) / 1000;
      mx.set(r.left + r.width * (0.5 + 0.38 * Math.sin(s * 0.7)));
      my.set(r.top + r.height * (0.5 + 0.34 * Math.sin(s * 1.05 + 1)));
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [autoplay, reduced, mx, my]);

  const move = (e: ReactPointerEvent) => {
    touched.current = true;
    mx.set(e.clientX);
    my.set(e.clientY);
  };

  return (
    <div
      ref={wrap}
      className={`grid w-full grid-cols-1 gap-3 sm:grid-cols-2 md:auto-rows-[minmax(150px,auto)] md:grid-cols-3 ${className}`}
      onPointerMove={move}
      onPointerLeave={() => {
        touched.current = true;
        mx.set(-999);
        my.set(-999);
      }}
    >
      {list.map((item, i) => (
        <Tile key={item.id ?? item.title} item={item} glow={t.glow} mx={mx} my={my} tone={tone} ring={t.ring} index={i} reduced={reduced} />
      ))}
    </div>
  );
}
