"use client";
import { useEffect, useId, useRef, useState, type PointerEvent as RPointerEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useSound } from "@/lib/ui-sounds";

export interface ScrubInputProps {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  accent?: string;
  /** Plays interface sounds on interaction. They follow the site-wide sound switch and stay silent in autoplay. */
  enableSound?: boolean;
}

/**
 * Drag the label (or the number) sideways to change the value, like a design
 * tool. Shift moves ten times faster, Alt ten times finer. A badge rides above
 * the number showing how far you have moved from where you started.
 */
export function ScrubInput({ label, value, onChange, min, max, step = 1, unit = "", accent = "#0071e3", enableSound = true }: ScrubInputProps) {
  const play = useSound(enableSound);
  const id = useId();
  const [drag, setDrag] = useState<{ start: number; delta: number } | null>(null);
  const [result, setResult] = useState<number | null>(null);
  const [text, setText] = useState(String(value));
  const [shown, setShown] = useState(value);
  const origin = useRef({ x: 0, v: 0 });
  const resultT = useRef<number | undefined>(undefined);
  const lastTick = useRef(0);
  // One quiet tick per step actually taken (not at the ends, where the value cannot move).
  const tick = (from: number, to: number) => {
    if (from === to) return;
    const now = performance.now();
    if (now - lastTick.current < 40) return;
    lastTick.current = now;
    play("tick", 0.4);
  };
  const clamp = (v: number) => Math.max(min, Math.min(max, v));

  // Keep the text box in step with the value when it changes from outside.
  if (shown !== value) {
    setShown(value);
    setText(String(value));
  }

  useEffect(() => () => clearTimeout(resultT.current), []);

  const down = (e: RPointerEvent) => {
    (e.currentTarget as Element).setPointerCapture(e.pointerId);
    origin.current = { x: e.clientX, v: value };
    setDrag({ start: value, delta: 0 });
    setResult(null);
  };
  const move = (e: RPointerEvent) => {
    if (!drag) return;
    const mult = e.shiftKey ? 10 : e.altKey ? 0.1 : 1;
    const raw = origin.current.v + ((e.clientX - origin.current.x) / 2) * step * mult;
    const v = clamp(Math.round(raw / (step * (e.altKey ? 0.1 : 1))) * step * (e.altKey ? 0.1 : 1));
    tick(Number((drag.start + drag.delta).toFixed(2)), Number(v.toFixed(2)));
    onChange(Number(v.toFixed(2)));
    setDrag({ start: drag.start, delta: Number((v - drag.start).toFixed(2)) });
  };
  const up = () => {
    if (!drag) return;
    if (drag.delta !== 0) {
      setResult(drag.delta);
      clearTimeout(resultT.current);
      resultT.current = window.setTimeout(() => setResult(null), 1400);
    }
    setDrag(null);
  };

  const badge = drag ? drag.delta : result;
  const sign = (n: number) => (n > 0 ? `+${n}` : `${n}`);

  return (
    <div className="flex h-11 items-center gap-3 rounded-xl bg-white px-3 shadow-[0_0_0_1px_rgba(0,0,0,.07)] dark:bg-[#1c1c1e] dark:shadow-[0_0_0_1px_rgba(255,255,255,.1)]">
      <label
        htmlFor={id}
        onPointerDown={down}
        onPointerMove={move}
        onPointerUp={up}
        onPointerCancel={up}
        className="w-16 cursor-ew-resize touch-none select-none text-[13px] font-medium text-[#6e6e73] dark:text-[#a1a1a6]"
      >
        {label}
      </label>
      <div className="relative flex-1">
        <AnimatePresence>
          {badge !== null && badge !== 0 && (
            <motion.span
              key={drag ? "live" : "done"}
              initial={{ opacity: 0, y: 6, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -4, scale: 0.9 }}
              transition={{ type: "spring", stiffness: 600, damping: 28 }}
              className={`pointer-events-none absolute -top-8 left-0 whitespace-nowrap rounded-md px-1.5 py-0.5 text-[11px] font-semibold tabular-nums ${drag ? "text-white" : "bg-[#1d1d1f] text-white dark:bg-[#f5f5f7] dark:text-[#1d1d1f]"}`}
              style={drag ? { background: accent } : undefined}
            >
              {drag ? sign(badge) : `Changed ${sign(badge)}${unit}`}
            </motion.span>
          )}
        </AnimatePresence>
        <input
          id={id}
          value={text}
          inputMode="decimal"
          onPointerDown={down}
          onPointerMove={move}
          onPointerUp={up}
          onChange={(e) => setText(e.target.value)}
          onBlur={() => { const n = Number(text); if (!Number.isNaN(n)) onChange(clamp(n)); else setText(String(value)); }}
          onKeyDown={(e) => {
            if (e.key === "Enter") (e.target as HTMLInputElement).blur();
            if (e.key === "ArrowUp") { e.preventDefault(); const to = clamp(value + step * (e.shiftKey ? 10 : 1)); tick(value, to); onChange(to); }
            if (e.key === "ArrowDown") { e.preventDefault(); const to = clamp(value - step * (e.shiftKey ? 10 : 1)); tick(value, to); onChange(to); }
          }}
          className="w-full cursor-ew-resize bg-transparent text-[14px] font-medium tabular-nums text-[#1d1d1f] outline-none focus:cursor-text dark:text-[#f5f5f7]"
        />
      </div>
      <span className="text-[12px] text-[#86868b] dark:text-[#8e8e93]">{unit}</span>
    </div>
  );
}

export interface ScrubInputsProps {
  /** Badge colour while dragging, and the start of the sample shape's gradient. */
  accent?: string;
  /** Scrubs the three fields by itself until the user touches them. */
  autoplay?: boolean;
  /** Plays interface sounds on interaction. They follow the site-wide sound switch and stay silent in autoplay. */
  enableSound?: boolean;
}

/** A small inspector: radius, rotate and scale fields driving a sample shape. */
export function ScrubInputs({ accent = "#0071e3", autoplay = false, enableSound = true }: ScrubInputsProps) {
  const [radius, setRadius] = useState(28);
  const [rotate, setRotate] = useState(0);
  const [scale, setScale] = useState(100);
  const touched = useRef(false);

  useEffect(() => {
    if (!autoplay) return;
    const seq: [string, number][] = [["r", 60], ["t", -15], ["s", 120], ["r", 6], ["t", 12], ["s", 90], ["r", 28], ["t", 0], ["s", 100]];
    let k = 0;
    const tm = setInterval(() => {
      if (touched.current) return clearInterval(tm);
      const [key, v] = seq[k++ % seq.length];
      if (key === "r") setRadius(v);
      if (key === "t") setRotate(v);
      if (key === "s") setScale(v);
    }, 1100);
    return () => clearInterval(tm);
  }, [autoplay]);

  return (
    <div className="flex w-full max-w-[460px] flex-wrap items-center justify-center gap-8" onPointerDown={() => { touched.current = true; }}>
      <div className="flex h-[200px] w-[180px] items-center justify-center">
        <motion.div
          className="h-[120px] w-[120px]"
          animate={{ borderRadius: radius, rotate, scale: scale / 100 }}
          transition={{ type: "spring", stiffness: 300, damping: 22 }}
          style={{ background: `linear-gradient(140deg, ${accent}, #5e5ce6)`, boxShadow: "0 24px 40px -18px rgba(0,0,0,.4)" }}
        />
      </div>
      <div className="flex w-[230px] flex-col gap-2.5">
        <ScrubInput label="Radius" value={radius} onChange={setRadius} min={0} max={60} unit="px" accent={accent} enableSound={enableSound} />
        <ScrubInput label="Rotate" value={rotate} onChange={setRotate} min={-180} max={180} unit="°" accent={accent} enableSound={enableSound} />
        <ScrubInput label="Scale" value={scale} onChange={setScale} min={50} max={150} unit="%" accent={accent} enableSound={enableSound} />
        <span className="pt-1 text-[12px] text-[#86868b] dark:text-[#8e8e93]">Drag a label sideways. Shift for big steps.</span>
      </div>
    </div>
  );
}
