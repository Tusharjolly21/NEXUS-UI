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
