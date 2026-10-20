"use client";
// Aurora copy of the Motion Kit Bolting Sliders: the settings, title and hint
// are props, and the autoplay values are deterministic.
import { useEffect, useRef, useState, type PointerEvent as RPointerEvent } from "react";
import { animate, motion, useMotionValue } from "framer-motion";

export interface Setting { id: string; label: string; min: number; max: number; unit: string; value: number }

const SETTINGS: Setting[] = [
  { id: "exp", label: "Exposure", min: -2, max: 2, unit: " EV", value: 0.4 },
  { id: "bloom", label: "Bloom", min: 0, max: 100, unit: "%", value: 35 },
  { id: "fov", label: "Field of view", min: 30, max: 110, unit: "°", value: 72 },
  { id: "samples", label: "Samples", min: 8, max: 256, unit: "", value: 64 },
];

const TW = 300;

function fmt(s: Setting, v: number) {
  const n = s.max - s.min <= 5 ? v.toFixed(1) : Math.round(v).toString();
  return `${v > 0 && s.min < 0 ? "+" : ""}${n}${s.unit}`;
}

/**
 * Click anywhere on a track and the knob doesn't slide there: it leaps in a
 * ballistic arc, leaving a dotted trail and still reading out its value, then
 * lands in the groove with a squash. Dragging the knob works as usual.
 */
function BoltSlider({ s, accent, demo }: { s: Setting; accent: string; demo?: number }) {
  const toX = (v: number) => ((v - s.min) / (s.max - s.min)) * TW;
  const [value, setValue] = useState(s.value);
  const x = useMotionValue(toX(s.value));
  const y = useMotionValue(0);
  const sq = useMotionValue(1);
  const [trail, setTrail] = useState<{ x: number; y: number; id: number }[]>([]);
  const track = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const tid = useRef(0);

  const leap = (tx: number) => {
    const x0 = x.get();
    const dist = Math.abs(tx - x0);
    const peak = -Math.min(90, 30 + dist * 0.45);
    const dur = 0.35 + Math.min(0.45, dist / 600);
    const pts: { x: number; y: number; id: number }[] = [];
    animate(0, 1, {
      duration: dur,
      ease: "linear",
      onUpdate: (t) => {
        const cx = x0 + (tx - x0) * t;
        const cy = 4 * peak * t * (1 - t);
        x.set(cx);
        y.set(cy);
        const v = s.min + (cx / TW) * (s.max - s.min);
        setValue(v);
        if (pts.length === 0 || Math.hypot(cx - pts[pts.length - 1].x, cy - pts[pts.length - 1].y) > 9) {
          pts.push({ x: cx, y: cy, id: tid.current++ });
          setTrail([...pts]);
        }
      },
      onComplete: () => {
        animate(sq, [0.6, 1.15, 1], { duration: 0.35 });
        setTimeout(() => setTrail([]), 500);
      },
    });
  };

  useEffect(() => {
    if (demo === undefined) return;
    leap(toX(demo));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [demo]);

  const fromEvent = (e: RPointerEvent) => {
    const r = track.current!.getBoundingClientRect();
    return Math.max(0, Math.min(TW, ((e.clientX - r.left) / r.width) * TW));
  };

  return (
    <div className="flex w-[300px] flex-col gap-2">
      <div className="flex justify-between text-[13px]">
        <span className="font-medium text-[#1d1d1f]">{s.label}</span>
        <span className="tabular-nums text-[#6e6e73]">{fmt(s, value)}</span>
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
          setValue(s.min + (nx / TW) * (s.max - s.min));
        }}
        onPointerUp={() => (dragging.current = false)}
      >
        <span className="absolute inset-x-0 top-1/2 h-[3px] -translate-y-1/2 rounded-full bg-[#e8e8ed]" />
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
          onPointerDown={(e) => { dragging.current = true; (e.currentTarget.parentElement as Element).setPointerCapture(e.pointerId); }}
          onKeyDown={(e) => {
            const step = (s.max - s.min) / 20;
            if (e.key === "ArrowRight") leap(toX(Math.min(s.max, value + step)));
            if (e.key === "ArrowLeft") leap(toX(Math.max(s.min, value - step)));
          }}
          className="absolute left-0 top-1/2 h-[18px] w-[18px] cursor-grab rounded-full bg-white shadow-[0_2px_8px_rgba(0,0,0,.25),0_0_0_.5px_rgba(0,0,0,.1)] outline-none focus-visible:ring-2 focus-visible:ring-offset-2 active:cursor-grabbing"
          style={{ x, y, scaleY: sq, marginLeft: -9, marginTop: -9, originY: 1, ["--tw-ring-color" as string]: accent }}
        />
      </div>
    </div>
  );
}

export default function CanarySliders({ accent = "#047857", autoplay = false, settings = SETTINGS, title = "Render settings", hint = "Click a track and watch the knob jump.", demoValues }: { accent?: string; autoplay?: boolean; settings?: Setting[]; title?: string; hint?: string; demoValues?: number[][] }) {
  const SETTINGS_ = settings;
  const [demo, setDemo] = useState<(number | undefined)[]>(SETTINGS_.map(() => undefined));
  const touched = useRef(false);

  useEffect(() => {
    if (!autoplay) return;
    let k = 0;
    const t = setInterval(() => {
      if (touched.current) return clearInterval(t);
      const step = k++;
      const i = step % SETTINGS_.length;
      const s = SETTINGS_[i];
      const pick = demoValues?.[i]?.[Math.floor(step / SETTINGS_.length) % (demoValues[i].length || 1)];
      setDemo((d) => d.map((v, j) => (j === i ? (pick ?? s.min + ((step * 0.37) % 1) * (s.max - s.min)) : v)));
    }, 1400);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoplay]);

  return (
    <div className="flex flex-col gap-5 rounded-[24px] bg-white px-7 py-6 shadow-[0_0_0_1px_rgba(0,0,0,.05),0_20px_40px_-26px_rgba(0,0,0,.35)]" onPointerDown={() => (touched.current = true)}>
      <span className="text-[12px] font-semibold uppercase tracking-[0.1em] text-[#6e6e73]">{title}</span>
      {SETTINGS_.map((s, i) => <BoltSlider key={s.id} s={s} accent={accent} demo={demo[i]} />)}
      <span className="text-[12px] text-[#6e6e73]">{hint}</span>
    </div>
  );
}
