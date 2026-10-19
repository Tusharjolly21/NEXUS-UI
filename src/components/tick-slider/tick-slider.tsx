"use client";

import * as React from "react";
import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { cn } from "@/lib/utils";

export type TickSliderSize = "sm" | "md" | "lg";

export type TickSliderProps = {
  /** Controlled value. */
  value?: number;
  /** Starting value when uncontrolled. */
  defaultValue?: number;
  /** Called with the snapped value while dragging and on keyboard changes. */
  onChange?: (value: number) => void;
  /** Called once when a drag or key press settles. */
  onCommit?: (value: number) => void;
  min?: number;
  max?: number;
  /** Values snap to multiples of this. */
  step?: number;
  /** How many tick marks the track is drawn with. */
  ticks?: number;
  /** Visible label above the track (also used as the accessible name). */
  label?: string;
  /** Colour of the filled ticks and the readout. Defaults to the current text colour. */
  accent?: string;
  size?: TickSliderSize;
  /** Show the rolling number to the right of the track. */
  showValue?: boolean;
  /** Suffix after the number, e.g. "%". */
  unit?: string;
  /** How much ticks near the pointer grow (0 turns the wave off). */
  magnify?: number;
  disabled?: boolean;
  className?: string;
};

const SIZES: Record<TickSliderSize, { h: number; tick: number; gap: number; text: string }> = {
  sm: { h: 18, tick: 2, gap: 4, text: "text-[13px]" },
  md: { h: 26, tick: 3, gap: 5, text: "text-[15px]" },
  lg: { h: 34, tick: 3, gap: 6, text: "text-[18px]" },
};

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

function decimalsOf(step: number) {
  const s = String(step);
  return s.includes(".") ? s.split(".")[1].length : 0;
}

/* ── Rolling number ─────────────────────────────────────────────── */

function Digit({ digit, reduced }: { digit: number; reduced: boolean }) {
  const y = useSpring(-digit * 10, { stiffness: 260, damping: 26, mass: 0.6 });
  React.useEffect(() => {
    if (reduced) y.jump(-digit * 10);
    else y.set(-digit * 10);
  }, [digit, reduced, y]);
  const top = useTransform(y, (v) => `${v}%`);
  return (
    <span className="relative inline-block h-[1em] w-[0.62em] overflow-hidden leading-none [mask-image:linear-gradient(to_bottom,transparent,#000_14%,#000_86%,transparent)]">
      <motion.span className="absolute inset-x-0 top-0 flex flex-col" style={{ y: top }}>
        {Array.from({ length: 10 }, (_, i) => (
          <span key={i} className="block h-[1em] text-center leading-none">
            {i}
          </span>
        ))}
      </motion.span>
    </span>
  );
}

function RollingNumber({ value, decimals, reduced }: { value: number; decimals: number; reduced: boolean }) {
  const text = Math.abs(value).toFixed(decimals);
  const chars = text.split("");
  return (
    <span className="inline-flex items-center tabular-nums" aria-hidden>
      {value < 0 ? <span className="leading-none">-</span> : null}
      {chars.map((c, i) =>
        c === "." ? (
          <span key={`dot-${i}`} className="leading-none">
            .
          </span>
        ) : (
          // keyed from the right so units stay put when the number gains a digit
          <Digit key={chars.length - i} digit={Number(c)} reduced={reduced} />
        ),
      )}
    </span>
  );
}

/* ── Tick ───────────────────────────────────────────────────────── */

function Tick({
  index,
  count,
  fill,
  pointer,
  height,
  width,
  pitch,
  magnify,
}: {
  index: number;
  count: number;
  fill: MotionValue<number>;
  pointer: MotionValue<number>;
  height: number;
  width: number;
  pitch: number;
  magnify: number;
}) {
  const at = count === 1 ? 0 : index / (count - 1);
  const center = index * pitch + width / 2;
  const opacity = useTransform(fill, (f) => (f >= at - 1e-6 ? 1 : 0.2));
  const boost = useTransform(pointer, (p) => {
    if (p < -999) return 0;
    const d = (p - center) / (pitch * 3.2);
    return Math.exp(-d * d) * magnify;
  });
  const lift = useSpring(boost, { stiffness: 420, damping: 30 });
  const scaleY = useTransform(lift, (b) => 1 + b);
  return (
    <motion.span
      aria-hidden
      className="block shrink-0 origin-center rounded-full bg-current"
      style={{ width, height, opacity, scaleY }}
    />
  );
}

/* ── Slider ─────────────────────────────────────────────────────── */

export function TickSlider({
  value: controlled,
  defaultValue = 50,
  onChange,
  onCommit,
  min = 0,
  max = 100,
  step = 1,
  ticks = 36,
  label,
  accent,
  size = "md",
  showValue = true,
  unit,
  magnify = 0.55,
  disabled = false,
  className,
}: TickSliderProps) {
  const reduced = useReducedMotion() ?? false;
  const [inner, setInner] = React.useState(() => clamp(defaultValue, min, max));
  const value = clamp(controlled ?? inner, min, max);
  const decimals = decimalsOf(step);
  const dims = SIZES[size];
  const count = Math.max(2, Math.round(ticks));
  const trackWidth = count * dims.tick + (count - 1) * dims.gap;
  const pitch = dims.tick + dims.gap;

  const trackRef = React.useRef<HTMLDivElement | null>(null);
  const [dragging, setDragging] = React.useState(false);
  const labelId = React.useId();

  const fraction = (value - min) / (max - min || 1);
  const fill = useMotionValue(fraction);
  const pointer = useMotionValue(-1000);

  // keep the filled ticks in step with the value (spring-settled, unless reduced motion)
  React.useEffect(() => {
    if (reduced) {
      fill.set(fraction);
      return;
    }
    const c = animate(fill, fraction, dragging ? { duration: 0 } : { type: "spring", stiffness: 380, damping: 34 });
    return () => c.stop();
  }, [fraction, dragging, fill, reduced]);

  const snap = React.useCallback(
    (raw: number) => {
      const stepped = Math.round((raw - min) / step) * step + min;
      return Number(clamp(stepped, min, max).toFixed(decimals));
    },
    [min, max, step, decimals],
  );

  const commit = React.useCallback(
    (next: number) => {
      if (controlled === undefined) setInner(next);
      onChange?.(next);
    },
    [controlled, onChange],
  );

  const valueAt = React.useCallback(
    (clientX: number) => {
      const el = trackRef.current;
      if (!el) return value;
      const r = el.getBoundingClientRect();
      const f = clamp((clientX - r.left) / r.width, 0, 1);
      return snap(min + f * (max - min));
    },
    [snap, min, max, value],
  );

  const localX = React.useCallback((clientX: number) => {
    const el = trackRef.current;
    if (!el) return -1000;
    const r = el.getBoundingClientRect();
    const scale = r.width / el.offsetWidth || 1;
    return (clientX - r.left) / scale;
  }, []);

  const latest = React.useRef(value);
  React.useLayoutEffect(() => {
    latest.current = value;
  }, [value]);

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (disabled || e.button > 0) return;
    e.preventDefault();
    // real presses move focus here; scripted demo presses shouldn't light the focus ring
    if (e.isTrusted) trackRef.current?.focus({ preventScroll: true });
    setDragging(true);
    const first = valueAt(e.clientX);
    if (first !== latest.current) commit(first);
    pointer.set(localX(e.clientX));

    const move = (ev: PointerEvent) => {
      pointer.set(localX(ev.clientX));
      const next = valueAt(ev.clientX);
      if (next !== latest.current) {
        latest.current = next;
        commit(next);
      }
    };
    const up = () => {
      setDragging(false);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
      onCommit?.(latest.current);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (disabled) return;
    const big = Math.max(step, (max - min) / 10);
    const map: Record<string, number> = {
      ArrowRight: value + step,
      ArrowUp: value + step,
      ArrowLeft: value - step,
      ArrowDown: value - step,
      PageUp: value + big,
      PageDown: value - big,
      Home: min,
      End: max,
    };
    if (!(e.key in map)) return;
    e.preventDefault();
    const next = snap(map[e.key]);
    if (next !== value) {
      commit(next);
      onCommit?.(next);
    }
  };

  const valueText = `${value.toFixed(decimals)}${unit ?? ""}`;

  return (
    <div
      className={cn("inline-flex flex-col gap-2 text-[#17181a] dark:text-white", disabled && "opacity-50", className)}
      style={accent ? { color: accent } : undefined}
    >
      {label ? (
        <span id={labelId} className="text-[13px] font-medium text-[#73726d] dark:text-[#8e8d88]">
          {label}
        </span>
      ) : null}
      <div className="flex items-center gap-4">
        <div
          ref={trackRef}
          role="slider"
          tabIndex={disabled ? -1 : 0}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={value}
          aria-valuetext={valueText}
          aria-labelledby={label ? labelId : undefined}
          aria-label={label ? undefined : "Value"}
          aria-disabled={disabled || undefined}
          onPointerDown={onPointerDown}
          onPointerMove={(e) => {
            if (!dragging) pointer.set(localX(e.clientX));
          }}
          onPointerLeave={() => {
            if (!dragging) pointer.set(-1000);
          }}
          onKeyDown={onKeyDown}
          className={cn(
            "relative flex cursor-ew-resize touch-none select-none items-center rounded-md py-2 outline-none",
            "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-current/35",
            disabled && "cursor-not-allowed",
          )}
          style={{ width: trackWidth, gap: dims.gap, height: dims.h * 1.9 }}
        >
          {Array.from({ length: count }, (_, i) => (
            <Tick
              key={i}
              index={i}
              count={count}
              fill={fill}
              pointer={pointer}
              height={dims.h}
              width={dims.tick}
              pitch={pitch}
              magnify={reduced ? 0 : magnify}
            />
          ))}
        </div>
        {showValue ? (
          <output
            aria-live="off"
            className={cn("min-w-[3ch] font-medium tabular-nums leading-none", dims.text)}
          >
            <RollingNumber value={value} decimals={decimals} reduced={reduced} />
            {unit ? <span className="ml-0.5 text-[0.8em] text-[#73726d] dark:text-[#8e8d88]">{unit}</span> : null}
          </output>
        ) : null}
      </div>
    </div>
  );
}
