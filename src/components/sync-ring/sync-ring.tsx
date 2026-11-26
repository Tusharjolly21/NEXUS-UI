"use client";

/* eslint-disable react-hooks/refs, react-hooks/purity, react-hooks/immutability -- these rules assume code runs while rendering; here refs, timers and setState are used in handlers, effects and animation frames, and the animation state lives in refs on purpose */

import { AnimatePresence, motion } from "framer-motion";
import {
  type ReactNode,
  type RefObject,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useAutoplaySoundAllowed, useSoundsEnabled } from "@/lib/ui-sounds";

export type SyncRingProps = {
  /** drive it yourself, 0 to 100; leave it out and a tap runs a demo sync */
  progress?: number;
  onSynced?: () => void;
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

const D = 204,
  RAD = D / 2;
const I = {
  check:
    "m232.49 80.49l-128 128a12 12 0 0 1-17 0l-56-56a12 12 0 1 1 17-17L96 183L215.51 63.51a12 12 0 0 1 17 17Z",
};
// the thin-film colours round the circle, clockwise from the top
const FILM_RING = [
  [255, 120, 150],
  [210, 110, 255],
  [120, 150, 255],
  [110, 200, 255],
  [230, 236, 250],
  [255, 200, 120],
  [255, 170, 110],
  [255, 120, 150],
];
function ringColour(u: number) {
  const f = (((u % 1) + 1) % 1) * (FILM_RING.length - 1);
  const i = Math.floor(f),
    t = f - i;
  const a = FILM_RING[i],
    b = FILM_RING[i + 1];
  return [
    a[0] + (b[0] - a[0]) * t,
    a[1] + (b[1] - a[1]) * t,
    a[2] + (b[2] - a[2]) * t,
  ].map((n) => n | 0);
}

/**
 * A sync button that fills its own rim with light, from the Halo set.
 *
 * At rest it is a dark glass disc with 0% and Tap to sync, and a small warm spark breathing on its top edge. Tap it and
 * the spark becomes the head of a line of thin-film light that runs clockwise round the rim as the sync goes, in the
 * uneven steps real syncs take, while the number counts up. At the end the ring closes and brightens, the number gives
 * way to a white disc with a tick, the label reads Synced, and a comet runs once round the outside and flies off. A
 * little later it settles back to 0, ready again.
 */
export default function SyncRing({
  progress,
  onSynced,
  index = "09",
  caption = "Sync Ring",
  bare = false,
  enableSound = true,
  volume = 0.6,
  autoplay = false,
  className = "",
}: SyncRingProps) {
  const [siteSound] = useSoundsEnabled();
  // a demo playing by itself only makes sound where the page allows it (see AutoplaySound)
  const autoplaySoundOk = useAutoplaySoundAllowed();
  const autoplayOk = useRef(autoplaySoundOk);
  useEffect(() => {
    autoplayOk.current = autoplaySoundOk;
  }, [autoplaySoundOk]);
  const sfx = useSound(enableSound && siteSound, volume, () => touched.current || autoplayOk.current);
  const [p, setP] = useState(0);
  const [phase, setPhase] = useState<"idle" | "sync" | "done">("idle");
  const value = progress ?? p;
  const shown = Math.round(value);
  const done = phase === "done" || (progress !== undefined && progress >= 100);
  const valRef = useRef(value);
  valRef.current = value;
  const doneRef = useRef(done);
  doneRef.current = done;
  const touched = useRef(false);
  const run = useRef(0);
  const cell = useRef<HTMLDivElement>(null);
  const disc = useRef<HTMLButtonElement>(null);
  const cv = useRef<HTMLCanvasElement>(null);
  const st = useRef({ kick: () => {}, comet: -1, flash: 0 });

  const start = async (user: boolean) => {
    if (user) touched.current = true;
    if (phase === "sync" || progress !== undefined) return;
    const me = ++run.current;
    setPhase("sync");
    setP(0);
    sfx.note(660, { dur: 0.25, gain: 0.04 });
    st.current.kick();
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    let v = 0;
    while (v < 100 && run.current === me) {
      // syncs move in uneven steps: little ones, a pause, a jump
      v = Math.min(
        100,
        v +
          (Math.random() < 0.25
            ? 12 + Math.random() * 14
            : 2 + Math.random() * 7),
      );
      setP(v);
      await new Promise((r) =>
        setTimeout(r, reduce ? 40 : 90 + Math.random() * 160),
      );
    }
    if (run.current !== me) return;
    finish();
    await new Promise((r) => setTimeout(r, 2600));
    if (run.current !== me) return;
    setPhase("idle");
    setP(0);
    st.current.kick();
  };
  const finish = () => {
    setPhase("done");
    st.current.flash = 1;
    st.current.comet = 0;
    st.current.kick();
    onSynced?.();
    sfx.note(1046, { dur: 0.5, gain: 0.05, bell: 0.6 });
    sfx.note(1568, { at: 0.1, dur: 0.7, gain: 0.04, bell: 0.6 });
  };
  useEffect(() => {
    if (progress !== undefined && progress >= 100 && phase !== "done") finish();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [progress]);

  useEffect(() => {
    const c = cv.current,
      el = cell.current,
      b = disc.current;
    if (!c || !el || !b) return;
    const g = c.getContext("2d");
    if (!g) return;
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const G = createGlow(),
      LN = createLine();
    let x = G.begin(1, 1);
    let W = 0,
      H = 0,
      dpr = 1,
      raf = 0,
      last = performance.now(),
      t = 0,
      visible = true,
      shownP = 0;
    let path: Path | null = null;
    const resize = () => {
      W = el.offsetWidth;
      H = el.offsetHeight;
      dpr = Math.min(3, window.devicePixelRatio || 1);
      c.width = W * dpr;
      c.height = H * dpr;
      const cx = b.offsetLeft + RAD,
        cy = b.offsetTop + RAD,
        R = RAD + 16;
      // once round the outside from the top, then off to the upper right
      const pts: [number, number][] = [];
      for (let i = 0; i <= 64; i++) {
        const a = -Math.PI / 2 + (i / 64) * Math.PI * 2.15;
        pts.push([cx + Math.cos(a) * R, cy + Math.sin(a) * R]);
      }
      const [lx, ly] = pts[pts.length - 1];
      pts.push([lx + 40, ly - 30], [W + 40, ly - 80]);
      path = makePath(pts, 6);
    };
    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      t += dt;
      const s = st.current;
      const goal = valRef.current / 100;
      shownP += (goal - shownP) * Math.min(1, dt * (goal < shownP ? 4 : 10));
      if (reduce) shownP = goal;
      s.flash = Math.max(0, s.flash - dt * 1.2);
      const cx = b.offsetLeft + RAD,
        cy = b.offsetTop + RAD;
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      g.clearRect(0, 0, W, H);
      x = G.begin(W, H);
      g.save();
      g.globalCompositeOperation = "lighter";
      // the arc of light, from the top clockwise
      const segs = 90;
      const full = doneRef.current ? 1 : shownP;
      const lx = LN.begin(g);
      lx.lineWidth = 1.8;
      for (let i = 0; i < segs; i++) {
        const u0 = (i / segs) * full,
          u1 = ((i + 1) / segs) * full;
        if (u1 <= 0.0005) break;
        const a0 = -Math.PI / 2 + u0 * Math.PI * 2,
          a1 = -Math.PI / 2 + u1 * Math.PI * 2 + 0.01;
        const [r, gg, bb] = ringColour(u0 + t * 0.02);
        // brighter toward the head while it runs
        const k = doneRef.current
          ? 1
          : 0.35 + 0.65 * Math.pow(u1 / Math.max(0.001, full), 1.5);
        const al = Math.min(1, k * (0.85 + s.flash * 0.3));
        lx.strokeStyle = dim([r, gg, bb], al);
        lx.beginPath();
        lx.arc(cx, cy, RAD - 1, a0, a1);
        lx.stroke();
        x.strokeStyle = `rgba(${r},${gg},${bb},${al * 0.8})`;
        x.lineWidth = 14;
        x.beginPath();
        x.arc(cx, cy, RAD - 1, a0, a1);
        x.stroke();
      }
      LN.lay(g);
      // the warm spark on top at rest, or the head of the line while it runs
      const ha = -Math.PI / 2 + full * Math.PI * 2;
      const hx = cx + Math.cos(ha) * (RAD - 1),
        hy = cy + Math.sin(ha) * (RAD - 1);
      const breathe =
        valRef.current <= 0 && !doneRef.current
          ? 0.55 + 0.25 * Math.sin(t * 2.4)
          : full < 1
            ? 0.9
            : 0;
      if (breathe > 0) {
        const hg = g.createRadialGradient(hx, hy, 0, hx, hy, 16);
        hg.addColorStop(0, `rgba(255,240,220,${breathe})`);
        hg.addColorStop(0.3, `rgba(255,180,120,${breathe * 0.45})`);
        hg.addColorStop(1, "rgba(255,150,110,0)");
        g.fillStyle = hg;
        g.fillRect(hx - 16, hy - 16, 32, 32);
      }
      G.lay(g, 7, 0.85 + s.flash * 0.3);
      g.restore();
      if (s.comet >= 0 && path) {
        s.comet += dt * 620;
        const f =
          s.comet > path.L ? Math.max(0, 1 - (s.comet - path.L) / 100) : 1;
        drawComet(g, path, Math.min(s.comet, path.L), f, 140);
        if (f <= 0) s.comet = -1;
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
  }, []);

  useEffect(() => {
    if (!autoplay) return;
    let alive = true;
    (async () => {
      await new Promise((r) => setTimeout(r, 1400));
      while (alive && !touched.current) {
        await start(false);
        await new Promise((r) => setTimeout(r, 1800));
      }
    })();
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoplay]);

  const label = done
    ? "Synced"
    : phase === "sync" || value > 0
      ? "Syncing"
      : "Tap to sync";
  return (
    <Cell
      index={index}
      caption={caption}
      bare={bare}
      height={360}
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
        style={{ bottom: 36 }}
      >
        <motion.button
          ref={disc}
          type="button"
          onClick={() => void start(true)}
          whileTap={{ scale: 0.97 }}
          aria-label={
            done
              ? "Synced"
              : phase === "sync"
                ? `Syncing, ${shown}%`
                : "Tap to sync"
          }
          className="relative grid place-items-center rounded-full outline-none focus-visible:shadow-[0_0_0_3px_#0a84ff]"
          style={{
            width: D,
            height: D,
            background:
              "radial-gradient(circle at 50% 35%, #1a1a1d 0%, #111113 60%, #0b0b0d 100%)",
            boxShadow:
              "inset 0 0 0 1px rgba(255,255,255,.05), inset 0 1px 0 rgba(255,255,255,.05), 0 30px 60px -24px rgba(0,0,0,.95)",
          }}
        >
          <span className="flex flex-col items-center">
            <span className="relative grid h-[56px] place-items-center">
              <AnimatePresence mode="popLayout" initial={false}>
                {done ? (
                  <motion.span
                    key="tick"
                    className="grid h-[52px] w-[52px] place-items-center rounded-full bg-white text-black"
                    initial={{ scale: 0.3, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.5, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 460, damping: 20 }}
                  >
                    <svg
                      viewBox="0 0 256 256"
                      width={20}
                      height={20}
                      aria-hidden="true"
                    >
                      <path fill="currentColor" d={I.check} />
                    </svg>
                  </motion.span>
                ) : (
                  <motion.span
                    key="num"
                    className="flex items-start leading-none text-white"
                    initial={{ opacity: 0, filter: "blur(4px)" }}
                    animate={{ opacity: 1, filter: "blur(0px)" }}
                    exit={{ opacity: 0, scale: 0.8, filter: "blur(4px)" }}
                  >
                    <span
                      className="text-[52px] font-light tabular-nums tracking-[-0.04em]"
                      style={{ fontFamily: SANS }}
                    >
                      {shown}
                    </span>
                    <span className="ml-0.5 mt-[30px] text-[11px] text-[#8a8a90]">
                      %
                    </span>
                  </motion.span>
                )}
              </AnimatePresence>
            </span>
            <span
              className="mt-1.5 text-[8.5px] uppercase text-[#7c7c83]"
              style={{ fontFamily: MONO, letterSpacing: "0.26em" }}
            >
              {label}
            </span>
          </span>
        </motion.button>
      </div>
    </Cell>
  );
}
