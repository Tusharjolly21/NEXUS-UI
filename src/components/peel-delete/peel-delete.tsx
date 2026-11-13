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
