# Liquid Funnel

Add the "Liquid Funnel" component from Nexus UI to my project.

A conversion funnel as liquid in a glass tube, narrowing at every stage: a meniscus, caustics rippling near the bottom, bubbles, a sheen, the glass's highlights and rim. Where it narrows, the people who left gather as drops on the underside, hang, let go, and splash on the floor with a crown and ripples, more where more were lost. Point at a stage to count what it lost; change the period and the tube reshapes.

Please:

1. Create the files below at sensible paths for this project, keeping each file's name. They import each other with relative paths, so keep them together.
2. Install what it needs: `framer-motion` (use this project's package manager).
3. It is styled with Tailwind CSS classes, so the project needs Tailwind.
4. It uses `@/lib/ui-sounds` for its interaction sounds, which are synthesised in the browser, so no audio files are needed. Create it at lib/ from the file below.
5. Use it like this: `import { LiquidFunnel } from "@/components/liquid-funnel";`. The props are typed and documented in the code.

Copy the code exactly as it is. Do not restyle, simplify or rename anything, and keep the comments: they explain why the numbers are what they are. The only thing to adapt is import paths, if this project uses a different alias than `@/`.

--- components/liquid-funnel/index.ts ---

```ts
export { default as LiquidFunnel } from "./liquid-funnel";
export type { LiquidFunnelProps } from "./liquid-funnel";
```

--- components/liquid-funnel/liquid-funnel.tsx ---

```tsx
"use client";

/* eslint-disable react-hooks/refs, react-hooks/immutability, react-hooks/set-state-in-effect -- these rules assume code runs while rendering; here refs, timers and setState are used in handlers, effects and animation frames, and the animation state lives in refs on purpose */

import { AnimatePresence, animate, motion, useInView, useReducedMotion } from "framer-motion";
import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useAutoplaySoundAllowed, useSoundsEnabled } from "@/lib/ui-sounds";

export type FunnelStage = { label: string; color: string };
export type FunnelPeriod = { label: string; values: number[]; delta?: number };
export type LiquidFunnelProps = {
  title?: string;
  stages?: FunnelStage[];
  periods?: FunnelPeriod[];
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

const STAGES: FunnelStage[] = [
  { label: "Link opened", color: "#0a84ff" },
  { label: "Started", color: "#5e5ce6" },
  { label: "Completed", color: "#bf5af2" },
  { label: "Converted", color: "#ff375f" },
];
const PERIODS: FunnelPeriod[] = [
  { label: "7 days", values: [197, 118, 77, 38], delta: 5.2 },
  { label: "30 days", values: [842, 431, 312, 121], delta: 12.8 },
  { label: "90 days", values: [2310, 1402, 806, 402], delta: -2.4 },
];

const hexRgb = (hex: string) => {
  const n = parseInt(hex.replace("#", ""), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};
const rgba = (hex: string, a: number) => {
  const [r, g, b] = hexRgb(hex);
  return `rgba(${r},${g},${b},${a})`;
};
const ss = (t: number) => (t <= 0 ? 0 : t >= 1 ? 1 : t * t * (3 - 2 * t));
const pct = (v: number) => `${Math.round(v * 100)}%`;

/**
 * A conversion funnel as liquid poured through it.
 *
 * Each stage is a length of tube as thick as the people who reached it, the liquid narrowing smoothly into the next.
 * It flows: streamlines slide along it, bubbles drift through, light catches its upper surface. Where it narrows,
 * the people who left fall away as drops from the underside and splash below, more drops where more were lost.
 * Point at a stage (or tab to its tile) to lift it: the rest dims, the headline reads that stage, and the drops it
 * shed are counted where they land. Change the period and the tube reshapes on springs while every number rolls.
 *   <LiquidFunnel periods={periods} />
 */
export default function LiquidFunnel({
  title = "Sign-up funnel",
  stages = STAGES,
  periods = PERIODS,
  enableSound = true,
  volume = 0.8,
  autoplay = false,
  className = "",
}: LiquidFunnelProps) {
  const reduce = !!useReducedMotion();
  const [siteSound] = useSoundsEnabled();
  // a demo playing by itself only makes sound where the page allows it (see AutoplaySound)
  const autoplaySoundOk = useAutoplaySoundAllowed();
  const autoplayOk = useRef(autoplaySoundOk);
  useEffect(() => {
    autoplayOk.current = autoplaySoundOk;
  }, [autoplaySoundOk]);
  const sfx = useSound(enableSound && siteSound, volume, () => touched.current || autoplayOk.current);
  const uid = useId().replace(/:/g, "");
  const rootRef = useRef<HTMLDivElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const cvRef = useRef<HTMLCanvasElement>(null);
  const inView = useInView(rootRef, { margin: "100px" });
  const seen = useInView(rootRef, { once: true, amount: 0.3 });
  const touched = useRef(false);
  const [period, setPeriod] = useState(0);
  const [focus, setFocus] = useState<number | null>(null);
  const [w, setW] = useState(700);
  const values = periods[period].values;
  const n = stages.length;

  useLayoutEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setW(el.getBoundingClientRect().width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const narrow = w < 560;
  const H = narrow ? 180 : 230;

  // the drawn thickness of each stage eases toward its share of the first
  const shares = useMemo(() => values.map((v) => Math.max(0.1, v / values[0])), [values]);
  const live = useRef({
    shares: shares.map(() => 0),
    focus: null as number | null,
    fill: 0,
  });
  useEffect(() => {
    const from = live.current.shares.slice();
    if (reduce) {
      live.current.shares = shares.slice();
      return;
    }
    const a = animate(0, 1, {
      type: "spring",
      stiffness: 110,
      damping: 16,
      onUpdate: (t) => {
        live.current.shares = from.map((f, i) => f + (shares[i] - f) * t);
      },
    });
    return () => a.stop();
  }, [shares, reduce]);
  // pouring in, the first time it's seen
  useEffect(() => {
    if (!seen) return;
    if (reduce) {
      live.current.fill = 1;
      return;
    }
    const a = animate(0, 1, {
      duration: 1.4,
      ease: [0.45, 0, 0.2, 1],
      onUpdate: (v) => (live.current.fill = v),
    });
    return () => a.stop();
  }, [seen, reduce]);
  live.current.focus = focus;

  const stagesRef = useRef(stages);
  stagesRef.current = stages;
  const lostRef = useRef<number[]>([]);
  lostRef.current = values.map((v, i) => (i < n - 1 ? v - values[i + 1] : 0));

  // ------------------------------------------------------------ the liquid, in its glass
  useEffect(() => {
    const cv = cvRef.current;
    if (!cv || !inView) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    type Drip = {
      x: number;
      y: number;
      vy: number;
      vx: number;
      r: number;
      stage: number;
      phase: 0 | 1 | 2;
      grow: number;
      t: number;
    };
    type Bead = {
      x: number;
      y: number;
      vx: number;
      vy: number;
      r: number;
      stage: number;
      life: number;
    };
    const drips: Drip[] = [];
    const beads: Bead[] = [];
    const rings: { x: number; t: number; stage: number; s: number }[] = [];
    const bubbles = Array.from({ length: 40 }, () => ({
      u: Math.random(),
      lane: Math.random() * 1.5 - 0.75,
      r: 0.7 + Math.random() * 1.9,
      sp: 0.025 + Math.random() * 0.05,
      wob: Math.random() * 6,
    }));
    const spawnAcc = new Array(8).fill(0);
    let raf = 0;
    let last = performance.now();
    const shadeCol = document.createElement("canvas");
    shadeCol.width = 1;
    shadeCol.height = 256;
    {
      const g = shadeCol.getContext("2d")!;
      const lg = g.createLinearGradient(0, 0, 0, 256);
      lg.addColorStop(0, "rgba(255,255,255,0.45)");
      lg.addColorStop(0.07, "rgba(255,255,255,0.3)");
      lg.addColorStop(0.2, "rgba(255,255,255,0.05)");
      lg.addColorStop(0.5, "rgba(0,0,20,0.13)");
      lg.addColorStop(0.76, "rgba(255,255,255,0)");
      lg.addColorStop(0.9, "rgba(255,255,255,0.24)");
      lg.addColorStop(1, "rgba(0,0,30,0.32)");
      g.fillStyle = lg;
      g.fillRect(0, 0, 1, 256);
    }
    const poly = (pts: [number, number][]) => {
      ctx.beginPath();
      pts.forEach(([x, y], k) => (k ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
    };
    const draw = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const W = cv.clientWidth;
      const Hc = cv.clientHeight;
      if (cv.width !== Math.round(W * dpr) || cv.height !== Math.round(Hc * dpr)) {
        cv.width = Math.round(W * dpr);
        cv.height = Math.round(Hc * dpr);
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, Hc);
      const st = stagesRef.current;
      const { shares: sh, focus: fo, fill } = live.current;
      const N = st.length;
      const X0 = 10;
      const X1 = W - 10;
      const stageW = (X1 - X0) / N;
      const cy = Hc * 0.4;
      const maxH = Hc * 0.33;
      const wall = Math.max(4, Hc * 0.024);
      const neck = stageW * 0.34;
      const floor = Hc - 8;
      const half = (x: number) => {
        const u = Math.max(0, Math.min(X1 - X0 - 0.001, x - X0));
        const i = Math.min(N - 1, Math.floor(u / stageW));
        const local = u - i * stageW;
        if (i > 0 && local < neck) return (sh[i - 1] + (sh[i] - sh[i - 1]) * ss(local / neck)) * maxH;
        return sh[i] * maxH;
      };
      const stageAt = (x: number) => Math.max(0, Math.min(N - 1, Math.floor((x - X0) / stageW)));
      const t = now / 1000;
      const pourX = X0 + (X1 - X0) * fill;
      const step = 3;

      // ---- the shadow the tube casts on the floor, a soft pool under each stage
      for (let i = 0; i < N; i++) {
        const cx = X0 + (i + 0.5) * stageW;
        const rw = stageW * 0.62;
        const g = ctx.createRadialGradient(cx, floor, 0, cx, floor, rw);
        g.addColorStop(0, `rgba(16,24,60,${0.1 * (0.5 + sh[i])})`);
        g.addColorStop(1, "rgba(16,24,60,0)");
        ctx.save();
        ctx.scale(1, 0.12);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(cx, floor / 0.12, rw, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // ---- the glass tube: its outline, with rounded ends
      const gTop: [number, number][] = [];
      const gBot: [number, number][] = [];
      for (let x = X0; x <= X1 + 0.1; x += step) {
        const g = half(x) + wall;
        gTop.push([x, cy - g]);
        gBot.push([x, cy + g]);
      }
      const glass = new Path2D();
      glass.moveTo(gTop[0][0], gTop[0][1]);
      for (const [x, y] of gTop) glass.lineTo(x, y);
      const gr1 = (gBot[gBot.length - 1][1] - gTop[gTop.length - 1][1]) / 2;
      glass.ellipse(X1, cy, Math.min(8, gr1 * 0.4), gr1, 0, -Math.PI / 2, Math.PI / 2);
      for (let k = gBot.length - 1; k >= 0; k--) glass.lineTo(gBot[k][0], gBot[k][1]);
      const gr0 = (gBot[0][1] - gTop[0][1]) / 2;
      glass.ellipse(X0, cy, Math.min(8, gr0 * 0.4), gr0, 0, Math.PI / 2, Math.PI * 1.5);
      glass.closePath();
      ctx.fillStyle = "rgba(235,240,250,0.55)";
      ctx.fill(glass);

      // ---- the liquid
      const top: [number, number][] = [];
      const bot: [number, number][] = [];
      for (let x = X0; x <= pourX + 0.1; x += step) {
        const hx = Math.max(1, half(x));
        const wv = reduce ? 0 : Math.sin(x * 0.045 - t * 3.2) * 0.8 + Math.sin(x * 0.11 + t * 2.1) * 0.45;
        top.push([x, cy - hx + wv]);
        bot.push([x, cy + hx]);
      }
      if (top.length >= 2) {
        const liq = new Path2D();
        liq.moveTo(top[0][0], top[0][1]);
        for (const [x, y] of top) liq.lineTo(x, y);
        const lx = top[top.length - 1][0];
        const lh = (bot[bot.length - 1][1] - top[top.length - 1][1]) / 2;
        if (fill < 1) liq.ellipse(lx, cy, Math.min(lh, 16), lh, 0, -Math.PI / 2, Math.PI / 2);
        else liq.ellipse(X1, cy, Math.min(7, lh * 0.38), lh, 0, -Math.PI / 2, Math.PI / 2);
        for (let k = bot.length - 1; k >= 0; k--) liq.lineTo(bot[k][0], bot[k][1]);
        liq.ellipse(
          X0,
          cy,
          Math.min(7, ((bot[0][1] - top[0][1]) / 2) * 0.38),
          (bot[0][1] - top[0][1]) / 2,
          0,
          Math.PI / 2,
          Math.PI * 1.5,
        );
        liq.closePath();
        const grad = ctx.createLinearGradient(X0, 0, X1, 0);
        st.forEach((s, i) => {
          const dim = fo != null && fo !== i ? 0.28 : 1;
          grad.addColorStop(Math.min(1, (i * stageW + (i === 0 ? 0 : neck * 0.5)) / (X1 - X0)), rgba(s.color, dim));
          grad.addColorStop(Math.min(1, ((i + 1) * stageW - 1) / (X1 - X0)), rgba(s.color, dim));
        });
        ctx.fillStyle = grad;
        ctx.fill(liq);
        ctx.save();
        ctx.clip(liq);
        // shade it as a round body of liquid, strip by strip, each against its own height:
        // a reflection under the top surface, a deeper middle, and light gathered near the bottom
        // (one column of the profile, stretched to each pixel column's height, so there are no seams)
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        const p0 = Math.floor(X0 * dpr);
        const p1 = Math.ceil(pourX * dpr);
        // one column per CSS pixel: whole device pixels wide, so neighbours meet exactly
        const cw = Math.max(1, Math.round(dpr));
        for (let px = p0; px <= p1; px += cw) {
          const hx = half(px / dpr);
          ctx.drawImage(shadeCol, px, (cy - hx - 1) * dpr, cw, (hx * 2 + 2) * dpr);
        }
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        // caustics: rippling threads of light near the bottom, drifting with the flow
        ctx.globalCompositeOperation = "lighter";
        for (let l = 0; l < 3; l++) {
          ctx.beginPath();
          for (let x = X0; x <= pourX; x += 4) {
            const hx = half(x);
            const lane = 0.55 + l * 0.11 + Math.sin(x * (0.05 + l * 0.02) - t * (1.6 + l * 0.4) + l * 2) * 0.06;
            const y = cy + hx * lane;
            if (x === X0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.strokeStyle = `rgba(255,255,255,${0.1 - l * 0.02})`;
          ctx.lineWidth = 1.6 - l * 0.3;
          ctx.stroke();
        }
        ctx.globalCompositeOperation = "source-over";
        // the flow, faint
        ctx.lineCap = "round";
        for (let l = -1; l <= 1; l++) {
          ctx.beginPath();
          for (let x = X0; x <= pourX; x += step) {
            const y = cy + half(x) * l * 0.35;
            if (x === X0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.setLineDash([22, 34]);
          ctx.lineDashOffset = reduce ? 0 : -t * (48 - Math.abs(l) * 8);
          ctx.strokeStyle = "rgba(255,255,255,0.13)";
          ctx.lineWidth = 1.2;
          ctx.stroke();
        }
        ctx.setLineDash([]);
        // bubbles rising a little as they drift
        for (const b of bubbles) {
          if (!reduce) b.u = (b.u + b.sp * dt * (0.6 + 0.4 * Math.sin(t + b.wob))) % 1;
          const x = X0 + b.u * (X1 - X0);
          if (x > pourX) continue;
          const y = cy + half(x) * (b.lane - b.u * 0.12 + Math.sin(t * 2 + b.wob) * 0.05);
          const bg = ctx.createRadialGradient(x - b.r * 0.3, y - b.r * 0.35, 0, x, y, b.r);
          bg.addColorStop(0, "rgba(255,255,255,0.9)");
          bg.addColorStop(0.5, "rgba(255,255,255,0.15)");
          bg.addColorStop(0.85, "rgba(255,255,255,0.05)");
          bg.addColorStop(1, "rgba(255,255,255,0.55)");
          ctx.fillStyle = bg;
          ctx.beginPath();
          ctx.arc(x, y, b.r, 0, Math.PI * 2);
          ctx.fill();
        }
        // a moving sheen
        if (!reduce) {
          const sx = X0 + ((t * 0.16) % 1.5) * (X1 - X0) - (X1 - X0) * 0.25;
          const sg = ctx.createLinearGradient(sx - 70, 0, sx + 70, 0);
          sg.addColorStop(0, "rgba(255,255,255,0)");
          sg.addColorStop(0.5, "rgba(255,255,255,.16)");
          sg.addColorStop(1, "rgba(255,255,255,0)");
          ctx.fillStyle = sg;
          ctx.fillRect(sx - 70, 0, 140, Hc);
        }
        ctx.restore();
        // the meniscus: a bright line where the surface meets the glass
        poly(top.map(([x, y]) => [x, y + 0.8] as [number, number]));
        ctx.strokeStyle = "rgba(255,255,255,0.8)";
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // ---- the front of the glass: a hairline edge, a sharp highlight along the top, a window reflection, a lit lower rim
      ctx.strokeStyle = "rgba(20,30,70,0.18)";
      ctx.lineWidth = 0.8;
      ctx.stroke(glass);
      poly(gTop.map(([x, y]) => [x, y + wall * 0.45] as [number, number]));
      ctx.strokeStyle = "rgba(255,255,255,0.95)";
      ctx.lineWidth = 1.3;
      ctx.stroke();
      poly(gTop.map(([x, y]) => [x, y + (half(x) + wall) * 0.38] as [number, number]));
      ctx.strokeStyle = "rgba(255,255,255,0.16)";
      ctx.lineWidth = Math.max(3, maxH * 0.12);
      ctx.lineCap = "round";
      ctx.stroke();
      poly(gBot.map(([x, y]) => [x, y - wall * 0.5] as [number, number]));
      ctx.strokeStyle = "rgba(255,255,255,0.55)";
      ctx.lineWidth = 0.9;
      ctx.stroke();

      // ---- the people who left: drops that gather on the underside at each neck, hang, let go, fall and splash
      const lost = lostRef.current;
      const lostSum = Math.max(
        1,
        lost.reduce((a, b) => a + b, 0),
      );
      if (!reduce && fill > 0.98) {
        for (let i = 0; i < N - 1; i++) {
          const rate = Math.min(4, 0.6 + (lost[i] / lostSum) * 5);
          spawnAcc[i] += dt * rate;
          if (spawnAcc[i] > 1 && drips.filter((d) => d.stage === i && d.phase === 0).length < 2) {
            spawnAcc[i] = 0;
            const x0 = X0 + (i + 1) * stageW + neck * (0.15 + Math.random() * 0.7);
            drips.push({
              x: x0,
              y: 0,
              vy: 0,
              vx: 0,
              r: 2.6 + Math.random() * 1.8,
              stage: i,
              phase: 0,
              grow: 0,
              t: 0,
            });
          }
        }
      }
      for (let k = drips.length - 1; k >= 0; k--) {
        const d = drips[k];
        const col = st[d.stage]?.color ?? "#999";
        const dim = fo != null && fo !== d.stage ? 0.25 : 1;
        const surf = cy + half(d.x) + wall;
        if (d.phase === 0) {
          d.grow = Math.min(1, d.grow + dt * (0.9 + d.r * 0.08));
          d.y = surf + d.r * 1.3 * d.grow;
          if (d.grow >= 1) {
            d.phase = 1;
            d.vx = 4 + Math.random() * 6;
          }
        } else if (d.phase === 1) {
          d.vy += 560 * dt;
          d.y += d.vy * dt;
          d.x += d.vx * dt;
          if (d.y + d.r >= floor) {
            d.phase = 2;
            d.t = 0;
            rings.push({ x: d.x, t: 0, stage: d.stage, s: d.r });
            const n = 4 + Math.floor(Math.random() * 3);
            for (let j = 0; j < n; j++) {
              const a = Math.PI * (0.15 + 0.7 * (j / (n - 1)));
              const sp = 40 + Math.random() * 50;
              beads.push({
                x: d.x,
                y: floor - 1,
                vx: -Math.cos(a) * sp,
                vy: -Math.sin(a) * sp * 1.3,
                r: 0.7 + Math.random() * 0.9,
                stage: d.stage,
                life: 0,
              });
            }
            drips.splice(k, 1);
            continue;
          }
        }
        ctx.globalAlpha = dim;
        const r = d.r * (d.phase === 0 ? 0.35 + 0.65 * d.grow : 1);
        if (d.phase === 0) {
          // a pendant drop, still joined to the glass by a neck that thins as it fills
          const nw = r * (1 - d.grow * 0.75) + 0.6;
          ctx.beginPath();
          ctx.moveTo(d.x - r * 0.9, surf - 0.5);
          ctx.quadraticCurveTo(d.x - nw, surf + (d.y - surf) * 0.5, d.x - r, d.y);
          ctx.arc(d.x, d.y, r, Math.PI, 0, true);
          ctx.quadraticCurveTo(d.x + nw, surf + (d.y - surf) * 0.5, d.x + r * 0.9, surf - 0.5);
          ctx.closePath();
        } else {
          // falling: a sphere stretched a touch by its speed, pointed at the top
          const stretch = 1 + Math.min(0.9, d.vy / 420);
          ctx.beginPath();
          ctx.moveTo(d.x, d.y - r * stretch * 1.25);
          ctx.quadraticCurveTo(d.x + r * 1.05, d.y - r * 0.2, d.x + r, d.y + r * 0.1);
          ctx.arc(d.x, d.y + r * 0.1, r, 0, Math.PI);
          ctx.quadraticCurveTo(d.x - r * 1.05, d.y - r * 0.2, d.x, d.y - r * stretch * 1.25);
          ctx.closePath();
        }
        const g = ctx.createRadialGradient(d.x - r * 0.35, d.y - r * 0.2, 0, d.x, d.y, r * 1.5);
        g.addColorStop(0, "rgba(255,255,255,0.95)");
        g.addColorStop(0.25, col);
        g.addColorStop(0.8, col);
        g.addColorStop(1, rgba(col, 0.7));
        ctx.fillStyle = g;
        ctx.fill();
        ctx.strokeStyle = "rgba(10,20,60,0.22)";
        ctx.lineWidth = 0.6;
        ctx.stroke();
        // light focused through the drop, on its lower side
        ctx.fillStyle = "rgba(255,255,255,0.55)";
        ctx.beginPath();
        ctx.ellipse(d.x + r * 0.25, d.y + r * 0.5, r * 0.35, r * 0.2, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      }
      // the crown of a splash: beads thrown up that fall back
      for (let k = beads.length - 1; k >= 0; k--) {
        const b = beads[k];
        b.vy += 480 * dt;
        b.x += b.vx * dt;
        b.y += b.vy * dt;
        b.life += dt;
        if (b.y > floor || b.life > 0.8) {
          beads.splice(k, 1);
          continue;
        }
        const dim = fo != null && fo !== b.stage ? 0.25 : 1;
        ctx.globalAlpha = dim * (1 - b.life / 0.8);
        ctx.fillStyle = st[b.stage]?.color ?? "#999";
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
        ctx.fill();
      }
      // ripples spreading where they land
      for (let k = rings.length - 1; k >= 0; k--) {
        const g = rings[k];
        g.t += dt * 1.8;
        if (g.t >= 1) {
          rings.splice(k, 1);
          continue;
        }
        const dim = fo != null && fo !== g.stage ? 0.25 : 1;
        const col = st[g.stage]?.color ?? "#999";
        for (const [lag, a] of [
          [0, 0.6],
          [0.25, 0.35],
        ] as const) {
          const u = Math.max(0, g.t - lag);
          if (u <= 0) continue;
          ctx.globalAlpha = (1 - u) * a * dim;
          ctx.strokeStyle = col;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.ellipse(g.x, floor, g.s + u * 14, (g.s + u * 14) * 0.2, 0, 0, Math.PI * 2);
          ctx.stroke();
        }
      }
      ctx.globalAlpha = 1;
      // the floor: a hairline, brighter where the light falls
      const fl = ctx.createLinearGradient(0, 0, W, 0);
      fl.addColorStop(0, "rgba(0,0,0,0)");
      fl.addColorStop(0.2, "rgba(20,30,70,.1)");
      fl.addColorStop(0.8, "rgba(20,30,70,.1)");
      fl.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = fl;
      ctx.fillRect(0, floor + 1, W, 1);
      void stageAt;
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [inView, reduce]);

  // ------------------------------------------------------------ pointing
  const pick = (clientX: number) => {
    const r = boxRef.current?.getBoundingClientRect();
    if (!r) return;
    const i = Math.max(0, Math.min(n - 1, Math.floor(((clientX - r.left) / r.width) * n)));
    setFocus((f) => {
      if (f !== i) sfx.tick({ freq: 1800 + i * 300, gain: 0.03 });
      return i;
    });
  };
  const choosePeriod = (i: number) => {
    if (i === period) return;
    setPeriod(i);
    sfx.whoosh(400, 1200, { dur: 0.4, gain: 0.04 });
    sfx.note(523 + i * 110, { dur: 0.35, gain: 0.04, at: 0.1, bell: 0.5 });
  };

  // ------------------------------------------------------------ autoplay
  const ap = useRef({ setFocus, choosePeriod });
  ap.current = { setFocus, choosePeriod };
  useEffect(() => {
    if (!autoplay || !inView || reduce) return;
    let alive = true;
    const ok = () => alive && !touched.current;
    const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
    (async () => {
      while (ok()) {
        await sleep(2400);
        for (let i = 0; i < n && ok(); i++) {
          ap.current.setFocus(i);
          await sleep(1100);
        }
        if (!ok()) break;
        ap.current.setFocus(null);
        await sleep(800);
        if (!ok()) break;
        ap.current.choosePeriod(1);
        await sleep(2400);
        if (!ok()) break;
        ap.current.choosePeriod(2);
        await sleep(2400);
        if (!ok()) break;
        ap.current.choosePeriod(0);
      }
    })();
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoplay, inView, reduce]);

  const top = values[0];
  const head =
    focus == null
      ? {
          label: periods[period].label,
          value: top,
          note: periods[period].delta,
        }
      : { label: stages[focus].label, value: values[focus], note: null };
  const lostAt = focus != null && focus < n - 1 ? values[focus] - values[focus + 1] : null;

  return (
    <div
      ref={rootRef}
      onPointerDownCapture={() => (touched.current = true)}
      onKeyDownCapture={() => (touched.current = true)}
      onPointerEnter={(e) => e.pointerType === "mouse" && (touched.current = true)}
      className={`relative w-full max-w-[720px] overflow-hidden rounded-[28px] bg-white text-[#1d1d1f] shadow-[0_0_0_1px_rgba(0,0,0,.05),0_24px_48px_-28px_rgba(0,0,0,.35)] ${narrow ? "p-4" : "p-6"} ${className}`}
      style={{
        fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Inter, system-ui, sans-serif",
      }}
    >
      <header className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[13px] text-[#6e6e73]">{title}</p>
          <div className="mt-1 flex items-baseline gap-2.5">
            <span className="text-[34px] font-semibold leading-none tracking-[-0.035em] tabular-nums">
              <Count n={head.value} reduce={reduce} />
            </span>
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={focus == null ? `p${period}` : `s${focus}`}
                className="flex items-center gap-1.5 whitespace-nowrap"
                initial={reduce ? false : { opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.12 }}
              >
                {head.note != null ? (
                  <span
                    className={`rounded-full px-2 py-[2px] text-[12px] font-semibold tabular-nums ${head.note >= 0 ? "bg-[#30d158]/15 text-[#1f7a35]" : "bg-[#ff3b30]/10 text-[#c4161c]"}`}
                  >
                    {head.note >= 0 ? "+" : ""}
                    {head.note.toFixed(1)}%
                  </span>
                ) : (
                  <span className="text-[13px] text-[#6e6e73]">
                    <span className="font-medium" style={{ color: stages[focus!].color }}>
                      {stages[focus!].label}
                    </span>
                    , {pct(values[focus!] / top)} of everyone
                  </span>
                )}
              </motion.span>
            </AnimatePresence>
          </div>
        </div>
        <div role="radiogroup" aria-label="Period" className="relative flex shrink-0 rounded-full bg-[#f2f2f4] p-[3px]">
          {periods.map((p, i) => (
            <button
              key={p.label}
              role="radio"
              aria-checked={i === period}
              onClick={() => choosePeriod(i)}
              className={`relative z-0 rounded-full px-2.5 py-[5px] text-[12.5px] font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-[#0071e3]/60 ${i === period ? "text-[#1d1d1f]" : "text-[#6e6e73] hover:text-[#1d1d1f]"}`}
            >
              {i === period && (
                <motion.span
                  layoutId={`${uid}-p`}
                  className="absolute inset-0 -z-10 rounded-full bg-white shadow-[0_1px_2px_rgba(0,0,0,.12),0_3px_8px_-2px_rgba(0,0,0,.12)]"
                  transition={{ type: "spring", stiffness: 520, damping: 38 }}
                />
              )}
              {narrow ? p.label.replace(" days", "d") : p.label}
            </button>
          ))}
        </div>
      </header>

      <div
        ref={boxRef}
        className="relative mt-4"
        style={{ height: H }}
        onPointerMove={(e) => pick(e.clientX)}
        onPointerLeave={(e) => e.pointerType === "mouse" && setFocus(null)}
        role="img"
        aria-label={stages.map((s, i) => `${s.label} ${values[i]}`).join(", ")}
      >
        <canvas ref={cvRef} aria-hidden="true" className="absolute inset-0 h-full w-full" />
        {/* the share of everyone still here, in the middle of each stage */}
        {stages.map((s, i) => (
          <motion.span
            key={s.label}
            className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/90 px-2 py-[2px] text-[11.5px] font-semibold tabular-nums text-[#1d1d1f] shadow-[0_1px_3px_rgba(0,0,0,.15)] backdrop-blur"
            style={{
              left: `${((i + (i === 0 ? 0.5 : 0.58)) / n) * 100}%`,
              top: H * 0.4,
            }}
            initial={reduce ? false : { opacity: 0, scale: 0.8 }}
            animate={{
              opacity: seen ? (focus == null || focus === i ? 1 : 0.35) : 0,
              scale: 1,
            }}
            transition={{
              delay: reduce ? 0 : seen && focus == null ? 0.4 + i * 0.25 : 0,
              duration: 0.3,
            }}
          >
            <Count n={Math.round((values[i] / top) * 100)} reduce={reduce} suffix="%" />
          </motion.span>
        ))}
        {/* what was lost at the focused stage, where its drops land */}
        <AnimatePresence>
          {lostAt != null && (
            <motion.span
              key={`l${focus}`}
              className="pointer-events-none absolute bottom-[14px] -translate-x-1/2 whitespace-nowrap rounded-full px-2 py-[2px] text-[11.5px] font-medium tabular-nums"
              style={{
                left: `${((focus! + 1.15) / n) * 100}%`,
                color: stages[focus!].color,
                background: rgba(stages[focus!].color, 0.1),
              }}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              transition={{ duration: 0.2 }}
            >
              {lostAt.toLocaleString("en-US")} left here
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      <div className={`mt-3 grid gap-2 ${narrow ? "grid-cols-2" : "grid-cols-4"}`}>
        {stages.map((s, i) => {
          const on = focus === i;
          return (
            <button
              key={s.label}
              type="button"
              onFocus={() => setFocus(i)}
              onBlur={() => setFocus(null)}
              onPointerEnter={(e) => e.pointerType === "mouse" && setFocus(i)}
              onPointerLeave={(e) => e.pointerType === "mouse" && setFocus(null)}
              onClick={() => setFocus((f) => (f === i ? null : i))}
              aria-pressed={on}
              aria-label={`${s.label}: ${values[i]}, ${pct(values[i] / top)}`}
              className="relative rounded-[14px] px-3 py-2.5 text-left outline-none transition-opacity focus-visible:ring-2 focus-visible:ring-[#0071e3]/60"
              style={{ opacity: focus == null || on ? 1 : 0.5 }}
            >
              <span className="absolute inset-0 rounded-[14px] bg-[#f5f5f7]" />
              {on && (
                <motion.span
                  layoutId={`${uid}-tile`}
                  className="absolute inset-0 rounded-[14px] bg-white"
                  style={{
                    boxShadow: `0 0 0 1.5px ${rgba(s.color, 0.5)}, 0 8px 18px -10px ${rgba(s.color, 0.7)}`,
                  }}
                  transition={{ type: "spring", stiffness: 480, damping: 36 }}
                />
              )}
              <span className="relative flex items-center gap-1.5 text-[12px] text-[#6e6e73]">
                <span className="h-2 w-2 rounded-[3px]" style={{ background: s.color }} />
                {s.label}
              </span>
              <span className="relative mt-0.5 block text-[17px] font-semibold tabular-nums tracking-[-0.02em]">
                <Count n={values[i]} reduce={reduce} />
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Count({ n, reduce, suffix = "" }: { n: number; reduce: boolean; suffix?: string }) {
  const [shown, setShown] = useState(n);
  const from = useRef(n);
  useEffect(() => {
    if (reduce) {
      setShown(n);
      from.current = n;
      return;
    }
    const a = animate(from.current, n, {
      duration: 0.8,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => setShown(Math.round(v)),
    });
    from.current = n;
    return () => a.stop();
  }, [n, reduce]);
  return (
    <>
      {shown.toLocaleString("en-US")}
      {suffix}
    </>
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
