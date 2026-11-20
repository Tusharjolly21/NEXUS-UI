# Spend Donut

Add the "Spend Donut" component from Nexus UI to my project.

A monthly budget donut: the slice you point at slides out of the ring and thickens while the centre rolls to its amount. Switch month and every slice re-measures itself in one continuous spring sweep. Also includes Spend Ring, a month of spending as a ring: point at a category and its arc swells, click it and the arc unwinds into a straight budget bar.

Please:

1. Create the files below at sensible paths for this project, keeping each file's name. They import each other with relative paths, so keep them together.
2. Install what it needs: `framer-motion` (use this project's package manager).
3. It is styled with Tailwind CSS classes, so the project needs Tailwind.
4. Use it like this: `import { SpendDonut } from "@/components/spend-donut/spend-donut";`. The props are typed and documented in the code.

Copy the code exactly as it is. Do not restyle, simplify or rename anything, and keep the comments: they explain why the numbers are what they are. The only thing to adapt is import paths, if this project uses a different alias than `@/`.

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

# Spend Ring

Add the "Spend Ring" component from Nexus UI to my project.

Please:

1. Create the files below at sensible paths for this project, keeping each file's name. They import each other with relative paths, so keep them together.
2. Install what it needs: `framer-motion` (use this project's package manager).
3. It is styled with Tailwind CSS classes, so the project needs Tailwind.
4. It uses `@/lib/ui-sounds` for its interaction sounds, which are synthesised in the browser, so no audio files are needed. Create it at lib/ from the file below.
5. Use it like this: `import { SpendRing } from "@/components/spend-donut/spend-ring";`. The props are typed and documented in the code.

Copy the code exactly as it is. Do not restyle, simplify or rename anything, and keep the comments: they explain why the numbers are what they are. The only thing to adapt is import paths, if this project uses a different alias than `@/`.

--- components/spend-donut/spend-ring.tsx ---

```tsx
"use client";

/* eslint-disable react-hooks/refs, react-hooks/immutability -- these rules assume code runs while rendering; here refs, timers and setState are used in handlers, effects and animation frames, and the animation state lives in refs on purpose */

import { AnimatePresence, animate, motion, useMotionValue, useReducedMotion } from "framer-motion";
import { type CSSProperties, useEffect, useMemo, useRef, useState } from "react";
import { useAutoplaySoundAllowed, useSoundsEnabled } from "@/lib/ui-sounds";

export type SpendTxn = { name: string; date: string; amount: number };
export type SpendCategory = {
  id: string;
  label: string;
  color: string;
  icon?: keyof typeof I;
  budget: number;
  months: number[];
  txns: SpendTxn[];
};
export type SpendRingProps = {
  title?: string;
  /** month names, oldest first; each category's `months` lines up with these */
  monthNames?: string[];
  categories?: SpendCategory[];
  currency?: string;
  onSelect?: (category: SpendCategory | null) => void;
  /** Soft synthesised sounds as you use it. They also follow the site-wide sound switch. */
  enableSound?: boolean;
  /** 0 to 1 */
  volume?: number;
  autoplay?: boolean;
  className?: string;
};

// ───────────── sound: small synthesised notes, no audio files. The browser keeps it silent until the visitor has
// clicked or pressed a key somewhere on the page, so autoplay only makes sound once someone is using the page. ─────────────

type Engine = { ctx: AudioContext; noise: AudioBuffer };
const ENGINE_KEY = "__uiSoundEngine";
const engine = () => (globalThis as unknown as Record<string, Engine | undefined>)[ENGINE_KEY] ?? null;
function unlockAudio() {
  const g = globalThis as unknown as Record<string, Engine | undefined>;
  const e = g[ENGINE_KEY];
  if (e) {
    if (e.ctx.state === "suspended") void e.ctx.resume();
    return;
  }
  const AC =
    window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return;
  const ctx = new AC();
  const noise = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
  const d = noise.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  g[ENGINE_KEY] = { ctx, noise };
}

type NoteOpts = {
  at?: number;
  dur?: number;
  gain?: number;
  type?: OscillatorType;
  glide?: number;
  bell?: number;
};
type Sound = {
  /** a soft glassy note: a sine with a faint bell partial above it */
  note: (freq: number, o?: NoteOpts) => void;
  /** air moving: filtered noise swept from one pitch to another */
  whoosh: (from: number, to: number, o?: { at?: number; dur?: number; gain?: number }) => void;
  /** a tiny dry click */
  tick: (o?: { at?: number; freq?: number; gain?: number }) => void;
};

function useSound(enabled: boolean, volume: number, allow: () => boolean = () => true): Sound {
  useEffect(() => {
    if (!enabled) return;
    window.addEventListener("pointerdown", unlockAudio, true);
    window.addEventListener("keydown", unlockAudio, true);
    return () => {
      window.removeEventListener("pointerdown", unlockAudio, true);
      window.removeEventListener("keydown", unlockAudio, true);
    };
  }, [enabled]);
  const on = useRef(enabled);
  const vol = useRef(Math.max(0, Math.min(1, volume)));
  const allowRef = useRef(allow);
  useEffect(() => {
    on.current = enabled;
    vol.current = Math.max(0, Math.min(1, volume));
    allowRef.current = allow;
  });
  return useMemo(() => {
    const live = () => {
      const e = engine();
      return e && on.current && allowRef.current() && vol.current > 0 && e.ctx.state === "running" ? e : null;
    };
    const env = (ctx: AudioContext, t: number, peak: number, attack: number, dur: number) => {
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(Math.max(0.0002, peak), t + attack);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      return g;
    };
    return {
      note(freq, o = {}) {
        const e = live();
        if (!e) return;
        const { ctx } = e;
        const t = ctx.currentTime + 0.01 + (o.at ?? 0);
        const dur = o.dur ?? 0.3;
        const peak = (o.gain ?? 0.14) * vol.current;
        const lp = ctx.createBiquadFilter();
        lp.type = "lowpass";
        lp.frequency.value = 7000;
        lp.connect(ctx.destination);
        const g = env(ctx, t, peak, 0.006, dur);
        g.connect(lp);
        const a = ctx.createOscillator();
        a.type = o.type ?? "sine";
        a.frequency.setValueAtTime(freq, t);
        if (o.glide) a.frequency.exponentialRampToValueAtTime(o.glide, t + dur * 0.6);
        a.connect(g);
        a.start(t);
        a.stop(t + dur + 0.05);
        const bell = o.bell ?? 0.25;
        if (bell > 0) {
          const g2 = env(ctx, t, peak * bell, 0.003, dur * 0.4);
          g2.connect(lp);
          const b = ctx.createOscillator();
          b.frequency.setValueAtTime(freq * 2.76, t);
          if (o.glide) b.frequency.exponentialRampToValueAtTime(o.glide * 2.76, t + dur * 0.6);
          b.connect(g2);
          b.start(t);
          b.stop(t + dur * 0.4 + 0.05);
        }
      },
      whoosh(from, to, o = {}) {
        const e = live();
        if (!e) return;
        const { ctx, noise } = e;
        const t = ctx.currentTime + 0.01 + (o.at ?? 0);
        const dur = Math.min(0.95, o.dur ?? 0.4);
        const src = ctx.createBufferSource();
        src.buffer = noise;
        const bp = ctx.createBiquadFilter();
        bp.type = "bandpass";
        bp.Q.value = 1.1;
        bp.frequency.setValueAtTime(from, t);
        bp.frequency.exponentialRampToValueAtTime(to, t + dur);
        const g = ctx.createGain();
        const peak = (o.gain ?? 0.08) * vol.current;
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(Math.max(0.0002, peak), t + dur * 0.35);
        g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
        src.connect(bp).connect(g).connect(ctx.destination);
        src.start(t, Math.random() * 0.3);
        src.stop(t + dur + 0.05);
      },
      tick(o = {}) {
        const e = live();
        if (!e) return;
        const { ctx, noise } = e;
        const t = ctx.currentTime + 0.005 + (o.at ?? 0);
        const src = ctx.createBufferSource();
        src.buffer = noise;
        const bp = ctx.createBiquadFilter();
        bp.type = "bandpass";
        bp.frequency.value = o.freq ?? 3200;
        bp.Q.value = 4;
        const g = env(ctx, t, (o.gain ?? 0.09) * vol.current, 0.001, 0.03);
        src.connect(bp).connect(g).connect(ctx.destination);
        src.start(t, Math.random() * 0.5);
        src.stop(t + 0.05);
      },
    } satisfies Sound;
  }, []);
}

const I = {
  cart: "m239.71 74.14l-25.64 92.28A24.06 24.06 0 0 1 191 184H92.16A24.06 24.06 0 0 1 69 166.42L33.92 40H16a8 8 0 0 1 0-16h24a8 8 0 0 1 7.71 5.86L57.19 64H232a8 8 0 0 1 7.71 10.14M88 200a16 16 0 1 0 16 16a16 16 0 0 0-16-16m104 0a16 16 0 1 0 16 16a16 16 0 0 0-16-16",
  dining:
    "M216 40v184a8 8 0 0 1-16 0v-48h-48a8 8 0 0 1-8-8a268.8 268.8 0 0 1 7.22-56.88c9.78-40.49 28.32-67.63 53.63-78.47A8 8 0 0 1 216 40m-96.11-1.31a8 8 0 1 0-15.78 2.63L111.89 88H88V40a8 8 0 0 0-16 0v48H48.11l7.78-46.68a8 8 0 1 0-15.78-2.63l-8 48A8 8 0 0 0 32 88a48.07 48.07 0 0 0 40 47.32V224a8 8 0 0 0 16 0v-88.68A48.07 48.07 0 0 0 128 88a8 8 0 0 0-.11-1.31Z",
  transport:
    "M184 24H72a32 32 0 0 0-32 32v128a32 32 0 0 0 32 32h8l-14.4 19.2a8 8 0 1 0 12.8 9.6L100 216h56l21.6 28.8a8 8 0 1 0 12.8-9.6L176 216h8a32 32 0 0 0 32-32V56a32 32 0 0 0-32-32M84 184a12 12 0 1 1 12-12a12 12 0 0 1-12 12m36-64H56V80h64Zm52 64a12 12 0 1 1 12-12a12 12 0 0 1-12 12m28-64h-64V80h64Z",
  shopping:
    "M216 64h-40a48 48 0 0 0-96 0H40a16 16 0 0 0-16 16v120a16 16 0 0 0 16 16h176a16 16 0 0 0 16-16V80a16 16 0 0 0-16-16m-88-32a32 32 0 0 1 32 32H96a32 32 0 0 1 32-32",
  bills:
    "m213.85 125.46l-112 120a8 8 0 0 1-13.69-7l14.66-73.33l-57.63-21.64a8 8 0 0 1-3-13l112-120a8 8 0 0 1 13.69 7l-14.7 73.41l57.63 21.61a8 8 0 0 1 3 12.95Z",
  travel:
    "M215.52 197.26a8 8 0 0 1-1.86 8.39l-24 24A8 8 0 0 1 184 232a7 7 0 0 1-.79 0a8 8 0 0 1-5.87-3.52l-44.07-66.12L112 183.59V208a8 8 0 0 1-2.34 5.65s-14 14.06-15.88 15.88a7.9 7.9 0 0 1-2.78 1.88a8 8 0 0 1-10.41-4.35l-.06-.15l-14.7-36.76L29 175.42a8 8 0 0 1-2.69-13.08l16-16A8 8 0 0 1 48 144h24.4l21.27-21.27l-66.11-44.08a8 8 0 0 1-1.22-12.32l24-24a8 8 0 0 1 8.39-1.86l85.94 31.25l31.53-31.53a28 28 0 0 1 39.6 39.6l-31.53 31.53Z",
  left: "M168.49 199.51a12 12 0 0 1-17 17l-80-80a12 12 0 0 1 0-17l80-80a12 12 0 0 1 17 17L97 128Z",
  right: "m184.49 136.49l-80 80a12 12 0 0 1-17-17L159 128L87.51 56.49a12 12 0 1 1 17-17l80 80a12 12 0 0 1-.02 17",
  back: "M228 128a12 12 0 0 1-12 12H69l51.52 51.51a12 12 0 0 1-17 17l-72-72a12 12 0 0 1 0-17l72-72a12 12 0 0 1 17 17L69 116h147a12 12 0 0 1 12 12",
};
const Ico = ({ d, size, style }: { d: string; size: number; style?: CSSProperties }) => (
  <svg
    viewBox="0 0 256 256"
    width={size}
    height={size}
    style={{ display: "block", flex: "none", ...style }}
    aria-hidden="true"
  >
    <path fill="currentColor" d={d} />
  </svg>
);

const MONTHS = ["September", "October", "November"];
const DEFAULT_CATEGORIES: SpendCategory[] = [
  {
    id: "bills",
    label: "Bills",
    color: "#5e5ce6",
    icon: "bills",
    budget: 900,
    months: [790, 812, 820],
    txns: [
      { name: "Rent share", date: "Nov 1", amount: 640 },
      { name: "Electricity", date: "Nov 4", amount: 96 },
      { name: "Fibre broadband", date: "Nov 6", amount: 48 },
      { name: "Phone plan", date: "Nov 9", amount: 36 },
    ],
  },
  {
    id: "groceries",
    label: "Groceries",
    color: "#30d158",
    icon: "cart",
    budget: 700,
    months: [540, 588, 612],
    txns: [
      { name: "Corner Market", date: "Nov 14", amount: 86.4 },
      { name: "Saturday farmers market", date: "Nov 9", amount: 42 },
      { name: "Fresh & Co", date: "Nov 7", amount: 128.6 },
      { name: "Weekly shop", date: "Nov 2", amount: 355 },
    ],
  },
  {
    id: "dining",
    label: "Dining",
    color: "#ff9f0a",
    icon: "dining",
    budget: 400,
    months: [380, 296, 423],
    txns: [
      { name: "Noodle bar with Kofi", date: "Nov 15", amount: 64 },
      { name: "Brunch at Ottie's", date: "Nov 10", amount: 38.5 },
      { name: "Coffee, the whole month", date: "Nov 1", amount: 92.5 },
      { name: "Lena's birthday dinner", date: "Nov 8", amount: 228 },
    ],
  },
  {
    id: "shopping",
    label: "Shopping",
    color: "#ff375f",
    icon: "shopping",
    budget: 300,
    months: [210, 410, 355],
    txns: [
      { name: "Running shoes", date: "Nov 12", amount: 149 },
      { name: "Linen shirt", date: "Nov 5", amount: 78 },
      { name: "Desk lamp", date: "Nov 3", amount: 128 },
    ],
  },
  {
    id: "travel",
    label: "Travel",
    color: "#0a84ff",
    icon: "travel",
    budget: 500,
    months: [0, 640, 260],
    txns: [
      { name: "Train to the coast", date: "Nov 13", amount: 112 },
      { name: "Cabin, one night", date: "Nov 13", amount: 148 },
    ],
  },
  {
    id: "transport",
    label: "Transport",
    color: "#64d2ff",
    icon: "transport",
    budget: 250,
    months: [196, 230, 218],
    txns: [
      { name: "Monthly pass", date: "Nov 1", amount: 165 },
      { name: "Late taxi home", date: "Nov 8", amount: 31 },
      { name: "Bike repair", date: "Nov 11", amount: 22 },
    ],
  },
];

const SIZE = 300;
const C = SIZE / 2;
const R = 112;
const BASE = 20;
const FAT = 34;
const GAP = 0.05; // radians of clear space between the rounded ends of two arcs
const SAMPLES = 48;
// where the arc unwinds to: a budget bar across the top
const BAR_Y = 40;
const BAR_X0 = 26;
const BAR_W = SIZE - 52;

const money = (n: number, cur: string) =>
  `${cur}${n.toLocaleString("en-US", { minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2 })}`;

/** each digit is a reel that rolls to its new value; columns are keyed from the right so they keep their identity */
function Roll({ text, reduce, style }: { text: string; reduce: boolean; style?: CSSProperties }) {
  const chars = [...text];
  return (
    <span
      aria-label={text}
      style={{
        display: "inline-flex",
        fontVariantNumeric: "tabular-nums",
        ...style,
      }}
    >
      {chars.map((ch, i) => {
        const key = chars.length - i;
        if (!/\d/.test(ch))
          return (
            <span key={`s${key}${ch}`} aria-hidden="true">
              {ch}
            </span>
          );
        return (
          <span
            key={`d${key}`}
            aria-hidden="true"
            style={{
              position: "relative",
              display: "inline-block",
              height: "1.15em",
              overflow: "hidden",
              lineHeight: 1.15,
            }}
          >
            <motion.span
              initial={false}
              animate={{ y: `${-Number(ch) * 10}%` }}
              transition={
                reduce
                  ? { duration: 0 }
                  : {
                      type: "spring",
                      stiffness: 210,
                      damping: 22,
                      mass: 0.6 + (key % 3) * 0.12,
                    }
              }
              style={{ display: "flex", flexDirection: "column" }}
            >
              {"0123456789".split("").map((d) => (
                <span key={d} style={{ height: "1.15em" }}>
                  {d}
                </span>
              ))}
            </motion.span>
          </span>
        );
      })}
    </span>
  );
}

type Spring = { x: number; v: number };
const step = (s: Spring, target: number, k: number, d: number, dt: number) => {
  s.v += ((target - s.x) * k - s.v * d) * dt;
  s.x += s.v * dt;
};

/**
 * A month of spending as a ring. Each category is an arc in its own colour, sized by what you spent. Point at one and
 * it swells: the arc thickens and grows round the ring on a spring, pushing its neighbours aside, while the total in
 * the middle rolls to that category's figure. Click it and the arc peels off the ring and unwinds into a straight bar
 * across the top, your spend against that category's budget, and its transactions drop in underneath; Back winds it
 * round again. Change month and every arc springs to its new share while the digits roll. Arrow keys move between
 * categories, Enter opens one, Escape closes it.
 */
export default function SpendRing({
  title = "Spending",
  monthNames = MONTHS,
  categories = DEFAULT_CATEGORIES,
  currency = "$",
  onSelect,
  enableSound = true,
  volume = 0.6,
  autoplay = false,
  className = "",
}: SpendRingProps) {
  const reduce = useReducedMotion() ?? false;
  const [siteSound] = useSoundsEnabled();
  // a demo playing by itself only makes sound where the page allows it (see AutoplaySound)
  const autoplaySoundOk = useAutoplaySoundAllowed();
  const autoplayOk = useRef(autoplaySoundOk);
  useEffect(() => {
    autoplayOk.current = autoplaySoundOk;
  }, [autoplaySoundOk]);
  const sfx = useSound(enableSound && siteSound, volume, () => touched.current || autoplayOk.current);
  const [month, setMonth] = useState(monthNames.length - 1);
  const [hover, setHover] = useState<number | null>(null);
  const [open, setOpen] = useState<number | null>(null);
  const touched = useRef(false);
  const card = useRef<HTMLDivElement>(null);
  const svg = useRef<SVGSVGElement>(null);
  const live = useRef({ month, hover, open, reduce });
  live.current = { month, hover, open, reduce };
  const total = categories.reduce((a, c) => a + (c.months[month] ?? 0), 0);
  const shown = open ?? hover;
  const cat = shown !== null ? categories[shown] : null;
  const prev = month > 0 ? categories.reduce((a, c) => a + (c.months[month - 1] ?? 0), 0) : null;
  const centerValue = cat ? (cat.months[month] ?? 0) : total;

  // per arc: share of the ring, how swollen it is, and the unwinding of the open one
  const st = useRef(
    categories.map((c) => ({
      amt: { x: c.months[month] ?? 0, v: 0 },
      k: { x: 0, v: 0 },
      fade: { x: 1, v: 0 },
    })),
  );
  const unwind = useRef({ x: 0, v: 0 });
  const spin = useRef({ x: 0, v: 0 });
  const paths = useRef<(SVGPathElement | null)[]>([]);
  const hits = useRef<(SVGPathElement | null)[]>([]);
  const icons = useRef<(SVGGElement | null)[]>([]);
  const track = useRef<SVGPathElement | null>(null);
  const geo = useRef<{ a0: number; a1: number }[]>([]);

  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    const arcPts = (a0: number, a1: number, r: number) => {
      const pts: number[][] = [];
      for (let j = 0; j <= SAMPLES; j++) {
        const a = a0 + ((a1 - a0) * j) / SAMPLES;
        pts.push([C + Math.cos(a) * r, C + Math.sin(a) * r]);
      }
      return pts;
    };
    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      const dt = Math.min(1 / 30, (now - last) / 1000);
      last = now;
      const L = live.current;
      const S = st.current;
      const snap = L.reduce;
      S.forEach((s, i) => {
        const want = categories[i].months[L.month] ?? 0;
        const hot = (L.open ?? L.hover) === i ? 1 : 0;
        if (snap) {
          s.amt.x = want;
          s.k.x = hot;
          s.fade.x = L.open === null || L.open === i ? 1 : 0;
          return;
        }
        step(s.amt, want, 90, 15, dt);
        step(s.k, hot, 260, 18, dt);
        step(s.fade, L.open === null || L.open === i ? 1 : 0, 160, 22, dt);
      });
      if (snap) unwind.current.x = L.open !== null ? 1 : 0;
      else step(unwind.current, L.open !== null ? 1 : 0, 120, 19, dt);
      step(spin.current, 0, 60, 12, dt);
      // shares: a swollen arc takes a bigger slice
      const w = S.map((s) => Math.max(0, s.amt.x) * (1 + 0.32 * Math.max(0, s.k.x)) + 0.0001);
      const sum = w.reduce((a, b) => a + b, 0);
      // the gap after each arc leaves room for both rounded ends, so swollen arcs push their neighbours away
      const widthOf = (s: (typeof S)[number]) => BASE + (FAT - BASE) * Math.max(0, s.k.x);
      const gaps = S.map((s, i) => {
        if (s.amt.x <= 1) return 0;
        let j = (i + 1) % S.length;
        while (S[j].amt.x <= 1 && j !== i) j = (j + 1) % S.length;
        return (widthOf(s) + widthOf(S[j])) / 2 / R + GAP;
      });
      const room = Math.PI * 2 - gaps.reduce((x, y) => x + y, 0);
      let a = -Math.PI / 2 + spin.current.x - gaps[gaps.length - 1] / 2;
      const u = unwind.current.x;
      geo.current = [];
      S.forEach((s, i) => {
        const span = (w[i] / sum) * room;
        const a0 = a;
        const a1 = a + span;
        a = a1 + gaps[i];
        geo.current[i] = { a0, a1 };
        const p = paths.current[i];
        const h = hits.current[i];
        const ic = icons.current[i];
        if (!p) return;
        const k = Math.max(0, s.k.x);
        const width = BASE + (FAT - BASE) * k;
        const tooThin = span < 0.02;
        let d: string;
        if (L.open === i && u > 0.001) {
          // peel off from the start: each point lets go a little after the one before it
          const share = Math.min(1, (categories[i].months[L.month] ?? 0) / Math.max(1, categories[i].budget));
          const pts = arcPts(a0, a1, R).map(([x, y], j) => {
            const f = j / SAMPLES;
            const t = Math.max(0, Math.min(1, u * 1.7 - f * 0.7));
            const e = t * t * (3 - 2 * t);
            return [x + (BAR_X0 + BAR_W * share * f - x) * e, y + (BAR_Y - y) * e];
          });
          d = "M" + pts.map((q) => q.map((v) => v.toFixed(2)).join(" ")).join(" L");
          p.setAttribute("stroke-width", String(width + (12 - width) * u));
        } else {
          const r0 = R;
          const large = a1 - a0 > Math.PI ? 1 : 0;
          d = tooThin
            ? ""
            : `M${(C + Math.cos(a0) * r0).toFixed(2)} ${(C + Math.sin(a0) * r0).toFixed(2)} A${r0} ${r0} 0 ${large} 1 ${(C + Math.cos(a1) * r0).toFixed(2)} ${(C + Math.sin(a1) * r0).toFixed(2)}`;
          p.setAttribute("stroke-width", String(width));
        }
        p.setAttribute("d", d);
        // pale until it's the one you're looking at
        const anyHot = L.open !== null || L.hover !== null;
        const op = (anyHot ? 0.28 + 0.72 * k : 0.85) * Math.max(0, s.fade.x);
        p.setAttribute("stroke-opacity", op.toFixed(3));
        if (h) {
          h.setAttribute("d", d);
          h.style.display = L.open !== null || tooThin ? "none" : "";
        }
        if (ic) {
          const mid = (a0 + a1) / 2;
          const show = span > 0.32 && L.open === null ? 1 : 0;
          const sc = (0.9 + 0.35 * k) * (show ? 1 : 0.001);
          ic.setAttribute(
            "transform",
            `translate(${(C + Math.cos(mid) * R).toFixed(2)} ${(C + Math.sin(mid) * R).toFixed(2)}) scale(${sc.toFixed(3)})`,
          );
          ic.style.color = op > 0.5 ? "#fff" : categories[i].color;
          ic.style.opacity = String(Math.max(0, s.fade.x) * (1 - u));
        }
      });
      if (track.current) track.current.setAttribute("stroke-opacity", (Math.max(0, u - 0.4) * 0.16).toFixed(3));
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [categories]);

  const point = (i: number | null) => {
    if (i === live.current.hover) return;
    setHover(i);
    if (i !== null) sfx.tick({ freq: 1800 + i * 260, gain: 0.03 });
  };
  const openCat = (i: number) => {
    setOpen(i);
    setHover(null);
    onSelect?.(categories[i]);
    sfx.whoosh(600, 2600, { dur: 0.45, gain: 0.045 });
    sfx.note(659, { at: 0.12, dur: 0.3, gain: 0.04, bell: 0.5 });
  };
  const close = () => {
    setOpen(null);
    onSelect?.(null);
    sfx.whoosh(2600, 700, { dur: 0.45, gain: 0.04 });
  };
  const goMonth = (m: number) => {
    if (m < 0 || m >= monthNames.length || m === month) return;
    setMonth(m);
    spin.current.v += (m > month ? 1 : -1) * -2.2;
    sfx.whoosh(1200, 2200, { dur: 0.3, gain: 0.03 });
    for (let k = 0; k < 4; k++) sfx.tick({ at: 0.05 + k * 0.045, freq: 2400 + k * 300, gain: 0.02 });
  };

  // autoplay: point round the ring, open one, close it, change month
  const gx = useMotionValue(0);
  const gy = useMotionValue(0);
  const [ghost, setGhost] = useState(false);
  const [ghostDown, setGhostDown] = useState(false);
  useEffect(() => {
    if (!autoplay || reduce) return;
    let alive = true;
    const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
    const ok = () => alive && !touched.current;
    const go = async (x: number, y: number, ms = 600) => {
      setGhost(true);
      await Promise.all([
        animate(gx, x, { duration: ms / 1000, ease: [0.4, 0, 0.2, 1] }),
        animate(gy, y, { duration: ms / 1000, ease: [0.4, 0, 0.2, 1] }),
      ]);
    };
    const tap = async () => {
      setGhostDown(true);
      await wait(120);
      setGhostDown(false);
    };
    const arcAt = (i: number) => {
      const s = svg.current;
      const c = card.current;
      const g = geo.current[i];
      if (!s || !c || !g) return [0, 0] as const;
      const r = s.getBoundingClientRect();
      const cb = c.getBoundingClientRect();
      const k = r.width / SIZE;
      const mid = (g.a0 + g.a1) / 2;
      return [r.left - cb.left + (C + Math.cos(mid) * R) * k, r.top - cb.top + (C + Math.sin(mid) * R) * k] as const;
    };
    const el = (sel: string) => {
      const c = card.current;
      const e = c?.querySelector(sel);
      if (!c || !e) return [0, 0] as const;
      const r = e.getBoundingClientRect();
      const cb = c.getBoundingClientRect();
      return [r.left - cb.left + r.width / 2, r.top - cb.top + r.height / 2] as const;
    };
    const run = async () => {
      await wait(1300);
      let n = 0;
      while (ok()) {
        for (const i of [1, 2, 3, 0]) {
          if (!ok()) return;
          await go(...arcAt(i), 520);
          point(i);
          await wait(850);
        }
        if (!ok()) return;
        const pick = [2, 1, 4][n % 3];
        await go(...arcAt(pick), 500);
        point(pick);
        await wait(500);
        await tap();
        openCat(pick);
        await wait(3200);
        if (!ok()) return;
        await go(...el("[data-back]"));
        await tap();
        close();
        await wait(1500);
        if (!ok()) return;
        point(null);
        await go(...el(month > 0 || n % 2 ? "[data-prev]" : "[data-next]"));
        await tap();
        goMonth(live.current.month > 0 ? live.current.month - 1 : live.current.month + 1);
        await wait(1500);
        await tap();
        goMonth(monthNames.length - 1);
        await wait(1400);
        setGhost(false);
        await wait(1200);
        n++;
      }
    };
    run().catch((err) => {
      // torn down mid-step (the tile scrolled away): its elements are gone, so there is nothing to report
      if (alive) throw err;
    });
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoplay, reduce]);

  const delta = prev !== null && !cat ? total - prev : null;
  const sorted = useMemo(
    () => (open !== null ? [...categories[open].txns].sort((a, b) => b.amount - a.amount) : []),
    [open, categories],
  );
  const oc = open !== null ? categories[open] : null;

  return (
    <div
      className={`relative w-full max-w-[380px] select-none ${className}`}
      style={{
        fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', sans-serif",
        color: "#1d1d1f",
      }}
    >
      <div
        ref={card}
        onPointerDown={(e) => e.isTrusted && (touched.current = true)}
        onKeyDown={(e) => {
          touched.current = true;
          if (e.key === "Escape" && open !== null) close();
        }}
        style={{
          position: "relative",
          borderRadius: 30,
          background: "#fff",
          boxShadow: "0 0 0 1px rgba(0,0,0,0.05), 0 30px 60px -34px rgba(0,0,0,0.35)",
          padding: "20px 20px 18px",
          overflow: "hidden",
        }}
      >
        {/* header: month switcher */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            height: 34,
          }}
        >
          <AnimatePresence mode="popLayout" initial={false}>
            {oc ? (
              <motion.button
                key="back"
                data-back
                type="button"
                onClick={close}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3]/60"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  border: 0,
                  background: "#f5f5f7",
                  borderRadius: 17,
                  height: 34,
                  padding: "0 14px 0 11px",
                  fontSize: 14,
                  fontWeight: 600,
                  color: "#1d1d1f",
                  cursor: "pointer",
                }}
              >
                <Ico d={I.back} size={14} />
                All spending
              </motion.button>
            ) : (
              <motion.div
                key="title"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                style={{
                  fontSize: 17,
                  fontWeight: 700,
                  letterSpacing: "-0.02em",
                }}
              >
                {title}
              </motion.div>
            )}
          </AnimatePresence>
          <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
            <button
              type="button"
              data-prev
              aria-label="Previous month"
              disabled={month === 0}
              onClick={() => goMonth(month - 1)}
              className="outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3]/60"
              style={{
                width: 30,
                height: 30,
                borderRadius: 15,
                border: 0,
                background: "transparent",
                color: month === 0 ? "#d2d2d7" : "#6e6e73",
                display: "grid",
                placeItems: "center",
                cursor: month === 0 ? "default" : "pointer",
              }}
            >
              <Ico d={I.left} size={13} />
            </button>
            <div
              style={{
                position: "relative",
                width: 86,
                height: 20,
                overflow: "hidden",
                textAlign: "center",
                fontSize: 13.5,
                fontWeight: 600,
                color: "#3a3a3c",
              }}
            >
              <AnimatePresence initial={false} custom={month}>
                <motion.span
                  key={month}
                  initial={{ y: 18, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -18, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  style={{ position: "absolute", inset: 0 }}
                >
                  {monthNames[month]}
                </motion.span>
              </AnimatePresence>
            </div>
            <button
              type="button"
              data-next
              aria-label="Next month"
              disabled={month === monthNames.length - 1}
              onClick={() => goMonth(month + 1)}
              className="outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3]/60"
              style={{
                width: 30,
                height: 30,
                borderRadius: 15,
                border: 0,
                background: "transparent",
                color: month === monthNames.length - 1 ? "#d2d2d7" : "#6e6e73",
                display: "grid",
                placeItems: "center",
                cursor: month === monthNames.length - 1 ? "default" : "pointer",
              }}
            >
              <Ico d={I.right} size={13} />
            </button>
          </div>
        </div>

        {/* the ring */}
        <div
          style={{
            position: "relative",
            width: "100%",
            maxWidth: SIZE,
            margin: "4px auto 0",
            aspectRatio: "1",
          }}
        >
          <svg
            ref={svg}
            viewBox={`0 0 ${SIZE} ${SIZE}`}
            width="100%"
            height="100%"
            style={{ display: "block", overflow: "visible" }}
            role="group"
            aria-label={`${title}, ${monthNames[month]}`}
          >
            {/* the budget track the open arc unwinds onto */}
            <path
              ref={track}
              d={`M${BAR_X0} ${BAR_Y} L${BAR_X0 + BAR_W} ${BAR_Y}`}
              stroke="#1d1d1f"
              strokeOpacity={0}
              strokeWidth={12}
              strokeLinecap="round"
              fill="none"
            />
            {categories.map((c, i) => (
              <path
                key={c.id}
                ref={(e) => void (paths.current[i] = e)}
                stroke={c.color}
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            ))}
            {categories.map((c, i) => (
              <g key={c.id} ref={(e) => void (icons.current[i] = e)} style={{ pointerEvents: "none" }}>
                {c.icon && <path d={I[c.icon]} transform="translate(-7 -7) scale(0.0547)" fill="currentColor" />}
              </g>
            ))}
            {/* fat invisible arcs to point at */}
            {categories.map((c, i) => (
              <path
                key={c.id}
                ref={(e) => void (hits.current[i] = e)}
                role="button"
                tabIndex={0}
                aria-label={`${c.label}: ${money(c.months[month] ?? 0, currency)}`}
                stroke="transparent"
                strokeWidth={FAT + 12}
                fill="none"
                onPointerEnter={() => point(i)}
                onPointerLeave={() => point(null)}
                onFocus={() => point(i)}
                onBlur={() => point(null)}
                onClick={() => {
                  touched.current = true;
                  openCat(i);
                }}
                onKeyDown={(e) => {
                  touched.current = true;
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    openCat(i);
                  } else if (
                    e.key === "ArrowRight" ||
                    e.key === "ArrowDown" ||
                    e.key === "ArrowLeft" ||
                    e.key === "ArrowUp"
                  ) {
                    e.preventDefault();
                    const j =
                      (i + (e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : categories.length - 1)) %
                      categories.length;
                    hits.current[j]?.focus();
                  }
                }}
                style={{
                  cursor: "pointer",
                  outline: "none",
                  pointerEvents: "stroke",
                }}
              />
            ))}
          </svg>
          {/* the middle */}
          <AnimatePresence>
            {open === null && (
              <motion.div
                key="mid"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{
                  opacity: 0,
                  scale: 0.85,
                  transition: { duration: 0.15 },
                }}
                aria-live="polite"
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  pointerEvents: "none",
                }}
              >
                <div
                  style={{
                    position: "relative",
                    height: 18,
                    width: 160,
                    overflow: "hidden",
                    textAlign: "center",
                  }}
                >
                  <AnimatePresence initial={false}>
                    <motion.div
                      key={cat?.id ?? "total"}
                      initial={{ y: 14, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: -14, opacity: 0 }}
                      transition={{
                        type: "spring",
                        stiffness: 420,
                        damping: 30,
                      }}
                      style={{
                        position: "absolute",
                        inset: 0,
                        fontSize: 13,
                        fontWeight: 600,
                        color: cat ? cat.color : "#86868b",
                        filter: cat ? "brightness(0.85)" : undefined,
                      }}
                    >
                      {cat ? cat.label : `Spent in ${monthNames[month]}`}
                    </motion.div>
                  </AnimatePresence>
                </div>
                <Roll
                  text={money(Math.round(centerValue), currency)}
                  reduce={reduce}
                  style={{
                    fontSize: 40,
                    fontWeight: 700,
                    letterSpacing: "-0.04em",
                    marginTop: 2,
                  }}
                />
                <div
                  style={{
                    height: 18,
                    fontSize: 12.5,
                    color: "#86868b",
                    marginTop: 2,
                  }}
                >
                  {cat ? (
                    `${Math.round(((cat.months[month] ?? 0) / Math.max(1, total)) * 100)}% of the month`
                  ) : delta !== null ? (
                    <span
                      style={{
                        color: delta > 0 ? "#d70015" : "#248a3d",
                        fontWeight: 600,
                      }}
                    >{`${delta > 0 ? "Up" : "Down"} ${money(Math.abs(Math.round(delta)), currency)} on ${monthNames[month - 1]}`}</span>
                  ) : (
                    "Point at a slice"
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          {/* opened: the budget line's labels and the transactions */}
          <AnimatePresence>
            {oc && (
              <motion.div
                key={oc.id}
                initial={{ opacity: 0 }}
                animate={{
                  opacity: 1,
                  transition: { delay: reduce ? 0 : 0.35 },
                }}
                exit={{ opacity: 0, transition: { duration: 0.15 } }}
                style={{
                  position: "absolute",
                  left: 0,
                  right: 0,
                  top: 0,
                  bottom: 0,
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    left: `${(BAR_X0 / SIZE) * 100}%`,
                    right: `${(BAR_X0 / SIZE) * 100}%`,
                    top: `${((BAR_Y + 14) / SIZE) * 100}%`,
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: 12.5,
                    color: "#86868b",
                  }}
                >
                  <span>
                    <b style={{ color: "#1d1d1f", fontWeight: 650 }}>{money(oc.months[month] ?? 0, currency)}</b> of{" "}
                    {money(oc.budget, currency)}
                  </span>
                  <span
                    style={{
                      color: (oc.months[month] ?? 0) > oc.budget ? "#d70015" : "#248a3d",
                      fontWeight: 600,
                    }}
                  >
                    {(oc.months[month] ?? 0) > oc.budget
                      ? `${money((oc.months[month] ?? 0) - oc.budget, currency)} over`
                      : `${money(oc.budget - (oc.months[month] ?? 0), currency)} left`}
                  </span>
                </div>
                <div
                  style={{
                    position: "absolute",
                    left: 6,
                    right: 6,
                    top: `${((BAR_Y + 42) / SIZE) * 100}%`,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      marginBottom: 6,
                    }}
                  >
                    <span
                      style={{
                        width: 30,
                        height: 30,
                        borderRadius: 10,
                        background: oc.color,
                        color: "#fff",
                        display: "grid",
                        placeItems: "center",
                      }}
                    >
                      {oc.icon && <Ico d={I[oc.icon]} size={16} />}
                    </span>
                    <span
                      style={{
                        fontSize: 22,
                        fontWeight: 700,
                        letterSpacing: "-0.03em",
                      }}
                    >
                      {oc.label}
                    </span>
                  </div>
                  {sorted.map((t, k) => (
                    <motion.div
                      key={t.name}
                      initial={{ opacity: 0, y: 14, filter: "blur(4px)" }}
                      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                      transition={{
                        delay: reduce ? 0 : 0.45 + k * 0.06,
                        type: "spring",
                        stiffness: 300,
                        damping: 26,
                        filter: {
                          duration: 0.3,
                          delay: reduce ? 0 : 0.45 + k * 0.06,
                        },
                      }}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        padding: "8px 2px",
                        borderTop: k ? "1px solid rgba(0,0,0,0.06)" : "none",
                      }}
                    >
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            fontSize: 14,
                            fontWeight: 550,
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {t.name}
                        </div>
                        <div style={{ fontSize: 12, color: "#86868b" }}>{t.date}</div>
                      </div>
                      <div
                        style={{
                          width: 54,
                          height: 5,
                          borderRadius: 3,
                          background: "#f0f0f3",
                          overflow: "hidden",
                        }}
                      >
                        <motion.div
                          initial={{ scaleX: 0 }}
                          animate={{
                            scaleX: t.amount / Math.max(...sorted.map((x) => x.amount)),
                          }}
                          transition={{
                            delay: reduce ? 0 : 0.55 + k * 0.06,
                            type: "spring",
                            stiffness: 200,
                            damping: 22,
                          }}
                          style={{
                            height: "100%",
                            background: oc.color,
                            transformOrigin: "0 50%",
                          }}
                        />
                      </div>
                      <div
                        style={{
                          width: 70,
                          textAlign: "right",
                          fontSize: 14,
                          fontWeight: 600,
                          fontVariantNumeric: "tabular-nums",
                        }}
                      >
                        {money(t.amount, currency)}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* legend */}
        <motion.div
          animate={{
            opacity: open === null ? 1 : 0,
            y: open === null ? 0 : 10,
          }}
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "2px 12px",
            marginTop: 8,
            pointerEvents: open === null ? "auto" : "none",
          }}
        >
          {categories.map((c, i) => (
            <button
              key={c.id}
              type="button"
              tabIndex={-1}
              onPointerEnter={() => point(i)}
              onPointerLeave={() => point(null)}
              onClick={() => openCat(i)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                border: 0,
                background: hover === i ? "#f5f5f7" : "transparent",
                borderRadius: 10,
                padding: "6px 8px",
                cursor: "pointer",
                textAlign: "left",
                transition: "background 0.2s",
              }}
            >
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  background: c.color,
                  flex: "none",
                }}
              />
              <span style={{ flex: 1, fontSize: 13, color: "#3a3a3c" }}>{c.label}</span>
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {money(c.months[month] ?? 0, currency)}
              </span>
            </button>
          ))}
        </motion.div>

        {ghost && (
          <motion.span
            aria-hidden="true"
            animate={{ scale: ghostDown ? 0.78 : 1 }}
            transition={{ type: "spring", stiffness: 600, damping: 26 }}
            style={{
              position: "absolute",
              left: -13,
              top: -13,
              x: gx,
              y: gy,
              width: 26,
              height: 26,
              borderRadius: 13,
              background: "rgba(29,29,31,0.18)",
              boxShadow: "0 0 0 2px rgba(255,255,255,0.85), 0 6px 14px -4px rgba(0,0,0,0.35)",
              pointerEvents: "none",
              zIndex: 9,
            }}
          />
        )}
      </div>
    </div>
  );
}
```

--- lib/ui-sounds.ts ---

```ts
/**
 * UI sounds with no audio files. Every sound is synthesised on the fly with
 * the Web Audio API (oscillators, filtered noise and envelopes), so the whole
 * library is this one file and nothing to download.
 *
 *   import { playSound } from "@/lib/ui-sounds";
 *   <button onClick={() => playSound("pop")}>Like</button>
 *
 * Browsers only allow audio after a user gesture, so call it from a click,
 * key press or pointer event.
 *
 * Components that make sound use the hook, which also honours the visitor's
 * on/off choice (see "Preference" below):
 *
 *   const play = useSound(enableSound);
 *   <button onClick={() => play("tap")}>Save</button>
 *
 * A component that plays itself (an autoplay demo) calls play.auto("tap") instead: the same sound,
 * but silent until the visitor has clicked or pressed a key once on the page.
 */

import * as React from "react";

export type SoundCategory = "Actions" | "Feedback" | "Navigation" | "Notifications" | "Selection" | "Movement" | "Progress" | "System";

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let out: AudioNode | null = null;
let analyserNode: AnalyserNode | null = null;
let noiseBuf: AudioBuffer | null = null;

function audio() {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    playbackSession();
    master = ctx.createGain();
    master.gain.value = isTouchDevice() ? 0.9 : 0.5; // phone speakers are small and quiet
    const comp = ctx.createDynamicsCompressor();
    master.connect(comp).connect(ctx.destination);
    out = comp;
  }
  silentTrack();
  if (ctx.state !== "running") void ctx.resume(); // "suspended" until a tap; "interrupted" after a call or a locked screen on iOS
  return ctx;
}

/**
 * Phones. iOS and Android only let a page start audio from a real tap (iOS counts touchend and click, not the
 * pointerenter that fires when a finger lands), and iOS mutes Web Audio while the ringer switch is on silent
 * unless the page asks for the "playback" audio session. So on a touch screen, once a sound has been asked for, the next tap
 * wakes the engine, plays one silent sample, and switches the session; after that every sound is audible.
 */
function playbackSession() {
  try {
    const session = (navigator as unknown as { audioSession?: { type: string } }).audioSession;
    if (session && session.type !== "playback") session.type = "playback";
  } catch {
    // not supported: the ringer switch still applies
  }
}

/**
 * The iOS ringer switch. With it on silent, iOS mutes Web Audio but not a playing <audio> element, and while one is
 * playing it moves the whole page to the "playback" category. So on a touch device the first sound also starts a
 * silent loop (a quarter second of silence), which is what makes the sounds heard with the switch on silent. It is
 * only started once a sound has been asked for, and paused whenever the page is hidden.
 */
const SILENT_WAV = "data:audio/wav;base64,UklGRvQHAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YdAHAACAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgA==";
let silentEl: HTMLAudioElement | null = null;
function isTouchDevice() {
  return typeof window !== "undefined" && ((navigator.maxTouchPoints ?? 0) > 0 || !!window.matchMedia?.("(pointer: coarse)").matches);
}
function silentTrack() {
  if (typeof document === "undefined" || !isTouchDevice()) return;
  try {
    if (!silentEl) {
      silentEl = new Audio(SILENT_WAV);
      silentEl.loop = true;
      silentEl.setAttribute("playsinline", "");
      document.addEventListener("visibilitychange", () => {
        if (document.hidden) silentEl?.pause();
      });
    }
    if (silentEl.paused && !document.hidden) void silentEl.play().catch(() => {});
  } catch {
    // no HTMLAudioElement: the ringer switch still applies
  }
}

let unlockArmed = false;
function armTouchUnlock() {
  if (unlockArmed || typeof window === "undefined") return;
  unlockArmed = true;
  if (!isTouchDevice()) return;
  const wake = () => {
    if (!ctx) return; // nothing to wake until a sound has been asked for (and no silent loop for visitors who never use sound)
    if (ctx.state === "running") return silentTrack();
    const c = audio();
    if (!c) return;
    try {
      const s = c.createBufferSource();
      s.buffer = c.createBuffer(1, 1, 22050);
      s.connect(c.destination);
      s.start(0);
    } catch {
      // ignore
    }
  };
  for (const type of ["touchend", "pointerup", "click", "keydown"]) window.addEventListener(type, wake, { capture: true, passive: true });
}
armTouchUnlock();

/**
 * A tap on everything the library plays, for drawing it (a level meter, a visualiser). It listens
 * only; nothing extra is heard. Null on the server or before the browser allows audio.
 */
export function getSoundAnalyser(): AnalyserNode | null {
  const c = audio();
  if (!c || !out) return null;
  if (!analyserNode) {
    analyserNode = c.createAnalyser();
    analyserNode.fftSize = 1024;
    analyserNode.smoothingTimeConstant = 0.55;
    out.connect(analyserNode);
  }
  return analyserNode;
}

function noise(c: AudioContext) {
  if (!noiseBuf) {
    noiseBuf = c.createBuffer(1, c.sampleRate, c.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  const s = c.createBufferSource();
  s.buffer = noiseBuf;
  return s;
}

export type ToneOpts = { freq: number; to?: number; type?: OscillatorType; at?: number; attack?: number; decay?: number; gain?: number; glide?: number };
export function tone(c: AudioContext, out: AudioNode, o: ToneOpts) {
  const t0 = c.currentTime + (o.at ?? 0);
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = o.type ?? "sine";
  osc.frequency.setValueAtTime(o.freq, t0);
  if (o.to) osc.frequency.exponentialRampToValueAtTime(o.to, t0 + (o.glide ?? o.decay ?? 0.1));
  const a = o.attack ?? 0.004, d = o.decay ?? 0.12, peak = o.gain ?? 0.3;
  g.gain.value = 0.0001; // a gain node starts at 1: without this the very first sample of a note can click
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(peak, t0 + a);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + a + d);
  osc.connect(g).connect(out);
  osc.start(t0);
  osc.stop(t0 + a + d + 0.05);
}

export type NoiseOpts = { at?: number; attack?: number; decay?: number; gain?: number; filter?: BiquadFilterType; freq?: number; to?: number; q?: number };
export function hiss(c: AudioContext, out: AudioNode, o: NoiseOpts) {
  const t0 = c.currentTime + (o.at ?? 0);
  const n = noise(c);
  const f = c.createBiquadFilter();
  const g = c.createGain();
  f.type = o.filter ?? "bandpass";
  f.frequency.setValueAtTime(o.freq ?? 2000, t0);
  if (o.to) f.frequency.exponentialRampToValueAtTime(o.to, t0 + (o.attack ?? 0.01) + (o.decay ?? 0.1));
  f.Q.value = o.q ?? 1;
  const a = o.attack ?? 0.003, d = o.decay ?? 0.08, peak = o.gain ?? 0.3;
  g.gain.value = 0.0001; // a gain node starts at 1: without this the very first sample of a note can click
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(peak, t0 + a);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + a + d);
  n.connect(f).connect(g).connect(out);
  n.start(t0, Math.random() * 0.5);
  n.stop(t0 + a + d + 0.05);
}

/** One sound: how it is made from oscillators and noise. `tone` and `hiss` are the building blocks. */
export type SoundDef = {
  category: string;
  label: string;
  play: (c: AudioContext, out: AudioNode) => void;
  /** Seconds the sound lasts, when it runs longer than the two the engine keeps it connected for (a recording). */
  length?: number;
};
type Def = SoundDef & { category: SoundCategory };

export const SOUNDS = {
  tap: { category: "Actions", label: "Tap", play: (c, o) => { tone(c, o, { freq: 900, to: 620, decay: 0.06, gain: 0.25 }); hiss(c, o, { freq: 4000, decay: 0.015, gain: 0.08, filter: "highpass" }); } },
  pop: { category: "Actions", label: "Pop", play: (c, o) => tone(c, o, { freq: 320, to: 980, glide: 0.07, decay: 0.09, gain: 0.35 }) },
  knock: { category: "Actions", label: "Knock", play: (c, o) => { tone(c, o, { freq: 160, to: 90, decay: 0.1, gain: 0.5 }); hiss(c, o, { freq: 900, decay: 0.04, gain: 0.25, q: 2 }); tone(c, o, { at: 0.11, freq: 150, to: 85, decay: 0.09, gain: 0.35 }); hiss(c, o, { at: 0.11, freq: 900, decay: 0.035, gain: 0.18, q: 2 }); } },

  success: { category: "Feedback", label: "Landed", play: (c, o) => { tone(c, o, { freq: 1046.5, decay: 0.18, gain: 0.22, type: "triangle" }); tone(c, o, { at: 0.09, freq: 1318.5, decay: 0.32, gain: 0.22, type: "triangle" }); } },
  error: { category: "Feedback", label: "Bump", play: (c, o) => { tone(c, o, { freq: 220, decay: 0.09, gain: 0.18, type: "square" }); tone(c, o, { at: 0.11, freq: 185, decay: 0.14, gain: 0.18, type: "square" }); } },
  paid: { category: "Feedback", label: "Paid", play: (c, o) => [1318.5, 1568, 2093].forEach((f, i) => tone(c, o, { at: i * 0.065, freq: f, decay: 0.35 - i * 0.05, gain: 0.16, type: "triangle" })) },

  whoosh: { category: "Navigation", label: "Whisk", play: (c, o) => hiss(c, o, { attack: 0.06, decay: 0.18, freq: 400, to: 3200, gain: 0.22, q: 0.8 }) },
  step: { category: "Navigation", label: "Step", play: (c, o) => { tone(c, o, { freq: 520, decay: 0.05, gain: 0.18 }); tone(c, o, { at: 0.06, freq: 700, decay: 0.07, gain: 0.16 }); } },
  glide: { category: "Navigation", label: "Glide", play: (c, o) => tone(c, o, { freq: 440, to: 880, glide: 0.18, attack: 0.03, decay: 0.2, gain: 0.18 }) },

  chime: { category: "Notifications", label: "Chime", play: (c, o) => [1, 2.76, 5.4].forEach((m, i) => tone(c, o, { freq: 880 * m, decay: 0.9 / (i + 1), gain: 0.18 / (i + 1) })) },
  ping: { category: "Notifications", label: "Ping", play: (c, o) => tone(c, o, { freq: 1760, decay: 0.6, gain: 0.16 }) },
  beacon: { category: "Notifications", label: "Beacon", play: (c, o) => { tone(c, o, { freq: 1175, decay: 0.25, gain: 0.18, type: "triangle" }); tone(c, o, { at: 0.18, freq: 1568, decay: 0.45, gain: 0.18, type: "triangle" }); } },

  tick: { category: "Selection", label: "Tick", play: (c, o) => hiss(c, o, { freq: 5000, decay: 0.012, gain: 0.3, filter: "highpass" }) },
  on: { category: "Selection", label: "Latch on", play: (c, o) => { hiss(c, o, { freq: 3000, decay: 0.01, gain: 0.2 }); tone(c, o, { at: 0.01, freq: 600, to: 900, decay: 0.07, gain: 0.2 }); } },
  off: { category: "Selection", label: "Latch off", play: (c, o) => { hiss(c, o, { freq: 2400, decay: 0.01, gain: 0.18 }); tone(c, o, { at: 0.01, freq: 760, to: 480, decay: 0.07, gain: 0.18 }); } },

  lift: { category: "Movement", label: "Lift", play: (c, o) => { hiss(c, o, { attack: 0.03, decay: 0.08, freq: 800, to: 2400, gain: 0.14 }); tone(c, o, { freq: 300, to: 520, decay: 0.08, gain: 0.12 }); } },
  drop: { category: "Movement", label: "Drop", play: (c, o) => { tone(c, o, { freq: 380, to: 120, glide: 0.08, decay: 0.12, gain: 0.35 }); hiss(c, o, { at: 0.06, freq: 600, decay: 0.05, gain: 0.15 }); } },
  swipe: { category: "Movement", label: "Swipe", play: (c, o) => hiss(c, o, { attack: 0.02, decay: 0.12, freq: 3200, to: 500, gain: 0.2, q: 1.2 }) },

  charge: { category: "Progress", label: "Charge", play: (c, o) => tone(c, o, { freq: 220, to: 880, glide: 0.5, attack: 0.08, decay: 0.5, gain: 0.14, type: "triangle" }) },
  done: { category: "Progress", label: "Complete", play: (c, o) => [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => tone(c, o, { at: i * 0.04, freq: f, attack: 0.01, decay: 0.6, gain: 0.1, type: "triangle" })) },
  loading: { category: "Progress", label: "Loading", play: (c, o) => [0, 0.12, 0.24].forEach((at, i) => tone(c, o, { at, freq: 660 + i * 40, decay: 0.05, gain: 0.12 })) },

  boot: { category: "System", label: "Boot", play: (c, o) => [130.8, 196, 261.6, 392].forEach((f, i) => tone(c, o, { at: i * 0.07, freq: f, attack: 0.08, decay: 0.9, gain: 0.08, type: "sine" })) },
  hush: { category: "System", label: "Hush", play: (c, o) => { tone(c, o, { freq: 520, to: 180, glide: 0.35, attack: 0.02, decay: 0.35, gain: 0.14 }); hiss(c, o, { attack: 0.05, decay: 0.3, freq: 1800, to: 300, gain: 0.06, filter: "lowpass" }); } },
  alert: { category: "System", label: "Alert", play: (c, o) => [0, 0.16, 0.32].forEach((at, i) => tone(c, o, { at, freq: i % 2 ? 740 : 988, decay: 0.12, gain: 0.14, type: "triangle" })) },
} satisfies Record<string, Def>;

export type SoundName = keyof typeof SOUNDS;

// ── Style ───────────────────────────────────────────────────────────
//
// A style re-voices the sounds above under the same names, so every component that plays "tap" or
// "chime" changes voice at once and no component code changes. The default style is "nexus" (the
// recipes in this file). Another file can add one: `@/lib/ui-sounds-mac` registers "mac" when it is
// imported. The visitor's choice is kept in localStorage ("ui-sounds-style").

const STYLE_KEY = "ui-sounds-style";
const styles = new Map<string, Partial<Record<SoundName, SoundDef>>>();
let style: string | null = null;
const styleListeners = new Set<() => void>();

/** Adds a style: recipes keyed by the sound names above. Missing names fall back to the default. */
export function registerSoundStyle(name: string, defs: Partial<Record<SoundName, SoundDef>>) {
  styles.set(name, defs);
  styleListeners.forEach((l) => l());
}

/** The active style: "nexus" unless the visitor or your code picked another. */
export function getSoundStyle(): string {
  if (style === null) {
    style = "nexus";
    if (typeof window !== "undefined") {
      try {
        style = window.localStorage.getItem(STYLE_KEY) || "nexus";
      } catch {
        // storage blocked: the default style
      }
    }
  }
  return style;
}

/** Pick the style every sound uses. Remembered in this browser unless `persist` is false. */
export function setSoundStyle(name: string, persist = true) {
  style = name;
  if (persist && typeof window !== "undefined") {
    try {
      window.localStorage.setItem(STYLE_KEY, name);
    } catch {
      // storage blocked: the choice lasts until the page closes
    }
  }
  styleListeners.forEach((l) => l());
}

function subscribeStyle(onChange: () => void) {
  styleListeners.add(onChange);
  return () => {
    styleListeners.delete(onChange);
  };
}

/** The style as React state: `[style, setStyle]`. The server render reads "nexus". */
export function useSoundStyle(): [string, (name: string) => void] {
  const current = React.useSyncExternalStore(subscribeStyle, getSoundStyle, () => "nexus");
  return [current, setSoundStyle];
}

// ── Preference ──────────────────────────────────────────────────────
//
// One switch for every sound on the page. A visitor's choice is kept in
// localStorage ("ui-sounds": "on" | "off"); until they choose, the default
// applies (on, unless you call configureSounds({ defaultEnabled: false })).

const STORE_KEY = "ui-sounds";
let defaultEnabled = true;
let chosen: boolean | null = null; // the visitor's saved or runtime choice
let loaded = false;
const listeners = new Set<() => void>();

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const v = window.localStorage.getItem(STORE_KEY);
    if (v === "on") chosen = true;
    else if (v === "off") chosen = false;
  } catch {
    // storage blocked: the default applies
  }
}

function emit() {
  listeners.forEach((l) => l());
}

/** Whether sounds are on right now. */
export function getSoundsEnabled(): boolean {
  load();
  return chosen ?? defaultEnabled;
}

/** Whether sounds are on until the visitor chooses. Call once, early, in client code. */
export function configureSounds(opts: { defaultEnabled?: boolean }) {
  if (typeof opts.defaultEnabled === "boolean" && opts.defaultEnabled !== defaultEnabled) {
    defaultEnabled = opts.defaultEnabled;
    emit();
  }
}

/** Turn sounds on or off. The choice is remembered in this browser unless `persist` is false. */
export function setSoundsEnabled(on: boolean, persist = true) {
  load();
  chosen = on;
  if (persist) {
    try {
      window.localStorage.setItem(STORE_KEY, on ? "on" : "off");
    } catch {
      // storage blocked: the choice lasts until the page closes
    }
  }
  emit();
}

/** Mute or unmute every sound for this page load (for a "Sounds off" preference you store yourself). */
export function setSoundsMuted(value: boolean) {
  setSoundsEnabled(!value, false);
}

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  const onStorage = (e: StorageEvent) => {
    if (e.key !== STORE_KEY) return;
    loaded = false;
    chosen = null;
    emit();
  };
  if (typeof window !== "undefined") window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(onChange);
    if (typeof window !== "undefined") window.removeEventListener("storage", onStorage);
  };
}

/**
 * The sound switch as React state: `[enabled, setEnabled]`. Use it for a speaker button. The server
 * render always reads "off", so the first paint matches and the real value arrives right after.
 */
export function useSoundsEnabled(): [boolean, (on: boolean) => void] {
  const enabled = React.useSyncExternalStore(subscribe, getSoundsEnabled, () => false);
  return [enabled, setSoundsEnabled];
}

// ── Playing ─────────────────────────────────────────────────────────

const lastPlayed = new Map<string, number>();

/**
 * Play a sound by name. volume is 0..1 on top of the master level. It stays silent while the
 * visitor has sounds off, unless `force` is set (for a button whose whole job is to play the sound).
 */
export function playSound(name: SoundName, volume = 1, force = false) {
  if (!(name in SOUNDS)) return;
  // The active style may voice this sound differently; anything it leaves out keeps the default.
  playDef(name, styles.get(getSoundStyle())?.[name] ?? SOUNDS[name], volume, force);
}

/**
 * Play any sound definition (the Pro sound pack uses this). `key` names it for the 30 ms de-bounce.
 * It follows the same on/off switch as playSound.
 */
export function playDef(key: string, def: SoundDef, volume = 1, force = false) {
  if (!force && !getSoundsEnabled()) return;
  if (typeof document !== "undefined" && document.hidden) return;
  // The same sound twice within 30ms is one sound: it keeps fast input from stacking into a buzz.
  const now = typeof performance !== "undefined" ? performance.now() : Date.now();
  if (now - (lastPlayed.get(key) ?? -1e9) < 30) return;
  lastPlayed.set(key, now);
  const c = audio();
  if (!c || !master) return;
  const g = c.createGain();
  g.gain.value = Math.max(0, Math.min(1, volume));
  g.connect(master);
  def.play(c, g);
  setTimeout(() => g.disconnect(), Math.max(2000, (def.length ?? 0) * 1000 + 300));
}

/** Whether the audio engine is awake. Browsers keep it asleep until the visitor's first click or key press. */
export function audioAwake() {
  // The visitor has clicked or pressed a key somewhere on the page: the browser lets us start audio now.
  if (!ctx && typeof navigator !== "undefined" && navigator.userActivation?.hasBeenActive) audio();
  return !!ctx && ctx.state === "running";
}

/**
 * Autoplay demos make sound too, but only where you allow it. It is allowed everywhere by default.
 * Wrap a part of the page in <AutoplaySound allow={false}> to keep demos silent there (a grid of
 * previews, say) and in <AutoplaySound allow> to let the one you are showing be heard.
 */
// Server components load this file for the sound list; they have no createContext, and never render the provider.
const AutoplayCtx = (typeof React.createContext === "function" ? React.createContext(true) : null) as unknown as React.Context<boolean>;
export function AutoplaySound({ allow, children }: { allow: boolean; children?: React.ReactNode }) {
  return React.createElement(AutoplayCtx.Provider, { value: allow }, children);
}

/** Whether autoplay demos may make sound here (see AutoplaySound). Used by the Pro sound hook. */
export function useAutoplaySoundAllowed() {
  return React.useContext(AutoplayCtx);
}

export type SoundPlayer = {
  (name: SoundName, volume?: number): void;
  /** For a sound that answers the component playing itself (autoplay). Silent until the visitor has used the page once. */
  auto: (name: SoundName, volume?: number) => void;
};

/**
 * For a component with a `sound` option: returns a play function that is silent when `enabled` is
 * false and otherwise follows the visitor's on/off switch. `play.auto(...)` is the same for sounds
 * made by autoplay.
 *
 *   const play = useSound(enableSound);
 */
export function useSound(enabled = true): SoundPlayer {
  const auto = React.useContext(AutoplayCtx);
  return React.useMemo(
    () =>
      Object.assign(
        (name: SoundName, volume = 1) => {
          if (enabled) playSound(name, volume);
        },
        {
          auto: (name: SoundName, volume = 1) => {
            if (enabled && auto && audioAwake()) playSound(name, volume);
          },
        },
      ),
    [enabled, auto],
  );
}

/** Set the overall level for every sound, 0..1. */
export function setSoundVolume(v: number) {
  audio();
  if (master) master.gain.value = Math.max(0, Math.min(1, v)) * (isTouchDevice() ? 0.9 : 0.5);
}
```
