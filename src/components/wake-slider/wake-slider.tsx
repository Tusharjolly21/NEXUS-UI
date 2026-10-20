"use client";
import { useCallback, useEffect, useRef, useState, type KeyboardEvent, type PointerEvent as RPointerEvent } from "react";

const N = 56;
const W = 300;

export interface WakeSliderProps {
  /** Label shown above the bars; also the slider's accessible name. */
  label?: string;
  /** Starting value, 0 to 100. */
  defaultValue?: number;
  /** Colour of the bars up to the current value. */
  accent?: string;
  /** Called with the rounded value (0 to 100) whenever it changes. */
  onValueChange?: (value: number) => void;
  /** Sweeps back and forth by itself until the user drags or uses the keyboard. */
  autoplay?: boolean;
}

/**
 * A range made of thin bars with no thumb. Drag across it and the bars you
 * sweep past spring up in a wake behind your hand, taller the faster you go,
 * then ripple back down. The value is wherever the colour ends.
 */
export function WakeSlider({ label = "Brightness", defaultValue = 40, accent = "#ff9f0a", onValueChange, autoplay = false }: WakeSliderProps) {
  const bars = useRef<(HTMLSpanElement | null)[]>([]);
  const st = useRef(Array.from({ length: N }, () => ({ h: 0, v: 0 })));
  const value = useRef(Math.max(0, Math.min(100, defaultValue)) / 100);
  const last = useRef<{ x: number; t: number } | null>(null);
  const [val, setVal] = useState(() => Math.round(Math.max(0, Math.min(100, defaultValue))));
  const ref = useRef<HTMLDivElement>(null);
  const drag = useRef(false);
  const touched = useRef(false);
  const onChangeRef = useRef(onValueChange);
  const emitted = useRef(Math.round(Math.max(0, Math.min(100, defaultValue))));

  useEffect(() => {
    onChangeRef.current = onValueChange;
  }, [onValueChange]);

  useEffect(() => {
    let raf = 0;
    const loop = () => {
      raf = requestAnimationFrame(loop);
      const s = st.current;
      for (let i = 0; i < N; i++) {
        const b = s[i];
        // spring back to zero, with a little coupling to neighbours so it ripples
        const nb = ((s[i - 1]?.h ?? 0) + (s[i + 1]?.h ?? 0)) / 2;
        b.v += -b.h * 0.12 + (nb - b.h) * 0.05;
        b.v *= 0.82;
        b.h += b.v;
        const el = bars.current[i];
        if (el) {
          el.style.height = `${14 + Math.max(-6, b.h)}px`;
          el.style.background = i / (N - 1) <= value.current ? accent : "var(--mk-wake-off)";
        }
      }
    };
    loop();
    return () => cancelAnimationFrame(raf);
  }, [accent]);

  const kick = useCallback((x: number, speed: number) => {
    const i = Math.round((x / W) * (N - 1));
    for (let k = -2; k <= 2; k++) {
      const b = st.current[i + k];
      if (b) b.v += Math.min(9, speed * 0.012) * (1 - Math.abs(k) * 0.3);
    }
  }, []);

  const setFrom = useCallback((x: number) => {
    value.current = Math.max(0, Math.min(1, x / W));
    const next = Math.round(value.current * 100);
    if (next === emitted.current) return;
    emitted.current = next;
    setVal(next);
    onChangeRef.current?.(next);
  }, []);

  useEffect(() => {
    if (!autoplay) return;
    let raf = 0;
    const t0 = performance.now();
    let px = value.current * W;
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      if (touched.current) return cancelAnimationFrame(raf);
      const t = (now - t0) / 1000;
      const x = W / 2 + Math.sin(t * 1.3) * Math.sin(t * 0.4) * W * 0.48;
      kick(x, Math.abs(x - px) * 60);
      px = x;
      setFrom(x);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [autoplay, kick, setFrom]);

  const pos = (e: RPointerEvent) => {
    const r = e.currentTarget.getBoundingClientRect();
    return ((e.clientX - r.left) / r.width) * W;
  };
  const move = (e: RPointerEvent) => {
    const x = pos(e);
    const now = performance.now();
    if (drag.current) {
      const l = last.current;
      const speed = l ? (Math.abs(x - l.x) / Math.max(1, now - l.t)) * 1000 : 0;
      kick(x, speed);
      setFrom(x);
    }
    last.current = { x, t: now };
  };
  const key = (e: KeyboardEvent) => {
    let target: number | null = null;
    if (e.key === "ArrowRight" || e.key === "ArrowUp") target = value.current + 0.05;
    else if (e.key === "ArrowLeft" || e.key === "ArrowDown") target = value.current - 0.05;
    else if (e.key === "Home") target = 0;
    else if (e.key === "End") target = 1;
    if (target === null) return;
    e.preventDefault();
    touched.current = true;
    setFrom(target * W);
    kick(value.current * W, 500);
  };

  return (
    <div className="flex w-[300px] flex-col gap-3 [--mk-wake-off:#d2d2d7] dark:[--mk-wake-off:#3a3a3c]">
      <div className="flex items-baseline justify-between">
        <span className="text-[15px] font-medium text-[#1d1d1f] dark:text-[#f5f5f7]">{label}</span>
        <span className="text-[22px] font-semibold tabular-nums tracking-[-0.02em] text-[#1d1d1f] dark:text-[#f5f5f7]">{val}</span>
      </div>
      <div
        ref={ref}
        role="slider"
        tabIndex={0}
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={val}
        onKeyDown={key}
        onPointerDown={(e) => {
          touched.current = true;
          drag.current = true;
          e.currentTarget.setPointerCapture(e.pointerId);
          last.current = null;
          const x = pos(e);
          setFrom(x);
          kick(x, 400);
        }}
        onPointerMove={move}
        onPointerUp={() => {
          drag.current = false;
        }}
        onPointerCancel={() => {
          drag.current = false;
        }}
        className="flex h-[64px] cursor-pointer touch-none items-end justify-between rounded-xl pb-4 outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] focus-visible:ring-offset-4 focus-visible:ring-offset-transparent dark:focus-visible:ring-[#2997ff]"
        style={{ width: W }}
      >
        {Array.from({ length: N }, (_, i) => (
          <span
            key={i}
            ref={(el) => {
              bars.current[i] = el;
            }}
            className="w-[2px] rounded-full"
            style={{ height: 14 }}
          />
        ))}
      </div>
      <span className="text-[12px] text-[#86868b] dark:text-[#8e8e93]">Drag fast across the bars.</span>
    </div>
  );
}
