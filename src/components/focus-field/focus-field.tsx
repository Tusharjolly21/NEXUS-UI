"use client";

/* eslint-disable react-hooks/immutability -- these rules assume code runs while rendering; here refs, timers and setState are used in handlers, effects and animation frames, and the animation state lives in refs on purpose */

import { useReducedMotion } from "framer-motion";
import { type PointerEvent as RPointerEvent, useEffect, useMemo, useRef, useState } from "react";
import { useAutoplaySoundAllowed, useSoundsEnabled } from "@/lib/ui-sounds";

export type FocusFieldProps = {
  title?: string;
  body?: string;
  /** minutes in the focus block */
  minutes?: number;
  /** what is being held back */
  held?: { id: string; label: string; icon: string }[];
  /** the field's colours, warm to cool */
  palette?: "ember" | "lagoon" | "dusk";
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

const DEFAULT_HELD = [
  {
    id: "m",
    label: "3 new emails",
    icon: "M224 48H32a8 8 0 0 0-8 8v136a16 16 0 0 0 16 16h176a16 16 0 0 0 16-16V56a8 8 0 0 0-8-8m-20.57 16L128 133.15L52.57 64ZM216 192H40V74.19l82.59 75.71a8 8 0 0 0 10.82 0L216 74.19z",
  },
  {
    id: "s",
    label: "Standup in 5 min",
    icon: "M208 32h-24v-8a8 8 0 0 0-16 0v8H88v-8a8 8 0 0 0-16 0v8H48a16 16 0 0 0-16 16v160a16 16 0 0 0 16 16h160a16 16 0 0 0 16-16V48a16 16 0 0 0-16-16M72 48v8a8 8 0 0 0 16 0v-8h80v8a8 8 0 0 0 16 0v-8h24v32H48V48Zm136 160H48V96h160z",
  },
  {
    id: "c",
    label: "Ana is calling",
    icon: "m222.37 158.46l-47.11-21.11l-.13-.06a16 16 0 0 0-15.17 1.4a8 8 0 0 0-.75.56L134.87 160c-15.42-7.49-31.34-23.29-38.83-38.51l20.78-24.71c.2-.25.39-.5.57-.77a16 16 0 0 0 1.32-15.06v-.12L97.54 33.64a16 16 0 0 0-16.62-9.52A56.26 56.26 0 0 0 32 80c0 79.4 64.6 144 144 144a56.26 56.26 0 0 0 55.88-48.92a16 16 0 0 0-9.51-16.62M176 208A128.14 128.14 0 0 1 48 80a40.2 40.2 0 0 1 34.87-40a.6.6 0 0 0 0 .12l21 47l-20.67 24.74a6 6 0 0 0-.57.77a16 16 0 0 0-1 15.7c9.06 18.53 27.73 37.06 46.46 46.11a16 16 0 0 0 15.75-1.14a8 8 0 0 0 .74-.56L168.89 152l47 21.05h.11A40.21 40.21 0 0 1 176 208",
  },
  {
    id: "p",
    label: "12 mentions",
    icon: "M128 24a104 104 0 0 0 0 208c21.51 0 44.1-6.48 60.43-17.33a8 8 0 0 0-8.86-13.33C166 210.38 146.21 216 128 216a88 88 0 1 1 88-88c0 26.45-10.88 32-20 32s-20-5.55-20-32V88a8 8 0 0 0-16 0v4.26a48 48 0 1 0 5.93 65.1c6 12 16.35 18.64 30.07 18.64c22.54 0 36-17.94 36-48A104.11 104.11 0 0 0 128 24m0 136a32 32 0 1 1 32-32a32 32 0 0 1-32 32",
  },
];
const PALETTES: Record<string, [number, number, number][]> = {
  ember: [
    [255, 236, 214],
    [255, 170, 110],
    [244, 96, 54],
    [140, 120, 255],
  ],
  lagoon: [
    [224, 247, 250],
    [120, 214, 222],
    [32, 150, 190],
    [60, 80, 220],
  ],
  dusk: [
    [246, 232, 255],
    [214, 150, 240],
    [140, 80, 220],
    [255, 140, 120],
  ],
};
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map((v) => (v + 0.5) / 16);

const W = 340;
const FH = 300; // the field's height
const CELL = 10;
const RING = 64;

function noise(x: number, y: number, t: number) {
  return (
    Math.sin(x * 0.021 + t * 0.6) * 0.5 +
    Math.sin(y * 0.026 - t * 0.45 + x * 0.008) * 0.6 +
    Math.sin((x + y) * 0.013 + t * 0.3) * 0.4 +
    Math.sin(Math.hypot(x - 170, y - 300) * 0.03 - t * 0.8) * 0.25
  );
}

/**
 * A focus-mode card on a field of coloured squares, dithered like an old print, that drifts slowly. The squares are
 * repelled by your pointer and leave a hole that follows it, and they keep clear of the focus timer in the middle,
 * which counts down. Notifications you are being shielded from float around as small pills and bounce off the
 * timer's edge, and you can bat them away with the pointer.
 */
export default function FocusField({
  title = "Hold the noise back",
  body = "Focus mode keeps calls, pings and mail at the edge until your block is over. Nothing is lost, it just waits.",
  minutes = 25,
  held = DEFAULT_HELD,
  palette = "ember",
  enableSound = true,
  volume = 0.6,
  autoplay = false,
  className = "",
}: FocusFieldProps) {
  const reduce = useReducedMotion() ?? false;
  const [siteSound] = useSoundsEnabled();
  // a demo playing by itself only makes sound where the page allows it (see AutoplaySound)
  const autoplaySoundOk = useAutoplaySoundAllowed();
  const autoplayOk = useRef(autoplaySoundOk);
  useEffect(() => {
    autoplayOk.current = autoplaySoundOk;
  }, [autoplaySoundOk]);
  const sfx = useSound(enableSound && siteSound, volume, () => touched.current || autoplayOk.current);
  const cv = useRef<HTMLCanvasElement>(null);
  const pills = useRef<(HTMLDivElement | null)[]>([]);
  const layer = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = layer.current;
    const p = el?.parentElement;
    if (!el || !p) return;
    const ro = new ResizeObserver(() => (el.style.transform = `scale(${p.clientWidth / W})`));
    ro.observe(p);
    return () => ro.disconnect();
  }, []);
  const hand = useRef({ x: -999, y: -999, on: false, r: 0 });
  const touched = useRef(false);
  const [left, setLeft] = useState(minutes * 60 - 3);
  const cols = Math.ceil(W / CELL);
  const rows = Math.ceil(FH / CELL);
  const sq = useMemo(
    () => ({
      ox: new Float32Array(cols * rows),
      oy: new Float32Array(cols * rows),
    }),
    [cols, rows],
  );
  const bodies = useMemo(
    () =>
      held.map((h, i) => ({
        x: i % 2 ? W - 70 : 70,
        y: 60 + i * 55,
        vx: (i % 2 ? -1 : 1) * (14 + i * 4),
        vy: ((i % 3) - 1) * 12 + 6,
        w: 30 + h.label.length * 6.4,
        h: 28,
      })),
    [held],
  );

  useEffect(() => {
    const id = window.setInterval(() => setLeft((s) => (s > 0 ? s - 1 : minutes * 60)), 1000);
    return () => window.clearInterval(id);
  }, [minutes]);

  useEffect(() => {
    const c = cv.current;
    const ctx = c?.getContext("2d");
    if (!c || !ctx) return;
    const dpr = Math.min(2, devicePixelRatio || 1);
    c.width = W * dpr;
    c.height = FH * dpr;
    ctx.scale(dpr, dpr);
    const pal = PALETTES[palette] ?? PALETTES.ember;
    const mix = (v: number) => {
      const t = Math.max(0, Math.min(0.999, v)) * (pal.length - 1);
      const i = Math.floor(t);
      const f = t - i;
      const a = pal[i];
      const b = pal[i + 1];
      return `rgb(${Math.round(a[0] + (b[0] - a[0]) * f)},${Math.round(a[1] + (b[1] - a[1]) * f)},${Math.round(a[2] + (b[2] - a[2]) * f)})`;
    };
    let raf = 0;
    let last = performance.now();
    const t0 = last;
    let vis = true;
    const io = new IntersectionObserver(([e]) => (vis = e.isIntersecting));
    io.observe(c);
    let lastBump = 0;
    const cx = W / 2;
    const cy = FH * 0.5;
    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      if (!vis) return;
      const dt = Math.min(0.04, (now - last) / 1000);
      last = now;
      const t = reduce ? 3 : (now - t0) / 1000;
      const h = hand.current;
      if (autoplay && !touched.current && !reduce) {
        h.on = true;
        h.x = cx + Math.cos(t * 0.8) * 120;
        h.y = cy + Math.sin(t * 1.3) * 90;
      }
      h.r += ((h.on ? 44 : 0) - h.r) * Math.min(1, dt * 6);
      ctx.clearRect(0, 0, W, FH);
      for (let j = 0; j < rows; j++) {
        for (let i = 0; i < cols; i++) {
          const k = j * cols + i;
          const x = i * CELL + CELL / 2;
          const y = j * CELL + CELL / 2;
          // density rises toward the bottom and drifts with the noise
          const v = Math.max(0, Math.min(1, (y / FH) * 1.15 + 0.02 + noise(x, y, t) * 0.2));
          // the field keeps its distance from the hand and from the timer
          let px = 0;
          let py = 0;
          let shrink = 1;
          const fields: [number, number, number][] = [[cx, cy, RING + 14]];
          if (h.r > 1) fields.push([h.x, h.y, h.r]);
          for (const [fx, fy, fr] of fields) {
            const dx = x - fx;
            const dy = y - fy;
            const d = Math.hypot(dx, dy) + 0.001;
            const reach = fr + 46;
            if (d < reach) {
              const p = 1 - d / reach;
              px += (dx / d) * p * p * 22;
              py += (dy / d) * p * p * 22;
              shrink *= Math.min(1, Math.max(0, (d - fr * 0.75) / (reach - fr * 0.75)));
            }
          }
          sq.ox[k] += (px - sq.ox[k]) * Math.min(1, dt * 10);
          sq.oy[k] += (py - sq.oy[k]) * Math.min(1, dt * 10);
          // ordered dithering decides how big each square is
          const th = BAYER[(j % 4) * 4 + (i % 4)];
          const amt = Math.max(0, Math.min(1, (v - th * 0.9) * 2.4)) * shrink;
          if (amt < 0.06) continue;
          const s = (CELL - 1.5) * Math.sqrt(amt);
          ctx.fillStyle = mix(v * 0.85 + noise(x * 1.7, y * 1.7, t * 0.7) * 0.08 + (x / W) * 0.25 * (y / FH));
          ctx.fillRect(x - s / 2 + sq.ox[k], y - s / 2 + sq.oy[k], s, s);
        }
      }
      // the held-back notifications drift and bounce off the timer and the walls
      bodies.forEach((b, i) => {
        if (!reduce) {
          b.x += b.vx * dt;
          b.y += b.vy * dt;
        }
        const hw = b.w / 2;
        const hh = b.h / 2;
        if (b.x < hw + 4 || b.x > W - hw - 4) {
          b.vx *= -1;
          b.x = Math.max(hw + 4, Math.min(W - hw - 4, b.x));
        }
        if (b.y < hh + 4 || b.y > FH - hh - 4) {
          b.vy *= -1;
          b.y = Math.max(hh + 4, Math.min(FH - hh - 4, b.y));
        }
        // the shield round the timer
        const dx = b.x - cx;
        const dy = b.y - cy;
        const d = Math.hypot(dx, dy);
        const lim = RING + 10 + Math.min(hw, 60) * 0.55;
        if (d < lim) {
          const nx = dx / d;
          const ny = dy / d;
          const dot = b.vx * nx + b.vy * ny;
          if (dot < 0) {
            b.vx -= 2 * dot * nx;
            b.vy -= 2 * dot * ny;
            if (now - lastBump > 250) {
              lastBump = now;
              sfx.tick({ freq: 1200 + i * 200, gain: 0.025 });
            }
          }
          b.x = cx + nx * lim;
          b.y = cy + ny * lim;
        }
        // the hand bats them away
        if (h.on) {
          const hx = b.x - h.x;
          const hy = b.y - h.y;
          const hd = Math.hypot(hx, hy);
          if (hd < 52) {
            b.vx += (hx / hd) * 900 * dt;
            b.vy += (hy / hd) * 900 * dt;
          }
        }
        // keep a lazy drift speed
        const sp = Math.hypot(b.vx, b.vy);
        const want = 26;
        b.vx *= 1 + (want / Math.max(sp, 1) - 1) * dt * 1.5;
        b.vy *= 1 + (want / Math.max(sp, 1) - 1) * dt * 1.5;
        const el = pills.current[i];
        if (el) el.style.transform = `translate(${(b.x - hw).toFixed(1)}px, ${(b.y - hh).toFixed(1)}px)`;
      });
    };
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [palette, reduce, autoplay, bodies, sq, cols, rows]);

  const onMove = (e: RPointerEvent<HTMLDivElement>) => {
    touched.current = true;
    const r = e.currentTarget.getBoundingClientRect();
    hand.current.x = ((e.clientX - r.left) / r.width) * W;
    hand.current.y = ((e.clientY - r.top) / r.height) * FH;
    hand.current.on = true;
  };
  const mm = String(Math.floor(left / 60)).padStart(2, "0");
  const ss = String(left % 60).padStart(2, "0");

  return (
    <div
      className={`relative w-full rounded-[24px] bg-[#f2f2f4] ${className}`}
      style={{
        padding: "36px 16px",
        display: "grid",
        gridTemplateColumns: "minmax(0, 1fr)",
        placeItems: "center",
      }}
    >
      <div
        style={{
          width: "min(100%, 340px)",
          borderRadius: 28,
          overflow: "hidden",
          background: "#fff",
          boxShadow: "0 0 0 1px rgba(0,0,0,0.05), 0 30px 60px -34px rgba(0,0,0,0.4)",
        }}
      >
        <div style={{ padding: "22px 22px 6px" }}>
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
              marginTop: 6,
              lineHeight: 1.45,
            }}
          >
            {body}
          </div>
        </div>
        <div
          onPointerMove={onMove}
          onPointerDown={onMove}
          onPointerLeave={() => (hand.current.on = false)}
          style={{
            position: "relative",
            width: "100%",
            aspectRatio: `${W} / ${FH}`,
            touchAction: "none",
            cursor: "crosshair",
          }}
        >
          <canvas
            ref={cv}
            aria-hidden="true"
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
            }}
          />
          <div style={{ position: "absolute", inset: 0 }}>
            <div
              ref={layer}
              style={{
                position: "relative",
                width: W,
                height: FH,
                transformOrigin: "0 0",
              }}
            >
              {held.map((h, i) => (
                <div
                  key={h.id}
                  ref={(el) => {
                    pills.current[i] = el;
                  }}
                  style={{
                    position: "absolute",
                    left: 0,
                    top: 0,
                    height: 28,
                    width: bodies[i]?.w,
                    borderRadius: 14,
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "0 10px",
                    background: "rgba(255,255,255,0.86)",
                    backdropFilter: "blur(10px)",
                    WebkitBackdropFilter: "blur(10px)",
                    boxShadow: "0 0 0 1px rgba(0,0,0,0.05), 0 6px 14px -8px rgba(0,0,0,0.35)",
                    fontSize: 11.5,
                    fontWeight: 600,
                    color: "#1d1d1f",
                    whiteSpace: "nowrap",
                    pointerEvents: "none",
                  }}
                >
                  <svg viewBox="0 0 256 256" width="13" height="13" aria-hidden="true" style={{ flexShrink: 0 }}>
                    <path fill="currentColor" d={h.icon} />
                  </svg>
                  {h.label}
                </div>
              ))}
            </div>
          </div>
          {/* the timer */}
          <div
            role="timer"
            aria-label={`Deep work, ${Math.floor(left / 60)} minutes ${left % 60} seconds left, ${held.length} things held back`}
            style={{
              position: "absolute",
              left: `${50 - (RING / W) * 100}%`,
              top: `${50 - (RING / FH) * 100}%`,
              width: `${((RING * 2) / W) * 100}%`,
              aspectRatio: "1",
              borderRadius: "50%",
              background: "radial-gradient(circle at 50% 35%, #fffaf5, #fff0e6 70%)",
              boxShadow:
                "0 0 0 5px rgba(255,255,255,0.7), 0 0 0 6px rgba(0,0,0,0.06), 0 18px 34px -14px rgba(120,60,20,0.45)",
              display: "grid",
              placeItems: "center",
              textAlign: "center",
            }}
          >
            <div>
              <div style={{ fontSize: 10.5, color: "#86868b", fontWeight: 500 }}>Deep work</div>
              <div
                style={{
                  fontSize: 26,
                  fontWeight: 700,
                  letterSpacing: "-0.03em",
                  color: "#1d1d1f",
                  fontVariantNumeric: "tabular-nums",
                  lineHeight: 1.1,
                }}
              >
                {mm}:{ss}
              </div>
              <div style={{ fontSize: 10.5, color: "#6e6e73" }}>
                <b style={{ color: "#1d1d1f" }}>{held.length * 3 - 1}</b> held back
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
