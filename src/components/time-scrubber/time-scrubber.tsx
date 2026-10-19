"use client";

import * as React from "react";
import {
  animate,
  motion,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useSpring,
  useTransform,
  type AnimationPlaybackControls,
} from "framer-motion";
import { cn } from "@/lib/utils";

export type TimeScrubberProps = {
  /** Controlled value, in minutes since midnight (0–1439). */
  value?: number;
  /** Starting value when uncontrolled, in minutes since midnight. */
  defaultValue?: number;
  /** Called with the snapped time (minutes since midnight) whenever it changes. */
  onChange?: (minutes: number) => void;
  /** Called once the ruler comes to rest. */
  onCommit?: (minutes: number) => void;
  /** Minutes the ruler snaps to. */
  interval?: number;
  format?: "12h" | "24h";
  /** Colour of the centre needle. */
  accent?: string;
  /** Pixels per minute on the ruler; larger spreads the hours out. */
  density?: number;
  /** Optional caption above the time, e.g. "Pickup". */
  label?: string;
  disabled?: boolean;
  className?: string;
};

const DAY = 24 * 60;
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

function parts(minutes: number, format: "12h" | "24h") {
  const h24 = Math.floor(minutes / 60) % 24;
  const m = minutes % 60;
  if (format === "24h") return { main: `${String(h24).padStart(2, "0")}:${String(m).padStart(2, "0")}`, period: "" };
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return { main: `${h12}:${String(m).padStart(2, "0")}`, period: h24 < 12 ? "AM" : "PM" };
}

function hourLabel(h: number, format: "12h" | "24h") {
  if (format === "24h") return `${String(h % 24).padStart(2, "0")}:00`;
  const hh = h % 24;
  const h12 = hh % 12 === 0 ? 12 : hh % 12;
  return `${h12} ${hh < 12 ? "AM" : "PM"}`;
}

/* ── Rolling digits ─────────────────────────────────────────────── */

function Digit({ digit, reduced }: { digit: number; reduced: boolean }) {
  const y = useSpring(-digit * 10, { stiffness: 300, damping: 28, mass: 0.5 });
  React.useEffect(() => {
    if (reduced) y.jump(-digit * 10);
    else y.set(-digit * 10);
  }, [digit, reduced, y]);
  const top = useTransform(y, (v) => `${v}%`);
  return (
    <span className="relative inline-block h-[1em] w-[0.6em] overflow-hidden leading-none [mask-image:linear-gradient(to_bottom,transparent,#000_12%,#000_88%,transparent)]">
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

function RollingTime({ text, reduced }: { text: string; reduced: boolean }) {
  const chars = text.split("");
  return (
    <span className="inline-flex items-center tabular-nums" aria-hidden>
      {chars.map((c, i) =>
        /\d/.test(c) ? (
          <Digit key={chars.length - i} digit={Number(c)} reduced={reduced} />
        ) : (
          <span key={`sep-${chars.length - i}`} className="mx-[0.02em] -translate-y-[0.04em] leading-none">
            {c}
          </span>
        ),
      )}
    </span>
  );
}

/* ── Scrubber ───────────────────────────────────────────────────── */

export function TimeScrubber({
  value: controlled,
  defaultValue = 9 * 60 + 30,
  onChange,
  onCommit,
  interval = 15,
  format = "12h",
  accent = "#ef4444",
  density = 1.6,
  label,
  disabled = false,
  className,
}: TimeScrubberProps) {
  const reduced = useReducedMotion() ?? false;
  const maxMinute = DAY - interval;
  const snap = React.useCallback(
    (m: number) => clamp(Math.round(m / interval) * interval, 0, maxMinute),
    [interval, maxMinute],
  );

  const [inner, setInner] = React.useState(() => snap(defaultValue));
  const value = snap(controlled ?? inner);
  const [shown, setShown] = React.useState(value);

  const viewportRef = React.useRef<HTMLDivElement | null>(null);
  const [half, setHalf] = React.useState(130);
  const x = useMotionValue(half - value * density);
  const anim = React.useRef<AnimationPlaybackControls | null>(null);
  const dragging = React.useRef(false);
  const lastEmitted = React.useRef(value);

  React.useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    const update = () => setHalf(el.offsetWidth / 2);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const minutesAt = React.useCallback((px: number) => (half - px) / density, [half, density]);
  const pxFor = React.useCallback((m: number) => half - m * density, [half, density]);

  const emit = React.useCallback(
    (m: number) => {
      if (m === lastEmitted.current) return;
      lastEmitted.current = m;
      if (controlled === undefined) setInner(m);
      onChange?.(m);
    },
    [controlled, onChange],
  );

  useMotionValueEvent(x, "change", (px) => {
    const m = snap(minutesAt(px));
    setShown(m);
    if (dragging.current || anim.current) emit(m);
  });

  const settleTo = React.useCallback(
    (target: number, velocity = 0) => {
      anim.current?.stop();
      if (reduced) {
        x.set(pxFor(target));
        anim.current = null;
        emit(target);
        onCommit?.(target);
        return;
      }
      anim.current = animate(x, pxFor(target), {
        type: "spring",
        stiffness: 240,
        damping: 32,
        velocity,
        onComplete: () => {
          anim.current = null;
          emit(target);
          onCommit?.(target);
        },
      });
    },
    [reduced, x, pxFor, emit, onCommit],
  );

  // keep the needle on the same minute when the ruler is resized
  React.useLayoutEffect(() => {
    if (dragging.current || anim.current) return;
    x.jump(pxFor(lastEmitted.current));
  }, [half, density, x, pxFor]);

  // follow controlled changes
  React.useEffect(() => {
    if (dragging.current || anim.current) return;
    if (value !== lastEmitted.current) {
      lastEmitted.current = value;
      settleTo(value);
    }
  }, [value, settleTo]);

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (disabled || e.button > 0) return;
    e.preventDefault();
    if (e.isTrusted) viewportRef.current?.focus({ preventScroll: true });
    anim.current?.stop();
    anim.current = null;
    dragging.current = true;
    const el = viewportRef.current;
    const scale = el ? el.getBoundingClientRect().width / el.offsetWidth || 1 : 1;
    const startX = e.clientX;
    const startPx = x.get();
    const lo = pxFor(maxMinute);
    const hi = pxFor(0);
    let lastX = e.clientX;
    let lastT = performance.now();
    let vel = 0;

    const move = (ev: PointerEvent) => {
      const now = performance.now();
      const dt = Math.max(1, now - lastT);
      vel = vel * 0.6 + (((ev.clientX - lastX) / scale) / dt) * 1000 * 0.4;
      lastX = ev.clientX;
      lastT = now;
      let next = startPx + (ev.clientX - startX) / scale;
      // rubber band past the ends of the day
      if (next > hi) next = hi + (next - hi) * 0.25;
      if (next < lo) next = lo + (next - lo) * 0.25;
      x.set(next);
    };
    const up = () => {
      dragging.current = false;
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
      if (performance.now() - lastT > 90) vel = 0; // held still before letting go
      const projected = x.get() + vel * 0.22;
      settleTo(snap(minutesAt(projected)), vel);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
  };

  // wheel / trackpad: one interval per notch
  React.useEffect(() => {
    const el = viewportRef.current;
    if (!el || disabled) return;
    let acc = 0;
    const onWheel = (e: WheelEvent) => {
      const d = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      if (!d) return;
      e.preventDefault();
      acc += d;
      if (Math.abs(acc) < 28) return;
      const steps = Math.trunc(acc / 28);
      acc -= steps * 28;
      const base = anim.current ? lastEmitted.current : snap(minutesAt(x.get()));
      settleTo(snap(base + steps * interval));
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [disabled, interval, minutesAt, settleTo, snap, x]);

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (disabled) return;
    const base = anim.current ? lastEmitted.current : value;
    const map: Record<string, number> = {
      ArrowRight: base + interval,
      ArrowUp: base + interval,
      ArrowLeft: base - interval,
      ArrowDown: base - interval,
      PageUp: base + 60,
      PageDown: base - 60,
      Home: 0,
      End: maxMinute,
    };
    if (!(e.key in map)) return;
    e.preventDefault();
    settleTo(snap(map[e.key]));
  };

  const { main, period } = parts(shown, format);
  const spoken = (() => {
    const p = parts(value, format);
    return p.period ? `${p.main} ${p.period}` : p.main;
  })();

  const ticks = React.useMemo(() => {
    const out: { m: number; kind: "hour" | "half" | "minor" }[] = [];
    for (let m = 0; m <= DAY; m += 5) out.push({ m, kind: m % 60 === 0 ? "hour" : m % 30 === 0 ? "half" : "minor" });
    return out;
  }, []);

  return (
    <div
      className={cn(
        "inline-flex w-[300px] flex-col items-center rounded-[22px] bg-white px-5 pb-4 pt-5 text-[#17181a]",
        "shadow-[0_1px_2px_rgba(23,24,26,0.06),0_10px_30px_-8px_rgba(23,24,26,0.14)] ring-1 ring-black/[0.06]",
        "dark:bg-[#16161d] dark:text-white dark:ring-white/10 dark:shadow-[0_10px_30px_-8px_rgba(0,0,0,0.6)]",
        disabled && "opacity-50",
        className,
      )}
    >
      {label ? <span className="mb-1 text-[12px] font-medium text-[#73726d] dark:text-[#8e8d88]">{label}</span> : null}
      <div className="flex items-baseline gap-1.5 font-medium">
        <span className="text-[38px] leading-none tracking-[-0.02em]">
          <RollingTime text={main} reduced={reduced} />
        </span>
        {period ? <span className="text-[15px] text-[#73726d] dark:text-[#8e8d88]">{period}</span> : null}
      </div>

      <div
        ref={viewportRef}
        role="slider"
        tabIndex={disabled ? -1 : 0}
        aria-label={label ?? "Time"}
        aria-valuemin={0}
        aria-valuemax={maxMinute}
        aria-valuenow={value}
        aria-valuetext={spoken}
        aria-disabled={disabled || undefined}
        onPointerDown={onPointerDown}
        onKeyDown={onKeyDown}
        className={cn(
          "relative mt-4 h-[62px] w-full cursor-grab touch-none select-none overflow-hidden rounded-xl outline-none active:cursor-grabbing",
          "[mask-image:linear-gradient(to_right,transparent,#000_18%,#000_82%,transparent)]",
          "focus-visible:bg-black/[0.03] dark:focus-visible:bg-white/[0.04]",
          disabled && "cursor-not-allowed",
        )}
      >
        <motion.div className="absolute left-0 top-0 h-full" style={{ x }}>
          {ticks.map(({ m, kind }) => (
            <span
              key={m}
              aria-hidden
              className={cn(
                "absolute top-[6px] w-px -translate-x-1/2 rounded-full",
                kind === "hour" && "h-[22px] w-[1.5px] bg-[#17181a] dark:bg-white",
                kind === "half" && "h-[15px] bg-[#17181a]/45 dark:bg-white/45",
                kind === "minor" && "h-[9px] bg-[#17181a]/20 dark:bg-white/20",
              )}
              style={{ left: m * density }}
            />
          ))}
          {ticks
            .filter((t) => t.kind === "hour" && t.m < DAY)
            .map(({ m }) => (
              <span
                key={`l-${m}`}
                aria-hidden
                className="absolute top-[38px] -translate-x-1/2 whitespace-nowrap text-[11px] font-medium tabular-nums text-[#73726d] dark:text-[#8e8d88]"
                style={{ left: m * density }}
              >
                {hourLabel(m / 60, format)}
              </span>
            ))}
        </motion.div>
        <span
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-[2px] h-[30px] w-[2.5px] -translate-x-1/2 rounded-full shadow-[0_0_0_2px_rgba(255,255,255,0.9)] dark:shadow-[0_0_0_2px_rgba(22,22,29,0.9)]"
          style={{ backgroundColor: accent }}
        />
      </div>
    </div>
  );
}
