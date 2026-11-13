# Neon Star Rating

Add the "Neon Star Rating" component from Nexus UI to my project.

A star rating in neon: five star-shaped glass tubes on a brick wall, each bent round ten corners and held off the bricks by two small brackets. Off, they are grey glass. Choose a score and the tubes up to it strike one after another: a click from the transformer, a stutter of flickers with a crackle on each and a short buzz, then a steady amber glow that washes over the bricks around it. Lower the score and the rest drop out with a fading afterglow. Pointing at a star warms the tubes up to it, and now and then a lit tube stutters the way old neon does. It is a radio group with arrow keys, and the score is read out in a polite live region.

Please:

1. Create the files below at sensible paths for this project, keeping each file's name. They import each other with relative paths, so keep them together.
2. Install what it needs: `framer-motion` (use this project's package manager).
3. It is styled with Tailwind CSS classes, so the project needs Tailwind.
4. It uses `@/lib/ui-sounds` for its interaction sounds, which are synthesised in the browser, so no audio files are needed. Create it at lib/ from the file below.
5. Use it like this: `import { NeonStarRating } from "@/components/neon-star-rating";`. The props are typed and documented in the code.

Copy the code exactly as it is. Do not restyle, simplify or rename anything, and keep the comments: they explain why the numbers are what they are. The only thing to adapt is import paths, if this project uses a different alias than `@/`.

--- components/neon-star-rating/index.ts ---

```ts
export { default as NeonStarRating } from "./neon-star-rating";
export type { NeonStarRatingProps } from "./neon-star-rating";
```

--- components/neon-star-rating/neon-star-rating.tsx ---

```tsx
"use client";

import { AnimatePresence, animate, motion, useInView, useMotionValue, useReducedMotion, type MotionValue } from "framer-motion";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { useAutoplaySoundAllowed, useSoundsEnabled } from "@/lib/ui-sounds";

export type NeonStarRatingProps = {
  /** 0 for none, up to 5 */
  value?: number;
  defaultValue?: number;
  onChange?: (value: number) => void;
  question?: string;
  /** the word for each score, 1 to 5 */
  labels?: [string, string, string, string, string];
  /** Soft synthesised sounds, scored to the motion. They also follow the site-wide sound switch. */
  enableSound?: boolean;
  /** 0 to 1 */
  volume?: number;
  autoplay?: boolean;
  className?: string;
};

// ───────────── sound: small synthesised notes, no audio files. The browser keeps it silent until the visitor has
// clicked or pressed a key somewhere on the page, so autoplay only makes sound once someone is using the page. ─────────────

type Engine = { ctx: AudioContext; noise: AudioBuffer };
const ENGINE_KEY = "__uiSoundEngine";
const engine = () => (globalThis as unknown as Record<string, Engine | undefined>)[ENGINE_KEY] ?? null;
function unlockAudio() {
  const g = globalThis as unknown as Record<string, Engine | undefined>;
  const e = g[ENGINE_KEY];
  if (e) {
    if (e.ctx.state === "suspended") void e.ctx.resume();
    return;
  }
  const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return;
  const ctx = new AC();
  const noise = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
  const d = noise.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  g[ENGINE_KEY] = { ctx, noise };
}

type NoteOpts = { at?: number; dur?: number; gain?: number; type?: OscillatorType; glide?: number; bell?: number };
type Sound = {
  /** a soft glassy note: a sine with a faint bell partial above it */
  note: (freq: number, o?: NoteOpts) => void;
  /** air moving: filtered noise swept from one pitch to another */
  whoosh: (from: number, to: number, o?: { at?: number; dur?: number; gain?: number }) => void;
  /** a tiny dry click */
  tick: (o?: { at?: number; freq?: number; gain?: number }) => void;
};

function useSound(enabled: boolean, volume: number, allow: () => boolean = () => true): Sound {
  useEffect(() => {
    if (!enabled) return;
    window.addEventListener("pointerdown", unlockAudio, true);
    window.addEventListener("keydown", unlockAudio, true);
    return () => {
      window.removeEventListener("pointerdown", unlockAudio, true);
      window.removeEventListener("keydown", unlockAudio, true);
    };
  }, [enabled]);
  const on = useRef(enabled);
  const vol = useRef(Math.max(0, Math.min(1, volume)));
  const allowRef = useRef(allow);
  useEffect(() => {
    on.current = enabled;
    vol.current = Math.max(0, Math.min(1, volume));
    allowRef.current = allow;
  });
  return useMemo(() => {
    const live = () => {
      const e = engine();
      return e && on.current && allowRef.current() && vol.current > 0 && e.ctx.state === "running" ? e : null;
    };
    const env = (ctx: AudioContext, t: number, peak: number, attack: number, dur: number) => {
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(Math.max(0.0002, peak), t + attack);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      return g;
    };
    return {
      note(freq, o = {}) {
        const e = live();
        if (!e) return;
        const { ctx } = e;
        const t = ctx.currentTime + 0.01 + (o.at ?? 0);
        const dur = o.dur ?? 0.3;
        const peak = (o.gain ?? 0.14) * vol.current;
        const lp = ctx.createBiquadFilter();
        lp.type = "lowpass";
        lp.frequency.value = 7000;
        lp.connect(ctx.destination);
        const g = env(ctx, t, peak, 0.006, dur);
        g.connect(lp);
        const a = ctx.createOscillator();
        a.type = o.type ?? "sine";
        a.frequency.setValueAtTime(freq, t);
        if (o.glide) a.frequency.exponentialRampToValueAtTime(o.glide, t + dur * 0.6);
        a.connect(g);
        a.start(t);
        a.stop(t + dur + 0.05);
        const bell = o.bell ?? 0.25;
        if (bell > 0) {
          const g2 = env(ctx, t, peak * bell, 0.003, dur * 0.4);
          g2.connect(lp);
          const b = ctx.createOscillator();
          b.frequency.setValueAtTime(freq * 2.76, t);
          if (o.glide) b.frequency.exponentialRampToValueAtTime(o.glide * 2.76, t + dur * 0.6);
          b.connect(g2);
          b.start(t);
          b.stop(t + dur * 0.4 + 0.05);
        }
      },
      whoosh(from, to, o = {}) {
        const e = live();
        if (!e) return;
        const { ctx, noise } = e;
        const t = ctx.currentTime + 0.01 + (o.at ?? 0);
        const dur = Math.min(0.95, o.dur ?? 0.4);
        const src = ctx.createBufferSource();
        src.buffer = noise;
        const bp = ctx.createBiquadFilter();
        bp.type = "bandpass";
        bp.Q.value = 1.1;
        bp.frequency.setValueAtTime(from, t);
        bp.frequency.exponentialRampToValueAtTime(to, t + dur);
        const g = ctx.createGain();
        const peak = (o.gain ?? 0.08) * vol.current;
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(Math.max(0.0002, peak), t + dur * 0.35);
        g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
        src.connect(bp).connect(g).connect(ctx.destination);
        src.start(t, Math.random() * 0.3);
        src.stop(t + dur + 0.05);
      },
      tick(o = {}) {
        const e = live();
        if (!e) return;
        const { ctx, noise } = e;
        const t = ctx.currentTime + 0.005 + (o.at ?? 0);
        const src = ctx.createBufferSource();
        src.buffer = noise;
        const bp = ctx.createBiquadFilter();
        bp.type = "bandpass";
        bp.frequency.value = o.freq ?? 3200;
        bp.Q.value = 4;
        const g = env(ctx, t, (o.gain ?? 0.09) * vol.current, 0.001, 0.03);
        src.connect(bp).connect(g).connect(ctx.destination);
        src.start(t, Math.random() * 0.5);
        src.stop(t + 0.05);
      },
    } satisfies Sound;
  }, []);
}

// ───────────── the sign: a 300 by 120 brick wall, five star shaped tubes ─────────────

const W = 300, H = 120;
const CX = (i: number) => 30 + i * 60;
const CY = 60;
const R = 23;
const DEFAULT_LABELS: [string, string, string, string, string] = ["Poor", "Fair", "Good", "Great", "Excellent"];

/**
 * A star bent from one glass tube: ten corners, each bent round a small radius, open at the bottom where both ends
 * turn back into the wall at their electrodes.
 */
function tube(cx: number, cy: number) {
  const v: [number, number][] = [];
  for (let k = 0; k < 10; k++) {
    const a = ((-90 + k * 36) * Math.PI) / 180, r = k % 2 ? R * 0.46 : R;
    v.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]);
  }
  // walk round from just right of the bottom inner corner (index 5) back to just left of it
  const order = [5, 6, 7, 8, 9, 0, 1, 2, 3, 4, 5];
  const pts = order.map((i) => v[i]!);
  const lerp = (a: [number, number], b: [number, number], t: number): [number, number] => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
  const start = lerp(pts[0]!, pts[1]!, 0.16), end = lerp(pts[pts.length - 1]!, pts[pts.length - 2]!, 0.16);
  const bend = 2.6;
  let d = `M${start[0].toFixed(2)},${start[1].toFixed(2)}`;
  for (let i = 1; i < pts.length - 1; i++) {
    const p = pts[i]!, a = pts[i - 1]!, b = pts[i + 1]!;
    const la = Math.hypot(p[0] - a[0], p[1] - a[1]), lb = Math.hypot(b[0] - p[0], b[1] - p[1]);
    const p1 = lerp(p, a, bend / la), p2 = lerp(p, b, bend / lb);
    d += `L${p1[0].toFixed(2)},${p1[1].toFixed(2)}Q${p[0].toFixed(2)},${p[1].toFixed(2)} ${p2[0].toFixed(2)},${p2[1].toFixed(2)}`;
  }
  d += `L${end[0].toFixed(2)},${end[1].toFixed(2)}`;
  // a bracket on the top edge of each side arm
  const clip = (i: number, j: number) => lerp(v[i]!, v[j]!, 0.5);
  // the electrode sleeves: the last few millimetres of each end, dark, pointing into the gap
  const sleeve = (e: [number, number], toward: [number, number]) => {
    const l = Math.hypot(toward[0] - e[0], toward[1] - e[1]);
    return [e, lerp(e, toward, 2.4 / l)] as const;
  };
  const gap = pts[0]!;
  return { d, start, end, clips: [clip(1, 2), clip(8, 9)], sleeves: [sleeve(start, gap), sleeve(end, gap)] };
}

/** the wall: rows of bricks in slightly different reds and browns, from a fixed seed */
function bricks() {
  let s = 41;
  const r = () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646;
  const out: { x: number; y: number; w: number; c: string }[] = [];
  const bw = 27, bh = 10;
  for (let row = 0; row * bh < H + bh; row++) {
    const off = row % 2 ? -bw / 2 : 0;
    for (let x = off; x < W; x += bw) {
      const l = 15 + r() * 7, h = 8 + r() * 10, sat = 26 + r() * 16;
      out.push({ x, y: row * bh, w: bw, c: `hsl(${h.toFixed(0)} ${sat.toFixed(0)}% ${l.toFixed(1)}%)` });
    }
  }
  return out;
}

/** the light from one tube, from the wall it washes to the white hot line in the glass */
function Glow({ d, cx, cy, light, uid }: { d: string; cx: number; cy: number; light: MotionValue<number>; uid: string }) {
  return (
    <motion.g style={{ opacity: light }}>
      <circle cx={cx} cy={cy} r={62} fill={`url(#spill-${uid})`} style={{ mixBlendMode: "screen" }} />
      <path d={d} fill="none" stroke="#ff7a12" strokeWidth={12} strokeLinecap="round" strokeLinejoin="round" opacity={0.5} filter={`url(#wide-${uid})`} />
      <path d={d} fill="none" stroke="#ffa133" strokeWidth={5.5} strokeLinecap="round" strokeLinejoin="round" filter={`url(#near-${uid})`} />
      <path d={d} fill="none" stroke="#ffeccb" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
      <path d={d} fill="none" stroke="#ffffff" strokeWidth={0.9} strokeLinecap="round" strokeLinejoin="round" opacity={0.85} />
    </motion.g>
  );
}

/**
 * A star rating in neon: five star shaped tubes on a brick wall.
 *
 * Each star is one glass tube bent round ten corners, open at the bottom where its ends turn back into the wall at dark
 * electrodes, held off the bricks by two small brackets and casting a faint shadow. Off, it is grey glass. Choose a
 * score and the tubes up to it strike one after another: a click from the transformer, a stutter of flickers with a
 * crackle on each and a short electric buzz, then a steady amber glow, the light washing over the bricks around it.
 * Lower the score and the rest drop out with a fading afterglow. Pointing at a star warms the tubes up to it, and
 * now and then a lit tube stutters, as old neon does. A radio group with arrow keys; the score is a polite live region.
 */
export default function NeonStarRating({
  value,
  defaultValue = 0,
  onChange,
  question = "How was dinner?",
  labels = DEFAULT_LABELS,
  enableSound = true,
  volume = 0.8,
  autoplay = false,
  className = "",
}: NeonStarRatingProps) {
  const reduce = !!useReducedMotion();
  const uid = useId().replace(/:/g, "");
  const [siteSound] = useSoundsEnabled();
  // a demo playing by itself only makes sound where the page allows it (see AutoplaySound)
  const autoplaySoundOk = useAutoplaySoundAllowed();
  const autoplayOk = useRef(autoplaySoundOk);
  useEffect(() => {
    autoplayOk.current = autoplaySoundOk;
  }, [autoplaySoundOk]);
  const touched = useRef(false);
  const sfx = useSound(enableSound && siteSound, volume, () => touched.current || autoplayOk.current);
  const [inner, setInner] = useState(defaultValue);
  const score = value ?? inner;
  const [hover, setHover] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const inView = useInView(rootRef, { margin: "100px" });
  const tubes = useMemo(() => [0, 1, 2, 3, 4].map((i) => tube(CX(i), CY)), []);
  const wall = useMemo(() => bricks(), []);
  const l0 = useMotionValue(defaultValue > 0 ? 1 : 0), l1 = useMotionValue(defaultValue > 1 ? 1 : 0), l2 = useMotionValue(defaultValue > 2 ? 1 : 0);
  const l3 = useMotionValue(defaultValue > 3 ? 1 : 0), l4 = useMotionValue(defaultValue > 4 ? 1 : 0);
  const lights = [l0, l1, l2, l3, l4];
  const target = useRef(defaultValue);
  const anims = useRef<({ stop: () => void } | null)[]>([null, null, null, null, null]);

  const run = (i: number, to: number | number[], o: object) => {
    anims.current[i]?.stop();
    anims.current[i] = animate(lights[i]!, to as never, o as never) as unknown as { stop: () => void };
  };

  /** a tube striking: the transformer's click, a stutter of flickers with a crackle on each, a buzz, then steady */
  const strike = (i: number, delay: number) => {
    const times = [0, 0.1, 0.17, 0.3, 0.38, 0.52, 1];
    run(i, [lights[i]!.get(), 0.85, 0.08, 0.95, 0.3, 1.05, 1], { duration: 0.62, times, ease: "linear", delay });
    sfx.tick({ at: delay, freq: 650, gain: 0.08 });
    sfx.note(118, { at: delay + 0.02, dur: 0.42, gain: 0.025, type: "sawtooth", bell: 0 });
    for (const t of [0.1, 0.17, 0.3, 0.38]) sfx.tick({ at: delay + t * 0.62, freq: 2600 + Math.random() * 3000, gain: 0.05 });
    sfx.note(236, { at: delay + 0.32, dur: 0.3, gain: 0.012, type: "sawtooth", bell: 0 });
  };
  const douse = (i: number, delay: number) => {
    run(i, [lights[i]!.get(), 0.3, 0], { duration: 0.6, times: [0, 0.08, 1], ease: "easeOut", delay });
    sfx.tick({ at: delay, freq: 900, gain: 0.05 });
    sfx.note(120, { at: delay, glide: 60, dur: 0.2, gain: 0.018, type: "sawtooth", bell: 0 });
  };

  const setScore = (next: number, fromUser = true) => {
    if (fromUser) touched.current = true;
    const v = Math.max(0, Math.min(5, next));
    const was = target.current;
    target.current = v;
    if (value === undefined) setInner(v);
    onChange?.(v);
    let k = 0;
    for (let i = 0; i < 5; i++) {
      const on = i < v;
      if ((on && i < was) || (!on && i >= was)) continue;
      if (reduce) {
        anims.current[i]?.stop();
        lights[i]!.set(on ? 1 : 0);
        if (on) sfx.tick({ freq: 650, gain: 0.07 });
        continue;
      }
      if (on) strike(i, k++ * 0.16);
      else douse(i, (4 - i) * 0.05);
    }
  };

  useEffect(() => {
    if (value !== undefined && value !== target.current) setScore(value, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  // pointing warms the tubes up to the star you point at
  useEffect(() => {
    if (reduce) return;
    lights.forEach((_, i) => {
      if (i < target.current) return;
      run(i, i < hover ? 0.16 : 0, { duration: 0.25, ease: "easeOut" });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hover]);

  // now and then a lit tube stutters, the way old neon does
  useEffect(() => {
    if (reduce || !inView) return;
    let t = 0;
    const next = () => {
      t = window.setTimeout(() => {
        const n = target.current;
        if (n > 0) {
          const i = Math.floor(Math.random() * n);
          if (Math.abs(lights[i]!.get() - 1) < 0.05) {
            run(i, [1, 0.35, 1, 0.65, 1], { duration: 0.32, times: [0, 0.2, 0.45, 0.7, 1], ease: "linear" });
            sfx.tick({ freq: 3600, gain: 0.025 });
            sfx.tick({ at: 0.14, freq: 4200, gain: 0.02 });
          }
        }
        next();
      }, 3800 + Math.random() * 5200);
    };
    next();
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, reduce]);

  // autoplay: four, then two, then five, then dark, until someone touches it
  useEffect(() => {
    if (!autoplay || reduce || !inView) return;
    let alive = true;
    const ok = () => alive && !touched.current;
    const sleep = (ms: number) => new Promise((r) => window.setTimeout(r, ms));
    (async () => {
      await sleep(900);
      while (ok()) {
        for (const n of [4, 2, 5, 0]) {
          if (!ok()) return;
          setScore(n, false);
          await sleep(n === 0 ? 1500 : 2400);
        }
      }
    })();
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoplay, inView]);

  useEffect(() => () => anims.current.forEach((a) => a?.stop()), []);

  const word = (hover || score) > 0 ? labels[(hover || score) - 1] : "Tap a star";

  return (
    <div
      ref={rootRef}
      onPointerDownCapture={() => {
  touched.current = true;
}}
      onKeyDownCapture={() => {
  touched.current = true;
}}
      className={`w-[340px] max-w-full rounded-[24px] bg-white p-5 text-[#1d1d1f] shadow-[0_0_0_1px_rgba(0,0,0,.05),0_20px_40px_-26px_rgba(0,0,0,.35)] ${className}`}
    >
      <p id={`q-${uid}`} className="m-0 text-[17px] font-semibold tracking-[-0.02em]">
        {question}
      </p>
      <div className="relative mt-3 overflow-hidden rounded-[18px] bg-[#1a1210]" style={{ aspectRatio: `${W} / ${H}` }} onPointerLeave={() => setHover(0)}>
        <svg viewBox={`0 0 ${W} ${H}`} className="absolute inset-0 block h-full w-full" aria-hidden="true">
          <defs>
            <radialGradient id={`spill-${uid}`}>
              <stop offset="0" stopColor="#ff9a3c" stopOpacity=".55" />
              <stop offset="0.45" stopColor="#ff7a1c" stopOpacity=".2" />
              <stop offset="1" stopColor="#ff7a1c" stopOpacity="0" />
            </radialGradient>
            <radialGradient id={`vignette-${uid}`} cx="0.5" cy="0.45" r="0.75">
              <stop offset="0.55" stopColor="#000" stopOpacity="0" />
              <stop offset="1" stopColor="#000" stopOpacity=".6" />
            </radialGradient>
            <filter id={`wide-${uid}`} x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="5" />
            </filter>
            <filter id={`near-${uid}`} x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="1.8" />
            </filter>
            <filter id={`soft-${uid}`} x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="1.4" />
            </filter>
            <filter id={`grit-${uid}`} x="0" y="0" width="100%" height="100%">
              <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="4" />
              <feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.55 0" />
            </filter>
          </defs>
          {/* the wall: mortar, bricks, grit, and a darker edge */}
          <rect width={W} height={H} fill="#140e0d" />
          {wall.map((b, i) => (
            <rect key={i} x={b.x + 0.9} y={b.y + 0.9} width={b.w - 1.8} height={8.2} rx={0.8} fill={b.c} />
          ))}
          <rect width={W} height={H} filter={`url(#grit-${uid})`} opacity={0.5} />
          <rect width={W} height={H} fill={`url(#vignette-${uid})`} />

          {tubes.map((t, i) => (
            <g key={i}>
              {/* the tube's shadow on the bricks, its brackets, and the grey glass */}
              <path d={t.d} fill="none" stroke="#000" strokeWidth={3.6} strokeLinecap="round" strokeLinejoin="round" opacity={0.55} transform="translate(1.6 2.6)" filter={`url(#soft-${uid})`} />
              {t.clips.map(([x, y], j) => (
                <g key={j}>
                  <rect x={x - 1.6} y={y - 3.2} width={3.2} height={6.4} rx={1} fill="#0c0a0a" opacity={0.6} transform="translate(1 1.6)" />
                  <rect x={x - 1.6} y={y - 3.2} width={3.2} height={6.4} rx={1} fill="#6d6a6a" />
                </g>
              ))}
              <path d={t.d} fill="none" stroke="#5c4c50" strokeWidth={3.2} strokeLinecap="round" strokeLinejoin="round" />
              <path d={t.d} fill="none" stroke="#b9a9ae" strokeWidth={0.8} strokeLinecap="round" strokeLinejoin="round" opacity={0.45} transform="translate(-0.5 -0.5)" />
              <Glow d={t.d} cx={CX(i)} cy={CY} light={lights[i]!} uid={uid} />
              {/* the electrode sleeves, where the ends turn back into the wall */}
              {t.sleeves.map(([a, b], j) => (
                <g key={j}>
                  <line x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke="#241c1e" strokeWidth={3.5} strokeLinecap="round" />
                  <line x1={a[0]} y1={a[1] - 0.6} x2={b[0]} y2={b[1] - 0.6} stroke="#7d7174" strokeWidth={0.6} strokeLinecap="round" opacity={0.6} />
                </g>
              ))}
              {t.clips.map(([x, y], j) => (
                <rect key={j} x={x - 1.6} y={y - 1.1} width={3.2} height={2.2} fill="#8d8a89" opacity={0.85} />
              ))}
            </g>
          ))}
        </svg>
        <div role="radiogroup" aria-labelledby={`q-${uid}`} className="absolute inset-0">
          {Array.from({ length: 5 }, (_, i) => (
            <button
              key={i}
              type="button"
              role="radio"
              aria-checked={score === i + 1}
              aria-label={`${i + 1} of 5, ${labels[i]}`}
              tabIndex={score === i + 1 || (score === 0 && i === 0) ? 0 : -1}
              onPointerEnter={() => setHover(i + 1)}
              onClick={() => setScore(score === i + 1 ? 0 : i + 1)}
              onKeyDown={(e) => {
                const kk = e.key;
                const to = kk === "ArrowRight" || kk === "ArrowUp" ? Math.min(5, score + 1) : kk === "ArrowLeft" || kk === "ArrowDown" ? Math.max(1, score - 1) : kk === "Home" ? 1 : kk === "End" ? 5 : -1;
                if (to < 0) return;
                e.preventDefault();
                setScore(to);
                (e.currentTarget.parentElement?.children[to - 1] as HTMLElement | undefined)?.focus();
              }}
              className="absolute rounded-[14px] outline-none focus-visible:ring-2 focus-visible:ring-[#ffb24a]/80"
              style={{ left: `${((CX(i) - 28) / W) * 100}%`, width: `${(56 / W) * 100}%`, top: `${((CY - 30) / H) * 100}%`, height: `${(60 / H) * 100}%` }}
            />
          ))}
        </div>
      </div>
      <div className="mt-3 flex items-baseline justify-between" aria-live="polite">
        <div className="relative h-[28px] flex-1 overflow-hidden">
          <AnimatePresence initial={false} mode="popLayout">
            <motion.span
              key={word}
              className={`absolute left-0 top-0 whitespace-nowrap text-[22px] font-semibold leading-[28px] tracking-[-0.02em] ${hover ? "text-[#b5600a]" : score ? "text-[#1d1d1f]" : "text-[#86868b]"}`}
              initial={reduce ? { opacity: 0 } : { y: 24, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={reduce ? { opacity: 0 } : { y: -24, opacity: 0 }}
              transition={{ type: "spring", stiffness: 420, damping: 32 }}
            >
              {word}
            </motion.span>
          </AnimatePresence>
        </div>
        <span className="text-[13px] tabular-nums text-[#6e6e73]">{score ? `${score} of 5` : "No score yet"}</span>
      </div>
    </div>
  );
}
```

--- lib/ui-sounds.ts ---

```ts
/**
 * UI sounds with no audio files. Every sound is synthesised on the fly with
 * the Web Audio API (oscillators, filtered noise and envelopes), so the whole
 * library is this one file and nothing to download.
 *
 *   import { playSound } from "@/lib/ui-sounds";
 *   <button onClick={() => playSound("pop")}>Like</button>
 *
 * Browsers only allow audio after a user gesture, so call it from a click,
 * key press or pointer event.
 *
 * Components that make sound use the hook, which also honours the visitor's
 * on/off choice (see "Preference" below):
 *
 *   const play = useSound(enableSound);
 *   <button onClick={() => play("tap")}>Save</button>
 *
 * A component that plays itself (an autoplay demo) calls play.auto("tap") instead: the same sound,
 * but silent until the visitor has clicked or pressed a key once on the page.
 */

import * as React from "react";

export type SoundCategory = "Actions" | "Feedback" | "Navigation" | "Notifications" | "Selection" | "Movement" | "Progress" | "System";

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let out: AudioNode | null = null;
let analyserNode: AnalyserNode | null = null;
let noiseBuf: AudioBuffer | null = null;

function audio() {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    playbackSession();
    master = ctx.createGain();
    master.gain.value = isTouchDevice() ? 0.9 : 0.5; // phone speakers are small and quiet
    const comp = ctx.createDynamicsCompressor();
    master.connect(comp).connect(ctx.destination);
    out = comp;
  }
  silentTrack();
  if (ctx.state !== "running") void ctx.resume(); // "suspended" until a tap; "interrupted" after a call or a locked screen on iOS
  return ctx;
}

/**
 * Phones. iOS and Android only let a page start audio from a real tap (iOS counts touchend and click, not the
 * pointerenter that fires when a finger lands), and iOS mutes Web Audio while the ringer switch is on silent
 * unless the page asks for the "playback" audio session. So on a touch screen, once a sound has been asked for, the next tap
 * wakes the engine, plays one silent sample, and switches the session; after that every sound is audible.
 */
function playbackSession() {
  try {
    const session = (navigator as unknown as { audioSession?: { type: string } }).audioSession;
    if (session && session.type !== "playback") session.type = "playback";
  } catch {
    // not supported: the ringer switch still applies
  }
}

/**
 * The iOS ringer switch. With it on silent, iOS mutes Web Audio but not a playing <audio> element, and while one is
 * playing it moves the whole page to the "playback" category. So on a touch device the first sound also starts a
 * silent loop (a quarter second of silence), which is what makes the sounds heard with the switch on silent. It is
 * only started once a sound has been asked for, and paused whenever the page is hidden.
 */
const SILENT_WAV = "data:audio/wav;base64,UklGRvQHAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YdAHAACAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgA==";
let silentEl: HTMLAudioElement | null = null;
function isTouchDevice() {
  return typeof window !== "undefined" && ((navigator.maxTouchPoints ?? 0) > 0 || !!window.matchMedia?.("(pointer: coarse)").matches);
}
function silentTrack() {
  if (typeof document === "undefined" || !isTouchDevice()) return;
  try {
    if (!silentEl) {
      silentEl = new Audio(SILENT_WAV);
      silentEl.loop = true;
      silentEl.setAttribute("playsinline", "");
      document.addEventListener("visibilitychange", () => {
        if (document.hidden) silentEl?.pause();
      });
    }
    if (silentEl.paused && !document.hidden) void silentEl.play().catch(() => {});
  } catch {
    // no HTMLAudioElement: the ringer switch still applies
  }
}

let unlockArmed = false;
function armTouchUnlock() {
  if (unlockArmed || typeof window === "undefined") return;
  unlockArmed = true;
  if (!isTouchDevice()) return;
  const wake = () => {
    if (!ctx) return; // nothing to wake until a sound has been asked for (and no silent loop for visitors who never use sound)
    if (ctx.state === "running") return silentTrack();
    const c = audio();
    if (!c) return;
    try {
      const s = c.createBufferSource();
      s.buffer = c.createBuffer(1, 1, 22050);
      s.connect(c.destination);
      s.start(0);
    } catch {
      // ignore
    }
  };
  for (const type of ["touchend", "pointerup", "click", "keydown"]) window.addEventListener(type, wake, { capture: true, passive: true });
}
armTouchUnlock();

/**
 * A tap on everything the library plays, for drawing it (a level meter, a visualiser). It listens
 * only; nothing extra is heard. Null on the server or before the browser allows audio.
 */
export function getSoundAnalyser(): AnalyserNode | null {
  const c = audio();
  if (!c || !out) return null;
  if (!analyserNode) {
    analyserNode = c.createAnalyser();
    analyserNode.fftSize = 1024;
    analyserNode.smoothingTimeConstant = 0.55;
    out.connect(analyserNode);
  }
  return analyserNode;
}

function noise(c: AudioContext) {
  if (!noiseBuf) {
    noiseBuf = c.createBuffer(1, c.sampleRate, c.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  const s = c.createBufferSource();
  s.buffer = noiseBuf;
  return s;
}

export type ToneOpts = { freq: number; to?: number; type?: OscillatorType; at?: number; attack?: number; decay?: number; gain?: number; glide?: number };
export function tone(c: AudioContext, out: AudioNode, o: ToneOpts) {
  const t0 = c.currentTime + (o.at ?? 0);
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = o.type ?? "sine";
  osc.frequency.setValueAtTime(o.freq, t0);
  if (o.to) osc.frequency.exponentialRampToValueAtTime(o.to, t0 + (o.glide ?? o.decay ?? 0.1));
  const a = o.attack ?? 0.004, d = o.decay ?? 0.12, peak = o.gain ?? 0.3;
  g.gain.value = 0.0001; // a gain node starts at 1: without this the very first sample of a note can click
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(peak, t0 + a);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + a + d);
  osc.connect(g).connect(out);
  osc.start(t0);
  osc.stop(t0 + a + d + 0.05);
}

export type NoiseOpts = { at?: number; attack?: number; decay?: number; gain?: number; filter?: BiquadFilterType; freq?: number; to?: number; q?: number };
export function hiss(c: AudioContext, out: AudioNode, o: NoiseOpts) {
  const t0 = c.currentTime + (o.at ?? 0);
  const n = noise(c);
  const f = c.createBiquadFilter();
  const g = c.createGain();
  f.type = o.filter ?? "bandpass";
  f.frequency.setValueAtTime(o.freq ?? 2000, t0);
  if (o.to) f.frequency.exponentialRampToValueAtTime(o.to, t0 + (o.attack ?? 0.01) + (o.decay ?? 0.1));
  f.Q.value = o.q ?? 1;
  const a = o.attack ?? 0.003, d = o.decay ?? 0.08, peak = o.gain ?? 0.3;
  g.gain.value = 0.0001; // a gain node starts at 1: without this the very first sample of a note can click
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(peak, t0 + a);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + a + d);
  n.connect(f).connect(g).connect(out);
  n.start(t0, Math.random() * 0.5);
  n.stop(t0 + a + d + 0.05);
}

/** One sound: how it is made from oscillators and noise. `tone` and `hiss` are the building blocks. */
export type SoundDef = {
  category: string;
  label: string;
  play: (c: AudioContext, out: AudioNode) => void;
  /** Seconds the sound lasts, when it runs longer than the two the engine keeps it connected for (a recording). */
  length?: number;
};
type Def = SoundDef & { category: SoundCategory };

export const SOUNDS = {
  tap: { category: "Actions", label: "Tap", play: (c, o) => { tone(c, o, { freq: 900, to: 620, decay: 0.06, gain: 0.25 }); hiss(c, o, { freq: 4000, decay: 0.015, gain: 0.08, filter: "highpass" }); } },
  pop: { category: "Actions", label: "Pop", play: (c, o) => tone(c, o, { freq: 320, to: 980, glide: 0.07, decay: 0.09, gain: 0.35 }) },
  knock: { category: "Actions", label: "Knock", play: (c, o) => { tone(c, o, { freq: 160, to: 90, decay: 0.1, gain: 0.5 }); hiss(c, o, { freq: 900, decay: 0.04, gain: 0.25, q: 2 }); tone(c, o, { at: 0.11, freq: 150, to: 85, decay: 0.09, gain: 0.35 }); hiss(c, o, { at: 0.11, freq: 900, decay: 0.035, gain: 0.18, q: 2 }); } },

  success: { category: "Feedback", label: "Landed", play: (c, o) => { tone(c, o, { freq: 1046.5, decay: 0.18, gain: 0.22, type: "triangle" }); tone(c, o, { at: 0.09, freq: 1318.5, decay: 0.32, gain: 0.22, type: "triangle" }); } },
  error: { category: "Feedback", label: "Bump", play: (c, o) => { tone(c, o, { freq: 220, decay: 0.09, gain: 0.18, type: "square" }); tone(c, o, { at: 0.11, freq: 185, decay: 0.14, gain: 0.18, type: "square" }); } },
  paid: { category: "Feedback", label: "Paid", play: (c, o) => [1318.5, 1568, 2093].forEach((f, i) => tone(c, o, { at: i * 0.065, freq: f, decay: 0.35 - i * 0.05, gain: 0.16, type: "triangle" })) },

  whoosh: { category: "Navigation", label: "Whisk", play: (c, o) => hiss(c, o, { attack: 0.06, decay: 0.18, freq: 400, to: 3200, gain: 0.22, q: 0.8 }) },
  step: { category: "Navigation", label: "Step", play: (c, o) => { tone(c, o, { freq: 520, decay: 0.05, gain: 0.18 }); tone(c, o, { at: 0.06, freq: 700, decay: 0.07, gain: 0.16 }); } },
  glide: { category: "Navigation", label: "Glide", play: (c, o) => tone(c, o, { freq: 440, to: 880, glide: 0.18, attack: 0.03, decay: 0.2, gain: 0.18 }) },

  chime: { category: "Notifications", label: "Chime", play: (c, o) => [1, 2.76, 5.4].forEach((m, i) => tone(c, o, { freq: 880 * m, decay: 0.9 / (i + 1), gain: 0.18 / (i + 1) })) },
  ping: { category: "Notifications", label: "Ping", play: (c, o) => tone(c, o, { freq: 1760, decay: 0.6, gain: 0.16 }) },
  beacon: { category: "Notifications", label: "Beacon", play: (c, o) => { tone(c, o, { freq: 1175, decay: 0.25, gain: 0.18, type: "triangle" }); tone(c, o, { at: 0.18, freq: 1568, decay: 0.45, gain: 0.18, type: "triangle" }); } },

  tick: { category: "Selection", label: "Tick", play: (c, o) => hiss(c, o, { freq: 5000, decay: 0.012, gain: 0.3, filter: "highpass" }) },
  on: { category: "Selection", label: "Latch on", play: (c, o) => { hiss(c, o, { freq: 3000, decay: 0.01, gain: 0.2 }); tone(c, o, { at: 0.01, freq: 600, to: 900, decay: 0.07, gain: 0.2 }); } },
  off: { category: "Selection", label: "Latch off", play: (c, o) => { hiss(c, o, { freq: 2400, decay: 0.01, gain: 0.18 }); tone(c, o, { at: 0.01, freq: 760, to: 480, decay: 0.07, gain: 0.18 }); } },

  lift: { category: "Movement", label: "Lift", play: (c, o) => { hiss(c, o, { attack: 0.03, decay: 0.08, freq: 800, to: 2400, gain: 0.14 }); tone(c, o, { freq: 300, to: 520, decay: 0.08, gain: 0.12 }); } },
  drop: { category: "Movement", label: "Drop", play: (c, o) => { tone(c, o, { freq: 380, to: 120, glide: 0.08, decay: 0.12, gain: 0.35 }); hiss(c, o, { at: 0.06, freq: 600, decay: 0.05, gain: 0.15 }); } },
  swipe: { category: "Movement", label: "Swipe", play: (c, o) => hiss(c, o, { attack: 0.02, decay: 0.12, freq: 3200, to: 500, gain: 0.2, q: 1.2 }) },

  charge: { category: "Progress", label: "Charge", play: (c, o) => tone(c, o, { freq: 220, to: 880, glide: 0.5, attack: 0.08, decay: 0.5, gain: 0.14, type: "triangle" }) },
  done: { category: "Progress", label: "Complete", play: (c, o) => [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => tone(c, o, { at: i * 0.04, freq: f, attack: 0.01, decay: 0.6, gain: 0.1, type: "triangle" })) },
  loading: { category: "Progress", label: "Loading", play: (c, o) => [0, 0.12, 0.24].forEach((at, i) => tone(c, o, { at, freq: 660 + i * 40, decay: 0.05, gain: 0.12 })) },

  boot: { category: "System", label: "Boot", play: (c, o) => [130.8, 196, 261.6, 392].forEach((f, i) => tone(c, o, { at: i * 0.07, freq: f, attack: 0.08, decay: 0.9, gain: 0.08, type: "sine" })) },
  hush: { category: "System", label: "Hush", play: (c, o) => { tone(c, o, { freq: 520, to: 180, glide: 0.35, attack: 0.02, decay: 0.35, gain: 0.14 }); hiss(c, o, { attack: 0.05, decay: 0.3, freq: 1800, to: 300, gain: 0.06, filter: "lowpass" }); } },
  alert: { category: "System", label: "Alert", play: (c, o) => [0, 0.16, 0.32].forEach((at, i) => tone(c, o, { at, freq: i % 2 ? 740 : 988, decay: 0.12, gain: 0.14, type: "triangle" })) },
} satisfies Record<string, Def>;

export type SoundName = keyof typeof SOUNDS;

// ── Style ───────────────────────────────────────────────────────────
//
// A style re-voices the sounds above under the same names, so every component that plays "tap" or
// "chime" changes voice at once and no component code changes. The default style is "nexus" (the
// recipes in this file). Another file can add one: `@/lib/ui-sounds-mac` registers "mac" when it is
// imported. The visitor's choice is kept in localStorage ("ui-sounds-style").

const STYLE_KEY = "ui-sounds-style";
const styles = new Map<string, Partial<Record<SoundName, SoundDef>>>();
let style: string | null = null;
const styleListeners = new Set<() => void>();

/** Adds a style: recipes keyed by the sound names above. Missing names fall back to the default. */
export function registerSoundStyle(name: string, defs: Partial<Record<SoundName, SoundDef>>) {
  styles.set(name, defs);
  styleListeners.forEach((l) => l());
}

/** The active style: "nexus" unless the visitor or your code picked another. */
export function getSoundStyle(): string {
  if (style === null) {
    style = "nexus";
    if (typeof window !== "undefined") {
      try {
        style = window.localStorage.getItem(STYLE_KEY) || "nexus";
      } catch {
        // storage blocked: the default style
      }
    }
  }
  return style;
}

/** Pick the style every sound uses. Remembered in this browser unless `persist` is false. */
export function setSoundStyle(name: string, persist = true) {
  style = name;
  if (persist && typeof window !== "undefined") {
    try {
      window.localStorage.setItem(STYLE_KEY, name);
    } catch {
      // storage blocked: the choice lasts until the page closes
    }
  }
  styleListeners.forEach((l) => l());
}

function subscribeStyle(onChange: () => void) {
  styleListeners.add(onChange);
  return () => {
    styleListeners.delete(onChange);
  };
}

/** The style as React state: `[style, setStyle]`. The server render reads "nexus". */
export function useSoundStyle(): [string, (name: string) => void] {
  const current = React.useSyncExternalStore(subscribeStyle, getSoundStyle, () => "nexus");
  return [current, setSoundStyle];
}

// ── Preference ──────────────────────────────────────────────────────
//
// One switch for every sound on the page. A visitor's choice is kept in
// localStorage ("ui-sounds": "on" | "off"); until they choose, the default
// applies (on, unless you call configureSounds({ defaultEnabled: false })).

const STORE_KEY = "ui-sounds";
let defaultEnabled = true;
let chosen: boolean | null = null; // the visitor's saved or runtime choice
let loaded = false;
const listeners = new Set<() => void>();

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const v = window.localStorage.getItem(STORE_KEY);
    if (v === "on") chosen = true;
    else if (v === "off") chosen = false;
  } catch {
    // storage blocked: the default applies
  }
}

function emit() {
  listeners.forEach((l) => l());
}

/** Whether sounds are on right now. */
export function getSoundsEnabled(): boolean {
  load();
  return chosen ?? defaultEnabled;
}

/** Whether sounds are on until the visitor chooses. Call once, early, in client code. */
export function configureSounds(opts: { defaultEnabled?: boolean }) {
  if (typeof opts.defaultEnabled === "boolean" && opts.defaultEnabled !== defaultEnabled) {
    defaultEnabled = opts.defaultEnabled;
    emit();
  }
}

/** Turn sounds on or off. The choice is remembered in this browser unless `persist` is false. */
export function setSoundsEnabled(on: boolean, persist = true) {
  load();
  chosen = on;
  if (persist) {
    try {
      window.localStorage.setItem(STORE_KEY, on ? "on" : "off");
    } catch {
      // storage blocked: the choice lasts until the page closes
    }
  }
  emit();
}

/** Mute or unmute every sound for this page load (for a "Sounds off" preference you store yourself). */
export function setSoundsMuted(value: boolean) {
  setSoundsEnabled(!value, false);
}

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  const onStorage = (e: StorageEvent) => {
    if (e.key !== STORE_KEY) return;
    loaded = false;
    chosen = null;
    emit();
  };
  if (typeof window !== "undefined") window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(onChange);
    if (typeof window !== "undefined") window.removeEventListener("storage", onStorage);
  };
}

/**
 * The sound switch as React state: `[enabled, setEnabled]`. Use it for a speaker button. The server
 * render always reads "off", so the first paint matches and the real value arrives right after.
 */
export function useSoundsEnabled(): [boolean, (on: boolean) => void] {
  const enabled = React.useSyncExternalStore(subscribe, getSoundsEnabled, () => false);
  return [enabled, setSoundsEnabled];
}

// ── Playing ─────────────────────────────────────────────────────────

const lastPlayed = new Map<string, number>();

/**
 * Play a sound by name. volume is 0..1 on top of the master level. It stays silent while the
 * visitor has sounds off, unless `force` is set (for a button whose whole job is to play the sound).
 */
export function playSound(name: SoundName, volume = 1, force = false) {
  if (!(name in SOUNDS)) return;
  // The active style may voice this sound differently; anything it leaves out keeps the default.
  playDef(name, styles.get(getSoundStyle())?.[name] ?? SOUNDS[name], volume, force);
}

/**
 * Play any sound definition (the Pro sound pack uses this). `key` names it for the 30 ms de-bounce.
 * It follows the same on/off switch as playSound.
 */
export function playDef(key: string, def: SoundDef, volume = 1, force = false) {
  if (!force && !getSoundsEnabled()) return;
  if (typeof document !== "undefined" && document.hidden) return;
  // The same sound twice within 30ms is one sound: it keeps fast input from stacking into a buzz.
  const now = typeof performance !== "undefined" ? performance.now() : Date.now();
  if (now - (lastPlayed.get(key) ?? -1e9) < 30) return;
  lastPlayed.set(key, now);
  const c = audio();
  if (!c || !master) return;
  const g = c.createGain();
  g.gain.value = Math.max(0, Math.min(1, volume));
  g.connect(master);
  def.play(c, g);
  setTimeout(() => g.disconnect(), Math.max(2000, (def.length ?? 0) * 1000 + 300));
}

/** Whether the audio engine is awake. Browsers keep it asleep until the visitor's first click or key press. */
export function audioAwake() {
  // The visitor has clicked or pressed a key somewhere on the page: the browser lets us start audio now.
  if (!ctx && typeof navigator !== "undefined" && navigator.userActivation?.hasBeenActive) audio();
  return !!ctx && ctx.state === "running";
}

/**
 * Autoplay demos make sound too, but only where you allow it. It is allowed everywhere by default.
 * Wrap a part of the page in <AutoplaySound allow={false}> to keep demos silent there (a grid of
 * previews, say) and in <AutoplaySound allow> to let the one you are showing be heard.
 */
// Server components load this file for the sound list; they have no createContext, and never render the provider.
const AutoplayCtx = (typeof React.createContext === "function" ? React.createContext(true) : null) as unknown as React.Context<boolean>;
export function AutoplaySound({ allow, children }: { allow: boolean; children?: React.ReactNode }) {
  return React.createElement(AutoplayCtx.Provider, { value: allow }, children);
}

/** Whether autoplay demos may make sound here (see AutoplaySound). Used by the Pro sound hook. */
export function useAutoplaySoundAllowed() {
  return React.useContext(AutoplayCtx);
}

export type SoundPlayer = {
  (name: SoundName, volume?: number): void;
  /** For a sound that answers the component playing itself (autoplay). Silent until the visitor has used the page once. */
  auto: (name: SoundName, volume?: number) => void;
};

/**
 * For a component with a `sound` option: returns a play function that is silent when `enabled` is
 * false and otherwise follows the visitor's on/off switch. `play.auto(...)` is the same for sounds
 * made by autoplay.
 *
 *   const play = useSound(enableSound);
 */
export function useSound(enabled = true): SoundPlayer {
  const auto = React.useContext(AutoplayCtx);
  return React.useMemo(
    () =>
      Object.assign(
        (name: SoundName, volume = 1) => {
          if (enabled) playSound(name, volume);
        },
        {
          auto: (name: SoundName, volume = 1) => {
            if (enabled && auto && audioAwake()) playSound(name, volume);
          },
        },
      ),
    [enabled, auto],
  );
}

/** Set the overall level for every sound, 0..1. */
export function setSoundVolume(v: number) {
  audio();
  if (master) master.gain.value = Math.max(0, Math.min(1, v)) * (isTouchDevice() ? 0.9 : 0.5);
}
```
