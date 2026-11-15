"use client";

/* eslint-disable react-hooks/purity, react-hooks/immutability -- these rules assume code runs while rendering; here refs, timers and setState are used in handlers, effects and animation frames, and the animation state lives in refs on purpose */

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  type KeyboardEvent as RKeyboardEvent,
  type PointerEvent as RPointerEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useAutoplaySoundAllowed, useSoundsEnabled } from "@/lib/ui-sounds";

export type GlyphShape = { name: string; path: string };
export type GlyphFlowProps = {
  /** shapes as paths in a 100 x 100 box; click cycles through them */
  shapes?: GlyphShape[];
  title?: string;
  body?: string;
  cta?: string;
  onCta?: () => void;
  /** the colour of the characters when disturbed */
  accent?: string;
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
const engine = () => (globalThis as unknown as Record<string, Engine | undefined>)[ENGINE_KEY] ?? null;
function unlockAudio() {
  const g = globalThis as unknown as Record<string, Engine | undefined>;
  const e = g[ENGINE_KEY];
  if (e) {
    if (e.ctx.state === "suspended") void e.ctx.resume();
    return;
  }
  const AC =
    window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
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

const I = {
  arrow:
    "m224.49 136.49l-72 72a12 12 0 0 1-17-17L187 140H40a12 12 0 0 1 0-24h147l-51.49-51.52a12 12 0 0 1 17-17l72 72a12 12 0 0 1-.02 17.01",
};

const DEFAULT_SHAPES: GlyphShape[] = [
  {
    name: "Bloom",
    // eight rounded petals round a centre
    path: (() => {
      let d = "";
      for (let k = 0; k < 8; k++) {
        const a = (k / 8) * Math.PI * 2;
        const cx = 50 + Math.cos(a) * 33;
        const cy = 50 + Math.sin(a) * 33;
        // each petal a long ellipse pointing outward
        const ex = Math.cos(a);
        const ey = Math.sin(a);
        d += `M ${cx + ex * 14} ${cy + ey * 14} A 14 8 ${(a * 180) / Math.PI} 1 0 ${cx - ex * 14} ${cy - ey * 14} A 14 8 ${(a * 180) / Math.PI} 1 0 ${cx + ex * 14} ${cy + ey * 14} Z `;
      }
      return d + "M 65 50 A 15 15 0 1 0 35 50 A 15 15 0 1 0 65 50 Z";
    })(),
  },
  {
    name: "Spark",
    path: "M50 4 C54 34 66 46 96 50 C66 54 54 66 50 96 C46 66 34 54 4 50 C34 46 46 34 50 4 Z",
  },
  { name: "Bolt", path: "M58 4 L18 56 H46 L38 96 L82 40 H54 Z" },
  {
    name: "Drop",
    path: "M50 4 C50 4 18 44 18 64 A32 32 0 0 0 82 64 C82 44 50 4 50 4 Z",
  },
];

const CELL_W = 7.2; // a character's box
const CELL_H = 10;

type Field = {
  hx: Float32Array;
  hy: Float32Array;
  depth: Float32Array;
  nx: Float32Array;
  ny: Float32Array;
  n: number;
};

// the shape is drawn into a mask, and every character cell inside it becomes a grain; its depth inside the shape
// picks its character
function sample(path: string, size: number): Field {
  const W = Math.ceil(size / CELL_W);
  const H = Math.ceil(size / CELL_H);
  const c = document.createElement("canvas");
  c.width = size;
  c.height = size;
  const g = c.getContext("2d", { willReadFrequently: true })!;
  g.scale(size / 100, size / 100);
  g.fill(new Path2D(path), "nonzero");
  const data = g.getImageData(0, 0, size, size).data;
  const inside = (x: number, y: number) =>
    x >= 0 && y >= 0 && x < size && y < size && data[(Math.floor(y) * size + Math.floor(x)) * 4 + 3] > 127;
  const hx: number[] = [];
  const hy: number[] = [];
  const depth: number[] = [];
  const nx: number[] = [];
  const ny: number[] = [];
  for (let j = 0; j < H; j++)
    for (let i = 0; i < W; i++) {
      const x = (i + 0.5) * CELL_W;
      const y = (j + 0.5) * CELL_H;
      if (!inside(x, y)) continue;
      // distance to the edge, searched outward in rings
      let dd = 0;
      for (let r = 1; r <= 7; r++) {
        let out = false;
        for (let k = 0; k < 8; k++) {
          const a = (k / 8) * Math.PI * 2;
          if (!inside(x + Math.cos(a) * r * 4, y + Math.sin(a) * r * 4)) out = true;
        }
        if (out) break;
        dd = r;
      }
      // which way is out: the gradient of the mask
      const gx = (inside(x + 6, y) ? 1 : 0) - (inside(x - 6, y) ? 1 : 0);
      const gy = (inside(x, y + 6) ? 1 : 0) - (inside(x, y - 6) ? 1 : 0);
      hx.push(x);
      hy.push(y);
      depth.push(dd);
      nx.push(-gx);
      ny.push(-gy);
    }
  // ordered round the centre, so morphing between shapes swirls rather than criss-crosses
  const idx = hx
    .map((_, k) => k)
    .sort((a, b) => Math.atan2(hy[a] - size / 2, hx[a] - size / 2) - Math.atan2(hy[b] - size / 2, hx[b] - size / 2));
  const pick = (arr: number[]) => Float32Array.from(idx.map((k) => arr[k]));
  return {
    hx: pick(hx),
    hy: pick(hy),
    depth: pick(depth),
    nx: pick(nx),
    ny: pick(ny),
    n: hx.length,
  };
}

const DEEP = ["■", "■", "▪", "■"];
const MID = ["1", "0", "1", "0", "1", "0", "#", "%"];
const EDGE_H = ["_", "‾", "—"];
const EDGE_V = ["|", "/", "\\"];

/**
 * A feature card whose picture is made of characters: solid blocks deep inside the shape, ones and zeros through
 * it and dashes and slashes round its edge, following the outline. Ripples run out through it like rings on water,
 * changing the characters as they pass. Move the pointer in and it parts around you and closes behind, the
 * disturbed characters stretching into streaks and taking the accent colour; click and every character swirls into
 * the next shape.
 */
export default function GlyphFlow({
  shapes = DEFAULT_SHAPES,
  title = "Built from every byte",
  body = "Point at it and it parts like water. Click to change its shape.",
  cta = "See how it works",
  onCta,
  accent = "#3b5bff",
  enableSound = true,
  volume = 0.6,
  autoplay = false,
  className = "",
}: GlyphFlowProps) {
  const reduce = useReducedMotion() ?? false;
  const [siteSound] = useSoundsEnabled();
  // a demo playing by itself only makes sound where the page allows it (see AutoplaySound)
  const autoplaySoundOk = useAutoplaySoundAllowed();
  const autoplayOk = useRef(autoplaySoundOk);
  useEffect(() => {
    autoplayOk.current = autoplaySoundOk;
  }, [autoplaySoundOk]);
  const sfx = useSound(enableSound && siteSound, volume, () => touched.current || autoplayOk.current);
  const SIZE = 300;
  const fields = useMemo(
    () => (typeof document === "undefined" ? [] : shapes.map((s) => sample(s.path, SIZE))),
    [shapes],
  );
  const [shape, setShape] = useState(0);
  const shapeRef = useRef(0);
  const cv = useRef<HTMLCanvasElement>(null);
  const hand = useRef({ x: -999, y: -999, vx: 0, vy: 0, on: false });
  const touched = useRef(false);
  const ripples = useRef<{ x: number; y: number; t: number }[]>([]);
  const clock = useRef(0);

  // one pool of grains, enough for the largest shape
  const pool = useMemo(() => {
    const P = Math.max(1, ...fields.map((f) => f.n));
    return {
      P,
      x: new Float32Array(P),
      y: new Float32Array(P),
      vx: new Float32Array(P),
      vy: new Float32Array(P),
      a: new Float32Array(P),
      seed: Float32Array.from({ length: P }, () => Math.random()),
    };
  }, [fields]);

  useEffect(() => {
    const f = fields[0];
    if (!f) return;
    for (let i = 0; i < pool.P; i++) {
      const k = i % Math.max(1, f.n);
      pool.x[i] = f.hx[k];
      pool.y[i] = f.hy[k];
      pool.a[i] = i < f.n ? 1 : 0;
    }
  }, [fields, pool]);

  useEffect(() => {
    const c = cv.current;
    const ctx = c?.getContext("2d");
    if (!c || !ctx) return;
    const dpr = Math.min(2, devicePixelRatio || 1);
    c.width = SIZE * dpr;
    c.height = SIZE * dpr;
    ctx.scale(dpr, dpr);
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    let raf = 0;
    let last = performance.now();
    const t0 = last;
    let vis = true;
    const io = new IntersectionObserver(([e]) => (vis = e.isIntersecting));
    io.observe(c);
    const deep = "#16171b";
    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      if (!vis) return;
      const dt = Math.min(0.033, (now - last) / 1000);
      last = now;
      const t = (now - t0) / 1000;
      clock.current = t;
      const f = fields[shapeRef.current];
      if (!f) return;
      const h = hand.current;
      if (autoplay && !touched.current && !reduce) {
        h.on = true;
        const k = t * 0.7;
        const nx = SIZE / 2 + Math.cos(k) * 95 + Math.sin(k * 2.3) * 20;
        const ny = SIZE / 2 + Math.sin(k * 1.3) * 90;
        h.vx = (nx - h.x) / Math.max(dt, 1e-3);
        h.vy = (ny - h.y) / Math.max(dt, 1e-3);
        h.x = nx;
        h.y = ny;
      }
      // an idle ripple every few seconds from the middle
      if (!reduce && (ripples.current.length === 0 || t - ripples.current[ripples.current.length - 1].t > 2.6))
        ripples.current.push({ x: SIZE / 2, y: SIZE / 2, t });
      ripples.current = ripples.current.filter((r) => t - r.t < 2.4);
      ctx.clearRect(0, 0, SIZE, SIZE);
      ctx.font = "600 10px ui-monospace, 'SF Mono', Menlo, Consolas, monospace";
      const R = 64;
      for (let i = 0; i < pool.P; i++) {
        const live = i < f.n;
        const k = live ? i : i % f.n;
        const hx = f.hx[k];
        const hy = f.hy[k];
        // springs home, pushed away by the hand
        let fx = (hx - pool.x[i]) * 60;
        let fy = (hy - pool.y[i]) * 60;
        if (h.on) {
          const dx = pool.x[i] - h.x;
          const dy = pool.y[i] - h.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < R * R) {
            const d = Math.sqrt(d2) + 0.01;
            const s = (1 - d / R) * (1 - d / R) * 5200;
            fx += (dx / d) * s + h.vx * 0.9 * (1 - d / R);
            fy += (dy / d) * s + h.vy * 0.9 * (1 - d / R);
          }
        }
        pool.vx[i] = (pool.vx[i] + fx * dt) * Math.pow(0.0015, dt);
        pool.vy[i] = (pool.vy[i] + fy * dt) * Math.pow(0.0015, dt);
        if (reduce) {
          pool.x[i] = hx;
          pool.y[i] = hy;
        } else {
          pool.x[i] += pool.vx[i] * dt;
          pool.y[i] += pool.vy[i] * dt;
        }
        pool.a[i] += ((live ? 1 : 0) - pool.a[i]) * Math.min(1, dt * 4);
        if (pool.a[i] < 0.02) continue;
        // ripples lift the characters as the ring passes
        let wave = 0;
        for (const r of ripples.current) {
          const rd = Math.hypot(hx - r.x, hy - r.y);
          const front = (t - r.t) * 110;
          wave += Math.exp(-((rd - front) * (rd - front)) / 120) * (1 - (t - r.t) / 2.4);
        }
        const sp = Math.hypot(pool.vx[i], pool.vy[i]);
        const dpt = f.depth[k];
        let ch: string;
        if (sp > 140) ch = Math.abs(pool.vx[i]) > Math.abs(pool.vy[i]) ? "—" : "|";
        else if (wave > 0.45) ch = dpt >= 2 ? "■" : "#";
        else if (dpt >= 3) ch = DEEP[(i + Math.floor(t * 0.5 + pool.seed[i] * 4)) % DEEP.length];
        else if (dpt >= 1) ch = MID[(i * 7 + Math.floor(t * 1.4 + pool.seed[i] * 8)) % MID.length];
        else
          ch =
            Math.abs(f.nx[k]) > Math.abs(f.ny[k])
              ? EDGE_V[(i + Math.floor(t)) % EDGE_V.length]
              : EDGE_H[(i + Math.floor(t)) % EDGE_H.length];
        const hot = Math.min(1, sp / 260 + wave * 0.4);
        ctx.globalAlpha = pool.a[i] * (0.55 + 0.45 * Math.min(1, dpt / 3 + 0.35) + wave * 0.2);
        ctx.fillStyle = hot > 0.25 ? accent : deep;
        ctx.fillText(ch, pool.x[i], pool.y[i] - wave * 3);
      }
      ctx.globalAlpha = 1;
      h.vx *= 0.85;
      h.vy *= 0.85;
    };
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
    };
  }, [fields, pool, autoplay, reduce, accent]);

  const next = () => {
    const n = (shapeRef.current + 1) % shapes.length;
    shapeRef.current = n;
    setShape(n);
    // throw everything outward a little so the swirl into the new shape reads
    for (let i = 0; i < pool.P; i++) {
      pool.vx[i] += (pool.x[i] - SIZE / 2) * 3 + (Math.random() - 0.5) * 60;
      pool.vy[i] += (pool.y[i] - SIZE / 2) * 3 + (Math.random() - 0.5) * 60;
    }
    ripples.current.push({
      x: hand.current.on ? hand.current.x : SIZE / 2,
      y: hand.current.on ? hand.current.y : SIZE / 2,
      t: clock.current,
    });
    sfx.whoosh(400, 2200, { dur: 0.5, gain: 0.05 });
    sfx.note(523 + n * 60, { at: 0.2, dur: 0.4, gain: 0.04, bell: 0.6 });
  };

  useEffect(() => {
    if (!autoplay || reduce) return;
    const id = window.setInterval(() => {
      if (touched.current) return window.clearInterval(id);
      next();
    }, 4200);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoplay, reduce]);

  const local = (e: { clientX: number; clientY: number }) => {
    const r = cv.current?.getBoundingClientRect();
    return r
      ? {
          x: ((e.clientX - r.left) / r.width) * SIZE,
          y: ((e.clientY - r.top) / r.height) * SIZE,
        }
      : { x: -999, y: -999 };
  };
  const lastMove = useRef(0);
  const onMove = (e: RPointerEvent<HTMLDivElement>) => {
    touched.current = true;
    const p = local(e);
    const h = hand.current;
    const now = performance.now();
    const dt = Math.max(0.008, (now - lastMove.current) / 1000);
    lastMove.current = now;
    if (h.on) {
      h.vx = h.vx * 0.5 + ((p.x - h.x) / dt) * 0.5;
      h.vy = h.vy * 0.5 + ((p.y - h.y) / dt) * 0.5;
    }
    h.x = p.x;
    h.y = p.y;
    h.on = true;
  };
  const onKey = (e: RKeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      touched.current = true;
      next();
    }
  };

  return (
    <div
      className={`relative w-full rounded-[24px] bg-[#f5f5f7] ${className}`}
      style={{
        padding: "36px 16px",
        display: "grid",
        gridTemplateColumns: "minmax(0, 1fr)",
        placeItems: "center",
      }}
    >
      <div
        style={{
          width: "min(100%, 360px)",
          background: "#fff",
          borderRadius: 28,
          padding: "18px 18px 20px",
          boxShadow: "0 0 0 1px rgba(0,0,0,0.05), 0 30px 60px -36px rgba(0,0,0,0.4)",
        }}
      >
        <div
          role="button"
          tabIndex={0}
          aria-label={`${shapes[shape]?.name} drawn in characters. Press to change the shape.`}
          onPointerMove={onMove}
          onPointerDown={(e) => {
            onMove(e);
          }}
          onPointerUp={() => next()}
          onPointerLeave={() => (hand.current.on = false)}
          onKeyDown={onKey}
          className="outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] rounded-2xl"
          style={{
            position: "relative",
            width: "100%",
            aspectRatio: "1",
            cursor: "crosshair",
            touchAction: "none",
          }}
        >
          <canvas ref={cv} aria-hidden="true" style={{ width: "100%", height: "100%", display: "block" }} />
          <div
            style={{
              position: "absolute",
              right: 4,
              top: 2,
              fontSize: 11,
              color: "#86868b",
              overflow: "hidden",
            }}
          >
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span
                key={shape}
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -10, opacity: 0 }}
                style={{ display: "block", fontVariantNumeric: "tabular-nums" }}
              >
                {shapes[shape]?.name}
              </motion.span>
            </AnimatePresence>
          </div>
        </div>
        <div style={{ textAlign: "center", marginTop: 6 }}>
          <div
            style={{
              fontSize: 19,
              fontWeight: 600,
              letterSpacing: "-0.02em",
              color: "#1d1d1f",
            }}
          >
            {title}
          </div>
          <div
            style={{
              fontSize: 13.5,
              color: "#6e6e73",
              marginTop: 4,
              lineHeight: 1.45,
            }}
          >
            {body}
          </div>
        </div>
        <motion.button
          type="button"
          onClick={onCta}
          whileTap={{ scale: 0.98 }}
          className="outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3]"
          style={{
            marginTop: 16,
            width: "100%",
            height: 46,
            borderRadius: 23,
            border: 0,
            background: "#f2f2f5",
            color: "#1d1d1f",
            fontSize: 14.5,
            fontWeight: 600,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            cursor: "pointer",
          }}
        >
          {cta}
          <svg viewBox="0 0 256 256" width="14" height="14" aria-hidden="true">
            <path fill="currentColor" d={I.arrow} />
          </svg>
        </motion.button>
      </div>
    </div>
  );
}
