# Tank Recorder

Add the "Tank Recorder" component from Nexus UI to my project.

A voice memo button over a glass tank seen from the side. While you hold to record, your simulated voice shakes a pin in the water and the surface carries it as real waves that bounce off the glass. The timer sits behind the water, so the part below the line wobbles with the voice. Let go and the memo drops into a list with its waveform.

Please:

1. Create the files below at sensible paths for this project, keeping each file's name. They import each other with relative paths, so keep them together.
2. Install what it needs: `framer-motion`, `clsx`, `tailwind-merge` (use this project's package manager).
3. It is styled with Tailwind CSS classes, so the project needs Tailwind.
4. It imports `cn` from `@/lib/utils`. If the project has no such helper, create it from the file below.
5. Use it like this: `import { TankRecorder } from "@/components/tank-recorder";`. The props are typed and documented in the code.

Copy the code exactly as it is. Do not restyle, simplify or rename anything, and keep the comments: they explain why the numbers are what they are. The only thing to adapt is import paths, if this project uses a different alias than `@/`.

--- components/tank-recorder/index.ts ---

```ts
export { TankRecorder } from "./tank-recorder";
export type { TankRecorderProps } from "./tank-recorder";
```

--- components/tank-recorder/tank-recorder.tsx ---

```tsx
"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent as RKeyboardEvent, type RefObject } from "react";
import { AnimatePresence, motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";

/** True while the element is on screen and the tab is visible. Only observes when `enabled`. */
function useDemoActive(ref: RefObject<HTMLElement | null>, enabled: boolean) {
  const [active, setActive] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!enabled || !el) return;
    let shown = !document.hidden;
    let inView = false;
    const sync = () => setActive(shown && inView);
    const io = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      sync();
    });
    io.observe(el);
    const onVisibility = () => {
      shown = !document.hidden;
      sync();
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      setActive(false);
    };
  }, [ref, enabled]);
  return active;
}


const N = 72;
const W = 300;
const H = 200;
const REST = 104;
const PIN = 0.14;

type Memo = { id: number; name: string; secs: number; bars: number[] };

const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

/**
 * Tank Recorder: a voice memo button over a glass tank seen from the side. While you
 * hold to record, your (simulated) voice shakes a pin in the water and the surface
 * carries it as real waves that bounce off the glass. The timer sits behind the water,
 * so the part below the line wobbles with the voice. Let go and the memo drops into
 * the list with its waveform. Space or Enter also records while held.
 */
export interface TankRecorderProps {
  /** Records a short simulated take, saves it, and goes again until someone touches the button. Pauses off screen and never runs under reduced motion. */
  autoplay?: boolean;
  /** Extra classes for the card. */
  className?: string;
}

export function TankRecorder({ autoplay = false, className }: TankRecorderProps) {
  const uid = useId().replace(/:/g, "");
  const reduce = useReducedMotion() ?? false;
  const cardRef = useRef<HTMLDivElement>(null);
  const onScreen = useDemoActive(cardRef, true);
  const onScreenRef = useRef(false);
  const activeAuto = useDemoActive(cardRef, autoplay && !reduce);
  const touched = useRef(false);
  const pathRef = useRef<SVGPathElement>(null);
  const lineRef = useRef<SVGPathElement>(null);
  const clipRef = useRef<SVGPathElement>(null);
  const turbRef = useRef<SVGFEDisplacementMapElement>(null);
  const [recording, setRecording] = useState(false);
  const recRef = useRef(false);
  useEffect(() => {
    recRef.current = recording;
    onScreenRef.current = onScreen;
  });
  const [memos, setMemos] = useState<Memo[]>([
    { id: 1, name: "Chorus idea", secs: 12, bars: Array.from({ length: 28 }, (_, i) => 0.25 + 0.6 * Math.abs(Math.sin(i * 0.7) * Math.cos(i * 0.23))) },
  ]);
  const level = useMotionValue(0);
  const pinX = useSpring(0, { stiffness: 900, damping: 12 });
  const secs = useMotionValue(0);
  const timerA = useRef<SVGTextElement>(null);
  const timerB = useRef<SVGTextElement>(null);
  const ringScale = useTransform(level, [0, 1], [1, 1.35]);
  useEffect(() => {
    let shown = "";
    return secs.on("change", (v) => {
      const txt = fmt(v);
      if (txt === shown) return;
      shown = txt;
      if (timerA.current) timerA.current.textContent = txt;
      if (timerB.current) timerB.current.textContent = txt;
    });
  }, [secs]);
  const capture = useRef<number[]>([]);
  const recStart = useRef(0);
  const nextId = useRef(2);

  // wave simulation
  useEffect(() => {
    const h = new Float32Array(N), v = new Float32Array(N);
    const pin = Math.round(PIN * (N - 1));
    let raf = 0, t = 0, last = performance.now(), syl = 0, sylT = 0, lv = 0;
    const frame = (now: number) => {
      const dt = Math.min(0.033, (now - last) / 1000);
      last = now;
      if (!onScreenRef.current && !recRef.current) {
        raf = requestAnimationFrame(frame);
        return;
      }
      t += dt;
      // simulated voice: syllables with random length and loudness
      let target = 0;
      if (recRef.current) {
        sylT -= dt;
        if (sylT <= 0) {
          syl = Math.random() < 0.18 ? 0 : 0.35 + Math.random() * 0.65;
          sylT = 0.08 + Math.random() * 0.22;
        }
        target = syl * (0.75 + 0.25 * Math.sin(t * 31));
        if (recStart.current === 0) recStart.current = now;
        secs.set((now - recStart.current) / 1000);
        if (capture.current.length < 400) capture.current.push(target);
      }
      lv += (target - lv) * 0.35;
      level.set(lv);
      pinX.set(recRef.current ? Math.sin(t * 60) * lv * 3 : 0);
      // drive + integrate (a few substeps for stability)
      for (let s = 0; s < 4; s++) {
        if (lv > 0.01) h[pin] = Math.sin((t + s * 0.004) * 15) * lv * 20;
        for (let i = 0; i < N; i++) {
          const l = h[i === 0 ? 1 : i - 1];
          const r = h[i === N - 1 ? N - 2 : i + 1];
          v[i] += (l + r - 2 * h[i]) * 0.42 - h[i] * 0.004;
          v[i] *= 0.993;
        }
        for (let i = 0; i < N; i++) h[i] = Math.max(-38, Math.min(38, h[i] + v[i] * 0.5));
      }
      // idle swell so the water never looks frozen
      let d = "";
      let top = "";
      for (let i = 0; i < N; i++) {
        const x = (i / (N - 1)) * W;
        const y = REST + h[i] + Math.sin(t * 1.6 + i * 0.18) * 0.8;
        const seg = `${i === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(2)}`;
        d += seg;
        top += seg;
      }
      const fill = `${d}L${W} ${H}L0 ${H}Z`;
      pathRef.current?.setAttribute("d", fill);
      clipRef.current?.setAttribute("d", fill);
      lineRef.current?.setAttribute("d", top);
      turbRef.current?.setAttribute("scale", String(3 + lv * 14));
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [level, pinX, secs]);

  const startRec = () => {
    if (recRef.current) return;
    secs.set(0);
    recStart.current = 0;
    capture.current = [];
    setRecording(true);
  };
  const stopRec = () => {
    if (!recRef.current) return;
    setRecording(false);
    const c = capture.current;
    const s = secs.get();
    if (s < 0.4) return;
    const bars = Array.from({ length: 28 }, (_, i) => {
      const a = Math.floor((i / 28) * c.length), b = Math.max(a + 1, Math.floor(((i + 1) / 28) * c.length));
      let m = 0;
      for (let j = a; j < b; j++) m = Math.max(m, c[j] || 0);
      return 0.15 + m * 0.85;
    });
    const id = nextId.current++;
    setMemos((ms) => [{ id, name: `Memo ${id}`, secs: Math.max(1, Math.round(s)), bars }, ...ms].slice(0, 3));
  };

  useEffect(() => {
    if (!autoplay || reduce || !activeAuto) return;
    let t: number;
    const loop = () => {
      if (touched.current) return;
      startRec();
      t = window.setTimeout(() => {
        if (touched.current) return;
        stopRec();
        t = window.setTimeout(loop, 2600);
      }, 2600 + Math.random() * 1500);
    };
    t = window.setTimeout(loop, 1200);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoplay, reduce, activeAuto]);

  const onKeyDown = (e: RKeyboardEvent<HTMLButtonElement>) => {
    if ((e.key === " " || e.key === "Enter") && !e.repeat) {
      e.preventDefault();
      touched.current = true;
      startRec();
    }
  };
  const onKeyUp = (e: RKeyboardEvent<HTMLButtonElement>) => {
    if (e.key === " " || e.key === "Enter") stopRec();
  };

  const font = "-apple-system, BlinkMacSystemFont, 'SF Pro Display', system-ui, sans-serif";

  return (
    <div ref={cardRef} className={cn("w-[340px] max-w-full rounded-[24px] bg-white p-5 dark:bg-[#1c1c1e] shadow-[0_0_0_1px_rgba(0,0,0,.05),0_20px_40px_-26px_rgba(0,0,0,.35)] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08)]", className)} style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', system-ui, sans-serif" }}>
      <div className="relative overflow-hidden rounded-[18px] bg-[#f5f5f7] shadow-[inset_0_0_0_1px_rgba(0,0,0,.06)] dark:bg-[#2c2c2e] dark:shadow-[inset_0_0_0_1px_rgba(255,255,255,.08)]">
        <svg viewBox={`0 0 ${W} ${H}`} className="block w-full" role="img" aria-label={recording ? "Recording. The water surface moves with your voice." : "Water tank, still"}>
          <defs>
            <linearGradient id={`${uid}-w`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#5ac8fa" stopOpacity="0.55" />
              <stop offset="1" stopColor="#0071e3" stopOpacity="0.85" />
            </linearGradient>
            <clipPath id={`${uid}-under`}>
              <path ref={clipRef} d={`M0 ${REST}L${W} ${REST}L${W} ${H}L0 ${H}Z`} />
            </clipPath>
            <filter id={`${uid}-wob`} x="-10%" y="-10%" width="120%" height="120%">
              <feTurbulence type="turbulence" baseFrequency="0.015 0.09" numOctaves="1" seed="4" result="n">
                <animate attributeName="seed" values="1;2;3;4;5;6" dur="0.6s" repeatCount="indefinite" />
              </feTurbulence>
              <feDisplacementMap ref={turbRef} in="SourceGraphic" in2="n" scale="3" xChannelSelector="R" yChannelSelector="G" />
            </filter>
          </defs>
          {/* timer behind the glass */}
          <text ref={timerA} x={W / 2} y="128" textAnchor="middle" fontSize="68" fontWeight="700" letterSpacing="-3" className="fill-[#1d1d1f] dark:fill-[#f5f5f7]" fontFamily={font} style={{ fontVariantNumeric: "tabular-nums" }}>
            0:00
          </text>
          {/* water body */}
          <path ref={pathRef} d={`M0 ${REST}L${W} ${REST}L${W} ${H}L0 ${H}Z`} fill={`url(#${uid}-w)`} />
          {/* refracted copy of the timer, only below the surface */}
          <g clipPath={`url(#${uid}-under)`}>
            <g filter={`url(#${uid}-wob)`} transform={`translate(${W / 2} 128) scale(1.06 1.02) translate(${-W / 2} -128)`}>
              <text ref={timerB} x={W / 2 + 3} y="128" textAnchor="middle" fontSize="68" fontWeight="700" letterSpacing="-3" fill="#ffffff" fontFamily={font} style={{ fontVariantNumeric: "tabular-nums" }}>
                0:00
              </text>
            </g>
          </g>
          <path ref={lineRef} d={`M0 ${REST}L${W} ${REST}`} fill="none" stroke="#ffffff" strokeOpacity="0.9" strokeWidth="2" />
          {/* the pin */}
          <motion.g style={{ x: pinX }}>
            <rect x={W * PIN - 2.5} y="0" width="5" height="138" rx="2.5" className="fill-[#1d1d1f] dark:fill-[#f5f5f7]" />
            <circle cx={W * PIN} cy="138" r="5" className="fill-[#1d1d1f] dark:fill-[#f5f5f7]" />
          </motion.g>
        </svg>
      </div>

      <div className="mt-4 flex items-center justify-center">
        <div className="relative">
          <motion.span aria-hidden="true" className="absolute inset-0 rounded-full bg-[#ff3b30]/20" style={{ scale: ringScale }} />
          <motion.button
            type="button"
            aria-pressed={recording}
            aria-label={recording ? "Recording. Release to save." : "Hold to record a voice memo"}
            onPointerDown={(e) => {
              touched.current = true;
              e.currentTarget.setPointerCapture(e.pointerId);
              startRec();
            }}
            onPointerUp={stopRec}
            onPointerCancel={stopRec}
            onKeyDown={onKeyDown}
            onKeyUp={onKeyUp}
            onBlur={stopRec}
            whileTap={{ scale: 0.92 }}
            className="relative flex h-16 w-16 touch-none select-none items-center justify-center rounded-full bg-white shadow-[0_0_0_4px_#e8e8ed] outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] focus-visible:ring-offset-4 dark:bg-[#2c2c2e] dark:shadow-[0_0_0_4px_#3a3a3c] dark:ring-offset-[#1c1c1e]"
          >
            <motion.span
              className="block bg-[#ff3b30]"
              animate={recording ? { width: 24, height: 24, borderRadius: 6 } : { width: 48, height: 48, borderRadius: 24 }}
              transition={{ type: "spring", stiffness: 520, damping: 22 }}
            />
          </motion.button>
        </div>
      </div>

      <ul className="m-0 mt-4 flex list-none flex-col gap-2 p-0" aria-label="Voice memos">
        <AnimatePresence initial={false} mode="popLayout">
          {memos.map((m) => (
            <motion.li
              key={m.id}
              layout
              initial={{ opacity: 0, y: -24, scale: 0.92 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: "spring", stiffness: 420, damping: 28 }}
              className="flex items-center gap-3 rounded-[14px] bg-[#f5f5f7] px-3 py-2 dark:bg-[#2c2c2e]"
            >
              <div className="min-w-0 flex-none">
                <div className="text-[13px] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">{m.name}</div>
                <div className="text-[12px] tabular-nums text-[#6e6e73] dark:text-[#a1a1a6]">{fmt(m.secs)}</div>
              </div>
              <div className="flex h-6 flex-1 items-center gap-[2px]" aria-hidden="true">
                {m.bars.map((b, i) => (
                  <motion.span
                    key={i}
                    className="block w-full rounded-full bg-[#0071e3]"
                    initial={{ scaleY: 0 }}
                    animate={{ scaleY: 1 }}
                    transition={{ type: "spring", stiffness: 500, damping: 18, delay: i * 0.012 }}
                    style={{ height: `${b * 100}%` }}
                  />
                ))}
              </div>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
      <p className="m-0 mt-3 text-center text-[12px] text-[#6e6e73] dark:text-[#a1a1a6]">Hold the button and talk. The water carries your voice.</p>
    </div>
  );
}
```

--- lib/utils.ts ---

```ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```
