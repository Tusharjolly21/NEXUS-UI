"use client";
/**
 * Aureon's copy of the Motion Kit Bubble Cluster. Same packing and liquid
 * backdrop, but the bubbles are holdings sized by weight, and the groups are
 * accounts. Switch account and every holding springs to its new size.
 */
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

interface Holding { id: string; name: string; hue: number; sat: number }

const HOLDINGS: Holding[] = [
  { id: "emp", name: "Employer", hue: 28, sat: 90 },
  { id: "sp", name: "S&P 500", hue: 88, sat: 55 },
  { id: "tech", name: "Tech", hue: 70, sat: 50 },
  { id: "tdf", name: "2055 fund", hue: 140, sat: 35 },
  { id: "intl", name: "Intl", hue: 175, sat: 40 },
  { id: "bond", name: "Bonds", hue: 200, sat: 25 },
  { id: "cash", name: "Cash", hue: 60, sat: 12 },
  { id: "reit", name: "REITs", hue: 110, sat: 30 },
  { id: "small", name: "Small cap", hue: 45, sat: 45 },
];

/** Weight of each holding inside each account (0 or missing = not held there). */
const GROUPS: Record<string, Record<string, number>> = {
  "All accounts": { emp: 5, sp: 4, tech: 3, tdf: 3, intl: 2, bond: 2, cash: 2, reit: 1, small: 1 },
  Brokerage: { emp: 5, tech: 3.5, sp: 3, cash: 2, reit: 1 },
  "401(k)": { tdf: 5, sp: 3, bond: 2.5, intl: 2, small: 1.5 },
};

const NOTES: Record<string, string> = {
  "All accounts": "One company is 31% of everything you own.",
  Brokerage: "Your tech fund and S&P fund share 61% of their holdings.",
  "401(k)": "Fees here average 0.48% a year. Cheaper funds are on the menu.",
};

interface Placed { id: string; x: number; y: number; r: number }

function pack(weights: Record<string, number>): Placed[] {
  const items = Object.entries(weights)
    .sort((a, b) => b[1] - a[1])
    .map(([id, w], i) => {
      const a = i * 2.4;
      return { id, r: 14 + w * 7, x: Math.cos(a) * (i * 12), y: Math.sin(a) * (i * 12) };
    });
  for (let step = 0; step < 300; step++) {
    for (const p of items) { p.x *= 0.96; p.y *= 0.96; }
    for (let i = 0; i < items.length; i++) for (let j = i + 1; j < items.length; j++) {
      const a = items[i], b = items[j];
      const dx = b.x - a.x, dy = b.y - a.y, d = Math.hypot(dx, dy) || 0.01, m = a.r + b.r + 4;
      if (d < m) { const o = (m - d) / 2 / d; a.x -= dx * o; a.y -= dy * o; b.x += dx * o; b.y += dy * o; }
    }
  }
  return items;
}

const GROUP_NAMES = Object.keys(GROUPS);

export default function HoldingsCluster({ accent = "#4d7c0f", autoplay = false }: { accent?: string; autoplay?: boolean }) {
  const fid = "hc" + useId().replace(/[^a-zA-Z0-9]/g, "");
  const [group, setGroup] = useState(GROUP_NAMES[0]);
  const touched = useRef(false);
  const layouts = useMemo(() => Object.fromEntries(GROUP_NAMES.map((g) => [g, pack(GROUPS[g])])) as Record<string, Placed[]>, []);
  const placed = layouts[group];

  useEffect(() => {
    if (!autoplay) return;
    let k = 0;
    const t = setInterval(() => {
      if (touched.current) return clearInterval(t);
      setGroup(GROUP_NAMES[++k % GROUP_NAMES.length]);
    }, 3200);
    return () => clearInterval(t);
  }, [autoplay]);

  const spring = { type: "spring", stiffness: 140, damping: 16 } as const;
  const C = { x: 210, y: 140 };

  return (
    <div className="flex flex-col items-center gap-4" onPointerDown={() => (touched.current = true)}>
      <div className="relative h-[280px] w-[420px] max-w-full">
        <svg width="0" height="0" className="absolute" aria-hidden="true">
          <filter id={fid}>
            <feGaussianBlur in="SourceGraphic" stdDeviation="12" result="b" />
            <feColorMatrix in="b" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -8" />
          </filter>
        </svg>
        <div className="absolute inset-0" style={{ filter: `url(#${fid})` }} aria-hidden="true">
          {HOLDINGS.map((p) => {
            const q = placed.find((x) => x.id === p.id);
            return (
              <motion.span
                key={p.id}
                className="absolute rounded-full bg-[#dfe9cf]"
                initial={false}
                animate={q ? { x: C.x + q.x - q.r - 10, y: C.y + q.y - q.r - 10, width: q.r * 2 + 20, height: q.r * 2 + 20, opacity: 1 } : { x: C.x - 10, y: C.y - 10, width: 20, height: 20, opacity: 0 }}
                transition={spring}
              />
            );
          })}
        </div>
        {HOLDINGS.map((p, i) => {
          const q = placed.find((x) => x.id === p.id);
          const light = p.sat < 20;
          return (
            <motion.span
              key={p.id}
              role="img"
              aria-label={q ? `${p.name}, weight ${GROUPS[group][p.id]} of 5` : undefined}
              aria-hidden={!q}
              className="absolute flex items-center justify-center overflow-hidden whitespace-nowrap rounded-full text-center font-semibold leading-none shadow-[0_0_0_3px_#fff]"
              style={{
                background: `linear-gradient(140deg, hsl(${p.hue} ${p.sat}% 52%), hsl(${(p.hue + 18) % 360} ${p.sat}% ${light ? 40 : 30}%))`,
                color: "#fff",
              }}
              initial={false}
              animate={q ? { x: C.x + q.x - q.r, y: C.y + q.y - q.r, width: q.r * 2, height: q.r * 2, opacity: 1, fontSize: Math.max(11, q.r * 0.3) } : { x: C.x - 6, y: C.y - 6, width: 12, height: 12, opacity: 0, fontSize: 1 }}
              transition={{ ...spring, delay: i * 0.015 }}
            >
              {p.name}
            </motion.span>
          );
        })}
      </div>
      <div role="group" aria-label="Account" className="relative grid grid-cols-3 rounded-xl bg-[#e8e8ed] p-[3px]">
        {GROUP_NAMES.map((g) => (
          <button
            key={g}
            type="button"
            aria-pressed={group === g}
            onClick={() => { touched.current = true; setGroup(g); }}
            className="relative z-10 h-8 whitespace-nowrap rounded-[9px] px-3 text-[13px] font-medium text-[#1d1d1f] focus-visible:outline focus-visible:outline-2"
            style={{ outlineColor: accent }}
          >
            {group === g && <motion.span layoutId={`${fid}-seg`} transition={{ type: "spring", stiffness: 420, damping: 32 }} className="absolute inset-0 -z-10 rounded-[9px] bg-white shadow-[0_2px_6px_rgba(0,0,0,.1),0_0_0_.5px_rgba(0,0,0,.04)]" />}
            {g}
          </button>
        ))}
      </div>
      <span className="relative h-5 w-full max-w-[400px] overflow-hidden text-center text-[13px] font-medium text-[#424245]" aria-live="polite">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span key={group} className="block" initial={{ y: 16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -16, opacity: 0 }} transition={{ type: "spring", stiffness: 420, damping: 32 }}>
            {NOTES[group]}
          </motion.span>
        </AnimatePresence>
      </span>
    </div>
  );
}
