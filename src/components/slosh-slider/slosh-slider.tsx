"use client";
import { useEffect, useId, useRef, useState, type KeyboardEvent, type PointerEvent as RPointerEvent } from "react";
import { animate, motion, useMotionValue, useMotionValueEvent, useSpring, useTransform, useVelocity, type MotionValue } from "framer-motion";
import { useSound } from "@/lib/ui-sounds";

export interface SloshSliderProps {
  /** Label above the track; also the slider's accessible name. */
  label?: string;
  /** Starting value, 0–100. */
  defaultValue?: number;
  /** Liquid colour (and focus ring). */
  accent?: string;
  /** Called with the rounded value (0–100) as it changes. */
  onChange?: (value: number) => void;
  /** Throws the handle to a series of values until someone touches it. */
  autoplay?: boolean;
  /** Plays interface sounds on interaction. They follow the site-wide sound switch and stay silent in autoplay. */
  enableSound?: boolean;
}

/** Track size in px. */
const W = 300;
const H = 46;

/**
 * A slider whose value has mass. The handle is rigid and stays exactly under
 * your finger; the liquid fill behind it lags, leans with the speed you drag
 * at and sloshes back and forth before it settles.
 */
export function SloshSlider({ label = "Volume", defaultValue = 55, accent = "#0071e3", onChange, autoplay = false, enableSound = true }: SloshSliderProps) {
  const play = useSound(enableSound);
  const start = Math.max(0, Math.min(100, defaultValue));
  const hx = useMotionValue((start / 100) * W);
  // The liquid level follows the handle on a soft, under-damped spring...
  const level = useSpring(hx, { stiffness: 70, damping: 7, mass: 1.2 });
  const vel = useVelocity(level);
  // ...and its surface leans with the level's speed (clamped to ±26px), on its own wobbly spring.
  const lean = useTransform(vel, (v) => Math.max(-26, Math.min(26, v * 0.05)));
  const tilt = useSpring(lean, { stiffness: 160, damping: 9 });
  const d = useTransform([level, tilt] as MotionValue<number>[], ([l, t]: number[]) => {
    const top = Math.max(0, Math.min(W, l + t));
    const bot = Math.max(0, Math.min(W, l - t));
    return `M0 0 H${top} C ${top} ${H * 0.35}, ${bot} ${H * 0.65}, ${bot} ${H} H0 Z`;
  });
  const [val, setVal] = useState(Math.round(start));
  const gid = `slosh-fill-${useId().replace(/:/g, "")}`;
  const drag = useRef(false);
  const touched = useRef(false);
  const ref = useRef<HTMLDivElement>(null);
  const changeRef = useRef(onChange);
  const last = useRef(Math.round(start));
  // Ticks come every 5%, not every percent, and never faster than every 40 ms.
  const lastDetent = useRef(Math.floor(Math.round(start) / 5));
  const lastTick = useRef(0);

  useEffect(() => {
    changeRef.current = onChange;
  }, [onChange]);

  useMotionValueEvent(hx, "change", (x) => {
    const v = Math.round((x / W) * 100);
    const detent = Math.floor(v / 5);
    if (detent !== lastDetent.current) {
      lastDetent.current = detent;
      const now = performance.now();
      // touched is set by the first pointer or key input, so autoplay stays silent.
      if (touched.current && now - lastTick.current >= 40) {
        lastTick.current = now;
        play("tick", 0.4);
      }
    }
    if (v === last.current) return;
    last.current = v;
    setVal(v);
    changeRef.current?.(v);
  });

  useEffect(() => {
    if (!autoplay) return;
    const seq = [0.92, 0.18, 0.7, 0.35, 0.86];
    let k = 0;
    const t = setInterval(() => {
      if (touched.current) {
        clearInterval(t);
        return;
      }
      animate(hx, seq[k++ % seq.length] * W, { duration: 0.35, ease: [0.3, 0, 0.2, 1] });
    }, 1700);
    return () => clearInterval(t);
  }, [autoplay, hx]);

  const set = (e: RPointerEvent) => {
    const el = ref.current;
    if (!el) return;
    hx.stop();
    const r = el.getBoundingClientRect();
    hx.set(Math.max(0, Math.min(W, ((e.clientX - r.left) / r.width) * W)));
  };

  const key = (e: KeyboardEvent) => {
    const step = W / 20;
    let to: number | null = null;
    if (e.key === "ArrowRight" || e.key === "ArrowUp") to = Math.min(W, hx.get() + step);
    if (e.key === "ArrowLeft" || e.key === "ArrowDown") to = Math.max(0, hx.get() - step);
    if (e.key === "Home") to = 0;
    if (e.key === "End") to = W;
    if (to === null) return;
    touched.current = true;
    animate(hx, to, { duration: 0.2 });
    e.preventDefault();
  };

  return (
    <div className="flex w-[300px] flex-col gap-3">
      <div className="flex items-baseline justify-between">
        <span className="text-[15px] font-medium text-[#1d1d1f] dark:text-[#f5f5f7]">{label}</span>
        <span className="text-[22px] font-semibold tabular-nums tracking-[-0.02em] text-[#1d1d1f] dark:text-[#f5f5f7]">
          {val}
          <span className="text-[13px] text-[#86868b] dark:text-[#98989d]">%</span>
        </span>
      </div>
      <div
        ref={ref}
        role="slider"
        tabIndex={0}
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={val}
        aria-valuetext={`${val}%`}
        onKeyDown={key}
        onPointerDown={(e) => {
          touched.current = true;
          drag.current = true;
          e.currentTarget.setPointerCapture(e.pointerId);
          set(e);
        }}
        onPointerMove={(e) => {
          if (drag.current) set(e);
        }}
        onPointerUp={() => {
          drag.current = false;
        }}
        onPointerCancel={() => {
          drag.current = false;
        }}
        className="relative cursor-pointer touch-none overflow-hidden rounded-[14px] bg-[#f0f0f3] outline-none focus-visible:ring-2 focus-visible:ring-[var(--slosh-accent)] focus-visible:ring-offset-2 dark:bg-[#2c2c2e] dark:focus-visible:ring-offset-black"
        style={{ width: W, height: H, ["--slosh-accent" as string]: accent }}
      >
        <svg className="absolute inset-0" width={W} height={H} aria-hidden="true">
          <defs>
            <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor={accent} stopOpacity=".75" />
              <stop offset="1" stopColor={accent} />
            </linearGradient>
          </defs>
          <motion.path d={d} fill={`url(#${gid})`} />
        </svg>
        <motion.span
          className="pointer-events-none absolute top-1/2 h-[30px] w-[4px] rounded-full bg-white shadow-[0_0_0_1px_rgba(0,0,0,.15),0_2px_6px_rgba(0,0,0,.25)]"
          style={{ left: hx, x: "-50%", y: "-50%" }}
        />
      </div>
      <span className="text-[12px] text-[#86868b] dark:text-[#98989d]">Drag fast and let go.</span>
    </div>
  );
}
