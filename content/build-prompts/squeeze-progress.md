Add the "Squeeze Progress" component from Nexus UI to my project.

A full-panel progress line with a big percentage. Pause it and the tip bunches into a springy squiggle while the panel warms from blue to orange; resume and it stretches back out and carries on.

Please:

1. Create the files below at sensible paths for this project, keeping each file's name. They import each other with relative paths, so keep them together.
2. Install what it needs: `framer-motion` (use this project's package manager).
3. It is styled with Tailwind CSS classes, so the project needs Tailwind.
4. Use it like this: `import { SqueezeProgress } from "@/components/squeeze-progress";`. The props are typed and documented in the code.

Copy the code exactly as it is. Do not restyle, simplify or rename anything, and keep the comments: they explain why the numbers are what they are. The only thing to adapt is import paths, if this project uses a different alias than `@/`.

--- components/squeeze-progress/index.ts ---

```ts
export { SqueezeProgress } from "./squeeze-progress";
export type { SqueezeProgressProps } from "./squeeze-progress";
```

--- components/squeeze-progress/squeeze-progress.tsx ---

```tsx
"use client";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useMotionValue, useMotionValueEvent, useSpring, useTransform } from "framer-motion";

const W = 440;
const H = 260;
const Y = 130;

export interface SqueezeProgressProps {
  /** Panel colour while running. */
  accent?: string;
  /** Panel colour while paused. */
  paused?: string;
  /** Toggles pause and resume every 2.2s until someone presses the button. */
  autoplay?: boolean;
}

/**
 * A progress line across a full panel. Pause and the tip bunches up into a
 * springy squiggle while the panel turns warm; resume and the squiggle
 * stretches back out and the line carries on.
 */
export function SqueezeProgress({ accent = "#0071e3", paused: pausedColor = "#c2410c", autoplay = false }: SqueezeProgressProps) {
  const [running, setRunning] = useState(true);
  const progress = useMotionValue(0.08);
  const squeeze = useSpring(0, { stiffness: 260, damping: 11 });
  const [pct, setPct] = useState(8);
  const touched = useRef(false);
  useMotionValueEvent(progress, "change", (v) => setPct(Math.floor(v * 100)));

  useEffect(() => {
    let raf = 0, last = performance.now();
    const tick = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      if (running) {
        const v = progress.get() + dt * 0.06;
        progress.set(v >= 1 ? 0 : v);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [running, progress]);

  useEffect(() => { squeeze.set(running ? 0 : 1); }, [running, squeeze]);

  useEffect(() => {
    if (!autoplay) return;
    const t = setInterval(() => {
      if (!touched.current) setRunning((r) => !r);
    }, 2200);
    return () => clearInterval(t);
  }, [autoplay]);

  const path = useTransform(() => {
    const p = progress.get(), s = squeeze.get();
    const tip = 24 + p * (W - 48);
    const L = 70; // length of line that bunches
    const start = Math.max(24, tip - L);
    const bunchedTip = tip - s * 34; // tip pulls back while compressed
    let d = `M 24 ${Y} L ${start.toFixed(1)} ${Y}`;
    const n = 40;
    for (let i = 1; i <= n; i++) {
      const t = i / n;
      const x = start + (bunchedTip - start) * t;
      const env = Math.sin(Math.PI * t);
      const y = Y + Math.sin(t * Math.PI * 9) * 16 * s * env;
      d += ` L ${x.toFixed(1)} ${y.toFixed(1)}`;
    }
    return d;
  });
  const bg = useTransform(squeeze, [0, 1], [accent, pausedColor]);
  const dotX = useTransform(() => 24 + progress.get() * (W - 48) - squeeze.get() * 34);

  return (
    <div className="flex flex-col items-center gap-4">
      <motion.div className="relative overflow-hidden rounded-[24px]" style={{ width: W, height: H, maxWidth: "100%", background: bg }}>
        <div
          role="progressbar"
          aria-label={running ? "Exporting video" : "Export paused"}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={pct}
          className="absolute inset-x-0 top-10 flex justify-center text-[44px] font-semibold tabular-nums tracking-[-0.03em] text-white"
        >
          {pct}
          <span className="mt-2 text-[22px] opacity-70">%</span>
        </div>
        <svg className="absolute inset-0" width={W} height={H} aria-hidden="true">
          <line x1={24} y1={Y} x2={W - 24} y2={Y} stroke="rgba(255,255,255,.22)" strokeWidth={4} strokeLinecap="round" />
          <motion.path d={path} fill="none" stroke="#fff" strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" />
          <motion.circle cx={dotX} cy={Y} r={6} fill="#fff" />
        </svg>
        <div className="absolute inset-x-0 bottom-8 flex flex-col items-center gap-2">
          <motion.button
            type="button"
            whileTap={{ scale: 0.88 }}
            onClick={() => { touched.current = true; setRunning((r) => !r); }}
            aria-label={running ? "Pause" : "Resume"}
            className="flex h-12 w-12 items-center justify-center rounded-full text-white ring-2 ring-white/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
          >
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.svg key={String(running)} initial={{ scale: 0.4, rotate: -60, opacity: 0 }} animate={{ scale: 1, rotate: 0, opacity: 1 }} exit={{ scale: 0.4, rotate: 60, opacity: 0 }} width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                {running ? <path d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z" /> : <path d="M7 4.5v15l12.5-7.5z" />}
              </motion.svg>
            </AnimatePresence>
          </motion.button>
          <span className="text-[13px] font-medium text-white/85">{running ? "Exporting video" : "Paused"}</span>
        </div>
      </motion.div>
    </div>
  );
}
```
