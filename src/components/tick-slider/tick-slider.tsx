"use client";

import * as React from "react";
import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  useVelocity,
  type MotionValue,
} from "framer-motion";
import { cn } from "@/lib/utils";
import { useSound } from "@/lib/ui-sounds";

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
  /** Colour of the filled ticks and the needle. Defaults to system blue. */
  accent?: string;
  size?: TickSliderSize;
  /** Show the rolling number above the track. */
  showValue?: boolean;
  /** Suffix after the number, e.g. "%". */
  unit?: string;
  /** How much ticks near the pointer and the needle grow (0 turns the wave off). */
  magnify?: number;
  /** One-line caption under the track. Pass an empty string to hide it. */
  hint?: string;
  /** Sweeps the needle to a few values until someone touches it. */
  autoplay?: boolean;
  disabled?: boolean;
  /** Plays interface sounds on interaction. They follow the site-wide sound switch and stay silent in autoplay. */
  enableSound?: boolean;
  className?: string;
};

const SIZES: Record<TickSliderSize, { h: number; tick: number; gap: number; text: string }> = {
  sm: { h: 18, tick: 2, gap: 4, text: "text-[22px]" },
  md: { h: 26, tick: 3, gap: 5, text: "text-[30px]" },
  lg: { h: 34, tick: 3, gap: 6, text: "text-[36px]" },
};

/** Autoplay stops, as fractions of the range. */
const DEMO = [0.78, 0.22, 0.6, 0.94, 0.4];

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

function decimalsOf(step: number) {
  const s = String(step);
  return s.includes(".") ? s.split(".")[1].length : 0;
}

/* Rolling number */

function Digit({ digit, reduced }: { digit: number; reduced: boolean }) {
  const y = useSpring(-digit * 10, { stiffness: 300, damping: 22, mass: 0.6 });
  React.useEffect(() => {
    if (reduced) y.jump(-digit * 10);
    else y.set(-digit * 10);
  }, [digit, reduced, y]);
  const top = useTransform(y, (v) => `${v}%`);
  return (
    <span className="relative inline-block h-[1em] w-[0.6em] overflow-hidden leading-none [mask-image:linear-gradient(to_bottom,transparent,#000_16%,#000_84%,transparent)]">
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
  const chars = Math.abs(value).toFixed(decimals).split("");
  return (
    <span className="inline-flex items-center tabular-nums" aria-hidden="true">
      {value < 0 ? <span className="leading-none">-</span> : null}
      {chars.map((c, i) =>
        c === "." ? (
          <span key={`dot-${i}`} className="leading-none">
            .
          </span>
        ) : (
          // keyed from the right so the units stay put when the number gains a digit
          <Digit key={chars.length - i} digit={Number(c)} reduced={reduced} />
        ),
      )}
    </span>
  );
}

/* Tick */

function Tick({
  index,
  count,
  fill,
  pointer,
  needle,
  height,
  width,
  pitch,
  magnify,
}: {
  index: number;
  count: number;
  fill: MotionValue<number>;
  pointer: MotionValue<number>;
  needle: MotionValue<number>;
  height: number;
  width: number;
  pitch: number;
  magnify: number;
}) {
  const at = count === 1 ? 0 : index / (count - 1);
  const center = index * pitch + width / 2;
  const color = useTransform(fill, (f) => (f >= at - 1e-6 ? "var(--tk-on)" : "var(--tk-off)"));
  const boost = useTransform([pointer, needle], ([p, n]: number[]) => {
    const dp = (p - center) / (pitch * 3.4);
    const dn = (n - center) / (pitch * 2.2);
    const fromPointer = p < -999 ? 0 : Math.exp(-dp * dp);
    return Math.max(fromPointer, Math.exp(-dn * dn) * 0.55) * magnify;
  });
  const lift = useSpring(boost, { stiffness: 420, damping: 26 });
  const scaleY = useTransform(lift, (b) => 1 + b);
  return (
    <motion.span
      aria-hidden="true"
      className="block shrink-0 origin-bottom rounded-full"
      style={{ width, height, scaleY, backgroundColor: color }}
    />
  );
}

/**
 * A slider drawn as a row of ticks. Ticks swell in a wave around the pointer
 * and the needle, fill with colour up to the value, and the needle leans
 * into the direction it's moving and swings upright when it stops. The
 * number above rolls digit by digit.
 */
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
  hint = "Drag across the ticks, or use the arrow keys.",
  autoplay = false,
  disabled = false,
  enableSound = true,
  className,
}: TickSliderProps) {
  const reduced = useReducedMotion() ?? false;
  const play = useSound(enableSound);
  const lastTick = React.useRef(0);
  const [inner, setInner] = React.useState(() => clamp(defaultValue, min, max));
  const value = clamp(controlled ?? inner, min, max);
  const decimals = decimalsOf(step);
  const dims = SIZES[size];
  const count = Math.max(2, Math.round(ticks));
  const trackWidth = count * dims.tick + (count - 1) * dims.gap;
  const pitch = dims.tick + dims.gap;
  const span = max - min || 1;

  const trackRef = React.useRef<HTMLDivElement | null>(null);
  const touched = React.useRef(false);
  const [dragging, setDragging] = React.useState(false);
  const labelId = React.useId();

  const fraction = (value - min) / span;
  const fill = useMotionValue(fraction);
  const pointer = useMotionValue(-1000);
  // The needle trails the fill a little, so it has velocity to lean with.
  const needleF = useSpring(fill, { stiffness: 520, damping: 34 });
  const needle = useTransform(needleF, (f) => clamp(f, 0, 1) * (trackWidth - dims.tick) + dims.tick / 2);
  const velocity = useVelocity(needle);
  const leanRaw = useTransform(velocity, (v) => clamp(v / 90, -16, 16));
  const lean = useSpring(leanRaw, { stiffness: 380, damping: 14 });
  const tilt = useTransform(lean, (l) => (reduced ? 0 : l));
  const needleX = useTransform(needle, (n) => n - 1.5);

  React.useEffect(() => {
    if (reduced) {
      fill.set(fraction);
      return;
    }
    const c = animate(fill, fraction, dragging ? { duration: 0 } : { type: "spring", stiffness: 340, damping: 30 });
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

  React.useEffect(() => {
    if (!autoplay || controlled !== undefined) return;
    let k = 0;
    const t = setInterval(() => {
      if (touched.current) {
        clearInterval(t);
        return;
      }
      const f = DEMO[k++ % DEMO.length];
      setInner(Number(clamp(Math.round((min + f * (max - min)) / step) * step, min, max).toFixed(decimals)));
    }, 1900);
    return () => clearInterval(t);
  }, [autoplay, controlled, min, max, step, decimals]);

  const valueAt = (clientX: number) => {
    const el = trackRef.current;
    if (!el) return value;
    const r = el.getBoundingClientRect();
    return snap(min + clamp((clientX - r.left) / r.width, 0, 1) * (max - min));
  };

  const localX = (clientX: number) => {
    const el = trackRef.current;
    if (!el) return -1000;
    const r = el.getBoundingClientRect();
    const scale = r.width / el.offsetWidth || 1;
    return (clientX - r.left) / scale;
  };

  const latest = React.useRef(value);
  React.useLayoutEffect(() => {
    latest.current = value;
  }, [value]);

  // One quiet tick when the value crosses onto a different tick mark (called from input handlers only).
  const tickIfCrossed = (from: number, to: number, always = false) => {
    const mark = (v: number) => Math.round(((v - min) / span) * (count - 1));
    if (!always && mark(from) === mark(to)) return;
    const now = performance.now();
    if (now - lastTick.current < 40) return;
    lastTick.current = now;
    play("tick", 0.4);
  };

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (disabled || e.button > 0) return;
    e.preventDefault();
    touched.current = true;
    if (e.isTrusted) trackRef.current?.focus({ preventScroll: true });
    setDragging(true);
    const first = valueAt(e.clientX);
    if (first !== latest.current) {
      tickIfCrossed(latest.current, first);
      latest.current = first;
      commit(first);
    }
    pointer.set(localX(e.clientX));

    const move = (ev: PointerEvent) => {
      pointer.set(localX(ev.clientX));
      const next = valueAt(ev.clientX);
      if (next !== latest.current) {
        tickIfCrossed(latest.current, next);
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
    touched.current = true;
    const next = snap(map[e.key]);
    if (next !== value) {
      tickIfCrossed(value, next, true);
      commit(next);
      onCommit?.(next);
    }
  };

  const valueText = `${value.toFixed(decimals)}${unit ?? ""}`;

  return (
    <div
      className={cn(
        "inline-flex max-w-full flex-col gap-3 text-[#1d1d1f] [--tk-off:#d2d2d7] dark:text-[#f5f5f7] dark:[--tk-off:#48484a]",
        !accent && "[--tk-on:#0071e3] dark:[--tk-on:#0a84ff]",
        disabled && "opacity-50",
        className,
      )}
      style={accent ? ({ "--tk-on": accent } as React.CSSProperties) : undefined}
    >
      {label || showValue ? (
        <div className="flex items-end justify-between gap-4">
          {label ? (
            <span id={labelId} className="pb-1 text-[13px] font-medium text-[#6e6e73] dark:text-[#a1a1a6]">
              {label}
            </span>
          ) : (
            <span />
          )}
          {showValue ? (
            <output aria-hidden="true" className={cn("flex items-baseline font-semibold leading-none tracking-[-0.04em]", dims.text)}>
              <RollingNumber value={value} decimals={decimals} reduced={reduced} />
              {unit ? <span className="ml-0.5 text-[0.55em] font-medium tracking-normal text-[#86868b] dark:text-[#98989d]">{unit}</span> : null}
            </output>
          ) : null}
        </div>
      ) : null}
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
          "relative flex cursor-ew-resize touch-none select-none items-end rounded-[10px] outline-none",
          "focus-visible:outline-2 focus-visible:outline-offset-[6px] focus-visible:outline-[#0071e3] dark:focus-visible:outline-[#0a84ff]",
          disabled && "cursor-not-allowed",
        )}
        style={{ width: trackWidth, gap: dims.gap, height: dims.h * 2 }}
      >
        {Array.from({ length: count }, (_, i) => (
          <Tick
            key={i}
            index={i}
            count={count}
            fill={fill}
            pointer={pointer}
            needle={needle}
            height={dims.h}
            width={dims.tick}
            pitch={pitch}
            magnify={reduced ? 0 : magnify}
          />
        ))}
        <motion.span className="pointer-events-none absolute bottom-0 left-0" style={{ x: needleX }} aria-hidden="true">
          <motion.span
            className="block w-[3px] origin-bottom rounded-full bg-[var(--tk-on)]"
            style={{ height: dims.h * 1.9, rotate: tilt }}
          >
            <span className="absolute -left-[3.5px] -top-[5px] block size-[10px] rounded-full bg-[var(--tk-on)] shadow-[0_0_0_2.5px_#fff,0_2px_6px_rgba(0,0,0,.25)] dark:shadow-[0_0_0_2.5px_#1c1c1e,0_2px_6px_rgba(0,0,0,.6)]" />
          </motion.span>
        </motion.span>
      </div>
      {hint ? <span className="text-[12px] text-[#86868b] dark:text-[#98989d]">{hint}</span> : null}
    </div>
  );
}
