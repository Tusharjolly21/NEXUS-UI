# Spend Donut

Add the "Spend Donut" component from Nexus UI to my project.

A monthly budget donut: the slice you point at slides out of the ring and thickens while the centre rolls to its amount. Switch month and every slice re-measures itself in one continuous spring sweep.

Please:

1. Create the files below at sensible paths for this project, keeping each file's name. They import each other with relative paths, so keep them together.
2. Install what it needs: `framer-motion` (use this project's package manager).
3. It is styled with Tailwind CSS classes, so the project needs Tailwind.
4. Use it like this: `import { SpendDonut } from "@/components/spend-donut";`. The props are typed and documented in the code.

Copy the code exactly as it is. Do not restyle, simplify or rename anything, and keep the comments: they explain why the numbers are what they are. The only thing to adapt is import paths, if this project uses a different alias than `@/`.

--- components/spend-donut/index.ts ---

```ts
export { SpendDonut } from "./spend-donut";
export type { SpendDonutProps, SpendCategory } from "./spend-donut";
```

--- components/spend-donut/spend-donut.tsx ---

```tsx
"use client";
import { useEffect, useId, useRef, useState, type KeyboardEvent as RKeyboardEvent, type PointerEvent as RPointerEvent } from "react";
import {
  MotionConfig,
  animate,
  motion,
  motionValue,
  useMotionValue,
  useSpring,
  useTransform,
  type AnimationPlaybackControls,
  type MotionValue,
} from "framer-motion";

export interface SpendDonutProps {
  /** Ring thickness in px (in the 220px viewBox). The pointed-at slice grows by 6. */
  thickness?: number;
  /** Clear space between slices in px; the round caps are accounted for. */
  gap?: number;
  /** Points at each category in turn and changes month every ~8s until someone interacts. */
  autoplay?: boolean;
}

/** A spending category and its slice colour. */
export interface SpendCategory {
  name: string;
  color: string;
}

const CATS: SpendCategory[] = [
  { name: "Housing", color: "#0071e3" },
  { name: "Food", color: "#ff9f0a" },
  { name: "Transport", color: "#30d158" },
  { name: "Fun", color: "#bf5af2" },
  { name: "Savings", color: "#64d2ff" },
];
const MONTHS: Record<string, number[]> = { Aug: [1650, 540, 260, 410, 600], Sep: [1650, 610, 320, 280, 750], Oct: [1650, 480, 210, 520, 900] };
const S = 220;
const R = 82;
const C = S / 2;
const CIRC = 2 * Math.PI * R;
const money = (v: number) => `$${Math.round(v).toLocaleString("en-US")}`;

function Segment({
  start,
  len,
  gapPct,
  color,
  thick,
  active,
  dim,
}: {
  start: MotionValue<number>;
  len: MotionValue<number>;
  gapPct: MotionValue<number>;
  color: string;
  thick: number;
  active: boolean;
  dim: boolean;
}) {
  // Lengths are in percent of the ring. gapPct is the clear space plus one round cap (thick/2 each end),
  // taken off each slice so neighbouring caps never touch.
  const dash = useTransform([len, gapPct] as MotionValue<number>[], ([l, g]: number[]) => {
    const v = (Math.max(0.01, l - g) / 100) * CIRC;
    return `${v} ${CIRC - v}`;
  });
  const offset = useTransform([start, gapPct] as MotionValue<number>[], ([s, g]: number[]) => (-(s + g / 2) / 100) * CIRC);
  const mid = useTransform([start, len] as MotionValue<number>[], ([s, l]: number[]) => ((s + l / 2) / 100) * Math.PI * 2 - Math.PI / 2);
  const push = useSpring(0, { stiffness: 420, damping: 24 });
  useEffect(() => {
    push.set(active ? 9 : 0);
  }, [active, push]);
  const x = useTransform([mid, push] as MotionValue<number>[], ([a, p]: number[]) => Math.cos(a) * p);
  const y = useTransform([mid, push] as MotionValue<number>[], ([a, p]: number[]) => Math.sin(a) * p);
  return (
    <motion.g style={{ x, y }}>
      <motion.circle
        cx={C}
        cy={C}
        r={R}
        fill="none"
        stroke={color}
        strokeLinecap="round"
        style={{ strokeDasharray: dash, strokeDashoffset: offset, rotate: -90 }}
        initial={false}
        animate={{ strokeWidth: active ? thick + 6 : thick, opacity: dim ? 0.3 : 1 }}
        transition={{ type: "spring", stiffness: 400, damping: 26 }}
      />
    </motion.g>
  );
}

/**
 * A monthly budget as a donut. Point at a slice (or its row, or arrow through the rows) and it slides out
 * from the ring and thickens while the centre rolls to that category. Change month and every slice
 * re-measures itself in one continuous sweep instead of jumping.
 */
export function SpendDonut({ thickness = 18, gap = 4, autoplay = false }: SpendDonutProps) {
  const uid = useId().replace(/:/g, "");
  const [month, setMonth] = useState("Oct");
  const [active, setActive] = useState<number | null>(null);
  const touched = useRef(false);
  const ring = useRef<HTMLDivElement>(null);
  const rows = useRef<(HTMLButtonElement | null)[]>([]);
  const vals = MONTHS[month];
  const total = vals.reduce((a, b) => a + b, 0);

  // One pair of motion values per slice, swept from zero on mount.
  const [slices] = useState(() => CATS.map(() => ({ start: motionValue(0), len: motionValue(0) })));
  const gapPct = useMotionValue(((gap + thickness) / CIRC) * 100);
  useEffect(() => {
    gapPct.set(((gap + thickness) / CIRC) * 100);
  }, [gap, thickness, gapPct]);

  useEffect(() => {
    const v = MONTHS[month];
    const sum = v.reduce((a, b) => a + b, 0);
    const runs: AnimationPlaybackControls[] = [];
    let acc = 0;
    v.forEach((n, i) => {
      const l = (n / sum) * 100;
      const spring = { type: "spring" as const, stiffness: 120, damping: 20, delay: i * 0.04 };
      runs.push(animate(slices[i].start, acc, spring), animate(slices[i].len, l, spring));
      acc += l;
    });
    return () => runs.forEach((r) => r.stop());
  }, [month, slices]);

  const shown = active === null ? total : vals[active];
  const num = useSpring(shown, { stiffness: 160, damping: 24 });
  useEffect(() => {
    num.set(shown);
  }, [shown, num]);
  const numText = useTransform(num, money);

  useEffect(() => {
    if (!autoplay) return;
    let k = 0;
    const id = setInterval(() => {
      if (touched.current) {
        clearInterval(id);
        return;
      }
      k++;
      if (k % 7 === 6) {
        setActive(null);
        setMonth((m) => (m === "Oct" ? "Sep" : m === "Sep" ? "Aug" : "Oct"));
      } else setActive(k % 7 === 0 ? null : (k % 7) - 1);
    }, 1100);
    return () => clearInterval(id);
  }, [autoplay]);

  // Works for mouse, pen and touch: pick the slice under the pointer by its angle around the centre,
  // as long as the pointer is on (or near) the ring itself.
  const scrub = (e: RPointerEvent<HTMLDivElement>) => {
    const el = ring.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const k = S / r.width;
    const dx = (e.clientX - r.left) * k - C;
    const dy = (e.clientY - r.top) * k - C;
    const dist = Math.hypot(dx, dy);
    if (Math.abs(dist - R) > thickness / 2 + 12) return;
    touched.current = true;
    const pct = ((((Math.atan2(dy, dx) + Math.PI / 2) / (Math.PI * 2)) % 1) + 1) % 1 * 100;
    let acc = 0;
    for (let i = 0; i < vals.length; i++) {
      acc += (vals[i] / total) * 100;
      if (pct < acc || i === vals.length - 1) {
        setActive(i);
        return;
      }
    }
  };

  const onRowKey = (e: RKeyboardEvent<HTMLUListElement>) => {
    const cur = active ?? -1;
    let next: number | undefined;
    if (e.key === "ArrowDown" || e.key === "ArrowRight") next = (cur + 1) % CATS.length;
    else if (e.key === "ArrowUp" || e.key === "ArrowLeft") next = cur <= 0 ? CATS.length - 1 : cur - 1;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = CATS.length - 1;
    if (next === undefined) return;
    e.preventDefault();
    touched.current = true;
    rows.current[next]?.focus();
  };

  const announce =
    active === null
      ? `${month} total ${money(total)} of $4,000 budget`
      : `${CATS[active].name} ${money(vals[active])}, ${Math.round((vals[active] / total) * 100)}% of spend`;

  return (
    <MotionConfig reducedMotion="user">
      <div
        className="@container w-[380px] max-w-full rounded-[24px] bg-white p-5 shadow-[0_0_0_1px_rgba(0,0,0,.05),0_20px_40px_-26px_rgba(0,0,0,.35)] transition-colors duration-300 dark:bg-[#1c1c1e] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08),0_20px_40px_-26px_rgba(0,0,0,.8)]"
        onPointerDown={() => {
          touched.current = true;
        }}
      >
        <div className="flex items-center justify-between gap-2">
          <span className="text-[14px] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">Spending</span>
          <div role="tablist" aria-label="Month" className="flex rounded-full bg-[#f0f0f3] p-[3px] dark:bg-[#2c2c2e]">
            {Object.keys(MONTHS).map((m) => (
              <button
                key={m}
                role="tab"
                type="button"
                aria-selected={month === m}
                onClick={() => {
                  touched.current = true;
                  setActive(null);
                  setMonth(m);
                }}
                className={`relative h-7 rounded-full px-3 text-[12px] font-medium outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] dark:focus-visible:ring-[#0a84ff] ${
                  month === m ? "text-[#1d1d1f] dark:text-[#f5f5f7]" : "text-[#6e6e73] dark:text-[#98989d]"
                }`}
              >
                {month === m && (
                  <motion.span
                    layoutId={`sd-seg-${uid}`}
                    className="absolute inset-0 rounded-full bg-white shadow-[0_1px_3px_rgba(0,0,0,.15)] dark:bg-[#48484a]"
                    transition={{ type: "spring", stiffness: 500, damping: 36 }}
                  />
                )}
                <span className="relative">{m}</span>
              </button>
            ))}
          </div>
        </div>

        <div
          ref={ring}
          className="relative mx-auto mt-2 w-[220px] max-w-full touch-none"
          onPointerMove={scrub}
          onPointerDown={scrub}
          onPointerLeave={() => setActive(null)}
        >
          <svg
            viewBox={`0 0 ${S} ${S}`}
            className="block h-auto w-full overflow-visible"
            role="img"
            aria-label={`${month} spending ${money(total)}: ${CATS.map((c, i) => `${c.name} ${money(vals[i])}`).join(", ")}`}
          >
            <circle cx={C} cy={C} r={R} fill="none" strokeWidth={thickness} className="stroke-[#f0f0f3] dark:stroke-[#2c2c2e]" />
            {CATS.map((c, i) => (
              <Segment
                key={c.name}
                start={slices[i].start}
                len={slices[i].len}
                gapPct={gapPct}
                color={c.color}
                thick={thickness}
                active={active === i}
                dim={active !== null && active !== i}
              />
            ))}
          </svg>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center" aria-hidden="true">
            <motion.span
              key={active ?? "all"}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className={`text-[12px] font-medium ${active === null ? "text-[#6e6e73] dark:text-[#98989d]" : ""}`}
              style={active === null ? undefined : { color: CATS[active].color }}
            >
              {active === null ? `${month} total` : CATS[active].name}
            </motion.span>
            <motion.span className="text-[30px] font-semibold tracking-[-0.035em] text-[#1d1d1f] tabular-nums dark:text-[#f5f5f7]">{numText}</motion.span>
            <span className="text-[11px] text-[#6e6e73] tabular-nums dark:text-[#98989d]">
              {active === null ? "of $4,000 budget" : `${Math.round((vals[active] / total) * 100)}% of spend`}
            </span>
          </div>
        </div>
        <p className="sr-only" aria-live="polite">
          {announce}
        </p>

        <ul className="m-0 mt-3 flex list-none flex-col gap-1 p-0" onKeyDown={onRowKey} aria-label={`${month} categories`}>
          {CATS.map((c, i) => (
            <li key={c.name}>
              <button
                ref={(el) => {
                  rows.current[i] = el;
                }}
                type="button"
                onPointerEnter={() => {
                  touched.current = true;
                  setActive(i);
                }}
                onFocus={() => setActive(i)}
                onBlur={() => setActive(null)}
                className="relative flex w-full items-center gap-2.5 rounded-[10px] px-2.5 py-1.5 text-left text-[13px] text-[#1d1d1f] outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] dark:text-[#f5f5f7] dark:focus-visible:ring-[#0a84ff]"
              >
                {active === i && (
                  <motion.span
                    layoutId={`sd-row-${uid}`}
                    className="absolute inset-0 rounded-[10px] bg-[#f5f5f7] dark:bg-[#2c2c2e]"
                    transition={{ type: "spring", stiffness: 500, damping: 38 }}
                  />
                )}
                <span className="relative h-2.5 w-2.5 flex-none rounded-full" style={{ background: c.color }} />
                <span className="relative min-w-0 flex-1 truncate">{c.name}</span>
                <span className="relative h-1.5 w-12 flex-none overflow-hidden rounded-full bg-[#f0f0f3] @[300px]:w-20 dark:bg-[#3a3a3c]">
                  <motion.span
                    className="absolute inset-y-0 left-0 rounded-full"
                    style={{ background: c.color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${(vals[i] / Math.max(...vals)) * 100}%` }}
                    transition={{ type: "spring", stiffness: 160, damping: 22 }}
                  />
                </span>
                <span className="relative w-14 flex-none text-right text-[#6e6e73] tabular-nums dark:text-[#98989d]">{money(vals[i])}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </MotionConfig>
  );
}
```
