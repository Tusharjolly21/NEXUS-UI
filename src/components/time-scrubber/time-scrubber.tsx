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
import { useSound } from "@/lib/ui-sounds";

export type TimeScrubberProps = {
  /** Controlled value, in minutes since midnight (0-1439). */
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
  /** Colour of the centre needle. Defaults to system blue. */
  accent?: string;
  /** Pixels per minute on the ruler; larger spreads the hours out. */
  density?: number;
  /** Caption above the time, e.g. "Pickup". */
  label?: string;
  /** One-line hint under the ruler. Pass an empty string to hide it. */
  hint?: string;
  /** Flings the ruler to a few times of day until someone touches it. */
  autoplay?: boolean;
  disabled?: boolean;
  /** Plays interface sounds on interaction. They follow the site-wide sound switch and stay silent in autoplay. */
  enableSound?: boolean;
  className?: string;
};

const DAY = 24 * 60;
const DEMO = [13 * 60 + 15, 7 * 60 + 45, 19 * 60 + 30, 22 * 60 + 45, 10 * 60];
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

/** Sky colours through the day: [hour, top, bottom]. */
const SKY: [number, number[], number[]][] = [
  [0, [20, 28, 58], [44, 52, 98]],
  [5, [44, 52, 98], [191, 90, 242]],
  [7, [255, 159, 10], [255, 214, 140]],
  [10, [90, 200, 250], [190, 232, 255]],
  [16, [64, 170, 250], [180, 222, 255]],
  [19, [255, 112, 67], [191, 90, 242]],
  [21, [40, 44, 92], [94, 60, 140]],
  [24, [20, 28, 58], [44, 52, 98]],
];
function skyAt(minutes: number) {
  const h = clamp(minutes / 60, 0, 24);
  let i = 0;
  while (i < SKY.length - 2 && SKY[i + 1][0] <= h) i++;
  const [h0, a0, b0] = SKY[i];
  const [h1, a1, b1] = SKY[i + 1];
  const t = (h - h0) / (h1 - h0 || 1);
  const mix = (a: number[], b: number[]) => a.map((v, k) => Math.round(v + (b[k] - v) * t)).join(",");
  return `linear-gradient(160deg, rgb(${mix(a0, a1)}), rgb(${mix(b0, b1)}))`;
}

/* Rolling digits */

function Digit({ digit, reduced }: { digit: number; reduced: boolean }) {
  const y = useSpring(-digit * 10, { stiffness: 320, damping: 24, mass: 0.5 });
  React.useEffect(() => {
    if (reduced) y.jump(-digit * 10);
    else y.set(-digit * 10);
  }, [digit, reduced, y]);
  const top = useTransform(y, (v) => `${v}%`);
  return (
    <span className="relative inline-block h-[1em] w-[0.6em] overflow-hidden leading-none [mask-image:linear-gradient(to_bottom,transparent,#000_14%,#000_86%,transparent)]">
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
    <span className="inline-flex items-center tabular-nums" aria-hidden="true">
      {chars.map((c, i) =>
        /\d/.test(c) ? (
          <Digit key={chars.length - i} digit={Number(c)} reduced={reduced} />
        ) : (
          <span key={`sep-${chars.length - i}`} className="mx-[0.02em] -translate-y-[0.05em] leading-none">
            {c}
          </span>
        ),
      )}
    </span>
  );
}

function SkyGlyph({ day }: { day: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
      <motion.g initial={false} animate={{ opacity: day ? 1 : 0, scale: day ? 1 : 0.4, rotate: day ? 0 : -90 }} transition={{ type: "spring", stiffness: 380, damping: 20 }} style={{ originX: "50%", originY: "50%" }}>
        <circle cx="8" cy="8" r="3.4" fill="#fff" />
        {Array.from({ length: 8 }, (_, i) => {
          const a = (i * Math.PI) / 4;
          const r3 = (n: number) => Math.round(n * 1000) / 1000;
          return <line key={i} x1={r3(8 + Math.cos(a) * 5.4)} y1={r3(8 + Math.sin(a) * 5.4)} x2={r3(8 + Math.cos(a) * 7)} y2={r3(8 + Math.sin(a) * 7)} stroke="#fff" strokeWidth="1.3" strokeLinecap="round" />;
        })}
      </motion.g>
      <motion.path
        d="M10.8 11.6A5 5 0 0 1 6.3 3.2a5.2 5.2 0 1 0 6.4 7.1 5 5 0 0 1-1.9 1.3Z"
        fill="#fff"
        initial={false}
        animate={{ opacity: day ? 0 : 1, scale: day ? 0.4 : 1, rotate: day ? 90 : 0 }}
        transition={{ type: "spring", stiffness: 380, damping: 20 }}
        style={{ originX: "50%", originY: "50%" }}
      />
    </svg>
  );
}

/**
 * A time picker drawn as a ruler you drag or fling under a fixed needle.
 * The ruler coasts and lands exactly on a snap point, the needle ticks at
 * every interval it crosses and bounces when the ruler lands, the digits
 * roll, and a small sky chip shifts from night to dawn to day.
 */
export function TimeScrubber({
  value: controlled,
  defaultValue = 9 * 60 + 30,
  onChange,
  onCommit,
  interval = 15,
  format = "12h",
  accent,
  density = 1.6,
  label,
  hint = "Drag the ruler, or fling it.",
  autoplay = false,
  disabled = false,
  enableSound = true,
  className,
}: TimeScrubberProps) {
  const reduced = useReducedMotion() ?? false;
  const play = useSound(enableSound);
  const lastTick = React.useRef(0);
  const maxMinute = DAY - interval;
  const snap = React.useCallback((m: number) => clamp(Math.round(m / interval) * interval, 0, maxMinute), [interval, maxMinute]);

  const [inner, setInner] = React.useState(() => snap(defaultValue));
  const value = snap(controlled ?? inner);
  const [shown, setShown] = React.useState(value);

  const viewportRef = React.useRef<HTMLDivElement | null>(null);
  const [half, setHalf] = React.useState(140);
  const x = useMotionValue(half - value * density);
  const needle = useMotionValue(1);
  const anim = React.useRef<AnimationPlaybackControls | null>(null);
  const dragging = React.useRef(false);
  const touched = React.useRef(false);
  const lastEmitted = React.useRef(value);
  const lastShown = React.useRef(value);

  const sky = useTransform(x, (px) => skyAt((half - px) / density));

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

  const kick = React.useCallback(
    (amount: number) => {
      if (reduced) return;
      needle.set(amount);
      animate(needle, 1, { type: "spring", stiffness: 700, damping: 12 });
    },
    [needle, reduced],
  );

  const emit = React.useCallback(
    (m: number, notify = true) => {
      if (m === lastEmitted.current) return;
      lastEmitted.current = m;
      if (controlled === undefined) setInner(m);
      if (notify) onChange?.(m);
    },
    [controlled, onChange],
  );

  useMotionValueEvent(x, "change", (px) => {
    const m = snap(minutesAt(px));
    if (m === lastShown.current) return;
    lastShown.current = m;
    setShown(m);
    if (dragging.current || anim.current) {
      kick(1.14);
      if (touched.current) {
        emit(m);
        const now = performance.now();
        if (now - lastTick.current >= 40) {
          lastTick.current = now;
          play("tick", 0.4);
        }
      }
    }
  });

  const land = React.useCallback(
    (target: number, notify: boolean) => {
      anim.current = null;
      kick(1.4);
      emit(target, notify);
      if (notify) {
        play("drop", 0.4);
        onCommit?.(target);
      }
    },
    [emit, kick, onCommit, play],
  );

  const settleTo = React.useCallback(
    (target: number, notify = true) => {
      anim.current?.stop();
      if (reduced) {
        x.set(pxFor(target));
        land(target, notify);
        return;
      }
      anim.current = animate(x, pxFor(target), {
        type: "spring",
        stiffness: 200,
        damping: 26,
        onComplete: () => land(target, notify),
      });
    },
    [reduced, x, pxFor, land],
  );

  // Keep the needle on the same minute when the ruler is resized.
  React.useLayoutEffect(() => {
    if (dragging.current || anim.current) return;
    x.jump(pxFor(lastEmitted.current));
  }, [half, density, x, pxFor]);

  // Follow controlled changes.
  React.useEffect(() => {
    if (dragging.current || anim.current) return;
    if (value !== lastEmitted.current) {
      lastEmitted.current = value;
      settleTo(value, false);
    }
  }, [value, settleTo]);

  React.useEffect(() => {
    if (!autoplay) return;
    let k = 0;
    const t = setInterval(() => {
      if (touched.current) {
        clearInterval(t);
        return;
      }
      settleTo(snap(DEMO[k++ % DEMO.length]), false);
    }, 2600);
    return () => clearInterval(t);
  }, [autoplay, settleTo, snap]);

  React.useEffect(() => () => anim.current?.stop(), []);

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (disabled || e.button > 0) return;
    e.preventDefault();
    touched.current = true;
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
      vel = vel * 0.6 + ((ev.clientX - lastX) / scale / dt) * 1000 * 0.4;
      lastX = ev.clientX;
      lastT = now;
      let next = startPx + (ev.clientX - startX) / scale;
      // Rubber band past either end of the day.
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
      if (reduced || Math.abs(vel) < 40) {
        settleTo(snap(minutesAt(x.get())));
        return;
      }
      anim.current = animate(x, [x.get()], {
        type: "inertia",
        velocity: vel,
        power: 0.35,
        timeConstant: 280,
        min: lo,
        max: hi,
        bounceStiffness: 260,
        bounceDamping: 28,
        restDelta: 0.5,
        modifyTarget: (t) => pxFor(snap(minutesAt(t))),
        onComplete: () => land(snap(minutesAt(x.get())), true),
      });
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
  };

  // Wheel and trackpad: one interval per notch.
  React.useEffect(() => {
    const el = viewportRef.current;
    if (!el || disabled) return;
    let acc = 0;
    const onWheel = (e: WheelEvent) => {
      const d = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      if (!d) return;
      e.preventDefault();
      touched.current = true;
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
    touched.current = true;
    settleTo(snap(map[e.key]));
  };

  const { main, period } = parts(shown, format);
  const spokenParts = parts(value, format);
  const spoken = spokenParts.period ? `${spokenParts.main} ${spokenParts.period}` : spokenParts.main;
  const day = shown >= 6 * 60 && shown < 18 * 60;

  const ticks = React.useMemo(() => {
    const out: { m: number; kind: "hour" | "half" | "minor" }[] = [];
    for (let m = 0; m <= DAY; m += 5) out.push({ m, kind: m % 60 === 0 ? "hour" : m % 30 === 0 ? "half" : "minor" });
    return out;
  }, []);

  return (
    <div
      className={cn(
        "inline-flex w-[320px] max-w-full flex-col rounded-[24px] bg-white px-5 pb-4 pt-5 text-[#1d1d1f]",
        "shadow-[0_0_0_1px_rgba(0,0,0,.05),0_20px_40px_-26px_rgba(0,0,0,.35)]",
        "dark:bg-[#1c1c1e] dark:text-[#f5f5f7] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08),0_20px_40px_-26px_rgba(0,0,0,.9)]",
        !accent && "[--ts-accent:#0071e3] dark:[--ts-accent:#0a84ff]",
        disabled && "opacity-50",
        className,
      )}
      style={accent ? ({ "--ts-accent": accent } as React.CSSProperties) : undefined}
    >
      <div className="flex items-center gap-3">
        <motion.span className="grid size-9 shrink-0 place-items-center rounded-full shadow-[inset_0_1px_0_rgba(255,255,255,.35)]" style={{ background: sky }} aria-hidden="true">
          <SkyGlyph day={day} />
        </motion.span>
        <div className="min-w-0">
          {label ? <span className="block text-[12px] font-medium text-[#6e6e73] dark:text-[#a1a1a6]">{label}</span> : null}
          <div className="flex items-baseline gap-1.5 font-semibold">
            <span className="text-[40px] leading-none tracking-[-0.045em]">
              <RollingTime text={main} reduced={reduced} />
            </span>
            {period ? <span className="text-[15px] font-medium text-[#6e6e73] dark:text-[#a1a1a6]">{period}</span> : null}
          </div>
        </div>
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
          "relative mt-4 h-[64px] w-full cursor-grab touch-none select-none overflow-hidden rounded-[14px] bg-[#f5f5f7] outline-none active:cursor-grabbing dark:bg-[#2c2c2e]",
          "focus-visible:ring-2 focus-visible:ring-[#0071e3] dark:focus-visible:ring-[#0a84ff]",
          disabled && "cursor-not-allowed",
        )}
      >
        <div className="absolute inset-0 [mask-image:linear-gradient(to_right,transparent,#000_20%,#000_80%,transparent)]">
          <motion.div className="absolute left-0 top-0 h-full" style={{ x }}>
            {ticks.map(({ m, kind }) => (
              <span
                key={m}
                aria-hidden="true"
                className={cn(
                  "absolute top-[8px] rounded-full",
                  kind === "hour" && "h-[22px] w-[2px] bg-[#1d1d1f] dark:bg-[#f5f5f7]",
                  kind === "half" && "h-[15px] w-px bg-[#1d1d1f]/45 dark:bg-[#f5f5f7]/45",
                  kind === "minor" && "h-[9px] w-px bg-[#1d1d1f]/20 dark:bg-[#f5f5f7]/22",
                )}
                style={{ left: m * density - (kind === "hour" ? 1 : 0.5) }}
              />
            ))}
            {ticks
              .filter((t) => t.kind === "hour" && t.m < DAY)
              .map(({ m }) => (
                <span
                  key={`l-${m}`}
                  aria-hidden="true"
                  className="absolute top-[38px] whitespace-nowrap text-[11px] font-medium tabular-nums text-[#6e6e73] dark:text-[#a1a1a6]"
                  style={{ left: m * density, transform: "translateX(-50%)" }}
                >
                  {hourLabel(m / 60, format)}
                </span>
              ))}
          </motion.div>
        </div>
        <motion.span
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-[3px] block h-[32px] w-[3px] origin-top rounded-full bg-[var(--ts-accent)] shadow-[0_0_0_2px_#f5f5f7] dark:shadow-[0_0_0_2px_#2c2c2e]"
          style={{ x: "-50%", scaleY: needle }}
        />
      </div>
      {hint ? <span className="mt-2.5 text-center text-[12px] text-[#86868b] dark:text-[#98989d]">{hint}</span> : null}
    </div>
  );
}
