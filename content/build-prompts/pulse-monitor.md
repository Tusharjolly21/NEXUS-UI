# Pulse Monitor

Add the "Pulse Monitor" component from Nexus UI to my project.

A heart-rate card with a bedside-monitor ECG trace that sweeps and erases as it goes, a heart that beats on every spike and 24 hourly range bars you can scrub. Start a workout and the rate climbs, the beats close up and the colour warms.

Please:

1. Create the files below at sensible paths for this project, keeping each file's name. They import each other with relative paths, so keep them together.
2. Install what it needs: `framer-motion` (use this project's package manager).
3. It is styled with Tailwind CSS classes, so the project needs Tailwind.
4. Use it like this: `import { PulseMonitor } from "@/components/pulse-monitor";`. The props are typed and documented in the code.

Copy the code exactly as it is. Do not restyle, simplify or rename anything, and keep the comments: they explain why the numbers are what they are. The only thing to adapt is import paths, if this project uses a different alias than `@/`.

--- components/pulse-monitor/index.ts ---

```ts
export { PulseMonitor } from "./pulse-monitor";
export type { PulseMonitorProps, HourRange } from "./pulse-monitor";
```

--- components/pulse-monitor/pulse-monitor.tsx ---

```tsx
"use client";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as RKeyboardEvent,
  type PointerEvent as RPointerEvent,
} from "react";
import { AnimatePresence, animate, motion, useMotionValue, useReducedMotion } from "framer-motion";

export interface PulseMonitorProps {
  /** Resting heart rate. Also seeds the day's hourly ranges; a workout climbs to max(bpm + 50, 120). */
  bpm?: number;
  /** Colour of the trace, heart and range bars at rest. */
  color?: string;
  /** Colour everything warms to (and the button fills with) during a workout. */
  workoutColor?: string;
  /** Toggles a workout every ~10s and sweeps the hour readout along the bars until someone interacts. */
  autoplay?: boolean;
}

/** Low and high heart rate for one hour of the day, in BPM. */
export interface HourRange {
  lo: number;
  hi: number;
}

/** Canvas size in CSS px; it is scaled to the card width. */
const CW = 340;
const CH = 92;

/** ECG shape for one beat, phase 0..1 → height -1..1 (P, QRS, T). */
function ecg(p: number) {
  const g = (c: number, w: number, a: number) => a * Math.exp(-(((p - c) / w) ** 2));
  return g(0.12, 0.035, 0.12) + g(0.27, 0.012, -0.14) + g(0.3, 0.014, 1) + g(0.335, 0.014, -0.28) + g(0.55, 0.06, 0.22);
}

/** Deterministic 24-hour day around a resting rate: lower overnight, spikes at 8:00, 13:00 and 18:00. */
function hourly(rest: number): HourRange[] {
  let s = 5;
  const r = () => (s = (s * 9301 + 49297) % 233280) / 233280;
  return Array.from({ length: 24 }, (_, h) => {
    const sleep = h < 6 ? -12 : h > 22 ? -8 : 0;
    const active = h === 8 || h === 18 ? 34 : h === 13 ? 14 : 0;
    const mid = rest + sleep + active * 0.6 + (r() - 0.5) * 8;
    return { lo: Math.round(mid - 6 - r() * 6), hi: Math.round(mid + 6 + active * 0.5 + r() * 8) };
  });
}

const pad = (h: number) => `${String(h).padStart(2, "0")}:00`;

/**
 * A heart-rate card with a monitor trace. The ECG sweeps across like a
 * bedside monitor, erasing as it goes, and the heart beats on every spike.
 * Start a workout and the rate climbs, the beats close up and the colour
 * warms. Run along the day's range bars (or use the arrow keys) to read any hour.
 */
export function PulseMonitor({ bpm = 68, color = "#ff375f", workoutColor = "#ff9f0a", autoplay = false }: PulseMonitorProps) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const bars = useRef<HTMLDivElement>(null);
  const [workout, setWorkout] = useState(false);
  const [shown, setShown] = useState(bpm);
  const [hour, setHour] = useState<number | null>(null);
  const heart = useMotionValue(1);
  const reduced = useReducedMotion() === true;
  const still = useRef(reduced);
  const touched = useRef(false);
  const target = useRef(bpm);
  const live = useRef(bpm);
  const tone = workout ? workoutColor : color;
  const toneRef = useRef(tone);
  const day = useMemo(() => hourly(bpm), [bpm]);
  const peak = Math.max(...day.map((d) => d.hi));
  const min = Math.min(...day.map((d) => d.lo));

  useEffect(() => {
    toneRef.current = tone;
  }, [tone]);
  useEffect(() => {
    still.current = reduced;
  }, [reduced]);
  useEffect(() => {
    target.current = workout ? Math.max(bpm + 50, 120) : bpm;
  }, [workout, bpm]);

  // The trace is drawn straight onto the canvas every frame; React only re-renders for the number.
  useEffect(() => {
    const c = canvas.current;
    if (!c) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    c.width = CW * dpr;
    c.height = CH * dpr;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    ctx.scale(dpr, dpr);
    const speed = 95; // px per second
    let x = 0;
    let phase = 0;
    let lastY = CH / 2;
    let prev = performance.now();
    let raf = 0;
    let beatSeen = false;
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      const dt = Math.min(0.05, (now - prev) / 1000);
      prev = now;
      live.current += (target.current - live.current) * Math.min(1, dt * 0.9);
      const steps = Math.max(1, Math.round(dt * speed));
      for (let k = 0; k < steps; k++) {
        const sdt = dt / steps;
        phase += (sdt * live.current) / 60;
        if (phase >= 1) {
          phase -= 1;
          beatSeen = false;
        }
        if (!beatSeen && phase > 0.3) {
          beatSeen = true;
          if (!still.current) animate(heart, [1, 1.28, 0.94, 1], { duration: 0.42, times: [0, 0.25, 0.6, 1] });
          setShown(Math.round(live.current + (Math.random() - 0.5) * 2));
        }
        const nx = x + speed * sdt;
        const y = CH / 2 + 6 - ecg(phase) * (CH * 0.42);
        // erase a band ahead of the pen, like a bedside monitor
        ctx.clearRect(nx, 0, 18, CH);
        if (nx + 18 > CW) ctx.clearRect(0, 0, nx + 18 - CW, CH);
        ctx.strokeStyle = toneRef.current;
        ctx.lineWidth = 2;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.beginPath();
        ctx.moveTo(x, lastY);
        ctx.lineTo(nx, y);
        ctx.stroke();
        x = nx;
        lastY = y;
        if (x >= CW) x = 0;
      }
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [heart]);

  useEffect(() => {
    if (!autoplay) return;
    let k = 0;
    let sweep: ReturnType<typeof setInterval> | undefined;
    const id = setInterval(() => {
      if (touched.current) {
        clearInterval(id);
        return;
      }
      k++;
      if (k % 2 === 1) setWorkout((w) => !w);
      let h = 0;
      clearInterval(sweep);
      sweep = setInterval(() => {
        if (touched.current) {
          clearInterval(sweep);
          return;
        }
        if (h > 23) {
          clearInterval(sweep);
          setHour(null);
          return;
        }
        setHour(h++);
      }, 70);
    }, 5200);
    return () => {
      clearInterval(id);
      clearInterval(sweep);
    };
  }, [autoplay]);

  const pickHour = (e: RPointerEvent<HTMLDivElement>) => {
    touched.current = true;
    const el = bars.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setHour(Math.max(0, Math.min(23, Math.floor(((e.clientX - r.left) / r.width) * 24))));
  };

  const onKey = (e: RKeyboardEvent<HTMLDivElement>) => {
    let next: number | null | undefined;
    if (e.key === "ArrowRight" || e.key === "ArrowUp") next = hour === null ? 0 : Math.min(23, hour + 1);
    else if (e.key === "ArrowLeft" || e.key === "ArrowDown") next = hour === null ? 23 : Math.max(0, hour - 1);
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = 23;
    else if (e.key === "Escape") next = null;
    if (next === undefined) return;
    e.preventDefault();
    touched.current = true;
    setHour(next);
  };

  const range = (v: number) => ((v - (min - 4)) / (peak + 4 - (min - 4))) * 100;
  const h = hour === null ? null : day[hour];
  const readout = h && hour !== null ? `${pad(hour)}, ${h.lo} to ${h.hi} BPM` : `Today, ${min} to ${peak} BPM`;

  return (
    <div
      className="w-[380px] max-w-full rounded-[24px] bg-white p-5 shadow-[0_0_0_1px_rgba(0,0,0,.05),0_20px_40px_-26px_rgba(0,0,0,.35)] transition-colors duration-300 [--pm-grid:rgba(0,0,0,.06)] dark:bg-[#1c1c1e] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08),0_20px_40px_-26px_rgba(0,0,0,.8)] dark:[--pm-grid:rgba(255,255,255,.07)]"
      onPointerDown={() => {
        touched.current = true;
      }}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <motion.svg width="20" height="20" viewBox="0 0 24 24" style={{ scale: heart }} aria-hidden="true">
            <motion.path
              d="M12 21s-7.5-4.6-9.6-9.3C.9 8.3 3 4.5 6.7 4.5c2.1 0 3.6 1.1 5.3 3 1.7-1.9 3.2-3 5.3-3 3.7 0 5.8 3.8 4.3 7.2C19.5 16.4 12 21 12 21z"
              initial={false}
              animate={{ fill: tone }}
              transition={{ duration: 0.6 }}
            />
          </motion.svg>
          <span className="text-[14px] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">Heart rate</span>
        </div>
        <motion.button
          type="button"
          onClick={() => {
            touched.current = true;
            setWorkout((w) => !w);
          }}
          whileTap={{ scale: 0.94 }}
          aria-pressed={workout}
          className="relative h-7 overflow-hidden rounded-full bg-[#f0f0f3] px-3 text-[12px] font-semibold outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] dark:bg-[#2c2c2e] dark:focus-visible:ring-[#0a84ff]"
        >
          <motion.span
            aria-hidden="true"
            className="absolute inset-0 rounded-full"
            style={{ background: workoutColor }}
            initial={false}
            animate={{ opacity: workout ? 1 : 0 }}
            transition={{ duration: 0.3 }}
          />
          <span className={`relative transition-colors duration-300 ${workout ? "text-[#1d1d1f]" : "text-[#1d1d1f] dark:text-[#f5f5f7]"}`}>
            {workout ? "End workout" : "Start workout"}
          </span>
        </motion.button>
      </div>

      <div className="mt-2 flex items-baseline gap-1.5">
        <span className="relative inline-flex h-[44px] overflow-hidden text-[44px] font-semibold leading-none tracking-[-0.04em] text-[#1d1d1f] tabular-nums dark:text-[#f5f5f7]">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={shown}
              initial={reduced ? { opacity: 0 } : { y: "60%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={reduced ? { opacity: 0 } : { y: "-60%", opacity: 0 }}
              transition={{ type: "spring", stiffness: 420, damping: 30 }}
            >
              {shown}
            </motion.span>
          </AnimatePresence>
        </span>
        <span className="text-[14px] font-medium text-[#6e6e73] dark:text-[#98989d]">BPM</span>
      </div>
      <div className="flex gap-4 text-[11px] font-medium uppercase tracking-[0.06em] text-[#6e6e73] tabular-nums dark:text-[#98989d]">
        <span>Peak {peak}</span>
        <span>Min {min}</span>
      </div>

      <canvas
        ref={canvas}
        className="mt-3 block h-auto w-full rounded-[10px]"
        style={{
          aspectRatio: `${CW} / ${CH}`,
          backgroundImage: "linear-gradient(var(--pm-grid) 1px, transparent 1px), linear-gradient(90deg, var(--pm-grid) 1px, transparent 1px)",
          backgroundSize: "17px 17px",
          backgroundPosition: "-1px -1px",
        }}
        aria-hidden="true"
      />

      <div className="mt-4 flex items-center justify-between text-[11px] text-[#6e6e73] dark:text-[#98989d]" aria-hidden="true">
        <span>{h && hour !== null ? pad(hour) : "Today"}</span>
        <span className={`tabular-nums ${h ? "text-[#1d1d1f] dark:text-[#f5f5f7]" : ""}`}>{h ? `${h.lo}–${h.hi} BPM` : `${min}–${peak} BPM`}</span>
      </div>
      <p className="sr-only" aria-live="polite">
        {readout}
      </p>
      <div
        ref={bars}
        className="relative mt-2 flex h-[70px] cursor-crosshair touch-none items-stretch gap-[3px] rounded-[6px] outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] focus-visible:ring-offset-4 focus-visible:ring-offset-white dark:focus-visible:ring-[#0a84ff] dark:focus-visible:ring-offset-[#1c1c1e]"
        onPointerMove={pickHour}
        onPointerDown={pickHour}
        onPointerLeave={() => setHour(null)}
        onKeyDown={onKey}
        onBlur={() => setHour(null)}
        tabIndex={0}
        role="slider"
        aria-label={`Hourly heart rate today, ${min} to ${peak} BPM. Use the arrow keys to read each hour.`}
        aria-valuemin={0}
        aria-valuemax={23}
        aria-valuenow={hour ?? 0}
        aria-valuetext={readout}
      >
        {day.map((d, i) => (
          <div key={i} className="relative flex-1 rounded-full bg-[#f0f0f3] dark:bg-[#2c2c2e]">
            <motion.div
              className="absolute inset-x-0 rounded-full"
              initial={{ bottom: "50%", top: "50%" }}
              animate={{ bottom: `${range(d.lo)}%`, top: `${100 - range(d.hi)}%`, opacity: hour === null || hour === i ? 1 : 0.35, scaleX: hour === i ? 1.35 : 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 26, delay: hour === null ? i * 0.015 : 0 }}
              style={{ background: tone }}
            />
          </div>
        ))}
      </div>
      <div className="mt-1.5 flex justify-between text-[10px] text-[#6e6e73] tabular-nums dark:text-[#98989d]" aria-hidden="true">
        <span>12 AM</span>
        <span>6</span>
        <span>12 PM</span>
        <span>6</span>
        <span>11</span>
      </div>
    </div>
  );
}
```
