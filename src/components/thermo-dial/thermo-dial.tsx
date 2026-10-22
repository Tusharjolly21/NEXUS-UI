"use client";
import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent as RPointerEvent } from "react";
import { AnimatePresence, animate, motion, useMotionValue, useMotionValueEvent, useSpring, useTransform } from "framer-motion";
import { useSound } from "@/lib/ui-sounds";

/** Rounds SVG coordinates so server and browser maths print the same attribute (no hydration mismatch). */
const r3 = (n: number) => Math.round(n * 1000) / 1000;

export interface ThermoDialProps {
  /** Current room temperature. Sets the marked tick and whether the label reads Heating, Cooling or Holding. */
  room?: number;
  /** Target temperature the dial starts at. */
  defaultValue?: number;
  /** Lowest settable temperature (start of the arc). */
  min?: number;
  /** Highest settable temperature (end of the arc). */
  max?: number;
  /** Increment for dragging and the arrow keys. */
  step?: number;
  /** Called with the new target whenever the user changes it by dragging or with the keyboard. */
  onChange?: (value: number) => void;
  /** Turns the dial to a few set points every 2.4s until someone touches it. */
  autoplay?: boolean;
  /** Plays interface sounds on interaction. They follow the site-wide sound switch and stay silent in autoplay. */
  enableSound?: boolean;
}

/** Dial size in px, and its centre. */
const S = 260;
const C = S / 2;
const SWEEP = 270;
const TICKS = 54;
/** Degrees where the arc begins (bottom-left), measured clockwise from 3 o'clock. */
const START = 135;
/** Autoplay set points, as fractions of the range (24.5°, 17°, 27°, 21° on the default 10–30 dial). */
const DEMO = [0.725, 0.35, 0.85, 0.55];

const mix = (a: number[], b: number[], t: number) => a.map((v, i) => Math.round(v + (b[i] - v) * t));
/** Cool blue → lavender over the first half of the range, amber → red over the second. */
const rgbAt = (k: number) => {
  const q = Math.max(0, Math.min(1, k));
  return q < 0.5 ? mix([10, 132, 255], [191, 160, 255], q * 2) : mix([255, 179, 64], [255, 69, 58], (q - 0.5) * 2);
};
const rgb = (k: number) => {
  const c = rgbAt(k);
  return `rgb(${c[0]},${c[1]},${c[2]})`;
};

/**
 * A thermostat dial. Drag round the ring (or use the arrow keys): ticks light
 * up to the set point, the glow shifts from cool blue to warm orange, the
 * number rolls, and the label says whether it's heating or cooling toward
 * the room's current temperature.
 */
export function ThermoDial({ room = 19.5, defaultValue = 21, min = 10, max = 30, step = 0.5, onChange, autoplay = false, enableSound = true }: ThermoDialProps) {
  const play = useSound(enableSound);
  const lo = Math.min(min, max);
  const hi = Math.max(min, max, lo + step);
  const span = hi - lo;
  // toFixed keeps steps like 0.1 from turning into 21.300000000000001.
  const quantise = (v: number) => Number((Math.round(v / step) * step).toFixed(4));
  const snap = (v: number) => Math.max(lo, Math.min(hi, quantise(v)));
  const initial = snap(defaultValue);
  const set = useMotionValue(initial);
  const smooth = useSpring(set, { stiffness: 220, damping: 26 });
  const [temp, setTemp] = useState(initial);
  useMotionValueEvent(smooth, "change", (v) => setTemp(quantise(v)));
  const knobAngle = useTransform(smooth, (v) => START + ((v - lo) / span) * SWEEP);
  const kx = useTransform(knobAngle, (a) => C + Math.cos((a * Math.PI) / 180) * 104);
  const ky = useTransform(knobAngle, (a) => C + Math.sin((a * Math.PI) / 180) * 104);
  const glow = useTransform(smooth, (v) => {
    const c = rgbAt((v - lo) / span);
    return `radial-gradient(circle, rgba(${c[0]},${c[1]},${c[2]},.33) 0%, transparent 65%)`;
  });
  const ring = useRef<HTMLDivElement>(null);
  const drag = useRef(false);
  const touched = useRef(false);
  const lastTick = useRef(0);

  // commit only runs from pointer and key handlers, so each step the user takes gets one quiet tick.
  const commit = (v: number) => {
    const next = snap(v);
    if (next === set.get()) return;
    const now = performance.now();
    if (now - lastTick.current >= 40) {
      lastTick.current = now;
      play("tick", 0.3);
    }
    set.set(next);
    onChange?.(next);
  };

  const fromPointer = (e: RPointerEvent) => {
    const el = ring.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    let a = (Math.atan2(e.clientY - (r.top + r.height / 2), e.clientX - (r.left + r.width / 2)) * 180) / Math.PI;
    a = (a - START + 360) % 360;
    // In the 90° gap at the bottom, snap to whichever end is nearer.
    if (a > SWEEP) a = a > SWEEP + (360 - SWEEP) / 2 ? 0 : SWEEP;
    commit(lo + (a / SWEEP) * span);
  };

  const key = (e: KeyboardEvent) => {
    let to: number | null = null;
    if (e.key === "ArrowUp" || e.key === "ArrowRight") to = set.get() + step;
    if (e.key === "ArrowDown" || e.key === "ArrowLeft") to = set.get() - step;
    if (e.key === "Home") to = lo;
    if (e.key === "End") to = hi;
    if (to === null) return;
    e.preventDefault();
    touched.current = true;
    set.stop();
    commit(to);
  };

  useEffect(() => {
    if (!autoplay) return;
    let k = 0;
    let run: ReturnType<typeof animate> | undefined;
    const t = setInterval(() => {
      if (touched.current) {
        clearInterval(t);
        return;
      }
      const to = Number((Math.round((lo + DEMO[k++ % DEMO.length] * span) / step) * step).toFixed(4));
      run = animate(set, to, { duration: 1.1, ease: [0.4, 0, 0.2, 1] });
    }, 2400);
    return () => {
      clearInterval(t);
      run?.stop();
    };
  }, [autoplay, set, lo, span, step]);

  const mode = temp > room + 0.4 ? "Heating" : temp < room - 0.4 ? "Cooling" : "Holding";
  const [whole, half] = temp.toFixed(1).split(".");
  const roomTick = Math.round(((room - lo) / span) * (TICKS - 1));

  return (
    <div className="flex flex-col items-center gap-3">
      <div
        ref={ring}
        role="slider"
        tabIndex={0}
        aria-label="Target temperature"
        aria-valuemin={lo}
        aria-valuemax={hi}
        aria-valuenow={temp}
        aria-valuetext={`${temp} degrees, ${mode.toLowerCase()}`}
        onKeyDown={key}
        onPointerDown={(e) => {
          touched.current = true;
          drag.current = true;
          e.currentTarget.setPointerCapture(e.pointerId);
          set.stop();
          fromPointer(e);
        }}
        onPointerMove={(e) => {
          if (drag.current) fromPointer(e);
        }}
        onPointerUp={() => {
          drag.current = false;
        }}
        onPointerCancel={() => {
          drag.current = false;
        }}
        className="relative cursor-pointer touch-none select-none rounded-full outline-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#0071e3] dark:focus-visible:outline-[#0a84ff]"
        style={{ width: S, height: S }}
      >
        <motion.div className="pointer-events-none absolute -inset-6 rounded-full" style={{ background: glow }} />
        <div className="absolute inset-[34px] rounded-full bg-[#1d1d1f] shadow-[inset_0_2px_0_rgba(255,255,255,.12),0_24px_40px_-18px_rgba(0,0,0,.6)] dark:shadow-[inset_0_2px_0_rgba(255,255,255,.12),0_0_0_1px_rgba(255,255,255,.08),0_24px_40px_-18px_rgba(0,0,0,.9)]" />
        <svg className="absolute inset-0" width={S} height={S} aria-hidden="true">
          {Array.from({ length: TICKS }, (_, i) => {
            const a = ((START + (i / (TICKS - 1)) * SWEEP) * Math.PI) / 180;
            const k = i / (TICKS - 1);
            const on = lo + k * span <= temp;
            const big = i === roomTick;
            const r1 = big ? 112 : 116;
            const r2 = 126;
            return (
              <line
                key={i}
                x1={r3(C + Math.cos(a) * r1)}
                y1={r3(C + Math.sin(a) * r1)}
                x2={r3(C + Math.cos(a) * r2)}
                y2={r3(C + Math.sin(a) * r2)}
                strokeWidth={big ? 3 : 2.2}
                strokeLinecap="round"
                className={big ? "stroke-[#1d1d1f] dark:stroke-[#f5f5f7]" : on ? undefined : "stroke-[#d2d2d7] dark:stroke-[#48484a]"}
                style={{ transition: "stroke .15s", stroke: !big && on ? rgb(k) : undefined }}
              />
            );
          })}
        </svg>
        <motion.span
          className="absolute h-[18px] w-[18px] rounded-full bg-white shadow-[0_2px_8px_rgba(0,0,0,.4)]"
          style={{ left: kx, top: ky, x: "-50%", y: "-50%" }}
        />
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-white">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={mode}
              className="text-[11px] font-semibold uppercase tracking-[0.18em]"
              style={{ color: rgb((temp - lo) / span) }}
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
            >
              {mode}
            </motion.span>
          </AnimatePresence>
          <span className="flex items-start text-[54px] font-semibold leading-none tracking-[-0.05em] tabular-nums">
            <span className="relative inline-flex overflow-hidden">
              {/* Re-keyed, not AnimatePresence: the number can change every frame while dragging. */}
              <motion.span key={whole} initial={{ y: "45%", opacity: 0.3 }} animate={{ y: 0, opacity: 1 }} transition={{ type: "spring", stiffness: 520, damping: 32 }}>
                {whole}
              </motion.span>
            </span>
            <span className="mt-1 text-[22px] text-white/70">.{half}°</span>
          </span>
          <span className="text-[11px] text-white/55">Room {room.toFixed(1)}°</span>
        </div>
      </div>
      <span className="text-[13px] text-[#86868b] dark:text-[#98989d]">Drag round the ring.</span>
    </div>
  );
}
