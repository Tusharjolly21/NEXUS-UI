# Peel Delete

Add the "Peel Delete" component from Nexus UI to my project.

Hold to delete, where holding peels the note off like a sticker. Press and hold the bin and the note's corner lifts, then the fold runs in across it, the paper back of the curl showing and its shadow falling on the note, with a rasp that follows the speed of the peel. Let go early and it sticks back down with a pat. Hold all the way and it rips off like a plaster in one continuous pull, leaving the patch where it was stuck. The bin turns into Undo with the time left drawn round it, and Undo slides the note back and smooths it flat. Space or Enter holds from the keyboard, and the bin's label says to press and hold.

Please:

1. Create the files below at sensible paths for this project, keeping each file's name. They import each other with relative paths, so keep them together.
2. Install what it needs: `framer-motion` (use this project's package manager).
3. It is styled with Tailwind CSS classes, so the project needs Tailwind.
4. It uses `@/lib/ui-sounds` for its interaction sounds, which are synthesised in the browser, so no audio files are needed. Create it at lib/ from the file below.
5. Use it like this: `import { PeelDelete } from "@/components/peel-delete";`. The props are typed and documented in the code.

Copy the code exactly as it is. Do not restyle, simplify or rename anything, and keep the comments: they explain why the numbers are what they are. The only thing to adapt is import paths, if this project uses a different alias than `@/`.

--- components/peel-delete/index.ts ---

```ts
export { default as PeelDelete } from "./peel-delete";
export type { PeelDeleteProps } from "./peel-delete";
```

--- components/peel-delete/peel-delete.tsx ---

```tsx
"use client";

import { AnimatePresence, animate, motion, useInView, useMotionValue, useReducedMotion, useTransform, type AnimationPlaybackControls } from "framer-motion";
import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useAutoplaySoundAllowed, useSoundsEnabled } from "@/lib/ui-sounds";

export type PeelItem = { id: string; title: string; text?: string; time?: string; /** the sticker's paper colour */ color?: string };

export type PeelDeleteProps = {
  items?: PeelItem[];
  /** called when a note is really gone, after the undo window */
  onDelete?: (item: PeelItem) => void;
  /** how long to hold the bin, in milliseconds */
  holdMs?: number;
  undoSeconds?: number;
  title?: string;
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
  /** true when a sound would play right now */
  ok: () => boolean;
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
      ok: () => live() !== null,
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

/** a sticker coming away: looping noise whose loudness and brightness follow how fast it peels */
function startRasp(volume: number) {
  const e = engine();
  if (!e || e.ctx.state !== "running" || volume <= 0) return null;
  const { ctx, noise } = e;
  const src = ctx.createBufferSource();
  src.buffer = noise;
  src.loop = true;
  const bp = ctx.createBiquadFilter();
  bp.type = "bandpass";
  bp.frequency.value = 1800;
  bp.Q.value = 0.9;
  const g = ctx.createGain();
  g.gain.value = 0.0001;
  src.connect(bp).connect(g).connect(ctx.destination);
  src.start(ctx.currentTime, Math.random() * 0.5);
  return {
    set(level: number) {
      const t = ctx.currentTime, l = Math.max(0, Math.min(1, level));
      g.gain.setTargetAtTime(Math.max(0.0001, l * 0.11 * volume), t, 0.025);
      bp.frequency.setTargetAtTime(1500 + l * 2600, t, 0.04);
    },
    stop() {
      const t = ctx.currentTime;
      g.gain.setTargetAtTime(0.0001, t, 0.02);
      src.stop(t + 0.15);
    },
  };
}
/** a soft pat: a sticker pressed back down */
function pat(sfx: Sound, at = 0) {
  sfx.note(150, { at, dur: 0.12, gain: 0.12, bell: 0, glide: 90 });
  sfx.tick({ at, freq: 900, gain: 0.07 });
}

// Phosphor Icons (MIT), via Iconify
const ICON = {
  trash: "<path fill=\"currentColor\" d=\"M216 48h-36V36a28 28 0 0 0-28-28h-48a28 28 0 0 0-28 28v12H40a12 12 0 0 0 0 24h4v136a20 20 0 0 0 20 20h128a20 20 0 0 0 20-20V72h4a12 12 0 0 0 0-24M100 36a4 4 0 0 1 4-4h48a4 4 0 0 1 4 4v12h-56Zm88 168H68V72h120Zm-72-100v64a12 12 0 0 1-24 0v-64a12 12 0 0 1 24 0m48 0v64a12 12 0 0 1-24 0v-64a12 12 0 0 1 24 0\"/>",
  undo: "<path fill=\"currentColor\" d=\"M228 128a100 100 0 0 1-98.66 100H128a99.4 99.4 0 0 1-68.62-27.29a12 12 0 0 1 16.48-17.45a76 76 0 1 0-1.57-109c-.13.13-.25.25-.39.37L54.89 92H72a12 12 0 0 1 0 24H24a12 12 0 0 1-12-12V56a12 12 0 0 1 24 0v20.72l21.48-19.66A100 100 0 0 1 228 128\"/>",
};

const DEFAULT_ITEMS: PeelItem[] = [
  { id: "groceries", title: "Groceries", text: "Oat milk, lemons, rye bread", time: "9:41", color: "#fff6cc" },
  { id: "gate", title: "Gate code", text: "4471, then the bell on the left", time: "Yesterday", color: "#e3f1ff" },
  { id: "book", title: "Book club", text: "Chapters six to nine by Thursday", time: "Mon", color: "#ffe6ea" },
];

// ───────────── the peel: a fold line moving in from the sticker's bottom right corner, the lifted part turned up about it ─────────────

type P = readonly [number, number];
const RADIUS = 14;
/** the way the fold travels across the sticker: leftwards and a little up, so a rip pulls up and away */
const DIR: P = (() => {
  const x = -1, y = -0.24, m = Math.hypot(x, y);
  return [x / m, y / m] as const;
})();
const DEG = Math.PI / 180;
/** how far the curl is turned up while held: lifted at first, nearly flat over the note by the end */
const holdAngle = (p: number) => 158 + 18 * Math.min(1, Math.max(0, p));

function roundedRect(w: number, h: number, r: number): P[] {
  const pts: P[] = [];
  const arc = (cx: number, cy: number, a0: number) => {
    for (let i = 0; i <= 5; i++) {
      const a = a0 + (Math.PI / 2) * (i / 5);
      pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]);
    }
  };
  arc(w - r, r, -Math.PI / 2); // top right
  arc(w - r, h - r, 0);
  arc(r, h - r, Math.PI / 2);
  arc(r, r, Math.PI);
  return pts;
}
/** the part of a convex polygon on one side of the fold: far is the part still stuck down */
function clip(poly: P[], C: P, s: number, far: boolean): P[] {
  const f = (p: P) => (p[0] - C[0]) * DIR[0] + (p[1] - C[1]) * DIR[1] - s;
  const inside = (v: number) => (far ? v >= 0 : v < 0);
  const out: P[] = [];
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i]!, b = poly[(i + 1) % poly.length]!;
    const fa = f(a), fb = f(b);
    if (inside(fa)) out.push(a);
    if (inside(fa) !== inside(fb)) {
      const t = fa / (fa - fb);
      out.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]);
    }
  }
  return out;
}
/**
 * Turn a point of the lifted part up about the fold by phi (0 lying flat where it was, 180 folded flat over the note),
 * seen from above: it lands this far past the fold, and its height above the board drives its shadow.
 */
const turn = (p: P, C: P, s: number, phi: number) => {
  const u = s - ((p[0] - C[0]) * DIR[0] + (p[1] - C[1]) * DIR[1]); // distance from the fold
  const k = u * (1 - Math.cos(phi * DEG));
  return { x: p[0] + k * DIR[0], y: p[1] + k * DIR[1], z: u * Math.sin(phi * DEG) };
};

type RowApi = { hold: () => void; release: () => void; undo: () => void };

function PeelRow({
  item,
  holdMs,
  undoSeconds,
  sfx,
  rasp,
  reduce,
  register,
  onCommit,
}: {
  item: PeelItem;
  holdMs: number;
  undoSeconds: number;
  sfx: Sound;
  rasp: number;
  reduce: boolean;
  register: (id: string, api: RowApi | null) => void;
  onCommit: () => void;
}) {
  const uid = useId().replace(/:/g, "");
  const [gone, setGone] = useState(false);
  const p = useMotionValue(0); // how far it is held, 0 to 1 (past 1 as it comes away)
  const hover = useMotionValue(0);
  const left = useMotionValue(1); // the undo window
  // once it comes free it flies as one piece: these are set frame by frame during the rip
  const flyO = useMotionValue(1);
  const flyBlur = useMotionValue(0);
  const flyFilter = useTransform(flyBlur, (b) => (b > 0.05 ? `blur(${b.toFixed(2)}px)` : "none"));
  const ringOn = useMotionValue(0); // the red ring shows only while held
  const ringRed = useTransform(p, [0, 1], [0, 1]);

  const binColor = useTransform(p, [0, 0.6, 1], ["#6e6e73", "#ff6b5e", "#ff3b30"]);

  const stickerRef = useRef<HTMLDivElement>(null);
  const baseRef = useRef<HTMLDivElement>(null);
  const flapRef = useRef<SVGPathElement>(null);
  const shadeRef = useRef<SVGPathElement>(null);
  const gradRef = useRef<SVGLinearGradientElement>(null);
  const blurRef = useRef<SVGFEGaussianBlurElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const size = useRef({ w: 248, h: 64 });
  /** while ripping, the fold and the angle come from the rip instead of the hold, and once free it drifts, turns and lifts */
  const ripRef = useRef<{ s: number; phi: number; lift: number; dx: number; dy: number; spin: number } | null>(null);

  const draw = () => {
    const { w, h } = size.current;
    const pv = p.get();
    const r = ripRef.current;
    const s = r ? r.s : Math.max(0, w * 0.55 * Math.pow(Math.max(0, pv), 1.35) + hover.get() * 9 * Math.max(0, 1 - pv * 3));
    const phi = r ? r.phi : holdAngle(pv);
    const C: P = [w, h];
    const rect = roundedRect(w, h, RADIUS);
    const f = (q: P) => `${q[0].toFixed(1)}px ${q[1].toFixed(1)}px`;
    if (s < 0.3) {
      if (baseRef.current) baseRef.current.style.clipPath = "none";
      flapRef.current?.setAttribute("d", "");
      shadeRef.current?.setAttribute("d", "");
      return;
    }
    const stuck = clip(rect, C, s, true);
    if (baseRef.current) baseRef.current.style.clipPath = stuck.length > 2 ? `polygon(${stuck.map(f).join(",")})` : "polygon(0 0,0 0,0 0)";
    const lifted = clip(rect, C, s, false);
    // the lifted part, plus its fold point and lifted corner for the light across it
    const fold = { x: C[0] + DIR[0] * s, y: C[1] + DIR[1] * s, z: 0 };
    let pts = [...lifted.map((q) => turn(q, C, s, phi)), fold, turn(C, C, s, phi)];
    if (r && (r.lift || r.dx || r.dy || r.spin)) {
      // free of the board: it turns about its middle, drifts, and lifts towards you
      let mx = 0, my = 0;
      for (const v of pts) {
        mx += v.x;
        my += v.y;
      }
      mx /= pts.length;
      my /= pts.length;
      const cs = Math.cos(r.spin), sn = Math.sin(r.spin);
      pts = pts.map((v) => ({ x: mx + (v.x - mx) * cs - (v.y - my) * sn + r.dx, y: my + (v.x - mx) * sn + (v.y - my) * cs + r.dy, z: v.z + r.lift }));
    }
    const shape = pts.slice(0, -2);
    const path = (q: { x: number; y: number }[]) => (q.length > 2 ? `M${q.map((v) => `${v.x.toFixed(1)},${v.y.toFixed(1)}`).join("L")}Z` : "");
    // seen in perspective from above the note, so what lifts grows and leans out
    const cx = w / 2, cy = h / 2, FOCAL = 900;
    const see = (v: { x: number; y: number; z: number }) => {
      const k = FOCAL / (FOCAL - Math.min(v.z, FOCAL * 0.78));
      return { x: cx + (v.x - cx) * k, y: cy + (v.y - cy) * k };
    };
    flapRef.current?.setAttribute("d", path(shape.map(see)));
    // its shadow stays on the board, further off, softer and fainter the higher it is
    let zMax = 0;
    for (const v of shape) zMax = Math.max(zMax, v.z);
    shadeRef.current?.setAttribute("d", path(shape.map((v) => ({ x: v.x - 1 - v.z * 0.04, y: v.y + 2.5 + v.z * 0.1 }))));
    shadeRef.current?.setAttribute("fill-opacity", (0.2 * Math.max(0.3, 1 - zMax / 300)).toFixed(3));
    blurRef.current?.setAttribute("stdDeviation", (2.5 + Math.min(zMax, 400) * 0.035).toFixed(2));
    // light along the fold, darker towards the lifted corner
    const a = see(pts[pts.length - 2]!), b = see(pts[pts.length - 1]!);
    const len = Math.hypot(b.x - a.x, b.y - a.y);
    const ux = len > 4 ? (b.x - a.x) / len : DIR[0], uy = len > 4 ? (b.y - a.y) / len : DIR[1];
    const reach = Math.max(4, len);
    const gr = gradRef.current;
    if (gr) {
      gr.setAttribute("x1", a.x.toFixed(1));
      gr.setAttribute("y1", a.y.toFixed(1));
      gr.setAttribute("x2", (a.x + ux * reach).toFixed(1));
      gr.setAttribute("y2", (a.y + uy * reach).toFixed(1));
    }
  };

  useLayoutEffect(() => {
    const el = stickerRef.current;
    if (!el) return;
    const measure = () => {
      size.current = { w: el.offsetWidth, h: el.offsetHeight };
      const { w, h } = size.current;
      svgRef.current?.setAttribute("viewBox", `${-w} ${-h} ${w * 3} ${h * 3}`);
      draw();
    };
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    measure();
    const a = p.on("change", draw), b = hover.on("change", draw);
    return () => {
      ro.disconnect();
      a();
      b();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // the peel's sound follows its speed
  const raspNode = useRef<ReturnType<typeof startRasp>>(null);
  const lastP = useRef({ v: 0, t: 0 });
  useEffect(
    () =>
      p.on("change", (v) => {
        const now = performance.now(), dt = Math.max(1, now - lastP.current.t);
        const speed = Math.abs(v - lastP.current.v) / dt; // per ms
        lastP.current = { v, t: now };
        raspNode.current?.set(Math.min(1, speed * 900 * (0.4 + v)));
        if (raspNode.current && Math.random() < speed * 40) sfx.tick({ freq: 2600 + Math.random() * 2400, gain: 0.03 });
      }),
    [p, sfx],
  );

  const holding = useRef(false);
  const downWhileGone = useRef(false);
  const holdAnim = useRef<AnimationPlaybackControls | null>(null);
  const timer = useRef<AnimationPlaybackControls | null>(null);
  const stopRasp = () => {
    raspNode.current?.stop();
    raspNode.current = null;
  };

  const ripFrame = useRef(0);
  /**
   * The rip, done the way you take off a plaster: pulled back low over itself, fast, in one go. The fold carries on at
   * the speed the hold left it and races across the rest of the note, the curl lying flat back over it and sliding out
   * past its far end at twice the fold's speed; when the last edge lets go it keeps going the same way at the same
   * speed, slowed by the air, lifting a little, turning, blurring and fading. Nothing stops and starts, so it reads as
   * one pull. The rasp swells with the race and stops dead as it comes free, with a tack and a rush of air.
   */
  const peelOff = async () => {
    holding.current = false;
    void animate(ringOn, 0, { duration: 0.25 });
    if (reduce) {
      stopRasp();
      sfx.tick({ freq: 1400, gain: 0.08 });
      flyO.set(0);
    } else {
      const { w, h } = size.current;
      const s0 = w * 0.55;
      const sEnd = w * Math.abs(DIR[0]) + h * Math.abs(DIR[1]) + 2;
      const v0 = (w * 0.55 * 1.35) / (holdMs / 1000); // the hold's speed as it ended, in px a second
      const T1 = 0.2, T2 = 0.26, DRAG = 9;
      const a = Math.max(0, (2 * (sEnd - s0 - v0 * T1)) / (T1 * T1));
      const vEnd = v0 + a * T1;
      const phi0 = holdAngle(1), phi1 = 179.5;
      for (let i = 0; i < 14; i++) sfx.tick({ at: T1 * Math.pow(i / 13, 0.8), freq: 2200 + Math.random() * 3200, gain: 0.03 + 0.04 * (i / 13) });
      sfx.whoosh(800, 3400, { dur: T1 + 0.02, gain: 0.08 });
      sfx.tick({ at: T1, freq: 1250, gain: 0.1 });
      sfx.whoosh(2400, 500, { at: T1, dur: 0.32, gain: 0.05 });
      await new Promise<void>((done) => {
        const start = performance.now();
        let free = false;
        const step = (now: number) => {
          const t = (now - start) / 1000;
          if (t < T1) {
            const e = t / T1;
            ripRef.current = { s: s0 + v0 * t + 0.5 * a * t * t, phi: phi0 + (phi1 - phi0) * e, lift: 0, dx: 0, dy: 0, spin: 0 };
            raspNode.current?.set(0.55 + 0.45 * e);
          } else {
            if (!free) {
              free = true;
              stopRasp();
            }
            // the fold keeps moving at the speed it had, so the note slides on the same way, slowing
            const tf = Math.min(T2, t - T1);
            ripRef.current = {
              s: sEnd + (vEnd * (1 - Math.exp(-DRAG * tf))) / DRAG,
              phi: phi1,
              lift: 0,
              dx: 0,
              dy: -110 * tf,
              spin: -0.16 * (1 - Math.exp(-7 * tf)),
            };
            flyO.set(Math.max(0, 1 - Math.pow(Math.max(0, tf - 0.04) / (T2 - 0.04), 1.2)));
            flyBlur.set(Math.min(1.2, tf * 8));
          }
          draw();
          if (t - T1 >= T2) return done();
          ripFrame.current = requestAnimationFrame(step);
        };
        ripFrame.current = requestAnimationFrame(step);
      });
    }
    setGone(true);
    left.set(1);
    timer.current = animate(left, 0, {
      duration: undoSeconds,
      ease: "linear",
      onComplete: () => {
        sfx.tick({ freq: 1600, gain: 0.05 });
        onCommit();
      },
    });
  };
  const hold = () => {
    if (gone || holding.current || ripRef.current || flyO.get() < 1) return;
    holding.current = true;
    void animate(ringOn, 1, { duration: 0.12 });
    sfx.tick({ freq: 1150, gain: 0.08 });
    raspNode.current = rasp > 0 && sfx.ok() ? startRasp(rasp) : null;
    lastP.current = { v: p.get(), t: performance.now() };
    holdAnim.current?.stop();
    holdAnim.current = animate(p, 1, { duration: (holdMs / 1000) * (1 - Math.min(1, p.get())), ease: "linear", onComplete: () => void peelOff() });
  };
  const release = () => {
    if (!holding.current) return;
    holding.current = false;
    holdAnim.current?.stop();
    stopRasp();
    if (p.get() >= 1) return;
    void animate(ringOn, 0, { duration: 0.3 });
    // let go early and it sticks back down
    pat(sfx, reduce ? 0 : 0.12);
    void animate(p, 0, reduce ? { duration: 0 } : { type: "spring", stiffness: 420, damping: 24 });
  };
  const undo = async () => {
    if (!gone) return;
    timer.current?.stop();
    setGone(false);
    sfx.whoosh(320, 1300, { dur: 0.35, gain: 0.05 });
    sfx.note(1319, { at: 0.34, dur: 0.3, gain: 0.05, bell: 0.4 });
    // it slides back in the way it left, folded back over itself, and is smoothed flat in the same movement
    p.set(0);
    flyBlur.set(0);
    if (!reduce) {
      const { w } = size.current;
      const far = w * 1.45;
      ripRef.current = { s: far, phi: 179.5, lift: 0, dx: 0, dy: -24, spin: -0.12 };
      draw();
      void animate(flyO, 1, { duration: 0.16 });
      pat(sfx, 0.4);
      await animate(0, 1, {
        duration: 0.56,
        ease: [0.2, 0.86, 0.32, 1],
        onUpdate: (k) => {
          ripRef.current = { s: far * (1 - k), phi: 179.5 - 21.5 * k, lift: 0, dx: 0, dy: -24 * (1 - k), spin: -0.12 * (1 - k) };
          draw();
        },
      });
    } else {
      pat(sfx);
      flyO.set(1);
    }
    ripRef.current = null;
    draw();
  };

  // the parent's autoplay drives the row through these; they always call this render's handlers
  const apiRef = useRef<RowApi>({ hold, release, undo });
  useEffect(() => {
    apiRef.current = { hold, release, undo };
  });
  useEffect(() => {
    register(item.id, { hold: () => apiRef.current.hold(), release: () => apiRef.current.release(), undo: () => void apiRef.current.undo() });
    return () => {
      register(item.id, null);
      holdAnim.current?.stop();
      timer.current?.stop();
      cancelAnimationFrame(ripFrame.current);
      stopRasp();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const ring = 2 * Math.PI * 21;
  const dash = useTransform(left, (v) => ring * (1 - v));
  const holdDash = useTransform(ringRed, (v) => ring * (1 - Math.min(1, v)));

  return (
    <div className="flex items-center gap-3">
      <div ref={stickerRef} className="relative h-[64px] min-w-0 flex-1">
        {/* where it was stuck down */}
        <div className="absolute inset-0 rounded-[14px] bg-[#ececf0] shadow-[inset_0_1px_3px_rgba(0,0,0,.08)]" />
        <AnimatePresence>
          {gone && (
            <motion.p
              className="absolute inset-0 m-0 flex items-center px-3.5 text-[13px] text-[#6e6e73]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <span className="truncate">
                Deleted <span className="font-medium text-[#1d1d1f]">{item.title}</span>
              </span>
            </motion.p>
          )}
        </AnimatePresence>
        <motion.div className="pointer-events-none absolute inset-0 z-10" style={{ opacity: flyO, filter: flyFilter }}>
          <div className="absolute inset-0" style={{ filter: "drop-shadow(0 1px 1.5px rgba(0,0,0,.16))" }}>
            <div ref={baseRef} className="absolute inset-0 rounded-[14px] px-3.5 py-2.5" style={{ background: item.color ?? "#ffffff" }}>
              <div className="flex items-baseline gap-2">
                <span className="min-w-0 flex-1 truncate text-[15px] font-semibold leading-[20px] tracking-[-0.01em] text-[#1d1d1f]">{item.title}</span>
                {item.time && <span className="shrink-0 text-[12px] text-[#6e6e73]">{item.time}</span>}
              </div>
              {item.text && <p className="m-0 mt-0.5 truncate text-[13px] leading-[18px] text-[#3a3a3c]">{item.text}</p>}
            </div>
          </div>
          <svg ref={svgRef} className="absolute overflow-visible" style={{ left: "-100%", top: "-100%", width: "300%", height: "300%" }} aria-hidden="true">
            <defs>
              <linearGradient id={`back-${uid}`} ref={gradRef} gradientUnits="userSpaceOnUse">
                <stop offset="0" stopColor="#ffffff" />
                <stop offset="0.45" stopColor="#f0f0f3" />
                <stop offset="1" stopColor="#d6d6dc" />
              </linearGradient>
              <filter id={`lift-${uid}`} x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur ref={blurRef} stdDeviation="2.5" />
              </filter>
            </defs>
            {/* the curl's shadow on the sticker, then the paper back of the curl */}
            <path ref={shadeRef} fill="#000000" fillOpacity=".2" filter={`url(#lift-${uid})`} />
            <path ref={flapRef} fill={`url(#back-${uid})`} stroke="#ffffff" strokeOpacity=".9" strokeWidth={0.8} />
          </svg>
        </motion.div>
      </div>

      {/* the bin: hold it down; afterwards it is Undo, with the time left drawn round it */}
      <button
        type="button"
        aria-label={gone ? `Undo deleting ${item.title}` : `Delete ${item.title}. Press and hold`}
        onPointerDown={(e) => {
          downWhileGone.current = gone;
          if (gone || e.button !== 0) return;
          e.currentTarget.setPointerCapture(e.pointerId);
          hold();
        }}
        onPointerUp={release}
        onPointerCancel={release}
        onLostPointerCapture={release}
        onPointerEnter={() => !gone && animate(hover, 1, { duration: 0.2 })}
        onPointerLeave={() => animate(hover, 0, { duration: 0.2 })}
        onFocus={() => !gone && animate(hover, 1, { duration: 0.2 })}
        onBlur={() => {
          animate(hover, 0, { duration: 0.2 });
          release();
        }}
        onKeyDown={(e) => {
          if (e.key !== " " && e.key !== "Enter") return;
          e.preventDefault(); // every press, repeats included, so the browser never turns the key into a click
          if (e.repeat) return;
          if (gone) void undo();
          else hold();
        }}
        onKeyUp={(e) => {
          if (e.key !== " " && e.key !== "Enter") return;
          e.preventDefault();
          release();
        }}
        onClick={(e) => {
          // letting go at the end of a hold is a click too; only a fresh press, or a keyboard or assistive click, undoes
          if (gone && (e.detail === 0 || downWhileGone.current)) void undo();
        }}
        onContextMenu={(e) => e.preventDefault()}
        className="relative grid h-[48px] w-[48px] shrink-0 touch-none select-none place-items-center rounded-full bg-[#f5f5f7] outline-none transition-transform focus-visible:ring-2 focus-visible:ring-[#0071e3]/50 active:scale-95"
      >
        <svg viewBox="-24 -24 48 48" className="absolute inset-0 h-full w-full -rotate-90" aria-hidden="true">
          {gone ? (
            <motion.circle key="left" r={21} fill="none" stroke="#0071e3" strokeWidth={2.5} strokeLinecap="round" strokeDasharray={ring} style={{ strokeDashoffset: dash }} />
          ) : (
            <motion.circle key="held" r={21} fill="none" stroke="#ff3b30" strokeWidth={2.5} strokeLinecap="round" strokeDasharray={ring} style={{ strokeDashoffset: holdDash, opacity: ringOn }} />
          )}
        </svg>
        <AnimatePresence initial={false} mode="popLayout">
          {gone ? (
            <motion.span
              key="undo"
              className="grid place-items-center text-[#0071e3]"
              initial={reduce ? { opacity: 0 } : { rotate: 120, scale: 0.4, opacity: 0 }}
              animate={{ rotate: 0, scale: 1, opacity: 1 }}
              exit={reduce ? { opacity: 0 } : { rotate: 120, scale: 0.4, opacity: 0 }}
              transition={{ type: "spring", stiffness: 380, damping: 22 }}
            >
              <svg viewBox="0 0 256 256" width="20" height="20" aria-hidden="true" dangerouslySetInnerHTML={{ __html: ICON.undo }} />
            </motion.span>
          ) : (
            <motion.span
              key="bin"
              className="grid place-items-center"
              style={{ color: binColor }}
              initial={reduce ? { opacity: 0 } : { rotate: -120, scale: 0.4, opacity: 0 }}
              animate={{ rotate: 0, scale: 1, opacity: 1 }}
              exit={reduce ? { opacity: 0 } : { rotate: -120, scale: 0.4, opacity: 0 }}
              transition={{ type: "spring", stiffness: 380, damping: 22 }}
            >
              <svg viewBox="0 0 256 256" width="20" height="20" aria-hidden="true" dangerouslySetInnerHTML={{ __html: ICON.trash }} />
            </motion.span>
          )}
        </AnimatePresence>
      </button>
    </div>
  );
}

/**
 * Hold to delete, where holding peels the note off like a sticker.
 *
 * Press and hold the bin and the note's bottom right corner lifts, then the fold runs in across it, the paper back of
 * the curl showing and its shadow falling on the note, with a rasp that follows the speed of the peel. Let go early and
 * it sticks back down with a pat. Hold all the way and it rips off like a plaster, the fold racing across the rest and
 * the note sliding away in one continuous pull, leaving the patch where it was stuck; the bin turns into Undo with the
 * time left drawn round it, and Undo slides the note back in and smooths it flat. Space or Enter holds from the
 * keyboard. The bin's label says to press and hold, and changes to Undo.
 */
export default function PeelDelete({
  items = DEFAULT_ITEMS,
  onDelete,
  holdMs = 1000,
  undoSeconds = 5,
  title = "Notes",
  enableSound = true,
  volume = 0.8,
  autoplay = false,
  className = "",
}: PeelDeleteProps) {
  const reduce = !!useReducedMotion();
  const [siteSound] = useSoundsEnabled();
  // a demo playing by itself only makes sound where the page allows it (see AutoplaySound)
  const autoplaySoundOk = useAutoplaySoundAllowed();
  const autoplayOk = useRef(autoplaySoundOk);
  useEffect(() => {
    autoplayOk.current = autoplaySoundOk;
  }, [autoplaySoundOk]);
  const touched = useRef(false);
  const sfx = useSound(enableSound && siteSound, volume, () => touched.current || autoplayOk.current);
  const [list, setList] = useState(items);
  const rootRef = useRef<HTMLDivElement>(null);
  const inView = useInView(rootRef, { margin: "100px" });
  const apis = useRef(new Map<string, RowApi>());
  const register = useMemo(
    () => (id: string, api: RowApi | null) => {
      if (api) apis.current.set(id, api);
      else apis.current.delete(id);
    },
    [],
  );
  const raspVol = Math.max(0, Math.min(1, volume));

  // autoplay: peel one and undo it, give up half way on another, peel the last for good, then bring them all back
  useEffect(() => {
    if (!autoplay || !inView) return;
    let alive = true;
    const ok = () => alive && !touched.current;
    const sleep = (ms: number) => new Promise((r) => window.setTimeout(r, ms));
    const api = (i: number) => apis.current.get(items[i]?.id ?? "");
    (async () => {
      await sleep(1100);
      while (ok()) {
        setList(items);
        await sleep(600);
        api(1)?.hold();
        await sleep(holdMs + 1900);
        if (!ok()) return;
        api(1)?.undo();
        await sleep(1700);
        if (!ok()) return;
        api(0)?.hold();
        await sleep(holdMs * 0.62);
        api(0)?.release();
        await sleep(1300);
        if (!ok()) return;
        api(2)?.hold();
        await sleep(holdMs + undoSeconds * 1000 + 1600);
        if (!ok()) return;
      }
    })();
    return () => {
      alive = false;
      apis.current.forEach((a) => a.release());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoplay, inView]);

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
      <div className="mb-3 flex items-baseline justify-between">
        <h3 className="m-0 text-[17px] font-semibold tracking-[-0.02em]">{title}</h3>
        <span className="text-[13px] tabular-nums text-[#6e6e73]" aria-live="polite">
          {list.length} {list.length === 1 ? "note" : "notes"}
        </span>
      </div>
      <ul className="m-0 flex min-h-[64px] list-none flex-col p-0">
        <AnimatePresence initial={false}>
          {list.map((it, i) => (
            <motion.li
              key={it.id}
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 380, damping: 34 }}
              className={i === 0 ? "" : "pt-2.5"}
            >
              <PeelRow
                item={it}
                holdMs={holdMs}
                undoSeconds={undoSeconds}
                sfx={sfx}
                rasp={raspVol}
                reduce={reduce}
                register={register}
                onCommit={() => {
                  setList((l) => l.filter((x) => x.id !== it.id));
                  onDelete?.(it);
                }}
              />
            </motion.li>
          ))}
        </AnimatePresence>
        {list.length === 0 && (
          <li className="flex h-[64px] items-center justify-between gap-3 rounded-[14px] border border-dashed border-black/10 px-3.5">
            <span className="text-[13px] text-[#6e6e73]">No notes left.</span>
            <button
              type="button"
              onClick={() => setList(items)}
              className="rounded-full bg-[#f5f5f7] px-3 py-1.5 text-[13px] font-medium text-[#0071e3] outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3]/50"
            >
              Bring them back
            </button>
          </li>
        )}
      </ul>
      <p className="m-0 mt-3 text-[13px] text-[#6e6e73]">Hold the bin to peel a note off.</p>
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
