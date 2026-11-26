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
