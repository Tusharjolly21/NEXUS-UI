# Liquid Gauge

Add the "Liquid Gauge" component from Nexus UI to my project.

A storage meter drawn as liquid in a glass orb, with two rolling wave layers, rising bubbles and a surface that leans toward the pointer. The percentage is drawn twice so the part under the liquid turns white, and changing the level sloshes it.

Please:

1. Create the files below at sensible paths for this project, keeping each file's name. They import each other with relative paths, so keep them together.
2. Install what it needs: `framer-motion` (use this project's package manager).
3. It is styled with Tailwind CSS classes, so the project needs Tailwind.
4. Use it like this: `import { LiquidGauge } from "@/components/liquid-gauge";`. The props are typed and documented in the code.

Copy the code exactly as it is. Do not restyle, simplify or rename anything, and keep the comments: they explain why the numbers are what they are. The only thing to adapt is import paths, if this project uses a different alias than `@/`.

--- components/liquid-gauge/index.ts ---

```ts
export { LiquidGauge } from "./liquid-gauge";
export type { LiquidGaugeProps } from "./liquid-gauge";
```

--- components/liquid-gauge/liquid-gauge.tsx ---

```tsx
"use client";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import {
  animate,
  motion,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useSpring,
  type AnimationPlaybackControls,
} from "framer-motion";

export interface LiquidGaugeProps {
  /** Capacity of the store, in `unit`s. */
  total?: number;
  /** Amount used when the gauge first renders, in `unit`s (clamped to 0..total). */
  defaultUsed?: number;
  /** Colour of the liquid while usage is below `warnAt`. */
  accent?: string;
  /** Percentage at which the liquid turns orange and the caption warns that it's almost full. */
  warnAt?: number;
  /** Unit shown in the caption, e.g. "GB". */
  unit?: string;
  /** Called with the new amount used after the user presses "Clean up" (−40) or "Add files" (+30). */
  onChange?: (used: number) => void;
  /** Sloshes through a few fill levels every 2.6s until someone presses a button. */
  autoplay?: boolean;
}

/** Orb canvas size and radius, in px. */
const S = 220;
const R = 100;
const BUBBLES = 7;
/** Autoplay levels, written against a 200-unit store and scaled to `total`. */
const DEMO = [168, 92, 186, 136];

/**
 * Storage shown as liquid in a glass orb. Two layers of waves roll at
 * different speeds, bubbles rise, the surface leans toward the pointer, and
 * the percentage is drawn twice so the part under the liquid turns white.
 * Changing the level sloshes it.
 */
export function LiquidGauge({
  total = 200,
  defaultUsed = 136,
  accent = "#0a84ff",
  warnAt = 85,
  unit = "GB",
  onChange,
  autoplay = false,
}: LiquidGaugeProps) {
  const id = useId().replace(/:/g, "");
  const still = useReducedMotion() === true;
  const cap = Math.max(1, total);
  const start = Math.max(0, Math.min(cap, defaultUsed));
  const level = useSpring(start / cap, { stiffness: 40, damping: 9 });
  const lean = useSpring(0, { stiffness: 80, damping: 12 });
  const amp = useMotionValue(6);
  const back = useRef<SVGPathElement>(null);
  const front = useRef<SVGPathElement>(null);
  const clip = useRef<SVGPathElement>(null);
  const slosh = useRef<AnimationPlaybackControls | undefined>(undefined);
  const touched = useRef(false);
  const [used, setUsed] = useState(start);
  const [shown, setShown] = useState(Math.round((start / cap) * 100));
  useMotionValueEvent(level, "change", (v) => setShown(Math.round(v * 100)));

  const setTo = useCallback(
    (g: number) => {
      const v = Math.max(0, Math.min(cap, Math.round(g)));
      setUsed(v);
      level.set(v / cap);
      if (!still) {
        slosh.current?.stop();
        slosh.current = animate(amp, [6, 16, 6], { duration: 1.6, ease: "easeOut" });
      }
      return v;
    },
    [cap, level, amp, still],
  );

  useEffect(() => () => slosh.current?.stop(), []);

  // Wave paths are rebuilt every frame straight into the DOM; React never re-renders for them.
  useEffect(() => {
    let raf = 0;
    let t = 0;
    const wave = (phase: number, a: number, k: number) => {
      const y0 = S / 2 + R - level.get() * 2 * R;
      let d = `M 0 ${S}`;
      for (let x = 0; x <= S; x += 4) {
        const tilt = (x - S / 2) * lean.get() * 0.18;
        d += ` L ${x} ${y0 + Math.sin(x / k + phase) * a + tilt}`;
      }
      return `${d} L ${S} ${S} Z`;
    };
    const loop = () => {
      raf = requestAnimationFrame(loop);
      if (!still) t += 0.04;
      const a = amp.get();
      back.current?.setAttribute("d", wave(t * 0.8 + 1.6, a * 0.8, 26));
      const f = wave(t * 1.3, a, 34);
      front.current?.setAttribute("d", f);
      clip.current?.setAttribute("d", f);
    };
    loop();
    return () => cancelAnimationFrame(raf);
  }, [level, lean, amp, still]);

  useEffect(() => {
    if (!autoplay) return;
    const seq = DEMO.map((g) => (g / 200) * cap);
    let k = 0;
    const t = setInterval(() => {
      if (touched.current) {
        clearInterval(t);
        return;
      }
      setTo(seq[k++ % seq.length]);
    }, 2600);
    return () => clearInterval(t);
  }, [autoplay, cap, setTo]);

  const press = (delta: number) => {
    touched.current = true;
    const v = setTo(used + delta);
    if (v !== used) onChange?.(v);
  };

  const pct = `${shown}%`;
  const warn = shown >= warnAt;
  const color = warn ? "#ff9f0a" : accent;
  const textStyle = { letterSpacing: "-0.04em", fontVariantNumeric: "tabular-nums" } as const;

  return (
    <div
      className="flex flex-col items-center gap-4"
      onPointerMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        lean.set(((e.clientX - r.left) / r.width - 0.5) * 2);
      }}
      onPointerLeave={() => lean.set(0)}
    >
      <div className="relative" style={{ width: S, height: S }}>
        <svg width={S} height={S} viewBox={`0 0 ${S} ${S}`} role="img" aria-label={`Storage ${pct} used`}>
          <defs>
            <clipPath id={`orb-${id}`}>
              <circle cx={S / 2} cy={S / 2} r={R} />
            </clipPath>
            <clipPath id={`liq-${id}`}>
              <path ref={clip} />
            </clipPath>
            <radialGradient id={`gl-${id}`} cx="35%" cy="28%" r="75%">
              <stop offset="0" stopColor="#fff" stopOpacity=".9" />
              <stop offset=".35" stopColor="#fff" stopOpacity=".15" />
              <stop offset="1" stopColor="#fff" stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle cx={S / 2} cy={S / 2} r={R} className="fill-[#f2f4f8] dark:fill-[#2c2c2e]" />
          <g clipPath={`url(#orb-${id})`}>
            <motion.path ref={back} animate={{ fill: color }} style={{ opacity: 0.35 }} />
            <motion.path ref={front} animate={{ fill: color }} />
            <text x={S / 2} y={S / 2 + 14} textAnchor="middle" fontSize="44" fontWeight="600" className="fill-[#1d1d1f] dark:fill-[#f5f5f7]" style={textStyle}>
              {pct}
            </text>
            <g clipPath={`url(#liq-${id})`}>
              <text x={S / 2} y={S / 2 + 14} textAnchor="middle" fontSize="44" fontWeight="600" fill="#ffffff" style={textStyle}>
                {pct}
              </text>
            </g>
            {!still &&
              Array.from({ length: BUBBLES }, (_, i) => (
                <motion.circle
                  key={i}
                  cx={50 + i * 20}
                  r={2 + (i % 3)}
                  fill="#fff"
                  fillOpacity=".55"
                  initial={{ cy: S + 10 }}
                  animate={{ cy: [S + 10, S / 2 + R - (shown / 100) * 2 * R + 20] }}
                  transition={{ duration: 2.4 + (i % 4) * 0.5, repeat: Infinity, delay: i * 0.45, ease: "easeIn" }}
                />
              ))}
          </g>
          <circle cx={S / 2} cy={S / 2} r={R} fill={`url(#gl-${id})`} className="dark:opacity-50" />
          <circle cx={S / 2} cy={S / 2} r={R} fill="none" strokeWidth="1.5" className="stroke-[rgba(0,0,0,.08)] dark:stroke-[rgba(255,255,255,.1)]" />
          <ellipse
            cx={S / 2 - 34}
            cy={S / 2 - 52}
            rx="26"
            ry="10"
            fill="#fff"
            fillOpacity=".6"
            className="dark:opacity-60"
            transform={`rotate(-28 ${S / 2 - 34} ${S / 2 - 52})`}
          />
        </svg>
      </div>
      <div className="flex flex-col items-center gap-1" aria-live="polite">
        <span className="text-[15px] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">
          {used} {unit} of {cap} {unit} used
        </span>
        <span className={`text-[12px] ${warn ? "text-[#c2410c] dark:text-[#ff9f0a]" : "text-[#86868b] dark:text-[#98989d]"}`}>
          {warn ? "Almost full. Time for a clean-up." : "Plenty of room left."}
        </span>
      </div>
      <div
        className="flex gap-2"
        onPointerDown={() => {
          touched.current = true;
        }}
      >
        <motion.button
          type="button"
          whileTap={{ scale: 0.94 }}
          onClick={() => press(-40)}
          className="h-9 rounded-full bg-[#f0f0f3] px-4 text-[13px] font-medium text-[#1d1d1f] outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] dark:bg-[#2c2c2e] dark:text-[#f5f5f7] dark:focus-visible:ring-[#0a84ff]"
        >
          Clean up
        </motion.button>
        <motion.button
          type="button"
          whileTap={{ scale: 0.94 }}
          onClick={() => press(30)}
          className="h-9 rounded-full bg-[#1d1d1f] px-4 text-[13px] font-medium text-white outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] focus-visible:ring-offset-2 dark:bg-[#f5f5f7] dark:text-[#1d1d1f] dark:focus-visible:ring-[#0a84ff] dark:focus-visible:ring-offset-[#1c1c1e]"
        >
          Add files
        </motion.button>
      </div>
    </div>
  );
}
```
