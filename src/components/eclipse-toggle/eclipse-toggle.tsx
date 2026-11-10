"use client";
/* eslint-disable react-hooks/refs, react-hooks/set-state-in-effect -- these rules assume code runs while rendering; here refs, timers and setState are used in handlers, effects and animation frames, and the animation state lives in refs on purpose */

import {
  AnimatePresence,
  animate,
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  useTransform,
  type AnimationPlaybackControls,
} from "framer-motion";
import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent as RKeyboardEvent, type PointerEvent as RPointerEvent } from "react";
import { useAutoplaySoundAllowed, useSoundsEnabled } from "@/lib/ui-sounds";

export type Theme = "light" | "dark";

export type EclipseToggleProps = {
  theme?: Theme;
  defaultTheme?: Theme;
  /** Called with the new theme. `fromUser` is false while autoplay is running, so you can leave the page alone then. */
  onThemeChange?: (theme: Theme, detail: { fromUser: boolean }) => void;
  /**
   * Change the page inside an eclipse when the visitor flips the switch: the moon's shadow spills out of the switch
   * and across the page, its edge burning like the corona, and the stars come out; switching back, sunlight floods
   * out of the sun with a golden rim. Whatever your onThemeChange does to the page is what gets revealed.
   * Uses the View Transitions API; without it, or with reduced motion, the theme just changes.
   */
  pageTransition?: boolean;
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

// ───────────── the sky, 260 by 104: a pill of sky with the sun at the right; the knob is the moon ─────────────

const W = 260, H = 104, CY = 52;
const LEFT = 52; // the moon at rest, light mode
const SUN = 208; // the sun's centre, and the moon's in dark mode
const RS = 34; // the sun
const RM = 35.2; // the moon, a touch larger, as it is when an eclipse is total

const clamp = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v));
/** a smooth step from a to b; a may be larger than b, for a step down */
const step = (a: number, b: number, x: number) => {
  const t = clamp((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};
/** how much of the sun the moon covers, as a fraction, from the distance between their centres */
const coverage = (d: number) => {
  if (d >= RM + RS) return 0;
  if (d <= RM - RS) return 1;
  const a =
    RS * RS * Math.acos((d * d + RS * RS - RM * RM) / (2 * d * RS)) +
    RM * RM * Math.acos((d * d + RM * RM - RS * RS) / (2 * d * RM)) -
    0.5 * Math.sqrt((-d + RS + RM) * (d + RS - RM) * (d - RS + RM) * (d + RS + RM));
  return clamp(a / (Math.PI * RS * RS));
};

/**
 * The lit part of the moon, as a path round its centre, lit on the side facing the sun (the right). `lit` runs from 1,
 * the full face, to 0, a new moon: the shadow sweeps in from the far side and leaves a crescent that thins towards the
 * sun, the way the moon looks in the days before an eclipse. The shadow's edge is half an ellipse.
 */
const phasePath = (lit: number) => {
  if (lit >= 0.999) return `M0,${-RM} A${RM},${RM} 0 1 1 0,${RM} A${RM},${RM} 0 1 1 0,${-RM} Z`;
  if (lit <= 0.001) return "M0,0 Z";
  const e = RM * (1 - 2 * lit); // where the shadow's edge crosses the middle: -RM is full, RM is new
  let d = `M0,${-RM} A${RM},${RM} 0 0 1 0,${RM}`;
  for (let i = 1; i < 24; i++) {
    const y = RM - (2 * RM * i) / 24;
    d += ` L${(e * Math.sqrt(1 - (y / RM) ** 2)).toFixed(2)},${y.toFixed(2)}`;
  }
  return `${d} Z`;
};

/** a fixed scatter: the same sky every time */
const rand = (i: number) => {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};
// rounded, so the server and the browser print the same numbers (their sin() can differ in the last digits)
const r2 = (n: number) => Math.round(n * 100) / 100;
const STARS = Array.from({ length: 22 }, (_, i) => ({ x: r2(10 + rand(i) * 150), y: r2(8 + rand(i + 50) * 72), r: r2(0.35 + rand(i + 99) * 0.6), g: i % 3 }));
/** the corona's streamers: angle in degrees, length, width at the root. Long near the sun's equator, short at its poles */
const STREAMERS: [number, number, number][] = [
  [-14, 60, 12], [166, 64, 13], [6, 40, 9], [192, 46, 10], [-36, 30, 7], [146, 36, 8], [26, 28, 6], [212, 30, 7],
  [-80, 17, 4], [-101, 15, 4], [79, 18, 4], [102, 14, 4], [-58, 22, 5], [122, 24, 5],
];
const RAYS = Array.from({ length: 30 }, (_, i) => ({ a: (i / 30) * 360 + rand(i + 7) * 9, l: 8 + rand(i + 21) * 26 }));

// ───────────── the moon's face, painted once into a small bitmap: the real near side, north up ─────────────

/** the seas, as soft overlapping blobs in a unit disc (x right, y down): centre, radii, and weight */
const MARIA: [number, number, number, number, number][] = [
  [-0.3, -0.45, 0.3, 0.28, 1], // Imbrium
  [-0.68, -0.22, 0.24, 0.3, 1], // Procellarum
  [-0.62, 0.12, 0.24, 0.24, 0.95],
  [-0.45, -0.02, 0.18, 0.2, 0.9],
  [-0.08, -0.76, 0.36, 0.075, 0.85], // Frigoris
  [0.28, -0.7, 0.16, 0.06, 0.8],
  [-0.48, -0.7, 0.14, 0.07, 0.75],
  [0.22, -0.38, 0.19, 0.18, 1.1], // Serenitatis
  [0.38, -0.08, 0.25, 0.2, 1.15], // Tranquillitatis
  [0.24, -0.14, 0.12, 0.1, 0.9],
  [0.69, -0.3, 0.12, 0.1, 1], // Crisium
  [0.6, 0.13, 0.14, 0.21, 1.05], // Fecunditatis
  [0.4, 0.3, 0.1, 0.1, 1], // Nectaris
  [0.5, 0.06, 0.1, 0.1, 0.8],
  [0.05, -0.24, 0.1, 0.065, 0.85], // Vaporum
  [0, -0.04, 0.07, 0.055, 0.8], // Sinus Medii
  [-0.22, -0.06, 0.13, 0.1, 0.85], // Insularum
  [-0.18, 0.32, 0.2, 0.15, 0.95], // Nubium
  [-0.32, 0.17, 0.12, 0.1, 0.9], // Cognitum
  [-0.53, 0.38, 0.1, 0.1, 1], // Humorum
];
/** bright young craters and a couple of dark floors: centre, radius, brightness (negative is dark) */
const CRATERS: [number, number, number, number][] = [
  [-0.12, 0.68, 0.03, 0.5], // Tycho
  [-0.3, -0.13, 0.03, 0.3], // Copernicus
  [-0.55, -0.1, 0.02, 0.22], // Kepler
  [-0.7, -0.35, 0.018, 0.45], // Aristarchus
  [0.6, -0.17, 0.015, 0.25], // Proclus
  [-0.1, -0.68, 0.035, -0.22], // Plato
  [-0.86, 0.05, 0.04, -0.2], // Grimaldi
  [-0.12, 0.86, 0.07, 0.06], // Clavius
];

let moonCache: { day: string; earth: string } | null = null;
/**
 * Paints the moon once: highland and sea tones from the map above, warped by noise so the edges are ragged, mottling,
 * pockmarks, Tycho's and Copernicus's rays and a touch of limb darkening. The daytime copy is white light whose
 * strength is its alpha, so the seas let the blue sky through, as they do on the real moon by day; the second copy is
 * the faint earthshine on the dark face at totality.
 */
function moonFaces(size = 256) {
  if (moonCache) return moonCache;
  const hash = (x: number, y: number) => {
    const h = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
    return h - Math.floor(h);
  };
  const noise = (x: number, y: number) => {
    const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi;
    const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
    const a = hash(xi, yi), b = hash(xi + 1, yi), c = hash(xi, yi + 1), d = hash(xi + 1, yi + 1);
    return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
  };
  const fbm = (x: number, y: number, oct = 5) => {
    let s = 0, amp = 0.5, f = 1;
    for (let o = 0; o < oct; o++) {
      s += amp * noise(x * f, y * f);
      f *= 2.03;
      amp *= 0.5;
    }
    return s / (1 - Math.pow(0.5, oct));
  };
  const rays = (x: number, y: number, cx: number, cy: number, reach: number, k: number) => {
    const dx = x - cx, dy = y - cy, dist = Math.hypot(dx, dy);
    if (dist < 0.03) return 0;
    const c = dx / dist, s = dy / dist;
    const streak = Math.pow(clamp(fbm(c * 6 + 31, s * 6 + 17, 3) * 2.2 - 1.15), 1.4);
    return k * streak * Math.exp(-dist / reach);
  };
  const day = document.createElement("canvas"), earth = document.createElement("canvas");
  day.width = day.height = earth.width = earth.height = size;
  const dctx = day.getContext("2d"), ectx = earth.getContext("2d");
  if (!dctx || !ectx) return null;
  const di = dctx.createImageData(size, size), ei = ectx.createImageData(size, size);
  for (let py = 0; py < size; py++) {
    for (let px = 0; px < size; px++) {
      const x = ((px + 0.5) / size) * 2 - 1, y = ((py + 0.5) / size) * 2 - 1;
      const r = Math.hypot(x, y);
      if (r > 1) continue;
      // the seas, with ragged, noisy shores
      const wx = x + (fbm(x * 2.5 + 5, y * 2.5) - 0.5) * 0.2 + (fbm(x * 7 + 1, y * 7) - 0.5) * 0.06;
      const wy = y + (fbm(x * 2.5, y * 2.5 + 9) - 0.5) * 0.2 + (fbm(x * 7, y * 7 + 4) - 0.5) * 0.06;
      // blobs that run together where they meet, as the real seas do, with thin bright mountain gaps where they don't
      let field = 0;
      for (const [cx, cy, rx, ry, w] of MARIA) field += w * Math.exp(-1.7 * (((wx - cx) / rx) ** 2 + ((wy - cy) / ry) ** 2));
      const m = step(0.15, 0.5, field);
      const highland = 0.88 + (fbm(x * 9, y * 9) - 0.5) * 0.2;
      const sea = 0.52 + (fbm(x * 5 + 3, y * 5) - 0.5) * 0.16;
      let b = highland * (1 - m) + sea * m;
      // craters, rays and pockmarks
      for (const [cx, cy, cr, br] of CRATERS) b += br * Math.exp(-(((x - cx) ** 2 + (y - cy) ** 2) / (cr * cr)));
      b += rays(x, y, -0.12, 0.68, 0.9, 0.2) + rays(x, y, -0.3, -0.13, 0.25, 0.16) + rays(x, y, -0.55, -0.1, 0.12, 0.1);
      const pit = noise(x * 52 + 7, y * 52 + 3);
      if (pit > 0.84) b += (pit - 0.84) * 1.1 * (1 - 0.6 * m);
      else if (pit < 0.12) b -= (0.12 - pit) * 0.5 * (1 - 0.6 * m);
      b = clamp(b * (0.9 + 0.1 * Math.sqrt(1 - r * r)));
      const edge = clamp((1 - r) * size * 0.5);
      const i = (py * size + px) * 4;
      di.data[i] = 234 + 16 * b;
      di.data[i + 1] = 236 + 14 * b;
      di.data[i + 2] = 240 + 12 * b;
      di.data[i + 3] = 255 * edge * clamp(0.2 + 0.74 * b);
      ei.data[i] = 34;
      ei.data[i + 1] = 44;
      ei.data[i + 2] = 70;
      ei.data[i + 3] = 255 * edge * (0.12 + 0.32 * b);
    }
  }
  dctx.putImageData(di, 0, 0);
  ectx.putImageData(ei, 0, 0);
  moonCache = { day: day.toDataURL("image/png"), earth: earth.toDataURL("image/png") };
  return moonCache;
}

type Bird = { id: number; y: number; d: number; delay: number; s: number };

// ───────────── the page eclipse: a view transition whose new page is revealed through a circle that grows out of the sun ─────────────

type ViewTransitionDoc = Document & { startViewTransition?: (update: () => void) => { ready: Promise<void>; finished: Promise<void> } };

/**
 * Run `apply` (which should change the page's theme straight away) inside an eclipse that starts at `origin`, the
 * sun's centre in viewport pixels, and only covers `from` pixels to begin with, so the switch itself stays live.
 * To dark, the old page dims steely as the shadow comes, the shadow's edge burns like the corona and stars come out
 * behind it, then fade. To light, sunlight floods out with a golden rim and slow rays.
 */
export function eclipsePageTransition(next: Theme, origin: { x: number; y: number }, from: number, apply: () => void) {
  const doc = document as ViewTransitionDoc;
  if (!doc.startViewTransition || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    apply();
    return;
  }
  const { x, y } = origin;
  const far = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y)) + 40;
  const dark = next === "dark";
  const dur = dark ? 1700 : 1350;
  const ease = dark ? "cubic-bezier(.45,0,.2,1)" : "cubic-bezier(.3,0,.15,1)";

  // our own keyframes replace the default cross-fade, for this transition only
  const css = document.createElement("style");
  css.textContent = "::view-transition-old(root),::view-transition-new(root){animation:none;mix-blend-mode:normal}";
  document.head.appendChild(css);

  // the edge of the shadow (or the light), stars and rays: part of the new page, so they are revealed with it
  const layer = document.createElement("div");
  layer.setAttribute("aria-hidden", "true");
  layer.style.cssText = "position:fixed;inset:0;pointer-events:none;z-index:2147483647;overflow:hidden";
  const rim = document.createElement("div");
  rim.style.cssText = `position:absolute;left:${x}px;top:${y}px;border-radius:50%;transform:translate(-50%,-50%);` +
    (dark
      ? "box-shadow:inset 0 0 0 1.5px rgba(255,246,226,.95),inset 0 0 10px 3px rgba(255,214,160,.8),inset 0 0 36px 8px rgba(255,140,90,.35),inset 0 0 70px 14px rgba(130,90,255,.14)"
      : "box-shadow:inset 0 0 0 2px rgba(255,250,225,1),inset 0 0 14px 4px rgba(255,214,120,.85),inset 0 0 60px 16px rgba(255,186,90,.35)");
  layer.appendChild(rim);
  // no flare of our own: the switch draws the diamond ring at the sun's edge, at the right moment. A glow here would
  // sit on top of the moon that is still in front of the sun.
  const stars: HTMLDivElement[] = [];
  if (dark) {
    for (let i = 0; i < 70; i++) {
      const st = document.createElement("div");
      const size = 1 + Math.random() * 2.2;
      st.style.cssText = `position:absolute;left:${Math.random() * 100}%;top:${Math.random() * 100}%;width:${size}px;height:${size}px;border-radius:50%;background:#fff;box-shadow:0 0 ${size * 3}px rgba(255,255,255,.8);opacity:0`;
      layer.appendChild(st);
      stars.push(st);
    }
  } else {
    const rays = document.createElement("div");
    // the rays start outside the switch, so they never cross the moon that is still in front of the sun
    const inner = Math.round(from), mid = Math.round(Math.max(from + 60, far * 0.42));
    const rayMask = `radial-gradient(circle,transparent 0,transparent ${inner}px,#000 ${inner + 40}px,rgba(0,0,0,.6) ${mid}px,transparent ${Math.round(far)}px)`;
    rays.style.cssText = `position:absolute;left:${x - far}px;top:${y - far}px;width:${far * 2}px;height:${far * 2}px;opacity:0;` +
      "background:repeating-conic-gradient(rgba(255,206,120,.22) 0deg 3deg,transparent 3deg 13deg);" +
      `-webkit-mask:${rayMask};mask:${rayMask}`;
    layer.appendChild(rays);
    stars.push(rays);
  }

  const t = doc.startViewTransition(() => {
    apply();
    document.body.appendChild(layer);
  });
  void t.ready
    .then(() => {
      const root = document.documentElement;
      root.animate({ clipPath: [`circle(${from}px at ${x}px ${y}px)`, `circle(${far}px at ${x}px ${y}px)`] }, { duration: dur, easing: ease, fill: "forwards", pseudoElement: "::view-transition-new(root)" });
      root.animate(
        dark ? { filter: ["brightness(1) saturate(1)", "brightness(.62) saturate(.55) hue-rotate(-8deg)"] } : { filter: ["brightness(1)", "brightness(1.35)"] },
        { duration: dur, easing: "ease-in", fill: "forwards", pseudoElement: "::view-transition-old(root)" },
      );
      rim.animate({ width: [`${from * 2}px`, `${far * 2}px`], height: [`${from * 2}px`, `${far * 2}px`], opacity: [1, 1, 0] }, { duration: dur, easing: ease, fill: "forwards" });
      if (dark) {
        stars.forEach((st) => {
          st.animate({ opacity: [0, 0.9, 0.3, 0.8, 0] }, { duration: dur + 1400, delay: Math.random() * 300, easing: "ease-in-out", fill: "forwards" });
        });
      } else {
        stars[0]?.animate({ opacity: [0, 1, 0], transform: ["rotate(0deg)", "rotate(14deg)"] }, { duration: dur + 600, easing: "ease-out", fill: "forwards" });
      }
    })
    .catch(() => {});
  void t.finished
    .catch(() => {})
    .finally(() => {
      css.remove();
      // the stars fade on a little after the page has changed, then the layer goes
      window.setTimeout(() => layer.remove(), dark ? 1600 : 700);
    });
}

/**
 * A light and dark switch as a total eclipse.
 *
 * The switch is a strip of sky with the sun at one end; the knob is the moon, pale in the daylight. Switch to dark and
 * the moon slides across and over the sun: the light goes steely and dim as it takes a bite, the last bead of sun
 * flares into a diamond ring, and at totality the sky drops to night, the corona and two pink prominences open round
 * the black disc, Venus and the stars come out and the whole horizon glows like a sunset. Switch back and the sun
 * bursts out of the far edge, the day returns and a few birds, fooled into thinking it was dusk, fly off singing.
 * You can tap it, use Space, Enter or the arrow keys, or drag the moon and scrub the eclipse by hand. The scene is a
 * switch (role switch); applying the theme is your job:
 *   <EclipseToggle pageTransition onThemeChange={(t) => (document.documentElement.dataset.theme = t)} />
 */
export default function EclipseToggle({ theme, defaultTheme = "light", onThemeChange, pageTransition = false, enableSound = true, volume = 0.8, autoplay = false, className = "" }: EclipseToggleProps) {
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
  const soundRef = useRef(enableSound && siteSound);
  useEffect(() => {
    soundRef.current = enableSound && siteSound;
  }, [enableSound, siteSound]);
  const volRef = useRef(volume);
  useEffect(() => {
    volRef.current = clamp(volume);
  });
  const [inner, setInner] = useState<Theme>(defaultTheme);
  const mode = theme ?? inner;
  const modeRef = useRef(mode);
  useEffect(() => {
    modeRef.current = mode;
  });
  const rootRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const inView = useInView(rootRef, { margin: "100px" });

  const cx = useMotionValue(defaultTheme === "dark" ? SUN : LEFT); // the moon
  const night = useMotionValue(defaultTheme === "dark" ? 1 : 0); // how dark the sky is, for the card around it
  const anim = useRef<AnimationPlaybackControls | null>(null);
  const [birds, setBirds] = useState<Bird[]>([]);
  const [face, setFace] = useState<{ day: string; earth: string } | null>(null);
  useEffect(() => setFace(moonFaces()), []);

  const cardBg = useTransform(night, [0, 0.5, 1], ["#ffffff", "#6b6d72", "#0e1119"]); // an even grey in the middle, not a pale one
  // the text flips from dark to light where the two read equally well, so it never sits grey on a grey card
  const cardInk = useTransform(night, (v) => (v < 0.44 ? "#1d1d1f" : "#f5f5f7"));
  const cardSub = useTransform(night, (v) => (v < 0.2 ? "#6e6e73" : v < 0.44 ? "#2c2c30" : v < 0.8 ? "#e4e4e8" : "#a1a1a6"));

  // what the frame loop writes to
  const r = {
    night: useRef<SVGGElement>(null),
    glow: useRef<SVGGElement>(null),
    stars: [useRef<SVGGElement>(null), useRef<SVGGElement>(null), useRef<SVGGElement>(null)],
    venus: useRef<SVGGElement>(null),
    glare: useRef<SVGGElement>(null),
    corona: useRef<SVGGElement>(null),
    coronaSpin: useRef<SVGGElement>(null),
    pale: useRef<SVGGElement>(null),
    phase: useRef<SVGPathElement>(null),
    bite: useRef<SVGCircleElement>(null),
    disc: useRef<SVGGElement>(null),
    beads: useRef<SVGGElement>(null),
    diamond: useRef<SVGGElement>(null),
    ridgeNight: useRef<SVGGElement>(null),
  };

  // ── the sky, worked out from where the moon is ──
  useEffect(() => {
    if (!inView) return;
    let raf = 0;
    const t0 = performance.now();
    const set = (el: Element | null, k: string, v: number | string) => el?.setAttribute(k, typeof v === "number" ? v.toFixed(3) : v);
    const frame = (now: number) => {
      const t = (now - t0) / 1000;
      const x = cx.get();
      const d = Math.abs(SUN - x); // distance between the centres
      const cov = coverage(d);
      // the light hardly changes until the sun is nearly gone, then falls away at the last moment
      const k = 0.5 * step(0.45, 0.995, cov) + 0.5 * step(7, 0.8, d);
      night.set(k);
      const corona = step(6, 0.8, d);
      const diamond = d < 1 ? 0 : d < 2.5 ? (d - 1) / 1.5 : clamp(1 - (d - 2.5) / 3.5);
      const beads = step(1.3, 2.3, d) * step(6.5, 3.6, d);
      set(r.night.current, "opacity", k);
      set(r.glow.current, "opacity", step(0.3, 0.95, k));
      set(r.ridgeNight.current, "opacity", k);
      const twinkle = reduce ? [1, 1, 1] : [0, 1, 2].map((g) => 0.72 + 0.28 * Math.sin(t * (1.3 + g * 0.7) + g * 2.1));
      r.stars.forEach((s, g) => set(s.current, "opacity", step(0.72, 0.98, k) * twinkle[g]!));
      set(r.venus.current, "opacity", step(0.35, 0.75, k));
      set(r.glare.current, "opacity", Math.pow(1 - cov, 0.6) * (1 - corona));
      set(r.corona.current, "opacity", corona);
      if (!reduce) set(r.coronaSpin.current, "transform", `rotate(${(t * 0.8).toFixed(2)}) scale(${(1 + 0.018 * Math.sin(t * 0.9)).toFixed(4)})`);
      set(r.pale.current, "transform", `translate(${x.toFixed(2)} ${CY})`);
      // by day the moon is lit on its sunward side: full at rest, a thinning crescent as it nears the sun, then gone
      // before it reaches the sun's edge, so all that shows in front of the sun is the black bite
      r.phase.current?.setAttribute("d", phasePath(step(72, 150, d)));
      set(r.pale.current, "opacity", 0.86 * step(70, 98, d));
      set(r.bite.current, "cx", x);
      set(r.disc.current, "transform", `translate(${x.toFixed(2)} ${CY})`);
      set(r.disc.current, "opacity", corona);
      set(r.beads.current, "opacity", beads);
      set(r.diamond.current, "opacity", diamond);
      set(r.diamond.current, "transform", `translate(${(SUN + RS - 0.6).toFixed(2)} ${CY}) scale(${(0.6 + 0.55 * diamond).toFixed(3)})`);
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, reduce]);

  // ── sound ──
  const padStop = useRef<(() => void) | null>(null);
  /** a low swell as the light drains away: three soft voices through a filter that slowly opens */
  const startPad = () => {
    padStop.current?.();
    const e = engine();
    if (!e || !soundRef.current || !(touched.current || autoplayOk.current) || volRef.current <= 0 || e.ctx.state !== "running") return;
    const { ctx } = e;
    const t = ctx.currentTime + 0.02;
    const out = ctx.createGain();
    out.gain.setValueAtTime(0.0001, t);
    out.gain.exponentialRampToValueAtTime(0.055 * volRef.current, t + 1.1);
    out.gain.setTargetAtTime(0.0001, t + 2.6, 0.55);
    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.setValueAtTime(260, t);
    lp.frequency.exponentialRampToValueAtTime(1500, t + 1.6);
    lp.connect(out).connect(ctx.destination);
    const oscs = ([[110, "sine", 0], [164.8, "triangle", 4], [220, "sine", -5], [329.6, "sine", 3]] as const).map(([f, type, cents], i) => {
      const o = ctx.createOscillator();
      o.type = type;
      o.frequency.value = f;
      o.detune.value = cents;
      const g = ctx.createGain();
      g.gain.value = [1, 0.5, 0.45, 0.18][i]!;
      o.connect(g).connect(lp);
      o.start(t);
      o.stop(t + 6);
      return o;
    });
    padStop.current = () => {
      const n = ctx.currentTime;
      const g = out.gain as AudioParam & { cancelAndHoldAtTime?: (t: number) => void };
      if (g.cancelAndHoldAtTime) g.cancelAndHoldAtTime(n);
      else {
        g.cancelScheduledValues(n);
        g.setValueAtTime(g.value, n);
      }
      g.setTargetAtTime(0.0001, n, 0.18);
      oscs.forEach((o) => {
        try {
          o.stop(n + 1.2);
        } catch {
          /* already stopped */
        }
      });
      padStop.current = null;
    };
  };

  const lastSound = useRef<Record<string, number>>({});
  const once = (key: string, gap = 500) => {
    const n = performance.now();
    if (n - (lastSound.current[key] ?? 0) < gap) return false;
    lastSound.current[key] = n;
    return true;
  };
  const chirps = (at: number) => {
    // two birds, answering each other
    const songs = [
      [[2900, 4100, 0], [3100, 4300, 0.11], [4500, 3300, 0.3], [4500, 3200, 0.4]],
      [[3600, 2600, 0.62], [3700, 2700, 0.71], [3300, 4700, 0.86]],
    ];
    songs.flat().forEach(([f, g, a]) => sfx.note(f!, { at: at + a!, glide: g, dur: 0.075, gain: 0.016, bell: 0 }));
  };

  const flyBirds = () => {
    if (reduce) return;
    const id = Date.now();
    setBirds((b) => [
      ...b,
      { id, y: 30, d: 2.9, delay: 0, s: 1 },
      { id: id + 1, y: 38, d: 3.2, delay: 0.18, s: 0.85 },
      { id: id + 2, y: 25, d: 3.4, delay: 0.32, s: 0.75 },
    ]);
  };

  // the eclipse's moments, wherever they happen: under a tap, a key or a finger dragging the moon
  useEffect(() => {
    let prev = Math.abs(SUN - cx.get());
    return cx.on("change", (x) => {
      const d = Math.abs(SUN - x);
      if (prev >= 3 && d < 3 && once("in")) {
        // the diamond ring, going in
        sfx.note(2637, { dur: 0.9, gain: 0.045, bell: 0.5 });
        sfx.note(3951, { at: 0.03, dur: 0.5, gain: 0.015, bell: 0 });
      }
      if (prev >= 1 && d < 1 && once("total", 900)) {
        // totality: an open, glassy chord
        [659.3, 987.8, 1480, 1975.5].forEach((f, i) => sfx.note(f, { at: 0.04 + i * 0.1, dur: 1.8, gain: 0.026 - i * 0.004, bell: 0.35 }));
      }
      if (prev < 1.4 && d >= 1.4 && once("out", 900)) {
        // the sun bursts out of the edge: a bright ting, a rising arpeggio, and later the birds
        padStop.current?.();
        sfx.note(3136, { dur: 0.7, gain: 0.05, bell: 0.6 });
        sfx.whoosh(900, 4200, { at: 0.02, dur: 0.5, gain: 0.03 });
        [1046.5, 1318.5, 1568, 2093].forEach((f, i) => sfx.note(f, { at: 0.12 + i * 0.075, dur: 0.9, gain: 0.024, bell: 0.3 }));
        window.setTimeout(() => {
          if (modeRef.current !== "light" || Math.abs(SUN - cx.get()) < 20) return;
          flyBirds();
          chirps(0.25);
        }, 650);
      }
      prev = d;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── moving the moon ──
  const travel = (to: Theme) => {
    anim.current?.stop();
    const end = to === "dark" ? SUN : LEFT;
    const dist = Math.abs(end - cx.get()) / (SUN - LEFT);
    if (reduce || dist === 0) {
      cx.set(end);
      return;
    }
    // into the sun it creeps the last few pixels, so the diamond ring has its moment; out of it, it starts slowly
    anim.current =
      to === "dark"
        ? animate(cx, end, { duration: 0.5 + 1.5 * dist, ease: [0.22, 0.7, 0.12, 1] })
        : animate(cx, end, { duration: 0.5 + 1.3 * dist, ease: [0.7, 0, 0.25, 1] });
  };

  const setMode = (next: Theme, fromUser = true) => {
    if (fromUser) touched.current = true;
    const changed = next !== modeRef.current;
    modeRef.current = next;
    if (theme === undefined) setInner(next);
    if (changed && onThemeChange) {
      const fire = () => onThemeChange(next, { fromUser });
      const box = btnRef.current?.getBoundingClientRect();
      if (pageTransition && fromUser && box) {
        // the eclipse starts at the sun and already covers the switch, so the switch keeps playing while the page changes
        const sx = box.left + (SUN / W) * box.width, sy = box.top + (CY / H) * box.height;
        eclipsePageTransition(next, { x: sx, y: sy }, Math.hypot(Math.max(sx - box.left, box.right - sx), box.height) + 24, fire);
      } else fire();
    }
    if (next === "dark" && changed) {
      startPad();
      if (reduce) sfx.note(659.3, { dur: 0.8, gain: 0.03 });
    }
    if (next === "light" && changed) {
      padStop.current?.();
      if (reduce) sfx.note(1318.5, { dur: 0.6, gain: 0.03 });
    }
    travel(next);
  };

  // a controlled theme moves the moon too
  useEffect(() => {
    if (theme && Math.abs(cx.get() - (theme === "dark" ? SUN : LEFT)) > 0.5) travel(theme);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [theme]);

  useEffect(() => () => padStop.current?.(), []);

  // ── drag the moon to scrub the eclipse; let go past half way and it goes the rest ──
  const drag = useRef<{ id: number; x0: number; c0: number; moved: boolean } | null>(null);
  const suppressClick = useRef(false);
  const onDown = (e: RPointerEvent<HTMLButtonElement>) => {
    if (e.button !== 0) return;
    touched.current = true;
    drag.current = { id: e.pointerId, x0: e.clientX, c0: cx.get(), moved: false };
  };
  const onMove = (e: RPointerEvent<HTMLButtonElement>) => {
    const g = drag.current;
    if (!g || g.id !== e.pointerId) return;
    const box = btnRef.current!.getBoundingClientRect();
    const dx = ((e.clientX - g.x0) / box.width) * W;
    if (!g.moved && Math.abs(dx) < 4) return;
    if (!g.moved) {
      g.moved = true;
      anim.current?.stop();
      g.c0 = cx.get() - dx;
      btnRef.current!.setPointerCapture(e.pointerId);
    }
    cx.set(clamp(g.c0 + dx, LEFT, SUN));
  };
  const onUp = (e: RPointerEvent<HTMLButtonElement>) => {
    const g = drag.current;
    drag.current = null;
    if (!g || g.id !== e.pointerId || !g.moved) return;
    suppressClick.current = true;
    setMode(cx.get() > (LEFT + SUN) / 2 ? "dark" : "light");
  };
  const onClick = () => {
    if (suppressClick.current) {
      suppressClick.current = false;
      return;
    }
    setMode(modeRef.current === "dark" ? "light" : "dark");
  };
  const onKey = (e: RKeyboardEvent) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      setMode("dark");
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      setMode("light");
    }
  };

  // autoplay: an eclipse every few seconds, until someone touches it
  useEffect(() => {
    if (!autoplay || reduce || !inView) return;
    let alive = true;
    const ok = () => alive && !touched.current;
    const wait = (ms: number) => new Promise((res) => window.setTimeout(res, ms));
    (async () => {
      await wait(1500);
      while (ok()) {
        setMode(modeRef.current === "dark" ? "light" : "dark", false);
        await wait(modeRef.current === "dark" ? 4200 : 3600);
      }
    })();
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoplay, inView]);

  const isDark = mode === "dark";
  const id = (n: string) => `${n}-${uid}`;
  const url = (n: string) => `url(#${n}-${uid})`;
  const pill = `M${H / 2},0 H${W - H / 2} A${H / 2},${H / 2} 0 0 1 ${W - H / 2},${H} H${H / 2} A${H / 2},${H / 2} 0 0 1 ${H / 2},0 Z`;
  const startDark = defaultTheme === "dark";
  const ridges = useMemo(
    () => ({
      far: "M0,95 C18,91 36,89 58,92 C82,95 100,88 126,89 C150,90 168,94 190,92 C214,90 236,93 260,91 L260,104 L0,104 Z",
      near: "M0,100 C28,96 52,99 80,98 C110,97 130,101 160,99.5 C190,98 222,96.5 260,98.5 L260,104 L0,104 Z",
    }),
    [],
  );

  return (
    <motion.div
      ref={rootRef}
      onPointerDownCapture={() => {
  touched.current = true;
}}
      onKeyDownCapture={() => {
  touched.current = true;
}}
      className={`w-[340px] max-w-full rounded-[24px] p-5 shadow-[0_0_0_1px_rgba(0,0,0,.06),0_20px_40px_-26px_rgba(0,0,0,.45)] ${className}`}
      style={{ background: cardBg, color: cardInk }}
    >
      <button
        ref={btnRef}
        type="button"
        role="switch"
        aria-checked={isDark}
        aria-label="Dark mode"
        onClick={onClick}
        onKeyDown={onKey}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={() => (drag.current = null)}
        className="relative block w-full cursor-pointer touch-pan-y select-none rounded-full p-0 outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] focus-visible:ring-offset-2"
        style={{ aspectRatio: `${W} / ${H}`, WebkitTapHighlightColor: "transparent" }}
      >
        <svg viewBox={`0 0 ${W} ${H}`} className="absolute inset-0 block h-full w-full overflow-visible" aria-hidden="true">
          <defs>
            <clipPath id={id("pill")}>
              <path d={pill} />
            </clipPath>
            <clipPath id={id("sun")}>
              <circle cx={SUN} cy={CY} r={RS} />
            </clipPath>
            <linearGradient id={id("day")} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#2f7fdc" />
              <stop offset="0.55" stopColor="#74b4ef" />
              <stop offset="1" stopColor="#cfe6f8" />
            </linearGradient>
            <linearGradient id={id("night")} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#050915" />
              <stop offset="0.5" stopColor="#101a36" />
              <stop offset="0.8" stopColor="#2b2a4a" />
              <stop offset="1" stopColor="#4a3550" />
            </linearGradient>
            {/* at totality the whole horizon glows, a sunset all the way round */}
            <linearGradient id={id("rim")} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#ff9a5c" stopOpacity="0" />
              <stop offset="0.6" stopColor="#ff8f5a" stopOpacity=".38" />
              <stop offset="0.85" stopColor="#ffb36b" stopOpacity=".8" />
              <stop offset="1" stopColor="#ffd08a" stopOpacity=".9" />
            </linearGradient>
            <radialGradient id={id("glare")} cx="0.5" cy="0.5" r="0.5">
              <stop offset="0" stopColor="#ffffff" stopOpacity=".95" />
              <stop offset="0.3" stopColor="#fffbe8" stopOpacity=".6" />
              <stop offset="0.6" stopColor="#fff4d6" stopOpacity=".18" />
              <stop offset="1" stopColor="#fff4d6" stopOpacity="0" />
            </radialGradient>
            <radialGradient id={id("disc")} cx="0.5" cy="0.5" r="0.5">
              <stop offset="0" stopColor="#ffffff" />
              <stop offset="0.78" stopColor="#fffdf4" />
              <stop offset="0.95" stopColor="#fff4d4" />
              <stop offset="1" stopColor="#ffe9b4" />
            </radialGradient>
            <radialGradient id={id("inner")} gradientUnits="userSpaceOnUse" cx="0" cy="0" r="80">
              <stop offset="0.425" stopColor="#ffffff" stopOpacity="1" />
              <stop offset="0.47" stopColor="#f6f8ff" stopOpacity=".72" />
              <stop offset="0.56" stopColor="#e6ecff" stopOpacity=".32" />
              <stop offset="0.72" stopColor="#cfd9ff" stopOpacity=".1" />
              <stop offset="1" stopColor="#c9d4ff" stopOpacity="0" />
            </radialGradient>
            <radialGradient id={id("spark")} cx="0.5" cy="0.5" r="0.5">
              <stop offset="0" stopColor="#ffffff" />
              <stop offset="0.25" stopColor="#ffffff" stopOpacity=".7" />
              <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
            </radialGradient>
            <radialGradient id={id("pale")} cx="0.42" cy="0.4" r="0.62">
              <stop offset="0" stopColor="#ffffff" stopOpacity=".9" />
              <stop offset="0.75" stopColor="#f3f7fd" stopOpacity=".78" />
              <stop offset="1" stopColor="#e6eef9" stopOpacity=".6" />
            </radialGradient>
            <mask id={id("phase")} maskUnits="userSpaceOnUse" x={-RM - 2} y={-RM - 2} width={RM * 2 + 4} height={RM * 2 + 4}>
              <path ref={r.phase} d={phasePath(startDark ? 0 : 1)} fill="#ffffff" filter={url("b04")} />
            </mask>
            <filter id={id("b25")} x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="2.5" />
            </filter>
            <filter id={id("b04")} x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="0.4" />
            </filter>
          </defs>

          <g clipPath={url("pill")}>
            {/* day, and the night that comes in at totality */}
            <rect width={W} height={H} fill={url("day")} />
            <g ref={r.night} opacity={startDark ? 1 : 0}>
              <rect width={W} height={H} fill={url("night")} />
            </g>
            <g ref={r.glow} opacity={startDark ? 1 : 0}>
              <rect y={44} width={W} height={60} fill={url("rim")} />
            </g>

            {/* stars, in three sets that twinkle out of step, and Venus, first to show */}
            {[0, 1, 2].map((g) => (
              <g key={g} ref={r.stars[g]} opacity={startDark ? 1 : 0} fill="#ffffff">
                {STARS.filter((s) => s.g === g).map((s, i) => (
                  <circle key={i} cx={s.x} cy={s.y} r={s.r} />
                ))}
              </g>
            ))}
            <g ref={r.venus} opacity={startDark ? 1 : 0}>
              <circle cx={118} cy={28} r={4} fill={url("spark")} opacity={0.55} />
              <circle cx={118} cy={28} r={1.25} fill="#fffdf5" />
            </g>

            {/* the sun's glare in a daytime sky */}
            <g ref={r.glare} opacity={startDark ? 0 : 1}>
              <circle cx={SUN} cy={CY} r={96} fill={url("glare")} />
            </g>

            {/* the corona, the prominences and the black moon: only at totality */}
            <g ref={r.corona} opacity={startDark ? 1 : 0}>
              <g transform={`translate(${SUN} ${CY})`}>
                <g ref={r.coronaSpin}>
                  <circle r={80} fill={url("inner")} />
                  <g fill="#ffffff" opacity={0.5} filter={url("b25")}>
                    {STREAMERS.map(([a, l, w], i) => (
                      <path key={i} transform={`rotate(${a})`} d={`M${RS - 1},${-w / 2} Q${RS + l * 0.45},${-w * 0.2} ${RS + l},0 Q${RS + l * 0.45},${w * 0.2} ${RS - 1},${w / 2} Z`} />
                    ))}
                  </g>
                  <g stroke="#ffffff" strokeWidth={0.45} opacity={0.22} filter={url("b04")}>
                    {RAYS.map((ray, i) => {
                      const c = Math.cos((ray.a * Math.PI) / 180), s = Math.sin((ray.a * Math.PI) / 180);
                      return <line key={i} x1={r2(c * (RS + 1))} y1={r2(s * (RS + 1))} x2={r2(c * (RS + ray.l))} y2={r2(s * (RS + ray.l))} />;
                    })}
                  </g>
                </g>
                {/* prominences: tongues of pink hydrogen at the limb, seen only while the sun is hidden */}
                <g fill="#ff5a86" filter={url("b04")}>
                  <path transform={`rotate(196) translate(${RM - 0.4} 0) rotate(90)`} d="M-2.4,0 C-2.2,-2.6 -0.8,-4.2 0.6,-3.8 C2,-3.2 1.6,-1.4 2.4,0 Z" />
                  <path transform={`rotate(-38) translate(${RM - 0.4} 0) rotate(90)`} d="M-1.6,0 C-1.5,-1.8 -0.4,-2.8 0.6,-2.4 C1.4,-1.9 1.1,-0.8 1.6,0 Z" />
                  <path transform={`rotate(58) translate(${RM - 0.4} 0) rotate(90)`} d="M-1.2,0 C-1.2,-1.4 -0.2,-2 0.5,-1.7 C1,-1.3 0.9,-0.5 1.2,0 Z" opacity={0.85} />
                </g>
              </g>
            </g>

            {/* the sun */}
            <circle cx={SUN} cy={CY} r={RS} fill={url("disc")} />

            {/* the moon by day: its real face, the seas letting the blue through, lit from the sun's side and waning to a
                crescent as it nears the sun */}
            <g ref={r.pale} transform={`translate(${startDark ? SUN : LEFT} ${CY})`} opacity={startDark ? 0 : 0.86}>
              <g mask={url("phase")}>
                {face ? <image href={face.day} x={-RM} y={-RM} width={RM * 2} height={RM * 2} preserveAspectRatio="none" /> : <circle r={RM} fill={url("pale")} />}
              </g>
            </g>
            {/* where it is in front of the sun, it is a black bite */}
            <g clipPath={url("sun")}>
              <circle ref={r.bite} cx={startDark ? SUN : LEFT} cy={CY} r={RM} fill="#0a0f1d" />
            </g>
            <g ref={r.disc} transform={`translate(${startDark ? SUN : LEFT} ${CY})`} opacity={startDark ? 1 : 0}>
              <circle r={RM} fill="#070a14" />
              {/* earthshine, just: the same face, faintly lit by the Earth */}
              {face && <image href={face.earth} x={-RM} y={-RM} width={RM * 2} height={RM * 2} preserveAspectRatio="none" opacity={0.4} />}
            </g>

            {/* Baily's beads, then the diamond ring, on the edge where the sun goes and comes back */}
            <g ref={r.beads} opacity={0} fill="#ffffff">
              {[-27, -13, 11, 24].map((a, i) => (
                <circle key={a} cx={r2(SUN + (RS - 0.4) * Math.cos((a * Math.PI) / 180))} cy={r2(CY + (RS - 0.4) * Math.sin((a * Math.PI) / 180))} r={[1, 0.8, 1.1, 0.7][i]} />
              ))}
            </g>
            <g ref={r.diamond} opacity={0} transform={`translate(${SUN + RS} ${CY})`}>
              <circle r={22} fill={url("spark")} opacity={0.5} />
              <circle r={9} fill={url("spark")} />
              <g stroke="#ffffff" strokeLinecap="round">
                <line x1={-26} y1={0} x2={26} y2={0} strokeWidth={0.9} opacity={0.85} />
                <line x1={0} y1={-18} x2={0} y2={18} strokeWidth={0.7} opacity={0.75} />
                <line x1={-9} y1={-9} x2={9} y2={9} strokeWidth={0.45} opacity={0.5} />
                <line x1={-9} y1={9} x2={9} y2={-9} strokeWidth={0.45} opacity={0.5} />
              </g>
              <circle r={2.6} fill="#ffffff" />
            </g>

            {/* the land: hazy green hills by day, black against the glowing horizon at totality */}
            <path d={ridges.far} fill="#8dbba6" />
            <path d={ridges.near} fill="#5d957a" />
            <g ref={r.ridgeNight} opacity={startDark ? 1 : 0}>
              <path d={ridges.far} fill="#141a2a" />
              <path d={ridges.near} fill="#070a12" />
            </g>

            {/* birds, back up when the light returns */}
            <AnimatePresence>
              {birds.map((b) => (
                <motion.g
                  key={b.id}
                  initial={{ x: -14, y: b.y }}
                  animate={{ x: W + 14, y: [b.y, b.y - 6, b.y - 2, b.y - 10] }}
                  transition={{ duration: b.d, delay: b.delay, ease: "linear" }}
                  onAnimationComplete={() => setBirds((q) => q.filter((z) => z.id !== b.id))}
                >
                  <g transform={`scale(${b.s})`}>
                    <motion.path
                      fill="none"
                      stroke="#253141"
                      strokeWidth={1.1}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      initial={{ d: "M-4.5,-1 Q-2.2,-3.6 0,0 Q2.2,-3.6 4.5,-1" }}
                      animate={{ d: ["M-4.5,-1 Q-2.2,-3.6 0,0 Q2.2,-3.6 4.5,-1", "M-4.5,2.2 Q-2.2,1.6 0,0 Q2.2,1.6 4.5,2.2", "M-4.5,-1 Q-2.2,-3.6 0,0 Q2.2,-3.6 4.5,-1"] }}
                      transition={{ duration: 0.26 + b.s * 0.06, repeat: Infinity, ease: "easeInOut", delay: b.delay }}
                    />
                  </g>
                </motion.g>
              ))}
            </AnimatePresence>
          </g>

          {/* the switch's well: a hairline edge and a little depth at the top */}
          <path d={pill} fill="none" stroke="#000000" strokeOpacity={0.14} strokeWidth={1} />
          <g clipPath={url("pill")} pointerEvents="none">
            <path d={pill} fill="none" stroke="#000000" strokeOpacity={0.16} strokeWidth={6} filter={url("b25")} transform="translate(0 2)" />
          </g>
        </svg>
      </button>
      <div className="mt-4 flex flex-wrap items-baseline justify-between gap-x-3" aria-live="polite">
        <div className="relative h-[28px] min-w-[130px] flex-1 overflow-hidden">
          <AnimatePresence initial={false} mode="popLayout">
            <motion.span
              key={mode}
              className="absolute left-0 top-0 whitespace-nowrap text-[22px] font-semibold leading-[28px] tracking-[-0.02em]"
              initial={reduce ? { opacity: 0 } : { y: 24, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={reduce ? { opacity: 0 } : { y: -24, opacity: 0 }}
              transition={{ type: "spring", stiffness: 420, damping: 32 }}
            >
              {isDark ? "Dark mode" : "Light mode"}
            </motion.span>
          </AnimatePresence>
        </div>
        <motion.span className="text-[13px]" style={{ color: cardSub }}>
          {isDark ? "Drag the moon back" : "Drag the moon across"}
        </motion.span>
      </div>
    </motion.div>
  );
}
