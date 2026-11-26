# Halo Switch

Add the "Halo Switch" component from Nexus UI to my project.

A switch whose rim lights up. Press and the pearl knob flattens into an oval; let go and it slides across, stretched by its speed, with the light travelling underneath. When it lands the light spreads round the whole edge of the track: gold along the top, pink and violet at the knob's end, blue and cyan underneath, with the colours slowly drifting. Turn it off and the light draws back to a faint arc. It is a real switch, with keyboard support, a focus ring and aria-checked.

Please:

1. Create the files below at sensible paths for this project, keeping each file's name. They import each other with relative paths, so keep them together.
2. Install what it needs: `framer-motion` (use this project's package manager).
3. It is styled with Tailwind CSS classes, so the project needs Tailwind.
4. It uses `@/lib/ui-sounds` for its interaction sounds, which are synthesised in the browser, so no audio files are needed. Create it at lib/ from the file below.
5. Use it like this: `import { HaloSwitch } from "@/components/halo-switch";`. The props are typed and documented in the code.

Copy the code exactly as it is. Do not restyle, simplify or rename anything, and keep the comments: they explain why the numbers are what they are. The only thing to adapt is import paths, if this project uses a different alias than `@/`.

--- components/halo-switch/halo-switch.tsx ---

```tsx
"use client";

/* eslint-disable react-hooks/refs, react-hooks/immutability -- these rules assume code runs while rendering; here refs, timers and setState are used in handlers, effects and animation frames, and the animation state lives in refs on purpose */

import {
  animate,
  motion,
  useMotionValue,
  useTransform,
  useVelocity,
} from "framer-motion";
import {
  type ReactNode,
  type RefObject,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useAutoplaySoundAllowed, useSoundsEnabled } from "@/lib/ui-sounds";

export type HaloSwitchProps = {
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (checked: boolean) => void;
  /** read out by screen readers */
  label?: string;
  /** the number and name in the cell's corner */
  index?: string;
  caption?: string;
  /** drop the dark cell (the switch still needs a dark background) */
  bare?: boolean;
  disabled?: boolean;
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
  cellRef: RefObject<HTMLDivElement>;
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

const TW = 100,
  TH = 52,
  KN = 42,
  GAP = (TH - KN) / 2;

/**
 * A switch whose rim lights up, from the Halo set.
 *
 * Off, a faint thin-film light hugs the knob's end of the track. Press and the pearl knob flattens into an oval; let
 * go and it slides across, still stretched by its speed, with the light travelling underneath it. When it lands the
 * light spreads out from it round both the top and the bottom of the track until the whole edge glows: gold along the
 * top, pink and violet at the knob's end, blue and cyan underneath, white at the far end, with a soft halo and the
 * colours slowly drifting. The pearl catches the same colours on its lower edge. Turn it off and the light draws back
 * after the knob to a faint arc again. A real switch: keyboard, focus ring and aria-checked work.
 */
export default function HaloSwitch({
  checked,
  defaultChecked = false,
  onChange,
  label = "Halo",
  index = "01",
  caption = "Halo Switch",
  bare = false,
  disabled = false,
  enableSound = true,
  volume = 0.6,
  autoplay = false,
  className = "",
}: HaloSwitchProps) {
  const [siteSound] = useSoundsEnabled();
  // a demo playing by itself only makes sound where the page allows it (see AutoplaySound)
  const autoplaySoundOk = useAutoplaySoundAllowed();
  const autoplayOk = useRef(autoplaySoundOk);
  useEffect(() => {
    autoplayOk.current = autoplaySoundOk;
  }, [autoplaySoundOk]);
  const sfx = useSound(enableSound && siteSound, volume, () => touched.current || autoplayOk.current);
  const [inner, setInner] = useState(defaultChecked);
  const on = checked ?? inner;
  const onRef = useRef(on);
  onRef.current = on;
  const touched = useRef(false);
  const flash = useRef(0);
  const cell = useRef<HTMLDivElement>(null);
  const btn = useRef<HTMLButtonElement>(null);
  const cv = useRef<HTMLCanvasElement>(null);
  const kick = useRef<() => void>(() => {});

  const kx = useMotionValue(on ? TW - KN - GAP : GAP);
  const vx = useVelocity(kx);
  const press = useMotionValue(0);
  const sx = useTransform(
    [vx, press],
    ([v, p]: number[]) => 1 + Math.min(0.26, Math.abs(v) / 2400) + p * 0.15,
  );
  const sy = useTransform(
    [vx, press],
    ([v, p]: number[]) => 1 - Math.min(0.1, Math.abs(v) / 6500) - p * 0.05,
  );
  const glint = useMotionValue(on ? 1 : 0);

  const setOn = (v: boolean, user: boolean) => {
    if (disabled) return;
    if (user) touched.current = true;
    if (checked === undefined) setInner(v);
    onChange?.(v);
  };

  useEffect(() => {
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const a = animate(
      kx,
      on ? TW - KN - GAP : GAP,
      reduce
        ? { duration: 0 }
        : { type: "spring", stiffness: 380, damping: 32, mass: 1 },
    );
    const b = animate(glint, on ? 1 : 0, {
      duration: reduce ? 0 : 0.45,
      delay: on ? 0.12 : 0,
    });
    if (on) flash.current = 1;
    kick.current();
    return () => {
      a.stop();
      b.stop();
    };
  }, [on, kx, glint]);

  // the rim, drawn on a canvas over the whole cell
  useEffect(() => {
    const c = cv.current,
      el = cell.current,
      b = btn.current;
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
      calm = 0;
    let p = onRef.current ? 1 : 0,
      pv = 0;
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
      // the spread: it waits for the knob a moment, then runs out round the track
      const goal = onRef.current ? 1 : 0;
      const k = kx.get();
      const arrived = onRef.current ? k > TW - KN - GAP - 8 : true;
      if (reduce) p = goal;
      else if (arrived || goal === 0)
        for (let i = 0; i < 4; i++) {
          pv +=
            ((goal - p) * (goal ? 70 : 120) - pv * (goal ? 15 : 22)) * (dt / 4);
          p += pv * (dt / 4);
        }
      flash.current = Math.max(0, flash.current - dt * 1.4);
      const ox = b.offsetLeft,
        oy = b.offsetTop;
      const kc = k + KN / 2;
      const reach = 46 + Math.max(0, p) * 96;
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      g.clearRect(0, 0, W, H);
      rim.draw(g, {
        x: ox,
        y: oy,
        w: TW,
        h: TH,
        r: TH / 2,
        t: reduce ? 0 : t,
        level: 0.34 + Math.max(0, p) * 0.66,
        mask: (_s, _L, x, y) => {
          const d = Math.hypot(x - kc, y - TH / 2);
          const e = Math.max(0, Math.min(1, (reach - d) / 30));
          return e * e * (3 - 2 * e);
        },
        hot: flash.current * 0.3,
        tight: 0.5 + p * 0.1,
        wide: 0.32 + p * 0.14 + flash.current * 0.12,
        inner: 0.1,
        width: 1.6,
      });
      calm =
        Math.abs(goal - p) < 0.001 &&
        Math.abs(pv) < 0.001 &&
        flash.current === 0 &&
        Math.abs(vx.get()) < 1
          ? calm + dt
          : 0;
      // keep drifting while it's on; rest when it's off
      raf =
        visible && !reduce && (goal === 1 || calm < 0.2)
          ? requestAnimationFrame(frame)
          : 0;
    };
    kick.current = () => {
      if (!raf && visible) {
        calm = 0;
        last = performance.now();
        raf = requestAnimationFrame(frame);
      }
    };
    const ro = new ResizeObserver(() => {
      resize();
      kick.current();
      if (reduce) frame(performance.now());
    });
    ro.observe(el);
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      kick.current();
    });
    io.observe(el);
    const un = kx.on("change", () => kick.current());
    resize();
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      un();
    };
  }, [kx, vx]);

  // autoplay: flick it now and then until someone touches it
  useEffect(() => {
    if (!autoplay) return;
    let alive = true;
    (async () => {
      await new Promise((r) => setTimeout(r, 1300));
      while (alive && !touched.current) {
        animate(press, 1, { duration: 0.12 });
        await new Promise((r) => setTimeout(r, 160));
        if (!alive || touched.current) break;
        animate(press, 0, { type: "spring", stiffness: 500, damping: 30 });
        setOn(!onRef.current, false);
        await new Promise((r) => setTimeout(r, onRef.current ? 1400 : 1700));
      }
    })();
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoplay]);

  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    if (on) {
      sfx.tick({ freq: 2600, gain: 0.08 });
      sfx.note(988, { at: 0.12, dur: 0.5, gain: 0.045, bell: 0.4 });
    } else sfx.tick({ freq: 1700, gain: 0.07 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [on]);

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
        className="pointer-events-none absolute inset-0 h-full w-full"
      />
      <div
        className="absolute inset-x-0 top-0 grid place-items-center"
        style={{ bottom: 40 }}
      >
        <button
          ref={btn}
          type="button"
          role="switch"
          aria-checked={on}
          aria-label={label}
          disabled={disabled}
          onClick={() => setOn(!on, true)}
          onPointerDown={() => animate(press, 1, { duration: 0.14 })}
          onPointerUp={() =>
            animate(press, 0, { type: "spring", stiffness: 500, damping: 30 })
          }
          onPointerLeave={() => animate(press, 0, { duration: 0.2 })}
          className="relative rounded-full outline-none focus-visible:shadow-[0_0_0_3px_#0a84ff] disabled:opacity-40"
          style={{ width: TW, height: TH }}
        >
          <span
            className="absolute inset-0 rounded-full"
            style={{
              background: "linear-gradient(180deg, #18181b 0%, #0d0d0f 100%)",
              boxShadow:
                "inset 0 1px 3px rgba(0,0,0,.85), inset 0 0 0 1px rgba(255,255,255,.06), 0 1px 0 rgba(255,255,255,.03)",
            }}
          />
          <motion.span
            className="absolute left-0 top-0"
            style={{ x: kx, y: GAP, width: KN, height: KN }}
          >
            <motion.span
              className="absolute inset-0 rounded-full"
              style={{
                scaleX: sx,
                scaleY: sy,
                background:
                  "radial-gradient(circle at 36% 28%, #ffffff 0%, #f6f6f9 26%, #dcdce4 62%, #b9b8c6 100%)",
                boxShadow:
                  "0 4px 10px rgba(0,0,0,.6), 0 1px 2px rgba(0,0,0,.5), inset 0 -2px 4px rgba(80,70,120,.22)",
              }}
            >
              {/* the rim's colours caught on the pearl */}
              <motion.span
                className="absolute inset-0 rounded-full"
                style={{
                  opacity: glint,
                  background:
                    "conic-gradient(from 60deg, rgba(255,150,190,0) 0deg, rgba(255,130,180,.85) 50deg, rgba(190,140,255,.85) 95deg, rgba(120,170,255,.75) 140deg, rgba(120,200,255,0) 190deg, rgba(255,150,190,0) 360deg)",
                  WebkitMaskImage:
                    "radial-gradient(circle at 38% 34%, transparent 46%, #000 80%)",
                  maskImage:
                    "radial-gradient(circle at 38% 34%, transparent 46%, #000 80%)",
                  mixBlendMode: "multiply",
                }}
              />
            </motion.span>
          </motion.span>
        </button>
      </div>
    </Cell>
  );
}
```

--- components/halo-switch/index.ts ---

```ts
export { default as HaloSwitch } from "./halo-switch";
export type { HaloSwitchProps } from "./halo-switch";
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
