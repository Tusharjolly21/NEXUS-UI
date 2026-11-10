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
   * Change the page with the switch when the visitor flips it: going dark, dusk spreads out from the switch across the
   * page with a glowing edge and the stars come out; going light, sunlight floods out with a golden rim. Whatever your
   * onThemeChange does to the page is what gets revealed. Uses the View Transitions API; without it, or with reduced
   * motion, the theme just changes.
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

// ───────────── the sky, 260 by 104: a pill of sky over low hills; the knob is the sun by day and the moon by night ─────────────

const W = 260, H = 104, CY = 52;
const LEFT = 52; // the sun at rest, light mode
const RIGHT = 208; // the moon at rest, dark mode
const DIP = 25; // how far the knob sinks towards the hills half way across: the sun sets, then the moon rises
const RS = 25; // the sun
const RM = 23; // the moon

const clamp = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v));
/** a smooth step from a to b; a may be larger than b, for a step down */
const step = (a: number, b: number, x: number) => {
  const t = clamp((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};
/** rises from a to a peak at b, falls away by c */
const bell = (x: number, a: number, b: number, c: number) => step(a, b, x) * (1 - step(b, c, x));

/** how far through the evening the knob is: 0 is midday, 1 is night */
const progress = (x: number) => clamp((x - LEFT) / (RIGHT - LEFT));
/** the knob's height: it sinks towards the horizon at sunset and climbs again as the moon */
const knobY = (t: number) => CY + DIP * Math.sin(Math.PI * t);

/** everything in the sky at a moment of the evening, from 0 (day) to 1 (night) */
function scene(t: number) {
  return {
    golden: bell(t, 0.12, 0.44, 0.7), // golden hour into sunset
    night: step(0.4, 0.88, t),
    afterglow: bell(t, 0.36, 0.6, 0.92), // the rosy band left on the horizon after the sun has gone
    stars: step(0.62, 0.96, t),
    venus: step(0.48, 0.72, t), // the evening star, first to show
    // the moon comes in underneath while the sun is still solid, then the red sun fades off it, so the knob never
    // turns see-through: it changes, from the setting sun into the moon
    sun: 1 - step(0.46, 0.62, t),
    sunset: bell(t, 0.16, 0.46, 0.62), // the disc going orange, then red, low over the hills
    moon: step(0.4, 0.48, t),
    glare: 1 - step(0.1, 0.42, t),
    warm: bell(t, 0.1, 0.44, 0.6),
    moonGlow: step(0.58, 0.92, t),
    size: 1 + 0.16 * bell(t, 0.08, 0.47, 0.58), // the sun looks larger near the horizon
    duskLand: step(0.22, 0.52, t),
    nightLand: step(0.52, 0.9, t),
  };
}

/** a fixed scatter: the same sky every time */
const rand = (i: number) => {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};
// rounded, so the server and the browser print the same numbers (their sin() can differ in the last digits)
const r2 = (n: number) => Math.round(n * 100) / 100;
const STARS = Array.from({ length: 26 }, (_, i) => ({ x: r2(12 + rand(i) * 236), y: r2(8 + rand(i + 50) * 62), r: r2(0.35 + rand(i + 99) * 0.6), g: i % 3 }));

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

// ───────────── the page change: a view transition whose new page is revealed through a circle that grows out of the switch ─────────────

type ViewTransitionDoc = Document & { startViewTransition?: (update: () => void) => { ready: Promise<void>; finished: Promise<void> } };

/**
 * Run `apply` (which should change the page's theme straight away) inside a change of light that comes out of the sun
 * or the moon: it starts at `origin`, the knob's centre in viewport pixels, as a circle of `from` pixels (the knob
 * itself), opens quickly to `cover` pixels (enough to take in the switch, so it never looks frozen), then spreads on
 * across the page from the same point. To dark, the old page dims as dusk spreads, its edge glowing like a sunset, and
 * stars come out behind it, then fade. To light, sunlight floods out with a golden rim and slow rays.
 */
export function eclipsePageTransition(next: Theme, origin: { x: number; y: number }, from: number, apply: () => void, cover: number = from) {
  const doc = document as ViewTransitionDoc;
  if (!doc.startViewTransition || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    apply();
    return;
  }
  const { x, y } = origin;
  const far = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y)) + 40;
  const dark = next === "dark";
  const dur = dark ? 1800 : 1450;
  const ease = dark ? "cubic-bezier(.45,0,.2,1)" : "cubic-bezier(.3,0,.15,1)";
  // the circle's radius over time: out of the knob, quickly across the switch, then slowly over the page
  const open = Math.min(Math.max(cover, from), far);
  const radii = [
    { r: from, offset: 0, easing: "cubic-bezier(.2,.6,.3,1)" },
    { r: open, offset: 0.2, easing: ease },
    { r: far, offset: 1, easing: "linear" },
  ];

  // our own keyframes replace the default cross-fade, for this transition only
  const css = document.createElement("style");
  css.textContent = "::view-transition-old(root),::view-transition-new(root){animation:none;mix-blend-mode:normal}";
  document.head.appendChild(css);

  // the edge of the dusk (or the light), stars and rays: part of the new page, so they are revealed with it
  const layer = document.createElement("div");
  layer.setAttribute("aria-hidden", "true");
  layer.style.cssText = "position:fixed;inset:0;pointer-events:none;z-index:2147483647;overflow:hidden";
  const rim = document.createElement("div");
  rim.style.cssText = `position:absolute;left:${x}px;top:${y}px;border-radius:50%;transform:translate(-50%,-50%);` +
    (dark
      ? "box-shadow:inset 0 0 0 1.5px rgba(255,222,186,.9),inset 0 0 12px 3px rgba(255,160,112,.7),inset 0 0 40px 8px rgba(233,112,138,.32),inset 0 0 70px 14px rgba(110,90,210,.16)"
      : "box-shadow:inset 0 0 0 2px rgba(255,250,225,1),inset 0 0 14px 4px rgba(255,214,120,.85),inset 0 0 60px 16px rgba(255,186,90,.35)");
  layer.appendChild(rim);
  const stars: HTMLDivElement[] = [];
  if (dark) {
    for (let i = 0; i < 70; i++) {
      const sx = Math.random() * window.innerWidth, sy = Math.random() * window.innerHeight;
      // none over the switch, which has its own sky
      if (Math.hypot(sx - x, sy - y) < open) continue;
      const st = document.createElement("div");
      const size = 1 + Math.random() * 2.2;
      st.style.cssText = `position:absolute;left:${sx}px;top:${sy}px;width:${size}px;height:${size}px;border-radius:50%;background:#fff;box-shadow:0 0 ${size * 3}px rgba(255,255,255,.8);opacity:0`;
      layer.appendChild(st);
      stars.push(st);
    }
  } else {
    const rays = document.createElement("div");
    // the rays start outside the switch and fan out from the sun
    const inner = Math.round(open), mid = Math.round(Math.max(open + 60, far * 0.42));
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
      root.animate(
        radii.map((k) => ({ clipPath: `circle(${k.r}px at ${x}px ${y}px)`, offset: k.offset, easing: k.easing })),
        { duration: dur, fill: "forwards", pseudoElement: "::view-transition-new(root)" },
      );
      root.animate(
        dark ? { filter: ["brightness(1) saturate(1)", "brightness(.62) saturate(.55) hue-rotate(-8deg)"] } : { filter: ["brightness(1)", "brightness(1.35)"] },
        { duration: dur, easing: "ease-in", fill: "forwards", pseudoElement: "::view-transition-old(root)" },
      );
      // the glowing edge rides the circle out and fades as it leaves the screen
      rim.animate(
        radii.map((k, i) => ({ width: `${k.r * 2}px`, height: `${k.r * 2}px`, opacity: i === radii.length - 1 ? 0 : 1, offset: k.offset, easing: k.easing })),
        { duration: dur, fill: "forwards" },
      );
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
 * A light and dark switch as an evening going by.
 *
 * The switch is a strip of sky over low hills, and the knob is the sun. Switch to dark and the sun sinks towards the
 * hills: the light turns golden, the sun grows larger and goes orange and then red as it nears the horizon, and it sets
 * behind the hills. A silver moon rises on the far side, a rosy afterglow lingers on the horizon, the evening star comes
 * out first and then the stars, and the hills turn to silhouettes in the moonlight. Switch back and it plays as a
 * sunrise, and a few birds fly off singing. You can tap it, use Space, Enter or the arrow keys, or drag the knob and
 * scrub the evening by hand. The scene is a switch (role switch); applying the theme is your job:
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

  const startDark = defaultTheme === "dark";
  const cx = useMotionValue(startDark ? RIGHT : LEFT); // the knob
  const night = useMotionValue(startDark ? 1 : 0); // how dark the sky is, for the card around it
  const anim = useRef<AnimationPlaybackControls | null>(null);
  const [birds, setBirds] = useState<Bird[]>([]);
  const [face, setFace] = useState<string | null>(null);
  useEffect(() => setFace(moonFaces()?.day ?? null), []);

  const cardBg = useTransform(night, [0, 0.5, 1], ["#ffffff", "#6b6d72", "#0e1119"]); // an even grey in the middle, not a pale one
  // the text flips from dark to light where the two read equally well, so it never sits grey on a grey card
  const cardInk = useTransform(night, (v) => (v < 0.44 ? "#1d1d1f" : "#f5f5f7"));
  // the switch sits in the card with a little depth: a soft shadow by day, a faint cool moonlit glow by night
  const switchShadow = useTransform(night, [0, 1], [
    "0px 1px 0px rgba(255,255,255,0.7), 0px 14px 26px -16px rgba(16,70,140,0.6)",
    "0px 1px 0px rgba(255,255,255,0.07), 0px 16px 40px -16px rgba(150,172,255,0.32)",
  ]);
  // the focus ring is for the keyboard; after a click or a tap it stays hidden
  const [pointerUsed, setPointerUsed] = useState(false);
  const cardSub = useTransform(night, (v) => (v < 0.2 ? "#6e6e73" : v < 0.44 ? "#2c2c30" : v < 0.8 ? "#e4e4e8" : "#a1a1a6"));

  // what the frame loop writes to
  const r = {
    golden: useRef<SVGGElement>(null),
    night: useRef<SVGGElement>(null),
    afterglow: useRef<SVGGElement>(null),
    stars: [useRef<SVGGElement>(null), useRef<SVGGElement>(null), useRef<SVGGElement>(null)],
    venus: useRef<SVGGElement>(null),
    lights: useRef<SVGGElement>(null),
    glare: useRef<SVGGElement>(null),
    warm: useRef<SVGGElement>(null),
    moonGlow: useRef<SVGGElement>(null),
    body: useRef<SVGGElement>(null),
    sun: useRef<SVGGElement>(null),
    sunset: useRef<SVGGElement>(null),
    moon: useRef<SVGGElement>(null),
    duskLand: useRef<SVGGElement>(null),
    nightLand: useRef<SVGGElement>(null),
  };

  // ── the sky, worked out from where the knob is ──
  useEffect(() => {
    if (!inView) return;
    let raf = 0;
    const t0 = performance.now();
    const set = (el: Element | null, k: string, v: number | string) => el?.setAttribute(k, typeof v === "number" ? v.toFixed(3) : v);
    const frame = (now: number) => {
      const time = (now - t0) / 1000;
      const x = cx.get();
      const t = progress(x);
      const y = knobY(t);
      const v = scene(t);
      night.set(v.night);
      set(r.golden.current, "opacity", v.golden);
      set(r.night.current, "opacity", v.night);
      set(r.afterglow.current, "opacity", v.afterglow);
      const twinkle = reduce ? [1, 1, 1] : [0, 1, 2].map((g) => 0.72 + 0.28 * Math.sin(time * (1.3 + g * 0.7) + g * 2.1));
      r.stars.forEach((s, g) => set(s.current, "opacity", v.stars * twinkle[g]!));
      set(r.venus.current, "opacity", v.venus);
      set(r.lights.current, "transform", `translate(${x.toFixed(2)} ${y.toFixed(2)})`);
      set(r.glare.current, "opacity", v.glare);
      set(r.warm.current, "opacity", v.warm);
      set(r.moonGlow.current, "opacity", v.moonGlow);
      set(r.body.current, "transform", `translate(${x.toFixed(2)} ${y.toFixed(2)}) scale(${v.size.toFixed(4)})`);
      set(r.sun.current, "opacity", v.sun);
      set(r.sunset.current, "opacity", v.sunset);
      set(r.moon.current, "opacity", v.moon);
      set(r.duskLand.current, "opacity", v.duskLand);
      set(r.nightLand.current, "opacity", v.nightLand);
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

  // the evening's moments, wherever they happen: under a tap, a key or a finger dragging the knob
  useEffect(() => {
    let prev = progress(cx.get());
    return cx.on("change", (x) => {
      const t = progress(x);
      if (prev < 0.52 && t >= 0.52 && once("set", 900)) {
        // the sun slips behind the hills: a soft falling breath and a low bell
        sfx.whoosh(1800, 480, { dur: 0.8, gain: 0.022 });
        sfx.note(784, { at: 0.05, dur: 1.2, gain: 0.028, bell: 0.4 });
      }
      if (prev < 0.97 && t >= 0.97 && once("night", 900)) {
        // night: an open, glassy chord as the stars come out
        [659.3, 987.8, 1480, 1975.5].forEach((f, i) => sfx.note(f, { at: 0.04 + i * 0.1, dur: 1.8, gain: 0.026 - i * 0.004, bell: 0.35 }));
      }
      if (prev > 0.5 && t <= 0.5 && once("rise", 900)) {
        // the sun clears the hills: a bright ting and a rising breath
        padStop.current?.();
        sfx.note(3136, { dur: 0.7, gain: 0.045, bell: 0.6 });
        sfx.whoosh(900, 4200, { at: 0.02, dur: 0.5, gain: 0.026 });
      }
      if (prev > 0.3 && t <= 0.3 && once("morning", 900)) {
        // morning: a rising arpeggio, then the birds
        [1046.5, 1318.5, 1568, 2093].forEach((f, i) => sfx.note(f, { at: i * 0.075, dur: 0.9, gain: 0.022, bell: 0.3 }));
        window.setTimeout(() => {
          if (modeRef.current !== "light" || progress(cx.get()) > 0.3) return;
          flyBirds();
          chirps(0.15);
        }, 350);
      }
      prev = t;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── moving the knob ──
  const travel = (to: Theme) => {
    anim.current?.stop();
    const end = to === "dark" ? RIGHT : LEFT;
    const dist = Math.abs(end - cx.get()) / (RIGHT - LEFT);
    if (reduce || dist === 0) {
      cx.set(end);
      return;
    }
    // unhurried, like the real thing: it eases out of the sky and settles gently
    anim.current = animate(cx, end, { duration: 0.7 + 1.3 * dist, ease: [0.45, 0.05, 0.25, 1] });
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
        // the change comes out of the sun (or the moon) where it is right now, at its own size, opens across this
        // card, then spreads over the page
        const k = box.width / W;
        const tNow = progress(cx.get());
        const sx = box.left + cx.get() * k, sy = box.top + knobY(tNow) * k;
        const body = (tNow < 0.5 ? RS : RM) * scene(tNow).size * k;
        const card = rootRef.current?.getBoundingClientRect() ?? box;
        const reach = Math.hypot(Math.max(sx - card.left, card.right - sx), Math.max(sy - card.top, card.bottom - sy)) + 8;
        eclipsePageTransition(next, { x: sx, y: sy }, body, fire, reach);
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

  // a controlled theme moves the knob too
  useEffect(() => {
    if (theme && Math.abs(cx.get() - (theme === "dark" ? RIGHT : LEFT)) > 0.5) travel(theme);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [theme]);

  useEffect(() => () => padStop.current?.(), []);

  // ── drag the knob to scrub the evening; let go past half way and it goes the rest ──
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
    cx.set(clamp(g.c0 + dx, LEFT, RIGHT));
  };
  const onUp = (e: RPointerEvent<HTMLButtonElement>) => {
    const g = drag.current;
    drag.current = null;
    if (!g || g.id !== e.pointerId || !g.moved) return;
    suppressClick.current = true;
    setMode(cx.get() > (LEFT + RIGHT) / 2 ? "dark" : "light");
  };
  const onClick = () => {
    if (suppressClick.current) {
      suppressClick.current = false;
      return;
    }
    setMode(modeRef.current === "dark" ? "light" : "dark");
  };
  const onKey = (e: RKeyboardEvent) => {
    setPointerUsed(false);
    if (e.key === "ArrowRight") {
      e.preventDefault();
      setMode("dark");
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      setMode("light");
    }
  };

  // autoplay: an evening every few seconds, until someone touches it
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
  const s0 = scene(startDark ? 1 : 0);
  const x0 = startDark ? RIGHT : LEFT;
  const ridges = useMemo(
    () => ({
      far: "M0,93 C18,89 36,87 58,90 C82,93 100,86 126,87 C150,88 168,92 190,90 C214,88 236,91 260,89 L260,104 L0,104 Z",
      near: "M0,99 C28,95 52,98 80,97 C110,96 130,100 160,98.5 C190,97 222,95.5 260,97.5 L260,104 L0,104 Z",
    }),
    [],
  );
  const top = (d: string) => d.split(" L260")[0];

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
      <motion.button
        ref={btnRef}
        type="button"
        role="switch"
        aria-checked={isDark}
        aria-label="Dark mode"
        onClick={onClick}
        onKeyDown={onKey}
        onPointerDown={(e) => {
          setPointerUsed(true);
          onDown(e);
        }}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={() => (drag.current = null)}
        className={`relative block w-full cursor-pointer touch-pan-y select-none rounded-full p-0 outline-none ${
          pointerUsed ? "" : "focus-visible:ring-2 focus-visible:ring-[#0071e3] focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
        }`}
        style={{ aspectRatio: `${W} / ${H}`, WebkitTapHighlightColor: "transparent", boxShadow: switchShadow }}
      >
        <svg viewBox={`0 0 ${W} ${H}`} className="absolute inset-0 block h-full w-full overflow-visible" aria-hidden="true">
          <defs>
            <clipPath id={id("pill")}>
              <path d={pill} />
            </clipPath>
            <linearGradient id={id("day")} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#2f7fdc" />
              <stop offset="0.55" stopColor="#74b4ef" />
              <stop offset="1" stopColor="#cfe6f8" />
            </linearGradient>
            {/* golden hour: the blue thins overhead and the low sky turns peach and gold */}
            <linearGradient id={id("golden")} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#4a6fb3" />
              <stop offset="0.45" stopColor="#c99a8e" />
              <stop offset="0.75" stopColor="#f6b679" />
              <stop offset="1" stopColor="#ffd59a" />
            </linearGradient>
            <linearGradient id={id("night")} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#03050c" />
              <stop offset="0.45" stopColor="#0b1430" />
              <stop offset="0.75" stopColor="#1c2347" />
              <stop offset="1" stopColor="#2d2c52" />
            </linearGradient>
            {/* the afterglow: a rosy band low on the horizon after the sun has gone */}
            <linearGradient id={id("afterglow")} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#ff8a6a" stopOpacity="0" />
              <stop offset="0.5" stopColor="#e9708a" stopOpacity=".35" />
              <stop offset="0.85" stopColor="#ff9f7a" stopOpacity=".75" />
              <stop offset="1" stopColor="#ffc58f" stopOpacity=".85" />
            </linearGradient>
            <radialGradient id={id("glare")} cx="0.5" cy="0.5" r="0.5">
              <stop offset="0" stopColor="#ffffff" stopOpacity=".9" />
              <stop offset="0.3" stopColor="#fffbe8" stopOpacity=".5" />
              <stop offset="0.6" stopColor="#fff4d6" stopOpacity=".15" />
              <stop offset="1" stopColor="#fff4d6" stopOpacity="0" />
            </radialGradient>
            <radialGradient id={id("warm")} cx="0.5" cy="0.5" r="0.5">
              <stop offset="0" stopColor="#ffd28a" stopOpacity=".95" />
              <stop offset="0.35" stopColor="#ffa25e" stopOpacity=".45" />
              <stop offset="0.7" stopColor="#ff7a4a" stopOpacity=".12" />
              <stop offset="1" stopColor="#ff7a4a" stopOpacity="0" />
            </radialGradient>
            <radialGradient id={id("moonGlow")} cx="0.5" cy="0.5" r="0.5">
              <stop offset="0" stopColor="#dfe8ff" stopOpacity=".55" />
              <stop offset="0.45" stopColor="#b9c9ff" stopOpacity=".16" />
              <stop offset="1" stopColor="#b9c9ff" stopOpacity="0" />
            </radialGradient>
            <radialGradient id={id("sun")} cx="0.5" cy="0.5" r="0.5">
              <stop offset="0" stopColor="#ffffff" />
              <stop offset="0.7" stopColor="#fffbea" />
              <stop offset="0.92" stopColor="#ffefc0" />
              <stop offset="1" stopColor="#ffe3a0" />
            </radialGradient>
            {/* the setting sun: deep orange, redder at the rim */}
            <radialGradient id={id("sunset")} cx="0.5" cy="0.45" r="0.55">
              <stop offset="0" stopColor="#ffe3a6" />
              <stop offset="0.45" stopColor="#ffb05c" />
              <stop offset="0.85" stopColor="#ff7a3c" />
              <stop offset="1" stopColor="#f2603a" />
            </radialGradient>
            <radialGradient id={id("moonBase")} cx="0.42" cy="0.4" r="0.62">
              <stop offset="0" stopColor="#aeb8cb" />
              <stop offset="0.8" stopColor="#97a3ba" />
              <stop offset="1" stopColor="#838fa8" />
            </radialGradient>
            <radialGradient id={id("spark")} cx="0.5" cy="0.5" r="0.5">
              <stop offset="0" stopColor="#ffffff" />
              <stop offset="0.25" stopColor="#ffffff" stopOpacity=".7" />
              <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
            </radialGradient>
            {/* glass: a soft sheen across the top of the switch */}
            <linearGradient id={id("gloss")} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#ffffff" stopOpacity=".16" />
              <stop offset="0.45" stopColor="#ffffff" stopOpacity=".04" />
              <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
            </linearGradient>
            <filter id={id("b25")} x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="2.5" />
            </filter>
            <filter id={id("b04")} x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="0.4" />
            </filter>
          </defs>

          <g clipPath={url("pill")}>
            {/* the sky: day, golden hour, night, and the afterglow on the horizon */}
            <rect width={W} height={H} fill={url("day")} />
            <g ref={r.golden} opacity={s0.golden}>
              <rect width={W} height={H} fill={url("golden")} />
            </g>
            <g ref={r.night} opacity={s0.night}>
              <rect width={W} height={H} fill={url("night")} />
            </g>
            <g ref={r.afterglow} opacity={s0.afterglow}>
              <rect y={42} width={W} height={62} fill={url("afterglow")} />
            </g>

            {/* stars, in three sets that twinkle out of step, and the evening star, first to show */}
            {[0, 1, 2].map((g) => (
              <g key={g} ref={r.stars[g]} opacity={s0.stars} fill="#ffffff">
                {STARS.filter((s) => s.g === g).map((s, i) => (
                  <circle key={i} cx={s.x} cy={s.y} r={s.r} />
                ))}
              </g>
            ))}
            <g ref={r.venus} opacity={s0.venus}>
              <circle cx={96} cy={24} r={4} fill={url("spark")} opacity={0.55} />
              <circle cx={96} cy={24} r={1.25} fill="#fffdf5" />
            </g>

            {/* the light round the knob: the sun's glare by day, a warm glow at sunset, cool moonlight at night */}
            <g ref={r.lights} transform={`translate(${x0} ${knobY(startDark ? 1 : 0)})`}>
              <g ref={r.glare} opacity={s0.glare}>
                <circle r={92} fill={url("glare")} />
              </g>
              <g ref={r.warm} opacity={s0.warm}>
                <circle r={80} fill={url("warm")} />
              </g>
              <g ref={r.moonGlow} opacity={s0.moonGlow}>
                <circle r={50} fill={url("moonGlow")} />
              </g>
            </g>

            {/* the knob: the sun, turning orange and red as it sets, and the moon that rises in its place */}
            <g ref={r.body} transform={`translate(${x0} ${knobY(startDark ? 1 : 0)}) scale(${s0.size})`}>
              <g ref={r.moon} opacity={s0.moon}>
                <circle r={RM} fill={url("moonBase")} />
                {face && <image href={face} x={-RM} y={-RM} width={RM * 2} height={RM * 2} preserveAspectRatio="none" />}
              </g>
              <g ref={r.sun} opacity={s0.sun}>
                <circle r={RS} fill={url("sun")} />
              </g>
              <g ref={r.sunset} opacity={s0.sunset}>
                <circle r={RS} fill={url("sunset")} />
              </g>
            </g>

            {/* the land: green hills by day, warm silhouettes at sunset, blue-black under the moon */}
            <path d={ridges.far} fill="#8dbba6" />
            <path d={ridges.near} fill="#5d957a" />
            <g ref={r.duskLand} opacity={s0.duskLand}>
              <path d={ridges.far} fill="#6b4f5e" />
              <path d={top(ridges.far)} fill="none" stroke="#ffc08a" strokeOpacity={0.5} strokeWidth={0.7} />
              <path d={ridges.near} fill="#3e2c3c" />
            </g>
            <g ref={r.nightLand} opacity={s0.nightLand}>
              <path d={ridges.far} fill="#141a2c" />
              <path d={top(ridges.far)} fill="none" stroke="#b4c4ff" strokeOpacity={0.22} strokeWidth={0.6} />
              <path d={ridges.near} fill="#070a12" />
              <path d={top(ridges.near)} fill="none" stroke="#b4c4ff" strokeOpacity={0.12} strokeWidth={0.5} />
            </g>

            {/* birds, up with the morning */}
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

          {/* the switch's well: a glass sheen, a deeper shadow under the top edge, a faint lit lip at the bottom, a hairline */}
          <g clipPath={url("pill")} pointerEvents="none">
            <rect width={W} height={H * 0.55} fill={url("gloss")} />
            <path d={pill} fill="none" stroke="#000000" strokeOpacity={0.3} strokeWidth={8} filter={url("b25")} transform="translate(0 3)" />
            <path d={pill} fill="none" stroke="#ffffff" strokeOpacity={0.18} strokeWidth={3} filter={url("b04")} transform="translate(0 -1.5)" />
          </g>
          <path d={pill} fill="none" stroke="#000000" strokeOpacity={0.18} strokeWidth={1} />
        </svg>
      </motion.button>
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
          {isDark ? "Drag the moon back" : "Drag the sun across"}
        </motion.span>
      </div>
    </motion.div>
  );
}
