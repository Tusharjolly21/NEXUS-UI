# Voice Orb

Add the "Voice Orb" component from Nexus UI to my project.

One shape for an assistant's four states. Hold it to talk: a dotted ring becomes a glow, a dark thinking sphere, then a churning voice.

Please:

1. Create the files below at sensible paths for this project, keeping each file's name. They import each other with relative paths, so keep them together.
2. Install what it needs: `framer-motion` (use this project's package manager).
3. It is styled with Tailwind CSS classes, so the project needs Tailwind.
4. Use it like this: `import { VoiceOrb } from "@/components/voice-orb";`. The props are typed and documented in the code.

Copy the code exactly as it is. Do not restyle, simplify or rename anything, and keep the comments: they explain why the numbers are what they are. The only thing to adapt is import paths, if this project uses a different alias than `@/`.

--- components/voice-orb/index.ts ---

```ts
export { VoiceOrb } from "./voice-orb";
export type { VoiceOrbProps, OrbState } from "./voice-orb";
```

--- components/voice-orb/voice-orb.tsx ---

```tsx
"use client";
import { useEffect, useId, useRef, useState, type KeyboardEvent as RKeyboardEvent } from "react";
import { animate, motion, useMotionValue } from "framer-motion";

export type OrbState = "idle" | "listening" | "thinking" | "speaking";

type OrbParams = { r: number; amp: number; speed: number; fill: number; ring: number; glow: number; dark: number };

const TARGETS: Record<OrbState, OrbParams> = {
  idle: { r: 58, amp: 0, speed: 0.4, fill: 0, ring: 1, glow: 0, dark: 0 },
  listening: { r: 64, amp: 3, speed: 1.2, fill: 1, ring: 0, glow: 1, dark: 0 },
  thinking: { r: 50, amp: 0.6, speed: 0.6, fill: 1, ring: 0, glow: 0.2, dark: 1 },
  speaking: { r: 62, amp: 9, speed: 3.2, fill: 1, ring: 0, glow: 0.7, dark: 0 },
};

export interface VoiceOrbProps {
  accent?: string;
  /** Walks through listening, thinking and speaking by itself until pressed. */
  autoplay?: boolean;
}

/**
 * One shape for four assistant states. Every parameter (radius, wobble, speed,
 * glow, darkness) is a motion value, so switching state springs between them
 * and the outline is rebuilt each frame from layered sine noise.
 */
export function VoiceOrb({ accent = "#0071e3", autoplay = false }: VoiceOrbProps) {
  const gid = "o" + useId().replace(/[^a-zA-Z0-9]/g, "");
  const [state, setState] = useState<OrbState>("idle");
  const r = useMotionValue(TARGETS.idle.r);
  const amp = useMotionValue(0);
  const speed = useMotionValue(0.4);
  const fill = useMotionValue(0);
  const ring = useMotionValue(1);
  const glow = useMotionValue(0);
  const dark = useMotionValue(0);
  const path = useMotionValue("");
  const level = useRef(0);
  const touched = useRef(false);
  const timers = useRef<number[]>([]);

  useEffect(() => {
    const t = TARGETS[state];
    const mv = { r, amp, speed, fill, ring, glow, dark };
    (Object.keys(t) as (keyof OrbParams)[]).forEach((k) => animate(mv[k], t[k], { type: "spring", stiffness: 120, damping: 16 }));
  }, [state, r, amp, speed, fill, ring, glow, dark]);

  useEffect(() => {
    let raf = 0;
    let phase = 0;
    let last = performance.now();
    const N = 72;
    const loop = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      phase += dt * speed.get();
      // Fake voice level: bursts of syllables.
      const target = state === "speaking" || state === "listening" ? 0.4 + 0.6 * Math.abs(Math.sin(now / 130) * Math.sin(now / 410)) : 0;
      level.current += (target - level.current) * 0.2;
      const a0 = amp.get() * (0.5 + level.current);
      const r0 = r.get() + level.current * (state === "listening" ? 6 : 2);
      let d = "";
      for (let i = 0; i <= N; i++) {
        const a = (i / N) * Math.PI * 2;
        const n = Math.sin(a * 3 + phase * 2.1) * 0.5 + Math.sin(a * 5 - phase * 2.9) * 0.3 + Math.sin(a * 7 + phase * 3.7) * 0.2;
        const rr = r0 + n * a0;
        const x = 100 + Math.cos(a) * rr, y = 100 + Math.sin(a) * rr;
        d += (i ? " L " : "M ") + x.toFixed(2) + " " + y.toFixed(2);
      }
      path.set(d + " Z");
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [state, speed, amp, r, path]);

  const clear = () => { timers.current.forEach(clearTimeout); timers.current = []; };

  useEffect(() => {
    if (!autoplay) return;
    const flow = () => {
      if (touched.current) return;
      clear();
      setState("listening");
      timers.current.push(window.setTimeout(() => setState("thinking"), 1800));
      timers.current.push(window.setTimeout(() => setState("speaking"), 3300));
      timers.current.push(window.setTimeout(() => setState("idle"), 6200));
    };
    const a = setTimeout(flow, 700);
    const b = setInterval(flow, 7400);
    return () => { clearTimeout(a); clearInterval(b); clear(); };
  }, [autoplay]);

  const press = () => {
    touched.current = true;
    clear();
    setState("listening");
  };
  const release = () => {
    if (state !== "listening") return;
    setState("thinking");
    timers.current.push(window.setTimeout(() => setState("speaking"), 1400));
    timers.current.push(window.setTimeout(() => setState("idle"), 4200));
  };
  const isTalkKey = (e: RKeyboardEvent) => e.key === " " || e.key === "Enter";

  return (
    <div className="flex flex-col items-center gap-6">
      <motion.button
        type="button"
        aria-label="Hold to talk"
        onPointerDown={press}
        onPointerUp={release}
        onKeyDown={(e) => {
          if (!isTalkKey(e)) return;
          e.preventDefault();
          if (!e.repeat) press();
        }}
        onKeyUp={(e) => {
          if (!isTalkKey(e)) return;
          e.preventDefault();
          release();
        }}
        whileTap={{ scale: 0.96 }}
        className="relative h-[200px] w-[200px] touch-none rounded-full outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] focus-visible:ring-offset-4 dark:focus-visible:ring-[#0a84ff] dark:focus-visible:ring-offset-black"
      >
        <svg width="200" height="200" viewBox="0 0 200 200" className="overflow-visible" aria-hidden="true">
          <defs>
            <radialGradient id={`${gid}-fill`} cx="38%" cy="32%" r="75%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="45%" stopColor={accent} stopOpacity="0.85" />
              <stop offset="100%" stopColor="#5e5ce6" />
            </radialGradient>
            {/* The thinking sphere lifts a few shades in dark mode so it still reads against black. */}
            <radialGradient id={`${gid}-dark`} cx="35%" cy="30%" r="80%">
              <stop offset="0%" className="[stop-color:#6e6e73] dark:[stop-color:#aeaeb2]" />
              <stop offset="55%" className="[stop-color:#1d1d1f] dark:[stop-color:#48484a]" />
              <stop offset="100%" className="[stop-color:#000] dark:[stop-color:#2c2c2e]" />
            </radialGradient>
            <filter id={`${gid}-blur`} x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="16" />
            </filter>
          </defs>
          <motion.path d={path} fill={accent} filter={`url(#${gid}-blur)`} style={{ opacity: glow }} />
          <motion.path d={path} fill={`url(#${gid}-fill)`} style={{ opacity: fill }} />
          <motion.path d={path} fill={`url(#${gid}-dark)`} style={{ opacity: dark }} />
          {state === "thinking" && (
            <motion.ellipse cx="100" cy="100" rx="38" ry="10" fill="rgba(255,255,255,.18)" animate={{ rotate: 360 }} transition={{ duration: 1.6, repeat: Infinity, ease: "linear" }} />
          )}
          <motion.path
            d={path}
            fill="none"
            className="stroke-[#1d1d1f] dark:stroke-[#f5f5f7]"
            strokeWidth="2"
            strokeDasharray="3 7"
            strokeLinecap="round"
            style={{ opacity: ring }}
            animate={{ rotate: 360 }}
            transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
          />
        </svg>
      </motion.button>
      <div role="group" aria-label="Orb state" className="relative grid grid-cols-4 rounded-xl bg-[#e8e8ed] p-[3px] dark:bg-[#3a3a3c]">
        {(Object.keys(TARGETS) as OrbState[]).map((s) => (
          <button
            key={s}
            type="button"
            aria-pressed={state === s}
            onClick={() => { touched.current = true; clear(); setState(s); }}
            className="relative z-10 h-8 rounded-[9px] px-3.5 text-[13px] font-medium capitalize text-[#1d1d1f] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#0071e3] dark:text-[#f5f5f7]"
          >
            {state === s && (
              <motion.span
                layoutId={`${gid}-seg`}
                transition={{ type: "spring", stiffness: 420, damping: 32 }}
                className="absolute inset-0 -z-10 rounded-[9px] bg-white shadow-[0_2px_6px_rgba(0,0,0,.1),0_0_0_.5px_rgba(0,0,0,.04)] dark:bg-[#636366]"
              />
            )}
            {s}
          </button>
        ))}
      </div>
      <span className="text-[13px] text-[#86868b] dark:text-[#98989d]">Press and hold the orb to talk.</span>
    </div>
  );
}
```
