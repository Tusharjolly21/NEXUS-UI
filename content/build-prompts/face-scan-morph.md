# Face Scan Morph

Add the "Face Scan Morph" component from Nexus UI to my project.

A pay-with-your-face confirmation whose glyph takes itself apart to check you. Tap it and the four scan corners curl inward into the arcs of a ring that spins while the face glances about and blinks. A match closes the ring into one green circle as the eyes fade and the smile straightens into a check. No match stops the spin, the arcs straighten back into corners, and the face shakes its head with a flat mouth and waits for another go. The glyph is a plain button with each state spoken in a live region.

Please:

1. Create the files below at sensible paths for this project, keeping each file's name. They import each other with relative paths, so keep them together.
2. Install what it needs: `framer-motion` (use this project's package manager).
3. It is styled with Tailwind CSS classes, so the project needs Tailwind.
4. It uses `@/lib/ui-sounds` for its interaction sounds, which are synthesised in the browser, so no audio files are needed. Create it at lib/ from the file below.
5. Use it like this: `import { FaceScanMorph } from "@/components/face-scan-morph";`. The props are typed and documented in the code.

Copy the code exactly as it is. Do not restyle, simplify or rename anything, and keep the comments: they explain why the numbers are what they are. The only thing to adapt is import paths, if this project uses a different alias than `@/`.

--- components/face-scan-morph/face-scan-morph.tsx ---

```tsx
"use client";

import { animate, motion, useInView, useMotionValue, useReducedMotion, useTransform, type AnimationPlaybackControls, type MotionValue } from "framer-motion";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { useAutoplaySoundAllowed, useSoundsEnabled } from "@/lib/ui-sounds";

export type FaceScanMorphProps = {
  merchant?: string;
  amount?: string;
  /** check the face yourself; resolve true to pay. Without it the demo fails the first try and passes the next. */
  onConfirm?: () => Promise<boolean>;
  /** called once the payment goes through */
  onPaid?: () => void;
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


type State = "idle" | "scanning" | "paid" | "failed";
type Pt = [number, number];

// ───────────── four scan corners that curl into a ring: each is the same ten points, read from a corner or an arc ─────────────

const BOX = 34; // the corners' half size
const RING = 36;
const QUADS: [number, number][] = [
  [-1, -1],
  [1, -1],
  [1, 1],
  [-1, 1],
];

const lerp = (a: Pt, b: Pt, k: number): Pt => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k];

function corner(sx: number, sy: number): Pt[] {
  const A: Pt = [sx * BOX, sy * 12], B: Pt = [sx * BOX, sy * 25], C: Pt = [sx * 25, sy * BOX], D: Pt = [sx * 12, sy * BOX];
  return [A, lerp(A, B, 1 / 3), lerp(A, B, 2 / 3), B, [sx * BOX, sy * 30], [sx * 30, sy * BOX], C, lerp(C, D, 1 / 3), lerp(C, D, 2 / 3), D];
}

/** a quarter of the ring in three cubic pieces, from the side to the top or bottom, short of each end by gap */
function arc(sx: number, sy: number, gap: number): Pt[] {
  const tv = sx > 0 ? 0 : Math.PI;
  const th = sy > 0 ? Math.PI / 2 : -Math.PI / 2;
  let delta = th - tv;
  while (delta > Math.PI) delta -= Math.PI * 2;
  while (delta < -Math.PI) delta += Math.PI * 2;
  const dir = Math.sign(delta);
  const a0 = tv + dir * gap, a3 = tv + delta - dir * gap; // tv + delta, not th, so the top-left quarter takes the short way round
  const at = (a: number): Pt => [Math.cos(a) * RING, Math.sin(a) * RING];
  const out: Pt[] = [at(a0)];
  for (let s = 0; s < 3; s++) {
    const a = a0 + ((a3 - a0) * s) / 3, b = a0 + ((a3 - a0) * (s + 1)) / 3;
    const kk = (4 / 3) * Math.tan((b - a) / 4) * RING;
    out.push([at(a)[0] - Math.sin(a) * kk, at(a)[1] + Math.cos(a) * kk], [at(b)[0] + Math.sin(b) * kk, at(b)[1] - Math.cos(b) * kk], at(b));
  }
  return out;
}

const CORNERS = QUADS.map(([sx, sy]) => corner(sx, sy));
function quadPath(i: number, m: number, gap: number) {
  const [sx, sy] = QUADS[i]!;
  const a = CORNERS[i]!, b = arc(sx, sy, gap);
  const p = a.map((q, j) => lerp(q, b[j]!, m));
  const f = (q: Pt) => `${q[0].toFixed(2)},${q[1].toFixed(2)}`;
  return `M${f(p[0]!)} C${f(p[1]!)} ${f(p[2]!)} ${f(p[3]!)} C${f(p[4]!)} ${f(p[5]!)} ${f(p[6]!)} C${f(p[7]!)} ${f(p[8]!)} ${f(p[9]!)}`;
}

// the mouth: a smile, a flat line when it fails, and the check when it passes, all as the same seven points
const SMILE: Pt[] = [[-10, 7], [-6.5, 12], [-3.5, 13.2], [0, 13.2], [3.5, 13.2], [6.5, 12], [10, 7]];
const FLAT: Pt[] = [[-9, 11], [-6, 11], [-3, 11], [0, 11], [3, 11], [6, 11], [9, 11]];
const CHECK: Pt[] = [[-14, -1], [-11, 2.3], [-7.6, 5.7], [-4.5, 8.8], [1.6, 2.2], [7.8, -4.4], [14, -11]];
function mouthPath(v: number) {
  const p = v >= 0 ? SMILE.map((q, j) => lerp(q, CHECK[j]!, v)) : SMILE.map((q, j) => lerp(q, FLAT[j]!, -v));
  const f = (q: Pt) => `${q[0].toFixed(2)},${q[1].toFixed(2)}`;
  return `M${f(p[0]!)} C${f(p[1]!)} ${f(p[2]!)} ${f(p[3]!)} C${f(p[4]!)} ${f(p[5]!)} ${f(p[6]!)}`;
}

function Corner({ i, m, gap, color }: { i: number; m: MotionValue<number>; gap: MotionValue<number>; color: MotionValue<string> }) {
  const d = useTransform([m, gap] as MotionValue<number>[], ([a, b]) => quadPath(i, a as number, b as number));
  return <motion.path d={d} fill="none" style={{ stroke: color }} strokeWidth={3.6} strokeLinecap="round" />;
}

/**
 * A pay-with-your-face confirmation whose glyph takes itself apart to check you.
 *
 * Tap it and the four scan corners curl inward into the arcs of a ring that spins while the face glances about and
 * blinks. A match closes the ring into one green circle as the eyes fade and the smile straightens into a check. No
 * match stops the spin, the arcs straighten back into corners, the face shakes its head with a flat mouth, and it
 * waits for another go. The glyph is a plain button with the state spoken in a live region.
 */
export default function FaceScanMorph({
  merchant = "Little Fern Café",
  amount = "$24.00",
  onConfirm,
  onPaid,
  enableSound = true,
  volume = 0.8,
  autoplay = false,
  className = "",
}: FaceScanMorphProps) {
  const reduce = useReducedMotion();
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
  const [state, setState] = useState<State>("idle");
  const rootRef = useRef<HTMLDivElement>(null);
  const inView = useInView(rootRef, { margin: "100px" });
  const running = useRef(false);
  const tries = useRef(0);
  const stateRef = useRef(state);
  useEffect(() => {
    stateRef.current = state;
  });

  // corners 0, arcs 1: one for each corner, so they curl one after another
  const m0 = useMotionValue(0), m1 = useMotionValue(0), m2 = useMotionValue(0), m3 = useMotionValue(0);
  const ms = [m0, m1, m2, m3];
  const gap = useMotionValue(0.2); // radians short of each end
  const spin = useMotionValue(0);
  const tone = useMotionValue(0); // -1 red, 0 graphite, 1 green
  const mouth = useMotionValue(0); // -1 flat, 0 smile, 1 check
  const eyes = useMotionValue(1);
  const blink = useMotionValue(1);
  const look = useMotionValue(0);
  const shake = useMotionValue(0);
  const pulse = useMotionValue(1);
  const breathe = useMotionValue(1);
  const scanY = useMotionValue(-26);
  const scanOn = useMotionValue(0);
  const ripple = useMotionValue(0);
  const rippleScale = useTransform(ripple, [0, 1], [1, 1.42]);
  const rippleOpacity = useTransform(ripple, [0, 0.12, 1], [0, 0.55, 0]);

  const color = useTransform(tone, [-1, 0, 1], ["#ff3b30", "#1d1d1f", "#30d158"]);
  const mouthD = useTransform(mouth, mouthPath);
  const lookFace = useTransform(look, (v) => v);
  const loops = useRef<AnimationPlaybackControls[]>([]);

  const go = (mv: MotionValue<number>, to: number, stiffness = 260, damping = 22, delay = 0) =>
    animate(mv, to, reduce ? { duration: 0 } : { type: "spring", stiffness, damping, delay });
  /** curl or straighten the corners, one after another round the face */
  const curl = (to: number, stiffness: number, damping: number) =>
    Promise.all(ms.map((mv, i) => go(mv, to, stiffness, damping, reduce ? 0 : i * 0.055)));

  // while it waits, the corners breathe in and out, just enough to look alive
  useEffect(() => {
    if (reduce || state !== "idle") return void animate(breathe, 1, { duration: 0.3 });
    const c = animate(breathe, [1, 1.035, 1], { duration: 2.8, ease: "easeInOut", repeat: Infinity });
    return () => c.stop();
  }, [state, reduce, breathe]);

  // a faint tick each time the spinning ring passes a quarter turn
  useEffect(() => {
    let q = Math.floor(spin.get() / 90);
    return spin.on("change", (v) => {
      const n = Math.floor(v / 90);
      if (n !== q && stateRef.current === "scanning") sfx.tick({ freq: 3600, gain: 0.05 });
      q = n;
    });
  }, [spin, sfx]);
  const sleep = (ms: number) => new Promise((r) => window.setTimeout(r, reduce ? 0 : ms));
  /** a hold that reads as time, not motion, so it stays with reduced motion too */
  const hold = (ms: number) => new Promise((r) => window.setTimeout(r, ms));

  /** stop spinning on a quarter turn, so the arcs line up with where the corners belong */
  const land = () => {
    loops.current.forEach((c) => c.stop());
    loops.current = [];
    const target = Math.ceil(spin.get() / 90) * 90;
    go(look, 0, 300, 24);
    return go(spin, target, 160, 20);
  };

  const scan = async () => {
    if (running.current) return;
    running.current = true;
    setState("scanning");
    stateRef.current = "scanning";
    sfx.tick({ freq: 2600 });
    sfx.whoosh(380, 1700, { dur: 0.5, gain: 0.07, at: 0.03 });
    go(tone, 0);
    go(mouth, 0);
    go(eyes, 1);
    go(gap, 0.42, 200, 20); // wider gaps while it spins, so the four arcs read as a scan
    void curl(1, 200, 18);
    animate(scanOn, 1, { duration: reduce ? 0 : 0.3, delay: reduce ? 0 : 0.25 });
    if (!reduce) {
      loops.current = [
        animate(spin, spin.get() + 360, { duration: 1.15, ease: "linear", repeat: Infinity }),
        animate(look, [0, -3.5, -3.5, 3.5, 3.5, 0], { duration: 2.2, ease: "easeInOut", repeat: Infinity }),
        animate(blink, [1, 1, 0.1, 1, 1], { duration: 2.2, times: [0, 0.42, 0.5, 0.58, 1], repeat: Infinity }),
        animate(scanY, [-26, 26, -26], { duration: 1.6, ease: "easeInOut", repeat: Infinity }),
      ];
    }
    const started = performance.now();
    let ok = false;
    try {
      ok = onConfirm ? await onConfirm() : ++tries.current % 2 === 0;
    } catch {
      ok = false;
    }
    await hold(Math.max(0, (reduce ? 900 : 1700) - (performance.now() - started)));
    blink.set(1);
    animate(scanOn, 0, { duration: reduce ? 0 : 0.2 });
    if (ok) {
      // the ring closes into one green circle, and the smile straightens into a check
      await land();
      go(gap, 0, 180, 16);
      animate(tone, 1, { duration: reduce ? 0 : 0.3 });
      animate(eyes, 0, { duration: reduce ? 0 : 0.18 });
      go(mouth, 1, 240, 18);
      // the ring closes with a rising chime, and the check settles with a warm note
      sfx.note(1047, { dur: 0.42, gain: 0.09, bell: 0.45 });
      sfx.note(1319, { at: 0.08, dur: 0.42, gain: 0.09, bell: 0.45 });
      sfx.note(1568, { at: 0.16, dur: 0.7, gain: 0.1, bell: 0.5 });
      sfx.note(523, { at: 0.2, dur: 0.6, gain: 0.05, type: "triangle", bell: 0 });
      setState("paid");
      if (!reduce) {
        animate(ripple, [0, 1], { duration: 0.75, ease: "easeOut", delay: 0.12 });
        await animate(pulse, [1, 1.07, 1], { duration: 0.45, ease: "easeOut", delay: 0.12 });
      }
      onPaid?.();
    } else {
      // the arcs straighten back into corners, and the face shakes its head
      await land();
      void curl(0, 220, 20);
      animate(tone, -1, { duration: reduce ? 0 : 0.2 });
      go(mouth, -1, 300, 22);
      setState("failed");
      // two low notes, on the first two swings of the head shake
      sfx.note(262, { dur: 0.13, gain: 0.11, type: "triangle", bell: 0 });
      sfx.note(220, { at: 0.17, dur: 0.2, gain: 0.11, type: "triangle", bell: 0 });
      if (!reduce) await animate(shake, [0, -8, 8, -6, 5, -2, 0], { duration: 0.55 });
      await hold(900);
      animate(tone, 0, { duration: reduce ? 0 : 0.5 });
      go(mouth, 0, 220, 20);
    }
    running.current = false;
  };

  const reset = () => {
    if (running.current) return;
    setState("idle");
    sfx.tick({ freq: 2200, gain: 0.06 });
    void curl(0, 220, 22);
    go(gap, 0.2);
    animate(tone, 0, { duration: reduce ? 0 : 0.3 });
    go(mouth, 0);
    go(eyes, 1);
  };

  const onTap = () => {
    touched.current = true;
    if (state === "paid") reset();
    else if (state !== "scanning") void scan();
  };

  // autoplay: a miss, then a match, then start over, until someone touches it
  useEffect(() => {
    if (!autoplay || reduce || !inView) return;
    let alive = true;
    const ok = () => alive && !touched.current;
    (async () => {
      await sleep(1000);
      while (ok()) {
        await scan();
        await sleep(stateRef.current === "paid" ? 2600 : 1300);
        if (!ok()) return;
        if (stateRef.current === "paid") {
          reset();
          await sleep(1500);
        }
      }
    })();
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoplay, reduce, inView]);

  useEffect(() => () => loops.current.forEach((c) => c.stop()), []);

  const caption =
    state === "scanning" ? "Looking for you" : state === "paid" ? `Paid ${amount}` : state === "failed" ? "Face not recognised. Tap to try again." : "Tap to pay with your face";
  const label = state === "paid" ? `Paid ${amount} to ${merchant}. Tap to start over` : state === "scanning" ? "Checking your face" : `Pay ${amount} to ${merchant} with your face`;

  return (
    <div
      ref={rootRef}
      className={`flex w-full max-w-[300px] flex-col items-center rounded-[24px] bg-white px-6 pb-6 pt-6 text-[#1d1d1f] shadow-[0_0_0_1px_rgba(0,0,0,.05),0_20px_40px_-26px_rgba(0,0,0,.35)] ${className}`}
    >
      <p className="m-0 text-[13px] text-[#6e6e73]">{merchant}</p>
      <p className="m-0 mt-0.5 text-[34px] font-semibold tabular-nums tracking-[-0.03em]">{amount}</p>
      <button
        type="button"
        onClick={onTap}
        aria-label={label}
        aria-busy={state === "scanning"}
        className="mt-5 grid h-[136px] w-[136px] place-items-center rounded-full outline-none transition-transform focus-visible:ring-2 focus-visible:ring-[#0071e3]/50 active:scale-[0.96]"
      >
        <motion.svg viewBox="-50 -50 100 100" className="h-[124px] w-[124px] overflow-visible" style={{ x: shake, scale: pulse }} aria-hidden="true">
          <defs>
            <clipPath id={`face-${uid}`}>
              <circle r={29} />
            </clipPath>
            <linearGradient id={`scan-${uid}`} x1="0" x2="1">
              <stop offset="0" stopColor="#0071e3" stopOpacity="0" />
              <stop offset=".5" stopColor="#0071e3" stopOpacity=".9" />
              <stop offset="1" stopColor="#0071e3" stopOpacity="0" />
            </linearGradient>
            <linearGradient id={`band-${uid}`} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0" stopColor="#0071e3" stopOpacity="0" />
              <stop offset="1" stopColor="#0071e3" stopOpacity=".12" />
            </linearGradient>
          </defs>
          {/* the ripple when it matches */}
          <motion.circle r={RING} fill="none" stroke="#30d158" strokeWidth={2.4} style={{ scale: rippleScale, opacity: rippleOpacity }} />
          <motion.g style={{ scale: breathe }}>
            <motion.g style={{ rotate: spin }}>
              {[0, 1, 2, 3].map((i) => (
                <Corner key={i} i={i} m={ms[i]!} gap={gap} color={color} />
              ))}
            </motion.g>
          </motion.g>
          {/* the scan line, sweeping up and down the face */}
          <g clipPath={`url(#face-${uid})`}>
            <motion.g style={{ y: scanY, opacity: scanOn }}>
              <rect x={-30} y={-12} width={60} height={12} fill={`url(#band-${uid})`} />
              <rect x={-30} y={-0.75} width={60} height={1.5} rx={0.75} fill={`url(#scan-${uid})`} />
            </motion.g>
          </g>
          <motion.g style={{ x: lookFace }}>
            <motion.g style={{ opacity: eyes, scaleY: blink }}>
              <motion.path d="M-10,-11 V-4 M10,-11 V-4" fill="none" style={{ stroke: color }} strokeWidth={3.6} strokeLinecap="round" />
            </motion.g>
            <motion.path d={mouthD} fill="none" style={{ stroke: color }} strokeWidth={3.6} strokeLinecap="round" strokeLinejoin="round" />
          </motion.g>
        </motion.svg>
      </button>
      <p
        aria-live="polite"
        className={`m-0 mt-3 min-h-[20px] text-center text-[13px] ${state === "paid" ? "font-medium text-[#248a3d]" : state === "failed" ? "text-[#d70015]" : "text-[#6e6e73]"}`}
      >
        {caption}
      </p>
    </div>
  );
}
```

--- components/face-scan-morph/index.ts ---

```ts
export { default as FaceScanMorph } from "./face-scan-morph";
export type { FaceScanMorphProps } from "./face-scan-morph";
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
