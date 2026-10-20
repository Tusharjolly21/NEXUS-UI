"use client";
import { useEffect, useRef, useState, type PointerEvent as RPointerEvent } from "react";
import { animate, motion, useMotionValue, useReducedMotion, type AnimationPlaybackControls } from "framer-motion";

export interface BoltSetting {
  id: string;
  label: string;
  min: number;
  max: number;
  /** Appended to the read-out, e.g. "%" or " EV". */
  unit: string;
  /** Starting value. */
  value: number;
}

export const DEFAULT_BOLT_SETTINGS: BoltSetting[] = [
  { id: "exp", label: "Exposure", min: -2, max: 2, unit: " EV", value: 0.4 },
  { id: "bloom", label: "Bloom", min: 0, max: 100, unit: "%", value: 35 },
  { id: "fov", label: "Field of view", min: 30, max: 110, unit: "°", value: 72 },
  { id: "samples", label: "Samples", min: 8, max: 256, unit: "", value: 64 },
];

export interface BoltingSlidersProps {
  /** The sliders to show. */
  settings?: BoltSetting[];
  /** Small caps heading above the sliders. */
  title?: string;
  /** Hint line under the sliders. */
  hint?: string;
  /** Fill, trail and focus-ring colour. */
  accent?: string;
  /** Throws a random knob every 1.1s until someone touches the panel. */
  autoplay?: boolean;
}

/** Track width in px. */
const TW = 300;

function fmt(s: BoltSetting, v: number) {
  const n = s.max - s.min <= 4 ? v.toFixed(1) : Math.round(v).toString();
  return `${v > 0 && s.min < 0 ? "+" : ""}${n}${s.unit}`;
}

/**
 * Click anywhere on a track and the knob doesn't slide there: it leaps in a
 * ballistic arc, leaving a dotted trail and still reading out its value, then
 * lands in the groove with a squash. Dragging the knob works as usual.
 */
function BoltSlider({
  s,
  accent,
  reduce,
  register,
}: {
  s: BoltSetting;
  accent: string;
  reduce: boolean;
  /** Hands the parent a way to throw this knob to a value (used by autoplay). */
  register: (leapTo: (v: number) => void) => void;
}) {
  const span = s.max - s.min;
  const toX = (v: number) => ((v - s.min) / span) * TW;
  const fromX = (px: number) => s.min + (px / TW) * span;
  const [value, setValue] = useState(s.value);
  const x = useMotionValue(toX(s.value));
  const y = useMotionValue(0);
  const sq = useMotionValue(1);
  const [trail, setTrail] = useState<{ x: number; y: number; id: number }[]>([]);
  const track = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const tid = useRef(0);
  const flight = useRef<AnimationPlaybackControls | null>(null);
  const clearTrail = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(
    () => () => {
      flight.current?.stop();
      clearTimeout(clearTrail.current);
    },
    [],
  );

  const leap = (tx: number) => {
    flight.current?.stop();
    const x0 = x.get();
    const y0 = y.get();
    if (reduce) {
      x.set(tx);
      y.set(0);
      setValue(fromX(tx));
      return;
    }
    const dist = Math.abs(tx - x0);
    const peak = -Math.min(90, 30 + dist * 0.45);
    const dur = 0.35 + Math.min(0.45, dist / 600);
    const pts: { x: number; y: number; id: number }[] = [];
    flight.current = animate(0, 1, {
      duration: dur,
      ease: "linear",
      onUpdate: (t) => {
        const cx = x0 + (tx - x0) * t;
        // parabola through (0, y0) and (1, 0) peaking near `peak`
        const cy = y0 * (1 - t) + 4 * peak * t * (1 - t);
        x.set(cx);
        y.set(cy);
        setValue(fromX(cx));
        const last = pts[pts.length - 1];
        if (!last || Math.hypot(cx - last.x, cy - last.y) > 9) {
          pts.push({ x: cx, y: cy, id: tid.current++ });
          setTrail([...pts]);
        }
      },
      onComplete: () => {
        animate(sq, [0.6, 1.15, 1], { duration: 0.35 });
        clearTimeout(clearTrail.current);
        clearTrail.current = setTimeout(() => setTrail([]), 500);
      },
    });
  };

  useEffect(() => {
    register((v) => leap(toX(v)));
  });

  const fromEvent = (e: RPointerEvent) => {
    const r = track.current!.getBoundingClientRect();
    return Math.max(0, Math.min(TW, ((e.clientX - r.left) / r.width) * TW));
  };

  return (
    <div className="flex w-[300px] flex-col gap-2">
      <div className="flex justify-between text-[13px]">
        <span className="font-medium text-[#1d1d1f] dark:text-[#f5f5f7]">{s.label}</span>
        <span className="tabular-nums text-[#6e6e73] dark:text-[#a1a1a6]">{fmt(s, value)}</span>
      </div>
      <div
        ref={track}
        className="relative h-6 cursor-pointer touch-none"
        onPointerDown={(e) => {
          if ((e.target as HTMLElement).dataset.knob) return;
          leap(fromEvent(e));
        }}
        onPointerMove={(e) => {
          if (!dragging.current) return;
          const nx = fromEvent(e);
          x.set(nx);
          setValue(fromX(nx));
        }}
        onPointerUp={() => {
          dragging.current = false;
        }}
        onPointerCancel={() => {
          dragging.current = false;
        }}
      >
        <span className="absolute inset-x-0 top-1/2 h-[3px] -translate-y-1/2 rounded-full bg-[#e8e8ed] dark:bg-[#3a3a3c]" />
        <motion.span className="absolute left-0 top-1/2 h-[3px] -translate-y-1/2 rounded-full" style={{ width: x, background: accent }} />
        {trail.map((p, i) => (
          <motion.span
            key={p.id}
            className="pointer-events-none absolute left-0 top-1/2 h-1.5 w-1.5 rounded-full"
            style={{ x: p.x - 3, y: p.y - 3, background: accent }}
            initial={{ opacity: 0.9, scale: 1 }}
            animate={{ opacity: 0, scale: 0.4 }}
            transition={{ duration: 0.8, delay: i * 0.01 }}
          />
        ))}
        <motion.button
          type="button"
          data-knob="1"
          role="slider"
          aria-label={s.label}
          aria-valuemin={s.min}
          aria-valuemax={s.max}
          aria-valuenow={Number(value.toFixed(1))}
          aria-valuetext={fmt(s, value)}
          onPointerDown={(e) => {
            flight.current?.stop();
            y.set(0);
            dragging.current = true;
            (e.currentTarget.parentElement as Element).setPointerCapture(e.pointerId);
          }}
          onKeyDown={(e) => {
            const step = span / 20;
            let next: number | null = null;
            if (e.key === "ArrowRight" || e.key === "ArrowUp") next = Math.min(s.max, value + step);
            if (e.key === "ArrowLeft" || e.key === "ArrowDown") next = Math.max(s.min, value - step);
            if (e.key === "Home") next = s.min;
            if (e.key === "End") next = s.max;
            if (next === null) return;
            e.preventDefault();
            leap(toX(next));
          }}
          className="absolute left-0 top-1/2 h-[18px] w-[18px] cursor-grab rounded-full bg-white shadow-[0_2px_8px_rgba(0,0,0,.25),0_0_0_.5px_rgba(0,0,0,.1)] outline-none focus-visible:ring-2 focus-visible:ring-offset-2 active:cursor-grabbing dark:shadow-[0_2px_8px_rgba(0,0,0,.6),0_0_0_.5px_rgba(0,0,0,.4)] dark:focus-visible:ring-offset-[#1c1c1e]"
          style={{ x, y, scaleY: sq, marginLeft: -9, marginTop: -9, originY: 1, ["--tw-ring-color" as string]: accent }}
        />
      </div>
    </div>
  );
}

export function BoltingSliders({
  settings = DEFAULT_BOLT_SETTINGS,
  title = "Render settings",
  hint = "Click a track and watch the knob jump.",
  accent = "#0071e3",
  autoplay = false,
}: BoltingSlidersProps) {
  const reduce = useReducedMotion() ?? false;
  const leapers = useRef<((v: number) => void)[]>([]);
  const touched = useRef(false);

  useEffect(() => {
    if (!autoplay || settings.length === 0) return;
    let k = 0;
    const t = setInterval(() => {
      if (touched.current) return clearInterval(t);
      const i = k++ % settings.length;
      const s = settings[i];
      leapers.current[i]?.(s.min + Math.random() * (s.max - s.min));
    }, 1100);
    return () => clearInterval(t);
  }, [autoplay, settings]);

  return (
    <div
      className="flex flex-col gap-5 rounded-[24px] bg-white px-7 py-6 shadow-[0_0_0_1px_rgba(0,0,0,.05),0_20px_40px_-26px_rgba(0,0,0,.35)] dark:bg-[#1c1c1e] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08),0_20px_40px_-26px_rgba(0,0,0,.8)]"
      onPointerDown={() => {
        touched.current = true;
      }}
      onKeyDown={() => {
        touched.current = true;
      }}
    >
      <span className="text-[12px] font-semibold uppercase tracking-[0.1em] text-[#86868b] dark:text-[#8e8e93]">{title}</span>
      {settings.map((s, i) => (
        <BoltSlider
          key={s.id}
          s={s}
          accent={accent}
          reduce={reduce}
          register={(fn) => {
            leapers.current[i] = fn;
          }}
        />
      ))}
      <span className="text-[12px] text-[#86868b] dark:text-[#8e8e93]">{hint}</span>
    </div>
  );
}
