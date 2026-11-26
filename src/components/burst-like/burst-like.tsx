"use client";

/* eslint-disable react-hooks/refs, react-hooks/purity, react-hooks/immutability -- these rules assume code runs while rendering; here refs, timers and setState are used in handlers, effects and animation frames, and the animation state lives in refs on purpose */

import { motion, useMotionValue, useSpring } from "framer-motion";
import {
  type ReactNode,
  type RefObject,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useAutoplaySoundAllowed, useSoundsEnabled } from "@/lib/ui-sounds";

export type BurstLikeProps = {
  /** the count without your like */
  count?: number;
  liked?: boolean;
  defaultLiked?: boolean;
  onChange?: (liked: boolean) => void;
  /** the number and name in the cell's corner */
  index?: string;
  caption?: string;
  /** drop the dark cell (it still needs a dark background) */
  bare?: boolean;
  /** Soft synthesised sounds as you use it. They also follow the site-wide sound switch. */
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
const engine = () =>
  (globalThis as unknown as Record<string, Engine | undefined>)[ENGINE_KEY] ??
  null;
function unlockAudio() {
  const g = globalThis as unknown as Record<string, Engine | undefined>;
  const e = g[ENGINE_KEY];
  if (e) {
    if (e.ctx.state === "suspended") void e.ctx.resume();
    return;
  }
  const AC =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;
  if (!AC) return;
  const ctx = new AC();
  const noise = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
  const d = noise.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  g[ENGINE_KEY] = { ctx, noise };
}

type NoteOpts = {
  at?: number;
  dur?: number;
  gain?: number;
  type?: OscillatorType;
  glide?: number;
  bell?: number;
};
type Sound = {
  /** a soft glassy note: a sine with a faint bell partial above it */
  note: (freq: number, o?: NoteOpts) => void;
  /** air moving: filtered noise swept from one pitch to another */
  whoosh: (
    from: number,
    to: number,
    o?: { at?: number; dur?: number; gain?: number },
  ) => void;
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
      return e && on.current && allowRef.current() && vol.current > 0 && e.ctx.state === "running"
        ? e
        : null;
    };
    const env = (
      ctx: AudioContext,
      t: number,
      peak: number,
      attack: number,
      dur: number,
    ) => {
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
        if (o.glide)
          a.frequency.exponentialRampToValueAtTime(o.glide, t + dur * 0.6);
        a.connect(g);
        a.start(t);
        a.stop(t + dur + 0.05);
        const bell = o.bell ?? 0.25;
        if (bell > 0) {
          const g2 = env(ctx, t, peak * bell, 0.003, dur * 0.4);
          g2.connect(lp);
          const b = ctx.createOscillator();
          b.frequency.setValueAtTime(freq * 2.76, t);
          if (o.glide)
            b.frequency.exponentialRampToValueAtTime(
              o.glide * 2.76,
              t + dur * 0.6,
            );
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
        g.gain.exponentialRampToValueAtTime(
          Math.max(0.0002, peak),
          t + dur * 0.35,
        );
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

// ───────────── soft glows: the shape is drawn sharp into a half-size layer, blurred there, and laid over the canvas.
// Browsers with the canvas blur filter blur it directly; the others halve the layer a few times and scale it back up
// one step at a time, which stays smooth instead of turning blocky. ─────────────

let filterOK: boolean | null = null;
function canFilter() {
  if (filterOK === null) {
    try {
      const x = document.createElement("canvas").getContext("2d");
      if (x) x.filter = "blur(1px)";
      filterOK = !!x && x.filter === "blur(1px)";
    } catch {
      filterOK = false;
    }
  }
  return filterOK;
}
function createGlow() {
  const mk = () => {
    const c = document.createElement("canvas");
    return { c, x: c.getContext("2d")! };
  };
  const layer = mk(),
    soft = mk();
  const down: { c: HTMLCanvasElement; x: CanvasRenderingContext2D }[] = [];
  const up: { c: HTMLCanvasElement; x: CanvasRenderingContext2D }[] = [];
  let W = 0,
    H = 0,
    ready = -1;
  let last: HTMLCanvasElement = soft.c;
  const K = 0.5; // layer pixels per CSS pixel
  const fit = (
    o: { c: HTMLCanvasElement; x: CanvasRenderingContext2D },
    w: number,
    h: number,
  ) => {
    w = Math.max(1, Math.ceil(w));
    h = Math.max(1, Math.ceil(h));
    if (o.c.width !== w || o.c.height !== h) {
      o.c.width = w;
      o.c.height = h;
    }
    o.x.setTransform(1, 0, 0, 1, 0, 0);
    o.x.clearRect(0, 0, w, h);
    o.x.imageSmoothingEnabled = true;
    o.x.imageSmoothingQuality = "high";
  };
  return {
    /** start a glow over a canvas w x h CSS px; draw on what it returns in CSS px */
    begin(w: number, h: number) {
      W = w;
      H = h;
      ready = -1;
      fit(layer, w * K, h * K);
      layer.x.setTransform(K, 0, 0, K, 0, 0);
      return layer.x;
    },
    /** lay it over g blurred by radius CSS px, at alpha; g's own clip still applies */
    lay(g: CanvasRenderingContext2D, radius: number, alpha: number) {
      if (alpha <= 0.002) return;
      const dpr = g.getTransform().a || 1;
      const lw = layer.c.width,
        lh = layer.c.height;
      let src: HTMLCanvasElement = soft.c;
      if (ready === radius) src = last;
      else if (canFilter()) {
        fit(soft, lw, lh);
        soft.x.filter = `blur(${Math.max(0.5, radius * K)}px)`;
        soft.x.drawImage(layer.c, 0, 0);
        soft.x.filter = "none";
      } else {
        // a pyramid: halve it until the blur is covered, then climb back up a step at a time
        const n = Math.max(
          1,
          Math.min(5, Math.round(Math.log2(Math.max(2, radius * K * 1.5)))),
        );
        let prev = layer.c;
        for (let i = 0; i < n; i++) {
          down[i] ??= mk();
          fit(down[i], prev.width / 2, prev.height / 2);
          down[i].x.drawImage(prev, 0, 0, down[i].c.width, down[i].c.height);
          prev = down[i].c;
        }
        for (let i = n - 2; i >= -1; i--) {
          const tw = i >= 0 ? down[i].c.width : lw,
            th = i >= 0 ? down[i].c.height : lh;
          const k = i + 1;
          up[k] ??= mk();
          fit(up[k], tw, th);
          up[k].x.drawImage(prev, 0, 0, tw, th);
          prev = up[k].c;
        }
        src = prev;
      }
      ready = radius;
      last = src;
      g.save();
      g.setTransform(1, 0, 0, 1, 0, 0);
      g.imageSmoothingEnabled = true;
      g.imageSmoothingQuality = "high";
      g.globalAlpha = Math.min(1, alpha);
      g.drawImage(src, 0, 0, W * dpr, H * dpr);
      g.restore();
    },
  };
}

/** a full-resolution layer for thin lines drawn as many short coloured pieces: drawn opaque, with each piece's
 * brightness folded into its colour, so the joins can't double up into beads, then added over the canvas */
function createLine() {
  const c = document.createElement("canvas");
  const x = c.getContext("2d")!;
  return {
    begin(g: CanvasRenderingContext2D) {
      const w = g.canvas.width,
        h = g.canvas.height;
      if (c.width !== w || c.height !== h) {
        c.width = w;
        c.height = h;
      }
      x.setTransform(1, 0, 0, 1, 0, 0);
      x.clearRect(0, 0, w, h);
      x.setTransform(g.getTransform());
      x.lineCap = "round";
      x.lineJoin = "round";
      return x;
    },
    lay(g: CanvasRenderingContext2D) {
      g.save();
      g.setTransform(1, 0, 0, 1, 0, 0);
      g.globalAlpha = 1;
      g.globalCompositeOperation = "lighter";
      g.drawImage(c, 0, 0);
      g.restore();
    },
  };
}
/** a colour scaled by a brightness, for drawing on a dark, additive layer */
const dim = (c: number[], a: number) =>
  `rgb(${(c[0] * a) | 0},${(c[1] * a) | 0},${(c[2] * a) | 0})`;

// ───────────── the halo: a thin-film rim light drawn on a canvas. Its colour depends on which way the edge faces
// (warm gold at the top, pink then violet on the right, blue and cyan underneath, silver on the left), like light
// caught in a soap film, and it drifts slowly. A sharp line sits on the edge with two soft glows under it; the glows
// are drawn small and scaled up, which blurs them cheaply in every browser. ─────────────

const FILM = [
  [255, 186, 84],
  [255, 118, 98],
  [255, 78, 158],
  [172, 96, 255],
  [80, 124, 255],
  [66, 204, 255],
  [150, 170, 255],
  [255, 150, 92],
  [255, 186, 84],
];
/** the film's colour at a point a fraction u of the way round, clockwise from the top */
function film(u: number, hot = 0): [number, number, number] {
  u = ((u % 1) + 1) % 1;
  const f = u * (FILM.length - 1);
  const i = Math.floor(f),
    t = f - i;
  const a = FILM[i],
    b = FILM[Math.min(FILM.length - 1, i + 1)];
  const k = t * t * (3 - 2 * t);
  return [
    a[0] + (b[0] - a[0]) * k + (255 - a[0] - (b[0] - a[0]) * k) * hot,
    a[1] + (b[1] - a[1]) * k + (255 - a[1] - (b[1] - a[1]) * k) * hot,
    a[2] + (b[2] - a[2]) * k + (255 - a[2] - (b[2] - a[2]) * k) * hot,
  ];
}
const rgb = (c: number[]) => `rgb(${c[0] | 0},${c[1] | 0},${c[2] | 0})`;

/** a point on the edge of a rounded rectangle, s px along it from the top-left end of the top side, clockwise */
function edge(w: number, h: number, r: number) {
  r = Math.max(0, Math.min(r, w / 2, h / 2));
  const a = w - 2 * r,
    b = h - 2 * r,
    q = (Math.PI * r) / 2;
  const L = 2 * a + 2 * b + 4 * q;
  const at = (s: number): [number, number] => {
    s = ((s % L) + L) % L;
    if (s < a) return [r + s, 0];
    s -= a;
    if (s < q) {
      const t = s / r - Math.PI / 2;
      return [w - r + Math.cos(t) * r, r + Math.sin(t) * r];
    }
    s -= q;
    if (s < b) return [w, r + s];
    s -= b;
    if (s < q) {
      const t = s / r;
      return [w - r + Math.cos(t) * r, h - r + Math.sin(t) * r];
    }
    s -= q;
    if (s < a) return [w - r - s, h];
    s -= a;
    if (s < q) {
      const t = s / r + Math.PI / 2;
      return [r + Math.cos(t) * r, h - r + Math.sin(t) * r];
    }
    s -= q;
    if (s < b) return [0, h - r - s];
    s -= b;
    const t = s / r + Math.PI;
    return [r + Math.cos(t) * r, r + Math.sin(t) * r];
  };
  return { L, at };
}
function roundRect(
  g: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  r = Math.max(0, Math.min(r, w / 2, h / 2));
  g.beginPath();
  g.moveTo(x + r, y);
  g.arcTo(x + w, y, x + w, y + h, r);
  g.arcTo(x + w, y + h, x, y + h, r);
  g.arcTo(x, y + h, x, y, r);
  g.arcTo(x, y, x + w, y, r);
  g.closePath();
}

type RimDraw = {
  /** the shape, in CSS px, drawn pad px in from the canvas's top left */
  x: number;
  y: number;
  w: number;
  h: number;
  r: number;
  /** seconds, for the drift */
  t: number;
  /** 0 to 1 overall */
  level: number;
  /** how lit each point of the edge is, 0 to 1, given its distance s along the edge of length L and its x, y in the shape */
  mask?: (s: number, L: number, x: number, y: number) => number;
  /** how far the colours have turned, in turns */
  spin?: number;
  /** 0 to 1: pushes the colours toward white */
  hot?: number;
  line?: number;
  tight?: number;
  wide?: number;
  inner?: number;
  /** line width in px */
  width?: number;
};

function createRim() {
  const A = createGlow(),
    B = createGlow(),
    LN = createLine();
  let cw = 0,
    ch = 0;
  return {
    /** call when the canvas changes size; w and h in CSS px */
    size(w: number, h: number) {
      cw = w;
      ch = h;
    },
    /** draw one rim onto g, which must already be scaled to CSS px; doesn't clear g */
    draw(g: CanvasRenderingContext2D, d: RimDraw) {
      if (d.level <= 0.003 || cw === 0) return;
      const { L, at } = edge(d.w, d.h, d.r);
      const N = Math.max(40, Math.min(260, Math.round(L / 3.5)));
      const cx = d.x + d.w / 2,
        cy = d.y + d.h / 2;
      const drift = (d.spin ?? 0) + Math.sin(d.t * 0.55) * 0.035 + d.t * 0.012;
      const pts: [number, number][] = [];
      const col: string[] = [];
      const cn: number[][] = [];
      const al: number[] = [];
      for (let i = 0; i <= N; i++) {
        const s = (i / N) * L;
        const p = at(s);
        const x = d.x + p[0],
          y = d.y + p[1];
        pts.push([x, y]);
        const u = Math.atan2(x - cx, -(y - cy)) / (Math.PI * 2);
        const fc = film(u + drift, d.hot ?? 0);
        cn.push(fc);
        col.push(rgb(fc));
        al.push(
          d.level *
            (d.mask ? Math.max(0, Math.min(1, d.mask(s, L, p[0], p[1]))) : 1),
        );
      }
      const stroke = (
        x: CanvasRenderingContext2D,
        width: number,
        gain: number,
      ) => {
        x.lineCap = "round";
        x.lineWidth = width;
        for (let i = 0; i < N; i++) {
          const a = ((al[i] + al[i + 1]) / 2) * gain;
          if (a < 0.004) continue;
          x.globalAlpha = Math.min(1, a);
          x.strokeStyle = col[i];
          x.beginPath();
          x.moveTo(pts[i][0], pts[i][1]);
          x.lineTo(pts[i + 1][0], pts[i + 1][1]);
          x.stroke();
        }
        x.globalAlpha = 1;
      };
      stroke(A.begin(cw, ch), 3.5, 1);
      stroke(B.begin(cw, ch), 10, 1);
      g.save();
      g.globalCompositeOperation = "lighter";
      const wide = d.wide ?? 0.5,
        tight = d.tight ?? 0.6,
        inner = d.inner ?? 0.25,
        line = d.line ?? 1;
      if (inner > 0) {
        g.save();
        roundRect(g, d.x, d.y, d.w, d.h, d.r);
        g.clip();
        B.lay(g, 12, inner * 0.6);
        g.restore();
      }
      B.lay(g, 12, wide * 1.35);
      A.lay(g, 3, tight * 1.5);
      g.globalAlpha = 1;
      // the line, with a white core where it is brightest, opaque on its own layer so its pieces join cleanly
      const lx = LN.begin(g);
      const lw = d.width ?? 1.4;
      for (let pass = 0; pass < 2; pass++) {
        lx.lineWidth = pass ? lw * 0.45 : lw;
        for (let i = 0; i < N; i++) {
          const m = (al[i] + al[i + 1]) / 2;
          const a = Math.min(1, m * line);
          if (a < 0.004) continue;
          const core = pass
            ? m * m * 0.3 * line * (0.5 + (d.hot ?? 0) * 1.2)
            : 0;
          if (pass && core < 0.01) continue;
          const c0 = cn[i];
          lx.strokeStyle = pass
            ? `rgb(${Math.min(255, c0[0] * a + 255 * core) | 0},${Math.min(255, c0[1] * a + 255 * core) | 0},${Math.min(255, c0[2] * a + 255 * core) | 0})`
            : dim(c0, a);
          lx.beginPath();
          lx.moveTo(pts[i][0], pts[i][1]);
          lx.lineTo(pts[i + 1][0], pts[i + 1][1]);
          lx.stroke();
        }
      }
      LN.lay(g);
      g.restore();
    },
  };
}

// ───────────── the travelling light: a comet that runs along a path of straight runs joined by rounded corners. Its
// head is a hot white point with a warm glow; its tail cools through pink and violet to blue as it fades. ─────────────

type Path = { L: number; at: (s: number) => [number, number] };
/** a path through the points, with every corner rounded to radius r, measured by length */
function makePath(pts: [number, number][], r = 18): Path {
  const dense: [number, number][] = [];
  const push = (x: number, y: number) => dense.push([x, y]);
  push(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) {
    const [x0, y0] = dense[dense.length - 1];
    const [x1, y1] = pts[i];
    if (i < pts.length - 1) {
      const [x2, y2] = pts[i + 1];
      const l1 = Math.hypot(x1 - x0, y1 - y0) || 1,
        l2 = Math.hypot(x2 - x1, y2 - y1) || 1;
      const k = Math.min(r, l1 / 2, l2 / 2);
      const ax = x1 - ((x1 - x0) / l1) * k,
        ay = y1 - ((y1 - y0) / l1) * k;
      const bx = x1 + ((x2 - x1) / l2) * k,
        by = y1 + ((y2 - y1) / l2) * k;
      const n = Math.max(2, Math.ceil(l1 / 3));
      for (let j = 1; j <= n; j++)
        push(x0 + ((ax - x0) * j) / n, y0 + ((ay - y0) * j) / n);
      for (let j = 1; j <= 10; j++) {
        const t = j / 10,
          u = 1 - t;
        push(
          u * u * ax + 2 * u * t * x1 + t * t * bx,
          u * u * ay + 2 * u * t * y1 + t * t * by,
        );
      }
    } else {
      const n = Math.max(2, Math.ceil(Math.hypot(x1 - x0, y1 - y0) / 3));
      for (let j = 1; j <= n; j++)
        push(x0 + ((x1 - x0) * j) / n, y0 + ((y1 - y0) * j) / n);
    }
  }
  const acc = [0];
  for (let i = 1; i < dense.length; i++)
    acc.push(
      acc[i - 1] +
        Math.hypot(
          dense[i][0] - dense[i - 1][0],
          dense[i][1] - dense[i - 1][1],
        ),
    );
  const L = acc[acc.length - 1];
  return {
    L,
    at(s) {
      s = Math.max(0, Math.min(L, s));
      let lo = 0,
        hi = acc.length - 1;
      while (hi - lo > 1) {
        const m = (lo + hi) >> 1;
        if (acc[m] < s) lo = m;
        else hi = m;
      }
      const f = (s - acc[lo]) / (acc[hi] - acc[lo] || 1);
      return [
        dense[lo][0] + (dense[hi][0] - dense[lo][0]) * f,
        dense[lo][1] + (dense[hi][1] - dense[lo][1]) * f,
      ];
    },
  };
}
const TAIL = [
  [255, 246, 228],
  [255, 196, 150],
  [255, 120, 180],
  [176, 120, 255],
  [100, 150, 255],
];
let cometLine: ReturnType<typeof createLine> | null = null;
let cometGlow: ReturnType<typeof createGlow> | null = null;
/** draw a comet whose head is s px along the path; fade scales it all down */
function drawComet(
  g: CanvasRenderingContext2D,
  path: Path,
  s: number,
  fade = 1,
  len = 120,
) {
  if (fade <= 0.01) return;
  const n = 36;
  // the tail is drawn opaque on its own layer, brightness folded into the colour, so its pieces join cleanly
  const lx = (cometLine ??= createLine()).begin(g);
  const dpr = g.getTransform().a || 1;
  const gx = (cometGlow ??= createGlow()).begin(
    g.canvas.width / dpr,
    g.canvas.height / dpr,
  );
  gx.lineCap = "round";
  for (let pass = 0; pass < 2; pass++) {
    const x = pass === 0 ? gx : lx;
    for (let i = 0; i < n; i++) {
      const s0 = s - (i / n) * len,
        s1 = s - ((i + 1) / n) * len;
      if (s0 <= 0) break;
      const a = path.at(s0),
        b = path.at(Math.max(0, s1));
      const u = i / n;
      const f = u * (TAIL.length - 1);
      const k = Math.floor(f),
        t = f - k;
      const c0 = TAIL[k],
        c1 = TAIL[Math.min(TAIL.length - 1, k + 1)];
      const col = [
        c0[0] + (c1[0] - c0[0]) * t,
        c0[1] + (c1[1] - c0[1]) * t,
        c0[2] + (c1[2] - c0[2]) * t,
      ];
      const al = Math.pow(1 - u, 1.4) * fade;
      x.strokeStyle = dim(col, pass === 0 ? al * 0.5 : al);
      x.lineWidth = pass === 0 ? 7 * (1 - u * 0.6) : 2.6 * (1 - u * 0.75);
      x.beginPath();
      x.moveTo(a[0], a[1]);
      x.lineTo(b[0], b[1]);
      x.stroke();
    }
  }
  g.save();
  g.globalCompositeOperation = "lighter";
  cometGlow.lay(g, 5, 0.9);
  g.restore();
  cometLine.lay(g);
  g.save();
  g.globalCompositeOperation = "lighter";
  const [hx, hy] = path.at(s);
  const hg = g.createRadialGradient(hx, hy, 0, hx, hy, 22);
  hg.addColorStop(0, `rgba(255,255,255,${fade})`);
  hg.addColorStop(0.12, `rgba(255,246,228,${0.9 * fade})`);
  hg.addColorStop(0.4, `rgba(255,200,160,${0.25 * fade})`);
  hg.addColorStop(1, "rgba(255,170,140,0)");
  g.fillStyle = hg;
  g.fillRect(hx - 22, hy - 22, 44, 44);
  g.restore();
}

const MONO =
  "ui-monospace, 'SF Mono', SFMono-Regular, 'JetBrains Mono', Menlo, monospace";
const SANS =
  "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Inter', system-ui, sans-serif";
/** the near-black board cell the control sits in, with its number and name in the corner; bare drops the cell and keeps the layout */
function Cell({
  index,
  caption,
  bare,
  height,
  cellRef,
  className = "",
  children,
}: {
  index: string;
  caption: string;
  bare: boolean;
  height: number;
  cellRef: RefObject<HTMLDivElement | null>;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      ref={cellRef}
      className={`relative w-full max-w-[400px] ${bare ? "" : "overflow-hidden rounded-[28px] shadow-[0_0_0_1px_rgba(0,0,0,.05),0_20px_40px_-26px_rgba(0,0,0,.35)]"} ${className}`}
      style={{
        height,
        fontFamily: SANS,
        background: bare
          ? "transparent"
          : "radial-gradient(120% 90% at 50% 42%, #0b0b0d 0%, #050506 58%, #020203 100%)",
      }}
    >
      {children}
      {!bare && (
        <div
          className="pointer-events-none absolute bottom-[18px] left-[22px] flex gap-3 text-[12px] tracking-[0.02em]"
          style={{ fontFamily: MONO }}
        >
          <span className="text-[#5d5d63]">{index}</span>
          <span className="text-[#c9c9ce]">{caption}</span>
        </div>
      )}
    </div>
  );
}

const BW = 206,
  BH = 70;
const HEART =
  "M128,216S24,160,24,94A54,54,0,0,1,128,72h0a54,54,0,0,1,104,22C232,160,128,216,128,216Z";
const SPARK = [
  "#ff6fa8",
  "#ffb25a",
  "#6d8bff",
  "#b06bff",
  "#ffffff",
  "#57d0ff",
];

/** one digit on a reel that rolls up or down to its number, blurred while it moves */
function Reel({ d }: { d: number }) {
  const y = useSpring(-d * 10, { stiffness: 260, damping: 26 });
  useEffect(() => y.set(-d * 10), [d, y]);
  const blur = useMotionValue("blur(0px)");
  useEffect(
    () =>
      y.on("change", () =>
        blur.set(`blur(${Math.min(2.5, Math.abs(y.getVelocity()) / 60)}px)`),
      ),
    [y, blur],
  );
  return (
    <span className="relative inline-block h-[1em] w-[0.6em] overflow-hidden align-top">
      <motion.span
        className="absolute left-0 top-0 flex w-full flex-col items-center"
        style={{ y: useMotionValueTemplate(y), filter: blur }}
      >
        {Array.from({ length: 10 }, (_, i) => (
          <span key={i} className="block h-[1em] leading-[1em]">
            {i}
          </span>
        ))}
      </motion.span>
    </span>
  );
}
function useMotionValueTemplate(y: ReturnType<typeof useSpring>) {
  const out = useMotionValue("0%");
  useEffect(() => y.on("change", (v) => out.set(`${v}%`)), [y, out]);
  useEffect(() => out.set(`${y.get()}%`), [y, out]);
  return out;
}

/**
 * A like button that goes off like a small firework, from the Halo set.
 *
 * Unliked, the heart is an outline and only a faint film of light lies on the pill's edge. Tap it: the pill squeezes,
 * a thin violet ring shoots out from the heart and a dozen sparks in pink, amber, blue, violet and white burst round
 * it and fade, the heart pops back filled with a pink-to-blue gradient, the count rolls up a digit, and the rim lights
 * from the heart end across to the far end until the whole edge glows. Tap again and the count rolls back down and the
 * light sinks. In the showcase a comet runs in along the bottom to set it off.
 */
export default function BurstLike({
  count = 2481,
  liked,
  defaultLiked = true,
  onChange,
  index = "08",
  caption = "Burst Like",
  bare = false,
  enableSound = true,
  volume = 0.6,
  autoplay = false,
  className = "",
}: BurstLikeProps) {
  const [siteSound] = useSoundsEnabled();
  // a demo playing by itself only makes sound where the page allows it (see AutoplaySound)
  const autoplaySoundOk = useAutoplaySoundAllowed();
  const autoplayOk = useRef(autoplaySoundOk);
  useEffect(() => {
    autoplayOk.current = autoplaySoundOk;
  }, [autoplaySoundOk]);
  const sfx = useSound(enableSound && siteSound, volume, () => touched.current || autoplayOk.current);
  const [inner, setInner] = useState(defaultLiked);
  const on = liked ?? inner;
  const onRef = useRef(on);
  onRef.current = on;
  const touched = useRef(false);
  const cell = useRef<HTMLDivElement>(null);
  const pill = useRef<HTMLButtonElement>(null);
  const cv = useRef<HTMLCanvasElement>(null);
  const squeeze = useSpring(1, { stiffness: 520, damping: 18 });
  const heart = useSpring(1, { stiffness: 520, damping: 14 });
  const st = useRef({
    kick: () => {},
    burst: -1,
    sweep: on ? 1 : 0,
    comet: -1,
    path: null as Path | null,
    onArrive: () => {},
  });

  const toggle = (user: boolean) => {
    if (user) touched.current = true;
    const v = !onRef.current;
    if (liked === undefined) setInner(v);
    onChange?.(v);
    squeeze.set(0.94);
    setTimeout(() => squeeze.set(1), 110);
    if (v) {
      heart.set(0.3);
      setTimeout(() => heart.set(1), 90);
      st.current.burst = 0;
      sfx.note(1175, { dur: 0.35, gain: 0.05, bell: 0.6 });
      sfx.note(1760, { at: 0.06, dur: 0.45, gain: 0.04, bell: 0.6 });
      sfx.whoosh(3000, 6000, { dur: 0.25, gain: 0.02 });
    } else {
      heart.set(0.8);
      setTimeout(() => heart.set(1), 90);
      sfx.tick({ freq: 1500, gain: 0.06 });
    }
    st.current.kick();
  };
  const toggleRef = useRef(toggle);
  toggleRef.current = toggle;

  useEffect(() => {
    const c = cv.current,
      el = cell.current,
      b = pill.current;
    if (!c || !el || !b) return;
    const g = c.getContext("2d");
    if (!g) return;
    const rim = createRim();
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    let W = 0,
      H = 0,
      dpr = 1,
      raf = 0,
      last = performance.now(),
      t = 0,
      visible = true,
      fired = false;
    const resize = () => {
      W = el.offsetWidth;
      H = el.offsetHeight;
      dpr = Math.min(3, window.devicePixelRatio || 1);
      c.width = W * dpr;
      c.height = H * dpr;
      rim.size(W, H);
    };
    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      t += dt;
      const s = st.current;
      // the light sweeps from the heart end across, or sinks back
      const goal = onRef.current ? 1 : 0;
      s.sweep += (goal - s.sweep) * Math.min(1, dt * (goal ? 4.5 : 6));
      if (reduce) s.sweep = goal;
      const k = squeeze.get();
      const w = BW * k,
        h = BH * k;
      const ox = b.offsetLeft + (BW - w) / 2,
        oy = b.offsetTop + (BH - h) / 2;
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      g.clearRect(0, 0, W, H);
      const reach = s.sweep * (w + 60) - 30;
      rim.draw(g, {
        x: ox,
        y: oy,
        w,
        h,
        r: h / 2,
        t: reduce ? 0 : t,
        level: 1,
        mask: (_s, _L, x) => {
          const e = Math.max(0, Math.min(1, (reach - x) / 40 + 0.5));
          return 0.2 + 0.8 * e;
        },
        hot: s.burst >= 0 && s.burst < 0.5 ? (0.5 - s.burst) * 0.4 : 0,
        tight: 0.5,
        wide: 0.22 + s.sweep * 0.22,
        inner: 0.06,
        width: 1.5,
      });
      // the burst round the heart
      if (s.burst >= 0) {
        s.burst += dt / 0.6;
        const p = s.burst;
        const hx = ox + 22 * k + 14,
          hy = oy + h / 2;
        g.save();
        g.globalCompositeOperation = "lighter";
        // the ring
        const rr = 12 + p * 34;
        g.strokeStyle = `rgba(150,120,255,${Math.max(0, 0.8 * (1 - p))})`;
        g.lineWidth = 1.4 * (1 - p) + 0.4;
        g.beginPath();
        g.arc(hx, hy, rr, 0, Math.PI * 2);
        g.stroke();
        // the sparks
        for (let i = 0; i < 12; i++) {
          const a = (i / 12) * Math.PI * 2 + 0.3;
          const e = 1 - Math.pow(1 - Math.min(1, p * 1.3), 3);
          const r = 18 + e * 24;
          const sz = 2.2 * (1 - p) + 0.4;
          g.fillStyle = SPARK[i % SPARK.length];
          g.globalAlpha = Math.max(0, 1 - p);
          g.beginPath();
          g.arc(hx + Math.cos(a) * r, hy + Math.sin(a) * r, sz, 0, Math.PI * 2);
          g.fill();
        }
        g.restore();
        if (p >= 1) s.burst = -1;
      }
      if (s.comet >= 0 && s.path) {
        s.comet += dt * 520;
        if (!fired && s.comet >= s.path.L - 2) {
          fired = true;
          s.onArrive();
        }
        const f =
          s.comet > s.path.L ? Math.max(0, 1 - (s.comet - s.path.L) / 50) : 1;
        drawComet(g, s.path, Math.min(s.comet, s.path.L), f, 120);
        if (f <= 0) {
          s.comet = -1;
          fired = false;
        }
      }
      raf = visible && !reduce ? requestAnimationFrame(frame) : 0;
    };
    st.current.kick = () => {
      if (!raf && visible) {
        last = performance.now();
        raf = requestAnimationFrame(frame);
      }
      if (reduce) frame(performance.now());
    };
    const ro = new ResizeObserver(() => {
      resize();
      st.current.kick();
    });
    ro.observe(el);
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      st.current.kick();
    });
    io.observe(el);
    resize();
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
    };
  }, [squeeze]);

  // autoplay: unlike, then a comet runs in along the bottom and likes it again
  useEffect(() => {
    if (!autoplay) return;
    let alive = true;
    st.current.onArrive = () => {
      if (!onRef.current) toggleRef.current(false);
    };
    (async () => {
      await new Promise((r) => setTimeout(r, 1500));
      for (let k = 0; alive && !touched.current; k++) {
        if (onRef.current) {
          toggleRef.current(false);
          await new Promise((r) => setTimeout(r, 1500));
        } else if (k % 2 === 0 && pill.current) {
          const b = pill.current;
          const y = b.offsetTop + BH + 22,
            hx = b.offsetLeft + 36;
          st.current.path = makePath(
            [
              [b.offsetLeft + BW + 90, y],
              [hx, y],
              [hx, b.offsetTop + BH / 2 + 6],
            ],
            20,
          );
          st.current.comet = 0;
          st.current.kick();
          await new Promise((r) => setTimeout(r, 2600));
        } else {
          toggleRef.current(false);
          await new Promise((r) => setTimeout(r, 2400));
        }
      }
    })();
    return () => {
      alive = false;
      // eslint-disable-next-line react-hooks/exhaustive-deps
      st.current.onArrive = () => {};
    };
  }, [autoplay]);

  const n = count + (on ? 1 : 0);
  const txt = n.toLocaleString("en-US");
  const gid = "bl" + useMemo(() => Math.random().toString(36).slice(2, 8), []);
  return (
    <Cell
      index={index}
      caption={caption}
      bare={bare}
      height={330}
      cellRef={cell}
      className={className}
    >
      <canvas
        ref={cv}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-[2] h-full w-full"
      />
      <div
        className="absolute inset-x-0 top-0 grid place-items-center"
        style={{ bottom: 40 }}
      >
        <motion.button
          ref={pill}
          type="button"
          aria-pressed={on}
          aria-label={`Like, ${txt} likes`}
          onClick={() => toggle(true)}
          className="relative flex items-center gap-4 rounded-full pl-[22px] pr-6 outline-none focus-visible:shadow-[0_0_0_3px_#0a84ff]"
          style={{
            width: BW,
            height: BH,
            scale: squeeze,
            background: "linear-gradient(180deg, #17171a 0%, #0d0d0f 100%)",
            boxShadow:
              "inset 0 0 0 1px rgba(255,255,255,.06), inset 0 1px 0 rgba(255,255,255,.05), 0 20px 40px -20px rgba(0,0,0,.9)",
          }}
        >
          <motion.svg
            viewBox="0 0 256 256"
            width={28}
            height={28}
            aria-hidden="true"
            style={{ scale: heart }}
            className="shrink-0"
          >
            <defs>
              <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
                <stop offset="0.1" stopColor="#ff6f9e" />
                <stop offset="0.5" stopColor="#f58fd0" />
                <stop offset="0.95" stopColor="#5fa8ff" />
              </linearGradient>
            </defs>
            <path
              d={HEART}
              fill={on ? `url(#${gid})` : "none"}
              stroke={on ? "none" : "#9a9aa1"}
              strokeWidth={16}
              strokeLinejoin="round"
            />
          </motion.svg>
          <span
            className="flex text-[24px] font-semibold tabular-nums tracking-[-0.01em] text-white"
            style={{ fontFamily: SANS }}
            aria-hidden="true"
          >
            {txt.split("").map((ch, i) => {
              const key = txt.length - i;
              return /\d/.test(ch) ? (
                <Reel key={`d${key}`} d={+ch} />
              ) : (
                <span
                  key={`c${key}`}
                  className="inline-block h-[1em] leading-[1em]"
                >
                  {ch}
                </span>
              );
            })}
          </span>
        </motion.button>
      </div>
    </Cell>
  );
}
